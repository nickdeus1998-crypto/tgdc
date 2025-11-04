export function StrategicProjectsSection() {
  const projects = [
    {
      name: 'Ngozi Direct-Use Hub',
      details: 'Mbeya Region • Medium-High Temp • Pre‑feasibility',
      content:
        'Integrated applications for greenhouses, product drying, aquaculture, and district heating pilots leveraging Ngozi’s resource.',
    },
    {
      name: 'Kisaki Agro-Energy Park',
      details: 'Morogoro Region • Medium Temp • Concept',
      content:
        'Agro-processing with geothermal heat for dehydration, pasteurization, and cold-chain integration to reduce post-harvest losses.',
    },
    {
      name: 'Luhoi Industrial Cluster',
      details: 'Coast Region • Medium Temp • Screening',
      content:
        'Process heat for light industry and fisheries, enabling clean thermal energy substitution and stable operations.',
    },
    {
      name: 'Kiejo‑Mbaka Community Heat',
      details: 'Rungwe • Low‑Medium Temp • Pilot',
      content:
        'Community-scale heating demonstrations for healthcare, schools, and public facilities to improve service reliability.',
    },
    {
      name: 'Songwe Cooling & Aquaculture',
      details: 'Songwe • Medium Temp • Concept',
      content:
        'Absorption cooling for storage and fish farming to stabilize value chains and expand regional produce markets.',
    },
  ] as const;

  return (
    <section className="py-16">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-10">
          <div className="inline-flex items-center px-4 py-2 bg-green-50 rounded-full mb-4">
            <span className="text-[#326101] text-sm font-medium">Strategic Focus</span>
          </div>
          <h3 className="text-3xl md:text-4xl font-bold text-gray-900">Strategic Projects</h3>
          <p className="text-gray-600 mt-3 max-w-3xl mx-auto">
            Five priority initiatives advancing direct‑use of geothermal heat across key regions and applications.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((p, idx) => (
            <div
              key={p.name}
              className="bg-white rounded-2xl border border-gray-100 p-6 card hover:shadow-xl"
              style={{ transition: 'transform .25s ease, box-shadow .25s ease' }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#326101] to-[#639427]" />
                <h4 className="text-lg font-semibold text-gray-900">{idx + 1}. {p.name}</h4>
              </div>
              <div className="text-sm text-gray-500 mb-2">{p.details}</div>
              <p className="text-gray-700 leading-relaxed">{p.content}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

