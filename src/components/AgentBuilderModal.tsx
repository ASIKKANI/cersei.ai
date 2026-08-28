import React, { useState } from 'react';
import { X, Shield, Zap, ArrowRight, Bot } from 'lucide-react';
import type { AgentCategory, ModelEngine } from '../types';

interface AgentBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDeploy: (params: {
    name: string;
    role: string;
    description: string;
    category: AgentCategory;
    modelEngine: ModelEngine;
    groqApiKey?: string;
    groqModel?: string;
    capabilities: string[];
    initialStakeEth: number;
    hourlyRateEth: number;
  }) => void;
}

export const AgentBuilderModal: React.FC<AgentBuilderModalProps> = ({
  isOpen,
  onClose,
  onDeploy,
}) => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<AgentCategory>('finance');
  const [modelEngine, setModelEngine] = useState<ModelEngine>('groq-llama-3.3-70b');
  const [groqApiKey, setGroqApiKey] = useState('');
  const [capabilitiesInput, setCapabilitiesInput] = useState('json-schema, ocr-metrics, groq-lpu');
  const [stakeEth, setStakeEth] = useState(0.15);
  const [hourlyRateEth, setHourlyRateEth] = useState(0.015);
  const [isDeploying, setIsDeploying] = useState(false);

  if (!isOpen) return null;

  const handleFinish = (e: React.FormEvent) => {
    e.preventDefault();
    setIsDeploying(true);

    setTimeout(() => {
      const caps = capabilitiesInput
        .split(',')
        .map((c) => c.trim().toLowerCase())
        .filter(Boolean);

      onDeploy({
        name: name.trim() || 'Autonomous Bot',
        role: role.trim() || 'Specialized Machine Worker',
        description: description.trim() || 'Custom autonomous agent deployed on Cersei.ai network.',
        category,
        modelEngine,
        groqApiKey: groqApiKey.trim() || undefined,
        groqModel: modelEngine.includes('groq') ? 'llama-3.3-70b-versatile' : undefined,
        capabilities: caps.length > 0 ? caps : ['general-task', 'json-output'],
        initialStakeEth: stakeEth,
        hourlyRateEth,
      });

      setIsDeploying(false);
      onClose();
      setStep(1);
      setName('');
      setRole('');
      setDescription('');
    }, 1000);
  };

  const modelOptions = [
    { id: 'groq-llama-3.3-70b' as ModelEngine, label: '⚡ Groq Llama 3.3', desc: 'Sub-second LPU inference (~500 T/s)', tag: 'Ultra Fast' },
    { id: 'groq-deepseek-r1' as ModelEngine, label: '⚡ Groq DeepSeek R1', desc: 'Reasoning distillation on Groq', tag: 'Fast Logic' },
    { id: 'gemini-2.5-flash' as ModelEngine, label: 'Gemini 2.5 Flash', desc: 'Ultra-fast structured extraction & reasoning', tag: 'Schema' },
    { id: 'claude-3-7-sonnet' as ModelEngine, label: 'Claude 3.7 Sonnet', desc: 'Deep AST code auditing & synthesis', tag: 'Security' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
      <div className="relative w-full max-w-xl rounded-3xl border border-sky-100 bg-white p-6 sm:p-8 shadow-2xl shadow-sky-500/10">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 text-sky-600">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-slate-900">Agent Launchpad & Wallet Provisioner</h3>
            <p className="text-xs text-slate-500">
              Configure, fund performance stake, and deploy an autonomous EVM-enabled agent.
            </p>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-between gap-2 mb-6 border-b border-slate-100 pb-4">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`flex-1 flex items-center gap-2 text-xs font-bold ${
                step === s ? 'text-sky-600' : step > s ? 'text-emerald-600' : 'text-slate-400'
              }`}
            >
              <div
                className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                  step === s
                    ? 'bg-sky-600 text-white'
                    : step > s
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                {step > s ? '✓' : s}
              </div>
              <span className="hidden sm:inline">
                {s === 1 ? 'Identity' : s === 2 ? 'Intelligence' : 'Staking & Mint'}
              </span>
            </div>
          ))}
        </div>

        <form onSubmit={handleFinish}>
          
          {/* STEP 1: IDENTITY */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Agent Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Groq-SpeedParser or SecureAuditor"
                  className="w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-900 focus:border-sky-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Specialized Role *</label>
                <input
                  type="text"
                  required
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. High-Speed 10-K SEC Filing Extractor"
                  className="w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-900 focus:border-sky-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Domain Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as AgentCategory)}
                  className="w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-900 focus:border-sky-500 focus:outline-none"
                >
                  <option value="finance">Financial & OCR Extraction</option>
                  <option value="code_audit">Smart Contract Security Audit</option>
                  <option value="sentiment">Market Telemetry & Sentiment</option>
                  <option value="jury_verifier">Jury Consensus Validator</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What does this agent excel at? Invariant checks, speed, or precision..."
                  className="w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-900 focus:border-sky-500 focus:outline-none"
                />
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  disabled={!name || !role}
                  onClick={() => setStep(2)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-sky-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-sky-500/20 hover:bg-sky-500 disabled:opacity-50 cursor-pointer"
                >
                  <span>Next: Foundation Engine</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: INTELLIGENCE & CAPABILITIES */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Foundation Model Engine</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {modelOptions.map((opt) => (
                    <div
                      key={opt.id}
                      onClick={() => setModelEngine(opt.id)}
                      className={`cursor-pointer rounded-xl border p-3 transition ${
                        modelEngine === opt.id
                          ? 'border-sky-500 bg-sky-50/70 shadow-xs'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-extrabold text-xs text-slate-900">{opt.label}</span>
                        <span className="rounded-md bg-sky-100 px-1.5 py-0.5 text-[9px] font-bold text-sky-800">
                          {opt.tag}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500">{opt.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {modelEngine.includes('groq') && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Groq API Key (Optional)
                  </label>
                  <input
                    type="password"
                    value={groqApiKey}
                    onChange={(e) => setGroqApiKey(e.target.value)}
                    placeholder="gsk_..."
                    className="w-full rounded-xl border border-amber-300 bg-amber-50/30 p-2.5 text-xs font-mono text-slate-800 focus:border-amber-500 focus:outline-none"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Machine Capability Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={capabilitiesInput}
                  onChange={(e) => setCapabilitiesInput(e.target.value)}
                  placeholder="json-schema, ast-check, ocr, latency-<1s"
                  className="w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-900 focus:border-sky-500 focus:outline-none font-mono"
                />
              </div>

              <div className="pt-4 flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-sky-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-sky-500/20 hover:bg-sky-500 cursor-pointer"
                >
                  <span>Next: Staking & Wallet</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: STAKING & ON-CHAIN MINT */}
          {step === 3 && (
            <div className="space-y-4">
              
              <div className="rounded-2xl border border-sky-200 bg-sky-50/60 p-4">
                <div className="flex items-center gap-2 text-xs font-bold text-sky-900 mb-1">
                  <Shield className="h-4 w-4 text-sky-600" />
                  <span>Performance Stake (Skin in the Game)</span>
                </div>
                <p className="text-[11px] text-slate-600 mb-3">
                  This deposit acts as collateral to deter hallucinations. It is automatically slashed if the Verification Jury rejects submissions.
                </p>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={0.05}
                    max={0.5}
                    step={0.05}
                    value={stakeEth}
                    onChange={(e) => setStakeEth(Number(e.target.value))}
                    className="flex-1 accent-sky-600"
                  />
                  <span className="font-mono text-xs font-extrabold text-sky-800 bg-white px-2.5 py-1 rounded-lg border border-sky-200">
                    {stakeEth.toFixed(2)} ETH
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Baseline Bid Rate (ETH per task)
                </label>
                <input
                  type="number"
                  step={0.005}
                  value={hourlyRateEth}
                  onChange={(e) => setHourlyRateEth(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-900 focus:border-sky-500 focus:outline-none"
                />
              </div>

              {/* On-Chain Note */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-[11px] text-slate-500 font-mono">
                ⚡ Generated: Base Sepolia Smart Account (ERC-4337 Compatible)
              </div>

              <div className="pt-4 flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isDeploying}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-sky-500/25 hover:from-sky-500 hover:to-blue-500 disabled:opacity-50 cursor-pointer"
                >
                  {isDeploying ? (
                    <>
                      <span className="h-3.5 w-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      <span>Provisioning Smart Account...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4" />
                      <span>Deploy & Mint On-Chain</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

        </form>

      </div>
    </div>
  );
};
