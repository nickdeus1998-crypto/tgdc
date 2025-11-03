"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

type Item = { id: number; title: string; url: string; thumbnail?: string | null; date?: string };

export default function InformationCenterSection() {
  const [photos, setPhotos] = useState<Item[]>([]);
  const [videos, setVideos] = useState<Item[]>([]);
  const [newsletters, setNewsletters] = useState<Item[]>([]);
  const [press, setPress] = useState<Item[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [p, v, n, pr] = await Promise.all([
          fetch("/api/information?kind=photo&limit=6").then(r => r.json()).catch(() => []),
          fetch("/api/information?kind=video&limit=3").then(r => r.json()).catch(() => []),
          fetch("/api/information?kind=newsletter&limit=3").then(r => r.json()).catch(() => []),
          fetch("/api/information?kind=press&limit=3").then(r => r.json()).catch(() => []),
        ]);
        setPhotos(p || []);
        setVideos(v || []);
        setNewsletters(n || []);
        setPress(pr || []);
      } catch {}
    };
    load();
  }, []);

  return (
    <section className="py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Information Centre</h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Photos Gallery</h3>
            </div>
            {photos.length === 0 ? (
              <div className="text-gray-600">No photos yet.</div>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {photos.map(p => (
                  <a key={p.id} href={p.url} target="_blank" rel="noreferrer" className="block">
                    <div className="aspect-[4/3] w-full overflow-hidden rounded-lg border">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.thumbnail || p.url} alt={p.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="mt-1 text-xs text-gray-700 truncate" title={p.title}>{p.title}</div>
                  </a>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Videos Gallery</h3>
            </div>
            {videos.length === 0 ? (
              <div className="text-gray-600">No videos yet.</div>
            ) : (
              <ul className="space-y-2">
                {videos.map(v => (
                  <li key={v.id} className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center text-gray-500">▶</div>
                    <div>
                      <a href={v.url} target="_blank" rel="noreferrer" className="text-sm text-[#326101] hover:underline">{v.title}</a>
                      <div className="text-xs text-gray-500">{v.date ? new Date(v.date).toLocaleDateString() : ''}</div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mt-8">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Newsletter</h3>
            </div>
            {newsletters.length === 0 ? (
              <div className="text-gray-600">No newsletters yet.</div>
            ) : (
              <ul className="space-y-2">
                {newsletters.map(n => (
                  <li key={n.id} className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center text-gray-500">✉</div>
                    <div>
                      <a href={n.url} target="_blank" rel="noreferrer" className="text-sm text-[#326101] hover:underline">{n.title}</a>
                      <div className="text-xs text-gray-500">{n.date ? new Date(n.date).toLocaleDateString() : ''}</div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Press</h3>
            </div>
            {press.length === 0 ? (
              <div className="text-gray-600">No press items yet.</div>
            ) : (
              <ul className="space-y-2">
                {press.map(p => (
                  <li key={p.id} className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center text-gray-500">📰</div>
                    <div>
                      <a href={p.url} target="_blank" rel="noreferrer" className="text-sm text-[#326101] hover:underline">{p.title}</a>
                      <div className="text-xs text-gray-500">{p.date ? new Date(p.date).toLocaleDateString() : ''}</div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

