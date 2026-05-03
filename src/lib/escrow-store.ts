import fs from "fs";
import path from "path";

export type EscrowStatus = "pending" | "funded" | "completed" | "disputed" | "cancelled";

export interface Milestone {
  id: string;
  description: string;
  amount: number;
  released: boolean;
  releasedAt?: string;
  txId?: string;
}

export interface Escrow {
  id: string;
  title: string;
  buyerAddress: string;
  sellerAddress: string;
  totalAmount: number;
  currency: string;
  status: EscrowStatus;
  milestones: Milestone[];
  invoiceRef: string;
  createdAt: string;
  fundedAt?: string;
  fundTxId?: string;
  escrowWalletId: string;
}

const STORE_PATH = path.join(process.cwd(), ".escrow-store.json");

function load(): Record<string, Escrow> {
  try {
    if (fs.existsSync(STORE_PATH)) {
      return JSON.parse(fs.readFileSync(STORE_PATH, "utf-8"));
    }
  } catch {
    // corrupted file — start fresh
  }
  return {};
}

function save(data: Record<string, Escrow>) {
  fs.writeFileSync(STORE_PATH, JSON.stringify(data, null, 2));
}

export const escrowStore = {
  list(): Escrow[] {
    return Object.values(load()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  get(id: string): Escrow | null {
    return load()[id] ?? null;
  },

  create(escrow: Escrow): Escrow {
    const data = load();
    data[escrow.id] = escrow;
    save(data);
    return escrow;
  },

  update(id: string, patch: Partial<Escrow>): Escrow {
    const data = load();
    if (!data[id]) throw new Error("Escrow not found");
    data[id] = { ...data[id], ...patch };
    save(data);
    return data[id];
  },

  releaseMilestone(escrowId: string, milestoneId: string, txId: string): Escrow {
    const data = load();
    const escrow = data[escrowId];
    if (!escrow) throw new Error("Escrow not found");

    const milestone = escrow.milestones.find((m) => m.id === milestoneId);
    if (!milestone) throw new Error("Milestone not found");
    if (milestone.released) throw new Error("Milestone already released");

    milestone.released = true;
    milestone.releasedAt = new Date().toISOString();
    milestone.txId = txId;

    const allReleased = escrow.milestones.every((m) => m.released);
    if (allReleased) escrow.status = "completed";

    save(data);
    return escrow;
  },
};
