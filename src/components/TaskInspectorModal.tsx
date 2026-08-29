import React from 'react';
import { X, ExternalLink, ShieldCheck, Scale, Zap, FileText, Code2, Clock } from 'lucide-react';
import { Scanner } from './reactbits/Scanner';
import type { Task } from '../types';

interface TaskInspectorModalProps {
  task: Task | null;
  onClose: () => void;
  chainName?: string;
}

export const TaskInspectorModal: React.FC<TaskInspectorModalProps> = ({
  task,
  onClose,
  chainName = 'Sepolia Testnet',
}) => {
  if (!task) return null;

  const getExplorerBaseUrl = () => {
    if (chainName.includes('Ethereum') || chainName.includes('Sepolia Testnet')) {
      return 'https://sepolia.etherscan.io/tx/';
    }
    return 'https://sepolia.basescan.org/tx/';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-md">
      <div className="relative w-full max-w-3xl rounded-3xl border border-sky-200 bg-white p-6 sm:p-8 shadow-2xl shadow-sky-500/15 max-h-[92vh] overflow-y-auto">
        
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="rounded-md bg-sky-50 border border-sky-200 px-2 py-0.5 text-xs font-bold text-sky-800">
                TASK #{task.id.slice(-6)}
              </span>
              <span
                className={`rounded-md px-2 py-0.5 text-xs font-extrabold ${
                  task.status === 'settled'
                    ? 'bg-emerald-100 text-emerald-800'
                    : task.status === 'slashed'
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {task.status.toUpperCase()}
              </span>
            </div>
            <h3 className="text-xl font-extrabold text-slate-900">{task.title}</h3>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-400 font-semibold">Escrow Cap</span>
            <div className="text-lg font-extrabold text-sky-700">{task.budgetEth} ETH</div>
          </div>
        </div>

        {/* 2 Column Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          
          {/* Left: Task Specs */}
          <div className="space-y-3 rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4 text-xs">
            <h4 className="font-extrabold text-slate-800 flex items-center gap-1.5">
              <FileText className="h-4 w-4 text-sky-600" />
              <span>Specification & Invariants</span>
            </h4>
            <p className="text-slate-600 leading-relaxed">{task.description}</p>
            <div className="pt-2 border-t border-slate-200/60">
              <span className="font-semibold text-slate-500">Output Standard: </span>
              <span className="font-mono text-slate-800">{task.outputRequirements}</span>
            </div>
          </div>

          {/* Right: On-Chain Escrow & Worker */}
          <div className="space-y-3 rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4 text-xs">
            <h4 className="font-extrabold text-slate-800 flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>On-Chain Settlement State</span>
            </h4>
            <div>
              <span className="text-slate-400">Assigned Worker: </span>
              <span className="font-bold text-slate-900">{task.assignedWorkerName || 'Bidding in progress...'}</span>
            </div>
            <div>
              <span className="text-slate-400">Escrow Lock Tx: </span>
              <a
                href={`${getExplorerBaseUrl()}${task.escrowTxHash}`}
                target="_blank"
                rel="noreferrer"
                className="font-mono text-sky-600 hover:underline inline-flex items-center gap-1"
              >
                <span>{task.escrowTxHash?.slice(0, 14)}...</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            {task.settlementTxHash && (
              <div>
                <span className="text-slate-400">Settlement Tx: </span>
                <a
                  href={`${getExplorerBaseUrl()}${task.settlementTxHash}`}
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-emerald-600 hover:underline inline-flex items-center gap-1"
                >
                  <span>{task.settlementTxHash.slice(0, 14)}...</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            )}
          </div>

        </div>

        {/* Competing Bids Section */}
        {task.bids.length > 0 && (
          <div className="mb-6">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5 flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-sky-500" />
              <span>Competing Agent Reverse Auction Bids ({task.bids.length})</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {task.bids.map((bid) => (
                <div
                  key={bid.id}
                  className={`flex items-center justify-between p-3 rounded-xl border text-xs ${
                    bid.agentId === task.assignedWorkerId
                      ? 'border-sky-400 bg-sky-50/80 shadow-xs'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <img src={bid.agentAvatar} alt={bid.agentName} className="h-7 w-7 rounded-lg bg-white p-0.5 border" />
                    <div>
                      <div className="font-bold text-slate-900 flex items-center gap-1">
                        <span>{bid.agentName}</span>
                        {bid.agentId === task.assignedWorkerId && (
                          <span className="rounded-md bg-sky-200 px-1 py-0.2 text-[8px] font-extrabold text-sky-900">
                            WINNER
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400">Reputation: {bid.agentReputation}/100</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-extrabold text-slate-900">{bid.proposedCostEth} ETH</div>
                    <div className="text-[10px] text-slate-400">ETA: {bid.estimatedTimeSec}s</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Submitted Output JSON Deliverable with Holographic Scanner */}
        {task.executionResult && (
          <div className="mb-6 relative">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Code2 className="h-3.5 w-3.5 text-indigo-500" />
                <span>Worker Execution Deliverable & AST Proof</span>
              </h4>
              <span className="text-[10px] font-mono text-slate-400">
                Latency: {task.executionResult.executionTimeMs}ms | Engine: {task.executionResult.modelUsed}
              </span>
            </div>

            <div className="relative rounded-2xl border border-slate-800 bg-slate-950 p-4 text-[11px] font-mono text-sky-300 overflow-hidden shadow-xl shadow-sky-950/40">
              <div className="absolute inset-0 pointer-events-none opacity-20">
                <Scanner
                  color1="#0284c7"
                  color2="#38bdf8"
                  color3="#ffffff"
                  speed={0.4}
                  sweepSpeed={0.2}
                  scanline={true}
                  opacity={0.3}
                />
              </div>
              <pre className="relative z-10 overflow-x-auto max-h-52 leading-relaxed">
                {task.executionResult.rawText}
              </pre>
            </div>
          </div>
        )}

        {/* Jury Verification Consensus Details */}
        {task.juryConsensus && (
          <div className="mb-6">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5 flex items-center gap-1.5">
              <Scale className="h-3.5 w-3.5 text-purple-500" />
              <span>Jury Consensus Voting Records</span>
            </h4>
            <div className="space-y-2">
              {task.juryConsensus.votes.map((v, i) => (
                <div key={i} className="flex items-start justify-between gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50/80 text-xs">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-slate-900">{v.verifierName}</span>
                      <span
                        className={`rounded-md px-1.5 py-0.2 text-[9px] font-extrabold ${
                          v.vote === 'PASS' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {v.vote} ({Math.round(v.confidence * 100)}% confidence)
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600">"{v.reasoning}"</p>
                  </div>
                  <span className="text-[10px] text-slate-400 shrink-0 font-mono">Staked: {v.stakeLockedEth} ETH</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Event Logs */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-slate-400" />
            <span>Autonomous State Machine Trace</span>
          </h4>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-1 text-[10px] font-mono text-slate-600 max-h-32 overflow-y-auto">
            {task.logs.map((log, i) => (
              <div key={i}>{log}</div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
