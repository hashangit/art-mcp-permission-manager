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

  return <>{router.path() === '/' ? <Home /> : <Confirm />}</>
}

export default App
