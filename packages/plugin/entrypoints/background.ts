import { dbApi, Rule } from '@/lib/db'
import { messaging } from '@/lib/messaging'
import { deserializeRequest, serializeResponse } from '@/lib/serialize'
import { popupStore } from '@/lib/store'
import { omit, uniq } from 'es-toolkit'
import { ulid } from 'ulidx'

async function getRuleId() {
  const { ruleId } = await browser.storage.local.get<{
    ruleId: number | undefined
  }>('ruleId')
  if (!ruleId) {
    await browser.storage.local.set({ ruleId: 1 })
    return 1
  }
  await browser.storage.local.set({ ruleId: ruleId + 1 })
  return ruleId + 1
}

type RuleActionType = Browser.declarativeNetRequest.RuleActionType
type HeaderOperation = Browser.declarativeNetRequest.HeaderOperation
type ResourceType = Browser.declarativeNetRequest.ResourceType
type EnumValues<T extends string> = `${T}`

function createRule(
  ruleId: number,
  origin: string,
  hosts?: string[],
): Browser.declarativeNetRequest.Rule {
  return {
    id: ruleId,
    action: {
      type: 'modifyHeaders' satisfies EnumValues<RuleActionType> as RuleActionType,
      responseHeaders: [
        {
          header: 'Access-Control-Allow-Origin',
          operation:
            'set' satisfies EnumValues<HeaderOperation> as HeaderOperation,
          value: origin,
        },
        {
          header: 'Access-Control-Allow-Methods',
          operation:
            'set' satisfies EnumValues<HeaderOperation> as HeaderOperation,
          value: 'GET, POST, OPTIONS, PUT, DELETE',
        },
        {
          header: 'Access-Control-Allow-Headers',
          operation:
            'set' satisfies EnumValues<HeaderOperation> as HeaderOperation,
          value: 'Content-Type',
        },
      ],
    },
    condition: hosts
      ? {
          initiatorDomains: [new URL(origin).hostname],
          requestDomains: hosts,
          resourceTypes: [
            'xmlhttprequest' satisfies EnumValues<ResourceType> as ResourceType,
          ],
        }
      : {
          initiatorDomains: [new URL(origin).hostname],
          urlFilter: '|https*',
          resourceTypes: [
            'xmlhttprequest' satisfies EnumValues<ResourceType> as ResourceType,
          ],
        },
  }
}

const findRule = async (
  origin: string,
): Promise<
  | (Browser.declarativeNetRequest.Rule & {
      meta: Rule
    })
  | undefined
> => {
  const meta = await dbApi.meta.getByOrigin(origin)
  if (!meta) {
    return
  }
  const host = new URL(origin).hostname
  const rules = await browser.declarativeNetRequest.getDynamicRules()
  const browserRule = rules.find(
    (rule) => rule.condition.initiatorDomains?.[0] === host,
  )
  if (!browserRule) {
    return
  }
  return {
    meta,
    ...browserRule,
  }
}

async function log(msg: string) {
  // const [tab] = await browser.tabs.query({
  //   active: true,
  //   currentWindow: true,
  // })
  // if (!tab) {
  //   return
  // }
  // messaging.sendMessage('log', '[background] ' + msg, { tabId: tab.id! })
}

