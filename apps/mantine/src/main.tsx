import '@fontsource-variable/inter';
import '@mantine/core/styles.css';
import '@mantine/charts/styles.css';
import '@mantine/notifications/styles.css';
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
