import { useEffect, useMemo, useRef, useState } from 'react';
import styles from './styles.module.css';
import * as ethereum from '@/lib/ethereum';
import * as main from '@/lib/main';
import axios from 'axios';

type Canceler = () => void
const useAffect = (
  asyncEffect: () => Promise<Canceler | void>,
  dependencies: any[] = []
) => {
  const cancelerRef = useRef<Canceler | void>()
  useEffect(() => {
    asyncEffect()
      .then(canceler => (cancelerRef.current = canceler))
      .catch(error => console.warn('Uncatched error', error))
    return () => {
      if (cancelerRef.current) {
        cancelerRef.current()
        cancelerRef.current = undefined
      }
    }
  }, dependencies)
}

const useWallet = () => {
  const [details, setDetails] = useState<ethereum.Details>()
  const [contract, setContract] = useState<main.Main>()
  useAffect(async () => {
    const details_ = await ethereum.connect('metamask')
    if (!details_) return
    setDetails(details_)
    const contract_ = await main.init(details_)
    if (!contract_) return
    setContract(contract_)
  }, [])
  return useMemo(() => {
    if (!details || !contract) return
    return { details, contract }
  }, [details, contract])
}

export const App = () => {
  const wallet = useWallet()
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

  // États pour les boosters
  // États pour la création de booster
  const [boosterUserAddress, setBoosterUserAddress] = useState('');
  const [boosterName, setBoosterName] = useState('');
  const [boosterCardCount, setBoosterCardCount] = useState('');
  const [boosterResponseMessage, setBoosterResponseMessage] = useState('');

  // Fonction pour créer un booster
  const handleCreateBooster = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBoosterResponseMessage('');

    try {
      const response = await axios.post('http://localhost:3000/api/create-booster', {
        userAddress: wallet?.details.account,
        name: boosterName,
        cardCountInBooster: parseInt(boosterCardCount),
      });
      setBoosterResponseMessage(response.data.message || 'Booster created successfully!');
      // Réinitialiser les états si nécessaire
      setBoosterUserAddress('');
      setBoosterName('');
      setBoosterCardCount('');
    } catch (error: any) {
      setBoosterResponseMessage('Error creating booster: ' + (error.response?.data.error || error.message));
    }
  };

  // États pour l'acquisition de booster
  const [boosterId, setBoosterId] = useState('');
  const [acquirerUserAddress, setAcquirerUserAddress] = useState('');
  const [acquireResponseMessage, setAcquireResponseMessage] = useState('');

  // Fonction pour acquérir un booster
  const handleAcquireBooster = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAcquireResponseMessage('');

    try {
      const response = await axios.post('http://localhost:3000/api/acquire-booster', {
        boosterId,
        userAddress: wallet?.details.account,
      });
      setAcquireResponseMessage(response.data.message || 'Booster acquired successfully!');
      // Réinitialiser les états si nécessaire
      setBoosterId('');
      setAcquirerUserAddress('');
    } catch (error: any) {
      setAcquireResponseMessage('Error acquiring booster: ' + (error.response?.data.error || error.message));
    }
  };

   // États pour le déballage de booster
   const [unpackBoosterId, setUnpackBoosterId] = useState('');
   const [unpackUserAddress, setUnpackUserAddress] = useState('');
   const [unpackResponseMessage, setUnpackResponseMessage] = useState('');
 
   // Fonction pour déballer un booster
   const handleUnpackBooster = async (event: React.FormEvent<HTMLFormElement>) => {
     event.preventDefault();
     setUnpackResponseMessage('');
 
     try {
       const response = await axios.post('http://localhost:3000/api/unpack-booster', {
         boosterId: unpackBoosterId,
         userAddress: wallet?.details.account,
       });
       setUnpackResponseMessage(response.data.message || 'Booster unpacked successfully!');
       // Réinitialiser les états si nécessaire
       setUnpackBoosterId('');
       setUnpackUserAddress('');
     } catch (error: any) {
       setUnpackResponseMessage('Error unpacking booster: ' + (error.response?.data.error || error.message));
     }
   };
 

  // Gestion de la création de collection
  const handleCreateCollection = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setResponseMessage('');

    try {
      const response = await axios.post('http://localhost:3000/api/create-collection', {
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

      console.log("voici ", wallet?.details.account);
      
      const response = await axios.post('http://localhost:3000/api/mint-card', {
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
      const response = await axios.post(`http://localhost:3000/api/collection/${collectionId}/card/${cardId}/assign`, {
        userFrom: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
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
      const response = await axios.post('http://localhost:3000/api/setOnSale-card', {
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
        const response = await fetch('http://localhost:3000/api/collections');
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

    // État pour la liste des boosters
    const [boosters, setBoosters] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');
  
    // Fonction pour récupérer les boosters
    const fetchBoosters = async () => {
      setLoading(true);
      setErrorMessage('');
      try {
        const response = await axios.get('http://localhost:3000/api/list-boosters');
        setBoosters(response.data.boosters);
      } catch (error:any) {
        setErrorMessage('Error fetching boosters: ' + (error.response?.data.error || error.message));
      } finally {
        setLoading(false);
      }
    };
  
    // Récupérer les boosters lors du chargement du composant
    useEffect(() => {
      fetchBoosters();
    }, []);

  const [ownedCards, setOwnedCards] = useState([]);

  // Fonction pour récupérer les cartes possédées par l'utilisateur
  const handleGetUserCards = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/user/${wallet?.details.account}/cards`);
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
        const response = await fetch('http://localhost:3000/api/get-all-cards-on-sale');
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
      const response = await axios.post('http://localhost:3000/api/remove-card-from-sale', {
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
      const response = await axios.post('http://localhost:3000/api/buy-card', {
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
            <li key={collection.id}>{collection.name} ID: {collection.collectionId}</li> // Utilisez les bonnes propriétés
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
      {/* Formulaire pour créer un booster */}
      <div className={styles.formContainer}>
        <h2>Create a Booster</h2>
        <form onSubmit={handleCreateBooster} className={styles.form}>
          <div className={styles.inputGroup}>
            <label>
              Booster Name:
              <input
                type="text"
                value={boosterName}
                onChange={(e) => setBoosterName(e.target.value)}
                required
              />
            </label>
          </div>
          <div className={styles.inputGroup}>
            <label>
              Number of Cards in Booster:
              <input
                type="number"
                value={boosterCardCount}
                onChange={(e) => setBoosterCardCount(e.target.value)}
                required
              />
            </label>
          </div>
          <button type="submit" className={styles.submitButton}>Create Booster</button>
        </form>
        {boosterResponseMessage && <p className={styles.responseMessage}>{boosterResponseMessage}</p>}
      </div>

      {/* Formulaire pour acquérir un booster */}
      <div className={styles.formContainer}>
        <h2>Acquire a Booster</h2>
        <form onSubmit={handleAcquireBooster} className={styles.form}>
          <div className={styles.inputGroup}>
            <label>
              Booster ID:
              <input
                type="text"
                value={boosterId}
                onChange={(e) => setBoosterId(e.target.value)}
                required
              />
            </label>
          </div>
          <button type="submit" className={styles.submitButton}>Acquire Booster</button>
        </form>
        {acquireResponseMessage && <p className={styles.responseMessage}>{acquireResponseMessage}</p>}
      </div>
      {/* Formulaire pour déballer un booster */}
      <div className={styles.formContainer}>
        <h2>Unpack a Booster</h2>
        <form onSubmit={handleUnpackBooster} className={styles.form}>
          <div className={styles.inputGroup}>
            <label>
              Booster ID:
              <input
                type="text"
                value={unpackBoosterId}
                onChange={(e) => setUnpackBoosterId(e.target.value)}
                required
              />
            </label>
          </div>
          <button type="submit" className={styles.submitButton}>Unpack Booster</button>
        </form>
        {unpackResponseMessage && <p className={styles.responseMessage}>{unpackResponseMessage}</p>}
      </div>

      {/* Section pour lister les boosters */}
      <div className={styles.boostersContainer}>
        <h2>Boosters</h2>
        {loading && <p>Loading boosters...</p>}
        {errorMessage && <p className={styles.errorMessage}>{errorMessage}</p>}
        {boosters.length > 0 ? (
          <ul>
            {boosters.map((booster:any, index) => (
              <li key={index}>
                <p>Booster ID: {booster.id}</p> {/* Afficher l'ID du booster */}
                <p>Booster Name: {booster.name}</p>
                {/* Vous pouvez ajouter d'autres informations sur le booster ici */}
              </li>
            ))}
          </ul>
        ) : (
          !loading && <p>No boosters available.</p>
        )}
      </div>

    </div>
  );
};

export default App;