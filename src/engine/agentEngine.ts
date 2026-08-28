import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';
import type { Agent, Task, TaskResult, JuryVote, SlashingEvent, ActivityLog, ProtocolStats, AgentCategory, ModelEngine } from '../types';
import { callGroqApi } from '../services/groq';

// Helper to generate realistic fake Tx Hash on Base Sepolia
export const generateTxHash = (): string => {
  const chars = '0123456789abcdef';
  let hash = '0x';
  for (let i = 0; i < 64; i++) {
    hash += chars[Math.floor(Math.random() * chars.length)];
  }
  return hash;
};

// Initial empty storage keys
const STORAGE_KEY_AGENTS = 'cersei_agents_v1';
const STORAGE_KEY_TASKS = 'cersei_tasks_v1';
const STORAGE_KEY_LOGS = 'cersei_logs_v1';
const STORAGE_KEY_SLASHING = 'cersei_slashing_v1';

class AgentEconomyEngine {
  private agents: Agent[] = [];
  private tasks: Task[] = [];
  private logs: ActivityLog[] = [];
  private slashingEvents: SlashingEvent[] = [];
  private listeners: Set<() => void> = new Set();
  public userEthBalance: number = 2.50;
  public userAddress: `0x${string}` = '0x71C84093D870B9fC8F8A38F705De5c79A16e91f0';

  constructor() {
    this.loadState();
  }

  public subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public notify() {
    this.saveState();
    this.listeners.forEach((listener) => listener());
  }

  private loadState() {
    try {
      const savedAgents = localStorage.getItem(STORAGE_KEY_AGENTS);
      const savedTasks = localStorage.getItem(STORAGE_KEY_TASKS);
      const savedLogs = localStorage.getItem(STORAGE_KEY_LOGS);
      const savedSlashing = localStorage.getItem(STORAGE_KEY_SLASHING);

      if (savedAgents) this.agents = JSON.parse(savedAgents);
      if (savedTasks) this.tasks = JSON.parse(savedTasks);
      if (savedLogs) this.logs = JSON.parse(savedLogs);
      if (savedSlashing) this.slashingEvents = JSON.parse(savedSlashing);
    } catch (e) {
      console.warn('Failed to load local state:', e);
    }
  }

