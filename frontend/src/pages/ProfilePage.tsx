import { useEffect, useState } from 'react'
import global_styles from '@/styles.module.css'
import page_styles from './ProfilePage.module.css'
import useApiMethods from '@/context/useApiMethods'

interface Card {
  id: number
  name: string
  collectionId: number
}

export const ProfilePage = () => {
  const { handleGetUserCards, ownedCards, loading, error } = useApiMethods()
  const [cardsByCollection, setCardsByCollection] = useState<
    Record<number, Card[]>
  >({})

  useEffect(() => {
    const loadUserCards = async () => {
      await handleGetUserCards()
      groupCardsByCollection(ownedCards)
    }
    loadUserCards()
  }, [handleGetUserCards, ownedCards])

  const groupCardsByCollection = (cards: Card[]) => {
    const grouped = cards.reduce<Record<number, Card[]>>((acc, card) => {
      const collectionId = card.collectionId
      if (!acc[collectionId]) {
        acc[collectionId] = []
      }
      acc[collectionId].push(card)
      return acc
    }, {})
    setCardsByCollection(grouped)
  }

  return (
    <div className={page_styles.profilePage}>
      <h1>Profile</h1>

      {loading ? (
        <p>Loading your cards...</p>
      ) : (
        <div>
          {error && <p className={global_styles.error}>{error}</p>}{' '}
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
  )
}
