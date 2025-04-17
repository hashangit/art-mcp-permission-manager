import { createStore } from 'solid-js/store'

export const [state, setState] = createStore({
  path: '/',
})

export function useRouter() {
  return {
    path: () => state.path,
    push: (path: string) => {
      setState({ path })
    },
  }
}
