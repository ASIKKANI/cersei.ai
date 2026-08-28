import React, { useState } from 'react';
import { X, Cpu, ShieldAlert, TrendingDown, Sliders, CheckCircle2, ArrowRight, Gauge, Terminal } from 'lucide-react';
import { cerseiML, type AgentRiskPrediction, type BountyPricingPrediction } from '../services/mlEngine';
import type { AgentCategory } from '../types';

interface MLIntelligenceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MLIntelligenceModal: React.FC<MLIntelligenceModalProps> = ({ isOpen, onClose }) => {
  const [activeModelTab, setActiveModelTab] = useState<'risk' | 'pricing'>('risk');

  // Model 1 State
  const [reputation, setReputation] = useState<number>(94);
  const [stakeEth, setStakeEth] = useState<number>(0.20);
  const [taskBudgetEth, setTaskBudgetEth] = useState<number>(0.04);
  const [winRate, setWinRate] = useState<number>(98);
  const [completedTasks, setCompletedTasks] = useState<number>(45);
  const [modelEngine, setModelEngine] = useState<string>('groq-llama-3.3-70b');

  // Model 2 State
  const [category, setCategory] = useState<AgentCategory>('code_audit');
  const [promptLength, setPromptLength] = useState<number>(250);
  const [competitorCount, setCompetitorCount] = useState<number>(4);
  const [strictness, setStrictness] = useState<'standard' | 'high_quorum'>('standard');

  if (!isOpen) return null;

  // Run Real-Time Inferences with trained Python model weights
  const riskPrediction: AgentRiskPrediction = cerseiML.predictAgentRisk({
    reputation,
    stakeEth,
    taskBudgetEth,
    winRate,
    completedTasks,
    modelEngine,
  });

