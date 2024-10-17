import global_styles from '@/styles/styles.module.css'
import navbar_styles from '@/styles/components/layout/NavBar.css'
import { useWallet } from '@/context/AuthContext';

const NavBar = () => {
    
    return (
        <nav>
            <h2>Adresse : { useWallet()?.details?.account }</h2>
            <ul>
                <li><a href="#accueil">Accueil</a></li>
                <li><a href="#collection">Ma Collection</a></li>
                <li><a href="#transactions">Transactions</a></li>
                <li><a href="#marketplace">Marketplace</a></li>
                <li><a href="#profil">Mon Profil</a></li>
            </ul>
        </nav>
    )
}

export default NavBar;