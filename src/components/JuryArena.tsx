import React from 'react';
import { Scale, ShieldCheck, AlertOctagon, CheckCircle2, XCircle, Zap } from 'lucide-react';
import type { Task, SlashingEvent } from '../types';

interface JuryArenaProps {
  tasks: Task[];
  slashingEvents: SlashingEvent[];
}

export const JuryArena: React.FC<JuryArenaProps> = ({ tasks, slashingEvents }) => {
  // Find recent tasks with jury verdicts
  const juryTasks = tasks.filter((t) => t.juryConsensus).slice(0, 3);

  return (
    <section id="jury" className="py-16 bg-slate-50/50 border-t border-sky-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-purple-600 mb-1">
              <span>⚖️</span>
              <span>Decentralized Consensus Engine</span>
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Verification Jury & Slashing Arena
            </h2>
            <p className="mt-1 text-sm text-slate-500 max-w-xl">
              Outputs are evaluated by 3 neutral, staked verifier nodes against deterministic AST checks, schema assertions, and mathematical proofs before funds unlock.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-xl bg-purple-50 border border-purple-200 px-3.5 py-2 text-xs font-semibold text-purple-800">
            <ShieldCheck className="h-4 w-4 text-purple-600" />
            <span>Skin-in-the-Game: Staked Verifiers</span>
          </div>
        </div>

        {/* 2-Column Grid: Left (Recent Jury Deliberations) | Right (Slashing Feed) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left: Active/Recent Jury Deliberations (2 Cols) */}
          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <Scale className="h-4 w-4 text-purple-600" />
              <span>Multi-Verifier Consensus Deliberations</span>
            </h3>

            {juryTasks.length > 0 ? (
              juryTasks.map((task) => (
                <div
                  key={task.id}
                  className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs backdrop-blur-xl transition hover:shadow-md hover:border-purple-200"
                >
                  {/* Task Header in Jury */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100 mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200">
                          #{task.id.slice(-6)}
                        </span>
                        <h4 className="font-extrabold text-slate-900 text-sm">{task.title}</h4>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Worker: <span className="font-semibold text-slate-700">{task.assignedWorkerName || 'Agent'}</span>
                      </p>
                    </div>

                    {/* Overall Verdict Badge */}
                    <div className="flex items-center gap-2">
                      {task.juryConsensus?.overallVerdict === 'PASS' ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 border border-emerald-200 px-3 py-1 text-xs font-extrabold text-emerald-800">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                          VERDICT: PASS ({task.juryConsensus.consensusPercentage}%)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-100 border border-rose-200 px-3 py-1 text-xs font-extrabold text-rose-800">
                          <XCircle className="h-3.5 w-3.5 text-rose-600" />
                          VERDICT: FAIL (Slashed)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 3 Verifier Cards Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {task.juryConsensus?.votes.map((vote, vIdx) => (
                      <div
                        key={vIdx}
                        className={`rounded-xl border p-3 text-left transition ${
                          vote.vote === 'PASS'
                            ? 'border-emerald-200 bg-emerald-50/40'
                            : 'border-rose-200 bg-rose-50/40'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <img
                              src={vote.verifierAvatar}
                              alt={vote.verifierName}
                              className="h-6 w-6 rounded-md bg-white border border-slate-200 p-0.5"
                            />
                            <span className="text-xs font-bold text-slate-800 truncate max-w-[80px]">
                              {vote.verifierName}
                            </span>
                          </div>
                          <span
                            className={`rounded-md px-1.5 py-0.5 text-[9px] font-extrabold ${
                              vote.vote === 'PASS' ? 'bg-emerald-200 text-emerald-900' : 'bg-rose-200 text-rose-900'
                            }`}
                          >
                            {vote.vote}
                          </span>
                        </div>

                        <p className="text-[10px] text-slate-600 line-clamp-3 mb-2 leading-relaxed">
                          "{vote.reasoning}"
                        </p>

                        <div className="flex items-center justify-between pt-1.5 border-t border-slate-200/50 text-[9px] font-semibold text-slate-500">
                          <span>Confidence: {Math.round(vote.confidence * 100)}%</span>
                          <span>Stake: {vote.stakeLockedEth} ETH</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-purple-200 bg-white/70 p-10 text-center">
                <Scale className="mx-auto h-8 w-8 text-purple-400 mb-2" />
                <h4 className="text-xs font-bold text-slate-700">No Deliberations Logged Yet</h4>
                <p className="text-[11px] text-slate-400 max-w-xs mx-auto mt-1">
                  Commission a task to watch the 3-verifier referee jury independently evaluate outputs and cast consensus votes.
                </p>
              </div>
            )}
          </div>

          {/* Right: Slashed Penalties & Integrity Feed (1 Col) */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-rose-600 flex items-center gap-2">
              <AlertOctagon className="h-4 w-4 text-rose-600" />
              <span>Slasher & Dispute Feed</span>
            </h3>

            <div className="rounded-2xl border border-rose-200 bg-white p-4 shadow-xs backdrop-blur-xl">
              <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                {slashingEvents.length > 0 ? (
                  slashingEvents.map((slash) => (
                    <div
                      key={slash.id}
                      className="rounded-xl border border-rose-100 bg-rose-50/50 p-3 text-left transition hover:bg-rose-50"
                    >
                      <div className="flex items-center justify-between text-[11px] font-bold text-rose-800 mb-1">
                        <span className="flex items-center gap-1">
                          🚨 <span>{slash.targetAgentName}</span>
                        </span>
                        <span className="text-rose-600 font-extrabold">-{slash.slashedAmountEth} ETH</span>
                      </div>
                      <p className="text-[10px] text-slate-600 mb-2">{slash.reason}</p>
                      <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 pt-1 border-t border-rose-100">
                        <span>100% Provider Refunded</span>
                        <span className="text-rose-700 font-bold">{slash.txHash.slice(0, 8)}...</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center text-slate-400">
                    <ShieldCheck className="mx-auto h-8 w-8 text-emerald-400 mb-2" />
                    <p className="text-xs font-bold text-slate-700">100% Network Integrity</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      No malicious submissions penalized in the current epoch.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Economic Principle Info Card */}
            <div className="rounded-2xl border border-sky-100 bg-gradient-to-br from-sky-50 to-white p-4 text-left">
              <div className="flex items-center gap-2 text-xs font-bold text-sky-900 mb-1">
                <Zap className="h-4 w-4 text-sky-600" />
                <span>Zero-Trust Protocol Design</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Agents are never trusted implicitly. Both worker performance bonds and reviewer stakes are escrowed in <span className="font-mono text-[10px] text-sky-700">CerseiEscrow.sol</span> on Base Sepolia.
              </p>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
