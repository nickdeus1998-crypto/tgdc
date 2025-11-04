// app/page.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import type { ChartData, ChartOptions } from 'chart.js';
import { Line } from 'react-chartjs-2';

// Dynamic import for the chart to avoid SSR issues
// const Line = dynamic(() => import('react-chartjs').then((mod) => mod.Line), { ssr: false });

// Types
interface Message {
  id: number;
  sender: string;
  text: string;
  time: string;
  sent: boolean;
}

interface Conversation {
  name: string;
  avatar: string;
  color: string;
  status: string;
  messages: Message[];
}

interface NewsArticle {
  id: number;
  title: string;
  content: string;
  author: string;
  date: string;
  status: string;
  views: number;
}

// Initial data
const initialConversations: Record<number, Conversation> = {
  1: {
    name: 'Sarah Editor',
    avatar: 'SE',
    color: 'bg-blue-500',
    status: 'Online',
    messages: [
      { id: 1, sender: 'Sarah Editor', text: "Hi! I've updated the homepage content as requested. Could you please review it?", time: '10:30 AM', sent: false },
      { id: 2, sender: 'You', text: "Thanks Sarah! I'll take a look and get back to you shortly.", time: '10:35 AM', sent: true },
      { id: 3, sender: 'Sarah Editor', text: 'Perfect! I also added some new images to the hero section. Let me know if you need any adjustments.', time: '10:45 AM', sent: false },
      { id: 4, sender: 'You', text: 'The images look great! Can you also update the project timeline section?', time: '11:00 AM', sent: true }
    ]
  },
  2: {
    name: 'Mike Writer',
    avatar: 'MW',
    color: 'bg-purple-500',
    status: 'Offline',
    messages: [
      { id: 1, sender: 'Mike Writer', text: "I've finished the blog post about the Kisaki project. It's ready for your approval.", time: 'Yesterday 3:20 PM', sent: false },
      { id: 2, sender: 'You', text: 'Great work Mike! I\'ll review it today and let you know if any changes are needed.', time: 'Yesterday 3:25 PM', sent: true },
      { id: 3, sender: 'Mike Writer', text: 'Thanks! I\'ve also prepared some social media posts to go along with it.', time: 'Yesterday 3:30 PM', sent: false }
    ]
  },
  3: {
    name: 'Team Group',
    avatar: 'TM',
    color: 'bg-green-500',
    status: 'Group',
    messages: [
      { id: 1, sender: 'John Admin', text: 'Weekly team meeting scheduled for Friday at 2 PM. Please confirm your attendance.', time: '3 days ago', sent: true },
      { id: 2, sender: 'Sarah Editor', text: "I'll be there! Should I prepare the content update report?", time: '3 days ago', sent: false },
      { id: 3, sender: 'Mike Writer', text: 'Confirmed. I\'ll bring the latest blog analytics.', time: '3 days ago', sent: false }
    ]
  }
};

