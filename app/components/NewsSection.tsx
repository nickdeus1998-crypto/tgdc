"use client";

import React, { useState, useEffect } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';

interface NewsArticle {
  id: string;
  title: string;
  date: string;
  category: string;
  categoryColor: string;
  excerpt: string;
  imageUrl: string;
  imageAlt: string;
  content: string;
}

const newsArticles: NewsArticle[] = [
  {
    id: 'geothermal-plant-nevada',
    title: 'New 50MW Geothermal Plant Breaks Ground in Nevada',
    date: 'December 15, 2024',
    category: 'Project Update',
    categoryColor: 'bg-[#326101]/10 text-[#326101]',
    excerpt:
      'Construction begins on our largest geothermal facility to date, expected to power 40,000 homes with clean, renewable energy by 2026...',
    imageUrl:
      'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    imageAlt: 'Geothermal power plant construction site',
    content:
      'Construction has officially begun on a state-of-the-art 50MW geothermal power plant in Nevada, marking a significant milestone in our commitment to sustainable energy. This facility, expected to be operational by 2026, will harness the Earth’s natural heat to provide clean, renewable energy to approximately 40,000 homes. The project incorporates cutting-edge technology to maximize efficiency and minimize environmental impact, setting a new standard for geothermal energy production.',
  },
  {
    id: 'drilling-technology',
    title: 'Revolutionary Drilling Technology Increases Efficiency by 40%',
    date: 'December 10, 2024',
    category: 'Innovation',
    categoryColor: 'bg-blue-100 text-blue-700',
    excerpt:
      'Our engineering team unveils breakthrough drilling techniques that significantly reduce project timelines and environmental impact...',
    imageUrl:
      'https://images.unsplash.com/photo-1581094794329-c8112a89af12?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    imageAlt: 'Advanced drilling technology equipment',
    content:
      'Our engineering team has developed a revolutionary drilling technology that boosts efficiency by 40%, significantly reducing project timelines and environmental impact. This breakthrough involves advanced materials and automated systems that enhance precision and reduce energy consumption during drilling operations. The technology is already being implemented in our latest projects, promising faster deployment of geothermal energy solutions.',
  },
  {
    id: 'strategic-alliance',
    title: 'Strategic Alliance with Leading Energy Provider Announced',
    date: 'December 5, 2024',
    category: 'Partnership',
    categoryColor: 'bg-purple-100 text-purple-700',
    excerpt:
      'New partnership will accelerate geothermal development across three states, bringing sustainable energy to rural communities...',
    imageUrl:
      'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2126&q=80',
    imageAlt: 'Business partnership handshake',
    content:
      'We are thrilled to announce a strategic alliance with a leading energy provider to accelerate geothermal development across three states. This partnership will enable us to bring sustainable, clean energy to rural communities, fostering economic growth and environmental stewardship. By combining our expertise in geothermal technology with our partner’s extensive distribution network, we aim to make geothermal energy more accessible than ever before.',
  },
  {
    id: 'carbon-footprint',
    title: 'Carbon Footprint Reduced by 85% Through Geothermal Adoption',
    date: 'November 28, 2024',
    category: 'Sustainability',
    categoryColor: 'bg-green-100 text-green-700',
    excerpt:
      'Independent study confirms significant environmental benefits of our geothermal installations compared to traditional energy sources...',
    imageUrl:
      'https://images.unsplash.com/photo-1466611653911-95081537e5b7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    imageAlt: 'Green energy and environmental sustainability',
    content:
      'An independent study has confirmed that our geothermal installations reduce carbon footprints by 85% compared to traditional fossil fuel-based energy sources. This remarkable achievement underscores the environmental benefits of geothermal energy, which provides a reliable, renewable alternative to conventional power. Our ongoing commitment to sustainability drives us to expand geothermal adoption across diverse regions.',
  },
  {
    id: 'government-incentives',
    title: 'Government Incentives Boost Geothermal Investment by 200%',
    date: 'November 20, 2024',
    category: 'Industry News',
    categoryColor: 'bg-orange-100 text-orange-700',
    excerpt:
      'New federal tax credits and state-level incentives create unprecedented opportunities for geothermal energy development nationwide...',
    imageUrl:
      'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    imageAlt: 'Government building and policy documents',
    content:
      'Recent federal tax credits and state-level incentives have spurred a 200% increase in geothermal energy investment nationwide. These policies create unprecedented opportunities for expanding geothermal infrastructure, enabling us to accelerate project timelines and deliver clean energy to more communities. Our team is actively collaborating with policymakers to further enhance support for renewable energy initiatives.',
  },
  {
    id: 'innovation-award',
    title: 'GeoThermal Wins "Renewable Energy Innovation Award 2024"',
    date: 'November 15, 2024',
    category: 'Achievement',
    categoryColor: 'bg-red-100 text-red-700',
    excerpt:
      'Industry recognition for our groundbreaking work in enhanced geothermal systems and commitment to sustainable energy solutions...',
    imageUrl:
      'https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    imageAlt: 'Award trophy and achievement celebration',
    content:
      'We are honored to receive the "Renewable Energy Innovation Award 2024" for our groundbreaking work in enhanced geothermal systems. This prestigious recognition highlights our commitment to pushing the boundaries of sustainable energy solutions. Our innovative approaches to geothermal technology continue to set new benchmarks for efficiency and environmental impact in the renewable energy sector.',
  },
];

