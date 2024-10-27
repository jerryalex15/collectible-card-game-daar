import { useEffect, useState } from 'react';
import global_styles from '@/styles.module.css';
import page_styles from './ProfilePage.module.css';
import useApiMethods from '@/context/useApiMethods';

interface Card {
  id: number;
  name: string;
  collectionId: number;
}

export const ProfilePage = () => {
  const { handleGetUserCards, ownedCards, loading, error , wallet} = useApiMethods();
  const [cardsByCollection, setCardsByCollection] = useState<Record<number, Card[]>>({});

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

  return (
    <div className={page_styles.profilePage}>
      <h1>Profile</h1>

      {loading ? (
        <p>Loading your cards...</p>
      ) : (
        <div>
          {error && <p className={global_styles.error}>{error}</p>}
          {Object.keys(cardsByCollection).length === 0 ? (
            <p>You don't have any cards.</p>
          ) : (
            Object.entries(cardsByCollection).map(([collectionId, cards]) => (
              <div key={collectionId}>
                <h2>Collection {collectionId}</h2>
                <ul>
                  {cards.map(card => (
                    <li key={card.id}>{card.name}</li>
                  ))}
                </ul>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default ProfilePage;