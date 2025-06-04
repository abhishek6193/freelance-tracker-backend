import nodemailer from 'nodemailer';

export async function sendInvoiceEmail({
  to,
  subject,
  text,
  html,
  attachments = [],
}: {
  to: string;
  subject: string;
  text: string;
  html?: string;
  attachments?: any[];
}) {
  // Use Ethereal for dev/testing
  const testAccount = await nodemailer.createTestAccount();
  const transporter = nodemailer.createTransport({
    host: testAccount.smtp.host,
    port: testAccount.smtp.port,
    secure: testAccount.smtp.secure,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });

  const info = await transporter.sendMail({
    from: 'Freelance Tracker <no-reply@freelancetracker.test>',
    to,
    subject,
    text,
    html,
    attachments,
  });

  return {
    messageId: info.messageId,
    previewUrl: nodemailer.getTestMessageUrl(info),
  };
}
