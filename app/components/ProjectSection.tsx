import React, { useEffect, useMemo, useState } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';

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

interface PortfolioStat {
  id?: number;
  title: string;
  value: string;
  colorFrom: string;
  colorTo: string;
}

const defaultPortfolioStats: PortfolioStat[] = [
  { title: 'Total Projects', value: '24', colorFrom: '#326101', colorTo: '#639427' },
  { title: 'Total Investment', value: '$1.8B', colorFrom: '#3b82f6', colorTo: '#9333ea' },
  { title: 'Operational', value: '8', colorFrom: '#f97316', colorTo: '#ef4444' },
  { title: 'MW Capacity', value: '2,150', colorFrom: '#22c55e', colorTo: '#14b8a6' },
];

const ProjectSection: NextPage = () => {
  const [filter, setFilter] = useState<string>('all');
  const [projects, setProjects] = useState<Project[]>([]);
  const [visibleCount, setVisibleCount] = useState(6);
  const [loadingProjects, setLoadingProjects] = useState<boolean>(true);
  const [projectError, setProjectError] = useState<string | null>(null);
  const [portfolioStats, setPortfolioStats] = useState<PortfolioStat[]>(defaultPortfolioStats);
  const [portfolioTitle, setPortfolioTitle] = useState('Project Portfolio');
  const [portfolioSubtitle, setPortfolioSubtitle] = useState('Discover our comprehensive portfolio of geothermal projects across Tanzania and beyond. From exploration to operation, we deliver sustainable energy solutions.');

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch('/api/projects?limit=3');
        if (!res.ok) throw new Error('Failed to fetch projects');
        const data = await res.json();
        const normalized: Project[] = Array.isArray(data?.items)
          ? data.items
            .filter((item: any) => item && item.id)
            .map((item: any) => ({
              id: item.id,
              title: item.title || 'Untitled Project',
              location: item.location || 'Tanzania',
              capacity: item.capacity || '',
              investment: item.investment || '',
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

    // Fetch portfolio stats
    fetch('/api/portfolio-stats')
      .then(r => r.ok ? r.json() : [])
      .then(data => {
        if (Array.isArray(data) && data.length > 0) setPortfolioStats(data);
      })
      .catch(() => { });

    // Fetch editable section titles
    fetch('/api/site-settings?key=portfolio_section_title')
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.value) setPortfolioTitle(data.value); })
      .catch(() => { });
    fetch('/api/site-settings?key=portfolio_section_subtitle')
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.value) setPortfolioSubtitle(data.value); })
      .catch(() => { });
  }, []);

  useEffect(() => {
    setVisibleCount(6);
  }, [filter, projects.length]);

  const filteredProjects = useMemo(() => {
    const list = filter === 'all' ? projects : projects.filter((project) => project.category === filter);
    return list.slice(0, visibleCount);
  }, [projects, filter, visibleCount]);

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
              <h2 className="text-3xl lg:text-4xl font-semibold text-gray-900 mb-4">
                {portfolioTitle}
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                {portfolioSubtitle}
              </p>
            </div>

            <div className={`grid md:grid-cols-${Math.min(portfolioStats.length, 4)} gap-6 mb-12`}>
              {portfolioStats.map((stat, i) => (
                <div
                  key={i}
                  className="text-white rounded-2xl p-6 text-center"
                  style={{ background: `linear-gradient(to bottom right, ${stat.colorFrom}, ${stat.colorTo})` }}
                >
                  <div className="text-3xl font-semibold mb-2">{stat.value}</div>
                  <div className="text-white/80 text-sm font-medium">{stat.title}</div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap justify-center gap-4 mb-12">
              {categories.map((category) => (
                <button
                  key={category}
                  className={`px-6 py-3 rounded-full border-2 border-[#326101] text-[#326101] font-semibold transition-all duration-300 ease-in ${filter === category ? 'bg-gradient-to-r from-[#326101] to-[#639427] text-white scale-105' : ''
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
                        <span className="text-emerald-200 text-2xl font-semibold">{project.capacity}</span>
                      </div>
                      <div className="text-white">
                        <h3 className="text-xl font-semibold mb-2">{project.title}</h3>
                        <p className="text-emerald-100 text-sm">{project.location}</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{project.description}</p>
                    <Link
                      href={`/portfolio/${project.id}`}
                      className="block w-full bg-[#326101] text-white py-2 rounded-lg font-semibold hover:bg-[#639427] transition-colors text-center"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-12">
              <Link
                href="/projects"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-[#326101] to-[#639427] text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300"
              >
                View More Projects
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </Link>
            </div>
          </div>
        </section>
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
