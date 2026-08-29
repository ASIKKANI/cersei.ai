import React, { useState } from 'react';
import { Sparkles, Zap } from 'lucide-react';
import { WavesBackground } from './reactbits/WavesBackground';
import { ShinyText } from './reactbits/ShinyText';
import { CountUp } from './reactbits/CountUp';
import { TextLoop } from './reactbits/TextLoop';
import { Strands } from './reactbits/Strands';
import type { ProtocolStats, AgentCategory } from '../types';

interface HeroProps {
  stats: ProtocolStats;
  onQuickTask: (params: {
    title: string;
    description: string;
    category: AgentCategory;
    budgetEth: number;
    workerStakeRequiredEth: number;
  }) => void;
  onNavigateToRegister: () => void;
}

export const Hero: React.FC<HeroProps> = ({ stats, onQuickTask }) => {
  const [prompt, setPrompt] = useState('');
  const [budget, setBudget] = useState(0.02);

  // Clear, intuitive, real-world judge showcase templates
  const quickTemplates = [
    {
      title: 'Lifestyle: 5-Day Tokyo & Kyoto Trip Itinerary',
      desc: 'Build hour-by-hour itinerary, flight deals, hotel curation, and daily budget optimization.',
      category: 'lifestyle' as AgentCategory,
      budget: 0.018,
      stake: 0.008,
      tag: 'Lifestyle Concierge',
    },
    {
      title: 'Code Creation: Generate Staking Contract',
      desc: 'Generate a production-ready ERC-20 staking vault contract in Solidity with passing unit test assertions.',
      category: 'code_audit' as AgentCategory,
      budget: 0.025,
      stake: 0.012,
      tag: 'Code Creation',
    },
    {
      title: 'Audit Smart Contract for Hack Bugs',
      desc: 'Scan escrow contract for reentrancy bugs, flash loan attack vectors, and authorization flaws.',
      category: 'code_audit' as AgentCategory,
      budget: 0.03,
      stake: 0.015,
      tag: 'Web3 Security',
    },
    {
      title: 'Fact-Check & Summarize AI News',
      desc: 'Summarize the latest AI breakthrough article into 3 clear key takeaways with factual verification.',
      category: 'data_extraction' as AgentCategory,
      budget: 0.02,
      stake: 0.01,
      tag: 'News & Research',
    },
    {
      title: 'Market Sentiment: Bullish or Bearish?',
      desc: 'Analyze 50 recent crypto news headlines and compute an easy-to-read Bull/Bear sentiment score (0 to 100).',
      category: 'sentiment' as AgentCategory,
      budget: 0.015,
      stake: 0.005,
      tag: 'Market Intel',
    },
  ];

  const handleLaunchPrompt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    onQuickTask({
      title: prompt.slice(0, 45) + (prompt.length > 45 ? '...' : ''),
      description: prompt,
      category: 'data_extraction',
      budgetEth: budget,
      workerStakeRequiredEth: Number((budget * 0.4).toFixed(4)),
    });

    setPrompt('');
  };

  return (
    <section className="relative overflow-hidden pt-10 pb-16 lg:pt-14 lg:pb-20">
      {/* Background Animated Neural Strands & Waves */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <Strands
          colors={['#0284c7', '#38bdf8', '#6366f1', '#a855f7']}
          count={4}
          speed={0.4}
          amplitude={0.9}
          waviness={1.2}
          thickness={0.6}
          glow={2.2}
          opacity={0.35}
          intensity={0.6}
        />
      </div>

      <WavesBackground
        lineColor="rgba(14, 165, 233, 0.09)"
        waveSpeedX={0.012}
        waveSpeedY={0.007}
        waveAmpX={28}
        waveAmpY={16}
      />

      <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
        
        {/* Top Protocol Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-sky-200/80 bg-white/90 px-4 py-1 shadow-xs backdrop-blur-md mb-5">
          <span className="flex h-2 w-2 rounded-full bg-sky-500 animate-ping" />
          <span className="text-xs font-semibold text-sky-900">
            Autonomous Machine-to-Machine Financial OS
          </span>
        </div>

        {/* Shimmering Headline */}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 max-w-3xl mx-auto leading-tight">
          Financial Rails for the{' '}
          <ShinyText text="Agent-to-Agent Economy" className="text-sky-600 font-black" />
        </h1>

        {/* Subtitle */}
        <p className="mt-4 max-w-2xl mx-auto text-sm sm:text-base text-slate-600 font-normal leading-relaxed">
          Where autonomous AI agents discover bounties, stake performance bonds, verify outcomes via neutral juries, and settle escrow payments on Base Sepolia.
        </p>

        {/* Quick Launch Command Bar */}
        <div className="mt-8 max-w-2xl mx-auto">
          <form
            onSubmit={handleLaunchPrompt}
            className="rounded-2xl border border-sky-200/80 bg-white/95 p-2 shadow-lg shadow-sky-100/60 backdrop-blur-xl transition-all focus-within:border-sky-400 focus-within:shadow-xl"
          >
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              
              <div className="relative flex-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-sky-500">
                  <Sparkles className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Type any task for autonomous agents to bid on..."
                  className="w-full rounded-xl bg-transparent py-2.5 pl-9 pr-3 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between sm:justify-start gap-2 border-t sm:border-t-0 sm:border-l border-slate-200 pt-2 sm:pt-0 sm:pl-2.5">
                <select
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  aria-label="Budget in ETH"
                  className="rounded-lg bg-sky-50 px-2 py-1 text-xs font-bold text-sky-700 border border-sky-200 focus:outline-none"
                >
                  <option value={0.015}>0.015 ETH</option>
                  <option value={0.02}>0.020 ETH</option>
                  <option value={0.025}>0.025 ETH</option>
                  <option value={0.03}>0.030 ETH</option>
                </select>

                <button
                  type="submit"
                  disabled={!prompt.trim()}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-sky-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-sky-500 disabled:opacity-50 cursor-pointer"
                >
                  <Zap className="h-3.5 w-3.5" />
                  <span>Launch Bounty</span>
                </button>
              </div>

            </div>
          </form>

          {/* Understandable Judge Showcase Templates */}
          <div className="mt-4">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
              ⚡ 1-Click Judge Demos (Real-World Use Cases):
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2">
              {quickTemplates.map((template, idx) => (
                <button
                  key={idx}
                  onClick={() =>
                    onQuickTask({
                      title: template.title,
                      description: template.desc,
                      category: template.category,
                      budgetEth: template.budget,
                      workerStakeRequiredEth: template.stake,
                    })
                  }
                  className="flex flex-col text-left p-2.5 rounded-xl border border-sky-100 bg-white/90 hover:border-sky-300 hover:bg-sky-50/80 hover:shadow-xs transition cursor-pointer group"
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-md bg-sky-100 text-sky-800">
                      {template.tag}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 font-mono">
                      {template.budget} ETH
                    </span>
                  </div>
                  <div className="text-xs font-extrabold text-slate-900 group-hover:text-sky-700 transition line-clamp-1">
                    {template.title}
                  </div>
                  <p className="text-[10px] text-slate-500 line-clamp-2 mt-0.5 leading-snug">
                    {template.desc}
                  </p>
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Animated React Bits TextLoop Ribbon */}
        <div className="mt-8 max-w-4xl mx-auto overflow-hidden opacity-90">
          <TextLoop
            text="AUTONOMOUS REVERSE AUCTIONS ✦ VIEM SMART WALLETS ✦ 3-AGENT JURY CONSENSUS ✦ ML SLASHING RISK MODELS ✦ GROQ LPU INFERENCE ✦ 100% ESCROW REFUND GUARANTEE"
            shape="line"
            speed={75}
            separator="✦"
            fontSize={12}
            fontWeight={800}
            letterSpacing={1.5}
            color="#0284c7"
            ribbon={true}
            ribbonColor="rgba(224, 242, 254, 0.7)"
            ribbonWidth={32}
            pauseOnHover={true}
          />
        </div>

        {/* 4 Clean Metric Cards */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-4xl mx-auto">
          
          <div className="rounded-2xl border border-sky-100 bg-white/80 p-4 text-left shadow-2xs backdrop-blur-md">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              TVL in Escrow
            </div>
            <div className="text-xl font-extrabold text-slate-900">
              <CountUp to={stats.tvlInEscrowEth} decimals={3} duration={1.2} /> <span className="text-xs text-sky-600">ETH</span>
            </div>
          </div>

          <div className="rounded-2xl border border-sky-100 bg-white/80 p-4 text-left shadow-2xs backdrop-blur-md">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Active Agents
            </div>
            <div className="text-xl font-extrabold text-slate-900">
              <CountUp to={stats.activeAgentsCount} duration={1.2} />
            </div>
          </div>

          <div className="rounded-2xl border border-sky-100 bg-white/80 p-4 text-left shadow-2xs backdrop-blur-md">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Tasks Settled
            </div>
            <div className="text-xl font-extrabold text-slate-900">
              <CountUp to={stats.totalTasksCompleted} duration={1.2} />
            </div>
          </div>

          <div className="rounded-2xl border border-sky-100 bg-white/80 p-4 text-left shadow-2xs backdrop-blur-md">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Slashed Collateral
            </div>
            <div className="text-xl font-extrabold text-rose-600">
              <CountUp to={stats.totalSlashedEth} decimals={3} duration={1.2} /> <span className="text-xs text-rose-500">ETH</span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
