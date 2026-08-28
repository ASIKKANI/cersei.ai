import React, { useState } from 'react';
import { X, Layers, Zap, Wallet, Cpu } from 'lucide-react';
import type { AgentCategory } from '../types';
import { sendEscrowLockViaMetaMask } from '../services/web3';
import { cerseiML } from '../services/mlEngine';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (params: {
    title: string;
    description: string;
    category: AgentCategory;
    inputData: string;
    outputRequirements: string;
    budgetEth: number;
    workerStakeRequiredEth: number;
    deadlineMinutes: number;
    strictness: 'standard' | 'high_quorum';
    escrowTxHash?: string;
    isOnChain?: boolean;
  }) => void;
  prefillCategory?: AgentCategory;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  prefillCategory = 'finance',
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<AgentCategory>(prefillCategory);
  const [inputData] = useState('{"report_url": "https://sec.gov/edgar/data/320193/q4.json", "target_year": 2026}');
  const [outputRequirements, setOutputRequirements] = useState('Strict JSON schema with revenue_bn, gross_margin_pct, and sentiment_score.');
  const [budgetEth, setBudgetEth] = useState(0.02);
  const [broadcastViaMetaMask, setBroadcastViaMetaMask] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  // Run live ML Price Prediction
  const mlPricing = cerseiML.predictBountyPricing({
    category,
    promptLength: (description.length || 100),
    activeCompetitorCount: 4,
    requiredStrictness: 'standard',
    modelEnginePreference: 'groq',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;

    setIsSubmitting(true);
    let onChainTxHash: string | undefined;

    if (broadcastViaMetaMask) {
      try {
        onChainTxHash = await sendEscrowLockViaMetaMask(undefined, budgetEth);
      } catch (err: any) {
        alert(err.message || 'MetaMask transaction rejected. You can uncheck "Broadcast via MetaMask" to test instantly.');
        setIsSubmitting(false);
        return;
      }
    }

    onSubmit({
      title,
      description,
      category,
      inputData,
      outputRequirements,
      budgetEth,
      workerStakeRequiredEth: Number((budgetEth * 0.4).toFixed(4)),
      deadlineMinutes: 10,
      strictness: 'standard',
      escrowTxHash: onChainTxHash,
      isOnChain: !!onChainTxHash,
    });

    setIsSubmitting(false);
    onClose();
    setTitle('');
    setDescription('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
      <div className="relative w-full max-w-xl rounded-3xl border border-sky-100 bg-white p-6 sm:p-8 shadow-2xl shadow-sky-500/10 max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 text-sky-600">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-slate-900">Commission Autonomous Bounty</h3>
            <p className="text-xs text-slate-500">
              Lock reward into CerseiEscrow.sol and broadcast to the agent bidding pool.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Task Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Audit FlashLoanVault.sol for Arbitrage Invariants"
              className="w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-900 focus:border-sky-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as AgentCategory)}
                className="w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-900 focus:border-sky-500 focus:outline-none"
              >
                <option value="finance">Financial & OCR Extraction</option>
                <option value="code_audit">Smart Contract Security Audit</option>
                <option value="sentiment">Market Telemetry & Sentiment</option>
                <option value="data_extraction">Data Scraping & Structuring</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Escrow Budget (ETH) *</label>
              <input
                type="number"
                step={0.005}
                min={0.005}
                max={0.5}
                required
                value={budgetEth}
                onChange={(e) => setBudgetEth(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-900 focus:border-sky-500 focus:outline-none font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Task Context / Prompt Description *</label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Specify the objective, target code or data payload, and verifiable success conditions..."
              className="w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-900 focus:border-sky-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Verifiable Output Requirements</label>
            <input
              type="text"
              value={outputRequirements}
              onChange={(e) => setOutputRequirements(e.target.value)}
              placeholder="JSON schema, syntax validation, test passing"
              className="w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-900 focus:border-sky-500 focus:outline-none text-[11px] font-mono"
            />
          </div>

          {/* Live ML Regression Price Prediction Banner */}
          <div className="rounded-2xl border border-indigo-200 bg-indigo-50/50 p-3 text-xs space-y-1.5">
            <div className="flex items-center justify-between text-indigo-900 font-bold">
              <span className="flex items-center gap-1.5">
                <Cpu className="h-3.5 w-3.5 text-indigo-600" />
                <span>ML Model 2: Pricing & Latency Regression</span>
              </span>
              <span className="text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.2 rounded-md font-bold">
                {mlPricing.predictedSavingsPercent}% Savings vs Human
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-600 font-mono">
              <span>Predicted Clearing Bid: <strong className="text-indigo-800">{mlPricing.predictedWinningBidEth} ETH</strong></span>
              <span>Estimated Latency: <strong className="text-slate-900">{mlPricing.predictedExecutionLatencyMs} ms</strong></span>
            </div>
          </div>

          {/* On-Chain MetaMask Broadcast Option */}
          <div className="rounded-2xl border border-sky-200 bg-sky-50/60 p-3.5 space-y-2">
            <label className="flex items-center gap-2 text-xs font-bold text-sky-900 cursor-pointer">
              <input
                type="checkbox"
                checked={broadcastViaMetaMask}
                onChange={(e) => setBroadcastViaMetaMask(e.target.checked)}
                className="rounded accent-sky-600 h-4 w-4"
              />
              <span className="flex items-center gap-1">
                <Wallet className="h-3.5 w-3.5 text-sky-600" />
                <span>Broadcast Real Escrow Lock on-chain via MetaMask</span>
              </span>
            </label>
            <p className="text-[11px] text-slate-600">
              {broadcastViaMetaMask
                ? `MetaMask will pop up to broadcast a real ${budgetEth} ETH transaction directly to Etherscan/BaseScan.`
                : 'Will use protocol state machine escrow lock with cryptographic proof commitments.'}
            </p>
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-sky-500/25 hover:from-sky-500 hover:to-blue-500 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <span className="h-3.5 w-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  <span>Confirming in MetaMask...</span>
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4" />
                  <span>{broadcastViaMetaMask ? 'Deposit Escrow via MetaMask' : 'Lock Escrow & Broadcast'}</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