// Attempt to fetch dynamic news from API and merge with UI
function stripHtml(html: string): string {
  if (typeof window !== 'undefined') {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return (doc.body.textContent || '').replace(/\s+/g, ' ').trim();
  }
  return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#\d+;/g, '').replace(/\s+/g, ' ').trim();
}

function useNewsFromApi(staticItems: NewsArticle[]) {
  const [items, setItems] = useState<NewsArticle[]>(staticItems);
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/news');
        if (!res.ok) return;
        const rows = await res.json();
        const colorFor = (cat: string) => {
          const k = cat.toLowerCase();
          if (k.includes('project')) return 'bg-[#326101]/10 text-[#326101]';
          if (k.includes('innovation')) return 'bg-blue-100 text-blue-700';
          if (k.includes('partner')) return 'bg-purple-100 text-purple-700';
          if (k.includes('sustain')) return 'bg-green-100 text-green-700';
          if (k.includes('industry')) return 'bg-orange-100 text-orange-700';
          return 'bg-gray-100 text-gray-700';
        };
        const mapped: NewsArticle[] = (rows || []).map((r: any) => ({
          id: String(r.id || ''),
          title: r.title || 'Untitled',
          date: r.date ? new Date(r.date).toLocaleDateString() : new Date().toLocaleDateString(),
          category: r.category || 'News',
          categoryColor: colorFor(r.category || ''),
          excerpt: (() => {
            const plain = stripHtml(r.content || '');
            return plain.slice(0, 140) + (plain.length > 140 ? '…' : '');
          })(),
          imageUrl: r.coverImage || 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=1200&q=60',
          imageAlt: r.title || 'News image',
          content: r.content || '',
        }));
        if (mapped.length) setItems(mapped);
      } catch { }
    })();
  }, []);
  return items;
}

const Modal: React.FC<{ article: NewsArticle; onClose: () => void }> = ({ article, onClose }) => {
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-white rounded-2xl max-w-5xl w-full mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative">
          <Image
            src={article.imageUrl}
            alt={article.imageAlt}
            width={2070}
            height={1380}
            className="w-full h-80 object-cover rounded-t-2xl"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
        </div>
        <div className="p-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center text-gray-500 text-sm">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {article.date}
            </div>
            <span className={`px-3 py-1 ${article.categoryColor} text-xs font-medium rounded-full`}>
              {article.category}
            </span>
          </div>
          <h2 className="text-3xl font-semibold text-gray-900 mb-6 leading-tight">{article.title}</h2>
          <div className="prose prose-lg text-gray-700 mb-6 max-w-none" dangerouslySetInnerHTML={{ __html: article.content }} />
          <button
            onClick={onClose}
            className="bg-gradient-to-r from-[#326101] to-[#639427] text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const NewSection: NextPage = () => {
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const articles = useNewsFromApi(newsArticles);
  const [newsTitle, setNewsTitle] = useState('News');
  const [newsSubtitle, setNewsSubtitle] = useState('Stay informed with the latest developments in geothermal energy, project updates, and industry innovations from our expert team.');

  useEffect(() => {
    fetch('/api/site-settings?key=news_section_title')
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.value) setNewsTitle(data.value); })
      .catch(() => { });
    fetch('/api/site-settings?key=news_section_subtitle')
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.value) setNewsSubtitle(data.value); })
      .catch(() => { });
  }, []);

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Section Header */}
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-semibold text-gray-900 mb-4">
                {newsTitle}
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                {newsSubtitle}
              </p>
            </div>

            {/* News Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {articles.map((article) => (
                <article
                  key={article.id}
                  className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100 transition-all duration-300 ease-in hover:shadow-2xl hover:-translate-y-2"
                >
                  <div className="relative overflow-hidden">
                    <Image
                      src={article.imageUrl}
                      alt={article.imageAlt}
                      width={2070}
                      height={1380}
                      className="w-full h-48 object-cover transition-transform duration-300 hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center text-gray-500 text-sm">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {article.date}
                      </div>
                      <span className={`px-3 py-1 ${article.categoryColor} text-xs font-medium rounded-full`}>
                        {article.category}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 leading-tight">{article.title}</h3>
                    <p className="text-gray-600 mb-4 leading-relaxed">{article.excerpt}</p>
                    <Link
                      href={`/news/${article.id}`}
                      className="inline-flex items-center text-[#326101] font-semibold hover:text-[#639427] transition-all duration-300 hover:translate-x-1"
                    >
                      Read More
                      <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </article>
              ))}
            </div>

            {/* View All News Button */}
            <div className="text-center">
              <Link
                href="/news"
                className="inline-block bg-gradient-to-r from-[#326101] to-[#639427] text-white px-8 py-4 rounded-full font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300"
              >
                View All News & Updates
              </Link>
            </div>

          </div >
        </section >

        {/* Modal */}
        {selectedArticle && <Modal article={selectedArticle} onClose={() => setSelectedArticle(null)} />}
      </div >
    </>
  );
};

export default NewSection;
