import styles from './styles/styles.module.css'
import NavBar from './components/layout/NavBar'
import { useWallet } from './context/AuthContext'



export const App = () => {
  const wallet = useWallet()
  return (
    <>
      <NavBar route={{params: { wallet }}} />

    </>
  )
}
