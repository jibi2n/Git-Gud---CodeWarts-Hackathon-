import { readFileSync } from 'fs';
import { join } from 'path';
import type { Child, CaseloadEntry } from '../types';
import { predictionService } from './prediction';

interface CaseloadData {
  metadata: {
    cluster: string;
    socialWorkerName: string;
    socialWorkerRole: string;
    totalFamilies: number;
    totalFlagged: number;
    generatedAt: string;
  };
  flaggedChildren: Child[];
}

let caseloadCache: CaseloadData | null = null;

function loadCaseload(): CaseloadData {
  if (caseloadCache) return caseloadCache;
  const filePath = join(process.cwd(), 'data', 'synthetic_caseload.json');
  const raw = readFileSync(filePath, 'utf-8');
  caseloadCache = JSON.parse(raw) as CaseloadData;
  return caseloadCache;
}

export class CaseloadService {
  getFlaggedChildren(): CaseloadEntry[] {
    const data = loadCaseload();
    const entries: CaseloadEntry[] = [];

    for (const child of data.flaggedChildren) {
      const prediction = predictionService.getPrediction(child.id);
      if (prediction) {
        entries.push({ child, prediction, interventionScheduled: false });
      }
    }

    entries.sort((a, b) => b.prediction.dropoutProbability90d - a.prediction.dropoutProbability90d);
    return entries;
  }

  getChildById(id: string): Child | null {
    const data = loadCaseload();
    return data.flaggedChildren.find(c => c.id === id) ?? null;
  }

  getMetadata() {
    return loadCaseload().metadata;
  }
}

export const caseloadService = new CaseloadService();
