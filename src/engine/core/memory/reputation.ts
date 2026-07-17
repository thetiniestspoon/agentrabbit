// src/core/memory/reputation.ts
import type { StorageAdapter } from '../../adapters/storage/types.js';

export interface ScoreRecord {
  project: string;
  score: number;
  activity: string;
  dimensions: { alignment: number; depth: number; actionability: number; distinctiveness: number };
  timestamp?: string;
}

export interface AgentReputation {
  slug: string;
  averageScore: number;
  totalActions: number;
  scores: ScoreRecord[];
  bestDimension: string;
  worstDimension: string;
}

export interface ReputationStoreOptions {
  storage: StorageAdapter;
}

interface StoredReputation {
  agents: Record<string, {
    scores: ScoreRecord[];
    totalActions: number;
  }>;
}

export class ReputationStore {
  private storage: StorageAdapter;

  constructor(options: ReputationStoreOptions) {
    this.storage = options.storage;
  }

  async record(agentSlug: string, record: ScoreRecord): Promise<void> {
    const data = await this.load();

    if (!data.agents[agentSlug]) {
      data.agents[agentSlug] = { scores: [], totalActions: 0 };
    }

    record.timestamp = record.timestamp ?? new Date().toISOString();
    data.agents[agentSlug].scores.push(record);
    data.agents[agentSlug].totalActions++;

    // Keep last 100 scores per agent
    if (data.agents[agentSlug].scores.length > 100) {
      data.agents[agentSlug].scores = data.agents[agentSlug].scores.slice(-100);
    }

    await this.storage.writeReputation(data as unknown as Record<string, unknown>);
  }

  async get(agentSlug: string): Promise<AgentReputation | null> {
    const data = await this.load();
    const agentData = data.agents[agentSlug];
    if (!agentData || agentData.scores.length === 0) return null;

    return this.buildReputation(agentSlug, agentData);
  }

  async getAll(): Promise<Record<string, AgentReputation>> {
    const data = await this.load();
    const result: Record<string, AgentReputation> = {};

    for (const [slug, agentData] of Object.entries(data.agents)) {
      if (agentData.scores.length > 0) {
        result[slug] = this.buildReputation(slug, agentData);
      }
    }

    return result;
  }

  async rankByScore(): Promise<AgentReputation[]> {
    const all = await this.getAll();
    return Object.values(all).sort((a, b) => b.averageScore - a.averageScore);
  }

  private buildReputation(slug: string, data: { scores: ScoreRecord[]; totalActions: number }): AgentReputation {
    const avgScore = data.scores.reduce((s, r) => s + r.score, 0) / data.scores.length;

    // Aggregate dimension averages
    const dims = { alignment: 0, depth: 0, actionability: 0, distinctiveness: 0 };
    for (const s of data.scores) {
      dims.alignment += s.dimensions.alignment;
      dims.depth += s.dimensions.depth;
      dims.actionability += s.dimensions.actionability;
      dims.distinctiveness += s.dimensions.distinctiveness;
    }
    const count = data.scores.length;
    const dimAvgs = {
      alignment: dims.alignment / count,
      depth: dims.depth / count,
      actionability: dims.actionability / count,
      distinctiveness: dims.distinctiveness / count,
    };

    const entries = Object.entries(dimAvgs);
    const best = entries.reduce((a, b) => a[1] > b[1] ? a : b)[0];
    const worst = entries.reduce((a, b) => a[1] < b[1] ? a : b)[0];

    return {
      slug,
      averageScore: avgScore,
      totalActions: data.totalActions,
      scores: data.scores,
      bestDimension: best,
      worstDimension: worst,
    };
  }

  private async load(): Promise<StoredReputation> {
    const raw = await this.storage.readReputation();
    if (raw && typeof raw === 'object' && 'agents' in raw) {
      return raw as unknown as StoredReputation;
    }
    return { agents: {} };
  }
}