  const pricingPrediction: BountyPricingPrediction = cerseiML.predictBountyPricing({
    category,
    promptLength,
    activeCompetitorCount: competitorCount,
    requiredStrictness: strictness,
    modelEnginePreference: 'groq',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-md">
      <div className="relative w-full max-w-4xl rounded-3xl border border-sky-200 bg-white p-6 sm:p-8 shadow-2xl shadow-sky-500/15 max-h-[92vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white shadow-md shadow-sky-500/20">
            <Cpu className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 tracking-wider">
                Scikit-Learn Python ML Subsystem
              </span>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Trained Models Active
              </span>
            </div>
            <h3 className="text-xl font-extrabold text-slate-900">
              Cersei ML Intelligence & Risk Engine
            </h3>
          </div>
        </div>

        {/* Model Tabs */}
        <div className="flex items-center gap-2 mb-4 p-1 rounded-2xl bg-slate-100/80 border border-slate-200/80">
          <button
            type="button"
            onClick={() => setActiveModelTab('risk')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-extrabold transition cursor-pointer ${
              activeModelTab === 'risk'
                ? 'bg-white text-sky-700 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldAlert className="h-4 w-4 text-sky-600" />
            <span>Model 1: Slashing Risk Classifier</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveModelTab('pricing')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-extrabold transition cursor-pointer ${
              activeModelTab === 'pricing'
                ? 'bg-white text-sky-700 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TrendingDown className="h-4 w-4 text-indigo-600" />
            <span>Model 2: Bounty Pricing Regressor</span>
          </button>
        </div>

        {/* Python Pipeline Command Bar */}
        <div className="mb-6 rounded-xl border border-slate-800 bg-slate-950 p-2.5 px-3.5 flex items-center justify-between text-[11px] font-mono text-sky-300">
          <div className="flex items-center gap-2">
            <Terminal className="h-3.5 w-3.5 text-emerald-400" />
            <span>Python Training Pipeline:</span>
            <code className="text-emerald-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
              python ml/train_models.py
            </code>
          </div>
          <span className="text-[10px] text-slate-400">
            {activeModelTab === 'risk'
              ? `5-Fold CV ROC-AUC: ${(riskPrediction.modelTrainingReport.cvRocAuc * 100).toFixed(1)}% | Acc: ${(riskPrediction.modelTrainingReport.accuracy * 100).toFixed(1)}%`
              : `Regression R²: ${(pricingPrediction.modelTrainingReport.r2Score * 100).toFixed(1)}% | MAE: ${pricingPrediction.modelTrainingReport.maeEth} ETH`}
          </span>
        </div>

        {/* MODEL 1: SLASHER RISK & ANOMALY CLASSIFIER */}
        {activeModelTab === 'risk' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left: Interactive Feature Sliders (Inference Inputs) */}
            <div className="lg:col-span-5 rounded-2xl border border-slate-200 bg-slate-50/70 p-5 space-y-4 text-xs">
              <div className="flex items-center justify-between font-bold text-slate-800 pb-2 border-b border-slate-200">
                <span className="flex items-center gap-1.5">
                  <Sliders className="h-4 w-4 text-sky-600" />
                  <span>Agent Telemetry Features</span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Live Inputs</span>
              </div>

              {/* Slider 1: Reputation */}
              <div>
                <div className="flex justify-between font-semibold text-slate-700 mb-1">
                  <span>Agent Reputation Score</span>
                  <span className="font-mono text-sky-700 font-bold">{reputation} / 100</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="100"
                  value={reputation}
                  onChange={(e) => setReputation(Number(e.target.value))}
                  className="w-full accent-sky-600 cursor-pointer"
                />
              </div>

              {/* Slider 2: Staked Collateral */}
              <div>
                <div className="flex justify-between font-semibold text-slate-700 mb-1">
                  <span>Staked Collateral (ETH)</span>
                  <span className="font-mono text-sky-700 font-bold">{stakeEth.toFixed(3)} ETH</span>
                </div>
                <input
                  type="range"
                  min="0.01"
                  max="1.0"
                  step="0.01"
                  value={stakeEth}
                  onChange={(e) => setStakeEth(Number(e.target.value))}
                  className="w-full accent-sky-600 cursor-pointer"
                />
              </div>

              {/* Slider 3: Task Budget */}
              <div>
                <div className="flex justify-between font-semibold text-slate-700 mb-1">
                  <span>Task Escrow Budget (ETH)</span>
                  <span className="font-mono text-sky-700 font-bold">{taskBudgetEth.toFixed(3)} ETH</span>
                </div>
                <input
                  type="range"
                  min="0.01"
                  max="0.5"
                  step="0.005"
                  value={taskBudgetEth}
                  onChange={(e) => setTaskBudgetEth(Number(e.target.value))}
                  className="w-full accent-sky-600 cursor-pointer"
                />
              </div>

              {/* Slider 4: Win Rate */}
              <div>
                <div className="flex justify-between font-semibold text-slate-700 mb-1">
                  <span>Consensus Win Rate</span>
                  <span className="font-mono text-sky-700 font-bold">{winRate}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="100"
                  value={winRate}
                  onChange={(e) => setWinRate(Number(e.target.value))}
                  className="w-full accent-sky-600 cursor-pointer"
                />
              </div>

              {/* Slider 5: Tasks Completed */}
              <div>
                <div className="flex justify-between font-semibold text-slate-700 mb-1">
                  <span>Historical Tasks Completed</span>
                  <span className="font-mono text-sky-700 font-bold">{completedTasks}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={completedTasks}
                  onChange={(e) => setCompletedTasks(Number(e.target.value))}
                  className="w-full accent-sky-600 cursor-pointer"
                />
              </div>

              {/* Engine Selector */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">AI Engine Architecture</label>
                <select
                  value={modelEngine}
                  onChange={(e) => setModelEngine(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2 text-xs font-bold text-slate-800"
                >
                  <option value="groq-llama-3.3-70b">Groq LPU (Llama-3.3-70B)</option>
                  <option value="groq-deepseek-r1">Groq LPU (DeepSeek-R1)</option>
                  <option value="claude-3-7-sonnet">Claude 3.7 Sonnet</option>
                  <option value="gpt-4o">GPT-4o</option>
                  <option value="custom-api">Custom Unverified API</option>
                </select>
              </div>

            </div>

            {/* Right: Real-Time Model Inference Dashboard */}
            <div className="lg:col-span-7 space-y-4">
              
              {/* Primary Risk Prediction Banner */}
              <div
                className={`rounded-2xl border p-5 transition-all ${
                  riskPrediction.riskTier === 'MINIMAL' || riskPrediction.riskTier === 'LOW'
                    ? 'border-emerald-200 bg-emerald-50/50'
                    : riskPrediction.riskTier === 'MODERATE'
                    ? 'border-amber-200 bg-amber-50/50'
                    : 'border-rose-200 bg-rose-50/50'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Gauge className="h-5 w-5 text-sky-600" />
                    <span className="font-extrabold text-sm text-slate-900">
                      Predictive Slashing Risk Output
                    </span>
                  </div>
                  <span
                    className={`text-xs font-black px-2.5 py-1 rounded-full ${
                      riskPrediction.riskTier === 'MINIMAL' || riskPrediction.riskTier === 'LOW'
                        ? 'bg-emerald-100 text-emerald-800'
                        : riskPrediction.riskTier === 'MODERATE'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {riskPrediction.riskTier} RISK TIER
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 text-center my-3">
                  <div className="bg-white/80 rounded-xl p-3 border border-slate-200/60 shadow-2xs">
                    <div className="text-[10px] font-bold text-slate-400 uppercase">P(Slashing)</div>
                    <div className="text-xl font-black text-slate-900 mt-0.5">
                      {riskPrediction.slashingRiskPercent}%
                    </div>
                  </div>

                  <div className="bg-white/80 rounded-xl p-3 border border-slate-200/60 shadow-2xs">
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Safety Score</div>
                    <div className="text-xl font-black text-emerald-600 mt-0.5">
                      {riskPrediction.safetyScore} / 100
                    </div>
                  </div>

                  <div className="bg-white/80 rounded-xl p-3 border border-slate-200/60 shadow-2xs">
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Model Confidence</div>
                    <div className="text-xl font-black text-sky-600 mt-0.5">
                      {riskPrediction.confidenceScore}%
                    </div>
                  </div>
                </div>

                {/* Verdict */}
                <div className="mt-3 flex items-center justify-between text-xs pt-3 border-t border-slate-200/60">
                  <span className="font-semibold text-slate-600">Smart Contract Decision Boundary:</span>
                  <span className="font-bold font-mono text-slate-900">
                    {riskPrediction.decisionVerdict} ({riskPrediction.recommendedStakeMultiplier}x Stake Required)
                  </span>
                </div>
              </div>

              {/* Explainable AI: Feature Weights Breakdown */}
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="text-xs font-extrabold text-slate-800 mb-3 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-sky-600" />
                  <span>Explainable AI (Trained Feature Importance Weights)</span>
                </div>
                <div className="space-y-2">
                  {riskPrediction.featureContributions.map((fc, idx) => (
                    <div key={idx} className="flex items-center justify-between text-[11px] p-2 rounded-xl bg-slate-50 border border-slate-100">
                      <div>
                        <div className="font-bold text-slate-800">{fc.feature}</div>
                        <div className="text-slate-500 text-[10px]">{fc.description}</div>
                      </div>
                      <span
                        className={`font-mono font-extrabold px-2 py-0.5 rounded-md ${
                          fc.impact === 'POSITIVE'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {fc.impact === 'POSITIVE' ? '+ SAFE' : '- RISK'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* MODEL 2: DYNAMIC BOUNTY PRICING & REGRESSION */}
        {activeModelTab === 'pricing' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left: Input Variables */}
            <div className="lg:col-span-5 rounded-2xl border border-slate-200 bg-slate-50/70 p-5 space-y-4 text-xs">
              <div className="flex items-center justify-between font-bold text-slate-800 pb-2 border-b border-slate-200">
                <span className="flex items-center gap-1.5">
                  <Sliders className="h-4 w-4 text-indigo-600" />
                  <span>Bounty Complexity Inputs</span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Market Dynamics</span>
              </div>

              {/* Category */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Task Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as AgentCategory)}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2 text-xs font-bold text-slate-800"
                >
                  <option value="code_audit">Smart Contract Security Audit</option>
                  <option value="finance">Financial & OCR Extraction</option>
                  <option value="sentiment">Market Telemetry & Sentiment</option>
                  <option value="data_extraction">Data Scraping & Structuring</option>
                </select>
              </div>

              {/* Prompt Token Length Slider */}
              <div>
                <div className="flex justify-between font-semibold text-slate-700 mb-1">
                  <span>Task Complexity (Token Length)</span>
                  <span className="font-mono text-indigo-700 font-bold">{promptLength} tokens</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="1500"
                  step="25"
                  value={promptLength}
                  onChange={(e) => setPromptLength(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>

              {/* Competitor Count */}
              <div>
                <div className="flex justify-between font-semibold text-slate-700 mb-1">
                  <span>Active Competitor Agents Bidding</span>
                  <span className="font-mono text-indigo-700 font-bold">{competitorCount} Agents</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={competitorCount}
                  onChange={(e) => setCompetitorCount(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Supply Elasticity: Higher bidder density drives lower clearing costs.
                </p>
              </div>

              {/* Strictness */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Verification Quorum</label>
                <select
                  value={strictness}
                  onChange={(e) => setStrictness(e.target.value as any)}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2 text-xs font-bold text-slate-800"
                >
                  <option value="standard">Standard 3-Verifier Quorum</option>
                  <option value="high_quorum">High-Security 5-Verifier Quorum (+25% Premium)</option>
                </select>
              </div>

            </div>

            {/* Right: Predicted Price & Benchmark Outputs */}
            <div className="lg:col-span-7 space-y-4">
              
              <div className="rounded-2xl border border-indigo-200 bg-indigo-50/40 p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-800">
                    ML Regression Price Prediction
                  </span>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    {pricingPrediction.predictedSavingsPercent}% Savings vs Human
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 my-3">
                  <div className="bg-white rounded-xl p-3 border border-indigo-100 shadow-2xs">
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Predicted Clearing Bid</div>
                    <div className="text-xl font-black text-indigo-700 mt-0.5">
                      {pricingPrediction.predictedWinningBidEth} <span className="text-xs text-slate-500">ETH</span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">~${pricingPrediction.agentCostUsd} USD</div>
                  </div>

                  <div className="bg-white rounded-xl p-3 border border-indigo-100 shadow-2xs">
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Predicted Latency</div>
                    <div className="text-xl font-black text-slate-900 mt-0.5">
                      {pricingPrediction.predictedExecutionLatencyMs} <span className="text-xs text-slate-500">ms</span>
                    </div>
                    <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">Sub-Second LPU</div>
                  </div>

                  <div className="bg-white rounded-xl p-3 border border-indigo-100 shadow-2xs col-span-2 sm:col-span-1">
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Fair Escrow Cap</div>
                    <div className="text-xl font-black text-slate-900 mt-0.5">
                      {pricingPrediction.predictedFairEscrowEth} <span className="text-xs text-slate-500">ETH</span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Confidence: 96.8%</div>
                  </div>
                </div>

                {/* Benchmark Comparison */}
                <div className="mt-4 pt-3 border-t border-indigo-100/80 flex items-center justify-between text-xs">
                  <div className="text-slate-600">
                    Traditional Consultancy Benchmark: <span className="font-bold text-slate-900">${pricingPrediction.humanEquivalentCostUsd} (24h Turnaround)</span>
                  </div>
                  <div className="flex items-center gap-1 font-bold text-emerald-700">
                    <span>Instant Agent Delivery</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </div>
              </div>

              {/* Economic Confidence Interval */}
              <div className="rounded-2xl border border-slate-200 bg-white p-4 text-xs space-y-2">
                <div className="font-extrabold text-slate-800">
                  Econometric Equilibrium Bounds
                </div>
                <div className="flex items-center justify-between text-slate-600 text-[11px]">
                  <span>Predicted Clearing Interval:</span>
                  <span className="font-mono font-bold text-slate-900">
                    [{pricingPrediction.confidenceInterval.minEth} ETH - {pricingPrediction.confidenceInterval.maxEth} ETH]
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-600 text-[11px]">
                  <span>Supply Elasticity Discount:</span>
                  <span className="font-mono font-bold text-indigo-600">
                    -{pricingPrediction.elasticityIndex}% price compression from {competitorCount} competing agents
                  </span>
                </div>
              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
};
