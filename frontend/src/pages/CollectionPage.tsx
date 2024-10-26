import { useState } from 'react'
import styles from './CollectionPage.module.css'
import useApiMethods from '@/context/useApiMethods' // Ajustez le chemin si nécessaire

export const CollectionPage = () => {
  const [collectionPokemonID, setCollectionPokemonID] = useState('')
  const [mintCollectionId, setMintCollectionId] = useState('') // État pour l'ID de la collection à mint
  const {
    handleCreateCollection,
    handleMintCard, // Ajout de la méthode handleMintCard
    responseMessage,
    error,
    collections,
    loading,
  } = useApiMethods()

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    await handleCreateCollection(collectionPokemonID) // Appel de la méthode pour créer la collection
    setCollectionPokemonID('') // Réinitialise le champ après soumission
  }

  const handleMintSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    // Appelez la méthode pour mint une carte
    await handleMintCard(mintCollectionId)
    setMintCollectionId('') // Réinitialise le champ après soumission
  }

  return (
    <div className={styles.collectionPage}>
      <h1>Collections</h1>

      {/* Formulaire pour créer une collection */}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={collectionPokemonID}
          onChange={e => setCollectionPokemonID(e.target.value)}
          placeholder="Enter Pokémon Collection ID"
          required
        />
        <button type="submit" disabled={loading}>
          'Create Collection'
        </button>
      </form>

      {/* Formulaire pour mint une carte */}
      <form onSubmit={handleMintSubmit}>
        <input
          type="text"
          value={mintCollectionId}
          onChange={e => setMintCollectionId(e.target.value)}
          placeholder="Enter Collection ID to Mint"
          required
        />
        <button type="submit" disabled={loading}>
          'Mint Card'
        </button>
      </form>

      {responseMessage && <p>{responseMessage}</p>}
      {error && <p className={styles.error}>{error}</p>}

      <h2>Your Collections:</h2>
      <ul>
        {collections.map(collection => (
          <li key={collection.id}>{collection.name}</li> // Assurez-vous d'utiliser la bonne clé
        ))}
      </ul>
    </div>
  )
}
