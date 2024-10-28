import { useEffect, useState } from 'react';
import global_styles from '@/styles.module.css';
import page_styles from './BoosterPage.module.css';
import BoosterList from '@/components/boosters/BoosterList';
import useApiMethods from '@/context/useApiMethods';

export const BoosterPage = () => {
  const {
    fetchBoosters,
    loading,
    error,
    boosters,
    handleCreateBooster,
    handleAcquireBooster,
    handleUnpackBooster,
  } = useApiMethods();
  
  const [ownedBoosters, setOwnedBoosters] = useState([]);
  const [boosterName, setBoosterName] = useState('');
  const [boosterCardCount, setBoosterCardCount] = useState(0);
  const [boosterResponseMessage, setBoosterResponseMessage] = useState('');

  useEffect(() => {
    const loadInitialData = async () => {
      await fetchBoosters();
    };

    loadInitialData();
  }, []);

  useEffect(() => {
    setOwnedBoosters(boosters);
  }, [boosters]);

  // Fonction pour gérer la création du booster
  const handleCreateBoosterSubmit = async (e:any) => {
    e.preventDefault(); // Empêche le rechargement de la page
    await handleCreateBooster(boosterName, boosterCardCount);
    setBoosterName(''); // Réinitialise le champ
    setBoosterCardCount(0); // Réinitialise le champ
    setBoosterResponseMessage('Booster created successfully!'); // Vous pouvez personnaliser ce message
  };

  const handleBuyAndOpenBooster = async (boosterId: number) => {
    try {
      await handleAcquireBooster(boosterId); // Acheter le booster
      await handleUnpackBooster(boosterId);   // Ouvrir le booster
      setBoosterResponseMessage('Booster acheté et ouvert avec succès !');
    } catch (error) {
      setBoosterResponseMessage("Erreur lors de l'achat et de l'ouverture du booster.");
    }
  };

  return (
    <div className={page_styles.BoosterPage}>
      <h1>Booster</h1>

      <section>
        <h2>Créer Booster</h2>
        <form onSubmit={handleCreateBoosterSubmit} className={page_styles.form}>
          <input
            type="text"
            value={boosterName}
            placeholder="Nom du booster"
            onChange={(e) => setBoosterName(e.target.value)}
            required
          />
          <input
            type="number"
            value={boosterCardCount}
            placeholder="Nombre de cartes"
            onChange={(e) => setBoosterCardCount(parseInt(e.target.value))}
            required
          />
          <button type="submit" className={page_styles.submitButton}>Créer Booster</button>
        </form>
        {boosterResponseMessage && <p className={page_styles.responseMessage}>{boosterResponseMessage}</p>}
      </section>

      <section>
        <br />
        <h2>Acheter des Boosters</h2>
        {loading ? (
          <p>Loading boosters on sale...</p>
        ) : (
          <BoosterList
            boosters={boosters.map((booster: any) => ({
              id: booster.id,
              name: booster.name,
              type: booster.type,
              action: () => handleBuyAndOpenBooster(booster.id),
              actionLabel: "Acheter",
            }))}
          />
        )}
      </section>

      {error && <p className={global_styles.error}>{error}</p>}
    </div>
  );
}

export default BoosterPage;


