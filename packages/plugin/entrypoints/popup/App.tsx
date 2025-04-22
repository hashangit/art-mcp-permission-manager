import { Confirm } from './Confirm'
import { Home } from './Home'
import { useRouter } from '../../lib/router'
import { onMount } from 'solid-js'
import { popupStore } from '@/lib/store'

function App() {
  const router = useRouter()
  onMount(async () => {
    const requestHosts = await popupStore.getParams()
    if (requestHosts) {
      router.push('/confirm')
    } else {
      router.push('/')
    }
  })

  return (
    <div class="w-full min-w-[400px] p-4 bg-white dark:bg-gray-800">
      {router.path() === '/' ? <Home /> : <Confirm />}
    </div>
  )
}

export default App
