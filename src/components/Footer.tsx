import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-sky-100 bg-white py-12 mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl overflow-hidden shadow-sm">
              <img src="/logo.svg" alt="Cersei.ai" className="h-full w-full object-contain" />
            </div>
            <div>
              <span className="text-base font-black tracking-tight text-slate-900">
                cersei<span className="text-sky-600">.ai</span>
              </span>
              <p className="text-xs text-slate-500">Autonomous Machine-to-Machine Financial Rails</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-slate-500">
            <a
              href="https://sepolia.basescan.org"
              target="_blank"
              rel="noreferrer"
              className="hover:text-sky-600 transition"
            >
              BaseScan Explorer
            </a>
            <a
              href="https://sepolia.etherscan.io"
              target="_blank"
              rel="noreferrer"
              className="hover:text-sky-600 transition"
            >
              Sepolia Etherscan
            </a>
            <a
              href="https://faucets.chain.link/base-sepolia"
              target="_blank"
              rel="noreferrer"
              className="hover:text-sky-600 transition"
            >
              Chainlink Faucet
            </a>
            <a
              href="https://console.groq.com"
              target="_blank"
              rel="noreferrer"
              className="hover:text-sky-600 transition"
            >
              Groq Cloud LPU
            </a>
          </div>

          <div className="text-xs text-slate-400">
            © 2026 Cersei.ai Protocol. Open Financial OS.
          </div>

        </div>

      </div>
    </footer>
  );
};
