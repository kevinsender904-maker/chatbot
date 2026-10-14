import { SeverityLevel } from './symptomAnalyzer';
import { TrendStatus } from './healthTrendAnalyzer';

export enum RiskLevel {
  LowRisk = 'Low Risk',
  ModerateRisk = 'Moderate Risk',
  HighRisk = 'High Risk',
  CriticalRisk = 'Critical Risk'
}

export interface RiskProfile {
  level: RiskLevel;
  reasons: string[];
}

export function calculateRisk(
  symptomCount: number,
  severity: SeverityLevel,
  isEmergency: boolean,
  trend: TrendStatus
): RiskProfile {
  const reasons: string[] = [];

  if (isEmergency) {
    reasons.push('Emergency triggers detected.');
    return { level: RiskLevel.CriticalRisk, reasons };
  }

  if (severity === SeverityLevel.High) {
    reasons.push('High severity symptoms reported.');
  }
  if (symptomCount > 4) {
    reasons.push('Multiple concurrent symptoms (more than 4).');
  }
  if (trend === TrendStatus.Worsening) {
    reasons.push('Health trend is worsening over time.');
  }

  let level = RiskLevel.LowRisk;
  
  if (severity === SeverityLevel.High || (severity === SeverityLevel.Medium && trend === TrendStatus.Worsening)) {
    level = RiskLevel.HighRisk;
  } else if (severity === SeverityLevel.Medium || symptomCount >= 3) {
    level = RiskLevel.ModerateRisk;
  }

  if (reasons.length === 0) {
    reasons.push('Standard condition with mild symptoms.');
  }

  return { level, reasons };
}
