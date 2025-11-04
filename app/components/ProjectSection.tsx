
import React, { useState, useEffect } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';

interface Project {
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
}

const projectData: { [key: string]: Project } = {
  ngozi: {
    title: "Ngozi Geothermal Complex",
    location: "Mbeya Region, Tanzania",
    capacity: "200 MW",
    investment: "$320M",
    status: "Under Construction",
    progress: 75,
    description: "The Ngozi Geothermal Complex represents Tanzania's largest geothermal development project, strategically located near the Ngozi volcanic crater in the Southern Highlands. This ambitious project harnesses high-temperature geothermal resources to provide clean, reliable electricity to the national grid.",
    keyFeatures: [
      "High-temperature geothermal resource (>250°C)",
      "Binary cycle power generation technology",
      "Environmental impact mitigation measures",
      "Local community development programs",
      "Grid connection to national transmission system",
    ],
    timeline: [
      { phase: "Environmental Impact Assessment", status: "Completed", date: "2021" },
      { phase: "Resource Confirmation", status: "Completed", date: "2022" },
      { phase: "Construction Phase 1", status: "In Progress", date: "2023-2024" },
      { phase: "Commercial Operation", status: "Planned", date: "2025" },
    ],
    impact: {
      jobs: "1,200+ jobs created",
      co2: "450,000 tons CO₂ saved annually",
      homes: "Powers 180,000 homes",
      investment: "Attracts $50M in local investment",
    },
  },
  natron: {
    title: "Lake Natron Geothermal Project",
    location: "Arusha Region, Tanzania",
    capacity: "150 MW",
    investment: "$45M",
    status: "Exploration Phase",
    progress: 25,
    description: "Located in the Eastern Rift Valley near the unique alkaline Lake Natron, this exploration project aims to unlock significant geothermal potential in one of Tanzania's most geologically active regions.",
    keyFeatures: [
      "Unique alkaline geothermal system",
      "Advanced exploration techniques",
      "Environmental conservation focus",
      "Tourism integration opportunities",
      "Research collaboration with universities",
    ],
    timeline: [
      { phase: "Geological Survey", status: "Completed", date: "2022" },
      { phase: "Geophysical Studies", status: "In Progress", date: "2023" },
      { phase: "Exploratory Drilling", status: "Planned", date: "2024" },
      { phase: "Resource Assessment", status: "Planned", date: "2025" },
    ],
    impact: {
      jobs: "300+ exploration jobs",
      co2: "Potential 350,000 tons CO₂ saved",
      homes: "Could power 135,000 homes",
      investment: "Catalyzes regional development",
    },
  },
  luhoi: {
    title: "Luhoi Geothermal Power Plant",
    location: "Mbeya Region, Tanzania",
    capacity: "50 MW",
    investment: "$85M",
    status: "Operational",
    progress: 100,
    description: "Tanzania's pioneering geothermal power plant, Luhoi serves as a proof-of-concept for geothermal energy development in the East African Rift system. This facility demonstrates the technical and economic viability of geothermal power in Tanzania.",
    keyFeatures: [
      "First operational geothermal plant in Tanzania",
      "Proven binary cycle technology",
      "24/7 baseload power generation",
      "Minimal environmental footprint",
      "Training center for geothermal expertise",
    ],
    timeline: [
      { phase: "Project Development", status: "Completed", date: "2019" },
      { phase: "Construction", status: "Completed", date: "2020-2021" },
      { phase: "Commissioning", status: "Completed", date: "2022" },
      { phase: "Commercial Operation", status: "Operational", date: "2022-Present" },
    ],
    impact: {
      jobs: "150 permanent jobs",
      co2: "120,000 tons CO₂ saved annually",
      homes: "Powers 45,000 homes",
      investment: "Proven technology for expansion",
    },
  },
  kilimanjaro: {
    title: "Kilimanjaro Geothermal Project",
    location: "Kilimanjaro Region, Tanzania",
    capacity: "300 MW",
    investment: "$480M",
    status: "Development Phase",
    progress: 40,
    description: "This flagship project near Mount Kilimanjaro represents the largest planned geothermal development in East Africa. Leveraging the unique volcanic geology of the region, it will significantly contribute to Tanzania's renewable energy capacity.",
    keyFeatures: [
      "Largest geothermal project in East Africa",
      "High-altitude geothermal development",
      "Advanced drilling technology",
      "International partnership model",
      "Integrated tourism and energy development",
    ],
    timeline: [
      { phase: "Feasibility Study", status: "Completed", date: "2021" },
      { phase: "Environmental Approval", status: "Completed", date: "2022" },
      { phase: "Development Phase", status: "In Progress", date: "2023-2025" },
      { phase: "Construction", status: "Planned", date: "2025-2027" },
    ],
    impact: {
      jobs: "2,000+ jobs during construction",
      co2: "750,000 tons CO₂ saved annually",
      homes: "Powers 270,000 homes",
      investment: "Transforms regional economy",
    },
  },
  rungwe: {
    title: "Rungwe Geothermal Field",
    location: "Mbeya Region, Tanzania",
    capacity: "180 MW",
    investment: "$290M",
    status: "Under Construction",
    progress: 60,
    description: "The Rungwe Geothermal Field development capitalizes on the volcanic activity in the Rungwe district. This project will provide substantial clean energy capacity while supporting local economic development.",
    keyFeatures: [
      "Volcanic geothermal resource utilization",
      "Modular construction approach",
      "Community benefit sharing program",
      "Agricultural integration opportunities",
      "Sustainable water management",
    ],
    timeline: [
      { phase: "Resource Assessment", status: "Completed", date: "2020" },
      { phase: "Project Financing", status: "Completed", date: "2022" },
      { phase: "Construction", status: "In Progress", date: "2023-2024" },
      { phase: "Commercial Operation", status: "Planned", date: "2025" },
    ],
    impact: {
      jobs: "900+ construction jobs",
      co2: "400,000 tons CO₂ saved annually",
      homes: "Powers 162,000 homes",
      investment: "Boosts agricultural productivity",
    },
  },
  manyara: {
    title: "Lake Manyara Geothermal Project",
    location: "Manyara Region, Tanzania",
    capacity: "120 MW",
    investment: "$35M",
    status: "Exploration Phase",
    progress: 15,
    description: "An early-stage exploration project in the Rift Valley system near Lake Manyara National Park. This project balances energy development with environmental conservation and tourism considerations.",
    keyFeatures: [
      "Rift Valley geothermal exploration",
      "Environmental conservation integration",
      "Tourism sector collaboration",
      "Wildlife habitat protection",
      "Sustainable development approach",
    ],
    timeline: [
      { phase: "Initial Assessment", status: "Completed", date: "2023" },
      { phase: "Environmental Studies", status: "In Progress", date: "2023-2024" },
      { phase: "Geophysical Survey", status: "Planned", date: "2024" },
      { phase: "Exploration Drilling", status: "Planned", date: "2025" },
    ],
    impact: {
      jobs: "200+ exploration jobs",
      co2: "Potential 280,000 tons CO₂ saved",
      homes: "Could power 108,000 homes",
      investment: "Supports eco-tourism development",
    },
  },
};

