import { useEffect, useState } from 'react';
import global_styles from '@/styles.module.css';
import page_styles from './ProfilePage.module.css';
import useApiMethods from '@/context/useApiMethods';
import Modal from 'react-modal'; 

interface Card {
  cardId: number;
  name: string;
  collectionId: number;
  img: string;
}

export const ProfilePage = () => {
  const { handleGetUserCards, ownedCards, loading, error, wallet, handleSetCardOnSale } = useApiMethods();
  const [cardsByCollection, setCardsByCollection] = useState<Record<number, Card[]>>({});
  
  // État pour gérer la modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [price, setPrice] = useState('');
  const [selectedCard, setSelectedCard] = useState<{ collectionId: number; cardId: number } | null>(null);

  // Effect pour charger les cartes de l'utilisateur en fonction du compte
  useEffect(() => {
    const loadUserCards = async () => {
      await handleGetUserCards(); // Appeler l'API pour récupérer les cartes
    };

    if (wallet?.details?.account) {
      loadUserCards();
    }
  }, [wallet?.details?.account]); // Dépendance sur le compte utilisateur

  // Effect pour regrouper les cartes par collection lorsque les cartes changent
  useEffect(() => {
    if (ownedCards.length > 0) {
      setCardsByCollection(groupCardsByCollection(ownedCards));
    }
  }, [ownedCards]);

  // Fonction pour regrouper les cartes par ID de collection
  const groupCardsByCollection = (cards: Card[]): Record<number, Card[]> => {
    return cards.reduce<Record<number, Card[]>>((acc, card) => {
      const collectionId = card.collectionId;
      if (!acc[collectionId]) {
        acc[collectionId] = [];
      }
      acc[collectionId].push(card);
      return acc;
    }, {});
  };

  // Ouvrir la modal pour mettre la carte en vente
  const openModal = (collectionId: number, cardId: number) => {
    console.log('Opening modal for collection:', collectionId, 'and card:', cardId); // Vérifiez que cette ligne s'affiche
    setSelectedCard({ collectionId, cardId });
    setIsModalOpen(true);
  };

  // Fermer la modal
  const closeModal = () => {
    setIsModalOpen(false);
    setPrice('');
    setSelectedCard(null);
  };

  // Gérer la soumission du prix
  const handlePriceSubmit = async () => {
    if (selectedCard) {
       console.log("Selected Card:", selectedCard); // Debug : afficher la carte sélectionnée
    console.log("Collection ID:", selectedCard.collectionId); // Debug : afficher l'ID de la collection
    console.log("Price:", price); 
      await handleSetCardOnSale(selectedCard.collectionId, selectedCard.cardId, price);
    }
    closeModal();
  };

  return (
    <div className={page_styles.profilePage}>
      <h1>Profile</h1>

      {loading ? (
        <p>Loading your cards...</p>
      ) : (
        <div>
          {error && <p className={global_styles.error}>{error}</p>}
          {Object.entries(cardsByCollection).length === 0 ? (
            <p>You don't have any cards.</p>
          ) : (
            <div className={page_styles.profilePage}>
              <div className={page_styles.cardGridContainer}>
                <div className={page_styles.cardGrid}>
                  {Object.entries(cardsByCollection).map(([collectionId, cards]) => (
                    <div key={collectionId}>
                      {cards.map(card => (
                        <div className={page_styles.card} key={card.cardId}>
                          <img src={card.img} alt={card.name} />
                          <h3>{card.name}</h3>
                          <button onClick={() => openModal(parseInt(collectionId), card.cardId)}>
                            Mise en vente
                          </button>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal pour saisir le prix */}
      <Modal isOpen={isModalOpen} onRequestClose={closeModal}>
        <h2>Mettre la carte en vente</h2>
        <input
          type="text"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="Entrez le prix"
        />
        <button onClick={handlePriceSubmit}>Confirmer</button>
        <button onClick={closeModal}>Annuler</button>
      </Modal>
    </div>
  );
};

export default ProfilePage;