import BoosterItem from '../boosters/BoosterItem'
import styles from './BoosterList.module.css'

type Booster = {
  id: number
  name: string
  image: string
  description: string
  type: string
  action?: () => void // Fonction d'action pour chaque booster
  actionLabel?: string // Label du bouton pour chaque booster
}

interface BoosterListProps {
  boosters: Booster[]
}

function BoosterList({ boosters }: BoosterListProps) {
  return (
    <div className={styles.boosterList}>
      {boosters.map(booster => (
        <BoosterItem
          key={booster.id}
          name={booster.name}
          image={booster.image}
          description={booster.description}
          type={booster.type}
          action={booster.action} // Passer l'action spécifique
          actionLabel={booster.actionLabel} // Passer le label spécifique
        />
      ))}
    </div>
  )
}

export default BoosterList
