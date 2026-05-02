import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY!);

// ✅ FIX: use object params (SaaS style)
export async function sendAbandonedEmail({
  email,
  checkoutUrl,
}: {
  email: string;
  checkoutUrl: string;
}) {
  const html = `
    <div style="font-family: Arial; padding:20px;">
      <h2>🛒 أكمل طلبك</h2>

      <p>لقد لاحظنا أنك لم تكمل عملية الشراء.</p>

      <p>اضغط على الزر أدناه لإكمال طلبك 👇</p>

      <a href="${checkoutUrl}" 
         style="display:inline-block; padding:12px 20px; background:black; color:white; text-decoration:none; border-radius:8px;">
         إكمال الدفع
      </a>

      <p style="margin-top:20px; color:gray;">
        إذا لم تكن أنت، تجاهل هذا البريد.
      </p>
    </div>
  `;

  await resend.emails.send({
    from: "AmkaAI <onboarding@resend.dev>",
    to: email,
    subject: "أكمل طلبك الآن 🚀",
    html,
  });
}