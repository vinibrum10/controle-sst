const nodemailer = require("nodemailer");

let transporter;
let transporterConfigurado = false;

function getTransporter() {
  if (transporterConfigurado) return transporter;
  transporterConfigurado = true;

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    transporter = null;
    return transporter;
  }

  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS }
  });

  return transporter;
}

// Envia um e-mail via SMTP. Nunca lanca erro: registra a falha no log e
// retorna { sucesso: false } para que o chamador possa seguir normalmente.
async function enviarEmail({ to, subject, text }) {
  if (!to) {
    console.error("Envio de e-mail ignorado: destinatario nao informado.");
    return { sucesso: false, motivo: "destinatario-ausente" };
  }

  const transporte = getTransporter();
  if (!transporte) {
    console.error("Envio de e-mail ignorado: configure SMTP_HOST, SMTP_PORT, SMTP_USER e SMTP_PASS.");
    return { sucesso: false, motivo: "smtp-nao-configurado" };
  }

  try {
    await transporte.sendMail({
      from: process.env.MAIL_FROM || process.env.SMTP_USER,
      to,
      subject,
      text
    });
    return { sucesso: true };
  } catch (err) {
    console.error("Falha ao enviar e-mail para", to, ":", err);
    return { sucesso: false, motivo: "erro-envio" };
  }
}

module.exports = { enviarEmail };
