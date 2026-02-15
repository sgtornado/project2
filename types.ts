
export enum UserRole {
  ADMIN = 'Administrateur',
  EVALUATOR = 'Évaluateur'
}

export enum CandidateStatus {
  ACCEPTED = 'Acceptée',
  REJECTED = 'Rejetée',
  REVIEW = 'À réexaminer'
}

export enum ComplianceBadge {
  CONFORME = 'Conforme',
  RISQUE = 'À risque',
  NON_CONFORME = 'Non conforme'
}

export interface CandidateEvaluation {
  technical_score_final: number;
  financial_score: number;
  total_score: number;
  ranking: number;
  risk_level: string;
  recommendation: string;
  strengths: string;
  weaknesses: string;
  technical_adjustment_explanation: string;
  administrative_status: string;
}

export interface Candidate {
  id: string;
  tenderRef: string;
  name: string;
  fiscalId: string;
  region: string;
  contact: string;
  score: number;
  status: CandidateStatus;
  compliance: ComplianceBadge;
  observations: string;
  isAiAnalyzed?: boolean;
  // Raw data extracted from PDF
  financialOffer: number;
  yearsExperience: number;
  pastProjects: number;
  adminComplete: boolean;
  technicalScoreRaw: number;
  // Evaluation result
  evaluation?: CandidateEvaluation;
}

export interface Tender {
  reference: string;
  title: string;
  budget: number;
  deadline: string;
  status: 'Ouvert' | 'En analyse' | 'Clôturé';
  techWeight?: number;
  finWeight?: number;
}

export type Page = 'LOGIN' | 'REGISTER' | 'STEP_TENDER' | 'STEP_CANDIDATES' | 'STEP_RESULTS';
