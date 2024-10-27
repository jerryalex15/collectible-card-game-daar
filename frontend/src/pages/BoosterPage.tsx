import { useEffect, useState } from 'react'
import global_styles from '@/styles.module.css'
import page_styles from './BoosterPage.module.css'
import CardList from '@/components/cards/CardList'
import BoosterList from '@/components/boosters/BoosterList'
import useApiMethods from '@/context/useApiMethods'

export const BoosterPage = () => {
  const {
    fetchCardsOnSale,
    fetchBoosters,
    loading,
    error,
    cardsOnSale,
    boosters,
  } = useApiMethods()
  const [ownedBoosters, setOwnedBoosters] = useState([])

  useEffect(() => {
    const loadInitialData = async () => {
      await fetchCardsOnSale()
      await fetchBoosters()
    }

    loadInitialData()
  }, [])

  useEffect(() => {
    setOwnedBoosters(boosters)
  }, [boosters])

  return (
    <div className={page_styles.BoosterPage}>
      <h1>Booster</h1>

      <section>
        <h2>Acheter des boosters</h2>
        {loading ? (
          <p>Loading boosters on sale...</p>
        ) : (
          <BoosterList boosters={boosters} />
        )}
      </section>

      <section>
        <h2>Boosters possédés</h2>
        <BoosterList boosters={ownedBoosters} />
      </section>

      {error && <p className={global_styles.error}>{error}</p>}
    </div>
  )
}

export default BoosterPage
