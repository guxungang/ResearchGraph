import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@xyflow/react/style.css';
import './styles.css';
import { StoreProvider } from './data/store.tsx';
import { App } from './App.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <StoreProvider>
      <App />
    </StoreProvider>
  </StrictMode>,
);
