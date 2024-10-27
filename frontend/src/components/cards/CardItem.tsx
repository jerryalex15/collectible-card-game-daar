import React, { useRef } from 'react'
import styles from './CardItem.module.css'
import { BigNumber } from 'ethers' // Assurez-vous d'importer BigNumber si vous l'utilisez.

interface CardItemProps {
  cardId: string
  realID: string
  name: string
  img: string
  rarity: string
  onSale: boolean
  price: string // Peut être un BigNumber ou string selon l'utilisation
  playerHasCard: boolean // État si le joueur a la carte
  onAction: (cardId: string) => void // Fonction pour acheter/vendre la carte
}

function CardItem({
  cardId,
  realID,
  name,
  img,
  rarity,
  onSale,
  price,
  playerHasCard,
  onAction,
}: CardItemProps) {
  const imageRef = useRef<HTMLImageElement>(null) // Référence à l'image

  const handleMouseMove = (e: React.MouseEvent) => {
    const image = imageRef.current
    if (!image) return
    const rect = image.getBoundingClientRect()
    const x = e.clientX - rect.left // Position x de la souris dans l'image
    const y = e.clientY - rect.top // Position y de la souris dans l'image

    const intensity = 50 // Intensité de la rotation

    // Calcul des angles de rotation
    const rotateX = (y / rect.height - 0.5) * intensity
    const rotateY = (x / rect.width - 0.5) * -intensity

    // Application de la transformation uniquement à l'image
    image.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`
  }

  const handleMouseLeave = () => {
    const image = imageRef.current
    if (image) image.style.transform = '' // Réinitialiser la transformation
  }

  const handleActionClick = () => {
    onAction(cardId) // Appeler la fonction d'action avec l'ID de la carte
  }

  // Détermine la classe du bouton
  const buttonClass = playerHasCard ? styles.sellButton : styles.buyButton

  return (
    <div className={styles.cardItem}>
      <img
        src={img}
        alt={`${name} image`}
        className={styles.cardItemImage}
        ref={imageRef}
        onMouseMove={handleMouseMove} // Déplacez l'événement ici
        onMouseLeave={handleMouseLeave} // Déplacez l'événement ici
      />
      <div className={styles.cardItemContent}>
        <h3 className={styles.cardItemTitle}>{name}</h3>
        <p className={styles.cardItemRarity}>{rarity}</p>
        {onSale && <p className={styles.cardItemPrice}>Prix: {price} ETH</p>}
        <button
          className={`${styles.cardItemButton} ${buttonClass}`}
          onClick={handleActionClick}
        >
          {playerHasCard ? 'Vendre' : 'Acheter'}
        </button>
      </div>
    </div>
  )
}

export default CardItem
