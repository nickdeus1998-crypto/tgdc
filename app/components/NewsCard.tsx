
'use client';

import React from 'react';
import styles from './styles.module.css';


// Define the NewsArticle interface (if not already defined elsewhere)
interface NewsArticle {
  id: number;
  imageSrc: string;
  imageAlt: string;
  date: string;
  category: string;
  categoryColor: string;
  headline: string;
  excerpt: string;
}

const NewsCard: React.FC<{ article: NewsArticle }> = ({ article }) => {
  return (
    <article className={`${styles.newsCard} bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100 hover:shadow-2xl`}>
      <div className="relative overflow-hidden">
        <img
          src={article.imageSrc}
          alt={article.imageAlt}
          className="w-full h-48 object-cover transition-transform duration-300 hover:scale-105"
          onError={(e) => {
            e.currentTarget.src = '';
            e.currentTarget.alt = 'Image failed to load';
            e.currentTarget.style.display = 'none';
          }}
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
        <h3 className="text-xl font-bold text-gray-900 mb-3 leading-tight">
          {article.headline}
        </h3>
        <p className="text-gray-600 mb-4 leading-relaxed">
          {article.excerpt}
        </p>
        <a href="#" className={`${styles.readMoreBtn} inline-flex items-center text-primary-green font-semibold hover:text-secondary-green`}>
          Read More
          <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </a>
      </div>
    </article>
  );
};

export default NewsCard;