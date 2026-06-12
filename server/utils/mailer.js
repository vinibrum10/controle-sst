const nodemailer = require("nodemailer");

const { SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env;

const emailHabilitado = Boolean(SMTP_HOST && SMTP_USER && SMTP_PASS);

const transporter = emailHabilitado
  ? nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT) || 587,
      secure: SMTP_SECURE === "true",
      auth: { user: SMTP_USER, pass: SMTP_PASS }
    })
  : null;

const remetente = SMTP_FROM || SMTP_USER || "no-reply@sgepi.local";

// Envia um e-mail de notificacao. Se o SMTP nao estiver configurado, apenas
// registra a tentativa no log (sem expor credenciais) e retorna enviado: false.
async function enviarEmail({ to, subject, text, html }) {
  if (!to) {
    return { enviado: false, motivo: "Destinatario sem e-mail cadastrado." };
  }

  if (!emailHabilitado) {
    console.log(`[email] SMTP nao configurado - notificacao "${subject}" nao enviada para ${to}.`);
    return { enviado: false, motivo: "Envio automatico de e-mail nao configurado (defina as variaveis SMTP_*)." };
  }

  try {
    await transporter.sendMail({ from: remetente, to, subject, text, html });
    console.log(`[email] Notificacao "${subject}" enviada para ${to}.`);
    return { enviado: true };
  } catch (err) {
    console.error(`[email] Falha ao enviar notificacao "${subject}" para ${to}:`, err.message);
    return { enviado: false, motivo: "Falha ao enviar o e-mail de notificacao." };
  }
}

module.exports = { enviarEmail, emailHabilitado };
