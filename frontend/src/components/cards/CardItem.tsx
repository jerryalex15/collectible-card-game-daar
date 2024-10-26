import React, { useRef } from 'react'
import styles from './CardItem.module.css'

interface CardItemProps {
  name: string
  image: string
  description: string
  type: string
}

function CardItem({ name, image, description, type }: CardItemProps) {
  const cardRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: React.MouseEvent) => {
    const card = cardRef.current
    if (!card) return
    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left // Position x de la souris dans la carte
    const y = e.clientY - rect.top // Position y de la souris dans la carte

    const intensity = 10

    const rotateX = (y / rect.height - 0.5) * intensity
    const rotateY = (x / rect.width - 0.5) * -intensity

    card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`
  }

  const handleMouseLeave = () => {
    const card = cardRef.current
    if (card) card.style.transform = ''
  }

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
        <p className={styles.cardItemType}>{type}</p>
        <p className={styles.cardItemDescription}>{description}</p>
      </div>
    </div>
  )
}

export default CardItem
