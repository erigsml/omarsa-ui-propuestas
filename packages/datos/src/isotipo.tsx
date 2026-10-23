import { MARCA } from './marca';

/** Isotipo neutro (no es el logo de ninguna empresa real): una ola dentro de un cuadrado. */
export function Isotipo({ tam = 32 }: { tam?: number }) {
  return (
    <svg width={tam} height={tam} viewBox="0 0 32 32" role="img" aria-label="Acuícola Demo" focusable="false">
      <rect width="32" height="32" rx="8" fill={MARCA.logo} />
      <path d="M6 19c3.2 0 3.2-3 6.4-3s3.2 3 6.4 3 3.2-3 6.4-3" stroke="#fff" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      <path d="M6 13c3.2 0 3.2-3 6.4-3s3.2 3 6.4 3 3.2-3 6.4-3" stroke="#fff" strokeOpacity=".55" strokeWidth="2.4" fill="none" strokeLinecap="round" />
    </svg>
  );
}
