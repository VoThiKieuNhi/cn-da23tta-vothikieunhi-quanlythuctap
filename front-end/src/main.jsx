import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/inter/600.css'
import '@fontsource/inter/700.css'
import '@fontsource/poppins/500.css'
import '@fontsource/poppins/600.css'
import '@fontsource/poppins/700.css'
import './assets/css/style.css'
import App from './App.jsx'
import './assets/css/theme.css'
import './assets/css/portal-shell.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
