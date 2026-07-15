import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { SeatSocketProvider } from '@/state/SeatSocketProvider'
import { Toaster } from '@/components/ui/sonner'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SeatSocketProvider>
      <App />
    </SeatSocketProvider>
    <Toaster position="top-right" />
  </StrictMode>,
)
