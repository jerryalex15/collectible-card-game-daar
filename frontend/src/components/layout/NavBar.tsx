import global_styles from '@/styles/styles.module.css';
import navbar_styles from '@/styles/components/layout/NavBar.module.css';
import { useWallet } from '@/context/AuthContext';

const NavBar = () => {
    const wallet = useWallet();

    return (
        <header className={`${navbar_styles.navbar} ${global_styles.container}`}>
            <nav className={navbar_styles.nav}>
                <div className={navbar_styles.brand}>
                    <h2>Adresse : { wallet?.details?.account || 'Non connecté' }</h2>
                </div>
                <ul className={navbar_styles.navLinks}>
                    <li><a href="#accueil" className={navbar_styles.navLink}>Home</a></li>
                    <li><a href="#collection" className={navbar_styles.navLink}>My Collection</a></li>
                    <li><a href="#marketplace" className={navbar_styles.navLink}>Marketplace</a></li>
                    <li><a href="#profil" className={navbar_styles.navLink}>Profile</a></li>
                </ul>
            </nav>
        </header>
    );
};

export default NavBar;
