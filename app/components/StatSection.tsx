// 'use client';
// import React, { useEffect, useState } from 'react';

// interface Stat {
//   label: string;
//   value: number;
// }

// interface StatsSection {
//   title: string;
//   stats: Stat[];
// }

// function StatSection() {
//   const [section, setSection] = useState<StatsSection | null>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchSection = async () => {
//       try {
//         const response = await fetch('/api/stats');
//         if (!response.ok) {
//           const errorText = await response.text();
//           console.error(`API Error: Status ${response.status} - ${errorText}`);
//           return; // Graceful exit without setting invalid data
//         }
//         const data = await response.json();
//         // Validate data structure before setting state
//         if (data && Array.isArray(data.stats)) {
//           setSection(data);
//         } else {
//           console.warn('Invalid stats data received:', data);
//         }
//       } catch (err) {
//         console.error('Error fetching stats:', err);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchSection();
//   }, []);

//   if (loading) return <div className="text-center py-8">Loading stats...</div>;
//   if (!section || !Array.isArray(section.stats)) {
//     return <div className="text-center py-8 text-gray-500">No stats available.</div>;
//   }

//   return (
//     <>
//       {/* Stats Section */}
//       <section className="py-16 bg-gray-900 rounded-2xl mx-4">
//         <div className="max-w-6xl mx-auto px-6 lg:px-8">
//           {/* Render Title if Available */}
//           {section.title && (
//             <h2 className="text-2xl font-bold text-white text-center mb-8">
//               {section.title}
//             </h2>
//           )}
//           <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
//             {section.stats.map((stat, index) => (
//               <div key={index} className="flex flex-col items-center">
//                 <div className="text-3xl font-bold text-green-500 mb-2">
//                   {stat.value.toLocaleString()}
//                 </div>
//                 <div className="text-gray-300 text-sm sm:text-base">{stat.label}</div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>
//     </>
//   );
// }

// export default StatSection; 

'use client';
import React, { useEffect, useState } from 'react';

interface Stat {
  title: string;
  value: number;
}

interface StatsResponse {
  title?: string;  // Optional for future extensibility
  stats: Stat[];
}

function StatSection() {
  const [data, setData] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/stats');
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`API Error: Status ${response.status} - ${errorText}`);
          return;
        }
        const responseData = await response.json();
        // Validate as array for compatibility
        if (Array.isArray(responseData)) {
          setData({ stats: responseData as Stat[] });
        } else if (responseData && Array.isArray(responseData.stats)) {
          setData(responseData);
        } else {
          console.warn('Invalid stats data received:', responseData);
          setData({ stats: [] });
        }
      } catch (err) {
        console.error('Error fetching stats:', err);
        setData({ stats: [] });
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="text-center py-8">Loading stats...</div>;
  if (!data || data.stats.length === 0) {
    return <div className="text-center py-8 text-gray-500">No stats available.</div>;
  }

  return (
    <section className="py-16 bg-gray-900 rounded-2xl mx-4" aria-labelledby="stats-title">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        {/* Optional Section Title */}
        {data.title && (
          <h2 id="stats-title" className="text-2xl font-bold text-white text-center mb-8">
            {data.title}
          </h2>
        )}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center" role="list">
          {data.stats.map((stat, index) => (

             <div key={index} className="flex flex-col items-center">
                 <div className="text-3xl font-bold text-green-500 mb-2">
                   {stat.value.toLocaleString()}
                 </div>
                 <div className="text-gray-300 text-sm sm:text-base">{stat.title}</div>
             </div>
           
          ))}
        </div>
      </div>
    </section>
  );
}

export default StatSection;