  private saveState() {
    try {
      localStorage.setItem(STORAGE_KEY_AGENTS, JSON.stringify(this.agents));
      localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(this.tasks));
      localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(this.logs));
      localStorage.setItem(STORAGE_KEY_SLASHING, JSON.stringify(this.slashingEvents));
    } catch (e) {
      console.warn('Failed to save state:', e);
    }
  }

  public getAgents(): Agent[] {
    return this.agents;
  }

  public getTasks(): Task[] {
    return this.tasks;
  }

  public getLogs(): ActivityLog[] {
    return this.logs;
  }

  public getSlashingEvents(): SlashingEvent[] {
    return this.slashingEvents;
  }

  public getStats(): ProtocolStats {
    const tvlInEscrow = this.tasks
      .filter((t) => t.status === 'escrow_locked' || t.status === 'executing' || t.status === 'jury_deliberating')
      .reduce((sum, t) => sum + t.escrowAmountEth, 0);

    const totalTasksCompleted = this.tasks.filter((t) => t.status === 'settled').length;
    const activeAgents = this.agents.filter((a) => a.status === 'online').length;
    const totalSlashed = this.slashingEvents.reduce((sum, s) => sum + s.slashedAmountEth, 0);
    const totalPayouts = this.tasks
      .filter((t) => t.status === 'settled')
      .reduce((sum, t) => sum + t.budgetEth, 0);

    return {
      tvlInEscrowEth: Number(tvlInEscrow.toFixed(4)),
      totalTasksCompleted,
      activeAgentsCount: activeAgents,
      totalSlashedEth: Number(totalSlashed.toFixed(4)),
      totalPayoutsEth: Number(totalPayouts.toFixed(4)),
    };
  }

  public addAgent(agent: Agent, txHash: string = generateTxHash()) {
    this.agents.unshift(agent);
    this.addLog({
      type: 'TASK_POSTED',
      title: `Agent Registered: ${agent.name}`,
      description: `Provisioned smart account ${agent.ethAddress.slice(0, 8)}... with ${agent.stakeLockedEth} ETH bond.`,
      txHash,
      amountEth: agent.stakeLockedEth,
      isOnChain: true,
    });
    this.notify();
  }

  public createAgent(params: {
    name: string;
    role: string;
    description: string;
    avatar?: string;
    category: AgentCategory;
    modelEngine: ModelEngine;
    groqApiKey?: string;
    groqModel?: string;
    customSystemPrompt?: string;
    capabilities: string[];
    initialStakeEth: number;
    hourlyRateEth: number;
  }): Agent {
    const privateKey = generatePrivateKey();
    const account = privateKeyToAccount(privateKey);

    const avatar =
      params.avatar ||
      `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(params.name)}&backgroundColor=e0f2fe,bae6fd`;

    const newAgent: Agent = {
      id: `agent_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      name: params.name,
      role: params.role,
      description: params.description,
      avatar,
      category: params.category,
      modelEngine: params.modelEngine,
      groqApiKey: params.groqApiKey,
      groqModel: params.groqModel,
      customSystemPrompt: params.customSystemPrompt,
      capabilities: params.capabilities,
      ethAddress: account.address,
      privateKey,
      balanceEth: 0.1,
      stakeLockedEth: params.initialStakeEth,
      reputation: 80,
      completedTasks: 0,
      winRate: 100,
      hourlyRateEth: params.hourlyRateEth,
      isCustom: true,
      status: 'online',
      totalEarningsEth: 0,
      createdAt: Date.now(),
    };

    this.addAgent(newAgent);
    return newAgent;
  }

  public seedDemoAgents() {
    if (this.agents.length > 0) return;

    const demoData = [
      {
        name: 'Groq-Llama3.3-Ultra',
        role: 'Sub-Second Financial Extractor',
        description: 'Powered by Groq LPUs running Llama-3.3-70B at ~480 tokens/sec with deterministic JSON outputs.',
        category: 'finance' as AgentCategory,
        modelEngine: 'groq-llama-3.3-70b' as ModelEngine,
        groqModel: 'llama-3.3-70b-versatile',
        capabilities: ['groq-lpu', 'sub-second-latency', 'json-schema', 'financial-ocr'],
        initialStakeEth: 0.25,
        hourlyRateEth: 0.015,
        reputation: 98,
        completedTasks: 64,
        winRate: 99,
        totalEarningsEth: 2.10,
      },
      {
        name: 'AegisCode-Audit',
        role: 'Solidity & Rust Smart Contract Auditor',
        description: 'Detects reentrancy, integer overflows, access control bugs, and flash loan attack vectors.',
        category: 'code_audit' as AgentCategory,
        modelEngine: 'claude-3-7-sonnet' as ModelEngine,
        capabilities: ['solidity-security', 'reentrancy-check', 'ast-parser', 'slither-rules'],
        initialStakeEth: 0.50,
        hourlyRateEth: 0.045,
        reputation: 99,
        completedTasks: 72,
        winRate: 99,
        totalEarningsEth: 3.20,
      },
      {
        name: 'DeepSentiment-X',
        role: 'Crypto Market Sentiment Arbiter',
        description: 'Analyzes multi-source newsfeeds and social telemetry to produce calibrated numerical sentiment indices.',
        category: 'sentiment' as AgentCategory,
        modelEngine: 'deepseek-v3' as ModelEngine,
        capabilities: ['nlp-sentiment', 'news-aggregation', 'volatility-score', 'macro-index'],
        initialStakeEth: 0.15,
        hourlyRateEth: 0.008,
        reputation: 88,
        completedTasks: 31,
        winRate: 92,
        totalEarningsEth: 0.65,
      },
      {
        name: 'ConsensusJury-Prime',
        role: 'Independent Verification Validator',
        description: 'Neutral referee agent running automated unit tests, schema assertions, and cross-model validation juries.',
        category: 'jury_verifier' as AgentCategory,
        modelEngine: 'gpt-4o' as ModelEngine,
        capabilities: ['jury-verification', 'schema-assertion', 'ground-truth-eval', 'slashing-judge'],
        initialStakeEth: 0.30,
        hourlyRateEth: 0.005,
        reputation: 97,
        completedTasks: 110,
        winRate: 100,
        totalEarningsEth: 0.55,
      }
    ];

    demoData.forEach((d) => {
      const privateKey = generatePrivateKey();
      const account = privateKeyToAccount(privateKey);
      this.agents.push({
        id: `agent_demo_${Math.random().toString(36).substring(2, 9)}`,
        name: d.name,
        role: d.role,
        description: d.description,
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(d.name)}&backgroundColor=e0f2fe,bae6fd`,
        category: d.category,
        modelEngine: d.modelEngine,
        groqModel: d.groqModel,
        capabilities: d.capabilities,
        ethAddress: account.address,
        privateKey,
        balanceEth: 0.2,
        stakeLockedEth: d.initialStakeEth,
        reputation: d.reputation,
        completedTasks: d.completedTasks,
        winRate: d.winRate,
        hourlyRateEth: d.hourlyRateEth,
        isCustom: false,
        status: 'online',
        totalEarningsEth: d.totalEarningsEth,
        createdAt: Date.now() - Math.floor(Math.random() * 86400000 * 5),
      });
    });

    this.addLog({
      type: 'TASK_POSTED',
      title: 'Demo Agent Network Provisioned',
      description: 'Connected 4 specialized worker and verification agents with Groq LPU accounts.',
      txHash: generateTxHash(),
    });

    this.notify();
  }

  public async postTask(params: {
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
  }): Promise<Task> {
    const taskId = `task_${Date.now()}`;
    const escrowTx = params.escrowTxHash || generateTxHash();

    // Deduct budget from user balance
    this.userEthBalance = Math.max(0, this.userEthBalance - params.budgetEth);

    const newTask: Task = {
      id: taskId,
      title: params.title,
      description: params.description,
      category: params.category,
      inputData: params.inputData,
      outputRequirements: params.outputRequirements,
      budgetEth: params.budgetEth,
      workerStakeRequiredEth: params.workerStakeRequiredEth,
      deadlineMinutes: params.deadlineMinutes,
      strictness: params.strictness,
      status: 'auction',
      createdAt: Date.now(),
      creatorAddress: this.userAddress,
      bids: [],
      escrowAmountEth: params.budgetEth,
      escrowTxHash: escrowTx,
      isOnChain: params.isOnChain,
      logs: [`[${new Date().toLocaleTimeString()}] Task commissioned. Escrow locked ${params.budgetEth} ETH (${escrowTx.slice(0, 10)}...).`],
    };

    this.tasks.unshift(newTask);

    this.addLog({
      type: 'ESCROW_LOCKED',
      title: `Escrow Locked: ${newTask.title}`,
      description: `Locked ${params.budgetEth} ETH into CerseiEscrow contract. Network auction broadcasted.`,
      txHash: escrowTx,
      amountEth: params.budgetEth,
      taskId: newTask.id,
      isOnChain: params.isOnChain,
    });

    this.notify();

    // Start autonomous pipeline execution asynchronously
    this.runAutonomousLifecycle(newTask);

    return newTask;
  }

  private async runAutonomousLifecycle(task: Task) {
    // Step 1: Open Reverse Auction (1.5s delay)
    await new Promise((r) => setTimeout(r, 1500));

    // Find eligible candidate agents
    const candidates = this.agents.filter((a) => a.status === 'online' && a.category !== 'jury_verifier');
    const biddingPool = candidates.length > 0 ? candidates : this.agents.filter((a) => a.status === 'online');

    if (biddingPool.length === 0) {
      task.logs.push(`[${new Date().toLocaleTimeString()}] No active worker agents discovered. Task waiting for bidders.`);
      this.notify();
      return;
    }

    // Generate competing bids from agents
    task.bids = biddingPool.slice(0, 4).map((agent) => {
      const discountFactor = 0.75 + Math.random() * 0.2;
      const proposedCost = Number((task.budgetEth * discountFactor).toFixed(4));
      const eta = agent.modelEngine.includes('groq') ? Math.floor(2 + Math.random() * 5) : Math.floor(15 + Math.random() * 45);

      return {
        id: `bid_${Date.now()}_${agent.id}`,
        taskId: task.id,
        agentId: agent.id,
        agentName: agent.name,
        agentAvatar: agent.avatar,
        agentReputation: agent.reputation,
        proposedCostEth: proposedCost,
        estimatedTimeSec: eta,
        stakeOfferedEth: task.workerStakeRequiredEth,
        timestamp: Date.now(),
      };
    });

    task.logs.push(`[${new Date().toLocaleTimeString()}] Reverse auction completed. Received ${task.bids.length} competing agent bids.`);
    this.notify();

    // Step 2: Winner Allocation & Worker Stake Lock (1.5s delay)
    await new Promise((r) => setTimeout(r, 1500));

    const winningBid = task.bids.sort((a, b) => (b.agentReputation / b.proposedCostEth) - (a.agentReputation / a.proposedCostEth))[0];
    const winningAgent = this.agents.find((a) => a.id === winningBid.agentId);

    if (!winningAgent) return;

    task.assignedWorkerId = winningAgent.id;
    task.assignedWorkerName = winningAgent.name;
    task.status = 'executing';
    winningAgent.status = 'busy';

    task.logs.push(`[${new Date().toLocaleTimeString()}] Task allocated to ${winningAgent.name} (Reputation: ${winningAgent.reputation}, Bid: ${winningBid.proposedCostEth} ETH).`);
    task.logs.push(`[${new Date().toLocaleTimeString()}] Worker performance bond (${task.workerStakeRequiredEth} ETH) locked in Escrow.`);

    this.addLog({
      type: 'BID_PLACED',
      title: `Bid Won by ${winningAgent.name}`,
      description: `Task #${task.id.slice(-6)} assigned at ${winningBid.proposedCostEth} ETH. Worker performance stake secured.`,
      txHash: generateTxHash(),
      amountEth: winningBid.proposedCostEth,
      taskId: task.id,
    });

    this.notify();

    // Step 3: Agent Execution (Live Groq call if API key provided, or realistic simulation)
    await new Promise((r) => setTimeout(r, 2000));

    const result = await this.executeAgentTask(task, winningAgent);
    task.executionResult = result;
    task.status = 'jury_deliberating';
    task.logs.push(`[${new Date().toLocaleTimeString()}] Execution deliverable submitted by ${winningAgent.name} (Latency: ${result.executionTimeMs}ms, Model: ${result.modelUsed}). Initializing Verification Jury.`);

    this.addLog({
      type: 'EXECUTION_SUBMITTED',
      title: `Deliverable Submitted by ${winningAgent.name}`,
      description: `Proof hash ${result.proofHash.slice(0, 10)}... generated via ${result.modelUsed}. 3 neutral jury nodes assigned.`,
      txHash: generateTxHash(),
      taskId: task.id,
    });

    this.notify();

    // Step 4: Jury Deliberation & Consensus (2.5s delay)
    await new Promise((r) => setTimeout(r, 2500));

    const verifiers = this.agents.filter((a) => a.category === 'jury_verifier');
    const juryPool = verifiers.length >= 3 ? verifiers.slice(0, 3) : this.agents.filter((a) => a.id !== winningAgent.id).slice(0, 3);

    const isMaliciousSim = Math.random() < 0.10; // 10% probability of failure/slashing simulation for demo variety
    const votes: JuryVote[] = juryPool.map((verifier, idx) => {
      if (isMaliciousSim && idx < 2) {
        return {
          verifierId: verifier.id,
          verifierName: verifier.name,
          verifierAvatar: verifier.avatar,
          vote: 'FAIL',
          scorePercentage: 35,
          reasoning: 'Output failed deterministic schema validation; missing mandatory financial sentiment coefficients and checksum.',
          confidence: 0.96,
          stakeLockedEth: 0.01,
          isHonestConsensus: true,
        };
      }

      return {
        verifierId: verifier.id,
        verifierName: verifier.name,
        verifierAvatar: verifier.avatar,
        vote: 'PASS',
        scorePercentage: 98,
        reasoning: 'Output strictly satisfies all schema invariants, AST syntax checks, and mathematical parity constraints.',
        confidence: 0.99,
        stakeLockedEth: 0.01,
        isHonestConsensus: true,
      };
    });

    const passCount = votes.filter((v) => v.vote === 'PASS').length;
    const overallVerdict: 'PASS' | 'FAIL' = passCount >= 2 ? 'PASS' : 'FAIL';

    task.juryConsensus = {
      votes,
      overallVerdict,
      consensusPercentage: overallVerdict === 'PASS' ? Math.round((passCount / votes.length) * 100) : 35,
      totalVerifierFeesEth: 0.003,
      slashedVerifiersCount: 0,
    };

    task.logs.push(`[${new Date().toLocaleTimeString()}] Verification Jury consensus reached: ${overallVerdict} (${passCount}/${votes.length} votes).`);
    this.notify();

    // Step 5: Settlement & Slashing Execution (1.5s delay)
    await new Promise((r) => setTimeout(r, 1500));

    const settlementTx = generateTxHash();
    task.settlementTxHash = settlementTx;

    if (overallVerdict === 'PASS') {
      task.status = 'settled';
      winningAgent.status = 'online';
      winningAgent.reputation = Math.min(100, winningAgent.reputation + 2);
      winningAgent.completedTasks += 1;
      winningAgent.totalEarningsEth += winningBid.proposedCostEth;
      winningAgent.balanceEth += winningBid.proposedCostEth;

      // Refund unused budget difference to user
      const refundEth = task.budgetEth - winningBid.proposedCostEth - 0.003;
      if (refundEth > 0) {
        this.userEthBalance += refundEth;
      }

      task.logs.push(`[${new Date().toLocaleTimeString()}] Settlement complete. Paid ${winningBid.proposedCostEth} ETH to ${winningAgent.name}. Worker stake returned.`);
      task.logs.push(`[${new Date().toLocaleTimeString()}] Settlement verified on network (${settlementTx.slice(0, 10)}...).`);

      this.addLog({
        type: 'SETTLED',
        title: `Task #${task.id.slice(-6)} Settled`,
        description: `Released ${winningBid.proposedCostEth} ETH to ${winningAgent.name}. Reputation increased to ${winningAgent.reputation}.`,
        txHash: settlementTx,
        amountEth: winningBid.proposedCostEth,
        taskId: task.id,
      });
    } else {
      // SLASHING TRIGGERED
      task.status = 'slashed';
      winningAgent.status = 'slashed';
      winningAgent.reputation = Math.max(20, winningAgent.reputation - 25);
      winningAgent.stakeLockedEth = Math.max(0, winningAgent.stakeLockedEth - task.workerStakeRequiredEth);

      // Refund 100% of task budget to user
      this.userEthBalance += task.budgetEth;

      const slashRecord: SlashingEvent = {
        id: `slash_${Date.now()}`,
        timestamp: Date.now(),
        targetAgentId: winningAgent.id,
        targetAgentName: winningAgent.name,
        reason: 'Verification Jury detected invalid/hallucinated schema output.',
        slashedAmountEth: task.workerStakeRequiredEth,
        txHash: settlementTx,
        recipientRefundEth: task.budgetEth,
      };

      this.slashingEvents.unshift(slashRecord);

      task.logs.push(`[${new Date().toLocaleTimeString()}] 🚨 SLASHER EXECUTED: Worker ${winningAgent.name} slashed ${task.workerStakeRequiredEth} ETH.`);
      task.logs.push(`[${new Date().toLocaleTimeString()}] Provider refunded 100% (${task.budgetEth} ETH).`);

      this.addLog({
        type: 'SLASHED',
        title: `🚨 Agent Slashed: ${winningAgent.name}`,
        description: `Slashed ${task.workerStakeRequiredEth} ETH for invalid output. Creator refunded.`,
        txHash: settlementTx,
        amountEth: task.workerStakeRequiredEth,
        taskId: task.id,
      });
    }

    this.notify();
  }

  private async executeAgentTask(task: Task, agent: Agent): Promise<TaskResult> {
    const proof = generateTxHash();

    // If agent has a Groq API key, perform a live real-time API call!
    if (agent.groqApiKey) {
      try {
        const groqResult = await callGroqApi({
          apiKey: agent.groqApiKey,
          model: agent.groqModel || 'llama-3.3-70b-versatile',
          prompt: `Task: ${task.title}\nDescription: ${task.description}\nInput Data: ${task.inputData}\nOutput Requirements: ${task.outputRequirements}`,
          systemPrompt: agent.customSystemPrompt || 'You are an autonomous economic worker on Cersei.ai. Provide precise, valid JSON output conforming to requirements.',
        });

        return {
          outputJson: groqResult.parsedJson || { result: groqResult.text },
          rawText: groqResult.text,
          executionTimeMs: groqResult.latencyMs,
          modelUsed: groqResult.model,
          proofHash: proof,
          timestamp: Date.now(),
          isLiveGroqCall: true,
        };
      } catch (err: any) {
        console.warn('Live Groq API call failed, using fallback:', err);
      }
    }

    // Default high-fidelity simulated output
    let outputJson: Record<string, any> = {};

    if (task.category === 'code_audit') {
      outputJson = {
        audit_verdict: 'SECURE_WITH_RECOMMENDATIONS',
        vulnerabilities_found: [
          {
            type: 'Reentrancy Protection',
            severity: 'MEDIUM',
            location: 'Contracts/Vault.sol:L84',
            recommendation: 'Apply nonReentrant modifier before state mutation.',
          },
        ],
        gas_optimization_score: 94,
        ast_checksum: proof.slice(0, 16),
      };
    } else if (task.category === 'finance' || task.category === 'sentiment') {
      outputJson = {
        extracted_entities: {
          ticker: 'TSLA',
          reported_deliveries: '484,507',
          yoy_growth_pct: 3.5,
          sentiment_score: 0.82,
          confidence_interval: [0.79, 0.85],
        },
        sources_verified: 4,
        semantic_integrity_hash: proof.slice(0, 20),
      };
    } else {
      outputJson = {
        parsed_records: 120,
        schema_conformance: '100%',
        execution_trace: `Processed under model ${agent.modelEngine}`,
        output_sha256: proof,
      };
    }

    const latency = agent.modelEngine.includes('groq')
      ? Math.floor(180 + Math.random() * 220)
      : Math.floor(420 + Math.random() * 850);

    return {
      outputJson,
      rawText: JSON.stringify(outputJson, null, 2),
      executionTimeMs: latency,
      modelUsed: agent.groqModel || agent.modelEngine,
      proofHash: proof,
      timestamp: Date.now(),
      isLiveGroqCall: false,
    };
  }

  private addLog(logData: Omit<ActivityLog, 'id' | 'timestamp'>) {
    const log: ActivityLog = {
      id: `log_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      timestamp: Date.now(),
      ...logData,
    };
    this.logs.unshift(log);
    if (this.logs.length > 50) this.logs.pop();
  }

  public resetAll() {
    this.agents = [];
    this.tasks = [];
    this.logs = [];
    this.slashingEvents = [];
    this.userEthBalance = 2.50;
    localStorage.removeItem(STORAGE_KEY_AGENTS);
    localStorage.removeItem(STORAGE_KEY_TASKS);
    localStorage.removeItem(STORAGE_KEY_LOGS);
    localStorage.removeItem(STORAGE_KEY_SLASHING);
    this.notify();
  }
}

export const agentEngine = new AgentEconomyEngine();
