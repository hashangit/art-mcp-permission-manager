import { defineConfig, UserManifest } from 'wxt'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  modules: ['@wxt-dev/module-solid'],
  manifestVersion: 3,
  zip: {
    name: 'art-mcp-permission-manager',
  },
  manifest: (env) => {
    const manifest: UserManifest = {
      name: 'ART MCP Permission Manager',
      description:
        'Web apps cross-origin access with precise domain control and simple permissions.',
      permissions: ['storage', 'tabs', 'declarativeNetRequest'],
      host_permissions: ['https://*/*', 'http://*/*'],
      web_accessible_resources: [
        {
          resources: ['inject.js'],
          matches: ['<all_urls>'],
        },
      ],
    }
    if (env.browser === 'firefox') {
      manifest.browser_specific_settings = {
        gecko: {
          id: 'art-mcp-permission-manager@rxliuli.com',
        },
      }
    }
    return manifest
  },
  webExt: {
    disabled: true,
  },
  vite: () => ({
    plugins: [tailwindcss()],
    build: {
      minify: false,
      sourcemap: 'inline',
    },
  }),
})