const initialNewsArticles: Record<number, NewsArticle> = {
  1: {
    id: 1,
    title: 'TGDC Announces Major Breakthrough in Kisaki Geothermal Project',
    content: `
      <div class="mb-8">
        <div class="flex items-center gap-4 mb-6">
          <div class="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center text-white text-lg font-bold">MW</div>
          <div>
            <div class="font-semibold text-gray-900">Mike Writer</div>
            <div class="text-sm text-gray-500">Published on December 15, 2024 • 5 min read</div>
          </div>
        </div>
        <h1 class="text-4xl font-bold text-gray-900 mb-6">TGDC Announces Major Breakthrough in Kisaki Geothermal Project</h1>
        <div class="prose max-w-none">
          <p class="text-lg text-gray-700 mb-6">Tanzania Geothermal Development Company has achieved a significant milestone in the Kisaki geothermal exploration project, with successful completion of the first phase drilling operations that have exceeded initial expectations.</p>
          <p class="text-gray-700 mb-4">The drilling operations, conducted over the past six months, have revealed promising geothermal resources at depths of 1,500 to 2,000 meters. Initial temperature readings indicate potential for significant energy generation capacity, positioning the Kisaki site as one of Tanzania's most promising geothermal prospects.</p>
          <h2 class="text-2xl font-bold text-gray-900 mt-8 mb-4">Key Achievements</h2>
          <ul class="list-disc list-inside text-gray-700 space-y-2 mb-6">
            <li>Successful completion of three exploration wells</li>
            <li>Temperature readings exceeding 200°C at target depths</li>
            <li>Confirmation of substantial geothermal reservoir</li>
            <li>Zero environmental incidents during drilling operations</li>
            <li>Strong community support and engagement throughout the process</li>
          </ul>
          <p class="text-gray-700 mb-4">"This breakthrough represents years of careful planning, scientific research, and community collaboration," said Dr. Amina Hassan, TGDC's Chief Technical Officer. "The results from Kisaki demonstrate Tanzania's immense potential for clean, renewable geothermal energy."</p>
          <h2 class="text-2xl font-bold text-gray-900 mt-8 mb-4">Next Steps</h2>
          <p class="text-gray-700 mb-4">Following these encouraging results, TGDC will proceed with the second phase of development, which includes:</p>
          <ul class="list-disc list-inside text-gray-700 space-y-2 mb-6">
            <li>Detailed reservoir assessment and modeling</li>
            <li>Environmental impact studies</li>
            <li>Community benefit-sharing program development</li>
            <li>Infrastructure planning and design</li>
            <li>Partnership discussions with international investors</li>
          </ul>
          <p class="text-gray-700 mb-4">The project is expected to generate up to 50 MW of clean electricity, enough to power approximately 40,000 homes while creating hundreds of local jobs and supporting community development initiatives.</p>
          <p class="text-gray-700">TGDC remains committed to sustainable development practices and will continue working closely with local communities to ensure the project benefits all stakeholders while protecting Tanzania's natural environment.</p>
        </div>
      </div>
    `,
    author: 'Mike Writer',
    date: 'Dec 15, 2024',
    status: 'published',
    views: 234
  },
  // Add other news articles similarly...
  2: {
    id: 2,
    title: 'Sustainable Energy Partnership with Local Communities',
    content: `
      <div class="mb-8">
        <div class="flex items-center gap-4 mb-6">
          <div class="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center text-white text-lg font-bold">SE</div>
          <div>
            <div class="font-semibold text-gray-900">Sarah Editor</div>
            <div class="text-sm text-gray-500">Published on December 12, 2024 • 3 min read</div>
          </div>
        </div>
        <h1 class="text-4xl font-bold text-gray-900 mb-6">Sustainable Energy Partnership with Local Communities</h1>
        <div class="prose max-w-none">
          <p class="text-lg text-gray-700 mb-6">TGDC strengthens commitment to community engagement through new partnership programs that ensure local communities benefit from geothermal development projects across Tanzania.</p>
          <p class="text-gray-700 mb-4">The comprehensive community partnership initiative, launched this month, establishes formal frameworks for local participation in geothermal development projects. These partnerships ensure that communities are not just stakeholders, but active participants in Tanzania's renewable energy future.</p>
          <h2 class="text-2xl font-bold text-gray-900 mt-8 mb-4">Partnership Framework</h2>
          <p class="text-gray-700 mb-4">The new framework includes several key components designed to maximize community benefits:</p>
          <ul class="list-disc list-inside text-gray-700 space-y-2 mb-6">
            <li>Local employment opportunities in all project phases</li>
            <li>Skills development and training programs</li>
            <li>Revenue sharing agreements</li>
            <li>Infrastructure development support</li>
            <li>Environmental stewardship programs</li>
          </ul>
          <p class="text-gray-700 mb-4">"Our success depends on the success of the communities where we work," explained Maria Kileo, TGDC's Community Relations Director. "These partnerships ensure that geothermal development creates lasting positive impact for local residents."</p>
          <h2 class="text-2xl font-bold text-gray-900 mt-8 mb-4">Community Benefits</h2>
          <p class="text-gray-700 mb-4">Early results from pilot programs show significant positive impacts:</p>
          <ul class="list-disc list-inside text-gray-700 space-y-2 mb-6">
            <li>200+ local jobs created across active project sites</li>
            <li>15 community infrastructure projects completed</li>
            <li>500+ residents trained in renewable energy technologies</li>
            <li>$2.5M invested in local development initiatives</li>
          </ul>
          <p class="text-gray-700">These partnerships represent TGDC's commitment to responsible development that respects local cultures, protects environments, and creates shared prosperity through clean energy development.</p>
        </div>
      </div>
    `,
    author: 'Sarah Editor',
    date: 'Dec 12, 2024',
    status: 'published',
    views: 189
  },
  3: {
    id: 3,
    title: 'Q4 2024 Progress Report: Geothermal Development Milestones',
    content: `
      <div class="mb-8">
        <div class="flex items-center gap-4 mb-6">
          <div class="w-16 h-16 rounded-full bg-purple-500 flex items-center justify-center text-white text-lg font-bold">JA</div>
          <div>
            <div class="font-semibold text-gray-900">John Admin</div>
            <div class="text-sm text-gray-500">Draft • Last updated December 10, 2024</div>
          </div>
        </div>
        <h1 class="text-4xl font-bold text-gray-900 mb-6">Q4 2024 Progress Report: Geothermal Development Milestones</h1>
        <div class="prose max-w-none">
          <p class="text-lg text-gray-700 mb-6">Comprehensive overview of TGDC's achievements in the fourth quarter, including exploration progress, environmental assessments, and community development initiatives across all active project sites.</p>
          <p class="text-gray-700 mb-4">The fourth quarter of 2024 has been marked by significant progress across TGDC's portfolio of geothermal development projects. This report highlights key achievements, challenges overcome, and strategic initiatives that position Tanzania as a leader in renewable energy development.</p>
          <h2 class="text-2xl font-bold text-gray-900 mt-8 mb-4">Exploration Activities</h2>
          <p class="text-gray-700 mb-4">Q4 saw intensive exploration activities across multiple sites:</p>
          <ul class="list-disc list-inside text-gray-700 space-y-2 mb-6">
            <li>Kisaki Project: Completed Phase 1 drilling with exceptional results</li>
            <li>Mbeya Prospect: Initiated geological surveys and community consultations</li>
            <li>Arusha Site: Completed environmental baseline studies</li>
            <li>Coastal Assessment: Preliminary feasibility studies underway</li>
          </ul>
          <h2 class="text-2xl font-bold text-gray-900 mt-8 mb-4">Technical Achievements</h2>
          <p class="text-gray-700 mb-4">Our technical teams have achieved several important milestones:</p>
          <ul class="list-disc list-inside text-gray-700 space-y-2 mb-6">
            <li>Advanced reservoir modeling capabilities implemented</li>
            <li>New drilling techniques reducing environmental impact</li>
            <li>Enhanced monitoring systems for real-time data collection</li>
            <li>Improved safety protocols exceeding international standards</li>
          </ul>
          <p class="text-gray-700 mb-4">These technical advances position TGDC at the forefront of geothermal development in East Africa, with capabilities that match or exceed international best practices.</p>
          <h2 class="text-2xl font-bold text-gray-900 mt-8 mb-4">Looking Ahead</h2>
          <p class="text-gray-700">As we enter 2025, TGDC is well-positioned to accelerate geothermal development across Tanzania, with strong community partnerships, proven technical capabilities, and growing investor confidence in our projects.</p>
        </div>
      </div>
    `,
    author: 'John Admin',
    date: 'Dec 10, 2024',
    status: 'draft',
    views: 156
  }
};

