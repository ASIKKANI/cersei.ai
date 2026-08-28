import React from 'react';
import { Layers, Zap, Scale, CheckCircle2, Clock, Eye, Lock } from 'lucide-react';
import type { Task, TaskStatus } from '../types';

interface LivePipelineProps {
  tasks: Task[];
  onSelectTask: (task: Task) => void;
  onOpenTaskModal: () => void;
}

export const LivePipeline: React.FC<LivePipelineProps> = ({
  tasks,
  onSelectTask,
  onOpenTaskModal,
}) => {
  const columns: { status: TaskStatus; label: string; icon: React.ReactNode; color: string; bg: string }[] = [
    {
      status: 'auction',
      label: '1. Reverse Auction',
      icon: <Zap className="h-4 w-4 text-sky-500" />,
      color: 'border-sky-300 text-sky-700',
      bg: 'bg-sky-50/70',
    },
    {
      status: 'escrow_locked',
      label: '2. Escrow Locked',
      icon: <Lock className="h-4 w-4 text-amber-500" />,
      color: 'border-amber-300 text-amber-700',
      bg: 'bg-amber-50/70',
    },
    {
      status: 'executing',
      label: '3. Autonomous Exec',
      icon: <Clock className="h-4 w-4 text-blue-500 animate-spin" />,
      color: 'border-blue-300 text-blue-700',
      bg: 'bg-blue-50/70',
    },
    {
      status: 'jury_deliberating',
      label: '4. Jury Consensus',
      icon: <Scale className="h-4 w-4 text-purple-500 animate-pulse" />,
      color: 'border-purple-300 text-purple-700',
      bg: 'bg-purple-50/70',
    },
    {
      status: 'settled',
      label: '5. Settled / Slashed',
      icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
      color: 'border-emerald-300 text-emerald-700',
      bg: 'bg-emerald-50/70',
    },
  ];

  return (
    <section id="pipeline" className="py-16 bg-white border-t border-sky-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-sky-600 mb-1">
              <span>⚡</span>
              <span>Real-Time State Machine</span>
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Live Autonomous Pipeline
            </h2>
            <p className="mt-1 text-sm text-slate-500 max-w-xl">
              Track tasks progressing through open auction bidding, dual-sided collateral locking, multi-angle jury deliberation, and on-chain Base Sepolia settlement.
            </p>
          </div>

          <button
            onClick={onOpenTaskModal}
            className="inline-flex items-center gap-1.5 rounded-xl border border-sky-200 bg-sky-50 px-4 py-2 text-xs font-bold text-sky-700 transition hover:bg-sky-100"
          >
            <Layers className="h-4 w-4 text-sky-600" />
            <span>+ Commission Bounty</span>
          </button>
        </div>

        {/* 5-Column Pipeline Grid */}
        {tasks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {columns.map((col) => {
              const columnTasks = tasks.filter((t) => {
                if (col.status === 'settled') {
                  return t.status === 'settled' || t.status === 'slashed';
                }
                return t.status === col.status;
              });

              return (
                <div
                  key={col.status}
                  className="flex flex-col rounded-2xl border border-slate-200 bg-slate-50/60 p-3 min-h-[360px]"
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`flex h-6 w-6 items-center justify-center rounded-lg ${col.bg}`}>
                        {col.icon}
                      </div>
                      <span className="text-xs font-bold text-slate-800">{col.label}</span>
                    </div>
                    <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-extrabold text-slate-600 shadow-2xs">
                      {columnTasks.length}
                    </span>
                  </div>

                  {/* Task Cards */}
                  <div className="flex-1 space-y-3 overflow-y-auto max-h-[500px] pr-1">
                    {columnTasks.map((task) => (
                      <div
                        key={task.id}
                        onClick={() => onSelectTask(task)}
                        className="group relative cursor-pointer rounded-xl border border-slate-200/90 bg-white p-3.5 shadow-2xs transition-all hover:border-sky-400 hover:shadow-md hover:-translate-y-0.5"
                      >
                        {/* Task Title & Category */}
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h4 className="text-xs font-bold text-slate-900 group-hover:text-sky-600 transition line-clamp-1">
                            {task.title}
                          </h4>
                          {task.status === 'slashed' ? (
                            <span className="shrink-0 rounded-md bg-rose-100 px-1.5 py-0.5 text-[9px] font-bold text-rose-700">
                              SLASHED
                            </span>
                          ) : task.status === 'settled' ? (
                            <span className="shrink-0 rounded-md bg-emerald-100 px-1.5 py-0.5 text-[9px] font-bold text-emerald-700">
                              PAID
                            </span>
                          ) : (
                            <span className="shrink-0 rounded-md bg-sky-100 px-1.5 py-0.5 text-[9px] font-bold text-sky-700">
                              LIVE
                            </span>
                          )}
                        </div>

                        <p className="text-[11px] text-slate-500 line-clamp-2 mb-3">
                          {task.description}
                        </p>

                        {/* Escrow Budget & Bids Info */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[10px]">
                          <div className="font-semibold text-slate-700">
                            Escrow: <span className="font-extrabold text-sky-700">{task.budgetEth} ETH</span>
                          </div>
                          {task.assignedWorkerName ? (
                            <div className="text-slate-500 font-medium truncate max-w-[90px]">
                              🤖 {task.assignedWorkerName}
                            </div>
                          ) : (
                            <div className="text-sky-600 font-medium">
                              {task.bids.length} bids
                            </div>
                          )}
                        </div>

                        {/* Inspection Hint */}
                        <div className="mt-2 flex items-center justify-between text-[9px] font-semibold text-slate-400 opacity-0 group-hover:opacity-100 transition">
                          <span>Inspect On-Chain Proof</span>
                          <Eye className="h-3 w-3 text-sky-500" />
                        </div>
                      </div>
                    ))}

                    {columnTasks.length === 0 && (
                      <div className="flex h-40 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 text-center p-4">
                        <span className="text-[11px] font-medium text-slate-400">Queue Empty</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Empty Zero State */
          <div className="rounded-3xl border-2 border-dashed border-sky-200 bg-sky-50/30 p-12 text-center backdrop-blur-md">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-sky-600 shadow-xs mb-3">
              <Layers className="h-7 w-7" />
            </div>
            <h3 className="text-base font-bold text-slate-800">No Active Tasks in Pipeline</h3>
            <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
              Commission a task using the prompt launcher above or click below to lock escrow and observe the autonomous lifecycle.
            </p>
            <button
              onClick={onOpenTaskModal}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-sky-500"
            >
              <Zap className="h-3.5 w-3.5" />
              <span>Create First Bounty</span>
            </button>
          </div>
        )}

      </div>
    </section>
  );
};
