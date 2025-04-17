import { createEffect } from 'solid-js'

export function useInterval(fn: () => void, interval: number) {
  createEffect(() => {
    const id = setInterval(fn, interval)
    return () => clearInterval(id)
  })
}
