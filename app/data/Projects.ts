
export interface Project {
  title: string;
  location: string;
  capacity: string;
  investment: string;
  status: string;
  progress: number;
  description: string;
  keyFeatures: string[];
  timeline: { phase: string; status: string; date: string }[];
  impact: { jobs: string; co2: string; homes: string; investment: string };
  image: string;
}

export const projectData: { [key: string]: Project } = {
  ngozi: {
    title: 'Ngozi Geothermal Complex',
    location: 'Mbeya Region, Tanzania',
    capacity: '200 MW',
    investment: '$320M',
    status: 'Under Construction',
    progress: 75,
    description:
      "The Ngozi Geothermal Complex represents Tanzania's largest geothermal development project, strategically located near the Ngozi volcanic crater in the Southern Highlands. This ambitious project harnesses high-temperature geothermal resources to provide clean, reliable electricity to the national grid.",
    keyFeatures: [
      'High-temperature geothermal resource (>250°C)',
      'Binary cycle power generation technology',
      'Environmental impact mitigation measures',
      'Local community development programs',
      'Grid connection to national transmission system',
    ],
    timeline: [
      { phase: 'Environmental Impact Assessment', status: 'Completed', date: '2021' },
      { phase: 'Resource Confirmation', status: 'Completed', date: '2022' },
      { phase: 'Construction Phase 1', status: 'In Progress', date: '2023-2024' },
      { phase: 'Commercial Operation', status: 'Planned', date: '2025' },
    ],
    impact: {
      jobs: '1,200+ jobs created',
      co2: '450,000 tons CO₂ saved annually',
      homes: 'Powers 180,000 homes',
      investment: 'Attracts $50M in local investment',
    },
    image:
      'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
  },
  natron: {
    title: 'Lake Natron Geothermal Project',
    location: 'Arusha Region, Tanzania',
    capacity: '150 MW',
    investment: '$45M',
    status: 'Exploration Phase',
    progress: 25,
    description:
      "Located in the Eastern Rift Valley near the unique alkaline Lake Natron, this exploration project aims to unlock significant geothermal potential in one of Tanzania's most geologically active regions.",
    keyFeatures: [
      'Unique alkaline geothermal system',
      'Advanced exploration techniques',
      'Environmental conservation focus',
      'Tourism integration opportunities',
      'Research collaboration with universities',
    ],
    timeline: [
      { phase: 'Geological Survey', status: 'Completed', date: '2022' },
      { phase: 'Geophysical Studies', status: 'In Progress', date: '2023' },
      { phase: 'Exploratory Drilling', status: 'Planned', date: '2024' },
      { phase: 'Resource Assessment', status: 'Planned', date: '2025' },
    ],
    impact: {
      jobs: '300+ exploration jobs',
      co2: 'Potential 350,000 tons CO₂ saved',
      homes: 'Could power 135,000 homes',
      investment: 'Catalyzes regional development',
    },
    image:
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
  },
  luhoi: {
    title: 'Luhoi Geothermal Power Plant',
    location: 'Mbeya Region, Tanzania',
    capacity: '50 MW',
    investment: '$85M',
    status: 'Operational',
    progress: 100,
    description:
      "Tanzania's pioneering geothermal power plant, Luhoi serves as a proof-of-concept for geothermal energy development in the East African Rift system. This facility demonstrates the technical and economic viability of geothermal power in Tanzania.",
    keyFeatures: [
      'First operational geothermal plant in Tanzania',
      'Proven binary cycle technology',
      '24/7 baseload power generation',
      'Minimal environmental footprint',
      'Training center for geothermal expertise',
    ],
    timeline: [
      { phase: 'Project Development', status: 'Completed', date: '2019' },
      { phase: 'Construction', status: 'Completed', date: '2020-2021' },
      { phase: 'Commissioning', status: 'Completed', date: '2022' },
      { phase: 'Commercial Operation', status: 'Operational', date: '2022-Present' },
    ],
    impact: {
      jobs: '150 permanent jobs',
      co2: '120,000 tons CO₂ saved annually',
      homes: 'Powers 45,000 homes',
      investment: 'Proven technology for expansion',
    },
    image:
      'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
  },
  kilimanjaro: {
    title: 'Kilimanjaro Geothermal Project',
    location: 'Kilimanjaro Region, Tanzania',
    capacity: '300 MW',
    investment: '$480M',
    status: 'Development Phase',
    progress: 40,
    description:
      "This flagship project near Mount Kilimanjaro represents the largest planned geothermal development in East Africa. Leveraging the unique volcanic geology of the region, it will significantly contribute to Tanzania's renewable energy capacity.",
    keyFeatures: [
      'Largest geothermal project in East Africa',
      'High-altitude geothermal development',
      'Advanced drilling technology',
      'International partnership model',
      'Integrated tourism and energy development',
    ],
    timeline: [
      { phase: 'Feasibility Study', status: 'Completed', date: '2021' },
      { phase: 'Environmental Approval', status: 'Completed', date: '2022' },
      { phase: 'Development Phase', status: 'In Progress', date: '2023-2025' },
      { phase: 'Construction', status: 'Planned', date: '2025-2027' },
    ],
    impact: {
      jobs: '2,000+ jobs during construction',
      co2: '750,000 tons CO₂ saved annually',
      homes: 'Powers 270,000 homes',
      investment: 'Transforms regional economy',
    },
    image:
      'https://images.unsplash.com/photo-1589553416260-f586c8f1514f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
  },
  rungwe: {
    title: 'Rungwe Geothermal Field',
    location: 'Mbeya Region, Tanzania',
    capacity: '180 MW',
    investment: '$290M',
    status: 'Under Construction',
    progress: 60,
    description:
      'The Rungwe Geothermal Field development capitalizes on the volcanic activity in the Rungwe district. This project will provide substantial clean energy capacity while supporting local economic development.',
    keyFeatures: [
      'Volcanic geothermal resource utilization',
      'Modular construction approach',
      'Community benefit sharing program',
      'Agricultural integration opportunities',
      'Sustainable water management',
    ],
    timeline: [
      { phase: 'Resource Assessment', status: 'Completed', date: '2020' },
      { phase: 'Project Financing', status: 'Completed', date: '2022' },
      { phase: 'Construction', status: 'In Progress', date: '2023-2024' },
      { phase: 'Commercial Operation', status: 'Planned', date: '2025' },
    ],
    impact: {
      jobs: '900+ construction jobs',
      co2: '400,000 tons CO₂ saved annually',
      homes: 'Powers 162,000 homes',
      investment: 'Boosts agricultural productivity',
    },
    image:
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
  },
  manyara: {
    title: 'Lake Manyara Geothermal Project',
    location: 'Manyara Region, Tanzania',
    capacity: '120 MW',
    investment: '$35M',
    status: 'Exploration Phase',
    progress: 15,
    description:
      'An early-stage exploration project in the Rift Valley system near Lake Manyara National Park. This project balances energy development with environmental conservation and tourism considerations.',
    keyFeatures: [
      'Rift Valley geothermal exploration',
      'Environmental conservation integration',
      'Tourism sector collaboration',
      'Wildlife habitat protection',
      'Sustainable development approach',
    ],
    timeline: [
      { phase: 'Initial Assessment', status: 'Completed', date: '2023' },
      { phase: 'Environmental Studies', status: 'In Progress', date: '2023-2024' },
      { phase: 'Geophysical Survey', status: 'Planned', date: '2024' },
      { phase: 'Exploration Drilling', status: 'Planned', date: '2025' },
    ],
    impact: {
      jobs: '200+ exploration jobs',
      co2: 'Potential 280,000 tons CO₂ saved',
      homes: 'Could power 108,000 homes',
      investment: 'Supports eco-tourism development',
    },
    image:
      'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fEVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
  },
};
