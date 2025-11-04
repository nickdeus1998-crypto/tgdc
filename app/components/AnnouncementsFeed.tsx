"use client";

import React from 'react';

type Item = {
  id: number;
  title: string;
  description: string;
  date: string;
};

interface AnnouncementsFeedProps {
  items: Item[];
  title?: string;
}

export default function AnnouncementsFeed({ items, title = 'Announcements' }: AnnouncementsFeedProps) {
  return (
    <section className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
      </div>
      {items.length === 0 ? (
        <div className="text-sm text-gray-500">No announcements.</div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {items.map((a) => (
            <article key={a.id} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
              <header className="flex items-center justify-between mb-2">
                <h3 className="text-base font-semibold text-gray-900 line-clamp-2">{a.title}</h3>
                <time className="text-xs text-gray-500 whitespace-nowrap">{a.date}</time>
              </header>
              <p className="text-sm text-gray-700 line-clamp-3">{a.description}</p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

