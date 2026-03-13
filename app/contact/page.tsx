import prisma from '@/lib/prisma';

const DEFAULTS: Record<string, string> = {
  contact_hero_title: 'Get in Touch',
  contact_hero_subtitle: "Have a question or inquiry? We'd love to hear from you. Reach out and our team will respond within one business day.",
  contact_address_line1: 'TGDC Headquarters',
  contact_address_line2: 'Dar es Salaam, Tanzania',
  contact_phone: '+255 22 266 3813',
  contact_email: 'info@tgdc.go.tz',
  contact_working_hours: 'Monday – Friday: 8:00 AM – 5:00 PM',
  contact_working_hours_note: 'Closed on weekends and public holidays',
  contact_map_title: 'Our Location',
  contact_map_subtitle: 'TGDC Office — Dar es Salaam, Tanzania',
  contact_map_embed_url: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3961.5!2d39.2611814!3d-6.7729593!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x185c4dc60842ed7d%3A0xd5e267a0c4c02f94!2sTGDC%20Head%20Office!5e0!3m2!1sen!2stz!4v1700000000000!5m2!1sen!2stz',
};

export default async function ContactPage() {
  const rows = await prisma.siteSetting.findMany({
    where: { key: { startsWith: 'contact_' } },
  });
  const s: Record<string, string> = { ...DEFAULTS };
  for (const r of rows) if (r.value) s[r.key] = r.value;

  return (
    <div className="bg-white min-h-screen">
      {/* Hero */}
      <section className="bg-[radial-gradient(900px_460px_at_10%_-10%,rgba(99,148,39,0.18),transparent_60%),radial-gradient(800px_420px_at_110%_0%,rgba(50,97,1,0.18),transparent_60%),linear-gradient(135deg,#326101,#639427)] text-white py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">{s.contact_hero_title}</h1>
          <p className="text-white/90 text-lg md:text-xl mt-4 max-w-3xl">{s.contact_hero_subtitle}</p>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Contact Info Cards */}
            <div className="space-y-6">
              {/* Address */}
              <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                <div className="w-10 h-10 rounded-lg bg-[#326101]/10 flex items-center justify-center mb-4">
                  <svg className="w-5 h-5 text-[#326101]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                </div>
                <h3 className="text-sm font-semibold text-gray-900 mb-1">Office Address</h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {s.contact_address_line1}<br />
                  {s.contact_address_line2}
                </p>
              </div>

              {/* Phone */}
              <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                <div className="w-10 h-10 rounded-lg bg-[#326101]/10 flex items-center justify-center mb-4">
                  <svg className="w-5 h-5 text-[#326101]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                </div>
                <h3 className="text-sm font-semibold text-gray-900 mb-1">Phone</h3>
                <p className="text-sm text-gray-500">{s.contact_phone}</p>
              </div>

              {/* Email */}
              <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                <div className="w-10 h-10 rounded-lg bg-[#326101]/10 flex items-center justify-center mb-4">
                  <svg className="w-5 h-5 text-[#326101]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                </div>
                <h3 className="text-sm font-semibold text-gray-900 mb-1">Email</h3>
                <p className="text-sm text-gray-500">{s.contact_email}</p>
              </div>

              {/* Working Hours */}
              <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                <div className="w-10 h-10 rounded-lg bg-[#326101]/10 flex items-center justify-center mb-4">
                  <svg className="w-5 h-5 text-[#326101]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <h3 className="text-sm font-semibold text-gray-900 mb-1">Working Hours</h3>
                <p className="text-sm text-gray-500">{s.contact_working_hours}</p>
                {s.contact_working_hours_note && (
                  <p className="text-xs text-gray-400 mt-1">{s.contact_working_hours_note}</p>
                )}
              </div>
            </div>

            {/* Google Map */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h2 className="text-lg font-semibold text-gray-900">{s.contact_map_title}</h2>
                  <p className="text-sm text-gray-500">{s.contact_map_subtitle}</p>
                </div>
                <iframe
                  src={s.contact_map_embed_url}
                  width="100%"
                  height="500"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
