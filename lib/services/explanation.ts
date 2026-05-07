import type { Prediction, RiskDriver } from '../types';
import { predictionService } from './prediction';

export class ExplanationService {
  getTopDrivers(childId: string): RiskDriver[] {
    const prediction = predictionService.getPrediction(childId);
    return prediction?.topRiskDrivers ?? [];
  }

  getExplanation(prediction: Prediction): {
    topDrivers: RiskDriver[];
    maxShapValue: number;
  } {
    const topDrivers = prediction.topRiskDrivers.slice(0, 3);
    const maxShapValue = Math.max(...topDrivers.map(d => Math.abs(d.shapValue)), 0.01);
    return { topDrivers, maxShapValue };
  }
}

export const explanationService = new ExplanationService();
