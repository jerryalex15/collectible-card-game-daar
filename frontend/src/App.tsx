import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import styles from './styles.module.css';
import NavBar from './components/layout/NavBar';
import Footer from './components/layout/Footer';

import { HomePage } from './pages/HomePage';
import { CollectionPage } from './pages/CollectionPage';
import { MarketplacePage } from './pages/MarketplacePage';
import { ProfilePage } from './pages/ProfilePage';
import { useWallet } from './context/AuthContext';

const LoadingOverlay = () => {
  return (
    <div className={styles.loadingOverlay}>
      <div className={styles.loadingContent}>
        <p>Attente de connexion à Metamask...</p>
        <img src="src/assets/icons/loading.gif" alt="Chargement en cours..." className={styles.loadingGif} />
      </div>
    </div>
  );
};

export const App = () => {
  const wallet = useWallet();

  return (
    <Router>
      <div className={styles.app}>
        {wallet === null && <LoadingOverlay />}
        <NavBar />
        <div className={styles.container}>
          <Routes>
            <Route path="*" element={<HomePage />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/collection" element={<CollectionPage />} />
            <Route path="/marketplace" element={<MarketplacePage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
};
