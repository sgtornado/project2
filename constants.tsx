
import React, { useState } from 'react';
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
  },
  {
    id: "2",
    tenderRef: "AO-2026-001",
    name: "Atlas Construction Sud",
    fiscalId: "IF-99228811",
    region: "Tan-Tan",
    contact: "dir@atlasconst.ma",
    score: 45,
    status: CandidateStatus.REJECTED,
    compliance: ComplianceBadge.NON_CONFORME,
    observations: "Manque de garanties financières et absence de cautionnement provisoire.",
  }
];

export const LogoPlaceholder = ({ className = "h-16 w-auto" }: { className?: string }) => {
  const [hasError, setHasError] = useState(false);
  
  // Utilisation d'une version stable PNG du logo officiel depuis Wikimedia (CORS safe)
  const logoUrl = "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Logo_Minist%C3%A8re_de_l%27%C3%89ducation_Nationale%2C_du_Pr%C3%A9scolaire_et_des_Sports_-_Maroc.png/600px-Logo_Minist%C3%A8re_de_l%27%C3%89ducation_Nationale%2C_du_Pr%C3%A9scolaire_et_des_Sports_-_Maroc.png";

  if (hasError) {
    return (
      <div className={`${className} bg-blue-900/10 flex items-center justify-center rounded px-2 border border-blue-900/20`}>
        <span className="text-blue-900 text-[10px] font-black leading-tight text-center uppercase tracking-tighter">AREF GON</span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center">
      <img 
        src={logoUrl} 
        alt="Logo Ministère de l'Éducation Nationale Maroc" 
        className={`${className} object-contain mix-blend-multiply transition-opacity duration-300`}
        onError={() => setHasError(true)}
      />
    </div>
  );
};
