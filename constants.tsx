
import React from 'react';
import { Candidate, CandidateStatus, ComplianceBadge, Tender } from './types';

export const INSTITUTION_NAME = "Académie Régionale de l’Éducation et de la Formation – Guelmim-Oued Noun";
export const YEAR = "2026";

// Official Portal Links
export const NATIONAL_PORTAL_URL = "https://www.marchespublics.gov.ma";
export const USER_GUIDE_URL = "https://www.marchespublics.gov.ma/index.php?option=com_content&view=article&id=32&Itemid=484";
export const SUPPORT_EMAIL = "support.daf@aref-gon.ma";

export const COLORS = {
  primary: "#1e3a8a", // Blue 900
  secondary: "#15803d", // Green 700
  accent: "#f59e0b", // Amber 500
};

export const MOCK_TENDERS: Tender[] = [
  {
    reference: "AO-2026-001",
    title: "Construction de 4 salles de classe - Lycée Tan-Tan",
    budget: 1200000,
    deadline: "2026-04-15",
    status: "En analyse"
  },
  {
    reference: "AO-2026-002",
    title: "Fourniture de matériel informatique pour les AREF",
    budget: 850000,
    deadline: "2026-05-20",
    status: "Ouvert"
  },
  {
    reference: "AO-2026-003",
    title: "Maintenance préventive des installations électriques",
    budget: 320000,
    deadline: "2026-03-10",
    status: "En analyse"
  }
];

export const MOCK_CANDIDATES: Candidate[] = [
  {
    id: "1",
    tenderRef: "AO-2026-001",
    name: "Edulog Maroc S.A.R.L",
    fiscalId: "IF-10293847",
    region: "Guelmim",
    contact: "contact@edulog.ma",
    score: 92,
    status: CandidateStatus.ACCEPTED,
    compliance: ComplianceBadge.CONFORME,
    observations: "Dossier technique et administratif conforme aux exigences du CPS. Références solides.",
  }
];

export const LogoPlaceholder = ({ className = "h-12" }: { className?: string }) => (
  <div className={`flex items-center gap-3 ${className}`}>
    <div className="w-10 h-10 bg-blue-900 rounded-lg flex items-center justify-center text-white font-black text-xl shadow-lg">
      A
    </div>
    <div className="flex flex-col">
      <span className="text-blue-900 font-black text-sm uppercase leading-none tracking-tighter">AREF</span>
      <span className="text-green-700 font-bold text-[10px] uppercase leading-none tracking-widest">GON</span>
    </div>
  </div>
);

export const OfficialBranding = LogoPlaceholder;
