export interface ConfirmState {
  origin: string
  hosts: string[]
}

const PopupStoreKey = 'popupParams'
export const popupStore = {
  setParams: async (params: { origin: string; hosts: string[] }) => {
    await browser.storage.session.set({
      [PopupStoreKey]: {
        origin: params.origin,
        hosts: params.hosts,
      },
    })
  },
  getParams: async () => {
    return (
      await browser.storage.session.get<{
        [PopupStoreKey]: ConfirmState
      }>(PopupStoreKey)
    )[PopupStoreKey]
  },
  removeParams: async () => {
    await browser.storage.session.remove(PopupStoreKey)
  },
}
