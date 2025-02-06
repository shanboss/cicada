import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req) {
  try {
    const { email, firstName } = await req.json();

    const { error } = await resend.emails.send({
      from: "manushanboss@gmail.com",
      to: email,
      subject: "Welcome to Our Community!",
      html: `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
      <h2>Hi ${firstName},</h2>
      <p>Thanks for joining our community! 🎉</p>
      <p>We'll keep you updated with our latest news.</p>
      <p>Best,<br/>The Team</p>
    </div>
  `,
    });

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
      });
    }

    return new Response(JSON.stringify({ message: "Email sent!" }), {
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}
