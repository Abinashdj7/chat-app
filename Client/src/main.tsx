import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { ChatProvider } from './ChatProvider.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <ChatProvider>
    <App />
  </ChatProvider>
)
