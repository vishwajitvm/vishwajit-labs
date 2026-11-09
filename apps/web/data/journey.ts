// Work history shown in the Journey section. Also exported to the backend's AI knowledge base
// (scripts/export-knowledge.mjs), so the chat assistant and the page always say the same thing.
export interface Job { years: string; org: string; role: string; where: string; color: string; badge: string; points: string[] }

export const JOBS: Job[] = [
  { years: '2026 →', org: 'SPNX', role: 'Backend Developer', where: 'Noida', color: '#B9A6FF', badge: 'now',
    points: ['Sole backend developer on an EU VAT-registration platform (live at fsvat.spnx.ai)', '244 endpoints across 34 NestJS modules and 63 models', 'A workflow engine where each country’s process is versioned data, not code', 'Entra ID sign-in, RBAC with 4 roles & 21 permissions, 3/3 security audits passed'] },
  { years: '2022 – 2026', org: 'Bee Logical Software Solutions', role: 'Full Stack Developer', where: 'Pune', color: '#9FE8C8', badge: '🏆 award',
    points: ['Outstanding Performance Award, November 2024', 'SmartHR — LangGraph AI interviews with RAG over job descriptions', 'Bella Canvas — backend for a 3D product designer + Shopify sync', 'SetBot, MahaEseva, Havu, Firmway and Telosa'] },
  { years: '2022', org: 'WebReinvent', role: 'Software Developer', where: 'New Delhi', color: '#9FD0FF', badge: 'open source',
    points: ['Features, APIs and fixes for VaahCMS, an open-source Laravel + Vue CMS'] },
  { years: '2021 – 2022', org: 'BluBrandz Technologies', role: 'Full Stack Developer', where: 'New Delhi', color: '#FFB59A', badge: 'first job',
    points: ['Angle Fertility (hospital management) and Unicorn Equipments (machinery tracking)'] },
  { years: '2021 – 2024', org: 'Freelance', role: 'Full-stack developer', where: 'Remote', color: '#FF8FB1', badge: 'freelance',
    points: ['Concretewale — e-commerce & content platform (concretewale.com)', 'Telas Santo Antônio — fabric catalogue website on October CMS', 'Gyanastu — learning management system', 'Aragma — house-party & event management'] },
];
