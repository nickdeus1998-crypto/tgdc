
'use client';

import React from 'react';
import { Announcement as AnnouncementType } from './types';

interface AnnouncementProps {
  announcement: AnnouncementType;
  isActive: boolean;
  onLearnMore: (type: string) => void;
  onContact: (type: string) => void;
}

const Announcement: React.FC<AnnouncementProps> = ({ announcement, isActive, onLearnMore, onContact }) => {
  return (
    <div
      className={`announcement-content absolute inset-0 p-6 ${isActive ? 'active' : 'slide-in'}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="bg-white/20 backdrop-blur-sm rounded-full p-3 mr-3 float">
            <svg className={`w-6 h-6 ${announcement.badgeColor}`} fill="currentColor" viewBox="0 0 24 24">
              <path d={announcement.icon} />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className={`bg-gradient-to-r ${announcement.badgeGradient} text-yellow-900 px-3 py-1 rounded-full text-xs font-bold shadow-lg`}>
              {announcement.badge}
            </span>
            <span className="text-white/70 text-xs mt-1">{announcement.subtext}</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-white/60">{announcement.date}</div>
          <div className={`w-2 h-2 ${announcement.pingColor} rounded-full notification-ping relative`}></div>
        </div>
      </div>
      <h3 className={`text-xl font-bold mb-3 leading-tight bg-gradient-to-r ${announcement.titleGradient} bg-clip-text text-transparent`}>
        {announcement.title}
      </h3>
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 mb-4 border border-white/20">
        <div className="flex justify-between items-center text-sm">
          {announcement.stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
              <div className="text-white/80 text-xs">{stat.label}</div>
              {index < announcement.stats.length - 1 && <div className="w-px h-8 bg-white/30"></div>}
            </div>
          ))}
        </div>
      </div>
      <p className="text-white/90 text-sm mb-5 leading-relaxed">
        {announcement.description}
        <span className={`font-semibold ${announcement.badgeColor}`}> {announcement.highlight}</span>
      </p>
      <div className="flex gap-3">
        <button
          onClick={() => onLearnMore(announcement.type)}
          className="bg-white text-green-800 px-5 py-3 rounded-full text-sm font-bold hover:bg-yellow-50 hover:scale-105 transition-all duration-300 flex-1 shadow-lg hover:shadow-xl"
        >
          <span className="flex items-center justify-center">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={announcement.learnMoreText === 'View Details' ? 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' : 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'} />
            </svg>
            {announcement.learnMoreText}
          </span>
        </button>
        <button
          onClick={() => onContact(announcement.type)}
          className="bg-white/20 backdrop-blur-sm text-white px-5 py-3 rounded-full text-sm font-bold hover:bg-white/30 hover:scale-105 transition-all duration-300 flex-1 border border-white/30 shadow-lg hover:shadow-xl"
        >
          <span className="flex items-center justify-center">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={announcement.contactText === 'Share' ? 'M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z' : announcement.contactText === 'Join Us' ? 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' : 'M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'} />
            </svg>
            {announcement.contactText}
          </span>
        </button>
      </div>
    </div>
  );
};

export default Announcement;