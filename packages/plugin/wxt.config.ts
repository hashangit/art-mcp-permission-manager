import { defineConfig, UserManifest } from 'wxt'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  modules: ['@wxt-dev/module-solid'],
  manifestVersion: 3,
  zip: {
    name: 'cors-unblock',
  },
  manifest: {
    name: 'CORS Unblock',
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
  },
  webExt: {
    disabled: true,
  },
  vite: () => ({
    plugins: [tailwindcss()],
    // build: {
    //   minify: false,
    //   sourcemap: 'inline',
    // },
  }),
})
