import React, { useState } from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './App'
import { WalletProvider } from './context/AuthContext'

const node = document.getElementById('root') as HTMLElement;
const root = ReactDOM.createRoot(node);

root.render(
  <React.StrictMode>
    <WalletProvider>
      <App />
    </WalletProvider>
  </React.StrictMode>
)
