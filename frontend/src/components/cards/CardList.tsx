import React from 'react';
import CardItem from './CardItem';

interface Card {
  cardId: number;
  name: string;
  img: string;
  rarity: string;
  price: string; // Ensure price is included
  collectionId: number; // Ensure collectionId is included
}

interface CardListProps {
  cards: Card[];
  onBuyCard: (collectionId: number, cardId: number) => void; // Add this prop
}

const CardList: React.FC<CardListProps> = ({ cards, onBuyCard }) => {
  return (
    <div>
      {cards.map(card => (
        <CardItem
          key={card.cardId}
          name={card.name}
          image={card.img}
          rarity={card.rarity}
          price={card.price}
          collectionId={card.collectionId} // Pass collectionId
          cardId={card.cardId} // Pass cardId
          onBuyCard={onBuyCard} // Pass onBuyCard function
        />
      ))}
    </div>
  );
};

export default CardList;