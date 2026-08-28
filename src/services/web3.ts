import { createPublicClient, createWalletClient, custom, http, formatEther, parseEther, getAddress } from 'viem';
import { baseSepolia, sepolia } from 'viem/chains';

declare global {
  interface Window {
    ethereum?: any;
  }
}

export const BASE_SEPOLIA_CHAIN_ID = 84532;
export const ETHEREUM_SEPOLIA_CHAIN_ID = 11155111;

// Default Base Sepolia RPC Client
export const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http('https://sepolia.base.org'),
});

// Ethereum Sepolia RPC Client
export const sepoliaClient = createPublicClient({
  chain: sepolia,
  transport: http('https://rpc.sepolia.org'),
});

export interface WalletState {
  address: `0x${string}`;
  balanceEth: string;
  chainId: number;
  chainName: string;
}

/**
 * Connect to MetaMask and query balance & chain
 */
export async function connectMetaMask(): Promise<WalletState> {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('MetaMask is not installed. Please install the MetaMask extension to continue.');
  }

  // Request user accounts
  const accounts: string[] = await window.ethereum.request({
    method: 'eth_requestAccounts',
  });

  if (!accounts || accounts.length === 0) {
    throw new Error('No accounts selected in MetaMask.');
  }

  const address = getAddress(accounts[0]);
  const currentChainHex: string = await window.ethereum.request({ method: 'eth_chainId' });
  const chainId = parseInt(currentChainHex, 16);

  let chainName = 'Ethereum Sepolia';
  if (chainId === ETHEREUM_SEPOLIA_CHAIN_ID) {
    chainName = 'Ethereum Sepolia';
  } else if (chainId === BASE_SEPOLIA_CHAIN_ID) {
    chainName = 'Base Sepolia';
  } else {
    chainName = `Chain #${chainId}`;
  }

  // Fetch balance from MetaMask directly for the active chain
  let balanceEth = '0.000';
  try {
    const hexBal: string = await window.ethereum.request({
      method: 'eth_getBalance',
      params: [address, 'latest'],
    });
    balanceEth = Number(formatEther(BigInt(hexBal))).toFixed(4);
  } catch (e) {
    console.warn('Failed to query balance:', e);
  }

  return {
    address,
    balanceEth,
    chainId,
    chainName,
  };
}

/**
 * Switch network in MetaMask
 */
export async function switchToTestnet(targetChainId: number = BASE_SEPOLIA_CHAIN_ID): Promise<void> {
  if (!window.ethereum) return;
  const hexChainId = `0x${targetChainId.toString(16)}`;

  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: hexChainId }],
    });
  } catch (switchError: any) {
    if (switchError.code === 4902 && targetChainId === BASE_SEPOLIA_CHAIN_ID) {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId: '0x14a34',
            chainName: 'Base Sepolia Testnet',
            nativeCurrency: { name: 'Ethereum', symbol: 'ETH', decimals: 18 },
            rpcUrls: ['https://sepolia.base.org'],
            blockExplorerUrls: ['https://sepolia.basescan.org'],
          },
        ],
      });
    }
  }
}

/**
 * Send real Staking Deposit on-chain via MetaMask
 */
export async function sendStakingDepositViaMetaMask(
  agentAddress: string,
  amountEth: number
): Promise<string> {
  if (!window.ethereum) throw new Error('MetaMask is not available');

  const currentChainHex: string = await window.ethereum.request({ method: 'eth_chainId' });
  const chainId = parseInt(currentChainHex, 16);
  const chain = chainId === ETHEREUM_SEPOLIA_CHAIN_ID ? sepolia : baseSepolia;

  const walletClient = createWalletClient({
    chain,
    transport: custom(window.ethereum),
  });

  const [account] = await walletClient.getAddresses();
  if (!account) throw new Error('No connected account found in MetaMask');

  const validTargetAddress = getAddress(agentAddress.trim());

  const txHash = await walletClient.sendTransaction({
    account,
    to: validTargetAddress,
    value: parseEther(amountEth.toString()),
  });

  return txHash;
}

/**
 * Send real Escrow Lock on-chain via MetaMask for tasks
 */
export async function sendEscrowLockViaMetaMask(
  escrowContractAddress: string = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
  amountEth: number
): Promise<string> {
  if (!window.ethereum) throw new Error('MetaMask is not available');

  const currentChainHex: string = await window.ethereum.request({ method: 'eth_chainId' });
  const chainId = parseInt(currentChainHex, 16);
  const chain = chainId === ETHEREUM_SEPOLIA_CHAIN_ID ? sepolia : baseSepolia;

  const walletClient = createWalletClient({
    chain,
    transport: custom(window.ethereum),
  });

  const [account] = await walletClient.getAddresses();
  if (!account) throw new Error('No connected account found in MetaMask');

  const validEscrowAddress = getAddress(escrowContractAddress.trim());

  const txHash = await walletClient.sendTransaction({
    account,
    to: validEscrowAddress,
    value: parseEther(amountEth.toString()),
  });

  return txHash;
}
