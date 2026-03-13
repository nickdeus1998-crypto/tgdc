
'use client';

import React from 'react';

const LearnMoreModal: React.FC<{ type: string; onClose: () => void }> = ({ type, onClose }) => {
  const content = {
    geothermal: {
      title: 'Revolutionary EGS Technology',
      description: 'Our Enhanced Geothermal System breakthrough increases energy output by 60% while reducing costs by 40%. This game-changing technology is now available for new projects worldwide.',
      icon: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
      color: 'from-green-800 to-green-600',
    },
    partnership: {
      title: 'Global Energy Alliance',
      description: 'Our strategic partnership with 15 leading energy companies represents the largest renewable energy alliance ever formed, with $2B in committed investment across 15 countries.',
      icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
      color: 'from-blue-500 to-purple-600',
    },
    award: {
      title: 'Innovation Award Winner',
      description: 'Recognized by the International Renewable Energy Council as the #1 innovation of 2024. Our EGS technology is setting new standards for the entire geothermal industry.',
      icon: 'M5 16L3 21l5.25-1.25L12 19l3.75 1.25L21 21l-2-5 2-5-5.25 1.25L12 13l-3.75-1.25L3 11l2 5z',
      color: 'from-yellow-500 to-red-500',
    },
  };

  const info = content[type as keyof typeof content];

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl p-8 max-w-md mx-auto shadow-2xl transform scale-95 hover:scale-100 transition-transform duration-300">
        <div className="text-center">
          <div className={`w-16 h-16 bg-gradient-to-r ${info.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d={info.icon} />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">{info.title}</h3>
          <p className="text-gray-600 mb-6 leading-relaxed">{info.description}</p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-full font-semibold hover:bg-gray-200 transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => {
                onClose();
                console.log(`Contact Us clicked - ${type}`);
              }}
              className={`flex-1 bg-gradient-to-r ${info.color} text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg transition-all`}
            >
              Get Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearnMoreModal;
