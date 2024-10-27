import { useEffect, useState, useCallback } from 'react'
import { useWallet } from './AuthContext'
import axios from 'axios'

const useApiMethods = () => {
  const ApiAddress = 'http://localhost:3000/api'
  const wallet = useWallet()
  const [responseMessage, setResponseMessage] = useState('')
  const [collections, setCollections] = useState([])
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [cardsOnSale, setCardsOnSale] = useState([])
  const [ownedCards, setOwnedCards] = useState([])
  // Gestion de la création de collection
  const handleCreateCollection = async (collectionPokemonID: string) => {
    setResponseMessage('')
    setLoading(true)
    try {
      const response = await axios.post(`${ApiAddress}/create-collection`, {
        collectionPokemonID,
      })
      setResponseMessage(
        response.data.message || 'Collection created successfully!'
      )
    } catch (error: any) {
      setResponseMessage(
        'Error creating collection: ' +
          (error.response?.data.message || error.message)
      )
    } finally {
      setLoading(false)
    }
  }

  // Gestion du mint de cartes
  const handleMintCard = async (collectionId: string) => {
    if (!wallet || !wallet.details) return
    setResponseMessage('')
    setLoading(true)
    try {
      const response = await axios.post(`${ApiAddress}/mint-card`, {
        collectionId,
        userAddress: wallet.details.account,
      })
      setResponseMessage(response.data.message || 'Card minted successfully!')
    } catch (error: any) {
      setResponseMessage(
        'Error minting card: ' + (error.response?.data.error || error.message)
      )
    } finally {
      setLoading(false)
    }
  }

  // Nouvelle fonction : assigner une carte d'un utilisateur à un autre
  const handleAssignCard = async (
    collectionId: string,
    cardId: string,
    userTo: string
  ) => {
    setLoading(true)
    try {
      const response = await axios.post(
        `${ApiAddress}/collection/${collectionId}/card/${cardId}/assign`,
        { userTo }
      )
      setResponseMessage(response.data.message || 'Card assigned successfully!')
    } catch (error: any) {
      setResponseMessage(
        'Error assigning card: ' + (error.response?.data.error || error.message)
      )
    } finally {
      setLoading(false)
    }
  }

  // Nouvelle fonction : mettre une carte en vente
  const handleSetCardOnSale = async (
    collectionId: string,
    cardId: string,
    price: string
  ) => {
    if (!wallet || !wallet.details) return
    setLoading(true)
    try {
      const response = await axios.post(`${ApiAddress}/setOnSale-card`, {
        cardId: parseInt(cardId),
        collectionId: parseInt(collectionId),
        price: price ? parseInt(price) : 0,
        userAddress: wallet.details.account,
      })
      setResponseMessage(
        response.data.message || 'Card put on sale successfully!'
      )
    } catch (error: any) {
      setResponseMessage(
        'Error putting card on sale: ' +
          (error.response?.data.error || error.message)
      )
    } finally {
      setLoading(false)
    }
  }

  // Récupérer toutes les collections
  const fetchCollections = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${ApiAddress}/collections`)
      if (!response.ok)
        throw new Error('Erreur lors de la récupération des collections')
      const data = await response.json()
      setCollections(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // useEffect(() => {
  //   fetchCollections()
  // }, [])

  // Fonction pour récupérer les cartes possédées par l'utilisateur
  // const handleGetUserCards = async () => {
  //   if (!wallet || !wallet.details) return
  //   setLoading(true)
  //   try {
  //     const response = await fetch(
  //       `${ApiAddress}/user/${wallet.details.account}/cards`
  //     )
  //     const data = await response.json()
  //     setOwnedCards(data.ownedCards)
  //   } catch (err: any) {
  //     setError(err.response?.data.error || 'Error fetching cards')
  //   } finally {
  //     setLoading(false)
  //   }
  // }


  // Wrap handleGetUserCards with useCallback
  const handleGetUserCards = useCallback(async () => {
    if (!wallet || !wallet.details) return;

    setLoading(true);
    setError(null); // Réinitialiser l'erreur à chaque nouvelle requête

    try {
      const response = await fetch(`${ApiAddress}/user/${wallet.details.account}/cards`);
      const data = await response.json();
      setOwnedCards(data.ownedCards);
    } catch (err: any) {
      setError(err.response?.data.error || 'Error fetching cards');
    } finally {
      setLoading(false);
    }
  }, [wallet]); // Dépendance sur wallet


  // Fonction pour récupérer les cartes en vente
  const fetchCardsOnSale = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${ApiAddress}/get-all-cards-on-sale`)
      if (!response.ok) throw new Error('Erreur lors de la récupération des cartes en vente')
      
      const data = await response.json()
      
      // Mettre à jour l'état des cartes en vente
      setCardsOnSale(data)
      
      // Sauvegarder les cartes en vente dans le Local Storage
      localStorage.setItem('cardsOnSale', JSON.stringify(data))
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // useEffect(() => {
  //   fetchCardsOnSale()
  // }, [])

  // Fonction pour retirer une carte de la vente
  const handleRemoveCardFromSale = async (
    collectionId: string,
    cardId: string
  ) => {
    if (!wallet || !wallet.details) return
    setLoading(true)
    try {
      const response = await axios.post(`${ApiAddress}/remove-card-from-sale`, {
        cardId: parseInt(cardId),
        collectionId: parseInt(collectionId),
        userAddress: wallet.details.account,
      })
      setResponseMessage(
        response.data.message || 'Card removed from sale successfully!'
      )
    } catch (error: any) {
      setResponseMessage(
        'Error removing card from sale: ' +
          (error.response?.data.error || error.message)
      )
    } finally {
      setLoading(false)
    }
  }

  // Fonction pour acheter une carte
  const handleBuyCard = async (collectionId: string, cardId: string) => {
    setResponseMessage('')
    setLoading(true)
    if (!wallet || !wallet.details) return
    try {
      const response = await axios.post(`${ApiAddress}/buy-card`, {
        collectionId: parseInt(collectionId),
        cardId: parseInt(cardId),
        buyerAddress: wallet.details.account,
      })
      setResponseMessage(response.data.message || 'Card bought successfully!')
    } catch (error: any) {
      setResponseMessage(
        'Error buying card: ' + (error.response?.data.error || error.message)
      )
    } finally {
      setLoading(false)
    }
  }

  return {
    wallet,
    responseMessage,
    collections,
    error,
    loading,
    cardsOnSale,
    ownedCards,
    handleCreateCollection,
    handleMintCard,
    handleAssignCard,
    handleSetCardOnSale,
    fetchCollections,
    handleGetUserCards,
    fetchCardsOnSale,
    handleRemoveCardFromSale,
    handleBuyCard,
  }
}

export default useApiMethods
