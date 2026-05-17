export type CircleChain = "ARC-TESTNET" | "ETH" | "MATIC" | "AVAX" | "SOL" | "XLM";

interface ChainMeta {
  usdcAddress: string;
  explorer: string;
  label: string;
  isTestnet: boolean;
}

const CHAINS: Record<CircleChain, ChainMeta> = {
  "ARC-TESTNET": {
    usdcAddress: "0x3600000000000000000000000000000000000000",
    explorer: "https://testnet.arcscan.app/tx",
    label: "Arc Testnet",
    isTestnet: true,
  },
  ETH: {
    usdcAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    explorer: "https://etherscan.io/tx",
    label: "Ethereum",
    isTestnet: false,
  },
  MATIC: {
    usdcAddress: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
    explorer: "https://polygonscan.com/tx",
    label: "Polygon",
    isTestnet: false,
  },
  AVAX: {
    usdcAddress: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6",
    explorer: "https://snowtrace.io/tx",
    label: "Avalanche",
    isTestnet: false,
  },
  SOL: {
    usdcAddress: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    explorer: "https://solscan.io/tx",
    label: "Solana",
    isTestnet: false,
  },
  XLM: {
    usdcAddress: "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN",
    explorer: "https://stellar.expert/explorer/public/tx",
    label: "Stellar",
    isTestnet: false,
  },
};

export function getChainConfig(): { chain: CircleChain } & ChainMeta {
  const chain = (process.env.BLOCKCHAIN ?? "ARC-TESTNET") as CircleChain;
  const config = CHAINS[chain];
  if (!config) {
    throw new Error(`Unsupported BLOCKCHAIN="${chain}". Valid: ${Object.keys(CHAINS).join(", ")}`);
  }
  return { chain, ...config };
}
