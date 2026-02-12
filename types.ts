
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
}

export interface Tender {
  reference: string;
  title: string;
  budget: number;
  deadline: string;
  status: 'Ouvert' | 'En analyse' | 'Clôturé';
}

export type Page = 'LOGIN' | 'REGISTER' | 'STEP_TENDER' | 'STEP_CANDIDATES' | 'STEP_RESULTS';
