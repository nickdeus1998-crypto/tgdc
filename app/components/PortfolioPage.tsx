
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import ProjectCard from './ProjectCard';
import { Project, projectData } from '../data/Projects';



const PortfolioPage: React.FC = () => {
  const [filter, setFilter] = useState<string>('all');
  const [modalProject, setModalProject] = useState<Project | null>(null);
  const [counters, setCounters] = useState({
    totalProjects: 0,
    totalInvestment: 0,
    operationalProjects: 0,
    totalCapacity: 0,
  });

  // Animate counters
  useEffect(() => {
    const animateCounter = (target: number, key: string, suffix: string = '') => {
      const start = 0;
      const duration = 2000;
      const startTime = performance.now();

      const update = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const value = Math.floor(start + (target - start) * easeOutQuart);

        setCounters((prev) => ({
          ...prev,
          [key]: value,
        }));

        if (progress < 1) {
          requestAnimationFrame(update);
        }
      };

      requestAnimationFrame(update);
    };

    setTimeout(() => {
      animateCounter(24, 'totalProjects');
      animateCounter(1.8, 'totalInvestment', 'B');
      animateCounter(8, 'operationalProjects');
      animateCounter(2150, 'totalCapacity');
    }, 500);
  }, []);

  // Filter projects
  const filteredProjects = Object.values(projectData).filter(
    (project) => filter === 'all' || project.status.toLowerCase().replace(' phase', '') === filter
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-green-50 rounded-full mb-4">
              <span className="text-primary-green text-sm font-medium">🚀 Our Work</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Project
              <span className="block bg-gradient-to-r from-primary-green to-secondary-green bg-clip-text text-transparent">
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
            <div className="bg-gradient-to-br from-primary-green to-secondary-green text-white rounded-2xl p-6 text-center">
              <div className="text-3xl font-bold mb-2">{counters.totalProjects.toLocaleString()}</div>
              <div className="text-white/80 text-sm font-medium">Total Projects</div>
            </div>
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-2xl p-6 text-center">
              <div className="text-3xl font-bold mb-2">${counters.totalInvestment}B</div>
              <div className="text-white/80 text-sm font-medium">Total Investment</div>
            </div>
            <div className="bg-gradient-to-br from-orange-500 to-red-500 text-white rounded-2xl p-6 text-center">
              <div className="text-3xl font-bold mb-2">{counters.operationalProjects}</div>
              <div className="text-white/80 text-sm font-medium">Operational</div>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-teal-500 text-white rounded-2xl p-6 text-center">
              <div className="text-3xl font-bold mb-2">{counters.totalCapacity.toLocaleString()}</div>
              <div className="text-white/80 text-sm font-medium">MW Capacity</div>
            </div>
          </div>

          {/* Filter Buttons */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {['all', 'operational', 'construction', 'development', 'exploration'].map((category) => (
              <button
                key={category}
                className={`filter-btn px-6 py-3 rounded-full border-2 border-primary-green text-primary-green font-semibold transition-all duration-300 ${
                  filter === category ? 'active' : ''
                }`}
                onClick={() => setFilter(category)}
              >
                {category.charAt(0).toUpperCase() + category.slice(1).replace(' phase', '')}
              </button>
            ))}
          </div>

          {/* Projects Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8" id="projectsGrid">
            {filteredProjects.map((project) => (
              <ProjectCard key={project.title} project={project} setModalProject={setModalProject} />
            ))}
          </div>

          {/* Load More Button */}
          <div className="text-center mt-12">
            <button className="bg-gradient-to-r from-primary-green to-secondary-green text-white px-8 py-4 rounded-full font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300">
              Load More Projects
            </button>
          </div>
        </div>
      </section>

      {/* Project Details Modal */}
      {modalProject && (
        <div className="modal fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="modal-content bg-white rounded-2xl max-w-4xl w-full shadow-2xl">
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-3xl font-bold text-gray-900">{modalProject.title}</h2>
                <button
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                  onClick={() => setModalProject(null)}
                >
                  ×
                </button>
              </div>
              <div className="space-y-6">
                {/* Project Image */}
                <div className="mb-8">
                  <div
                    className="h-64 rounded-xl overflow-hidden shadow-lg"
                    style={{
                      backgroundImage: `url(${modalProject.image})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  >
                    <div className="h-full bg-gradient-to-t from-black/50 to-transparent flex items-end p-6">
                      <div className="text-white">
                        <h3 className="text-2xl font-bold mb-2">{modalProject.title}</h3>
                        <p className="text-white/80">{modalProject.location} • {modalProject.capacity}</p>
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
                        <span className="font-semibold">{modalProject.location}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Capacity:</span>
                        <span className="font-semibold">{modalProject.capacity}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Investment:</span>
                        <span className="font-semibold">{modalProject.investment}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <span className="font-semibold text-primary-green">{modalProject.status}</span>
                      </div>
                    </div>
                    <div className="mb-6">
                      <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>Progress</span>
                        <span>{modalProject.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="progress-bar h-3 rounded-full"
                          style={{ width: `${modalProject.progress}%` }}
                        ></div>
                      </div>
                    </div>
                    <p className="text-gray-600 leading-relaxed">{modalProject.description}</p>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Key Features</h3>
                    <ul className="space-y-2 mb-6">
                      {modalProject.keyFeatures.map((feature) => (
                        <li key={feature} className="flex items-start">
                          <span className="text-primary-green mr-2">✓</span>
                          <span className="text-gray-600">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Project Impact</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-green-50 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-primary-green mb-1">
                          {modalProject.impact.jobs.split(' ')[0]}
                        </div>
                        <div className="text-sm text-gray-600">Jobs Created</div>
                      </div>
                      <div className="bg-blue-50 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-blue-600 mb-1">
                          {modalProject.impact.co2.split(' ')[0]}
                        </div>
                        <div className="text-sm text-gray-600">Tons CO₂ Saved</div>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-purple-600 mb-1">
                          {modalProject.impact.homes.split(' ')[1]}
                        </div>
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
                    {modalProject.timeline.map((phase) => (
                      <div key={phase.phase} className="flex items-center">
                        <div
                          className={`w-4 h-4 rounded-full mr-4 ${
                            phase.status === 'Completed'
                              ? 'bg-green-500'
                              : phase.status === 'In Progress'
                              ? 'bg-yellow-500'
                              : 'bg-gray-300'
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
  );
};

export default PortfolioPage;
