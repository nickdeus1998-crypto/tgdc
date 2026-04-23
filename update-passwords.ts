import { PrismaClient } from '@prisma/client'
import { hashPassword } from './app/lib/auth'

const prisma = new PrismaClient()

async function main() {
  const newPassword = 'Tgdc@Admin2026!'
  console.log('Hashing new password...')
  const hashedPassword = await hashPassword(newPassword)
  
  console.log('Updating all Users with new password...')
  const usersUpdated = await prisma.user.updateMany({
    data: { password: hashedPassword }
  })
  console.log(`Updated ${usersUpdated.count} Users.`)

  console.log('Updating all Stakeholders with new password...')
  const stakeholdersUpdated = await prisma.stakeholder.updateMany({
    data: { password: hashedPassword }
  })
  console.log(`Updated ${stakeholdersUpdated.count} Stakeholders.`)

  console.log('\nSUCCESS! Default password for all users and stakeholders is now: ' + newPassword)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
