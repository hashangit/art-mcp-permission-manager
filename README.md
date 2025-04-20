# CORS Unblock

## Introduction

CORS Unblock is a browser extension that provides additional capabilities for Web applications. Compared to Native applications, one of the most lacking features of modern Web applications is the ability to make cross-domain requests. CORS Unblock addresses this by rewriting the Response Header in the browser, enabling Web applications to access cross-domain resources.

## Installation

- [Chrome Web Store](https://chromewebstore.google.com/detail/odkadbffomicljkjfepnggiibcjmkogc)
<!-- - [Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/cors-unblock/)
- [Edge Add-ons](https://microsoftedge.microsoft.com/addons/detail/cors-unblock/hjgjgjgjgjgjgjgjgjgjgjgjgjgjgjgj)
- [Safari Web Extensions](https://developer.apple.com/safari/extensions/) -->

## Usage

As a user, you don't need to do anything. If a Web application needs to use the capabilities of CORS Unblock, it will automatically prompt you to install or request specific permissions. CORS Unblock adopts a design principle of clear permissions and on-demand authorization, ensuring that you have full control over cross-domain requests in the browser.

### Main Features

- **Precise domain name permission control**: Only allow specific websites to access external APIs you have approved
- **Simple permission management**: A clear user interface for managing authorized domains and permissions
- **Security-first**: Does not collect user data, all operations are completed within the local browser
- **Lightweight design**: Minimize the impact on browsing performance
- **Developer-friendly**: Provide simple APIs, developers can easily integrate

## Development

Integrating CORS Unblock into your Web application is very simple. First, install our core library:

```bash
pnpm i cors-unblock
```

Then use it in your code:

```ts
import { hasInstall, install, getAllowedInfo, requestHosts } from 'cors-unblock'

async function main() {
  if (!hasInstall()) {
    alert('Please install CORS Unblock plugin')
    install()
    return
  }
  const allowedInfo = await getAllowedInfo()
  if (allowedInfo.enabled) {
    return
  }
  const result = await requestHosts({
    hosts: ['example.com'],
  })
  if (result !== 'accept') {
    alert('Please allow CORS Unblock plugin to access example.com')
    return
  }
  alert('Request permission success')
  // Use CORS Unblock's ability
}
```

Once the user grants permission, your application can seamlessly perform cross-domain requests without setting up complex proxy servers or CORS configurations.

Example: <https://web-content-extractor.rxliuli.com/>

## Privacy and Security

CORS Unblock highly values user privacy and security. The plugin does not collect any user data and all operations are completed within the local browser. The permission system ensures that only websites that users have explicitly approved can use the extension's cross-domain capabilities, and these permissions can be revoked at any time.
