import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import Chart from 'chart.js/auto';


type Priority = 'high' | 'medium' | 'low';

const priorityStyles: Record<Priority, string> = {
  high: 'border-l-4 border-[#ef4444]',
  medium: 'border-l-4 border-[#f59e0b]',
  low: 'border-l-4 border-[#10b981]',
};



// Types
interface Project {
  id: string;
  name: string;
  description: string;
  zone: string;
  status: string;
  progress: number;
  dueDate: string;
  priority?: string;
  assignees?: string[];
}

interface FormData {
  projectName: string;
  zone: string;
  projectType: string;
  priority: string;
  startDate: string;
  dueDate: string;
  budget: string;
  description: string;
}



// KanbanCard Component
const KanbanCard: React.FC<{
  project: Project;
  onDragStart: (e: React.DragEvent, project: Project) => void;
  onDragEnd: () => void;
}> = ({ project, onDragStart, onDragEnd }) => {
  const priorityStyles = {
    high: 'border-l-4 border-[#ef4444]',
    medium: 'border-l-4 border-[#f59e0b]',
    low: 'border-l-4 border-[#10b981]',
  };
  const priority = (project.priority?.toLowerCase() as Priority) || 'low';

  return (
    <div
      className={`bg-white rounded-lg border p-4 ${priorityStyles[priority]} transition-transform duration-200 ease-in-out cursor-grab hover:-translate-y-0.5 hover:shadow-lg active:opacity-50 active:rotate-1`}
      draggable
      onDragStart={(e) => onDragStart(e, project)}
      onDragEnd={onDragEnd}
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-semibold text-gray-900 text-sm">{project.name}</h4>
        <span className="text-xs text-gray-500">{project.priority?.toUpperCase() || '✓'}</span>
      </div>
      <p className="text-xs text-gray-600 mb-3">{project.description}</p>
      {project.progress > 0 && (
        <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
          <div
            className="bg-[#326101] h-2 rounded-full"
            style={{ width: `${project.progress}%` }}
          ></div>
        </div>
      )}
      <div className="flex items-center justify-between">
        <div className="flex -space-x-2">
          {project.assignees?.map((assignee, index) => (
            <div
              key={index}
              className={`w-6 h-6 rounded-full bg-${['blue', 'green', 'purple', 'red', 'yellow', 'indigo'][index % 6]}-500 border-2 border-white`}
            ></div>
          ))}
        </div>
        <span className="text-xs text-gray-500">{project.dueDate}</span>
      </div>
    </div>
  );
};

// KanbanColumn Component
const KanbanColumn: React.FC<{
  title: string;
  status: string;
  count: number;
  projects: Project[];
  badgeColor: string;
  onDrop: (e: React.DragEvent, status: string) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragStart: (e: React.DragEvent, project: Project) => void;
  onDragEnd: () => void;
}> = ({ title, status, count, projects, badgeColor, onDrop, onDragOver, onDragStart, onDragEnd }) => {
  return (
    <div
      className="kanban-column rounded-2xl border border-gray-200 p-4 bg-[#f8fafc] min-h-[500px]"
      data-status={status}
      onDrop={(e) => onDrop(e, status)}
      onDragOver={onDragOver}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">{title}</h3>
        <span className={`bg-${badgeColor}-100 text-${badgeColor}-600 px-2 py-1 rounded-full text-xs`}>{count}</span>
      </div>
      <div className="space-y-3">
        {projects.map((project) => (
          <KanbanCard
            key={project.id}
            project={project}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
          />
        ))}
      </div>
    </div>
  );
};

