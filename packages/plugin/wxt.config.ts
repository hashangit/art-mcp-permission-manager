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
      'Enable cross-origin requests for web applications with precise domain control and user-friendly permission management.',
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
