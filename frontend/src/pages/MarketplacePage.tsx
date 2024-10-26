import { useEffect, useState } from 'react'
import global_styles from '@/styles.module.css'
import page_styles from './MarketplacePage.module.css'
import CardList from '@/components/cards/CardList'
import useApiMethods from '@/context/useApiMethods'

export const MarketplacePage = () => {
  const { fetchCardsOnSale, cardsOnSale, loading, error } = useApiMethods()

  const [cards, setCards] = useState([])

  useEffect(() => {
    const loadCards = async () => {
      await fetchCardsOnSale()
      setCards(cardsOnSale)
    }
    loadCards()
  }, [fetchCardsOnSale, cardsOnSale])

  return (
    <div className={page_styles.marketplacePage}>
      <h1>Marketplace</h1>
      {loading ? <p>Loading cards...</p> : <CardList cards={cards} />}
      {error && <p className={global_styles.error}>{error}</p>}{' '}
    </div>
  )
}
