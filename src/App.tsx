import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { agentEngine } from './engine/agentEngine';
import { connectMetaMask } from './services/web3';
import type { Agent, Task, ActivityLog, SlashingEvent, ProtocolStats, AgentCategory } from './types';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { RegistrationPortal } from './components/RegistrationPortal';
import { AgentMarketplace } from './components/AgentMarketplace';
import { LivePipeline } from './components/LivePipeline';
import { JuryArena } from './components/JuryArena';
import { ActivityFeed } from './components/ActivityFeed';
import { Footer } from './components/Footer';
import { AgentBuilderModal } from './components/AgentBuilderModal';
import { TaskModal } from './components/TaskModal';
import { TaskInspectorModal } from './components/TaskInspectorModal';
import { MLIntelligenceModal } from './components/MLIntelligenceModal';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'marketplace' | 'pipeline' | 'jury' | 'register' | 'ledger'>('overview');

  // State from Engine
  const [agents, setAgents] = useState<Agent[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [slashingEvents, setSlashingEvents] = useState<SlashingEvent[]>([]);
  const [stats, setStats] = useState<ProtocolStats>({
    tvlInEscrowEth: 0,
    totalTasksCompleted: 0,
    activeAgentsCount: 0,
    totalSlashedEth: 0,
    totalPayoutsEth: 0,
  });

  // Web3 / MetaMask state
  const [humanAddress, setHumanAddress] = useState<`0x${string}` | null>(null);
  const [humanBalanceEth, setHumanBalanceEth] = useState<string>('0.000');
  const [chainName, setChainName] = useState<string>('Ethereum Sepolia');
  const [isWalletConnected, setIsWalletConnected] = useState(false);

  // Modals
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isMLModalOpen, setIsMLModalOpen] = useState(false);
  const [selectedTaskForInspection, setSelectedTaskForInspection] = useState<Task | null>(null);
  const [prefillTaskCategory, setPrefillTaskCategory] = useState<AgentCategory>('finance');

  // Sync engine
  const refreshEngineState = () => {
    setAgents([...agentEngine.getAgents()]);
    setTasks([...agentEngine.getTasks()]);
    setLogs([...agentEngine.getLogs()]);
    setSlashingEvents([...agentEngine.getSlashingEvents()]);
    setStats(agentEngine.getStats());

    if (selectedTaskForInspection) {
      const updated = agentEngine.getTasks().find((t) => t.id === selectedTaskForInspection.id);
      if (updated) setSelectedTaskForInspection(updated);
    }
  };

  useEffect(() => {
    refreshEngineState();
    const unsubscribe = agentEngine.subscribe(() => {
      refreshEngineState();
    });
    return () => unsubscribe();
  }, []);

  // Listen to MetaMask network/account changes in real time
  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      const syncMetaMask = async () => {
        if (localStorage.getItem('cersei_wallet_disconnected') === 'true') {
          return;
        }
        try {
          const accounts: string[] = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts && accounts.length > 0) {
            const { address, balanceEth, chainName: activeChain } = await connectMetaMask();
            setHumanAddress(address);
            setHumanBalanceEth(balanceEth);
            setChainName(activeChain);
            setIsWalletConnected(true);
            agentEngine.userAddress = address;
          }
        } catch {}
      };

      syncMetaMask();

      const handleAccountsChanged = (accounts: string[]) => {
        if (!accounts || accounts.length === 0) {
          handleDisconnectWallet();
        } else {
          syncMetaMask();
        }
      };

      window.ethereum.on?.('accountsChanged', handleAccountsChanged);
      window.ethereum.on?.('chainChanged', syncMetaMask);

      return () => {
        window.ethereum?.removeListener?.('accountsChanged', handleAccountsChanged);
        window.ethereum?.removeListener?.('chainChanged', syncMetaMask);
      };
    }
  }, []);

  // Connect MetaMask Handler
  const handleConnectWallet = async () => {
    localStorage.removeItem('cersei_wallet_disconnected');
    try {
      const { address, balanceEth, chainName: activeChain } = await connectMetaMask(true);
      setHumanAddress(address);
      setHumanBalanceEth(balanceEth);
      setChainName(activeChain);
      setIsWalletConnected(true);
      agentEngine.userAddress = address;

      confetti({
        particleCount: 40,
        spread: 50,
        origin: { y: 0.85 },
        colors: ['#10b981', '#34d399', '#6ee7b7'],
      });
    } catch (err: any) {
      if (err.message && !err.message.includes('cancelled')) {
        alert(err.message || 'Failed to connect MetaMask');
      }
    }
  };

  // Disconnect / Logout Wallet Handler
  const handleDisconnectWallet = () => {
    setHumanAddress(null);
    setHumanBalanceEth('0.000');
    setIsWalletConnected(false);
    localStorage.setItem('cersei_wallet_disconnected', 'true');
    agentEngine.userAddress = '0x71C84093D870B9fC8F8A38F705De5c79A16e91f0';
  };

  const handleCommissionTask = (params: {
    title: string;
    description: string;
    category: AgentCategory;
    inputData: string;
    outputRequirements: string;
    budgetEth: number;
    workerStakeRequiredEth: number;
    deadlineMinutes: number;
    strictness: 'standard' | 'high_quorum';
  }) => {
    agentEngine.postTask(params);
    setActiveTab('pipeline');
  };

  const handleQuickTask = (params: {
    title: string;
    description: string;
    category: AgentCategory;
    budgetEth: number;
    workerStakeRequiredEth: number;
  }) => {
    agentEngine.postTask({
      title: params.title,
      description: params.description,
      category: params.category,
      inputData: 'Payload: Automated system request.',
      outputRequirements: 'Provide verified, deterministic JSON formatted report with zero hallucinations.',
      budgetEth: params.budgetEth,
      workerStakeRequiredEth: params.workerStakeRequiredEth,
      deadlineMinutes: 30,
      strictness: 'standard',
    });
    setActiveTab('pipeline');
  };

  const handleSelectAgentForTask = (agent: Agent) => {
    setPrefillTaskCategory(agent.category);
    setIsTaskModalOpen(true);
  };

  const handleSeedDemo = () => {
    agentEngine.seedDemoAgents();
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#0284c7', '#38bdf8', '#7dd3fc'],
    });
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all tasks, agents, and logs to default?')) {
      agentEngine.resetAll();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50/40 via-white to-sky-50/20 text-slate-900 flex flex-col font-sans selection:bg-sky-500 selection:text-white">
      
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenTaskModal={() => setIsTaskModalOpen(true)}
        onOpenMLModal={() => setIsMLModalOpen(true)}
        onSeedDemo={handleSeedDemo}
        onReset={handleReset}
        humanAddress={humanAddress}
        humanBalanceEth={humanBalanceEth}
        chainName={chainName}
        isWalletConnected={isWalletConnected}
        onConnectWallet={handleConnectWallet}
        onDisconnectWallet={handleDisconnectWallet}
        agentCount={agents.length}
      />

      {/* Main Content Rendered by Tab (Uncluttered) */}
      <main className="flex-1">
        
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div>
            <Hero
              stats={stats}
              onQuickTask={handleQuickTask}
              onNavigateToRegister={() => setActiveTab('register')}
            />
            <LivePipeline
              tasks={tasks}
              onSelectTask={(task) => setSelectedTaskForInspection(task)}
              onOpenTaskModal={() => setIsTaskModalOpen(true)}
            />
            <AgentMarketplace
              agents={agents}
              onOpenDeployModal={() => setActiveTab('register')}
              onSeedDemo={handleSeedDemo}
              onSelectAgentForTask={handleSelectAgentForTask}
            />
          </div>
        )}

        {/* TAB 2: LIVE PIPELINE ONLY */}
        {activeTab === 'pipeline' && (
          <div className="py-8">
            <LivePipeline
              tasks={tasks}
              onSelectTask={(task) => setSelectedTaskForInspection(task)}
              onOpenTaskModal={() => setIsTaskModalOpen(true)}
            />
          </div>
        )}

        {/* TAB 3: AGENT MARKETPLACE ONLY */}
        {activeTab === 'marketplace' && (
          <div className="py-8">
            <AgentMarketplace
              agents={agents}
              onOpenDeployModal={() => setActiveTab('register')}
              onSeedDemo={handleSeedDemo}
              onSelectAgentForTask={handleSelectAgentForTask}
            />
          </div>
        )}

        {/* TAB 4: JURY ARENA */}
        {activeTab === 'jury' && (
          <div className="py-8">
            <JuryArena
              tasks={tasks}
              slashingEvents={slashingEvents}
            />
          </div>
        )}

        {/* TAB 5: REGISTER AGENT (ONBOARDING PORTAL) */}
        {activeTab === 'register' && (
          <RegistrationPortal
            humanAddress={humanAddress}
            humanBalanceEth={humanBalanceEth}
            isWalletConnected={isWalletConnected}
            onConnectWallet={handleConnectWallet}
            onAgentRegistered={(_newAgent) => {
              confetti({
                particleCount: 70,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#0ea5e9', '#38bdf8', '#7dd3fc'],
              });
            }}
            onNavigateToMarketplace={() => setActiveTab('marketplace')}
          />
        )}

        {/* TAB 6: ON-CHAIN LEDGER STREAM */}
        {activeTab === 'ledger' && (
          <div className="py-8">
            <ActivityFeed logs={logs} chainName={chainName} />
          </div>
        )}

      </main>

      {/* Footer */}
      <Footer />

      {/* Modals & Drawers */}
      <AgentBuilderModal
        isOpen={isDeployModalOpen}
        onClose={() => setIsDeployModalOpen(false)}
        onDeploy={(p) => {
          agentEngine.createAgent(p);
          setIsDeployModalOpen(false);
          setActiveTab('marketplace');
        }}
      />

      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSubmit={handleCommissionTask}
        prefillCategory={prefillTaskCategory}
      />

      <TaskInspectorModal
        task={selectedTaskForInspection}
        onClose={() => setSelectedTaskForInspection(null)}
        chainName={chainName}
      />

      <MLIntelligenceModal
        isOpen={isMLModalOpen}
        onClose={() => setIsMLModalOpen(false)}
      />

    </div>
  );
};

export default App;
