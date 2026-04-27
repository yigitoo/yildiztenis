import { Resend } from "resend";
import nodemailer from "nodemailer";
import { getEmailLogoDataUri } from "@/lib/email-logo";

type WorkshopEmailPayload = {
  to: string;
  firstName: string;
  workshopTitle: string;
  workshopDate: string;
  whatsappLink?: string | null;
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

function brandedTemplate(title: string, body: string) {
  const logo = getEmailLogoDataUri();
  const logoHtml = logo
    ? `<img src="${logo}" alt="Yıldız Tenis" width="56" height="56" style="border-radius:14px;display:block;" />`
    : `<div style="width:56px;height:56px;border-radius:14px;background:#007405;color:#fff;font-size:22px;font-weight:700;text-align:center;line-height:56px;">YT</div>`;

  return `<!DOCTYPE html>
<html lang="tr">
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#f4f9f4;font-family:'Avenir Next','Segoe UI',Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f9f4;padding:40px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- Logo -->
        <tr><td align="center" style="padding-bottom:28px;">
          ${logoHtml}
        </td></tr>

        <!-- Card -->
        <tr><td>
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #dce8dc;">

            <!-- Header -->
            <tr><td style="background:linear-gradient(135deg,#007405 0%,#005a10 50%,#003f16 100%);padding:32px 36px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:rgba(255,255,255,0.8);font-weight:600;">Yıldız Tenis</td>
                </tr>
                <tr>
                  <td style="font-size:22px;font-weight:600;color:#ffffff;padding-top:8px;line-height:1.3;">${title}</td>
                </tr>
              </table>
            </td></tr>

            <!-- Body -->
            <tr><td style="padding:36px;font-size:15px;line-height:1.75;color:#1a2e1e;">
              ${body}
            </td></tr>

            <!-- Footer -->
            <tr><td style="border-top:1px solid #e8f0e8;padding:20px 36px;text-align:center;">
              <p style="margin:0;font-size:11px;color:#7a8f7e;line-height:1.5;">
                © ${new Date().getFullYear()} Yıldız Tenis · Yıldız Teknik Üniversitesi, İstanbul
              </p>
            </td></tr>

          </table>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function codeBlock(code: string) {
  return `
    <table cellpadding="0" cellspacing="0" style="margin:24px auto;background:#f0f8f0;border:2px dashed #007405;border-radius:12px;padding:0;">
      <tr><td style="padding:16px 32px;text-align:center;">
        <span style="font-size:32px;letter-spacing:0.22em;font-weight:700;color:#007405;font-family:'Courier New',monospace;">${code}</span>
      </td></tr>
    </table>
  `;
}

function infoRow(label: string, value: string) {
  return `
    <tr>
      <td style="padding:8px 0;color:#5a6e5e;font-size:13px;font-weight:600;width:120px;vertical-align:top;">${label}</td>
      <td style="padding:8px 0;color:#1a2e1e;font-size:14px;">${value}</td>
    </tr>
  `;
}

async function sendMail(to: string, subject: string, html: string) {
  if (smtpTransport) {
    const response = await smtpTransport.sendMail({ from, to, subject, html });
    return { id: response.messageId, skipped: false };
  }

  if (!resend) {
    return { id: null, skipped: true };
  }

  const response = await resend.emails.send({ from, to, subject, html });
  if (response.error) {
    throw new Error(response.error.message);
  }
  return { id: response.data?.id ?? null, skipped: false };
}

export async function sendApplicationReceivedEmail(payload: WorkshopEmailPayload) {
  const html = brandedTemplate(
    "Ön başvurun alındı",
    `
      <p style="margin:0 0 16px;">Merhaba <strong>${payload.firstName}</strong>,</p>
      <p style="margin:0 0 20px;"><strong>${payload.workshopTitle}</strong> için ön başvurun başarıyla alındı.</p>
      <table cellpadding="0" cellspacing="0" style="background:#f8fbf8;border-radius:10px;padding:0;width:100%;margin:0 0 20px;">
        <tr><td style="padding:16px 20px;">
          <table cellpadding="0" cellspacing="0" width="100%">
            ${infoRow("Workshop", payload.workshopTitle)}
            ${infoRow("Tarih", payload.workshopDate)}
          </table>
        </td></tr>
      </table>
      <p style="margin:0;color:#5a6e5e;font-size:13px;">Kontenjan değerlendirmesi tamamlandığında seni yeniden bilgilendireceğiz.</p>
    `
  );
  return sendMail(payload.to, "Ön başvurunuz alındı", html);
}

export async function sendApplicationVerificationEmail(payload: VerificationEmailPayload) {
  const html = brandedTemplate(
    "Başvurunu doğrula",
    `
      <p style="margin:0 0 16px;">Merhaba <strong>${payload.firstName}</strong>,</p>
      <p style="margin:0 0 8px;"><strong>${payload.workshopTitle}</strong> başvurunun sayılması için aşağıdaki kodu form ekranında gir:</p>
      ${codeBlock(payload.code)}
      <p style="margin:0;color:#5a6e5e;font-size:13px;text-align:center;">Bu kod <strong>15 dakika</strong> boyunca geçerlidir.</p>
    `
  );
  return sendMail(payload.to, "Yıldız Tenis doğrulama kodu", html);
}

export async function sendApplicationAcceptedEmail(payload: WorkshopEmailPayload) {
  const whatsappBlock = payload.whatsappLink
    ? `
      <table cellpadding="0" cellspacing="0" style="background:#dcf8c6;border-radius:10px;width:100%;margin:20px 0;">
        <tr><td style="padding:16px 20px;">
          <p style="margin:0 0 8px;font-size:14px;font-weight:600;color:#1a2e1e;">📱 WhatsApp Grubuna Katıl</p>
          <p style="margin:0 0 12px;font-size:13px;color:#5a6e5e;">Workshop iletişimi için WhatsApp grubuna katılmayı unutma:</p>
          <a href="${payload.whatsappLink}" style="display:inline-block;background:#25D366;color:#ffffff;font-size:14px;font-weight:600;padding:10px 24px;border-radius:8px;text-decoration:none;">WhatsApp Grubuna Katıl</a>
        </td></tr>
      </table>
    `
    : "";

  const html = brandedTemplate(
    "Asil listeye kabul edildin! 🎾",
    `
      <p style="margin:0 0 16px;">Merhaba <strong>${payload.firstName}</strong>,</p>
      <p style="margin:0 0 20px;">Tebrikler! <strong>${payload.workshopTitle}</strong> asil listesine kabul edildin.</p>
      <table cellpadding="0" cellspacing="0" style="background:#f0f8f0;border-radius:10px;border-left:4px solid #007405;width:100%;margin:0 0 20px;">
        <tr><td style="padding:16px 20px;">
          <table cellpadding="0" cellspacing="0" width="100%">
            ${infoRow("Workshop", payload.workshopTitle)}
            ${infoRow("Tarih", payload.workshopDate)}
            ${infoRow("Durum", '<span style="color:#007405;font-weight:700;">Asil Liste ✓</span>')}
          </table>
        </td></tr>
      </table>
      ${whatsappBlock}
      <p style="margin:0;color:#5a6e5e;font-size:13px;">Detaylar ve hazırlık bilgileri kısa süre içinde paylaşılacak.</p>
    `
  );
  return sendMail(payload.to, "Workshop asil listesine kabul edildiniz", html);
}

export async function sendAdminLoginCodeEmail(payload: AdminLoginCodePayload) {
  const html = brandedTemplate(
    "Admin giriş kodu",
    `
      <p style="margin:0 0 8px;">Yıldız Tenis admin paneline giriş için doğrulama kodun:</p>
      ${codeBlock(payload.code)}
      <p style="margin:0;color:#5a6e5e;font-size:13px;text-align:center;">Bu kod <strong>10 dakika</strong> boyunca geçerlidir.</p>
      <p style="margin:16px 0 0;color:#8a6050;font-size:12px;">Bu işlemi sen başlatmadıysan şifreni hemen değiştir.</p>
    `
  );
  return sendMail(payload.to, "Yıldız Tenis admin giriş kodu", html);
}
