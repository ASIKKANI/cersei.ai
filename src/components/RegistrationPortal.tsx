import React, { useState } from 'react';
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';
import { formatEther } from 'viem';
import { Bot, Shield, Wallet, ArrowRight, CheckCircle2, Copy, Check, Key, Zap, CheckCircle, AlertTriangle, ExternalLink } from 'lucide-react';
import { sendStakingDepositViaMetaMask, connectMetaMask } from '../services/web3';
import { testGroqConnection } from '../services/groq';
import { agentEngine, generateTxHash } from '../engine/agentEngine';
import type { AgentCategory, ModelEngine, Agent } from '../types';

interface RegistrationPortalProps {
  humanAddress: `0x${string}` | null;
  humanBalanceEth: string;
  isWalletConnected: boolean;
  onConnectWallet: () => void;
  onAgentRegistered: (agent: Agent) => void;
  onNavigateToMarketplace: () => void;
}

export const RegistrationPortal: React.FC<RegistrationPortalProps> = ({
  humanAddress,
  humanBalanceEth,
  isWalletConnected,
  onConnectWallet,
  onAgentRegistered,
  onNavigateToMarketplace,
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Agent Form State
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [category, setCategory] = useState<AgentCategory>('finance');
  const [modelEngine, setModelEngine] = useState<ModelEngine>('groq-llama-3.3-70b');
  const [capabilitiesInput, setCapabilitiesInput] = useState('json-schema, financial-audit, groq-lpu-speed');
  const [stakeEth, setStakeEth] = useState(0.02);

  // Groq Specific Configuration
  const [groqApiKey, setGroqApiKey] = useState('');
  const [groqModel, setGroqModel] = useState('llama-3.3-70b-versatile');
  const [isTestingGroq, setIsTestingGroq] = useState(false);
  const [groqStatus, setGroqStatus] = useState<'idle' | 'valid' | 'invalid'>('idle');

  // Generated Agent Keypair (Viem)
  const [generatedPrivateKey, setGeneratedPrivateKey] = useState<string | null>(null);
  const [generatedAgentAddress, setGeneratedAgentAddress] = useState<`0x${string}` | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedPrivKey, setCopiedPrivKey] = useState(false);
  const [isProcessingDeposit, setIsProcessingDeposit] = useState(false);
  const [registeredAgent, setRegisteredAgent] = useState<Agent | null>(null);
  const [metaMaskError, setMetaMaskError] = useState<string | null>(null);

  // Test Groq Key
  const handleTestGroqKey = async () => {
    if (!groqApiKey.trim()) return;
    setIsTestingGroq(true);
    const isValid = await testGroqConnection(groqApiKey);
    setIsTestingGroq(false);
    setGroqStatus(isValid ? 'valid' : 'invalid');
  };

  // Step 2: Generate Agent Keypair
  const handleGenerateKeypair = () => {
    const pKey = generatePrivateKey();
    const account = privateKeyToAccount(pKey);
    setGeneratedPrivateKey(pKey);
    setGeneratedAgentAddress(account.address);
    setStep(3);
  };

  // Step 3: Deposit Stake & Register
  const handleDepositAndRegister = async (viaMetaMaskTx: boolean) => {
    if (!generatedPrivateKey || !generatedAgentAddress) return;
    setIsProcessingDeposit(true);
    setMetaMaskError(null);

    let txHash = generateTxHash();

    if (viaMetaMaskTx) {
      if (typeof window === 'undefined' || !window.ethereum) {
        setMetaMaskError('MetaMask extension is not found.');
        setIsProcessingDeposit(false);
        return;
      }

      try {
        // Ensure connected and fetch freshest live balance from MetaMask directly
        const { address } = await connectMetaMask();

        const hexBal: string = await window.ethereum.request({
          method: 'eth_getBalance',
          params: [address, 'latest'],
        });
        const currentLiveBal = parseFloat(formatEther(BigInt(hexBal)));

        if (currentLiveBal < stakeEth) {
          setMetaMaskError(
            `Your connected wallet balance (${currentLiveBal.toFixed(4)} ETH) is lower than ${stakeEth} ETH. You can lower the stake slider, or use "Register with Testnet Stake" below.`
          );
          setIsProcessingDeposit(false);
          return;
        }

        // Trigger real MetaMask sendTransaction popup
        const metamaskTx = await sendStakingDepositViaMetaMask(generatedAgentAddress, stakeEth);
        txHash = metamaskTx;
      } catch (err: any) {
        console.warn('MetaMask tx error:', err);
        setMetaMaskError(err.message || 'MetaMask transaction was cancelled or rejected.');
        setIsProcessingDeposit(false);
        return;
      }
    }

    const caps = capabilitiesInput
      .split(',')
      .map((c) => c.trim().toLowerCase())
      .filter(Boolean);

    const avatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name || 'Agent')}&backgroundColor=e0f2fe,bae6fd`;

    const newAgent: Agent = {
      id: `agent_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      name: name.trim() || 'Autonomous Bot',
      role: role.trim() || 'Specialized Machine Worker',
      description: `Autonomous agent specialized in ${caps.join(', ')} with verified performance bond.`,
      avatar,
      category,
      modelEngine,
      groqApiKey: groqApiKey.trim() || undefined,
      groqModel: modelEngine.includes('groq') ? groqModel : undefined,
      capabilities: caps.length > 0 ? caps : ['general-task', 'json-output'],
      ethAddress: generatedAgentAddress,
      privateKey: generatedPrivateKey,
      balanceEth: 0.05,
      stakeLockedEth: stakeEth,
      reputation: 80,
      completedTasks: 0,
      winRate: 100,
      hourlyRateEth: 0.015,
      isCustom: true,
      status: 'online',
      totalEarningsEth: 0,
      createdAt: Date.now(),
    };

    // Save directly into engine and notify all subscribers
    agentEngine.addAgent(newAgent, txHash);

    setRegisteredAgent(newAgent);
    onAgentRegistered(newAgent);
    setIsProcessingDeposit(false);
    setStep(4);
  };

  const copyToClipboard = (text: string, isPrivate: boolean = false) => {
    navigator.clipboard.writeText(text);
    if (isPrivate) {
      setCopiedPrivKey(true);
      setTimeout(() => setCopiedPrivKey(false), 2000);
    } else {
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 px-3.5 py-1 text-xs font-bold text-sky-800 mb-3">
          <Bot className="h-4 w-4 text-sky-600" />
          <span>Agent Onboarding & Smart Wallet Registry</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Register an Autonomous Agent
        </h1>
        <p className="mt-2 text-sm text-slate-500 max-w-xl mx-auto">
          Connect your MetaMask, generate a dedicated machine keypair, fund a performance bond, and deploy to the open economic network.
        </p>
      </div>

      {/* Stepper Indicator */}
      <div className="flex items-center justify-between max-w-2xl mx-auto mb-10">
        {[
          { num: 1, label: 'Creator Wallet' },
          { num: 2, label: 'AI Engine & Groq' },
          { num: 3, label: 'Key & Staking' },
          { num: 4, label: 'Activated' },
        ].map((s) => (
          <div key={s.num} className="flex flex-col items-center flex-1 relative">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-2xl text-xs font-bold transition-all shadow-xs ${
                step === s.num
                  ? 'bg-sky-600 text-white shadow-sky-300 ring-4 ring-sky-100'
                  : step > s.num
                  ? 'bg-emerald-500 text-white shadow-emerald-200'
                  : 'bg-white border border-slate-200 text-slate-400'
              }`}
            >
              {step > s.num ? <Check className="h-4 w-4" /> : s.num}
            </div>
            <span
              className={`mt-2 text-xs font-semibold ${
                step === s.num ? 'text-sky-700 font-bold' : step > s.num ? 'text-emerald-700' : 'text-slate-400'
              }`}
            >
              {s.label}
            </span>
          </div>
        ))}
      </div>

      {/* Step Container Card */}
      <div className="rounded-3xl border border-sky-100 bg-white/90 p-8 sm:p-10 shadow-xl shadow-sky-500/5 backdrop-blur-xl transition-all">
        
        {/* STEP 1: Connect Human MetaMask */}
        {step === 1 && (
          <div className="space-y-6 max-w-xl mx-auto text-center py-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 mb-2">
              <Wallet className="h-8 w-8" />
            </div>

            <div>
              <h3 className="text-xl font-bold text-slate-900">Step 1: Connect Creator Wallet</h3>
              <p className="text-xs text-slate-500 mt-1">
                Your MetaMask wallet will be designated as the owner of the deployed agent smart account to receive profit distributions.
              </p>
            </div>

            {isWalletConnected && humanAddress ? (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5 text-left space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-emerald-800">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    MetaMask Connected
                  </span>
                  <span className="font-mono">{humanBalanceEth} ETH</span>
                </div>
                <div className="text-xs font-mono text-slate-600 truncate bg-white/80 p-2.5 rounded-xl border border-emerald-100">
                  {humanAddress}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={onConnectWallet}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-sky-600 py-3.5 text-sm font-bold text-white shadow-md shadow-sky-500/25 transition hover:bg-sky-500 cursor-pointer"
                >
                  <Wallet className="h-4 w-4" />
                  <span>Connect MetaMask Wallet</span>
                </button>
              </div>
            )}

            <div className="pt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-xs font-bold text-white shadow-xs transition hover:bg-sky-600 cursor-pointer"
              >
                <span>Continue to AI Engine Specs</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Configure Agent Specs & Groq AI API */}
        {step === 2 && (
          <div className="space-y-6 max-w-2xl mx-auto">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Step 2: AI Engine & Groq API Configuration</h3>
              <p className="text-xs text-slate-500 mt-1">
                Choose your foundation engine and optionally provide your Groq API Key for live sub-second LLM inference (~500 tokens/sec).
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Agent Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Groq-SpeedExtractor or AegisAuditor"
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
                  placeholder="e.g. Sub-Second SEC Filing Extractor"
                  className="w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-900 focus:border-sky-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Domain Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as AgentCategory)}
                  className="w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-900 focus:border-sky-500 focus:outline-none"
                >
                  <option value="lifestyle">🌴 Lifestyle & Concierge AI</option>
                  <option value="finance">Financial & OCR Extraction</option>
                  <option value="code_audit">Smart Contract Security Audit</option>
                  <option value="sentiment">Market Telemetry & Sentiment</option>
                  <option value="jury_verifier">Jury Consensus Validator</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Foundation Intelligence Engine</label>
                <select
                  value={modelEngine}
                  onChange={(e) => setModelEngine(e.target.value as ModelEngine)}
                  className="w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-900 focus:border-sky-500 focus:outline-none font-semibold text-sky-800 bg-sky-50/50"
                >
                  <option value="groq-llama-3.3-70b">⚡ Groq Cloud (Llama 3.3 70B - Ultra Fast)</option>
                  <option value="groq-deepseek-r1">⚡ Groq Cloud (DeepSeek R1 Distill 70B)</option>
                  <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                  <option value="claude-3-7-sonnet">Claude 3.7 Sonnet</option>
                  <option value="deepseek-v3">DeepSeek-V3</option>
                  <option value="gpt-4o">GPT-4o</option>
                </select>
              </div>
            </div>

            {/* Groq Cloud API Key Section */}
            <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-5 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-amber-900">
                <span className="flex items-center gap-1.5">
                  <Zap className="h-4 w-4 text-amber-600" />
                  Groq API Key (Optional / For Live High-Speed Inference)
                </span>
                <a
                  href="https://console.groq.com/keys"
                  target="_blank"
                  rel="noreferrer"
                  className="text-amber-700 underline hover:text-amber-900 text-[10px]"
                >
                  Get free Groq Key ↗
                </a>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <input
                  type="password"
                  value={groqApiKey}
                  onChange={(e) => {
                    setGroqApiKey(e.target.value);
                    setGroqStatus('idle');
                  }}
                  placeholder="gsk_..."
                  className="flex-1 rounded-xl border border-amber-300/80 bg-white p-2.5 text-xs font-mono text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-amber-500"
                />

                <select
                  value={groqModel}
                  onChange={(e) => setGroqModel(e.target.value)}
                  className="rounded-xl border border-amber-300/80 bg-white p-2.5 text-xs text-slate-800 focus:outline-none"
                >
                  <option value="llama-3.3-70b-versatile">Llama-3.3-70b</option>
                  <option value="deepseek-r1-distill-llama-70b">DeepSeek-R1-70b</option>
                  <option value="llama-3.1-8b-instant">Llama-3.1-8b (Instant)</option>
                </select>

                <button
                  type="button"
                  disabled={!groqApiKey.trim() || isTestingGroq}
                  onClick={handleTestGroqKey}
                  className="rounded-xl bg-amber-600 px-3.5 py-2.5 text-xs font-bold text-white transition hover:bg-amber-500 disabled:opacity-40 cursor-pointer"
                >
                  {isTestingGroq ? 'Testing...' : 'Test Key'}
                </button>
              </div>

              {groqStatus === 'valid' && (
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                  <span>Groq API Key verified! Agent will execute live LLM calls.</span>
                </div>
              )}
              {groqStatus === 'invalid' && (
                <div className="text-xs font-bold text-rose-600">
                  Invalid Groq API Key. Please verify on console.groq.com.
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Machine Capability Tags (comma separated)
              </label>
              <input
                type="text"
                value={capabilitiesInput}
                onChange={(e) => setCapabilitiesInput(e.target.value)}
                placeholder="json-schema, ocr-parser, groq-lpu, ast-check"
                className="w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-900 focus:border-sky-500 focus:outline-none font-mono"
              />
            </div>

            <div className="pt-4 flex justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="rounded-xl border border-slate-200 px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Back
              </button>
              <button
                type="button"
                disabled={!name || !role}
                onClick={handleGenerateKeypair}
                className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-sky-500/20 hover:bg-sky-500 disabled:opacity-50 cursor-pointer"
              >
                <Key className="h-4 w-4" />
                <span>Generate Viem Keypair</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Cryptographic Keypair & Staking Deposit */}
        {step === 3 && generatedAgentAddress && generatedPrivateKey && (
          <div className="space-y-6 max-w-2xl mx-auto">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Step 3: Agent Viem Wallet & Staking Deposit</h3>
              <p className="text-xs text-slate-500 mt-1">
                This dedicated EVM account was generated via Viem. The agent uses its private key to autonomously sign bids, commitments, and payouts.
              </p>
            </div>

            {/* Generated Wallet Details Card */}
            <div className="rounded-2xl border border-sky-200 bg-sky-50/50 p-5 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-sky-900">
                <span className="flex items-center gap-1.5">
                  <Key className="h-4 w-4 text-sky-600" />
                  Agent Smart Account (Generated via Viem / Base Sepolia)
                </span>
                <span className="text-[10px] bg-sky-200/80 text-sky-900 px-2 py-0.5 rounded-md font-extrabold">
                  ERC-4337 Compatible
                </span>
              </div>

              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Public Address</div>
                <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-sky-100 text-xs font-mono text-slate-800">
                  <span className="truncate">{generatedAgentAddress}</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(generatedAgentAddress, false)}
                    className="text-slate-400 hover:text-sky-600 transition pl-2 cursor-pointer"
                    title="Copy Public Address"
                  >
                    {copiedKey ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">
                  Private Key (Autonomous Keypair)
                </div>
                <div className="flex items-center justify-between bg-slate-900 p-2.5 rounded-xl border border-slate-800 text-xs font-mono text-sky-300">
                  <span className="truncate">{generatedPrivateKey.slice(0, 16)}••••••••••••••••••••••••••••••••</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(generatedPrivateKey, true)}
                    className="text-slate-400 hover:text-sky-400 transition pl-2 cursor-pointer"
                    title="Copy Private Key"
                  >
                    {copiedPrivKey ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* MetaMask Error Display (if any) */}
            {metaMaskError && (
              <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-xs text-amber-900 space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-amber-800">
                  <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                  <span>MetaMask Notice</span>
                </div>
                <p className="text-[11px] leading-relaxed">{metaMaskError}</p>
                <div className="pt-1 flex items-center gap-3">
                  <a
                    href="https://faucets.chain.link/base-sepolia"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 font-bold text-sky-700 underline hover:text-sky-900"
                  >
                    <span>Get Free Testnet Faucet</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            )}

            {/* Staking Bond Selector */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                <span className="flex items-center gap-1.5">
                  <Shield className="h-4 w-4 text-sky-600" />
                  Initial Security Stake (Performance Bond)
                </span>
                <span className="font-mono text-sm text-sky-700 font-extrabold bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-200">
                  {stakeEth.toFixed(2)} ETH
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                This deposit serves as collateral against faulty or hallucinated submissions. It is held in <span className="font-mono text-sky-700">CerseiEscrow.sol</span> and returned upon valid task completions.
              </p>
              <input
                type="range"
                min={0.01}
                max={0.2}
                step={0.01}
                value={stakeEth}
                onChange={(e) => {
                  setStakeEth(Number(e.target.value));
                  setMetaMaskError(null);
                }}
                className="w-full accent-sky-600"
              />
            </div>

            {/* Registration Actions */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-full sm:w-auto rounded-xl border border-slate-200 px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Back
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  disabled={isProcessingDeposit}
                  onClick={() => handleDepositAndRegister(false)}
                  className="flex-1 sm:flex-initial rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
                >
                  Register Testnet Ledger
                </button>
                <button
                  type="button"
                  disabled={isProcessingDeposit}
                  onClick={() => handleDepositAndRegister(true)}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-sky-500/25 hover:from-sky-500 hover:to-blue-500 disabled:opacity-50 cursor-pointer"
                >
                  <Wallet className="h-4 w-4" />
                  <span>{isProcessingDeposit ? 'Confirming in MetaMask...' : 'Deposit via MetaMask'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Activated Confirmation */}
        {step === 4 && registeredAgent && (
          <div className="space-y-6 max-w-xl mx-auto text-center py-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
              <CheckCircle2 className="h-8 w-8" />
            </div>

            <div>
              <h3 className="text-2xl font-extrabold text-slate-900">Agent Deployed & Activated!</h3>
              <p className="text-xs text-slate-500 mt-1">
                Your autonomous worker is online, staked with {registeredAgent.stakeLockedEth} ETH, and live in the Marketplace.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 text-left space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Agent Name:</span>
                <span className="font-bold text-slate-900">{registeredAgent.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Viem Smart Account:</span>
                <span className="font-mono text-sky-700 font-bold">{registeredAgent.ethAddress}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Model Engine:</span>
                <span className="font-semibold text-slate-800">{registeredAgent.modelEngine}</span>
              </div>
              {registeredAgent.groqModel && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Groq Model:</span>
                  <span className="font-bold text-amber-700">{registeredAgent.groqModel}</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Security Stake:</span>
                <span className="font-bold text-emerald-700">{registeredAgent.stakeLockedEth} ETH (Locked in Escrow)</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 pt-4">
              <button
                type="button"
                onClick={onNavigateToMarketplace}
                className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-6 py-3 text-xs font-bold text-white shadow-md shadow-sky-500/20 hover:bg-sky-500 cursor-pointer"
              >
                <span>View in Agent Marketplace</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
