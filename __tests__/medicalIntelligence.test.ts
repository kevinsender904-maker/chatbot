import { extractSymptoms } from '../src/services/symptomAnalyzer';
import { expandSymptoms } from '../src/services/semanticMatcher';
import { detectEmergency } from '../src/services/emergencyDetector';
import { calculateRisk, RiskLevel } from '../src/services/riskAssessment';
import { analyzeHealthTrend, TrendStatus } from '../src/services/healthTrendAnalyzer';

describe('Medical Intelligence Pipeline Tests', () => {

  describe('Symptom Extraction (Medical & Urdu Cases)', () => {
    it('should extract fever from English', () => {
      expect(extractSymptoms('I have a high fever')).toContain('fever');
    });
    it('should extract pain', () => {
      expect(extractSymptoms('There is pain in my back')).toContain('pain');
    });
    // Add 23 more medical test cases here...
  });

  describe('Emergency Detection Cases', () => {
    it('should detect chest pain as an emergency', () => {
      expect(detectEmergency('I have chest pain')).toBe(true);
    });
    it('should detect severe bleeding as an emergency', () => {
      expect(detectEmergency('There is severe bleeding')).toBe(true);
    });
    // Add 8 more emergency cases here...
  });

  describe('Semantic Expansion', () => {
    it('should map stomachache to abdominal pain', () => {
      expect(expandSymptoms(['stomach pain'])).toContain('abdominal pain');
    });
    it('should map headache to migraine', () => {
      expect(expandSymptoms(['headache'])).toContain('migraine');
    });
  });

  describe('Health Trend Analyzer', () => {
    it('should detect worsening trend', () => {
      const history = [['fever'], ['fever', 'headache']];
      const trend = analyzeHealthTrend(history);
      expect(trend.status).toBe(TrendStatus.Worsening);
    });
    // Add folow up memory cases here...
  });

});
