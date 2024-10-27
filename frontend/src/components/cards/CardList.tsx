import React from 'react'
import CardItem from './CardItem'
import styles from './CardList.module.css'

type Card = {
  cardId: string // Utilisez le type correct pour cardId
  realID: string // ID réel de la carte
  name: string // Nom de la carte
  img: string // URL de l'image
  description: string // Description de la carte
  rarity: string // Rareté de la carte
  onSale: boolean // Indique si la carte est en vente
  price: string // Prix de la carte
  playerHasCard: boolean // Indique si le joueur possède la carte
}

interface CardListProps {
  cards: Card[] // Liste des cartes
  onAction: (cardId: string) => void // Fonction d'action pour acheter ou vendre
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
          price={card.price} // Prix de la carte
          playerHasCard={card.playerHasCard} // Indique si le joueur a la carte
          onAction={onAction} // Passe la fonction d'action
        />
      ))}
    </div>
  );
};

export default CardList;