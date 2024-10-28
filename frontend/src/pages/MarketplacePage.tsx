import { useEffect, useState } from 'react';
import global_styles from '@/styles.module.css';
import page_styles from './MarketplacePage.module.css';
import CardList from '@/components/cards/CardList';
import useApiMethods from '@/context/useApiMethods';

export const MarketplacePage = () => {

  const { fetchCardsOnSale, loading, error, cardsOnSale, handleBuyCard } = useApiMethods();
  const [cards, setCards] = useState([]);

  // Fetch cards on initial mount
  useEffect(() => {
    const loadCards = async () => {
      await fetchCardsOnSale();
    };
    loadCards();
  }, [fetchCardsOnSale]); // Only depend on fetchCardsOnSale

  // Update cards whenever cardsOnSale changes
  useEffect(() => {
    setCards(cardsOnSale);
  }, [cardsOnSale]);

  // Function to handle buying a card

  return (
    <div className={page_styles.marketplacePage}>
      <h1>Marketplace</h1>
      {loading ? (
        <p>Loading cards...</p>
      ) : (
        <>
          {error && <p className={global_styles.error}>{error}</p>}
          <CardList cards={cards} onAction={handleBuyCard} />
        </>
      )}
    </div>
  );
};

export default MarketplacePage;