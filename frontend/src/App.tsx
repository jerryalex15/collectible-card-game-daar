import { useEffect, useMemo, useRef, useState } from 'react';
import styles from './styles.module.css';
import * as ethereum from '@/lib/ethereum';
import * as main from '@/lib/main';
import axios from 'axios';

type Canceler = () => void;

const useAffect = (
  asyncEffect: () => Promise<Canceler | void>,
  dependencies: any[] = []
) => {
  const cancelerRef = useRef<Canceler | void>();
  useEffect(() => {
    asyncEffect()
      .then(canceler => (cancelerRef.current = canceler))
      .catch(error => console.warn('Uncatched error', error));
    return () => {
      if (cancelerRef.current) {
        cancelerRef.current();
        cancelerRef.current = undefined;
      }
    };
  }, dependencies);
};

const useWallet = () => {
  const [details, setDetails] = useState<ethereum.Details>();
  const [contract, setContract] = useState<main.Main>();
  useAffect(async () => {
    const details_ = await ethereum.connect('metamask');
    if (!details_) return;
    setDetails(details_);
    const contract_ = await main.init(details_);
    if (!contract_) return;
    setContract(contract_);
  }, []);
  return useMemo(() => {
    if (!details || !contract) return;
    return { details, contract };
  }, [details, contract]);
};

