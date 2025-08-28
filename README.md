# ART MCP Permission Manager (CORS Unblock fork)

[Chrome Web Store](https://chromewebstore.google.com/detail/odkadbffomicljkjfepnggiibcjmkogc) · [Firefox Add-ons](https://addons.mozilla.org/zh-CN/firefox/addon/cors-unblock2/) · [Safari Web Extensions](https://apps.apple.com/cn/app/cors-unblock/id6744779652)

## Introduction

This repository is a fork of CORS Unblock tailored for ART, an Agentic AI application development framework for building client‑side, browser‑only AI agent apps. The extension becomes ART’s built‑in MCP server permission manager: it grants or revokes cross‑origin permissions for MCP server domains, letting end users control which MCP servers an ART app may access.

## What it provides

- **Managed CORS permissions for MCP servers**: Per‑origin, per‑domain rules
- **Simple integration**: Exposed via the ART framework, no manual wiring for app developers
- **User control**: Clear prompts and easy management from the extension popup

## Developer experience (via ART)

ART integrates this module internally. If your ART app enables MCP support, ART uses the core SDK to:

- Detect whether the extension is installed
- Prompt users to install the extension (opens the store in a new tab)
- Request specific MCP server host permissions on demand

You generally do not import this library directly in ART apps; the framework handles it.

## Core SDK usage (for non‑ART adopters)

```ts
import { hasInstall, install, getAllowedInfo, requestHosts, getInstallUrl } from 'art-mcp-permissions-manager'

async function ensurePermission() {
  if (!hasInstall()) {
    // Opens store link in a new tab without leaving the current app tab
    const opened = install({ browser: 'auto' })
    if (!opened) {
      // Popup blocked – show a fallback link
      const url = getInstallUrl()
      console.log('Open this link manually:', url)
    }
    return
  }
  const allowed = await getAllowedInfo()
  if (allowed.enabled) return
  const result = await requestHosts({ hosts: ['mcp.example.com'] })
  if (result !== 'accept') return
}
```

## Notes

- Permissions are scoped to the requesting website’s origin.
- Users can enable “all domains” for an origin or restrict to specific MCP server hosts.
- No user data is collected; all operations run locally in the browser.
