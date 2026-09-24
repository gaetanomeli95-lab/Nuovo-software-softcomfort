import { Component, type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class AppErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Nessun dato cliente viene inviato fuori dall'app: il dettaglio resta solo in console.
    console.error('Errore applicazione', error, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="grid min-h-screen place-items-center bg-[#d8ccc1] p-6 font-sans text-[#272120]">
        <div className="w-full max-w-lg rounded-[28px] border border-[#d7cbc0] bg-[#fffefd] p-7 text-center shadow-[0_24px_70px_rgba(55,42,34,0.16)]">
          <img
            src="/softcomfort-logo.png"
            alt="Soft Comfort"
            className="mx-auto h-16 w-44 object-contain"
          />
          <h1 className="mt-5 text-2xl font-extrabold tracking-[-0.03em]">
            Si è verificato un problema
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-[#746a64]">
            La schermata non è stata caricata correttamente. Ricarica il gestionale:
            i dati già salvati sul server non vengono cancellati.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-[#f20f1f] px-5 text-sm font-extrabold text-white transition-opacity hover:opacity-90"
          >
            Ricarica gestionale
          </button>
        </div>
      </div>
    );
  }
}
