import React from 'react'
import CardItem from './CardItem'
import styles from './CardList.module.css'

type Card = {
  cardId: number // Utilisez le type correct pour cardId
  realID: number // ID réel de la carte
  name: string // Nom de la carte
  img: string // URL de l'image
  rarity: string // Rareté de la carte
  onSale: boolean // Indique si la carte est en vente
  price: string // Prix de la carte
  collectionId: number
}

interface CardListProps {
  cards: Card[] // Liste des cartes
  onAction: (collectionId: number, cardId: number) => void // Fonction d'action pour acheter ou vendre
}

function CardList({ cards, onAction }: CardListProps) {
  return (
    <div>
      {cards.map(card => (
        <CardItem
          key={card.cardId} // Utilisez cardId comme clé unique
          cardId={card.cardId} // ID de la carte
          realID={card.realID} // ID réel de la carte
          name={card.name} // Nom de la carte
          img={card.img} // URL de l'image
          rarity={card.rarity} // Rareté de la carte
          onSale={card.onSale} // Indique si la carte est en vente
          price={card.price} 
          collectionId={card.collectionId}// Prix de la carte
          onAction={onAction} // Passe la fonction d'action
        />
      ))}
    </div>
  );
};

export default CardList;