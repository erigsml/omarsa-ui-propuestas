import '@ant-design/v5-patch-for-react-19';
import '@fontsource-variable/inter';
import './estilos.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';

const raiz = document.getElementById('raiz');
if (!raiz) throw new Error('Falta el contenedor #raiz');
createRoot(raiz).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
