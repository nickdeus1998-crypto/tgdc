import Link from 'next/link'
import { PrismaClient } from '@prisma/client'
import Procurement, { Tender } from './Tender'



export default async function Tenders() {
  const prisma = new PrismaClient()
  const rows = await prisma.tender.findMany({ orderBy: [{ publish: 'desc' }] })
  await prisma.$disconnect()
  
  var tenderData: Tender[]   =  [];

  rows.forEach((row)=>{
       tenderData.push({...row, deadline: new Date(row.deadline).toLocaleDateString(),publish: new Date(row.publish).toLocaleDateString()})
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
      <Procurement  tenderData={tenderData} />
    </>
  )
}

