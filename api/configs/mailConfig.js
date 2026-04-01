import nodemailer from "nodemailer";

export const mailConfig = async (
  toemls = [],
  ccemls = [],
  bccemls = [],
  subjct,
  maildtl,
  mailContent = []
) => {
  const from_name = `Shyam Metalics`;
  const from_email = process.env.EMAIL_USR;

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    service: "outlook",
    secure: false,
    auth: {
      user: process.env.EMAIL_USR,
      pass: process.env.EMAIL_PASS,
    },
  });

  if (typeof maildtl !== "string") {
    throw new Error("Email HTML must be a string");
  }

  const mailOptions = {
    from: `${from_name} <${from_email}>`,
    to: toemls,
    cc: ccemls,
    bcc: bccemls,
    subject: subjct,
    html: maildtl,

    attachments: Array.isArray(mailContent) ? mailContent.map(img => ({
      filename: img.filename,
      content: img.content,
      contentType: img.contentType,
      cid: img.cid,
      disposition: "inline",
    })) : []
  };

  const info = await transporter.sendMail(mailOptions);
  console.log("📨 Mail sent:", info.response);
  return info.response;
};
