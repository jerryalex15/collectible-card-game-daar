import { useWallet } from '@/context/AuthContext'
import styles from './HomePage.module.css'

export function HomePage() {
  const wallet = useWallet()

  return (
    <div className={styles.homepage}>
      <section className={styles.hero_section}>
        <h1>Bienvenue dans le Monde du TCG Pokémon !</h1>
        <p>
          Explorez, collectionnez et combattez avec vos cartes Pokémon
          favorites.
        </p>
      </section>

      <div className={styles.grid_container}>
        <div className={styles.card}>
          <img
            src="src/assets/icons/collection.png"
            alt="Collection"
            className={styles.card_icon}
          />
          <h2>Collection</h2>
          <p>Gérez et visualisez les collections.</p>
          <a href="collection" className={styles.card_link}>
            Explorer
          </a>
        </div>
        <div className={styles.card}>
          <img
            src="src/assets/icons/marketplace.png"
            alt="Marketplace"
            className={styles.card_icon}
          />
          <h2>Marketplace</h2>
          <p>Achetez, vendez et échangez vos cartes.</p>
          <a href="marketplace" className={styles.card_link}>
            Explorer
          </a>
        </div>
        <div className={styles.card}>
          <img
            src="src/assets/icons/booster.png"
            alt="Booster"
            className={styles.card_icon}
          />
          <h2>Boosters</h2>
          <p>Achetez des boosters contenant plusieurs cartes</p>
          <a href="booster" className={styles.card_link}>
            Explorer
          </a>
        </div>
        <div className={styles.card}>
          <img
            src="src/assets/icons/profile.png"
            alt="Profile"
            className={styles.card_icon}
          />
          <h2>Profil</h2>
          <p>Gérez vos informations de compte.</p>
          <a href="profile" className={styles.card_link}>
            Explorer
          </a>
        </div>
      </div>
    </div>
  )
}
