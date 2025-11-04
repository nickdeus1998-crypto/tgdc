type Mail = {
  to: string
  subject: string
  text?: string
  html?: string
}

export async function sendMail(mail: Mail) {
  const to = mail.to || process.env.COMPANY_EMAIL || ''
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env

  // If SMTP is configured and nodemailer is available, send real mail
  if (SMTP_HOST && SMTP_PORT) {
    try {
      // Dynamic import so build doesn’t fail if not installed
      const nodemailer = await import('nodemailer').catch(() => null as any)
      if (nodemailer?.createTransport) {
        const transporter = nodemailer.createTransport({
          host: SMTP_HOST,
          port: Number(SMTP_PORT),
          secure: Number(SMTP_PORT) === 465, // true for 465, false for others
          auth: SMTP_USER && SMTP_PASS ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
        })
        const info = await transporter.sendMail({
          from: SMTP_FROM || SMTP_USER || 'no-reply@localhost',
          to,
          subject: mail.subject,
          text: mail.text,
          html: mail.html,
        })
        console.log('[MAIL][SMTP] sent', info.messageId)
        return true
      }
    } catch (e) {
      console.warn('[MAIL] SMTP send failed, falling back to console', e)
    }
  }

  // Fallback: log to console
  console.log('[MAIL][LOG]', { to: to || '(unset)', subject: mail.subject, text: mail.text })
  return true
}
