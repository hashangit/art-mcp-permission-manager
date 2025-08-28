import { messaging } from '@/lib/messaging'
import { internalMessaging } from 'art-mcp-permission-manager/internal'
import { isMobile } from 'is-mobile'

export default defineContentScript({
  matches: ['<all_urls>'],
  runAt: 'document_start',
  async main() {
    document.documentElement.dataset.artMcpPermissionManager = 'true'
    document.documentElement.dataset.corsUnblock = 'true'

    internalMessaging.onMessage('getAllowedInfo', () =>
      messaging.sendMessage('getAllowedInfo', {
        origin: location.origin,
      }),
    )
    let _resolve: (action: 'accept' | 'reject') => void
    internalMessaging.onMessage('requestHosts', async (ev) => {
      if (
        // TODO: https://bugzilla.mozilla.org/show_bug.cgi?id=1864284
        import.meta.env.FIREFOX ||
        isMobile({ tablet: true })
      ) {
        const result = confirm(
          `Allow cross-origin requests to the following domains: ${ev.data.hosts.join(
            ', ',
          )}?`,
        )
        if (result) {
          await messaging.sendMessage('acceptRequestHosts', {
            origin: location.origin,
            hosts: ev.data.hosts,
          })
        }
        return result ? 'accept' : 'reject'
      }
      await messaging.sendMessage('requestHosts', {
        origin: location.origin,
        hosts: ev.data.hosts,
      })
      return new Promise<'accept' | 'reject'>((resolve) => {
        _resolve = resolve
      })
    })
    messaging.onMessage('accept', () => {
      _resolve?.('accept')
    })
    messaging.onMessage('reject', () => {
      _resolve?.('reject')
    })
    // safari debug only
    messaging.onMessage('log', (ev) => {
      console.log(ev.data)
    })
    // setInterval(async () => {
    //   const res = await messaging.sendMessage('ping', undefined)
    //   console.log('[content] ping', res)
    // }, 1000)

    if (import.meta.env.SAFARI) {
      internalMessaging.onMessage('request', async (ev) =>
        messaging.sendMessage('request', {
          ...ev.data,
          origin: location.origin,
        }),
      )
      await injectScript('/inject.js')
    }
  },
})