// Chart data
const chartData: ChartData<'line'> = {
  labels: ['Dec 1', 'Dec 5', 'Dec 10', 'Dec 15', 'Dec 20', 'Dec 25', 'Dec 30'],
  datasets: [
    {
      label: 'Visitors',
      data: [245, 312, 289, 456, 398, 523, 467],
      borderColor: '#326101',
      backgroundColor: 'rgba(50, 97, 1, 0.1)',
      tension: 0.4,
      fill: true
    },
    {
      label: 'Page Views',
      data: [567, 723, 645, 892, 756, 1034, 923],
      borderColor: '#639427',
      backgroundColor: 'rgba(99, 148, 39, 0.1)',
      tension: 0.4,
      fill: true
    }
  ]
};

const chartOptions: ChartOptions<'line'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'bottom' }
  },
  scales: {
    y: { beginAtZero: true }
  }
};

// 1. Define the allowed tab keys
type TabKey =
  | "dashboard"
  | "content"
  | "media"
  | "users"
  | "analytics"
  | "news"
  | "messages"


// 2. Type for a tab object
interface Tab {
  key: TabKey;
  label: string;
}

// 3. Define your tabs array
const tabs: Tab[] = [
  { key: "dashboard", label: "Dashboard" },
  { key: "content", label: "Content" },
  { key: "media", label: "Media" },
  { key: "users", label: "Users" },
  { key: "analytics", label: "Analytics" },
  { key: "news", label: "News" },
  { key: "messages", label: "Messages" },

];

// 4. switchTab only accepts valid keys
function switchTab(tab: TabKey) {
  console.log("Switched to:", tab);
}

