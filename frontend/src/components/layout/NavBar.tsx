import global_styles from '../../styles/styles.module.css'
import navbar_styles from '../../styles/components/layout/NavBar.css'

interface NavBarProps {
    route: {
        params: {
            wallet: any;
        };
    };
}

const NavBar : React.FC<NavBarProps> = ({ route }) => {
    return (
        <nav>
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