export const App = () => {
  const wallet = useWallet();
  const [collectionId, setCollectionId] = useState('');
  const [collectionPokemonID, setCollectionPokemonID] = useState('');
  const [cardId, setCardId] = useState('');
  const [userTo, setUserTo] = useState('');
  const [responseMessage, setResponseMessage] = useState('');
  const [collections, setCollections] = useState([]);
  const [error, setError] = useState<any|null>(null);
  const [price, setPrice] = useState(''); // État pour le prix en Wei
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Gestion de la création de collection
  const handleCreateCollection = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setResponseMessage('');

    try {
      const response = await axios.post('http://localhost:3000/create-collection', {
        collectionPokemonID: collectionPokemonID,
      });
      setResponseMessage(response.data.message || 'Collection created successfully!');
      setCollectionPokemonID('');
    } catch (error: any) {
      setResponseMessage('Error creating collection: ' + (error.response?.data.message || error.message));
    }
  };

  // Gestion du mint de cartes
  const handleMintCard = async () => {
    setResponseMessage('');
    try {
      const response = await axios.post('http://localhost:3000/mint-card', {
        collectionId: collectionId,
        userAddress: wallet?.details.account
      });
      setResponseMessage(response.data.message || 'Card minted successfully!');
      setCollectionId('');
    } catch (error: any) {
      setResponseMessage('Error minting card: ' + (error.response?.data.error || error.message));
    }
  };

  // Nouvelle fonction : assigner une carte d'un utilisateur à un autre
  const handleAssignCard = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const response = await axios.post(`http://localhost:3000/collection/${collectionId}/card/${cardId}/assign`, {
        userTo: userTo,
      });
      setResponseMessage(response.data.message || 'Card assigned successfully!');
      setCardId('');
      setUserTo('');
    } catch (error: any) {
      setResponseMessage('Error assigning card: ' + (error.response?.data.error || error.message));
    }
  };

  // Nouvelle fonction : mettre une carte en vente
  const handleSetCardOnSale = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const response = await axios.post('http://localhost:3000/setOnSale-card', {
        cardId: parseInt(cardId),
        collectionId: parseInt(collectionId),
        price: price ? parseInt(price) : 0,
        userAddress: wallet?.details.account
      });
      setResponseMessage(response.data.message || 'Card put on sale successfully!');
      setCardId('');
      setCollectionId('');
      setPrice('');
    } catch (error: any) {
      setResponseMessage('Error putting card on sale: ' + (error.response?.data.error || error.message));
    }
  };

  // Récupérer toutes les collections
  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const response = await fetch('http://localhost:3000/collections');
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des collections');
        }
        const data = await response.json();
        setCollections(data);
      } catch (err: any) {
        setError(err.message);
      }
    };

    fetchCollections();
  }, []);

  const [ownedCards, setOwnedCards] = useState([]);

  // Fonction pour récupérer les cartes possédées par l'utilisateur
  const handleGetUserCards = async () => {
    try {
      const response = await fetch(`http://localhost:3000/user/${wallet?.details.account}/cards`);
      const data = await response.json();
      setOwnedCards(data.ownedCards);
    } catch (err: any) {
      setError(err.response?.data.error || 'Error fetching cards');
    }
  };

  const [cardsOnSale, setCardsOnSale] = useState([]);
  // Fonction pour appeler l'endpoint et récupérer les cartes en vente
  useEffect(() => {
    const fetchCardsOnSale = async () => {
      try {
        const response = await fetch('http://localhost:3000/get-all-cards-on-sale');
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des cartes en vente');
        }
        const data = await response.json();
        setCardsOnSale(data); // Met à jour l'état avec les cartes en vente récupérées
      } catch (err: any) {
        setError(err.message);
      }
    };

    fetchCardsOnSale(); // Appelle la fonction pour récupérer les cartes en vente
  }, []);

  const handleRemoveCardFromSale = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const response = await axios.post('http://localhost:3000/remove-card-from-sale', {
        cardId: parseInt(cardId),
        collectionId: parseInt(collectionId),
        userAddress: wallet?.details.account, // Si nécessaire
      });
      setResponseMessage(response.data.message || 'Card removed from sale successfully!');
      setCardId('');
      setCollectionId('');
    } catch (error: any) {
      setResponseMessage('Error removing card from sale: ' + (error.response?.data.error || error.message));
    }
  };

  // Fonction pour acheter une carte
  const handleBuyCard = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setResponseMessage('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:3000/buy-card', {
        collectionId: parseInt(collectionId),
        cardId: parseInt(cardId),
        buyerAddress: wallet?.details.account, // Adresse de l'utilisateur connecté
      });
      setResponseMessage(response.data.message || 'Card bought successfully!');
      setCardId('');
      setCollectionId('');
    } catch (error: any) {
      setResponseMessage('Error buying card: ' + (error.response?.data.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.body}>
      <h1>Welcome to Pokémon TCG || Account: {wallet?.details.account}</h1>

      {/* Formulaire pour créer une collection */}
      <div className={styles.formContainer}>
        <h2>Create a Pokémon Collection</h2>
        <form onSubmit={handleCreateCollection} className={styles.form}>
          <div className={styles.inputGroup}>
            <label>
              Collection Pokémon ID:
              <input
                type="text"
                value={collectionPokemonID}
                onChange={(e) => setCollectionPokemonID(e.target.value)}
                required
              />
            </label>
          </div>
          <button type="submit" className={styles.submitButton}>Create Collection</button>
        </form>
        {responseMessage && <p className={styles.responseMessage}>{responseMessage}</p>}
      </div>

      {collections.length > 0 ? (
        <ul>
          {collections.map((collection:any) => (
            <li key={collection.id}>{collection.name}</li> // Utilisez les bonnes propriétés
          ))}
        </ul>
      ) : (
        <p>No collections found.</p>
      )}

      {/* Formulaire pour minter une carte */}
      <div className={styles.mintContainer}>
        <h2>Mint a Card</h2>
        <input
          type="text"
          placeholder="Enter Collection ID"
          value={collectionId}
          onChange={(e) => setCollectionId(e.target.value)}
          className={styles.inputField}
        />
        <button onClick={handleMintCard} className={styles.mintButton}>Mint Card</button>
      </div>

      {/* Formulaire pour assigner une carte */}
      <div className={styles.formContainer}>
        <h2>Assign a Card</h2>
        <form onSubmit={handleAssignCard} className={styles.form}>
          <div className={styles.inputGroup}>
            <label>
              Collection ID:
              <input
                type="text"
                value={collectionId}
                onChange={(e) => setCollectionId(e.target.value)}
                required
              />
            </label>
          </div>
          <div className={styles.inputGroup}>
            <label>
              Card ID:
              <input
                type="text"
                value={cardId}
                onChange={(e) => setCardId(e.target.value)}
                required
              />
            </label>
          </div>
          <div className={styles.inputGroup}>
            <label>
              Assign to User (Address):
              <input
                type="text"
                value={userTo}
                onChange={(e) => setUserTo(e.target.value)}
                required
              />
            </label>
          </div>
          <button type="submit" className={styles.submitButton}>Assign Card</button>
        </form>
        {responseMessage && <p className={styles.responseMessage}>{responseMessage}</p>}
      </div>

      {/* Formulaire pour mettre une carte en vente */}
      <div className={styles.formContainer}>
        <h2>Put Card On Sale</h2>
        <form onSubmit={handleSetCardOnSale} className={styles.form}>
          <div className={styles.inputGroup}>
            <label>
              Collection ID:
              <input
                type="text"
                value={collectionId}
                onChange={(e) => setCollectionId(e.target.value)}
                required
              />
            </label>
          </div>
          <div className={styles.inputGroup}>
            <label>
              Card ID:
              <input
                type="text"
                value={cardId}
                onChange={(e) => setCardId(e.target.value)}
                required
              />
            </label>
          </div>
          <div className={styles.inputGroup}>
            <label>
              Price (in Wei):
              <input
                type="text"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </label>
          </div>
          <button type="submit" className={styles.submitButton}>Put On Sale</button>
        </form>
        {responseMessage && <p className={styles.responseMessage}>{responseMessage}</p>}
      </div>

      {/* Affichage des cartes possédées */}
      <div className={styles.cardsContainer}>
        <h2>Your Owned Cards</h2>
        <button onClick={handleGetUserCards} className={styles.submitButton}>Get Owned Cards</button>
        {ownedCards.length > 0 ? (
          <ul>
            {ownedCards.map((card:any) => (
              <li key={card.cardId}>{card.cardId}</li>
            ))}
          </ul>
        ) : (
          <p>No cards owned yet.</p>
        )}
      </div>


      <div>
        <h2>Cards on Sale</h2>
        {error && <p className={styles.errorMessage}>{error}</p>}
        
        {/* Affiche les cartes en vente */}
        {cardsOnSale.length > 0 ? (
          <ul>
            {cardsOnSale.map((card:any, index:number) => (
              <li key={index}>
                Card ID: {card.cardId}, Collection ID: {card.collectionId}, Price: {card.price} Wei
              </li>
            ))}
          </ul>
        ) : (
          <p>No cards on sale.</p>
        )}
      </div>
      <div>
        <h2>Retirer une carte de la vente</h2>
        <form onSubmit={handleRemoveCardFromSale}>
          <input
            type="text"
            placeholder="Card ID"
            value={cardId}
            onChange={(e) => setCardId(e.target.value)}
          />
          <input
            type="text"
            placeholder="Collection ID"
            value={collectionId}
            onChange={(e) => setCollectionId(e.target.value)}
          />
          <button type="submit">Retirer de la vente</button>
        </form>
        {responseMessage && <p>{responseMessage}</p>}
      </div>
      {/* Formulaire pour acheter une carte */}
      <div className={styles.formContainer}>
        <h2>Buy a Card</h2>
        <form onSubmit={handleBuyCard} className={styles.form}>
          <div className={styles.inputGroup}>
            <label>
              Collection ID:
              <input
                type="text"
                value={collectionId}
                onChange={(e) => setCollectionId(e.target.value)}
                required
              />
            </label>
          </div>
          <div className={styles.inputGroup}>
            <label>
              Card ID:
              <input
                type="text"
                value={cardId}
                onChange={(e) => setCardId(e.target.value)}
                required
              />
            </label>
          </div>
          <button type="submit" className={styles.submitButton} disabled={loading}>
            {loading ? 'Buying...' : 'Buy Card'}
          </button>
        </form>
        {responseMessage && <p className={styles.responseMessage}>{responseMessage}</p>}
      </div>

    </div>
  );
};

export default App;