export default function Home() {
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'content' | 'media' | 'users' | 'analytics' | 'news' | 'messages' >('dashboard');
  const [conversations, setConversations] = useState<Record<number, Conversation>>({});
  const [currentConversation, setCurrentConversation] = useState<number>(0);
  const [messageText, setMessageText] = useState('');
  const [meId, setMeId] = useState<number | null>(null);
  const [newsArticles] = useState<Record<number, NewsArticle>>(initialNewsArticles);
  const [currentNewsView, setCurrentNewsView] = useState<'list' | 'single' | 'editor'>('list');
  const [currentNewsId, setCurrentNewsId] = useState<number | null>(null);
  const [newsTitle, setNewsTitle] = useState('');
  const [newsContent, setNewsContent] = useState('');
  const [newsStatus, setNewsStatus] = useState<'draft' | 'published' | 'scheduled'>('draft');
  const [newsAuthor, setNewsAuthor] = useState<'mike' | 'sarah' | 'john'>('mike');
  // New fields for API-backed news
  const [newsDate, setNewsDate] = useState(''); // yyyy-mm-dd
  const [newsCategory, setNewsCategory] = useState('');
  const [newsCover, setNewsCover] = useState(''); // cover image URL
  const [newsImages, setNewsImages] = useState(''); // newline or comma separated URLs
  const [newsVideos, setNewsVideos] = useState(''); // newline or comma separated URLs
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const [recipients, setRecipients] = useState<Array<{ id: number; name: string; email: string }>>([]);
  const [newMsgTo, setNewMsgTo] = useState<number | ''>('');
  const [newMsgBody, setNewMsgBody] = useState('');
  const [editorContent, setEditorContent] = useState(`
    <h1 class="text-3xl font-bold text-gray-900 mb-6">Tanzania Geothermal Development Company</h1>
    <p class="text-lg text-gray-700 mb-4">
      Leading Tanzania's renewable energy future through sustainable geothermal exploration and development across the East African Rift Valley.
    </p>
    <p class="text-gray-700 mb-6">
      TGDC is committed to harnessing Tanzania's abundant geothermal resources to provide clean, reliable, and affordable energy for our nation's development. Our comprehensive approach includes geological surveys, environmental assessments, and community engagement to ensure sustainable development practices.
    </p>
    <h2 class="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
    <p class="text-gray-700 mb-4">
      To develop Tanzania's geothermal resources in an environmentally responsible manner, contributing to energy security and economic growth while respecting local communities and ecosystems.
    </p>
    <ul class="list-disc list-inside text-gray-700 space-y-2">
      <li>Conduct comprehensive geological and geophysical surveys</li>
      <li>Implement environmentally sustainable exploration practices</li>
      <li>Engage with local communities throughout the development process</li>
      <li>Build strategic partnerships for technology transfer and capacity building</li>
    </ul>
  `);
  const chatMessagesRef = useRef<HTMLDivElement>(null);

  const getInitials = (s: string) => s.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const pickColor = (id: number) => {
    const palette = ['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-amber-500', 'bg-rose-500', 'bg-cyan-500'];
    return palette[id % palette.length];
  };

  useEffect(() => {
    if (currentTab !== 'messages') return;
    (async () => {
      const meRes = await fetch('/api/auth/me');
      const meJson = await meRes.json();
      setMeId(meJson.user?.id ?? null);
      const res = await fetch('/api/messages/users');
      const data = await res.json();
      const built: Record<number, Conversation> = {};
      (data.users || []).forEach((u: any) => {
        const name = u.name || u.email;
        built[u.id] = { name, avatar: getInitials(name), color: pickColor(u.id), status: 'Offline', messages: [] };
      });
      setConversations(built);
    })();
  }, [currentTab]);

  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  }, [currentConversation, conversations]);

  const switchTab = (tabName: typeof currentTab) => {
    setCurrentTab(tabName);
  };

  const loadConversation = async (conversationId: number) => {
    setCurrentConversation(conversationId);
    try {
      const res = await fetch(`/api/messages/with?userId=${conversationId}`);
      const data = await res.json();
      const conv = conversations[conversationId];
      const mine = meId;
      const msgs: Message[] = (data.messages || []).map((m: any) => ({
        id: m.id,
        sender: m.senderId === mine ? 'You' : conv?.name || 'User',
        text: m.content,
        time: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sent: m.senderId === mine,
      }));
      setConversations(prev => ({ ...prev, [conversationId]: { ...(prev[conversationId] || conv), messages: msgs } }));
    } catch { }
  };

  const sendMessage = async () => {
    const text = messageText.trim();
    if (!text || !currentConversation) return;
    try {
      const res = await fetch('/api/messages/send', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ toUserId: currentConversation, content: text }) });
      if (!res.ok) throw new Error('send failed');
      const now = new Date();
      const msg: Message = { id: Date.now(), sender: 'You', text, time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), sent: true };
      setConversations(prev => ({ ...prev, [currentConversation]: { ...prev[currentConversation], messages: [...(prev[currentConversation]?.messages || []), msg] } }));
      setMessageText('');
      if (chatMessagesRef.current) chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    } catch { }
  };
  type AuthorKeys = 'Mike Writer' | 'Sarah Editor' | 'John Admin';
  const showNewsView = (view: typeof currentNewsView, newsId?: number) => {
    setCurrentNewsView(view);
    setCurrentNewsId(newsId || null);
    if (view === 'editor' && newsId) {
      const article = newsArticles[newsId];
      if (article) {
        setNewsTitle(article.title);
        setNewsContent(article.content.replace(/<[^>]*>/g, ''));
        setNewsStatus(article.status as typeof newsStatus);
        const authorMap: Record<
          'Mike Writer' | 'Sarah Editor' | 'John Admin',
          'mike' | 'sarah' | 'john'
        > = {
          'Mike Writer': 'mike',
          'Sarah Editor': 'sarah',
          'John Admin': 'john',
        };
        const authorValue =
          authorMap[article.author as keyof typeof authorMap] ?? 'mike';

        setNewsAuthor(authorValue);
      }
    } else if (view === 'list') {
      setNewsTitle('');
      setNewsContent('');
    }
  };

  const loadSingleNews = (newsId: number) => {
    // Handled in conditional render
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      alert(`${files.length} file(s) selected for upload. In a real system, these would be uploaded to your media library.`);
      setShowUploadModal(false);
    }
  };

  const handlePreviewSite = () => {
    alert('Opening site preview in new window... (This would open your live website)');
  };

  const handleNewPage = () => {
    alert('Opening page creation wizard... (This would open a form to create a new page)');
  };

  const handleSaveNews = async () => {
    try {
      const images = newsImages
        .split(/\n|,/)
        .map((s) => s.trim())
        .filter(Boolean);
      const videos = newsVideos
        .split(/\n|,/)
        .map((s) => s.trim())
        .filter(Boolean);
      const res = await fetch('/api/news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newsTitle,
          category: newsCategory || 'News',
          date: newsDate || undefined,
          content: newsContent,
          coverImage: newsCover || undefined,
          images,
          videos,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save');
      alert('Article saved successfully!');
      setCurrentNewsView('list');
    } catch (e: any) {
      alert(e.message || 'Failed to save');
    }
  };

  const handlePublishNews = async () => {
    await handleSaveNews();
  };

  const handlePreviewNews = () => {
    alert('Opening article preview...');
  };

  const handleDeleteNews = () => {
    if (confirm('Are you sure you want to delete this article?')) {
      alert('Article deleted successfully!');
      showNewsView('list');
    }
  };

  const handleCreateNews = () => {
    showNewsView('editor');
  };

  const handleNewMessage = async () => {
    if (!newMsgTo || !newMsgBody.trim()) return;
    try {
      const res = await fetch('/api/messages/send', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ toUserId: newMsgTo, content: newMsgBody }) });
      if (!res.ok) throw new Error('send failed');
      // Ensure conversation exists
      if (!conversations[newMsgTo]) {
        const rec = recipients.find(r => r.id === newMsgTo);
        if (rec) {
          setConversations(prev => ({ ...prev, [rec.id]: { name: rec.name, avatar: getInitials(rec.name || rec.email), color: 'bg-blue-500', status: 'Offline', messages: [] } }));
        }
      }
      setShowNewMessageModal(false);
      setNewMsgBody('');
      setNewMsgTo('');
      // Load thread and focus it
      await loadConversation(Number(res && newMsgTo));
    } catch { }
  };





  const handleSaveChanges = () => {
    // No functionality in original
  };

  const handleAddUser = () => {
    // No functionality in original
  };

  const handleExportReport = () => {
    // No functionality in original
  };

  const tabButtons = [
    { key: 'dashboard', label: 'Dashboard' },

    { key: 'content', label: 'Content Editor' },
    { key: 'media', label: 'Media Library' },

    { key: 'users', label: 'Users' },
    { key: 'analytics', label: 'Analytics' },
    { key: 'news', label: 'News' },
    { key: 'messages', label: 'Messages' },

  ];

  return (
    <main className="bg-gradient-to-br from-blue-50 via-white to-green-50 text-gray-800 min-h-screen">
      {/* Hero */}
      <section className="hero-bg text-white py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <span className="inline-flex items-center gap-2 text-sm bg-white/15 px-3 py-1.5 rounded-full">
                <span className="w-2 h-2 rounded-full bg-emerald-300"></span>
                Content Management System
              </span>
              <h1 className="text-3xl md:text-4xl font-extrabold mt-4 leading-tight">
                Web Content Management
              </h1>
              <p className="text-white/90 text-lg mt-3 max-w-2xl">
                Manage all website content, pages, media, and settings from one comprehensive dashboard.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={handlePreviewSite} className="bg-white/10 text-white px-4 py-2 rounded-xl font-semibold hover:bg-white/20 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Preview Site
              </button>
              <button onClick={handleNewPage} className="bg-white text-[#326101] px-4 py-2 rounded-xl font-semibold hover:bg-gray-50 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                New Page
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation Tabs */}
      <section className="py-6">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3">
            <div className="flex flex-wrap gap-2">
              {tabButtons.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => switchTab(tab.key as TabKey)}
                  className={`tab-btn px-4 py-2 rounded-lg text-sm font-semibold text-gray-700 hover:bg-green-50 ${currentTab === tab.key ? 'active' : ''}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard Section */}
      <section className={`pb-16 ${currentTab === 'dashboard' ? '' : 'hidden'}`} id="dashboardSection">
        <div className="max-w-7xl mx-auto px-6">
          {/* Quick Stats */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="card bg-white rounded-2xl border border-gray-100 shadow-sm p-6 fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">24</div>
                  <div className="text-sm text-gray-600">Total Pages</div>
                </div>
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
            </div>
            {/* Add other stat cards similarly */}
            <div className="card bg-white rounded-2xl border border-gray-100 shadow-sm p-6 fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">156</div>
                  <div className="text-sm text-gray-600">Media Files</div>
                </div>
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="card bg-white rounded-2xl border border-gray-100 shadow-sm p-6 fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">8.4K</div>
                  <div className="text-sm text-gray-600">Monthly Visitors</div>
                </div>
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="card bg-white rounded-2xl border border-gray-100 shadow-sm p-6 fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">5</div>
                  <div className="text-sm text-gray-600">Pending Updates</div>
                </div>
                <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
          {/* Recent Activity & Quick Actions */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Recent Pages */}
            <div className="lg:col-span-2 card bg-white rounded-2xl border border-gray-100 shadow-sm p-6 fade-in">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Recent Pages</h3>
                  <p className="text-sm text-gray-600">Latest content updates</p>
                </div>
                <button className="text-sm text-[#326101] hover:underline">View All</button>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 rounded-lg border border-gray-100 hover:bg-gray-50">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2v0" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-semibold text-gray-900">Homepage</div>
                        <div className="text-sm text-gray-600 mt-1">Updated hero section and project highlights</div>
                        <div className="text-xs text-gray-500 mt-2">Modified 2 hours ago by John Admin</div>
                      </div>
                      <span className="status-published px-2 py-1 rounded-full text-xs font-medium">Published</span>
                    </div>
                  </div>
                </div>
                {/* Add other recent pages similarly */}
              </div>
            </div>
            {/* Quick Actions & Site Health */}
            <div className="space-y-6">
              <div className="card bg-white rounded-2xl border border-gray-100 shadow-sm p-6 fade-in">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button className="w-full flex items-center gap-3 p-3 rounded-lg bg-[#326101] text-white hover:bg-[#639427]">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span className="font-medium">Create New Page</span>
                  </button>
                  <button className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50" onClick={() => setShowUploadModal(true)}>
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    <span className="font-medium text-gray-700">Upload Media</span>
                  </button>
                  <button className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="font-medium text-gray-700">Site Settings</span>
                  </button>
                </div>
              </div>
              <div className="card bg-gradient-to-br from-[#326101] to-[#639427] rounded-2xl shadow-sm p-6 text-white fade-in">
                <h3 className="text-lg font-bold mb-4">Site Health</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Performance Score</span>
                    <span className="text-xl font-bold">94/100</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">SEO Score</span>
                    <span className="text-xl font-bold">87/100</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Security Status</span>
                    <span className="text-sm font-bold">✓ Secure</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Last Backup</span>
                    <span className="text-sm font-bold">2 hours ago</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

     

      {/* Continue with other sections in similar fashion... */}

      {/* Content Editor Section */}
      <section className={`pb-16 ${currentTab === 'content' ? '' : 'hidden'}`} id="contentSection">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Content Editor</h2>
              <p className="text-gray-600">Edit page content with visual editor</p>
            </div>
            <div className="flex items-center gap-3">
              <select className="text-sm border border-gray-200 rounded-lg px-3 py-2">
                <option>Homepage</option>
                <option>About Us</option>
                <option>Projects</option>
                <option>Contact</option>
              </select>
              <button className="px-4 py-2 text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50" onClick={handleSaveChanges}>
                Preview
              </button>
              <button className="px-4 py-2 bg-[#326101] text-white rounded-lg hover:bg-[#639427]" onClick={handleSaveChanges}>
                Save Changes
              </button>
            </div>
          </div>
          <div className="card bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Editor Toolbar */}
            <div className="editor-toolbar p-4 bg-gray-50">
              <div className="flex items-center gap-2 flex-wrap">
                <button className="p-2 rounded hover:bg-gray-200" title="Bold">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 12h9a4 4 0 014 4 4 4 0 01-4 4H6z" />
                  </svg>
                </button>
                {/* Add other toolbar buttons similarly */}
              </div>
            </div>
            {/* Editor Content */}
            <div
              className="editor-content p-6"
              contentEditable
              suppressContentEditableWarning
              dangerouslySetInnerHTML={{ __html: editorContent }}
              onInput={(e) => setEditorContent(e.currentTarget.innerHTML)}
            />
          </div>
        </div>
      </section>

      {/* Media Library Section */}
      <section className={`pb-16 ${currentTab === 'media' ? '' : 'hidden'}`} id="mediaSection">
        {/* Similar structure, with media-grid class */}
        <div className="max-w-7xl mx-auto px-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Media Library</h2>
              <p className="text-gray-600">Manage images, documents, and other media files</p>
            </div>
            <div className="flex items-center gap-3">
              <input type="text" placeholder="Search media..." className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#326101] focus:border-transparent" />
              <select className="text-sm border border-gray-200 rounded-lg px-3 py-2">
                <option>All Files</option>
                <option>Images</option>
                <option>Documents</option>
                <option>Videos</option>
              </select>
              <button onClick={() => setShowUploadModal(true)} className="bg-[#326101] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#639427]">Upload Files</button>
            </div>
          </div>
          <div className="card bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="media-grid">
              {/* Media items with media-item class */}
              <div className="media-item bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white">
                <div className="text-center">
                  <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <div className="text-xs">hero-image.jpg</div>
                </div>
              </div>
              {/* Add other media items */}
            </div>
          </div>
        </div>
      </section>

    

      {/* News Section */}
      <section className={`pb-16 ${currentTab === 'news' ? '' : 'hidden'}`} id="newsSection">
        <div className="max-w-7xl mx-auto px-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            {/* ... */}
            <div className="flex items-center gap-3">
              <Link href="/admin/news" className="px-4 py-2 rounded-lg text-sm font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50">Open News Manager</Link>
              <button onClick={handleCreateNews} className="bg-[#326101] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#639427] flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Create Article
              </button>
            </div>
          </div>
          {/* News List View */}
          {currentNewsView === 'list' && (
            <div className="card bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="space-y-4">
                {Object.values(newsArticles).map((article) => (
                  <div key={article.id} className="news-item flex items-start gap-4 p-4 rounded-lg border border-gray-100 hover:bg-gray-50 cursor-pointer" onClick={() => showNewsView('single', article.id)}>
                    {/* Article content */}
                    <span className={`status-${article.status} px-2 py-1 rounded-full text-xs font-medium`}> {article.status.charAt(0).toUpperCase() + article.status.slice(1)} </span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* Single News View */}
          {currentNewsView === 'single' && currentNewsId && (
            <div>
              <div className="flex items-center gap-4 mb-6">
                <button onClick={() => showNewsView('list')} className="flex items-center gap-2 text-[#326101] hover:underline">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back to News List
                </button>
                <div className="flex items-center gap-3">
                  <button onClick={() => showNewsView('editor', currentNewsId)} className="bg-[#326101] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#639427]">Edit Article</button>
                  <button onClick={handlePreviewNews} className="border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-50">Preview</button>
                  <button onClick={handleDeleteNews} className="border border-red-200 text-red-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-50">Delete</button>
                </div>
              </div>
              <div className="card bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-8 prose max-w-none" dangerouslySetInnerHTML={{ __html: newsArticles[currentNewsId].content }} />
              </div>
              {/* Comments */}
              {/* ... */}
            </div>
          )}
          {/* News Editor */}
          {currentNewsView === 'editor' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <button onClick={() => showNewsView('list')} className="flex items-center gap-2 text-[#326101] hover:underline">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to News
                  </button>
                  <h2 className="text-2xl font-bold text-gray-900">Edit News Article</h2>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={handleSaveNews} className="bg-[#326101] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#639427]">Save Changes</button>
                  <button onClick={handlePublishNews} className="border border-[#326101] text-[#326101] px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-50">Publish</button>
                </div>
              </div>
              <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <div className="card bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Article Title</label>
                        <input type="text" value={newsTitle} onChange={(e) => setNewsTitle(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#326101] focus:border-transparent text-lg font-semibold bg-white text-gray-900" placeholder="Enter article title..." />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Cover Image URL</label>
                        <input type="url" value={newsCover} onChange={(e) => setNewsCover(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#326101] focus:border-transparent bg-white text-gray-900" placeholder="https://example.com/image.jpg" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Article Content</label>
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                          <div className="editor-toolbar p-3 bg-gray-50 border-b">
                            {/* Toolbar buttons */}
                          </div>
                          <div className="p-4">
                            <textarea
                              value={newsContent}
                              onChange={(e) => setNewsContent(e.target.value)}
                              rows={15}
                              className="w-full border-none resize-none focus:outline-none bg-white text-gray-900"
                              placeholder="Write your article content here..."
                            />
                          </div>
                        </div>
                      </div>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Images (links, one per line or comma separated)</label>
                          <textarea value={newsImages} onChange={(e) => setNewsImages(e.target.value)} rows={6} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#326101] focus:border-transparent bg-white text-gray-900" placeholder="https://.../image1.jpg
https://.../image2.jpg" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Videos (links, one per line or comma separated)</label>
                          <textarea value={newsVideos} onChange={(e) => setNewsVideos(e.target.value)} rows={6} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#326101] focus:border-transparent bg-white text-gray-900" placeholder="https://youtube.com/... or https://cdn.example.com/video.mp4" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="card bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Article Settings</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                        <select value={newsStatus} onChange={(e) => setNewsStatus(e.target.value as typeof newsStatus)} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#326101] focus:border-transparent">
                          <option value="draft">Draft</option>
                          <option value="published">Published</option>
                          <option value="scheduled">Scheduled</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                        <input type="date" value={newsDate} onChange={(e) => setNewsDate(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#326101] focus:border-transparent bg-white text-gray-900" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                        <input value={newsCategory} onChange={(e) => setNewsCategory(e.target.value)} placeholder="e.g., Project Update" className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#326101] focus:border-transparent bg-white text-gray-900" />
                      </div>
                    </div>
                  </div>
                  {/* Featured Image */}
                  {/* ... */}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Messages Section */}
      <section className={`pb-16 ${currentTab === 'messages' ? '' : 'hidden'}`} id="messagesSection">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Team Messages</h2>
              <p className="text-gray-600">Communicate with team members and manage conversations</p>
            </div>
            <button onClick={() => setShowNewMessageModal(true)} className="bg-[#326101] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#639427] flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              New Message
            </button>
          </div>
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Conversations List */}
            <div className="card bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Conversations</h3>
                <div className="flex items-center gap-2">
                  <button className="p-1 text-gray-400 hover:text-gray-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="space-y-3">
                {Object.entries(conversations).map(([id, conv]) => (
                  <div key={id} className={`conversation-item p-3 rounded-lg border border-gray-100 hover:bg-gray-50 cursor-pointer ${parseInt(id) === currentConversation ? 'active' : ''}`} onClick={() => loadConversation(parseInt(id))}>
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-full ${conv.color} flex items-center justify-center text-white text-sm font-semibold flex-shrink-0`}>{conv.avatar}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div className="font-semibold text-gray-900 text-sm">{conv.name}</div>
                          <div className="text-xs text-gray-500">{conv.messages[conv.messages.length - 1]?.time || 'No messages'}</div>
                        </div>
                        <div className="text-sm text-gray-600 truncate mt-1">{conv.messages[conv.messages.length - 1]?.text?.substring(0, 30)}...</div>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`w-2 h-2 ${conv.status === 'Online' ? 'bg-green-500' : 'bg-gray-400'} rounded-full`}></span>
                          <span className="text-xs text-gray-500">{conv.status}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Chat Area */}
            <div className="lg:col-span-2 card bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {currentConversation && conversations[currentConversation] && (
                <>
                  <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full ${conversations[currentConversation].color} flex items-center justify-center text-white text-sm font-semibold`}>{conversations[currentConversation].avatar}</div>
                      <div>
                        <div className="font-semibold text-gray-900">{conversations[currentConversation].name}</div>
                        <div className={`text-sm ${conversations[currentConversation].status === 'Online' ? 'text-green-600' : conversations[currentConversation].status === 'Group' ? 'text-blue-600' : 'text-gray-500'}`}>
                          {conversations[currentConversation].status}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </button>
                      <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div ref={chatMessagesRef} className="h-96 overflow-y-auto p-4 space-y-4">
                    {conversations[currentConversation].messages.map((message) => (
                      <div key={message.id} className={`flex ${message.sent ? 'justify-end' : 'justify-start'}`}>
                        <div className={`message-${message.sent ? 'sent' : 'received'} px-4 py-2 rounded-lg`}>
                          <div className="text-sm">{message.text}</div>
                          <div className={`text-xs mt-1 ${message.sent ? 'text-green-100' : 'text-gray-500'}`}>{message.time}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-4 border-t">
                    <div className="flex items-end gap-3">
                      <div className="flex-1">
                        <textarea
                          rows={2}
                          placeholder="Type your message..."
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-[#326101] focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
                          value={messageText}
                          onChange={(e) => setMessageText(e.target.value)}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                          </svg>
                        </button>
                        <button onClick={sendMessage} className="bg-[#326101] text-white px-4 py-2 rounded-lg hover:bg-[#639427] flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                          </svg>
                          Send
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Upload Media Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
          <div className="modal-backdrop absolute inset-0" onClick={() => setShowUploadModal(false)}></div>
          <div className="relative bg-white max-w-lg w-full rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
            <div className="flex items-start justify-between p-6 border-b">
              <div>
                <h4 className="text-xl font-bold text-gray-900">Upload Media Files</h4>
                <p className="text-sm text-gray-500 mt-1">Add images, documents, and other media</p>
              </div>
              <button onClick={() => setShowUploadModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
            </div>
            <div className="p-6">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="text-gray-600 mb-2">Drag and drop files here, or click to browse</p>
                <p className="text-sm text-gray-500">Supports: JPG, PNG, GIF, PDF, DOC, MP4 (Max 10MB)</p>
                <input type="file" multiple className="hidden" id="fileInput" onChange={handleFileChange} />
                <button onClick={() => document.getElementById('fileInput')?.click()} className="mt-4 bg-[#326101] text-white px-4 py-2 rounded-lg hover:bg-[#639427]">Choose Files</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
