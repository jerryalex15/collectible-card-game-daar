import global_styles '@/styles/styles.module.css'
import navbar_styles '@/styles/pages/HomePage.css'


interface HomePageProps {
    route: {
        params: {
            wallet: any;
        };
    };
}

const HomePage: React.FC<HomePageProps> = ({ route }) => {
    const { wallet } = route.params;
    return (
        <div className={global_styles.body}>
            <h1>Welcome to Pokémon TCG</h1>
            <p>Wallet : {wallet ? wallet.details.account : 'Non connecté'}</p>
        </div>
    )
}

export default HomePage;
