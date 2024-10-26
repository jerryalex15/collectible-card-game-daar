import CardItem from './CardItem'
import styles from './CardList.module.css'

type Card = {
  id: number
  name: string
  image: string
  description: string
  type: string
}

interface CardListProps {
  cards: Card[]
}

function CardList({ cards }: CardListProps) {
  return (
    <div className={styles.cardList}>
      {cards.map(card => (
        <CardItem
          key={card.id}
          name={card.name}
          image={card.image}
          description={card.description}
          type={card.type}
        />
      ))}
    </div>
  )
}

export default CardList
