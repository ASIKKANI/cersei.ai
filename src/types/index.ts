export type ModelEngine = 
  | 'groq-llama-3.3-70b'
  | 'groq-deepseek-r1'
  | 'gemini-2.5-flash'
  | 'deepseek-v3'
  | 'gpt-4o'
  | 'claude-3-7-sonnet'
  | 'custom-api';

export type AgentCategory = 
  | 'all'
  | 'lifestyle'
  | 'finance'
  | 'code_audit'
  | 'data_extraction'
  | 'jury_verifier'
  | 'sentiment'
  | 'security';

export interface Agent {
  id: string;
  name: string;
  role: string;
  description: string;
  avatar: string;
  category: AgentCategory;
  modelEngine: ModelEngine;
  groqApiKey?: string;
  groqModel?: string;
  customSystemPrompt?: string;
  capabilities: string[];
  ethAddress: `0x${string}`;
  privateKey: string;
  balanceEth: number;
  stakeLockedEth: number;
  reputation: number; // 0 to 100
  completedTasks: number;
  winRate: number; // percentage
  hourlyRateEth: number;
  isCustom: boolean;
  status: 'online' | 'busy' | 'slashed' | 'idle';
  totalEarningsEth: number;
  createdAt: number;
}

export interface Bid {
  id: string;
  taskId: string;
  agentId: string;
  agentName: string;
  agentAvatar: string;
  agentReputation: number;
  proposedCostEth: number;
  estimatedTimeSec: number;
  stakeOfferedEth: number;
  timestamp: number;
}

export interface TaskResult {
  outputJson: Record<string, any> | string;
  rawText: string;
  executionTimeMs: number;
  modelUsed: string;
  proofHash: string;
  timestamp: number;
  isLiveGroqCall?: boolean;
}

export type VoteType = 'PASS' | 'PARTIAL' | 'FAIL';

export interface JuryVote {
  verifierId: string;
  verifierName: string;
  verifierAvatar: string;
  vote: VoteType;
  scorePercentage: number;
  reasoning: string;
  confidence: number;
  stakeLockedEth: number;
  isHonestConsensus: boolean;
}

export interface JuryConsensus {
  votes: JuryVote[];
  overallVerdict: VoteType;
  consensusPercentage: number;
  totalVerifierFeesEth: number;
  slashedVerifiersCount: number;
}

export type TaskStatus = 
  | 'auction'
  | 'escrow_locked'
  | 'executing'
  | 'jury_deliberating'
  | 'settled'
  | 'slashed'
  | 'disputed';

export interface Task {
  id: string;
  title: string;
  description: string;
  category: AgentCategory;
  inputData: string;
  outputRequirements: string;
  budgetEth: number;
  workerStakeRequiredEth: number;
  deadlineMinutes: number;
  strictness: 'standard' | 'high_quorum';
  status: TaskStatus;
  createdAt: number;
  creatorAddress: `0x${string}`;
  assignedWorkerId?: string;
  assignedWorkerName?: string;
  bids: Bid[];
  executionResult?: TaskResult;
  juryConsensus?: JuryConsensus;
  escrowTxHash?: string;
  settlementTxHash?: string;
  escrowAmountEth: number;
  isOnChain?: boolean;
  logs: string[];
}

export interface SlashingEvent {
  id: string;
  timestamp: number;
  targetAgentId: string;
  targetAgentName: string;
  reason: string;
  slashedAmountEth: number;
  txHash: string;
  recipientRefundEth: number;
}

export interface ActivityLog {
  id: string;
  timestamp: number;
  type: 'TASK_POSTED' | 'BID_PLACED' | 'ESCROW_LOCKED' | 'EXECUTION_SUBMITTED' | 'JURY_VOTED' | 'SETTLED' | 'SLASHED';
  title: string;
  description: string;
  txHash: string;
  amountEth?: number;
  taskId?: string;
  isOnChain?: boolean;
}

export interface ProtocolStats {
  tvlInEscrowEth: number;
  totalTasksCompleted: number;
  activeAgentsCount: number;
  totalSlashedEth: number;
  totalPayoutsEth: number;
}
