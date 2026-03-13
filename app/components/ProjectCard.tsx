
import Image from 'next/image';
import { Project } from '../data/Projects';


interface ProjectCardProps {
  project: Project;
  setModalProject: (project: Project | null) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, setModalProject }) => {
  const statusColors: { [key: string]: { bg: string; text: string } } = {
    operational: { bg: 'bg-green-100', text: 'text-green-700' },
    construction: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
    development: { bg: 'bg-purple-100', text: 'text-purple-700' },
    exploration: { bg: 'bg-blue-100', text: 'text-blue-700' },
  };

  const statusIcons: { [key: string]: string } = {
    operational: '✅',
    construction: '🚧',
    development: '🏗️',
    exploration: '🔍',
  };

  const status = project.status.toLowerCase().replace(' phase', '');
  const { bg, text } = statusColors[status] || statusColors.exploration;
  const icon = statusIcons[status] || '🔍';

  return (
    <div className={`project-card bg-white rounded-2xl overflow-hidden shadow-lg fade-in-up`} data-category={status}>
      <div
        className="project-image h-48"
        style={{ backgroundImage: `url(${project.image})` }}
      >
        <div className="project-content absolute inset-0 p-6 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="status-badge px-3 py-1 rounded-full text-white text-sm font-medium">
              {icon} {project.status}
            </span>
            <span className="text-white text-2xl font-bold">{project.capacity}</span>
          </div>
          <div className="text-white">
            <h3 className="text-xl font-bold mb-2">{project.title}</h3>
            <p className="text-white/80 text-sm">{project.location}</p>
          </div>
        </div>
      </div>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-lg font-semibold text-gray-900">{project.investment} Investment</span>
          <span className={`${bg} ${text} px-3 py-1 rounded-full text-sm font-medium`}>
            {project.progress ? `${project.progress}% Complete` : '—'}
          </span>
        </div>
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>{status.charAt(0).toUpperCase() + status.slice(1)} Progress</span>
            <span>{project.progress ? `${project.progress}%` : '—'}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="progress-bar" style={{ width: `${project.progress}%` }}></div>
          </div>
        </div>
        <p className="text-gray-600 text-sm mb-4">{project.description}</p>
        <button
          className="w-full bg-primary-green text-white py-2 rounded-lg font-semibold hover:bg-secondary-green transition-colors"
          onClick={() => setModalProject(project)}
        >
          View Details
        </button>
      </div>
    </div>
  );
};

export default ProjectCard;