// Main App Component
const ProjectManagement: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<string>('overview');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [draggedProject, setDraggedProject] = useState<Project | null>(null);
  const [projects, setProjects] = useState<Project[]>([
    {
      id: '1',
      name: 'Utete Site Reconnaissance',
      description: 'Initial site visit and geological assessment',
      zone: 'Eastern',
      status: 'planning',
      progress: 0,
      dueDate: 'Dec 20',
      priority: 'Medium',
      assignees: ['blue', 'green'],
    },
    {
      id: '2',
      name: 'Equipment Procurement',
      description: 'Source drilling equipment for Q1 operations',
      zone: 'All',
      status: 'planning',
      progress: 0,
      dueDate: 'Jan 15',
      priority: 'Low',
      assignees: ['purple'],
    },
    {
      id: '3',
      name: 'Kisaki Drilling Phase 1',
      description: 'Active drilling operations at Kisaki site',
      zone: 'Eastern',
      status: 'progress',
      progress: 65,
      dueDate: 'Dec 30',
      priority: 'High',
      assignees: ['red', 'yellow', 'blue'],
    },
    {
      id: '4',
      name: 'Environmental Assessment',
      description: 'ESIA documentation for Luhoi site',
      zone: 'Eastern',
      status: 'progress',
      progress: 40,
      dueDate: 'Jan 10',
      priority: 'Medium',
      assignees: ['green', 'purple'],
    },
    {
      id: '5',
      name: 'Geological Report - Mtende',
      description: 'Final review of geological findings',
      zone: 'Eastern',
      status: 'review',
      progress: 0,
      dueDate: 'Dec 18',
      priority: 'Medium',
      assignees: ['indigo'],
    },
    {
      id: '6',
      name: 'Site Access Permits',
      description: 'All permits secured for Eastern Zone',
      zone: 'Eastern',
      status: 'completed',
      progress: 0,
      dueDate: 'Dec 10',
      priority: 'Low',
      assignees: ['green'],
    },
    {
      id: '7',
      name: 'Team Training Program',
      description: 'Safety and technical training completed',
      zone: 'All',
      status: 'completed',
      progress: 0,
      dueDate: 'Dec 5',
      priority: 'Low',
      assignees: ['blue', 'red'],
    },
  ]);

  const timelineChartRef = useRef<Chart | null>(null);
  const budgetChartRef = useRef<Chart | null>(null);
  const timelineCanvasRef = useRef<HTMLCanvasElement>(null);
  const budgetCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (currentTab === 'analytics' && timelineCanvasRef.current && budgetCanvasRef.current) {
      if (!timelineChartRef.current) {
        timelineChartRef.current = new Chart(timelineCanvasRef.current, {
          type: 'line',
          data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [
              {
                label: 'Projects Started',
                data: [3, 5, 4, 6, 4, 7],
                borderColor: '#326101',
                backgroundColor: 'rgba(50, 97, 1, 0.1)',
                tension: 0.4,
                fill: true,
              },
              {
                label: 'Projects Completed',
                data: [2, 3, 3, 4, 5, 5],
                borderColor: '#639427',
                backgroundColor: 'rgba(99, 148, 39, 0.1)',
                tension: 0.4,
                fill: true,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'bottom' } },
            scales: { y: { beginAtZero: true } },
          },
        });
      }
      if (!budgetChartRef.current) {
        budgetChartRef.current = new Chart(budgetCanvasRef.current, {
          type: 'doughnut',
          data: {
            labels: ['Exploration', 'Drilling', 'Environmental', 'Equipment', 'Infrastructure'],
            datasets: [
              {
                data: [800000, 600000, 300000, 400000, 300000],
                backgroundColor: ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444'],
                borderWidth: 0,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'bottom' } },
          },
        });
      }
    }
    return () => {
      if (timelineChartRef.current) {
        timelineChartRef.current.destroy();
        timelineChartRef.current = null;
      }
      if (budgetChartRef.current) {
        budgetChartRef.current.destroy();
        budgetChartRef.current = null;
      }
    };
  }, [currentTab]);

  const handleDragStart = (e: React.DragEvent, project: Project) => {
    setDraggedProject(project);
    e.currentTarget.classList.add('opacity-50', 'rotate-1');
  };

  const handleDragEnd = () => {
    setDraggedProject(null);
    document.querySelectorAll('.kanban-card').forEach((el) => {
      el.classList.remove('opacity-50', 'rotate-1');
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, status: string) => {
    e.preventDefault();
    if (draggedProject) {
      setProjects((prev) =>
        prev.map((p) =>
          p.id === draggedProject.id ? { ...p, status } : p
        )
      );
      console.log(`Moved task to ${status}`);
    }
  };

  const handleNewProjectSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newProject: Project = {
      id: Math.random().toString(36).substr(2, 9),
      name: formData.get('projectName') as string,
      description: formData.get('description') as string,
      zone: formData.get('zone') as string,
      status: 'planning',
      progress: 0,
      dueDate: formData.get('dueDate') as string,
      priority: formData.get('priority') as string,
      assignees: ['blue'],
    };
    setProjects((prev) => [...prev, newProject]);
    setIsModalOpen(false);
    alert('Project created successfully! (This would integrate with your backend system)');
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-green-50 text-gray-800 box-border">
      {/* Hero Section */}
      <section
        className="text-white py-12 md:py-16"
        style={{
          background:
            'radial-gradient(900px 460px at 10% -10%, rgba(99,148,39,0.18), transparent 60%), ' +
            'radial-gradient(800px 420px at 110% 0%, rgba(50,97,1,0.18), transparent 60%), ' +
            'linear-gradient(135deg, #326101, #639427)',
        }}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <span className="inline-flex items-center gap-2 text-sm bg-white/15 px-3 py-1.5 rounded-full">
                <span className="w-2 h-2 rounded-full bg-emerald-300"></span>
                Admin Dashboard
              </span>
              <h1 className="text-3xl md:text-4xl font-extrabold mt-4 leading-tight">
                Project Management Center
              </h1>
              <p className="text-white/90 text-lg mt-3 max-w-2xl">
                Create, track, and manage geothermal exploration projects across all zones with comprehensive admin tools.
              </p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-white text-[#326101] px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              New Project
            </button>
          </div>
        </div>
      </section>

      {/* Navigation Tabs */}
      <section className="py-6">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3">
            <div className="flex flex-wrap gap-2">
              {['overview', 'kanban', 'projects', 'analytics', 'team'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setCurrentTab(tab)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold text-gray-700 hover:bg-green-50 ${
                    currentTab === tab ? 'bg-gradient-to-r from-[#326101] to-[#639427] text-white' : ''
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1).replace('kanban', 'Kanban Board')}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Overview Section */}
      {currentTab === 'overview' && (
        <section className="pb-16">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[
                { value: '18', label: 'Active Projects', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', bg: 'bg-emerald-100', color: 'text-emerald-600' },
                { value: '7', label: 'Overdue Tasks', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', bg: 'bg-red-100', color: 'text-red-600' },
                { value: '12', label: 'Team Members', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z', bg: 'bg-blue-100', color: 'text-blue-600' },
                { value: '$2.4M', label: 'Budget Allocated', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1', bg: 'bg-purple-100', color: 'text-purple-600' },
              ].map((stat, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 animate-fade-in transition-transform duration-200 ease-in-out hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                      <div className="text-sm text-gray-600">{stat.label}</div>
                    </div>
                    <div className={`w-12 h-12 rounded-full ${stat.bg} flex items-center justify-center`}>
                      <svg className={`w-6 h-6 ${stat.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={stat.icon} />
                      </svg>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 animate-fade-in">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Recent Projects</h3>
                  <p className="text-sm text-gray-600">Latest project activities and updates</p>
                </div>
                <button className="text-sm text-[#326101] hover:underline">View All</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-gray-600">
                    <tr>
                      {['Project', 'Zone', 'Status', 'Progress', 'Due Date', 'Actions'].map((header) => (
                        <th key={header} className={`text-left py-3 px-4 ${header === 'Project' ? 'rounded-l-lg' : header === 'Actions' ? 'rounded-r-lg' : ''}`}>
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {[
                      {
                        name: 'Kisaki Geothermal Survey',
                        description: 'Initial exploration phase',
                        zone: 'Eastern',
                        status: 'Active',
                        statusColor: 'bg-green-100 text-green-800',
                        progress: 75,
                        dueDate: 'Dec 15, 2024',
                      },
                      {
                        name: 'Luhoi Site Assessment',
                        description: 'Environmental impact study',
                        zone: 'Eastern',
                        status: 'Planning',
                        statusColor: 'bg-yellow-100 text-yellow-800',
                        progress: 30,
                        dueDate: 'Jan 20, 2025',
                      },
                    ].map((project, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="font-semibold text-gray-900">{project.name}</div>
                          <div className="text-xs text-gray-500">{project.description}</div>
                        </td>
                        <td className="py-3 px-4">{project.zone}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${project.statusColor}`}>
                            {project.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-[#326101] h-2 rounded-full"
                                style={{ width: `${project.progress}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-gray-600">{project.progress}%</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">{project.dueDate}</td>
                        <td className="py-3 px-4">
                          <button className="text-[#326101] hover:underline text-xs">Edit</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Kanban Board Section */}
      {currentTab === 'kanban' && (
        <section className="pb-16">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Project Kanban Board</h2>
                <p className="text-gray-600">Drag and drop projects to update their status</p>
              </div>
              <div className="flex items-center gap-3">
                <select className="text-sm border border-gray-200 rounded-lg px-3 py-2 text-gray-900">
                  <option>All Zones</option>
                  <option>Eastern Zone</option>
                  <option>Lake Zone</option>
                  <option>Southern Zone</option>
                </select>
                <button className="bg-[#326101] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#639427]">
                  Add Task
                </button>
              </div>
            </div>
            <div className="grid lg:grid-cols-4 gap-6">
              {[
                { title: 'Planning', status: 'planning', badgeColor: 'gray' },
                { title: 'In Progress', status: 'progress', badgeColor: 'blue' },
                { title: 'Review', status: 'review', badgeColor: 'yellow' },
                { title: 'Completed', status: 'completed', badgeColor: 'green' },
              ].map((column) => (
                <KanbanColumn
                  key={column.status}
                  title={column.title}
                  status={column.status}
                  count={projects.filter((p) => p.status === column.status).length}
                  projects={projects.filter((p) => p.status === column.status)}
                  badgeColor={column.badgeColor}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Projects Section */}
      {currentTab === 'projects' && (
        <section className="pb-16">
          <div className="max-w-7xl mx-auto px-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">All Projects</h2>
                  <p className="text-gray-600">Manage and track all geothermal exploration projects</p>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    placeholder="Search projects..."
                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#326101] focus:border-transparent"
                  />
                  <select className="text-sm border border-gray-200 rounded-lg px-3 py-2 text-gray-900">
                    <option>All Status</option>
                    <option>Active</option>
                    <option>Planning</option>
                    <option>Completed</option>
                  </select>
                </div>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  {
                    name: 'Kisaki Geothermal Survey',
                    zone: 'Eastern Zone • Exploration',
                    status: 'Active',
                    statusColor: 'bg-green-100 text-green-800',
                    description: 'Comprehensive geological survey and initial drilling operations at Kisaki site within Selous Game Reserve.',
                    progress: 75,
                    dueDate: 'Dec 15, 2024',
                  },
                  {
                    name: 'Luhoi Site Assessment',
                    zone: 'Eastern Zone • Planning',
                    status: 'Planning',
                    statusColor: 'bg-yellow-100 text-yellow-800',
                    description: 'Environmental impact assessment and community engagement for Luhoi geothermal prospect development.',
                    progress: 30,
                    dueDate: 'Jan 20, 2025',
                  },
                  {
                    name: 'Equipment Procurement',
                    zone: 'All Zones • Procurement',
                    status: 'In Progress',
                    statusColor: 'bg-blue-100 text-blue-800',
                    description: 'Sourcing and procurement of specialized drilling and monitoring equipment for field operations.',
                    progress: 60,
                    dueDate: 'Feb 1, 2025',
                  },
                ].map((project, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-xl p-5 transition-transform duration-200 ease-in-out hover:-translate-y-0.5 hover:shadow-lg"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">{project.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{project.zone}</p>
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${project.statusColor}`}>
                        {project.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mb-4">{project.description}</p>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-gray-600">Progress</span>
                      <span className="text-sm font-semibold text-gray-900">{project.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                      <div
                        className="bg-[#326101] h-2 rounded-full"
                        style={{ width: `${project.progress}%` }}
                      ></div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Due: {project.dueDate}</span>
                      <button className="text-[#326101] hover:underline">View Details</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Analytics Section */}
      {currentTab === 'analytics' && (
        <section className="pb-16">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-8 mb-8">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Project Timeline</h3>
                    <p className="text-sm text-gray-600">Monthly project completion rates</p>
                  </div>
                </div>
                <div className="h-64">
                  <canvas ref={timelineCanvasRef}></canvas>
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Budget Allocation</h3>
                    <p className="text-sm text-gray-600">Spending by project category</p>
                  </div>
                </div>
                <div className="h-64">
                  <canvas ref={budgetCanvasRef}></canvas>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Performance Metrics</h3>
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  { value: '92%', label: 'On-Time Delivery' },
                  { value: '$1.8M', label: 'Budget Utilized' },
                  { value: '15', label: 'Projects Completed' },
                ].map((metric, index) => (
                  <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-[#326101]">{metric.value}</div>
                    <div className="text-sm text-gray-600 mt-1">{metric.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Team Section */}
      {currentTab === 'team' && (
        <section className="pb-16">
          <div className="max-w-7xl mx-auto px-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Team Management</h2>
                  <p className="text-gray-600">Manage team members and their project assignments</p>
                </div>
                <button className="bg-[#326101] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#639427]">
                  Add Member
                </button>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { name: 'John Mwalimu', role: 'Project Manager', initials: 'JM', color: 'blue', projects: 3, tasks: 24 },
                  { name: 'Amina Salim', role: 'Geologist', initials: 'AS', color: 'green', projects: 2, tasks: 18 },
                  { name: 'David Kimani', role: 'Environmental Specialist', initials: 'DK', color: 'purple', projects: 4, tasks: 31 },
                ].map((member, index) => (
                  <div key={index} className="border border-gray-200 rounded-xl p-5 transition-transform duration-200 ease-in-out hover:-translate-y-0.5 hover:shadow-lg">
                    <div className="flex items-center gap-4 mb-4">
                      <div className={`w-12 h-12 rounded-full bg-${member.color}-500 flex items-center justify-center text-white font-semibold`}>
                        {member.initials}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{member.name}</h3>
                        <p className="text-sm text-gray-600">{member.role}</p>
                      </div>
                    </div>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Active Projects</span>
                        <span className="font-semibold">{member.projects}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Completed Tasks</span>
                        <span className="font-semibold">{member.tasks}</span>
                      </div>
                    </div>
                    <button className="w-full text-center py-2 text-sm text-[#326101] border border-[#326101] rounded-lg hover:bg-green-50">
                      View Profile
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* New Project Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-white max-w-2xl w-full rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
            <div className="flex items-start justify-between p-6 border-b">
              <div>
                <h4 className="text-xl font-bold text-gray-900">Create New Project</h4>
                <p className="text-sm text-gray-500 mt-1">Add a new geothermal exploration project</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">
                &times;
              </button>
            </div>
            <form onSubmit={handleNewProjectSubmit} className="p-6">
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Project Name</label>
                  <input
                    type="text"
                    name="projectName"
                    required
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-[#326101] focus:border-transparent"
                    placeholder="e.g., Tagalala Site Survey"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Zone</label>
                  <select
                    name="zone"
                    required
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-gray-900 focus:ring-2 focus:ring-[#326101] focus:border-transparent"
                  >
                    <option value="">Select Zone</option>
                    <option value="eastern">Eastern Zone</option>
                    <option value="lake">Lake Zone</option>
                    <option value="southern">Southern Zone</option>
                    <option value="northern">Northern Zone</option>
                    <option value="central">Central Zone</option>
                  </select>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Project Type</label>
                  <select
                    name="projectType"
                    required
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-gray-900 focus:ring-2 focus:ring-[#326101] focus:border-transparent"
                  >
                    <option value="">Select Type</option>
                    <option value="exploration">Exploration</option>
                    <option value="drilling">Drilling</option>
                    <option value="assessment">Environmental Assessment</option>
                    <option value="procurement">Procurement</option>
                    <option value="infrastructure">Infrastructure</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                  <select
                    name="priority"
                    required
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-gray-900 focus:ring-2 focus:ring-[#326101] focus:border-transparent"
                  >
                    <option value="">Select Priority</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                  <input
                    type="date"
                    name="startDate"
                    required
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-gray-900 focus:ring-2 focus:ring-[#326101] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
                  <input
                    type="date"
                    name="dueDate"
                    required
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-gray-900 focus:ring-2 focus:ring-[#326101] focus:border-transparent"
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Budget (USD)</label>
                <input
                  type="number"
                  name="budget"
                  required
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-[#326101] focus:border-transparent"
                  placeholder="e.g., 150000"
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  name="description"
                  required
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-[#326101] focus:border-transparent"
                  placeholder="Describe the project objectives and scope..."
                ></textarea>
              </div>
              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#326101] text-white rounded-lg hover:bg-[#639427]"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectManagement;


// Render the app


  
