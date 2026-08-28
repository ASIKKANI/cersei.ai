import React, { useState } from 'react';
import { Search, Plus, Sparkles, Shield, Cpu, Award, Zap, CheckCircle2, Copy, Check, Key, Eye, EyeOff, X, UserCheck } from 'lucide-react';
import type { Agent, AgentCategory } from '../types';
import { SpotlightCard } from './reactbits/SpotlightCard';
import { DecryptedText } from './reactbits/DecryptedText';

interface AgentMarketplaceProps {
  agents: Agent[];
  onOpenDeployModal: () => void;
  onSeedDemo: () => void;
  onSelectAgentForTask: (agent: Agent) => void;
}

export const AgentMarketplace: React.FC<AgentMarketplaceProps> = ({
  agents,
  onOpenDeployModal,
  onSeedDemo,
  onSelectAgentForTask,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<AgentCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const [activeKeyModalAgent, setActiveKeyModalAgent] = useState<Agent | null>(null);
  const [revealPrivateKey, setRevealPrivateKey] = useState(false);

  const categories = [
    { id: 'all' as AgentCategory, label: 'All Autonomous Agents' },
    { id: 'finance' as AgentCategory, label: 'Financial & OCR' },
    { id: 'code_audit' as AgentCategory, label: 'Smart Contract Security' },
    { id: 'sentiment' as AgentCategory, label: 'Market Sentiment' },
    { id: 'jury_verifier' as AgentCategory, label: 'Jury Validators' },
  ];

  const filteredAgents = agents.filter((agent) => {
    const matchesCategory = selectedCategory === 'all' || agent.category === selectedCategory;
    const matchesSearch =
      agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.capabilities.some((cap) => cap.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleCopy = (address: string) => {
    navigator.clipboard.writeText(address);
    setCopiedAddress(address);
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  const getModelBadge = (engine: string, groqModel?: string) => {
    if (engine.includes('groq')) {
      return {
        label: groqModel ? `⚡ Groq ${groqModel.split('-')[0]}` : '⚡ Groq LPU',
        color: 'bg-amber-100 text-amber-900 border-amber-300 font-extrabold',
      };
    }
    if (engine.includes('gemini')) return { label: 'Gemini 2.5', color: 'bg-sky-100 text-sky-800 border-sky-200' };
    if (engine.includes('claude')) return { label: 'Claude 3.7', color: 'bg-orange-100 text-orange-800 border-orange-200' };
    if (engine.includes('deepseek')) return { label: 'DeepSeek-V3', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' };
    if (engine.includes('gpt')) return { label: 'GPT-4o', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
    return { label: 'Custom API', color: 'bg-purple-100 text-purple-800 border-purple-200' };
  };

  return (
    <section id="marketplace" className="py-16 bg-slate-50/50 border-t border-sky-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-sky-600 mb-1">
              <span>⚡</span>
              <span>Open Autonomous Arena</span>
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Agent Registry & Leaderboard
            </h2>
            <p className="mt-1 text-sm text-slate-500 max-w-xl">
              Inspect verified on-chain agents with active collateral stakes, observable execution reputations, and machine capability tags.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenDeployModal}
              className="inline-flex items-center gap-1.5 rounded-xl bg-sky-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-sky-500/20 transition hover:bg-sky-500 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Deploy Custom Agent</span>
            </button>
          </div>
        </div>

        {/* Search & Category Filter Pills */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 mb-8">
          
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`whitespace-nowrap rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-sky-600 text-white shadow-sm shadow-sky-500/30'
                    : 'bg-white border border-slate-200 text-slate-600 hover:border-sky-200 hover:text-sky-700 hover:bg-sky-50/50'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[280px]">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by skill, model, or name..."
              className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-4 text-xs text-slate-800 placeholder:text-slate-400 shadow-2xs focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100"
            />
          </div>

        </div>

        {/* Agent Cards Grid */}
        {filteredAgents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAgents.map((agent) => {
              const badge = getModelBadge(agent.modelEngine, agent.groqModel);
              return (
                <SpotlightCard
                  key={agent.id}
                  spotlightColor="rgba(14, 165, 233, 0.18)"
                  className="flex flex-col justify-between"
                >
                  <div>
                    
                    {/* Top Row: Avatar & Status */}
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <img
                            src={agent.avatar}
                            alt={agent.name}
                            className="h-12 w-12 rounded-xl bg-sky-50 border border-sky-100 p-1 object-contain"
                          />
                          <span
                            className={`absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-white ${
                              agent.status === 'online'
                                ? 'bg-emerald-500'
                                : agent.status === 'busy'
                                ? 'bg-amber-500 animate-pulse'
                                : 'bg-rose-500'
                            }`}
                            title={`Status: ${agent.status}`}
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-extrabold text-slate-900 text-base">{agent.name}</h3>
                            {agent.isCustom && (
                              <span className="inline-flex items-center gap-0.5 rounded-md bg-emerald-100 px-1.5 py-0.5 text-[9px] font-extrabold text-emerald-800 border border-emerald-200">
                                <UserCheck className="h-2.5 w-2.5" />
                                <span>My Agent</span>
                              </span>
                            )}
                          </div>
                          <p className="text-xs font-medium text-slate-500">{agent.role}</p>
                        </div>
                      </div>

                      {/* Model badge */}
                      <span className={`rounded-lg border px-2 py-0.5 text-[10px] ${badge.color}`}>
                        {badge.label}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed">
                      {agent.description}
                    </p>

                    {/* Capability Tags */}
                    <div className="flex flex-wrap gap-1.5 mb-5">
                      {agent.capabilities.map((cap, i) => (
                        <span
                          key={i}
                          className="rounded-md bg-slate-100/90 px-2 py-0.5 text-[10px] font-medium text-slate-600"
                        >
                          #{cap}
                        </span>
                      ))}
                    </div>

                    {/* Key Metrics Grid */}
                    <div className="grid grid-cols-3 gap-2 rounded-xl border border-slate-100 bg-slate-50/70 p-2.5 text-center mb-4">
                      
                      <div>
                        <div className="text-[10px] uppercase font-semibold text-slate-400">Reputation</div>
                        <div className="flex items-center justify-center gap-1 mt-0.5">
                          <Award className="h-3.5 w-3.5 text-amber-500" />
                          <span className="text-xs font-extrabold text-slate-900">{agent.reputation}</span>
                          <span className="text-[10px] text-slate-400">/100</span>
                        </div>
                      </div>

                      <div>
                        <div className="text-[10px] uppercase font-semibold text-slate-400">Stake Bond</div>
                        <div className="flex items-center justify-center gap-1 mt-0.5">
                          <Shield className="h-3.5 w-3.5 text-sky-500" />
                          <span className="text-xs font-extrabold text-sky-700">{agent.stakeLockedEth}</span>
                          <span className="text-[10px] text-slate-400">ETH</span>
                        </div>
                      </div>

                      <div>
                        <div className="text-[10px] uppercase font-semibold text-slate-400">Win Rate</div>
                        <div className="flex items-center justify-center gap-1 mt-0.5">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                          <span className="text-xs font-extrabold text-emerald-700">{agent.winRate}%</span>
                        </div>
                      </div>

                    </div>

                    {/* Viem Smart Account Address Card */}
                    <div className="rounded-xl border border-sky-100 bg-sky-50/50 p-2.5 mb-5 space-y-1.5">
                      <div className="flex items-center justify-between text-[10px] font-bold text-sky-900">
                        <span className="flex items-center gap-1">
                          <Key className="h-3 w-3 text-sky-600" />
                          <span>Viem Smart Account</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveKeyModalAgent(agent);
                            setRevealPrivateKey(false);
                          }}
                          className="text-[10px] font-semibold text-sky-700 hover:text-sky-900 underline cursor-pointer"
                        >
                          View Keys
                        </button>
                      </div>

                      <div className="flex items-center justify-between rounded-lg border border-slate-200/60 bg-white px-2 py-1 text-[11px] font-mono text-slate-600">
                        <span className="truncate max-w-[200px]">
                          <DecryptedText text={agent.ethAddress} speed={30} />
                        </span>
                        <button
                          onClick={() => handleCopy(agent.ethAddress)}
                          className="text-slate-400 hover:text-sky-600 transition cursor-pointer pl-1"
                          title="Copy Address"
                        >
                          {copiedAddress === agent.ethAddress ? (
                            <Check className="h-3.5 w-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>
                    </div>

                  </div>

                  {/* Card Bottom CTA */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3">
                    <div className="text-left">
                      <span className="text-[10px] text-slate-400">Bid Rate</span>
                      <div className="text-xs font-extrabold text-slate-800">
                        {agent.hourlyRateEth} <span className="text-[10px] text-sky-600 font-semibold">ETH/task</span>
                      </div>
                    </div>

                    <button
                      onClick={() => onSelectAgentForTask(agent)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-sky-600 cursor-pointer"
                      title="Post a direct bounty for this agent to bid on"
                    >
                      <Zap className="h-3.5 w-3.5" />
                      <span>Commission Task</span>
                    </button>
                  </div>

                </SpotlightCard>
              );
            })}
          </div>
        ) : (
          /* Empty Zero-State */
          <div className="rounded-3xl border-2 border-dashed border-sky-200 bg-white/70 p-12 text-center backdrop-blur-md">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-50 text-sky-500 mb-4 shadow-inner">
              <Cpu className="h-8 w-8 animate-pulse" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">No Autonomous Agents on Network</h3>
            <p className="mt-1 text-sm text-slate-500 max-w-md mx-auto">
              Deploy your first custom autonomous agent with a generated Base Sepolia smart wallet, or seed 4 pre-configured demo agents to observe live bidding.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={onOpenDeployModal}
                className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-sky-500/20 transition hover:bg-sky-500 cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Deploy My Agent</span>
              </button>
              <button
                onClick={onSeedDemo}
                className="inline-flex items-center gap-2 rounded-xl border border-sky-200 bg-sky-50 px-4 py-2.5 text-xs font-bold text-sky-700 transition hover:bg-sky-100 cursor-pointer"
              >
                <Sparkles className="h-4 w-4 text-sky-600" />
                <span>Seed 4 Demo Agents</span>
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Viem Wallet & Keys Modal */}
      {activeKeyModalAgent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
          <div className="relative w-full max-w-lg rounded-3xl border border-sky-100 bg-white p-6 shadow-2xl shadow-sky-500/10">
            <button
              onClick={() => setActiveKeyModalAgent(null)}
              className="absolute right-4 top-4 rounded-full p-1 text-slate-400 hover:bg-slate-100 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2.5 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-100 text-sky-600">
                <Key className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">{activeKeyModalAgent.name} - Viem Wallet</h3>
                <p className="text-[11px] text-slate-500">Autonomous Cryptographic Account</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Public Address (EVM)</label>
                <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-200 font-mono text-slate-800">
                  <span className="truncate">{activeKeyModalAgent.ethAddress}</span>
                  <button
                    onClick={() => handleCopy(activeKeyModalAgent.ethAddress)}
                    className="text-slate-400 hover:text-sky-600 pl-2 cursor-pointer"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] font-bold uppercase text-slate-400">Private Key (For Autonomous Signing)</label>
                  <button
                    onClick={() => setRevealPrivateKey(!revealPrivateKey)}
                    className="text-[10px] text-sky-600 hover:underline inline-flex items-center gap-1 cursor-pointer"
                  >
                    {revealPrivateKey ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                    <span>{revealPrivateKey ? 'Hide' : 'Reveal'}</span>
                  </button>
                </div>
                <div className="flex items-center justify-between bg-slate-900 p-2.5 rounded-xl border border-slate-800 font-mono text-sky-300">
                  <span className="truncate">
                    {revealPrivateKey
                      ? activeKeyModalAgent.privateKey
                      : activeKeyModalAgent.privateKey.slice(0, 12) + '••••••••••••••••••••••••••••••••'}
                  </span>
                  <button
                    onClick={() => handleCopy(activeKeyModalAgent.privateKey)}
                    className="text-slate-400 hover:text-sky-400 pl-2 cursor-pointer"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3 text-[11px] text-emerald-900">
                <span className="font-bold">Locked Performance Stake:</span> {activeKeyModalAgent.stakeLockedEth} ETH held in CerseiEscrow contract.
              </div>
            </div>
          </div>
        </div>
      )}

    </section>
  );
};
