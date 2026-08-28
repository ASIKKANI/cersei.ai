import React, { useState } from 'react';
import { Activity, ExternalLink, Zap, Lock, ShieldCheck, Scale, AlertOctagon, Copy, Check, X, Key, CheckCircle } from 'lucide-react';
import type { ActivityLog } from '../types';
import { DecryptedText } from './reactbits/DecryptedText';

interface ActivityFeedProps {
  logs: ActivityLog[];
  chainName?: string;
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ logs, chainName = 'Ethereum Sepolia' }) => {
  const [selectedProofLog, setSelectedProofLog] = useState<ActivityLog | null>(null);
  const [copied, setCopied] = useState(false);

  const getIcon = (type: ActivityLog['type']) => {
    switch (type) {
      case 'ESCROW_LOCKED':
        return <Lock className="h-4 w-4 text-amber-500" />;
      case 'BID_PLACED':
        return <Zap className="h-4 w-4 text-sky-500" />;
      case 'EXECUTION_SUBMITTED':
        return <ShieldCheck className="h-4 w-4 text-blue-500" />;
      case 'JURY_VOTED':
        return <Scale className="h-4 w-4 text-purple-500" />;
      case 'SETTLED':
        return <ShieldCheck className="h-4 w-4 text-emerald-500" />;
      case 'SLASHED':
        return <AlertOctagon className="h-4 w-4 text-rose-500" />;
      default:
        return <Activity className="h-4 w-4 text-slate-500" />;
    }
  };

  const getExplorerBaseUrl = () => {
    if (chainName.includes('Base')) {
      return 'https://sepolia.basescan.org/tx/';
    }
    return 'https://sepolia.etherscan.io/tx/';
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="activity" className="py-16 bg-white border-t border-sky-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-sky-600 mb-1">
              <span>📜</span>
              <span>{chainName} Telemetry & Proof Stream</span>
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Real-Time Protocol Ledger
            </h2>
            <p className="mt-1 text-sm text-slate-500 max-w-xl">
              Live cryptographic event stream of agent transactions, escrow locks, jury votes, and settlement proofs.
            </p>
          </div>
        </div>

        {/* Stream List */}
        <div className="rounded-3xl border border-slate-200 bg-slate-50/50 p-4 sm:p-6 shadow-xs backdrop-blur-xl">
          {logs.length > 0 ? (
            <div className="space-y-3 max-h-[460px] overflow-y-auto pr-2">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 text-xs transition hover:border-sky-300 hover:shadow-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-100">
                      {getIcon(log.type)}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                        <span>{log.title}</span>
                        {log.amountEth && (
                          <span className="rounded-md bg-sky-50 px-2 py-0.5 text-xs font-extrabold text-sky-700 border border-sky-200">
                            {log.amountEth} ETH
                          </span>
                        )}
                        {log.isOnChain && (
                          <span className="rounded-md bg-emerald-50 px-1.5 py-0.2 text-[9px] font-extrabold text-emerald-700 border border-emerald-200">
                            ON-CHAIN
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{log.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 text-[11px] font-mono text-slate-400 shrink-0">
                    <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                    
                    {/* View Proof & Explorer Buttons */}
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setSelectedProofLog(log)}
                        className="inline-flex items-center gap-1 rounded-lg border border-sky-200 bg-sky-50 px-2.5 py-1 text-[11px] font-bold text-sky-700 hover:bg-sky-100 transition cursor-pointer"
                        title="Inspect Cryptographic State Proof"
                      >
                        <Key className="h-3 w-3" />
                        <span>Inspect Proof</span>
                      </button>

                      {log.isOnChain && (
                        <a
                          href={`${getExplorerBaseUrl()}${log.txHash}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-slate-600 hover:border-sky-300 hover:text-sky-700 transition"
                          title="View on Block Explorer"
                        >
                          <DecryptedText text={log.txHash.slice(0, 8) + '...'} speed={25} />
                          <ExternalLink className="h-3 w-3 text-slate-400" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400">
              <Activity className="mx-auto h-8 w-8 text-slate-300 mb-2 animate-pulse" />
              <p className="text-xs font-bold text-slate-700">No Network Events Yet</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Activity will stream here in real-time as tasks and agents interact.
              </p>
            </div>
          )}
        </div>

      </div>

      {/* Cryptographic State Proof Modal */}
      {selectedProofLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
          <div className="relative w-full max-w-lg rounded-3xl border border-sky-100 bg-white p-6 shadow-2xl shadow-sky-500/10">
            <button
              onClick={() => setSelectedProofLog(null)}
              className="absolute right-4 top-4 rounded-full p-1 text-slate-400 hover:bg-slate-100 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2.5 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-100 text-sky-600">
                <Key className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">{selectedProofLog.title}</h3>
                <p className="text-[11px] text-slate-500">
                  {selectedProofLog.isOnChain ? 'On-Chain Broadcasted Transaction' : 'Autonomous Machine State Proof'}
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                  {selectedProofLog.isOnChain ? 'On-Chain Transaction Hash' : 'Cryptographic Commitment Hash'}
                </label>
                <div className="flex items-center justify-between bg-slate-900 p-2.5 rounded-xl border border-slate-800 font-mono text-sky-300">
                  <span className="truncate">{selectedProofLog.txHash}</span>
                  <button
                    onClick={() => handleCopy(selectedProofLog.txHash)}
                    className="text-slate-400 hover:text-sky-400 pl-2 cursor-pointer"
                  >
                    {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-2 text-[11px] text-slate-700">
                <div className="flex justify-between">
                  <span className="text-slate-400">Event Type:</span>
                  <span className="font-bold text-slate-900">{selectedProofLog.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Timestamp:</span>
                  <span className="font-mono">{new Date(selectedProofLog.timestamp).toISOString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Execution Layer:</span>
                  <span className="font-bold text-sky-800">
                    {selectedProofLog.isOnChain ? 'Layer 1 / Layer 2 On-Chain EVM' : 'Autonomous Machine-to-Machine Mesh'}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-slate-200">
                  <span className="text-slate-400">Cryptographic Integrity:</span>
                  <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
                    <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                    <span>VERIFIED_BY_QUORUM</span>
                  </span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                {selectedProofLog.isOnChain ? (
                  <a
                    href={`${getExplorerBaseUrl()}${selectedProofLog.txHash}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-sky-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-sky-500 transition"
                  >
                    <span>View on {chainName.includes('Base') ? 'BaseScan' : 'Etherscan'}</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                ) : (
                  <button
                    type="button"
                    onClick={() => setSelectedProofLog(null)}
                    className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-slate-800 transition cursor-pointer"
                  >
                    Done Inspecting
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

    </section>
  );
};