const getProjectImage = (projectId: string): string => {
  const imageMap: { [key: string]: string } = {
    ngozi: 'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    natron: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    luhoi: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    kilimanjaro: 'https://images.unsplash.com/photo-1589553416260-f586c8f1514f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    rungwe: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    manyara: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
  };
  return imageMap[projectId] || '';
};

const ProjectSection: NextPage = () => {
  const [filter, setFilter] = useState<string>('all');
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  useEffect(() => {
    const animateCounter = (elementId: string, targetValue: number, suffix: string = '') => {
      const element = document.getElementById(elementId);
      if (!element) return;
      const startValue = 0;
      const duration = 2000;
      const startTime = performance.now();

      const updateCounter = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const currentValue = Math.floor(startValue + (targetValue - startValue) * easeOutQuart);
        element.textContent = currentValue.toLocaleString() + suffix;
        if (progress < 1) {
          requestAnimationFrame(updateCounter);
        }
      };

      requestAnimationFrame(updateCounter);
    };

    const handleLoad = () => {
      setTimeout(() => {
        animateCounter('totalProjects', 24);
        animateCounter('totalInvestment', 1.8, 'B');
        animateCounter('operationalProjects', 8);
        animateCounter('totalCapacity', 2150);
      }, 500);
    };

    window.addEventListener('load', handleLoad);
    return () => window.removeEventListener('load', handleLoad);
  }, []);

  const projects = [
    { id: 'ngozi', category: 'construction', statusText: '🚧 Under Construction', statusColor: 'bg-yellow-100 text-yellow-700', progress: 75 },
    { id: 'natron', category: 'exploration', statusText: '🔍 Exploration', statusColor: 'bg-blue-100 text-blue-700', progress: 25 },
    { id: 'luhoi', category: 'operational', statusText: '✅ Operational', statusColor: 'bg-green-100 text-green-700', progress: 100 },
    { id: 'kilimanjaro', category: 'development', statusText: '🏗️ Development', statusColor: 'bg-purple-100 text-purple-700', progress: 40 },
    { id: 'rungwe', category: 'construction', statusText: '🚧 Under Construction', statusColor: 'bg-yellow-100 text-yellow-700', progress: 60 },
    { id: 'manyara', category: 'exploration', statusText: '🔍 Exploration', statusColor: 'bg-blue-100 text-blue-700', progress: 15 },
  ];

  return (
    <>
      <Head>
        <title>Geothermal Project Portfolio</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Section Header */}
            <div className="text-center mb-16">
              <div className="inline-flex items-center px-4 py-2 bg-green-50 rounded-full mb-4">
                <span className="text-[#326101] text-sm font-medium">🚀 Our Work</span>
              </div>
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                Project
                <span className="block bg-gradient-to-r from-[#326101] to-[#639427] bg-clip-text text-transparent">
                  Portfolio
                </span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Discover our comprehensive portfolio of geothermal projects across Tanzania and beyond.
                From exploration to operation, we deliver sustainable energy solutions.
              </p>
            </div>

            {/* Portfolio Statistics */}
            <div className="grid md:grid-cols-4 gap-6 mb-12">
              <div className="bg-gradient-to-br from-[#326101] to-[#639427] text-white rounded-2xl p-6 text-center">
                <div className="text-3xl font-bold mb-2" id="totalProjects">24</div>
                <div className="text-white/80 text-sm font-medium">Total Projects</div>
              </div>
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-2xl p-6 text-center">
                <div className="text-3xl font-bold mb-2" id="totalInvestment">$1.8B</div>
                <div className="text-white/80 text-sm font-medium">Total Investment</div>
              </div>
              <div className="bg-gradient-to-br from-orange-500 to-red-500 text-white rounded-2xl p-6 text-center">
                <div className="text-3xl font-bold mb-2" id="operationalProjects">8</div>
                <div className="text-white/80 text-sm font-medium">Operational</div>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-teal-500 text-white rounded-2xl p-6 text-center">
                <div className="text-3xl font-bold mb-2" id="totalCapacity">2,150</div>
                <div className="text-white/80 text-sm font-medium">MW Capacity</div>
              </div>
            </div>

            {/* Filter Buttons */}
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              {['all', 'operational', 'construction', 'development', 'exploration'].map((category) => (
                <button
                  key={category}
                  className={`px-6 py-3 rounded-full border-2 border-[#326101] text-[#326101] font-semibold transition-all duration-300 ease-in ${
                    filter === category ? 'bg-gradient-to-r from-[#326101] to-[#639427] text-white scale-105' : ''
                  }`}
                  onClick={() => setFilter(category)}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1).replace('all', 'All Projects')}
                </button>
              ))}
            </div>

            {/* Projects Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {projects
                .filter((project) => filter === 'all' || project.category === filter)
                .map((project) => (
                  <div
                    key={project.id}
                    className="bg-white rounded-2xl overflow-hidden shadow-lg animate-[fadeInUp_0.6s_ease-out_forwards] transition-all duration-400 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] hover:-translate-y-3 hover:scale-102 hover:shadow-[0_25px_50px_rgba(0,0,0,0.15)]"
                  >
                    <div
                      className="h-48 bg-cover bg-center bg-no-repeat relative overflow-hidden before:content-[''] before:absolute before:inset-0 before:bg-gradient-to-br before:from-black/40 before:to-black/10 before:z-[1]"
                      style={{ backgroundImage: `url(${getProjectImage(project.id)})` }}
                    >
                      <div className="absolute inset-0 p-6 flex flex-col justify-between z-[2]">
                        <div className="flex justify-between items-start">
                          <span className="backdrop-blur-md bg-white/20 px-3 py-1 rounded-full text-white text-sm font-medium">
                            {project.statusText}
                          </span>
                          <span className="text-white text-2xl font-bold">{projectData[project.id].capacity}</span>
                        </div>
                        <div className="text-white">
                          <h3 className="text-xl font-bold mb-2">{projectData[project.id].title}</h3>
                          <p className="text-white/80 text-sm">{projectData[project.id].location}</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-lg font-semibold text-gray-900">{projectData[project.id].investment} Investment</span>
                        <span className={`${project.statusColor} px-3 py-1 rounded-full text-sm font-medium`}>
                          {project.progress}% Complete
                        </span>
                      </div>
                      <div className="mb-4">
                        <div className="flex justify-between text-sm text-gray-600 mb-2">
                          <span>{project.category === 'exploration' ? 'Exploration' : project.category === 'operational' ? 'Operational' : project.category === 'construction' ? 'Construction' : 'Development'} Progress</span>
                          <span>{project.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-gradient-to-r from-[#326101] to-[#639427] rounded-full h-2 transition-all duration-1000 ease-out" style={{ width: `${project.progress}%` }}></div>
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm mb-4">{projectData[project.id].description}</p>
                      <button
                        className="w-full bg-[#326101] text-white py-2 rounded-lg font-semibold hover:bg-[#639427] transition-colors"
                        onClick={() => setSelectedProject(project.id)}
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
            </div>

            {/* Load More Button */}
            <div className="text-center mt-12">
              <button className="bg-gradient-to-r from-[#326101] to-[#639427] text-white px-8 py-4 rounded-full font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300">
                Load More Projects
              </button>
            </div>
          </div>
        </section>

        {/* Project Details Modal */}
        {selectedProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-black/50" onClick={() => setSelectedProject(null)}>
            <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-3xl font-bold text-gray-900">{projectData[selectedProject].title}</h2>
                  <button className="text-gray-400 hover:text-gray-600 text-2xl" onClick={() => setSelectedProject(null)}>
                    ×
                  </button>
                </div>
                <div className="space-y-6">
                  <div className="mb-8">
                    <div
                      className="h-64 rounded-xl overflow-hidden shadow-lg bg-cover bg-center"
                      style={{ backgroundImage: `url(${getProjectImage(selectedProject)})` }}
                    >
                      <div className="h-full bg-gradient-to-t from-black/50 to-transparent flex items-end p-6">
                        <div className="text-white">
                          <h3 className="text-2xl font-bold mb-2">{projectData[selectedProject].title}</h3>
                          <p className="text-white/80">{projectData[selectedProject].location} • {projectData[selectedProject].capacity}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-4">Project Overview</h3>
                      <div className="space-y-3 mb-6">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Location:</span>
                          <span className="font-semibold">{projectData[selectedProject].location}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Capacity:</span>
                          <span className="font-semibold">{projectData[selectedProject].capacity}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Investment:</span>
                          <span className="font-semibold">{projectData[selectedProject].investment}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Status:</span>
                          <span className="font-semibold text-[#326101]">{projectData[selectedProject].status}</span>
                        </div>
                      </div>
                      <div className="mb-6">
                        <div className="flex justify-between text-sm text-gray-600 mb-2">
                          <span>Progress</span>
                          <span>{projectData[selectedProject].progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className="bg-gradient-to-r from-[#326101] to-[#639427] h-3 rounded-full"
                            style={{ width: `${projectData[selectedProject].progress}%` }}
                          ></div>
                        </div>
                      </div>
                      <p className="text-gray-600 leading-relaxed">{projectData[selectedProject].description}</p>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-4">Key Features</h3>
                      <ul className="space-y-2 mb-6">
                        {projectData[selectedProject].keyFeatures.map((feature, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-[#326101] mr-2">✓</span>
                            <span className="text-gray-600">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      <h3 className="text-xl font-bold text-gray-900 mb-4">Project Impact</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-green-50 p-4 rounded-lg text-center">
                          <div className="text-2xl font-bold text-[#326101] mb-1">{projectData[selectedProject].impact.jobs.split(' ')[0]}</div>
                          <div className="text-sm text-gray-600">Jobs Created</div>
                        </div>
                        <div className="bg-blue-50 p-4 rounded-lg text-center">
                          <div className="text-2xl font-bold text-blue-600 mb-1">{projectData[selectedProject].impact.co2.split(' ')[0]}</div>
                          <div className="text-sm text-gray-600">Tons CO₂ Saved</div>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-lg text-center">
                          <div className="text-2xl font-bold text-purple-600 mb-1">{projectData[selectedProject].impact.homes.split(' ')[1]}</div>
                          <div className="text-sm text-gray-600">Homes Powered</div>
                        </div>
                        <div className="bg-orange-50 p-4 rounded-lg text-center">
                          <div className="text-lg font-bold text-orange-600 mb-1">Local</div>
                          <div className="text-sm text-gray-600">Investment</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Project Timeline</h3>
                    <div className="space-y-4">
                      {projectData[selectedProject].timeline.map((phase, index) => (
                        <div key={index} className="flex items-center">
                          <div
                            className={`w-4 h-4 rounded-full mr-4 ${
                              phase.status === 'Completed' ? 'bg-green-500' : phase.status === 'In Progress' ? 'bg-yellow-500' : 'bg-gray-300'
                            }`}
                          ></div>
                          <div className="flex-1">
                            <div className="flex justify-between items-center">
                              <span className="font-semibold">{phase.phase}</span>
                              <span className="text-sm text-gray-500">{phase.date}</span>
                            </div>
                            <div className="text-sm text-gray-600">{phase.status}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <style jsx global>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
};

export default ProjectSection;