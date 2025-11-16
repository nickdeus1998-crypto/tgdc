import React, { useEffect, useMemo, useState } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';

interface ProjectImpact {
  jobs: string;
  co2: string;
  homes: string;
  investment: string;
}

interface ProjectTimelineEntry {
  phase: string;
  status: string;
  date: string;
}

interface Project {
  id: string;
  title: string;
  location: string;
  capacity: string;
  investment: string;
  status: string;
  category: string;
  progress: number;
  description: string;
  keyFeatures: string[];
  timeline: ProjectTimelineEntry[];
  impact: ProjectImpact;
  imageUrl?: string | null;
}

const fallbackImageMap: Record<string, string> = {
  ngozi:
    'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?auto=format&fit=crop&w=2070&q=80',
  natron:
    'https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&w=2070&q=80',
  luhoi:
    'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=2070&q=80',
  kilimanjaro:
    'https://images.unsplash.com/photo-1589553416260-f586c8f1514f?auto=format&fit=crop&w=2070&q=80',
  rungwe:
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=2070&q=80',
  manyara:
    'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&w=2070&q=80',
};

const statusColorMap: Record<string, string> = {
  operational: 'bg-green-100 text-green-700',
  construction: 'bg-yellow-100 text-yellow-700',
  development: 'bg-purple-100 text-purple-700',
  exploration: 'bg-blue-100 text-blue-700',
};

const statusLabelMap: Record<string, string> = {
  operational: 'Operational',
  construction: 'Under Construction',
  development: 'Development',
  exploration: 'Exploration',
};

const getStatusLabel = (status: string) => statusLabelMap[status] || status;
const getStatusBadgeClass = (status: string) => statusColorMap[status] || 'bg-gray-100 text-gray-700';
const getCategoryLabel = (category: string) =>
  category === 'all'
    ? 'All Projects'
    : category.charAt(0).toUpperCase() + category.slice(1);

const getProjectImage = (project?: Project | null): string => {
  if (project?.imageUrl) return project.imageUrl;
  if (project?.id && fallbackImageMap[project.id]) return fallbackImageMap[project.id];
  return '/geothermal.jpg';
};

