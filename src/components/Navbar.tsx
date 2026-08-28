import React from 'react';
import { Wallet, Sparkles, RefreshCw, Layers, UserPlus, Cpu } from 'lucide-react';

interface NavbarProps {
  activeTab: 'overview' | 'marketplace' | 'pipeline' | 'jury' | 'register' | 'ledger';
  setActiveTab: (tab: 'overview' | 'marketplace' | 'pipeline' | 'jury' | 'register' | 'ledger') => void;
  onOpenTaskModal: () => void;
  onOpenMLModal: () => void;
  onSeedDemo: () => void;
  onReset: () => void;
  humanAddress: `0x${string}` | null;
  humanBalanceEth: string;
  chainName?: string;
  isWalletConnected: boolean;
  onConnectWallet: () => void;
  agentCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenTaskModal,
  onOpenMLModal,
  onSeedDemo,
  onReset,
  humanAddress,
  humanBalanceEth,
  chainName = 'Sepolia Testnet',
  isWalletConnected,
  onConnectWallet,
  agentCount,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-sky-100/80 bg-white/85 backdrop-blur-xl transition-all">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        
        {/* Brand Logo with Custom Logo Icon */}
        <div
          onClick={() => setActiveTab('overview')}
          className="flex items-center gap-3 cursor-pointer select-none group"
        >
          <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl overflow-hidden shadow-md shadow-sky-500/25 transition-transform group-hover:scale-105">
            <img
              src="/logo.svg"
              alt="Cersei.ai Logo"
              className="h-full w-full object-contain"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black tracking-tight text-slate-900">
                cersei<span className="text-sky-600">.ai</span>
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-sky-200 bg-sky-50 px-2.5 py-0.5 text-[10px] font-bold text-sky-700">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {chainName}
              </span>
            </div>
          </div>
        </div>

        {/* Spacious Tab Navigation */}
        <nav className="hidden lg:flex items-center gap-1 rounded-full border border-slate-200/80 bg-slate-50/80 p-1 text-xs font-bold text-slate-600">
          <button
            onClick={() => setActiveTab('overview')}
            className={`rounded-full px-4 py-1.5 transition cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-white text-sky-600 shadow-xs'
                : 'hover:text-sky-600'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('pipeline')}
            className={`rounded-full px-4 py-1.5 transition cursor-pointer ${
              activeTab === 'pipeline'
                ? 'bg-white text-sky-600 shadow-xs'
                : 'hover:text-sky-600'
            }`}
          >
            Live Pipeline
          </button>
          <button
            onClick={() => setActiveTab('marketplace')}
            className={`rounded-full px-4 py-1.5 transition cursor-pointer ${
              activeTab === 'marketplace'
                ? 'bg-white text-sky-600 shadow-xs'
                : 'hover:text-sky-600'
            }`}
          >
            Marketplace
          </button>
          <button
            onClick={() => setActiveTab('jury')}
            className={`rounded-full px-4 py-1.5 transition cursor-pointer ${
              activeTab === 'jury'
                ? 'bg-white text-sky-600 shadow-xs'
                : 'hover:text-sky-600'
            }`}
          >
            Jury Arena
          </button>
          <button
            onClick={() => setActiveTab('register')}
            className={`inline-flex items-center gap-1 rounded-full px-4 py-1.5 transition cursor-pointer ${
              activeTab === 'register'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'hover:text-sky-600 font-extrabold text-sky-700 bg-sky-50'
            }`}
          >
            <UserPlus className="h-3 w-3" />
            <span>Register Agent</span>
          </button>
          <button
            onClick={() => setActiveTab('ledger')}
            className={`rounded-full px-4 py-1.5 transition cursor-pointer ${
              activeTab === 'ledger'
                ? 'bg-white text-sky-600 shadow-xs'
                : 'hover:text-sky-600'
            }`}
          >
            Ledger
          </button>
        </nav>

        {/* Right Actions & MetaMask Connect */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* ML Intelligence Button */}
          <button
            onClick={onOpenMLModal}
            className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50/80 px-3 py-1.5 text-xs font-extrabold text-indigo-700 hover:bg-indigo-100 transition cursor-pointer shadow-2xs"
            title="Open Live Machine Learning Risk & Pricing Engine"
          >
            <Cpu className="h-3.5 w-3.5 text-indigo-600" />
            <span>ML Engine</span>
          </button>

          {/* Post Task Button */}
          <button
            onClick={onOpenTaskModal}
            className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-sky-200 bg-sky-50/70 px-3 py-1.5 text-xs font-bold text-sky-700 transition hover:bg-sky-100 cursor-pointer"
          >
            <Layers className="h-3.5 w-3.5 text-sky-600" />
            <span>Post Bounty</span>
          </button>

          {/* Real MetaMask Wallet Connect Button */}
          {isWalletConnected && humanAddress ? (
            <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50/60 px-3 py-1.5 shadow-2xs">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500 text-white">
                <Wallet className="h-3 w-3" />
              </div>
              <div className="text-left">
                <div className="text-[11px] font-bold text-emerald-950 font-mono">
                  {humanBalanceEth} <span className="text-emerald-700 font-semibold">ETH</span>
                </div>
                <div className="text-[9px] text-emerald-800 font-mono">
                  {humanAddress.slice(0, 6)}...{humanAddress.slice(-4)}
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={onConnectWallet}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-sky-600 to-sky-500 px-3.5 py-2 text-xs font-bold text-white shadow-md shadow-sky-500/20 transition hover:from-sky-500 hover:to-sky-400 cursor-pointer"
            >
              <Wallet className="h-3.5 w-3.5" />
              <span>Connect MetaMask</span>
            </button>
          )}

          {/* Quick Clean-State Tools */}
          {agentCount > 0 ? (
            <button
              onClick={onReset}
              className="rounded-xl border border-slate-200 p-2 text-slate-400 transition hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600 cursor-pointer"
              title="Reset state to empty clean slate"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
          ) : (
            <button
              onClick={onSeedDemo}
              className="hidden md:inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-slate-500 hover:bg-sky-50 hover:text-sky-700 hover:border-sky-200 transition cursor-pointer"
              title="Seed 4 demo agents with live testnet accounts"
            >
              <Sparkles className="h-3 w-3 text-sky-500" />
              <span>Seed Demo</span>
            </button>
          )}

        </div>

      </div>
    </header>
  );
};
