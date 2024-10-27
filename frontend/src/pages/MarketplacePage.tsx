import { useEffect, useState } from 'react'
import global_styles from '@/styles.module.css'
import page_styles from './MarketplacePage.module.css'
import CardList from '@/components/cards/CardList'
import useApiMethods from '@/context/useApiMethods'

export const MarketplacePage = () => {
  const { fetchCardsOnSale, loading, error, cardsOnSale } = useApiMethods()
  const [cards, setCards] = useState([])

  useEffect(() => {
    const loadCards = async () => {
      // Vérifier le stockage local d'abord
      const storedCards = localStorage.getItem('cardsOnSale')
      if (storedCards) {
        setCards(JSON.parse(storedCards))
      } else {
        // Si pas de données en local, appeler l'API
        await fetchCardsOnSale()
      }
    }

    loadCards()
  }, [fetchCardsOnSale]) // Dépendance sur fetchCardsOnSale

  // Mettre à jour l'état des cartes lorsque cardsOnSale change
  useEffect(() => {
    setCards(cardsOnSale) // Met à jour les cartes à partir de l'état de l'API
  }, [cardsOnSale])

  return (
    <div className={page_styles.marketplacePage}>
      <h1>Marketplace</h1>
      {loading ? <p>Loading cards...</p> : <CardList cards={cards} />}
      {error && <p className={global_styles.error}>{error}</p>}
    </div>
  )
}

export default MarketplacePage