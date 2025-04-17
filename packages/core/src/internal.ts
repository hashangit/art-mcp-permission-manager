import { defineWindowMessaging } from '@webext-core/messaging/page'

interface WebsiteToExtension {
  requestHosts: (data: { hosts: string[] }) => 'accept' | 'reject'
  getAllowedInfo: () => {
    enabled: boolean
    type: 'all' | 'specific'
    hosts?: string[]
  }

  request: (req: any) => any
}

export const internalMessaging = defineWindowMessaging<WebsiteToExtension>({
  namespace: 'cors-unblock',
})
