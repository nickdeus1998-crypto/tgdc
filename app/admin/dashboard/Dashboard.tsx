// app/page.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { sanitizeHtml } from '@/app/lib/sanitize';
import type { ChartData, ChartOptions } from 'chart.js';
import { Line } from 'react-chartjs-2';

// Dynamic import for the chart to avoid SSR issues
// const Line = dynamic(() => import('react-chartjs').then((mod) => mod.Line), { ssr: false });

// Types
interface MessageAttachment {
  name: string;
  url: string;
  mimeType: string;
  sizeBytes: number;
}

interface Message {
  id: number;
  sender: string;
  text: string;
  time: string;
  sent: boolean;
  attachments: MessageAttachment[];
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
      { id: 1, sender: 'Sarah Editor', text: "Hi! I've updated the homepage content as requested. Could you please review it?", time: '10:30 AM', sent: false, attachments: [] },
      { id: 2, sender: 'You', text: "Thanks Sarah! I'll take a look and get back to you shortly.", time: '10:35 AM', sent: true, attachments: [] },
      { id: 3, sender: 'Sarah Editor', text: 'Perfect! I also added some new images to the hero section. Let me know if you need any adjustments.', time: '10:45 AM', sent: false, attachments: [] },
      { id: 4, sender: 'You', text: 'The images look great! Can you also update the project timeline section?', time: '11:00 AM', sent: true, attachments: [] }
    ]
  },
  2: {
    name: 'Mike Writer',
    avatar: 'MW',
    color: 'bg-purple-500',
    status: 'Offline',
    messages: [
      { id: 1, sender: 'Mike Writer', text: "I've finished the blog post about the Kisaki project. It's ready for your approval.", time: 'Yesterday 3:20 PM', sent: false, attachments: [] },
      { id: 2, sender: 'You', text: 'Great work Mike! I\'ll review it today and let you know if any changes are needed.', time: 'Yesterday 3:25 PM', sent: true, attachments: [] },
      { id: 3, sender: 'Mike Writer', text: 'Thanks! I\'ve also prepared some social media posts to go along with it.', time: 'Yesterday 3:30 PM', sent: false, attachments: [] }
    ]
  },
  3: {
    name: 'Team Group',
    avatar: 'TM',
    color: 'bg-green-500',
    status: 'Group',
    messages: [
      { id: 1, sender: 'John Admin', text: 'Weekly team meeting scheduled for Friday at 2 PM. Please confirm your attendance.', time: '3 days ago', sent: true, attachments: [] },
      { id: 2, sender: 'Sarah Editor', text: "I'll be there! Should I prepare the content update report?", time: '3 days ago', sent: false, attachments: [] },
      { id: 3, sender: 'Mike Writer', text: 'Confirmed. I\'ll bring the latest blog analytics.', time: '3 days ago', sent: false, attachments: [] }
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
  { key: "messages", label: "Messages" },
];


type DashboardProps = {
  allowedTabs?: TabKey[];
  defaultTab?: TabKey;
};

export default function Dashboard({ allowedTabs, defaultTab }: DashboardProps) {
  const filteredTabs = allowedTabs?.length ? tabs.filter(t => allowedTabs.includes(t.key)) : tabs;
  const allowedKeys = filteredTabs.map(t => t.key);
  const initialTab = allowedKeys.includes(defaultTab as TabKey)
    ? (defaultTab as TabKey)
    : (allowedKeys[0] || 'dashboard');

  const [currentTab, setCurrentTab] = useState<TabKey>(initialTab);
  const [conversations, setConversations] = useState<Record<number, Conversation>>({});
  const [unreadCounts, setUnreadCounts] = useState<Record<number, number>>({});
  const [currentConversation, setCurrentConversation] = useState<number>(0);
  const [messageText, setMessageText] = useState('');
  const [messageAttachments, setMessageAttachments] = useState<MessageAttachment[]>([]);
  const [chatAttachmentError, setChatAttachmentError] = useState<string | null>(null);
  const [uploadingChatAttachment, setUploadingChatAttachment] = useState(false);
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
  const composerFileInputRef = useRef<HTMLInputElement | null>(null);

  const getInitials = (s: string) => s.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const pickColor = (id: number) => {
    const palette = ['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-amber-500', 'bg-rose-500', 'bg-cyan-500'];
    return palette[id % palette.length];
  };

  useEffect(() => {
    const desired = allowedKeys.includes(defaultTab as TabKey)
      ? (defaultTab as TabKey)
      : (allowedKeys[0] || 'dashboard');
    if (!allowedKeys.includes(currentTab) || currentTab !== desired) {
      setCurrentTab(desired);
    }
  }, [allowedKeys.join('|'), defaultTab]);

  useEffect(() => {
    if (currentTab !== 'messages') return;
    (async () => {
      const meRes = await fetch('/api/auth/me');
      const meJson = await meRes.json();
      setMeId(meJson.user?.id ?? null);
      const res = await fetch('/api/messages/users');
      const data = await res.json();
      const built: Record<number, Conversation> = {};
      const unread: Record<number, number> = {};
      (data.users || []).forEach((u: any) => {
        const name = u.name || u.email;
        built[u.id] = { name, avatar: getInitials(name), color: pickColor(u.id), status: 'Offline', messages: [] };
        if (u.unreadCount > 0) unread[u.id] = u.unreadCount;
      });
      setConversations(built);
      setUnreadCounts(unread);
    })();
  }, [currentTab]);

  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  }, [currentConversation, conversations]);

  useEffect(() => {
    setMessageAttachments([]);
    setChatAttachmentError(null);
    setMessageText('');
  }, [currentConversation]);

  const switchTab = (tabName: typeof currentTab) => {
    setCurrentTab(tabName);
  };

  const loadConversation = async (conversationId: number) => {
    setCurrentConversation(conversationId);
    // Mark messages as read
    if (unreadCounts[conversationId]) {
      setUnreadCounts(prev => { const next = { ...prev }; delete next[conversationId]; return next; });
      fetch('/api/messages/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fromUserId: conversationId }),
      }).catch(() => { });
    }
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
        attachments: Array.isArray(m.attachments) ? m.attachments : [],
      }));
      setConversations(prev => ({ ...prev, [conversationId]: { ...(prev[conversationId] || conv), messages: msgs } }));
    } catch { }
  };

  const sendMessage = async () => {
    const text = messageText.trim();
    if (!currentConversation || uploadingChatAttachment) return;
    if (!text && messageAttachments.length === 0) return;
    try {
      const res = await fetch('/api/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toUserId: currentConversation, content: text, attachments: messageAttachments }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error || 'send failed');
      const saved = data?.message;
      const createdAt = saved?.createdAt ? new Date(saved.createdAt) : new Date();
      const msg: Message = {
        id: saved?.id ?? Date.now(),
        sender: 'You',
        text: saved?.content ?? text,
        time: createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sent: true,
        attachments: Array.isArray(saved?.attachments) ? saved.attachments : messageAttachments,
      };
      setConversations(prev => ({ ...prev, [currentConversation]: { ...prev[currentConversation], messages: [...(prev[currentConversation]?.messages || []), msg] } }));
      setMessageText('');
      setMessageAttachments([]);
      setChatAttachmentError(null);
      if (chatMessagesRef.current) chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    } catch (e: any) {
      setChatAttachmentError(e?.message || 'Failed to send message.');
    }
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

  const uploadAttachment = async (file: File) => {
    const form = new FormData();
    form.append('file', file);
    const res = await fetch('/api/messages/attachment', { method: 'POST', body: form });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || 'Failed to upload file.');
    return data.attachment as MessageAttachment;
  };

  const handleAttachmentSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploadingChatAttachment(true);
    setChatAttachmentError(null);
    try {
      const uploaded: MessageAttachment[] = [];
      for (const file of Array.from(files)) {
        uploaded.push(await uploadAttachment(file));
      }
      setMessageAttachments(prev => [...prev, ...uploaded]);
    } catch (e: any) {
      setChatAttachmentError(e?.message || 'Failed to upload file.');
    } finally {
      setUploadingChatAttachment(false);
    }
  };

  const removeAttachment = (url: string) => {
    setMessageAttachments(prev => prev.filter(att => att.url !== url));
  };

  const formatBytes = (bytes: number) => {
    if (!bytes) return '0 B';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
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
      if (!conversations[newMsgTo]) {
        const rec = recipients.find(r => r.id === newMsgTo);
        if (rec) {
          setConversations(prev => ({ ...prev, [rec.id]: { name: rec.name, avatar: getInitials(rec.name || rec.email), color: 'bg-blue-500', status: 'Offline', messages: [] } }));
        }
      }
      setShowNewMessageModal(false);
      setNewMsgBody('');
      setNewMsgTo('');
      await loadConversation(Number(newMsgTo));
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

  const tabButtons = filteredTabs;

  return (
    <main className="bg-gradient-to-br from-blue-50 via-white to-green-50 text-gray-800 min-h-screen">

      {/* Navigation Tabs - hidden when only one tab */}
      {tabButtons.length > 1 && (
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
      )}

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
              <select className="text-sm border border-gray-200 rounded-lg px-3 py-2 text-gray-900">
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
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(editorContent) }}
              onInput={(e) => setEditorContent(e.currentTarget.innerHTML)}
            />
          </div>
        </div>
      </section>

      {/* Media Library Section */}
      <section className={`pb-16 ${currentTab === 'media' ? '' : 'hidden'}`} id="mediaSection">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Media Library</h2>
              <p className="text-gray-600">Manage images, documents, and other media files</p>
            </div>
            <div className="flex items-center gap-3">
              <input type="text" placeholder="Search media..." className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-[#326101] focus:border-transparent bg-white" />
              <select className="text-sm border border-gray-200 rounded-lg px-3 py-2 text-gray-900 bg-white">
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
              {[
                { name: 'hero-image.jpg', color: 'from-blue-500 to-blue-600', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /> },
                { name: 'project-kisaki.png', color: 'from-emerald-500 to-emerald-600', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /> },
                { name: 'impact-report.pdf', color: 'from-rose-500 to-rose-600', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /> },
                { name: 'site-map.svg', color: 'from-amber-500 to-amber-600', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A2 2 0 012 15.382V5a2 2 0 012-2h16a2 2 0 012 2v10.382a2 2 0 01-1.553 1.894L15 20l-6 0z" /> },
                { name: 'press-release.doc', color: 'from-indigo-500 to-indigo-600', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /> },
                { name: 'drilling-ops.mp4', color: 'from-purple-500 to-purple-600', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /> },
              ].map((item, idx) => (
                <div key={idx} className={`media-item bg-gradient-to-br ${item.color} p-4 flex flex-col items-center justify-center text-white text-center hover:shadow-lg transition-all`}>
                  <svg className="w-10 h-10 mb-2 opacity-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {item.icon}
                  </svg>
                  <div className="text-xs font-semibold truncate w-full px-2" title={item.name}>{item.name}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Users Section */}
      <section className={`pb-16 ${currentTab === 'users' ? '' : 'hidden'}`} id="usersSection">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Admin Users</h2>
              <p className="text-gray-600">Manage system administrators and their permissions</p>
            </div>
            <button className="bg-[#326101] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#639427] flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              Add New User
            </button>
          </div>
          <div className="card bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {[
                  { name: 'John Admin', email: 'john@tgdc.go.tz', role: 'Super Admin', status: 'Active' },
                  { name: 'Sarah Editor', email: 'sarah@tgdc.go.tz', role: 'Editor', status: 'Active' },
                  { name: 'Mike Writer', email: 'mike@tgdc.go.tz', role: 'Content Writer', status: 'Inactive' },
                ].map((user, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">{getInitials(user.name)}</div>
                        <div>
                          <div className="font-semibold text-gray-900">{user.name}</div>
                          <div className="text-xs text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{user.role}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button className="text-blue-600 hover:underline text-sm font-medium">Edit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Analytics Section */}
      <section className={`pb-16 ${currentTab === 'analytics' ? '' : 'hidden'}`} id="analyticsSection">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Website Analytics</h2>
              <p className="text-gray-600">Track website performance and visitor behavior</p>
            </div>
            <button className="px-4 py-2 text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export Report
            </button>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 mb-8">
            <div className="lg:col-span-2 card bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900">Traffic Overview</h3>
                <div className="flex items-center gap-4 text-xs font-medium">
                  <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#326101]"></span> Visitors</div>
                  <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#639427]"></span> Page Views</div>
                </div>
              </div>
              <div className="h-64 relative">
                <Line data={chartData} options={chartOptions} />
              </div>
            </div>
            <div className="card bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-bold text-gray-900 mb-6">Device Breakdown</h3>
              <div className="space-y-6">
                {[
                  { label: 'Desktop', value: 65, color: 'bg-emerald-500' },
                  { label: 'Mobile', value: 28, color: 'bg-blue-500' },
                  { label: 'Tablet', value: 7, color: 'bg-amber-500' },
                ].map((item, idx) => (
                  <div key={idx}>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-600">{item.label}</span>
                      <span className="font-bold text-gray-900">{item.value}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full ${item.color}`} style={{ width: `${item.value}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="card bg-white rounded-2xl border border-gray-100 shadow-sm p-6 overflow-hidden">
            <h3 className="font-bold text-gray-900 mb-6">Top Performing Pages</h3>
            <div className="space-y-4">
              {[
                { page: '/home', views: '1,245', growth: '+12%', avgTime: '2m 15s' },
                { page: '/projects', views: '856', growth: '+5%', avgTime: '3m 45s' },
                { page: '/about-us', views: '432', growth: '-2%', avgTime: '1m 20s' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span className="font-medium text-gray-900">{item.page}</span>
                  </div>
                  <div className="flex items-center gap-8 text-sm">
                    <div className="text-center">
                      <div className="text-gray-500 text-xs uppercase font-bold">Views</div>
                      <div className="font-bold text-gray-900">{item.views}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-gray-500 text-xs uppercase font-bold">Trend</div>
                      <div className={`font-bold ${item.growth.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>{item.growth}</div>
                    </div>
                  </div>
                </div>
              ))}
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
                <div className="p-8 prose max-w-none" dangerouslySetInnerHTML={{ __html: sanitizeHtml(newsArticles[currentNewsId].content) }} />
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
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden" style={{ height: 'calc(100vh - 220px)', minHeight: '500px' }}>
            <div className="flex h-full">
              {/* Sidebar - Conversations */}
              <div className="w-80 flex-shrink-0 border-r border-gray-100 flex flex-col h-full">
                {/* Sidebar header */}
                <div className="px-5 py-4 border-b border-gray-100">
                  <h3 className="text-base font-semibold text-gray-900">Messages</h3>
                  <div className="relative mt-3">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input type="text" placeholder="Search conversations..." className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm focus:ring-2 focus:ring-[#326101] focus:bg-white transition-all" />
                  </div>
                </div>
                {/* Conversation list */}
                <div className="flex-1 overflow-y-auto">
                  {Object.entries(conversations).map(([id, conv]) => {
                    const lastMessage = conv.messages[conv.messages.length - 1];
                    const previewSource = lastMessage?.text?.trim()
                      || (lastMessage?.attachments?.length ? `📎 ${lastMessage.attachments[0].name}` : '');
                    const preview = previewSource
                      ? previewSource.length > 35 ? `${previewSource.slice(0, 35)}…` : previewSource
                      : 'No messages yet';
                    const isActive = parseInt(id) === currentConversation;
                    return (
                      <div
                        key={id}
                        className={`flex items-center gap-3 px-5 py-3.5 cursor-pointer border-l-2 transition-colors ${isActive
                          ? 'bg-emerald-50/60 border-l-[#326101]'
                          : 'border-l-transparent hover:bg-gray-50'
                          }`}
                        onClick={() => loadConversation(parseInt(id))}
                      >
                        <div className="relative flex-shrink-0">
                          <div className={`w-10 h-10 rounded-full ${conv.color} flex items-center justify-center text-white text-sm font-semibold`}>{conv.avatar}</div>
                          <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${conv.status === 'Online' ? 'bg-green-500' : 'bg-gray-300'}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className={`text-sm ${isActive ? 'font-semibold text-gray-900' : unreadCounts[parseInt(id)] ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>{conv.name}</span>
                            <div className="flex items-center gap-1.5">
                              {unreadCounts[parseInt(id)] > 0 && (
                                <span className="min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-[#326101] text-white text-[10px] font-semibold px-1">
                                  {unreadCounts[parseInt(id)]}
                                </span>
                              )}
                              <span className="text-[10px] text-gray-400">{lastMessage?.time || ''}</span>
                            </div>
                          </div>
                          <p className={`text-xs truncate mt-0.5 ${unreadCounts[parseInt(id)] ? 'text-gray-600 font-medium' : 'text-gray-400'}`}>{preview}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Chat Area */}
              <div className="flex-1 flex flex-col h-full">
                {currentConversation && conversations[currentConversation] ? (
                  <>
                    {/* Chat header */}
                    <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full ${conversations[currentConversation].color} flex items-center justify-center text-white text-sm font-semibold`}>{conversations[currentConversation].avatar}</div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900">{conversations[currentConversation].name}</div>
                          <div className={`text-xs ${conversations[currentConversation].status === 'Online' ? 'text-green-600' : 'text-gray-400'}`}>
                            {conversations[currentConversation].status}
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Messages */}
                    <div ref={chatMessagesRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-3 bg-gray-50/50">
                      {conversations[currentConversation].messages.map((message) => (
                        <div key={message.id} className={`flex ${message.sent ? 'justify-end' : 'justify-start'}`}>
                          <div className={`message-${message.sent ? 'sent' : 'received'} px-4 py-2 rounded-lg`}>
                            {message.text && <div className="text-sm whitespace-pre-wrap">{message.text}</div>}
                            {message.attachments?.length > 0 && (
                              <div className="mt-2 space-y-2">
                                {message.attachments.map((att) => (
                                  <a
                                    key={att.url}
                                    href={att.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`flex items-center gap-2 rounded border px-3 py-2 text-sm hover:opacity-90 ${message.sent ? 'border-white/30 bg-white/10 text-white' : 'border-gray-200 bg-white text-gray-900'
                                      }`}
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                    </svg>
                                    <div>
                                      <p className="font-medium">{att.name}</p>
                                      <p className="text-xs opacity-70">{formatBytes(att.sizeBytes)}</p>
                                    </div>
                                  </a>
                                ))}
                              </div>
                            )}
                            <div className={`text-xs mt-2 ${message.sent ? 'text-green-100' : 'text-gray-500'}`}>{message.time}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                    {/* Composer */}
                    <div className="px-5 py-3 border-t border-gray-100 flex-shrink-0 bg-white">
                      {messageAttachments.length > 0 && (
                        <div className="mb-2 flex flex-wrap gap-2">
                          {messageAttachments.map((att) => (
                            <div key={att.url} className="flex items-center gap-2 rounded-lg bg-gray-50 border border-gray-100 px-2.5 py-1 text-xs text-gray-600">
                              <span className="truncate max-w-[120px]">{att.name}</span>
                              <button type="button" onClick={() => removeAttachment(att.url)} className="text-gray-400 hover:text-red-500">&times;</button>
                            </div>
                          ))}
                        </div>
                      )}
                      {uploadingChatAttachment && <p className="text-xs text-gray-400 mb-2">Uploading attachment…</p>}
                      {chatAttachmentError && <p className="text-xs text-red-500 mb-2">{chatAttachmentError}</p>}
                      <div className="flex items-end gap-2">
                        <input
                          ref={composerFileInputRef}
                          type="file"
                          multiple
                          className="hidden"
                          onChange={(e) => {
                            handleAttachmentSelect(e.target.files);
                            if (composerFileInputRef.current) composerFileInputRef.current.value = '';
                          }}
                        />
                        <button type="button" className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100" onClick={() => composerFileInputRef.current?.click()} disabled={uploadingChatAttachment}>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                          </svg>
                        </button>
                        <textarea
                          rows={1}
                          placeholder="Type a message..."
                          className="flex-1 px-3.5 py-2 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-[#326101] focus:border-transparent bg-white text-gray-900 text-sm"
                          value={messageText}
                          onChange={(e) => setMessageText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              sendMessage();
                            }
                          }}
                        />
                        <button
                          onClick={sendMessage}
                          disabled={uploadingChatAttachment || !currentConversation || (!messageText.trim() && messageAttachments.length === 0)}
                          className="p-2 bg-[#326101] disabled:opacity-40 text-white rounded-lg hover:bg-[#639427] transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-gray-300">
                    <svg className="w-16 h-16 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <p className="text-sm">Select a conversation to start messaging</p>
                  </div>
                )}
              </div>
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
