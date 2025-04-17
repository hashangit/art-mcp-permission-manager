import { defineWindowMessaging as o } from "@webext-core/messaging/page";
const e = o({
  namespace: "cors-unblock"
});
function s() {
  return e.sendMessage("getAllowedInfo", void 0);
}
function c(n) {
  return e.sendMessage("requestHosts", n);
}
function i() {
  return document.documentElement.dataset.corsUnblock;
}
function l() {
  window.open(
    "https://chromewebstore.google.com/detail/odkadbffomicljkjfepnggiibcjmkogc",
    "_blank"
  );
}
export {
  s as getAllowedInfo,
  i as hasInstall,
  l as install,
  c as requestHosts
};
