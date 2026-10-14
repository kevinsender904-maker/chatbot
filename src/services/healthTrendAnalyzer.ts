import { SeverityLevel, classifySeverity } from './symptomAnalyzer';

export enum TrendStatus {
  Improving = 'Improving',
  Stable = 'Stable',
  Worsening = 'Worsening',
  Unknown = 'Unknown'
}

export interface TrendAnalysis {
  status: TrendStatus;
  description: string;
}

export function analyzeHealthTrend(historicalSymptomsArray: string[][]): TrendAnalysis {
  if (!historicalSymptomsArray || historicalSymptomsArray.length < 2) {
    return {
      status: TrendStatus.Unknown,
      description: 'Not enough history to determine a trend.'
    };
  }

  const previousSymptoms = historicalSymptomsArray[historicalSymptomsArray.length - 2];
  const currentSymptoms = historicalSymptomsArray[historicalSymptomsArray.length - 1];

  const prevSeverity = classifySeverity(previousSymptoms);
  const currSeverity = classifySeverity(currentSymptoms);

  const severityValues = {
    [SeverityLevel.Low]: 1,
    [SeverityLevel.Medium]: 2,
    [SeverityLevel.High]: 3,
    [SeverityLevel.Emergency]: 4,
  };

  const prevVal = severityValues[prevSeverity];
  const currVal = severityValues[currSeverity];

  if (currVal > prevVal || currentSymptoms.length > previousSymptoms.length) {
    return {
      status: TrendStatus.Worsening,
      description: `Symptoms appear to be worsening. Symptom count went from ${previousSymptoms.length} to ${currentSymptoms.length}.`
    };
  } else if (currVal < prevVal || currentSymptoms.length < previousSymptoms.length) {
    return {
      status: TrendStatus.Improving,
      description: 'Symptoms appear to be improving or subsiding.'
    };
  } else {
    return {
      status: TrendStatus.Stable,
      description: 'Symptoms appear to be stable.'
    };
  }
}
