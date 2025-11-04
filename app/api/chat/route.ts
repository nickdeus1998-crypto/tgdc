import { NextResponse } from 'next/server'

type Faq = {
  keywords: string[]
  answer: string
}

const FAQS: Faq[] = [
  {
    keywords: ['price', 'pricing', 'cost', 'fee', 'quote', 'how much'],
    answer:
      'Pricing depends on project scope. Share your project details and our team will provide a tailored quote.',
  },
  {
    keywords: ['service', 'services', 'what do you offer', 'capabilities'],
    answer:
      'We offer end-to-end geothermal solutions: site assessment, drilling support, plant design, installation, monitoring, and maintenance.',
  },
  {
    keywords: ['contact', 'email', 'phone', 'reach', 'support'],
    answer:
      'You can reach our team via the Contact section on the site. We typically respond within one business day.',
  },
  {
    keywords: ['hour', 'hours', 'time', 'availability', 'open'],
    answer: 'Our support hours are 9am–5pm local time, Monday to Friday.',
  },
  {
    keywords: ['location', 'office', 'where', 'address'],
    answer: 'We support clients globally and operate remotely; site visits are available upon request.',
  },
  {
    keywords: ['geothermal', 'renewable', 'energy', 'sustainable'],
    answer:
      'We specialize in geothermal energy projects, from exploration to operations, focused on reliable, sustainable power.',
  },
  {
    keywords: ['project', 'portfolio', 'case study', 'case studies', 'examples'],
    answer:
      'Check our Projects/News sections for highlights. If you have a specific use case, tell us and we’ll share relevant examples.',
  },
  {
    keywords: ['career', 'job', 'hiring', 'apply'],
    answer: 'We’re always interested in great talent. Please send your CV via our Contact page.',
  },
]

function matchFaq(message: string): string | null {
  const text = message.toLowerCase()
  for (const f of FAQS) {
    if (f.keywords.some((k) => text.includes(k))) {
      return f.answer
    }
  }
  return null
}

export async function POST(request: Request) {
  try {
    const { message } = await request.json()
    if (!message || typeof message !== 'string') {
      return NextResponse.json({ reply: 'Please provide a message.' }, { status: 400 })
    }

    const matched = matchFaq(message)
    const reply =
      matched ||
      "I’m not sure yet. Could you rephrase or provide more details? You can also check our Services and Contact sections."

    return NextResponse.json({ reply }, { status: 200 })
  } catch (e) {
    return NextResponse.json({ reply: 'Sorry, something went wrong.' }, { status: 500 })
  }
}

