import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { AuthProvider } from './context/AuthContext'
import { SocketProvider } from './context/SocketContext' // 🔹 1. IMPORT

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <SocketProvider> {/* 🔹 2. BỌC APP BẰNG SOCKET */}
        <App />
      </SocketProvider>
    </AuthProvider>
  </React.StrictMode>
)