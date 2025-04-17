import { useAsync, useMutation } from '@/lib'
import { messaging } from '@/lib/messaging'
import { createMemo } from 'solid-js'

export function Home() {
  const query = useAsync({
    queryFn: async () => {
      const [tab] = await browser.tabs.query({
        active: true,
        currentWindow: true,
      })
      if (!tab.url) {
        throw new Error('No active tab')
      }
      const allowed = await messaging.sendMessage('getAllowedInfo', {
        origin: new URL(tab.url).origin,
      })
      console.log('[popup] allowed', allowed)
      if (!allowed?.enabled) {
        return {
          enabled: false,
          origin: new URL(tab.url).host,
        }
      }
      return {
        enabled: allowed.enabled,
        type: allowed.type,
        hosts: allowed.hosts,
        origin: new URL(tab.url).host,
      }
    },
  })

  const enabled = createMemo(() => query.value()?.enabled)
  const type = createMemo(() => query.value()?.type)

  const enableMutation = useMutation({
    mutationFn: async () => {
      const [tab] = await browser.tabs.query({
        active: true,
        currentWindow: true,
      })
      if (!tab.url) {
        throw new Error('No active tab')
      }
      console.log('[popup] requestAllHosts', new URL(tab.url).origin)
      const r = await messaging.sendMessage('requestAllHosts', {
        origin: new URL(tab.url).origin,
      })
      console.log('[popup] requestAllHosts done', r)
      await query.refetch()
    },
  })

  const disableMutation = useMutation({
    mutationFn: async () => {
      const [tab] = await browser.tabs.query({
        active: true,
        currentWindow: true,
      })
      if (!tab.url) {
        return
      }
      await messaging.sendMessage('delete', {
        origin: new URL(tab.url).origin,
      })
      await query.refetch()
    },
  })

  return (
    <div class="w-[400px] p-4 bg-white dark:bg-gray-800">
      <div class="mb-4">
        <h1 class="text-xl font-bold text-gray-800 dark:text-gray-100">
          CORS Unblock
        </h1>
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Manage cross-origin permissions
        </p>
      </div>

      <div class="mb-6">
        <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div>
            <p class="text-sm font-medium text-gray-700 dark:text-gray-200">
              Current Website
            </p>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              {query.value()?.origin}
            </p>
          </div>
          <div class="flex items-center space-x-2">
            {enabled() ? (
              <span class="px-2 py-1 text-xs font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 rounded-full">
                {type() === 'all' ? 'All Domains' : 'Enabled'}
              </span>
            ) : (
              <span class="px-2 py-1 text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 rounded-full">
                Disabled
              </span>
            )}
          </div>
        </div>
      </div>

      {enabled() && type() !== 'all' && (
        <div class="space-y-2">
          <p class="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
            Allowed Domains
          </p>
          {query.value()?.hosts?.map((host) => (
            <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <p class="text-sm font-medium text-gray-700 dark:text-gray-200">
                  {host}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {enabled() && type() === 'all' && (
        <div class="p-3 bg-green-50 dark:bg-green-900/30 rounded-lg">
          <p class="text-sm font-medium text-green-700 dark:text-green-400">
            This website can request resources from any domain
          </p>
        </div>
      )}

      {!enabled() ? (
        <div class="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            class="w-full px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors"
            onclick={enableMutation.mutate}
          >
            Enable Cross-Origin
          </button>
        </div>
      ) : (
        <div class="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            class="w-full px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
            onclick={disableMutation.mutate}
          >
            Disable Cross-Origin
          </button>
        </div>
      )}
    </div>
  )
}
