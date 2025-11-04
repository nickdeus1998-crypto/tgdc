
export interface NewsArticle {
  id: number;
  imageSrc: string;
  imageAlt: string;
  date: string;
  category: string;
  categoryColor: string;
  headline: string;
  excerpt: string;
}

export interface Announcement {
  id: number;
  type: 'geothermal' | 'partnership' | 'award';
  badge: string;
  badgeGradient: string;
  badgeColor: string;
  subtext: string;
  date: string;
  pingColor: string;
  title: string;
  titleGradient: string;
  stats: { value: string; label: string; color: string }[];
  description: string;
  highlight: string;
  icon: string;
  learnMoreText: string;
  contactText: string;
}

export interface ModalContent {
  title: string;
  description: string;
  icon: string;
  color: string;
}
