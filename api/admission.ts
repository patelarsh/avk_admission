import nodemailer from "nodemailer";

function validateSmtpEnv() {
  const required = [
    "SMTP_HOST",
    "SMTP_PORT",
    "SMTP_USER",
    "SMTP_PASS",
    "SMTP_FROM"
  ];

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length) {
    throw new Error(`Missing SMTP environment variables: ${missing.join(", ")}`);
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const formData = req.body;

  if (!formData?.email || !formData?.studentName) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    validateSmtpEnv();

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_PORT === "465",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.verify();

    const adminEmail = process.env.ADMIN_EMAIL || "admission@ashishvidhyalay.com";
    const fromEmail = process.env.SMTP_FROM || "Ashish Vidhyalay <noreply@ashishvidhyalay.com>";

    const applicantMailOptions = {
      from: fromEmail,
      to: formData.email,
      subject: "Admission Application Received - Ashish Vidhyalay",
      html: `
          <div style="font-family: sans-serif; line-height: 1.6; color: #333;">
            <h2 style="color: #1e40af;">નમસ્તે ${formData.studentName},</h2>
            <p>આશિષ વિદ્યાલયમાં પ્રવેશ માટેની તમારી અરજી અમને મળી છે.</p>
            <p>અમારી ટીમ ટૂંક સમયમાં તમારી સાથે સંપર્ક કરશે.</p>
            <hr />
            <h3>અરજીની વિગતો:</h3>
            <ul>
              <li><strong>વિદ્યાર્થીનું નામ:</strong> ${formData.studentName}</li>
              <li><strong>ધોરણ:</strong> ${formData.grade}</li>
              <li><strong>મોબાઈલ નંબર:</strong> ${formData.mobile}</li>
            </ul>
            <p>આભાર,<br />આશિષ વિદ્યાલય, કેશરપુરા</p>
          </div>
        `,
    };

    const adminMailOptions = {
      from: fromEmail,
      to: adminEmail,
      subject: `New Admission Application: ${formData.studentName} (${formData.grade})`,
      html: `
          <div style="font-family: sans-serif; line-height: 1.6; color: #333;">
            <h2 style="color: #1e40af;">New Admission Request</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Student Name</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${formData.studentName}</td></tr>
              <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Grade</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${formData.grade}</td></tr>
              <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Gender</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${formData.gender}</td></tr>
              <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>DOB</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${formData.dob}</td></tr>
              <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Mobile</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${formData.mobile}</td></tr>
              <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Address</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${formData.address}</td></tr>
              <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Other Village</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${formData.otherVillage || "N/A"}</td></tr>
              <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Email</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${formData.email}</td></tr>
            </table>
          </div>
        `,
    };

    await Promise.all([
      transporter.sendMail(applicantMailOptions),
      transporter.sendMail(adminMailOptions),
    ]);

    return res.status(200).json({ success: true, message: "Application submitted successfully" });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Email sending error:", message);
    return res.status(500).json({ error: "Failed to send emails. Please check SMTP configuration." });
  }
}
