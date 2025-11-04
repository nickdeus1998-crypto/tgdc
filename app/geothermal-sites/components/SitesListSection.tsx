// app/geothermal-sites/components/SitesListSection.tsx
'use client';

import { useSite } from './SiteContext';

export function SitesListSection() {
  const { currentZone, filteredSites, openSiteModal } = useSite();

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


  const title = currentZone === "All" ? "All Zones" : `${currentZone} Sites`;
  const subtitle = `Showing ${filteredSites.length} site${filteredSites.length === 1 ? "" : "s"}`;
  const isEmpty = filteredSites.length === 0;
  let message = "";
  if (isEmpty) {
    if (currentZone !== "All" && (data[currentZone as Exclude<typeof currentZone, "All">] || []).length === 0) {
      message = `No sites added yet for ${currentZone}.`;
    } else {
      message = "No matching sites found.";
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">{title}</h3>
          <p className="text-gray-600 text-sm">{subtitle}</p>
        </div>
      </div>
      <div className="space-y-4">
        {isEmpty ? (
          <div className="p-6 border border-gray-100 rounded-xl bg-gray-50 text-gray-600 text-sm fade-in">
            {message}
          </div>
        ) : (
          filteredSites.map(site => (
            <div key={site.id} className="card border border-gray-100 rounded-xl p-5 bg-white fade-in">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">{site.title}</h4>
                  <p className="text-gray-600 mt-1">{site.summary}</p>
                  {site.tag && <div className="mt-2 text-xs text-gray-500">Tags: {site.tag}</div>}
                </div>
                <button
                  className="bg-[#326101] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#639427]"
                  onClick={() => openSiteModal(site.id)}
                >
                  View
                </button>
              </div>
              <details className="mt-4 group">
                <summary className="cursor-pointer text-sm text-[#326101] hover:underline select-none">Read more</summary>
                <ul className="list-disc pl-5 mt-2 text-gray-700 space-y-1">
                  {site.details.map((d, i) => <li key={i}>{d}</li>)}
                </ul>
              </details>
            </div>
          ))
        )}
      </div>
    </div>
  );
}