import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/tailwind.css'
import './styles/globals.css'
import App from './App.tsx'
import { AdminApp } from './admin/AdminApp.tsx'
import { MunicipioProvider } from './context/MunicipioContext.tsx'

const esRutaAdmin = window.location.pathname.startsWith('/admin')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {esRutaAdmin ? (
      <AdminApp />
    ) : (
      <MunicipioProvider>
        <App />
      </MunicipioProvider>
    )}
  </StrictMode>,
)
