'use client'

export default function OrgStructure() {
  const departments = [
    {
      title: 'Exploration & Resource Assessment',
      points: ['Geology & geophysics', 'Reservoir modeling', 'Surface exploration'],
    },
    {
      title: 'Drilling & Well Services',
      points: ['Well design & HSE', 'Rig supervision', 'Testing & stimulation'],
    },
    {
      title: 'Plant Engineering & EPC',
      points: ['Process design', 'Procurement & delivery', 'Commissioning'],
    },
    {
      title: 'Operations & Maintenance',
      points: ['Monitoring & SCADA', 'Predictive maintenance', 'Performance tuning'],
    },
    {
      title: 'Finance & Administration',
      points: ['Budgeting & control', 'Procurement & assets', 'People & culture'],
    },
    {
      title: 'Sustainability & Community',
      points: ['ESG & compliance', 'Stakeholder engagement', 'Environmental stewardship'],
    },
    {
      title: 'Legal & Compliance',
      points: ['Regulatory affairs', 'Contracts & IP', 'Risk management'],
    },
    {
      title: 'IT & Data',
      points: ['Infrastructure & security', 'Data platforms', 'Analytics'],
    },
  ]

  return (
    <section id="org-structure" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-2 bg-green-50 rounded-full mb-4">
            <span className="text-[#326101] text-sm font-medium">Our Organization</span>
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-3">Organizational Structure</h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Governance, leadership, and specialist teams working together to deliver reliable geothermal projects.
          </p>
        </div>

        {/* Board */}
        <div className="max-w-3xl mx-auto mb-8">
          <div className="rounded-2xl overflow-hidden shadow bg-white border border-gray-100">
            <div className="h-2 bg-gradient-to-r from-[#326101] to-[#639427]" />
            <div className="p-6 text-center">
              <h3 className="text-xl font-bold text-gray-900">Board of Directors</h3>
              <p className="text-gray-600 mt-1">Strategic oversight and governance</p>
            </div>
          </div>
        </div>

        {/* Connector: Board -> MD (desktop/tablet) */}
        <div className="hidden sm:flex justify-center items-center -mt-2 mb-2">
          <div className="w-0.5 h-8 bg-[#CFE6C7]" />
        </div>

        {/* Managing Director */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="rounded-2xl overflow-hidden shadow bg-white border border-gray-100">
            <div className="h-2 bg-gradient-to-r from-[#326101] to-[#639427]" />
            <div className="p-6 text-center">
              <h3 className="text-xl font-bold text-gray-900">Managing Director</h3>
              <p className="text-gray-600 mt-1">Execution, coordination, and stakeholder leadership</p>
            </div>
          </div>
        </div>

        {/* Connector: MD -> Departments fan-out (desktop/tablet) */}
        <div className="hidden sm:block mb-4">
          <div className="relative">
            {/* Horizontal line spanning across columns */}
            <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-[#CFE6C7]" />
            {/* Stub lines aligned to department columns */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {departments.map((dept) => (
                <div key={dept.title} className="flex justify-center">
                  <div className="w-0.5 h-6 bg-[#CFE6C7]" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Departments */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:mt-2">
          {departments.map((dept) => (
            <div key={dept.title} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#326101] to-[#639427]" />
                <h4 className="text-lg font-semibold text-gray-900">{dept.title}</h4>
              </div>
              <ul className="space-y-2 text-gray-600 text-sm">
                {dept.points.map((p) => (
                  <li key={p} className="flex items-center">
                    <span className="w-1.5 h-1.5 bg-[#639427] rounded-full mr-2" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
