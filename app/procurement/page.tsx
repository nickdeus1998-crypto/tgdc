import Link from 'next/link'
import prisma from '@/lib/prisma'
import Procurement, { Tender } from './Tender'



export default async function Tenders() {

  const rows = await prisma.tender.findMany({ orderBy: [{ publish: 'desc' }] })

  let tenderNote = ''
  try {
    const setting = await prisma.siteSetting.findUnique({ where: { key: 'tenderNote' } })
    tenderNote = setting?.value || ''
  } catch { }



  var tenderData: Tender[] = [];

  rows.forEach((row) => {
    tenderData.push({ ...row, deadline: new Date(row.deadline).toLocaleDateString(), publish: new Date(row.publish).toLocaleDateString() })
  })

  const tenders = rows.map((r) => ({
    id: r.id,
    ref: r.ref,
    title: r.title,
    category: r.category,
    status: r.status,
    deadline: new Date(r.deadline).toLocaleDateString(),
    publish: new Date(r.publish).toLocaleDateString(),
    scope: r.scope,
    docs: r.docs,

  }))







  return (
    <>
      <Procurement tenderData={tenderData} tenderNote={tenderNote} />
    </>
  )
}
