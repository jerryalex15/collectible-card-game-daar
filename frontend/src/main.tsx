import React, { useState } from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './App'
import { WalletProvider } from './context/AuthContext'
import Modal from 'react-modal';

const node = document.getElementById('root') as HTMLElement;
const root = ReactDOM.createRoot(node);
Modal.setAppElement('#root'); 

root.render(
    <WalletProvider>
      <React.StrictMode>
        <App />
      </React.StrictMode>
    </WalletProvider>
)
