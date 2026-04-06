export interface Question {
  id: number;
  text: string;
}

export interface Pledge {
  id: number;
  text: string;
}

export type Step = 'intro' | 'survey' | 'result' | 'pledge' | 'final';

export interface SurveyResult {
  name: string;
  score: number;
  selectedPledges: string[];
  timestamp: number;
}
