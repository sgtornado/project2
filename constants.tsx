
import React from 'react';
import { Candidate, CandidateStatus, ComplianceBadge, Tender } from './types';

export const INSTITUTION_NAME = "Académie Régionale de l’Éducation et de la Formation – Guelmim-Oued Noun";
export const YEAR = "2026";

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
  },
  {
    id: "3",
    tenderRef: "AO-2026-003",
    name: "Oued Noun Services",
    fiscalId: "IF-44556677",
    region: "Assa-Zag",
    contact: "info@ouednoun.ma",
    score: 78,
    status: CandidateStatus.REVIEW,
    compliance: ComplianceBadge.RISQUE,
  },
  {
    id: "4",
    tenderRef: "AO-2026-001",
    name: "Logiscolar Group",
    fiscalId: "IF-88776655",
    region: "Sidi Ifni",
    contact: "pro@logiscolar.com",
    score: 88,
    status: CandidateStatus.ACCEPTED,
    compliance: ComplianceBadge.CONFORME,
  }
];

export const LogoPlaceholder = ({ className = "h-16 w-auto" }: { className?: string }) => (
  <div className="flex items-center justify-center">
    <img 
      src="https://scontent-mad2-1.xx.fbcdn.net/v/t39.30808-6/493080539_2638978652957390_9212634320391985333_n.jpg?stp=dst-jpg_s320x320_tt6&_nc_cat=109&ccb=1-7&_nc_sid=03db49&_nc_ohc=f2q7hRaQ7yUQ7kNvwFPGPFP&_nc_oc=Adm54YTlG13jzdYpWHBNHzCw8MCvCmXacqGDHIyAMwjWK6faBL1Ez-U3KfLGjxErArU&_nc_zt=23&_nc_ht=scontent-mad2-1.xx&_nc_gid=64Nw9cU_ILNPcGDdMforCw&oh=00_AftaT2SqRUPm1-NSNU6ybOZI80zraQyAQJooWIR6kdnpyw&oe=69924404" 
      alt="Logo Officiel AREF Guelmim-Oued Noun" 
      className={`${className} rounded shadow-sm`}
      onError={(e) => {
        const target = e.target as HTMLImageElement;
        target.style.display = 'none';
        const parent = target.parentElement;
        if (parent) {
          const fallback = document.createElement('div');
          fallback.className = 'flex items-center space-x-2';
          fallback.innerHTML = `
            <div class="w-12 h-12 bg-blue-900 rounded-lg flex items-center justify-center text-white font-bold text-xl border-2 border-green-600">
              AREF
            </div>
            <div class="flex flex-col">
              <span class="text-xs font-bold text-blue-900 leading-tight uppercase">Académie Régionale</span>
              <span class="text-[10px] text-green-700 font-black">GUELMIM-OUED NOUN</span>
            </div>
          `;
          parent.appendChild(fallback);
        }
      }}
    />
  </div>
);
