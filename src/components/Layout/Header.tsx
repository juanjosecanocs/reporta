import logo from '../../assets/logo.png';
import wordmark from '../../assets/wordmark.png';

interface Props {
  onLogoClick?: () => void;
}

export function Header({ onLogoClick }: Props) {
  return (
    <header className="flex items-center justify-between border-b border-gray-100 bg-white px-4 py-2 shadow-sm">
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
      <span className="hidden text-sm text-gray-500 sm:inline">Incidencias ciudadanas · Almería</span>
    </header>
  );
}
