import React, { useRef } from 'react'
import styles from './BoosterItem.module.css'

interface BoosterItemProps {
  name: string
  image: string
  description: string
  type: string
  action?: () => void // Nouvelle prop pour l'action
  actionLabel?: string // Nouvelle prop pour le texte du bouton
}

function BoosterItem({
  name,
  image,
  description,
  type,
  action,
  actionLabel,
}: BoosterItemProps) {
  const boosterRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: React.MouseEvent) => {
    const booster = boosterRef.current
    if (!booster) return
    const rect = booster.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const intensity = 10
    const rotateX = (y / rect.height - 0.5) * intensity
    const rotateY = (x / rect.width - 0.5) * -intensity

    booster.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`
  }

  const handleMouseLeave = () => {
    const booster = boosterRef.current
    if (booster) booster.style.transform = ''
  }

  return (
    <div
      className={styles.boosterItem}
      ref={boosterRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <img
        src={image}
        alt={`${name} image`}
        className={styles.boosterItemImage}
      />
      <div className={styles.boosterItemContent}>
        <h3 className={styles.boosterItemTitle}>{name}</h3>
        <p className={styles.boosterItemType}>{type}</p>
        <p className={styles.boosterItemDescription}>{description}</p>

        {/* Bouton d'action conditionnel */}
        {action && actionLabel && (
          <button onClick={action} className={styles.actionButton}>
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  )
}

export default BoosterItem
