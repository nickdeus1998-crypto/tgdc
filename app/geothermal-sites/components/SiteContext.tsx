// app/geothermal-sites/components/SiteContext.tsx
'use client';

import React, { createContext, useContext, useState, useMemo, ReactNode } from 'react';

interface Site {
  id: string;
  title: string;
  summary: string;
  details: string[];
  tag?: string;
}

type Zone = "Eastern Zone" | "Lake Zone" | "Southern Zone" | "Northern Zone" | "Central Zone" | "All";

const data: Record<Exclude<Zone, "All">, Site[]> = {
  "Eastern Zone": [
    {
      id: "kisaki",
      title: "Kisaki geothermal Site",
      summary: "Within Selous Game Reserve and Mikumi National Park, Morogoro rural, Eastern Tanzania.",
      details: [
        "Prospect in the Rufiji sedimentary basin, Eastern arm of EARS.",
        "After reconnaissance, detailed exploration is underway to unlock geothermal potential."
      ],
      tag: "Morogoro • Selous • Mikumi"
    },
    {
      id: "luhoi",
      title: "Luhoi geothermal Site",
      summary: "Rufiji district, Coast region, eastern coast of Tanzania Mainland.",
      details: [
        "Falls in the sedimentary Rufiji basin in the ‘Karoo’ rift to the Eastern Coast.",
        "Oil & gas borehole data indicate potential geothermal resource existence."
      ],
      tag: "Rufiji • Coast Region"
    },
    {
      id: "utete",
      title: "Utete geothermal site",
      summary: "~22 km SE of Luhoi in Utete village, Rufiji district, Coast region; hot spring enclosed by short brick walls.",
      details: [
        "Within Rufiji river basin characterized by sandstones.",
        "Represents depositional environment of a river."
      ],
      tag: "Utete • Rufiji Basin"
    },
    {
      id: "mtende",
      title: "Mtende geothermal site",
      summary: "Within Selous game reserve, Morogoro rural district; spring outflow from the Mtende river bank.",
      details: [
        "Falls within the Rufiji basin on the Eastern branch of EARS.",
        "Surface expressions along the river system."
      ],
      tag: "Selous • Morogoro"
    },
    {
      id: "tagalala",
      title: "Tagalala geothermal site",
      summary: "Morogoro district at the mouth of Tagalala River within Selous game reserve.",
      details: [
        "Within Rufiji basin on the eastern branch of EARS.",
        "Dominated by well-exposed dolomitic sandstones with ‘elephantiac’ texture in the channel."
      ],
      tag: "Tagalala • Selous"
    }
  ],
  "Lake Zone": [],
  "Southern Zone": [],
  "Northern Zone": [],
  "Central Zone": []
};

interface SiteContextType {
  currentZone: Zone;
  setCurrentZone: (zone: Zone) => void;
  currentQuery: string;
  setCurrentQuery: (query: string) => void;
  filteredSites: Site[];
  easternCount: number;
  othersCount: number;
  totalCount: number;
  isModalOpen: boolean;
  modalSite: Site | null;
  modalZone: string | null;
  openSiteModal: (id: string) => void;
  closeModal: () => void;
}

const SiteContext = createContext<SiteContextType | undefined>(undefined);

export function SiteProvider({ children }: { children: ReactNode }) {
  const [currentZone, setCurrentZone] = useState<Zone>("Eastern Zone");
  const [currentQuery, setCurrentQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalSiteId, setModalSiteId] = useState<string | null>(null);

  const easternCount = useMemo(() => data["Eastern Zone"].length, []);
  const othersCount = useMemo(() => Object.keys(data).filter(z => z !== "Eastern Zone").reduce((sum, z) => sum + data[z as Exclude<Zone, "All">].length, 0), []);
  const totalCount = easternCount + othersCount;

  const filteredSites = useMemo(() => {
    let zoneSites: Site[] = currentZone === "All" ? Object.values(data).flat() : data[currentZone as Exclude<Zone, "All">] || [];
    return zoneSites.filter(s =>
      s.title.toLowerCase().includes(currentQuery.toLowerCase()) ||
      s.summary.toLowerCase().includes(currentQuery.toLowerCase()) ||
      (s.tag && s.tag.toLowerCase().includes(currentQuery.toLowerCase()))
    );
  }, [currentZone, currentQuery]);

  const findSiteById = (id: string) => {
    for (const [zone, sites] of Object.entries(data)) {
      const site = sites.find(s => s.id === id);
      if (site) return { zone, site };
    }
    return null;
  };

  const { modalZone, modalSite } = useMemo(() => {
    if (!modalSiteId) return { modalZone: null, modalSite: null };
    const res = findSiteById(modalSiteId);
    return res ? { modalZone: res.zone, modalSite: res.site } : { modalZone: null, modalSite: null };
  }, [modalSiteId]);

  const openSiteModal = (id: string) => {
    setModalSiteId(id);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalSiteId(null);
  };

  return (
    <SiteContext.Provider value={{ currentZone, setCurrentZone, currentQuery, setCurrentQuery, filteredSites, easternCount, othersCount, totalCount, isModalOpen, modalSite, modalZone, openSiteModal, closeModal }}>
      {children}
      {isModalOpen && modalSite && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
          <div className="modal-backdrop absolute inset-0" onClick={closeModal}></div>
          <div className="relative bg-white max-w-2xl w-full rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
            <div className="flex items-start justify-between p-6 border-b">
              <div>
                <h4 className="text-xl font-bold text-gray-900">{modalSite.title}</h4>
                <p className="text-sm text-gray-500 mt-1">{modalZone}</p>
              </div>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
            </div>
            <div className="p-6 text-gray-700 leading-relaxed">
              <p className="mb-3 text-gray-700">{modalSite.summary}</p>
              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="text-sm text-gray-600 mb-1">Highlights</div>
                <ul className="list-disc pl-5 space-y-1">
                  {modalSite.details.map((d, i) => <li key={i}>{d}</li>)}
                </ul>
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t text-right">
              <button onClick={closeModal} className="px-4 py-2 rounded-lg text-sm font-semibold bg-[#326101] text-white hover:bg-[#639427]">Close</button>
            </div>
          </div>
        </div>
      )}
    </SiteContext.Provider>
  );
}

export const useSite = () => {
  const context = useContext(SiteContext);
  if (!context) throw new Error('useSite must be used within SiteProvider');
  return context;
};