import Head from 'next/head';
import { ModalProvider } from './components/ModalContext';
import { IntroSection } from './components/IntroSection';
import { DiagramSection } from './components/DiagramSection';
import { PilotAreasSection } from './components/PilotAreaSection';
import { RoadmapSection } from './components/RoadmapSection';
import { HeroResourceSection } from './components/HeroSection';
import { PortfolioProjectsSection } from './components/PortfolioProjectsSection';
import prisma from '@/lib/prisma';

// Manual JSON parse for sqlite
function parseJSON(val: any, fallback: any) {
  if (!val) return fallback;
  if (typeof val !== 'string') return val;
  try { return JSON.parse(val); } catch { return fallback; }
}

export default async function ResourcePage() {
  const rows: any[] = await prisma.$queryRawUnsafe('SELECT * FROM DirectUsePage WHERE id = 1 LIMIT 1');
  const rawData = rows && rows.length > 0 ? rows[0] : null;

  // Normalize data for SQLite compatibility
  const data = rawData ? {
    ...rawData,
    showUtilization: rawData.showUtilization === 1 || rawData.showUtilization === true || rawData.showUtilization === 'true'
  } : null;


  return (
    <>
      <Head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{data?.heroTitle || "TGDC Projects"} – Direct Use</title>
        <style>{`
          .hero-bg {
            background: radial-gradient(1200px 600px at 10% -10%, rgba(99,148,39,0.25), transparent 60%),
                        radial-gradient(1200px 600px at 110% 10%, rgba(50,97,1,0.25), transparent 60%),
                        linear-gradient(135deg, #326101, #639427);
          }
          .card {
            transition: transform .25s ease, box-shadow .25s ease;
          }
          .card:hover { transform: translateY(-6px); box-shadow: 0 20px 45px rgba(0,0,0,.1); }
          .badge {
            background: linear-gradient(135deg, #326101, #639427);
          }
          .step:before {
            content: '';
            position: absolute;
            left: 1.25rem;
            top: 2.5rem;
            bottom: -2.25rem;
            width: 2px;
            background: linear-gradient(180deg, rgba(50,97,1,.25), rgba(99,148,39,.25));
          }
          .step:last-child:before { display: none; }
          .range:hover { opacity: .95; transform: translateY(-2px); }
          .tooltip {
            pointer-events: none;
            transform: translate(-50%, -120%);
            white-space: nowrap;
          }
          .modal-backdrop { background: rgba(0,0,0,.5); backdrop-filter: blur(6px); }
          .indicator-dot { animation: pulse 2.5s ease-in-out infinite; }
          @keyframes pulse {
            0%,100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.15); opacity: .7; }
          }
        `}</style>
      </Head>
      <div className="bg-gradient-to-br from-blue-50 via-white to-green-50 text-gray-800">
        <ModalProvider>
          <HeroResourceSection
            title={data?.heroTitle || undefined}
            subtitle={data?.heroSubtitle || undefined}
          />
          <PortfolioProjectsSection />
          <RoadmapSection />
        </ModalProvider>
      </div>
    </>
  );
}
