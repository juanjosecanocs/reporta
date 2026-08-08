import type { ReactNode } from 'react';
import logo from '../../assets/logo.png';
import wordmark from '../../assets/wordmark.png';

interface Props {
  onLogoClick?: () => void;
  subtitulo?: string;
  accionesDerecha?: ReactNode;
}

export function Header({ onLogoClick, subtitulo = 'Incidencias ciudadanas · Almería', accionesDerecha }: Props) {
  return (
    <header className="flex items-center justify-between gap-3 bg-primary px-4 py-2 shadow-md">
      <button
        type="button"
        onClick={onLogoClick}
        disabled={!onLogoClick}
        className="flex items-center gap-2 disabled:cursor-default"
        aria-label="Volver al mapa"
      >
        <img src={logo} alt="" className="h-9 w-9" />
        <img src={wordmark} alt="REPORTA" className="h-6 w-auto" />
      </button>
      <div className="flex items-center gap-3">
        <span className="hidden text-sm text-white/80 sm:inline">{subtitulo}</span>
        {accionesDerecha}
      </div>
    </header>
  );
}
