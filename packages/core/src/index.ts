import { internalMessaging } from './internal'

export function getAllowedInfo() {
  return internalMessaging.sendMessage('getAllowedInfo', undefined)
}

export function requestHosts(data: { hosts: string[] }) {
  return internalMessaging.sendMessage('requestHosts', data)
}

export function hasInstall() {
  return (
    document.documentElement.dataset.artMcpPermissionManager ||
    // Backward compat with older content scripts during transition
    document.documentElement.dataset.corsUnblock
  )
}

const CWS_URL =
  'https://chromewebstore.google.com/detail/cors-unblock/odkadbffomicljkjfepnggiibcjmkogc'
const AMO_URL =
  'https://addons.mozilla.org/zh-CN/firefox/addon/cors-unblock2/'

function detectBrowser(): 'chrome' | 'firefox' | 'other' {
  const ua = navigator.userAgent.toLowerCase()
  if (ua.includes('firefox')) return 'firefox'
  // Treat all non-Firefox as Chrome-compatible for CWS link purposes
  return 'chrome'
}

export function getInstallUrl(options?: {
  browser?: 'auto' | 'chrome' | 'firefox'
  urlOverride?: string
}): string {
  if (options?.urlOverride) return options.urlOverride
  const target = options?.browser === 'auto' || !options?.browser
    ? detectBrowser()
    : options.browser
  if (target === 'firefox') return AMO_URL
  return CWS_URL
}

export function install(options?: {
  browser?: 'auto' | 'chrome' | 'firefox'
  urlOverride?: string
}): boolean {
  const url = getInstallUrl(options)
  const win = window.open(url, '_blank', 'noopener,noreferrer')
  return !!win
}
