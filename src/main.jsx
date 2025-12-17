import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

console.log(
  "%c Created by %c babitampan ",
  "background: #333; color: #fff; padding: 5px; border-radius: 4px 0 0 4px; font-weight: bold;",
  "background: #6366f1; color: #fff; padding: 5px; border-radius: 0 4px 4px 0; font-weight: bold;"
);
console.log(
  "%c ✨ power by love and peace ✌️ ",
  "color: #ec4899; font-style: italic; font-size: 12px; margin-top: 5px;"
);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