export default defineBackground(() => {
  browser.runtime.onInstalled.addListener(async () => {
    const oldRules = await browser.declarativeNetRequest.getDynamicRules()
    await browser.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: oldRules.map((rule) => rule.id),
    })
    const rules = await dbApi.meta.getAll()
    let ruleId = 1
    try {
      await browser.declarativeNetRequest.updateDynamicRules({
        addRules: rules.map((rule) =>
          createRule(ruleId++, rule.origin, rule.hosts),
        ),
      })
    } finally {
      await browser.storage.local.set({ ruleId })
    }
  })

  messaging.onMessage('ping', async (ev) => {
    messaging.sendMessage('log', 'ping', ev.sender.tab.id)
    return 'pong'
  })
  messaging.onMessage('getAllowedInfo', async (ev) => {
    const rule = await findRule(ev.data.origin)
    if (!rule) {
      return {
        enabled: false,
        type: 'specific',
        hosts: [],
      }
    }
    return {
      enabled: true,
      type: rule.meta.hosts ? 'specific' : 'all',
      hosts: rule.meta.hosts,
    }
  })
  messaging.onMessage('requestAllHosts', async (ev) => {
    const rule = await findRule(ev.data.origin)
    if (rule) {
      console.error('Rule already exists')
      return
    }
    const ruleId = await getRuleId()
    const newRule = createRule(ruleId, ev.data.origin)
    await browser.declarativeNetRequest.updateDynamicRules({
      addRules: [newRule],
    })
    await dbApi.meta.add({
      id: ulid(),
      from: 'user',
      origin: ev.data.origin,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    setIcon(ev.data.origin)
  })
  messaging.onMessage('requestHosts', async (ev) => {
    await popupStore.setParams(ev.data)
    await browser.action.openPopup()
  })
  messaging.onMessage('acceptRequestHosts', async (ev) => {
    log('acceptRequestHosts')
    const rule = await findRule(ev.data.origin)
    try {
      if (rule) {
        rule.condition.requestDomains = uniq([
          ...(rule.meta.hosts ?? []),
          ...ev.data.hosts,
        ])
        await browser.declarativeNetRequest.updateDynamicRules({
          removeRuleIds: [rule.id],
          addRules: [omit(rule, ['meta'])],
        })
        await dbApi.meta.update({
          ...rule.meta,
          hosts: rule.condition.requestDomains,
          updatedAt: new Date().toISOString(),
        })
      } else {
        await browser.declarativeNetRequest.updateDynamicRules({
          addRules: [
            createRule(await getRuleId(), ev.data.origin, ev.data.hosts),
          ],
        })
        await dbApi.meta.add({
          id: ulid(),
          from: 'website',
          origin: ev.data.origin,
          hosts: ev.data.hosts,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
      }
    } catch (err) {
      console.error('acceptRequestHosts', err)
      throw err
    }
    log('acceptRequestHosts success')
    const [tab] = await browser.tabs.query({
      active: true,
      currentWindow: true,
    })
    log('acceptRequestHosts send accept')
    await messaging.sendMessage('accept', undefined, { tabId: tab.id! })
    log('acceptRequestHosts send accept success')
    setIcon(ev.data.origin)
  })
  messaging.onMessage('rejectRequestHosts', async (ev) => {
    setIcon(ev.data.origin)
    const [tab] = await browser.tabs.query({
      active: true,
      currentWindow: true,
    })
    await messaging.sendMessage('reject', undefined, { tabId: tab.id! })
  })
  // TODO https://stackoverflow.com/a/15801294/8409380
  // https://issues.chromium.org/issues/41069221
  browser.runtime.onConnect.addListener((port) => {
    port.onDisconnect.addListener(async () => {
      console.log('[background] popup disconnected')
      const [tab] = await browser.tabs.query({
        active: true,
        currentWindow: true,
      })
      await messaging.sendMessage('reject', undefined, { tabId: tab.id! })
    })
  })
  messaging.onMessage('delete', async (ev) => {
    const rule = await findRule(ev.data.origin)
    if (!rule) {
      return
    }
    await browser.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: [rule.id],
    })
    await dbApi.meta.delete(rule.meta.id)
    setIcon()
  })
  messaging.onMessage('request', async (ev) => {
    const rule = await findRule(ev.data.origin)
    if (
      !rule ||
      (rule.meta.from === 'website' &&
        !rule.meta.hosts?.includes(new URL(ev.data.url).hostname))
    ) {
      throw new Error('CORS unblocked')
    }
    const req = await deserializeRequest(ev.data)
    const resp = await fetch(req)
    return await serializeResponse(resp)
  })

  async function setIcon(url?: string) {
    if (!url) {
      await browser.action.setIcon({ path: '/icon/disabled.png' })
      return
    }
    const rule = await findRule(new URL(url).origin)
    await browser.action.setIcon({
      path: rule ? '/icon/enabled.png' : '/icon/disabled.png',
    })
  }
  browser.tabs.onActivated.addListener(async (tabInfo) => {
    const tab = await browser.tabs.get(tabInfo.tabId)
    setIcon(tab.url)
  })
  browser.tabs.onCreated.addListener(async (tab) => {
    setIcon(tab.url)
  })
  browser.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete') {
      setIcon(tab.url)
    }
  })
})
