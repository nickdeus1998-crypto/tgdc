// components/IntroSection.tsx
'use client';

export function IntroSection({ title, content }: { title?: string; content?: string }) {
  return (
    <section className="py-14">
      <div className="max-w-5xl mx-auto px-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{title || "Projects"}</h2>
          <div className="text-gray-700 leading-relaxed space-y-4">
            {content ? (
              content.split('\n').map((para, i) => para.trim() && <p key={i}>{para}</p>)
            ) : (
              <>
                <p>
                  In order to maximize geothermal resource utilization, TGDC is promoting direct use applications of geothermal heat energy to improve wellbeing of Tanzanians through cheaper energy supply sources. As shown in the diagram, heat energy in the hot brine has many applications depending on the temperature and chemistry of the water and other site specific economic and social activities.
                </p>
                <p>
                  TGDC has carried preliminary studies to establish pilot projects for direct use heat utilization in Ngozi and Kisaki areas. The preliminary areas of economical utilizations include greenhouse heating, drying of grains, fish farming, industrial processes, cooling and heating, among others. The results of these studies are promising and the company is planning to undertake pre‐feasibility studies including establishing the technical parameters of the resource potential market viability as well as environmental and social assessment. In the future, TGDC intends to engage the government, research institutions, entrepreneurs and the private sector at large including the commercial institutions to discuss the opportunities direct use application provides to the country and how to cooperate to harness the potential.
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}