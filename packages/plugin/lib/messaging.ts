import { defineExtensionMessaging } from '@webext-core/messaging'
import { SerializedRequest, SerializedResponse } from './serialize'
import { Rule } from './db'

export interface ContentScript2BackgroundMessage {
  getAllowedInfo(data: { origin: string }): {
    enabled: boolean
    type: 'all' | 'specific'
    hosts?: string[]
  }
  // website request hosts
  requestHosts(data: { origin: string; hosts: string[] }): void
  acceptRequestHosts(data: { origin: string; hosts: string[] }): void
  rejectRequestHosts(data: { origin: string; hosts: string[] }): void
  requestAllHosts(data: { origin: string }): void
  delete(data: { origin: string }): void
  getAllRules(): Rule[]

  // test
  ping(): string

  // safari only
  request(req: SerializedRequest & { origin: string }): SerializedResponse
}

export interface Background2ContentScriptMessage {
  accept(): void
  reject(): void

  log(msg: string): void
}

export const messaging = defineExtensionMessaging<
  ContentScript2BackgroundMessage & Background2ContentScriptMessage
>()
