import global_styles from '@/styles.module.css'
import comp_styles from './NavBar.module.css'
import { useWallet } from '@/context/AuthContext'

const NavBar = () => {
  const wallet = useWallet()

  return (
    <ul className={comp_styles.navbar}>
      <li className={comp_styles.logo}>
        <img src="src/assets/images/pokemon_logo.png" alt="Logo" />
      </li>
      <div className={comp_styles.right_nav}>
        <li className={comp_styles.account}>
          <h6>Account : {wallet?.details?.account || 'Non connecté'}</h6>
        </li>
        <li className={comp_styles.nav_item}>
          <a href="home">
            <img
              className={comp_styles.navbar_icon}
              src="src/assets/icons/home.png"
              alt="Home"
            />
            <span>Home</span>
          </a>
        </li>
        <li className={comp_styles.nav_item}>
          <a href="collection">
            <img
              className={comp_styles.navbar_icon}
              src="src/assets/icons/collection.png"
              alt="Collection"
            />
            <span>Collection</span>
          </a>
        </li>
        <li className={comp_styles.nav_item}>
          <a href="marketplace">
            <img
              className={comp_styles.navbar_icon}
              src="src/assets/icons/marketplace.png"
              alt="Marketplace"
            />
            <span>Marketplace</span>
          </a>
        </li>
        <li className={comp_styles.nav_item}>
          <a href="profile">
            <img
              className={comp_styles.navbar_icon}
              src="src/assets/icons/profile.png"
              alt="Profile"
            />
            <span>Profile</span>
          </a>
        </li>
      </div>
    </ul>
  )
}

export default NavBar
