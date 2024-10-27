import React, { useRef } from 'react';
import styles from './CardItem.module.css';

interface CardItemProps {
  name: string;
  image: string;
  rarity: string;
  price: string;
  collectionId: number; // Add this prop
  cardId: number; // Add this prop
  onBuyCard: (collectionId: number, cardId: number) => void; // Add this prop
}

function CardItem({ name, image, rarity, price, collectionId, cardId, onBuyCard }: CardItemProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left; // Position x de la souris dans la carte
    const y = e.clientY - rect.top; // Position y de la souris dans la carte

    const intensity = 10;

    const rotateX = (y / rect.height - 0.5) * intensity;
    const rotateY = (x / rect.width - 0.5) * -intensity;

    card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  };

  const handleMouseLeave = () => {
    const card = cardRef.current;
    if (card) card.style.transform = '';
  };

  const handleBuyClick = () => {
    onBuyCard(collectionId, cardId); // Trigger the buy card function
  };

  return (
    <div
      className={styles.cardItem}
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <img src={image} alt={`${name} image`} className={styles.cardItemImage} />
      <div className={styles.cardItemContent}>
        <h3 className={styles.cardItemTitle}>{name}</h3>
        <h5 className={styles.cardItemType}>{rarity}</h5>
        <h5 className={styles.cardItemType}>{price} wei</h5>
        <button onClick={handleBuyClick}>Acheter</button> {/* Updated button */}
      </div>
    </div>
  );
}

export default CardItem;