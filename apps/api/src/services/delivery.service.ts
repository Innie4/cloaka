import { env } from "../config/env";

export async function sendEmailNotification(input: {
  to: string;
  subject: string;
  html: string;
}) {
  if (!env.SENDGRID_API_KEY || !env.SENDGRID_FROM_EMAIL) {
    return {
      provider: "mock",
      delivered: true
    } as const;
  }

  const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.SENDGRID_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      personalizations: [
        {
          to: [{ email: input.to }]
        }
      ],
      from: {
        email: env.SENDGRID_FROM_EMAIL,
        name: env.SENDGRID_FROM_NAME ?? "Cloaka"
      },
      subject: input.subject,
      content: [
        {
          type: "text/html",
          value: input.html
        }
      ]
    })
  });

  return {
    provider: "sendgrid",
    delivered: response.ok
  } as const;
}

export async function sendSmsNotification(input: {
  to: string;
  message: string;
}) {
  if (!env.TERMII_API_KEY) {
    return {
      provider: "mock",
      delivered: true
    } as const;
  }

  const response = await fetch("https://api.ng.termii.com/api/sms/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      api_key: env.TERMII_API_KEY,
      to: input.to,
      from: env.TERMII_SENDER_ID ?? "Cloaka",
      sms: input.message,
      type: "plain",
      channel: "generic"
    })
  });

  return {
    provider: "termii",
    delivered: response.ok
  } as const;
}