const ProjectSection: NextPage = () => {
  const [filter, setFilter] = useState<string>('all');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [visibleCount, setVisibleCount] = useState(6);
  const [loadingProjects, setLoadingProjects] = useState<boolean>(true);
  const [projectError, setProjectError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch('/api/projects?limit=6');
        if (!res.ok) throw new Error('Failed to fetch projects');
        const data = await res.json();
        const normalized: Project[] = Array.isArray(data?.items)
          ? data.items
              .filter((item: any) => item && item.id)
              .map((item: any) => ({
                id: item.id,
                title: item.title || 'Untitled Project',
                location: item.location || 'Tanzania',
                capacity: item.capacity || 'N/A',
                investment: item.investment || 'N/A',
                status: item.status || 'development',
                category: item.category || item.status || 'development',
                progress: typeof item.progress === 'number' ? item.progress : Number(item.progress) || 0,
                description: item.description || '',
                keyFeatures: Array.isArray(item.keyFeatures) ? item.keyFeatures : [],
                timeline: Array.isArray(item.timeline) ? item.timeline : [],
                impact: {
                  jobs: item.impact?.jobs || '',
                  co2: item.impact?.co2 || '',
                  homes: item.impact?.homes || '',
                  investment: item.impact?.investment || '',
                },
                imageUrl: item.imageUrl || null,
              }))
          : [];
        setProjects(normalized);
      } catch (error) {
        console.error('Unable to load projects', error);
        setProjectError('Unable to load projects at the moment. Please try again later.');
      } finally {
        setLoadingProjects(false);
      }
    };
    fetchProjects();
  }, []);

  useEffect(() => {
    setVisibleCount(6);
  }, [filter, projects.length]);

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
        if (progress < 1) requestAnimationFrame(updateCounter);
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

  const filteredProjects = useMemo(() => {
    const list = filter === 'all' ? projects : projects.filter((project) => project.category === filter);
    return list.slice(0, visibleCount);
  }, [projects, filter, visibleCount]);

  const selectedProject = useMemo(
    () => projects.find((project) => project.id === selectedProjectId) || null,
    [projects, selectedProjectId]
  );

  const categories = ['all', 'operational', 'construction', 'development', 'exploration'];

  return (
    <>
      <Head>
        <title>Geothermal Project Portfolio</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="inline-flex items-center px-4 py-2 bg-green-50 rounded-full mb-4">
                <span className="text-[#326101] text-sm font-medium">Our Work</span>
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

            <div className="grid md:grid-cols-4 gap-6 mb-12">
              <div className="bg-gradient-to-br from-[#326101] to-[#639427] text-white rounded-2xl p-6 text-center">
                <div className="text-3xl font-bold mb-2" id="totalProjects">
                  24
                </div>
                <div className="text-white/80 text-sm font-medium">Total Projects</div>
              </div>
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-2xl p-6 text-center">
                <div className="text-3xl font-bold mb-2" id="totalInvestment">
                  $1.8B
                </div>
                <div className="text-white/80 text-sm font-medium">Total Investment</div>
              </div>
              <div className="bg-gradient-to-br from-orange-500 to-red-500 text-white rounded-2xl p-6 text-center">
                <div className="text-3xl font-bold mb-2" id="operationalProjects">
                  8
                </div>
                <div className="text-white/80 text-sm font-medium">Operational</div>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-teal-500 text-white rounded-2xl p-6 text-center">
                <div className="text-3xl font-bold mb-2" id="totalCapacity">
                  2,150
                </div>
                <div className="text-white/80 text-sm font-medium">MW Capacity</div>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-4 mb-12">
              {categories.map((category) => (
                <button
                  key={category}
                  className={`px-6 py-3 rounded-full border-2 border-[#326101] text-[#326101] font-semibold transition-all duration-300 ease-in ${
                    filter === category ? 'bg-gradient-to-r from-[#326101] to-[#639427] text-white scale-105' : ''
                  }`}
                  onClick={() => setFilter(category)}
                >
                  {getCategoryLabel(category)}
                </button>
              ))}
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {loadingProjects && (
                <div className="col-span-full text-center text-gray-500">Loading projects...</div>
              )}
              {projectError && !loadingProjects && (
                <div className="col-span-full text-center text-red-500">{projectError}</div>
              )}
              {!loadingProjects && !projectError && filteredProjects.length === 0 && (
                <div className="col-span-full text-center text-gray-500">No projects available.</div>
              )}
              {filteredProjects.map((project) => (
                <div
                  key={project.id}
                  className="bg-white rounded-2xl overflow-hidden shadow-lg animate-[fadeInUp_0.6s_ease-out_forwards] transition-all duration-400 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] hover:-translate-y-3 hover:scale-102 hover:shadow-[0_25px_50px_rgba(0,0,0,0.15)]"
                >
                  <div
                    className="h-48 bg-cover bg-center bg-no-repeat relative overflow-hidden before:content-[''] before:absolute before:inset-0 before:bg-gradient-to-br before:from-black/40 before:to-black/10 before:z-[1]"
                    style={{ backgroundImage: `url(${getProjectImage(project)})` }}
                  >
                    <div className="absolute inset-0 p-6 flex flex-col justify-between z-[2]">
                      <div className="flex justify-between items-start">
                        <span className="backdrop-blur-md bg-white/20 px-3 py-1 rounded-full text-white text-sm font-medium">
                          {getStatusLabel(project.status)}
                        </span>
                        <span className="text-emerald-200 text-2xl font-bold">{project.capacity}</span>
                      </div>
                      <div className="text-white">
                        <h3 className="text-xl font-bold mb-2">{project.title}</h3>
                        <p className="text-emerald-100 text-sm">{project.location}</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-lg font-semibold text-gray-900">{project.investment} Investment</span>
                      <span className={`${getStatusBadgeClass(project.status)} px-3 py-1 rounded-full text-sm font-medium`}>
                        {project.progress}% Complete
                      </span>
                    </div>
                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>{getCategoryLabel(project.category)} Progress</span>
                        <span>{project.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-[#326101] to-[#639427] rounded-full h-2 transition-all duration-1000 ease-out"
                          style={{ width: `${project.progress}%` }}
                        ></div>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm mb-4">{project.description}</p>
                    <button
                      className="w-full bg-[#326101] text-white py-2 rounded-lg font-semibold hover:bg-[#639427] transition-colors"
                      onClick={() => setSelectedProjectId(project.id)}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {visibleCount < (filter === 'all' ? projects.length : projects.filter((p) => p.category === filter).length) && (
              <div className="text-center mt-12">
                <button
                  onClick={() => setVisibleCount((prev) => prev + 6)}
                  className="bg-gradient-to-r from-[#326101] to-[#639427] text-white px-8 py-4 rounded-full font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300"
                >
                  Load More Projects
                </button>
              </div>
            )}
          </div>
        </section>

        {selectedProject && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-black/50"
            onClick={() => setSelectedProjectId(null)}
          >
            <div
              className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-3xl font-bold text-gray-900">{selectedProject.title}</h2>
                  <button
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                    onClick={() => setSelectedProjectId(null)}
                  >
                    Close
                  </button>
                </div>
                <div
                  className="rounded-2xl overflow-hidden mb-6 h-64 bg-cover bg-center"
                  style={{ backgroundImage: `url(${getProjectImage(selectedProject)})` }}
                >
                  <div className="h-full w-full bg-gradient-to-br from-black/80 via-black/60 to-black/40 p-6 flex flex-col justify-end text-white">
                    <h3 className="text-2xl font-bold mb-2">{selectedProject.title}</h3>
                    <p className="text-emerald-100">
                      {selectedProject.location} • {selectedProject.capacity}
                    </p>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-green-50 p-4 rounded-xl">
                        <p className="text-sm text-gray-500 mb-1">Location</p>
                        <span className="font-semibold text-[#326101]">{selectedProject.location}</span>
                      </div>
                      <div className="bg-blue-50 p-4 rounded-xl">
                        <p className="text-sm text-gray-500 mb-1">Capacity</p>
                        <span className="font-semibold text-[#326101]">{selectedProject.capacity}</span>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-xl">
                        <p className="text-sm text-gray-500 mb-1">Investment</p>
                        <span className="font-semibold text-[#326101]">{selectedProject.investment}</span>
                      </div>
                      <div className="bg-yellow-50 p-4 rounded-xl">
                        <p className="text-sm text-gray-500 mb-1">Status</p>
                        <span className="font-semibold text-[#326101]">{getStatusLabel(selectedProject.status)}</span>
                      </div>
                    </div>
                    <div className="mb-6">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-600">Overall Progress</span>
                        <span>{selectedProject.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-[#326101] to-[#639427] rounded-full h-2"
                          style={{ width: `${selectedProject.progress}%` }}
                        ></div>
                      </div>
                    </div>
                    <p className="text-gray-600 leading-relaxed">{selectedProject.description}</p>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Key Features</h3>
                    <ul className="space-y-2 mb-6">
                      {selectedProject.keyFeatures.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-[#326101] mr-2">•</span>
                          <span className="text-gray-600">{feature}</span>
                        </li>
                      ))}
                      {!selectedProject.keyFeatures.length && (
                        <li className="text-sm text-gray-500">No key features provided.</li>
                      )}
                    </ul>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Project Impact</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-green-50 p-4 rounded-lg text-center">
                        <div className="text-lg font-bold text-[#326101] mb-1">
                          {selectedProject.impact.jobs || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-600">Jobs Created</div>
                      </div>
                      <div className="bg-blue-50 p-4 rounded-lg text-center">
                        <div className="text-lg font-bold text-blue-600 mb-1">
                          {selectedProject.impact.co2 || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-600">CO₂ Savings</div>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-lg text-center">
                        <div className="text-lg font-bold text-purple-600 mb-1">
                          {selectedProject.impact.homes || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-600">Homes Powered</div>
                      </div>
                      <div className="bg-orange-50 p-4 rounded-lg text-center">
                        <div className="text-lg font-bold text-orange-600 mb-1">
                          {selectedProject.impact.investment || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-600">Local Investment</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Project Timeline</h3>
                  <div className="space-y-4">
                    {selectedProject.timeline.map((phase, index) => (
                      <div key={`${phase.phase}-${index}`} className="flex items-center">
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
                    {!selectedProject.timeline.length && (
                      <div className="text-sm text-gray-500">Timeline details unavailable.</div>
                    )}
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
