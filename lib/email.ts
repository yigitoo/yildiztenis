import { Resend } from "resend";
import nodemailer from "nodemailer";

type WorkshopEmailPayload = {
  to: string;
  firstName: string;
  workshopTitle: string;
  workshopDate: string;
};

type VerificationEmailPayload = WorkshopEmailPayload & {
  code: string;
};

type AdminLoginCodePayload = {
  to: string;
  code: string;
};

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const from = process.env.EMAIL_FROM ?? "Yıldız Tenis <info@yildiztenis.com>";
const smtpTransport =
  process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD
    ? nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT ?? 465),
        secure: process.env.SMTP_SECURE !== "false",
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD
        }
      })
    : null;

const baseUrl = process.env.NEXTAUTH_URL ?? "https://yildiztenis.com";

function brandedTemplate(title: string, body: string) {
  return `
    <div style="margin:0;background:#f7fbf7;color:#102014;font-family:'Avenir Next',Arial,Helvetica,sans-serif;">
      <div style="max-width:620px;margin:0 auto;padding:32px 20px;">
        <div style="text-align:center;margin-bottom:24px;">
          <img src="${baseUrl}/images/yildiz-tenis-logo.png" alt="Yıldız Tenis" width="64" height="64" style="border-radius:16px;border:1px solid #d8ead9;" />
        </div>
        <div style="border:1px solid #d8ead9;border-radius:16px;overflow:hidden;background:#ffffff;">
          <div style="background:linear-gradient(135deg,#007405 0%,#003f16 100%);color:#ffffff;padding:28px 32px;">
            <div style="font-size:12px;letter-spacing:.12em;text-transform:uppercase;opacity:0.85;">Yıldız Tenis</div>
            <h1 style="margin:10px 0 0;font-size:24px;line-height:1.3;font-weight:600;">${title}</h1>
          </div>
          <div style="padding:32px;font-size:15px;line-height:1.7;color:#1a2e1e;">
            ${body}
          </div>
          <div style="border-top:1px solid #e8f0e8;padding:20px 32px;text-align:center;">
            <p style="margin:0;font-size:12px;color:#6b7c6e;">© ${new Date().getFullYear()} Yıldız Tenis · Yıldız Teknik Üniversitesi, İstanbul</p>
          </div>
        </div>
      </div>
    </div>
  `;
}

async function sendMail(to: string, subject: string, html: string) {
  if (smtpTransport) {
    const response = await smtpTransport.sendMail({
      from,
      to,
      subject,
      html
    });

    return { id: response.messageId, skipped: false };
  }

  if (!resend) {
    return { id: null, skipped: true };
  }

  const response = await resend.emails.send({
    from,
    to,
    subject,
    html
  });

  if (response.error) {
    throw new Error(response.error.message);
  }

  return { id: response.data?.id ?? null, skipped: false };
}

export async function sendApplicationReceivedEmail(payload: WorkshopEmailPayload) {
  const subject = "Ön başvurunuz alındı";
  const html = brandedTemplate(
    "Ön başvurunuz alındı",
    `
      <p>Merhaba ${payload.firstName},</p>
      <p><strong>${payload.workshopTitle}</strong> için ön başvurun başarıyla alındı.</p>
      <p>Etkinlik tarihi: <strong>${payload.workshopDate}</strong></p>
      <p>Kontenjan değerlendirmesi tamamlandığında seni yeniden bilgilendireceğiz.</p>
    `
  );

  return sendMail(payload.to, subject, html);
}

export async function sendApplicationVerificationEmail(payload: VerificationEmailPayload) {
  const subject = "Yıldız Tenis başvuru doğrulama kodu";
  const html = brandedTemplate(
    "Başvurunu doğrula",
    `
      <p>Merhaba ${payload.firstName},</p>
      <p><strong>${payload.workshopTitle}</strong> başvurunun sayılması için aşağıdaki kodu form ekranında doğrula.</p>
      <p style="font-size:28px;letter-spacing:0.18em;font-weight:700;color:#007405;margin:24px 0;">${payload.code}</p>
      <p>Bu kod 15 dakika boyunca geçerlidir.</p>
    `
  );

  return sendMail(payload.to, subject, html);
}

export async function sendApplicationAcceptedEmail(payload: WorkshopEmailPayload) {
  const subject = "Workshop asil listesine kabul edildiniz";
  const html = brandedTemplate(
    "Workshop'a kabul edildiniz",
    `
      <p>Merhaba ${payload.firstName},</p>
      <p><strong>${payload.workshopTitle}</strong> asil listesine kabul edildin.</p>
      <p>Etkinlik tarihi: <strong>${payload.workshopDate}</strong></p>
      <p>Detaylar ve hazırlık bilgileri kısa süre içinde paylaşılacaktır.</p>
    `
  );

  return sendMail(payload.to, subject, html);
}

export async function sendAdminLoginCodeEmail(payload: AdminLoginCodePayload) {
  const subject = "Yıldız Tenis admin giriş kodu";
  const html = brandedTemplate(
    "Admin giriş kodu",
    `
      <p>Yıldız Tenis admin paneline giriş için doğrulama kodunuz:</p>
      <p style="font-size:28px;letter-spacing:0.18em;font-weight:700;color:#007405;margin:24px 0;">${payload.code}</p>
      <p>Bu kod 10 dakika boyunca geçerlidir. Bu işlemi siz başlatmadıysanız şifrenizi değiştirin.</p>
    `
  );

  return sendMail(payload.to, subject, html);
}
