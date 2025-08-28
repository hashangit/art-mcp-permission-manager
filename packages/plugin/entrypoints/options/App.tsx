import { useAsync, useMutation } from '@/lib'
import { createMemo, createSignal } from 'solid-js'
import { Rule } from '@/lib/db'
import { dbApi } from '@/lib/db'
import { deleteByOrigin } from '@/lib/rules'

export function App() {
  const [search, setSearch] = createSignal('')
  const query = useAsync<Rule[]>({
    queryFn: async () => {
      return await dbApi.meta.getAll()
    },
  })

  const filteredRules = createMemo(() => {
    const rules = query.value() ?? []
    const searchText = search().toLowerCase()
    if (!searchText) return rules
    return rules.filter((rule) => {
      const host = new URL(rule.origin).host.toLowerCase()
      return (
        host.includes(searchText) ||
        (rule.hosts?.some((host) => host.toLowerCase().includes(searchText)) ??
          false)
      )
    })
  })

  const deleteMutation = useMutation<void, [Rule]>({
    mutationFn: async (rule: Rule) => {
      await deleteByOrigin(rule.origin)
      await query.refetch()
    },
  })

  return (
    <div class="p-4">
      <div class="mb-4">
        <h1 class="text-xl font-bold text-gray-800 dark:text-gray-100">
          ART MCP Permission Manager Rules
        </h1>
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Manage your cross-origin permissions
        </p>
      </div>

      <div class="mb-4">
        <input
          type="text"
          placeholder="Search by domain..."
          class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          value={search()}
          onInput={(e) => setSearch(e.currentTarget.value)}
        />
      </div>

      <div class="space-y-4">
        {filteredRules()?.map((rule: Rule) => (
          <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div>
              <p class="text-sm font-medium text-gray-700 dark:text-gray-200">
                {new URL(rule.origin).host}
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                {rule.hosts
                  ? `Allowed domains: ${rule.hosts.join(', ')}`
                  : 'All domains allowed'}
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                Added: {new Date(rule.createdAt).toLocaleString()}
              </p>
            </div>
            <button
              class="px-3 py-1 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
              onClick={() => deleteMutation.mutate(rule)}
            >
              Delete
            </button>
          </div>
        ))}

        {filteredRules()?.length === 0 && (
          <div class="text-center py-8">
            <p class="text-gray-500 dark:text-gray-400">
              {query.value()?.length === 0
                ? 'No rules configured yet'
                : 'No rules match your search'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
