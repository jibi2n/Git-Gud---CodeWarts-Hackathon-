import { readFileSync } from 'fs';
import { join } from 'path';
import type { Child, Prediction, RiskTier } from '../types';
import { getRiskTier } from '../constants';

let predictionsCache: Record<string, Prediction> | null = null;

function loadPredictions(): Record<string, Prediction> {
  if (predictionsCache) return predictionsCache;
  const filePath = join(process.cwd(), 'data', 'precomputed_predictions.json');
  const raw = readFileSync(filePath, 'utf-8');
  predictionsCache = JSON.parse(raw) as Record<string, Prediction>;
  return predictionsCache;
}

export class PredictionService {
  getPrediction(childId: string): Prediction | null {
    const predictions = loadPredictions();
    return predictions[childId] ?? null;
  }

  getAllFlaggedPredictions(): Record<string, Prediction> {
    const predictions = loadPredictions();
    const flagged: Record<string, Prediction> = {};
    for (const [id, pred] of Object.entries(predictions)) {
      if (pred.riskTier !== 'low') {
        flagged[id] = pred;
      }
    }
    return flagged;
  }

  computeRiskTier(probability: number): RiskTier {
    return getRiskTier(probability);
  }

  getSummary(): { criticalRisk: number; highRisk: number; moderateRisk: number; totalFlagged: number } {
    const predictions = loadPredictions();
    let critical = 0, high = 0, moderate = 0;
    for (const pred of Object.values(predictions)) {
      if (pred.riskTier === 'critical') critical++;
      else if (pred.riskTier === 'high') high++;
      else if (pred.riskTier === 'moderate') moderate++;
    }
    return {
      criticalRisk: critical,
      highRisk: high,
      moderateRisk: moderate,
      totalFlagged: critical + high + moderate,
    };
  }
}

export const predictionService = new PredictionService();
