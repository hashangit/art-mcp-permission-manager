import { dbApi, Rule } from './db'

export async function findRule(origin: string): Promise<
  | (Browser.declarativeNetRequest.Rule & {
      meta: Rule
    })
  | undefined
> {
  const meta = await dbApi.meta.getByOrigin(origin)
  if (!meta) {
    return
  }
  const host = new URL(origin).hostname
  const rules = await browser.declarativeNetRequest.getSessionRules()
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

export async function deleteByOrigin(origin: string) {
  const rule = await findRule(origin)
  if (!rule) {
    return
  }
  await browser.declarativeNetRequest.updateSessionRules({
    removeRuleIds: [rule.id],
  })
  await dbApi.meta.delete(rule.meta.id)
}
