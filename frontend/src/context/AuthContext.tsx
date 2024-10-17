import React, { useEffect, useMemo, useRef, useState, createContext, useContext, ReactNode } from 'react';
import * as ethereum from '@/lib/ethereum';
import * as main from '@/lib/main';

// Créer un contexte global pour stocker le portefeuille
interface WalletContextType {
  details: ethereum.Details | undefined;
  contract: main.Main | undefined;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

// Un hook personnalisé pour accéder au contexte du portefeuille
export const useWalletContext = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWalletContext must be used within a WalletProvider');
  }
  return context;
};
// Le composant fournisseur pour encapsuler votre application
export const WalletProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [details, setDetails] = useState<ethereum.Details | undefined>();
  const [contract, setContract] = useState<main.Main | undefined>();

  type Canceler = () => void;

  const useAffect = (
    asyncEffect: () => Promise<Canceler | void>,
    dependencies: any[] = []
  ) => {
    const cancelerRef = useRef<Canceler | void>();

    useEffect(() => {
      asyncEffect()
        .then((canceler) => (cancelerRef.current = canceler))
        .catch((error) => console.warn('Uncaught error', error));

      return () => {
        if (cancelerRef.current) {
          cancelerRef.current();
          cancelerRef.current = undefined;
        }
      };
    }, dependencies);
  };

  useAffect(async () => {
    const details_ = await ethereum.connect('metamask');
    if (!details_) return;
    setDetails(details_);
    const contract_ = await main.init(details_);
    if (!contract_) return;
    setContract(contract_);
  }, []);

  // Fournir les valeurs du portefeuille via le contexte
  const value = useMemo(() => {
    return { details, contract };
  }, [details, contract]);

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};

// Utiliser le hook useWallet dans un composant si nécessaire
export const useWallet = () => {
  const { details, contract } = useWalletContext();

  useEffect(() => {
    if (details && contract) {
      console.log('Wallet details and contract:', details, contract);
    }
  }, [details, contract]);

  return { details, contract };
};
