export function getOpenApiDocument() {
  return {
    openapi: "3.0.3",
    info: {
      title: "Cloaka API",
      version: "0.1.0",
      description: "Operational API docs for the current Cloaka backend surface."
    },
    servers: [
      {
        url: "http://localhost:4000"
      }
    ],
    paths: {
      "/api/health": {
        get: {
          summary: "Health check"
        }
      },
      "/api/auth/login": {
        post: {
          summary: "Login with optional TOTP"
        }
      },
      "/api/auth/2fa/setup": {
        post: {
          summary: "Generate TOTP setup payload"
        }
      },
      "/api/recipients/live": {
        get: {
          summary: "List live recipients"
        },
        post: {
          summary: "Create a verified recipient"
        }
      },
      "/api/recipients/import": {
        post: {
          summary: "Preview or import recipients from CSV"
        }
      },
      "/api/notifications": {
        get: {
          summary: "List recent in-app notifications"
        }
      },
      "/api/webhooks/paystack": {
        post: {
          summary: "Handle signed Paystack webhook events"
        }
      }
    }
  };
}

export function renderDocsHtml() {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Cloaka API Docs</title>
    <style>
      body { font-family: Arial, sans-serif; margin: 0; background: #f4f6fb; color: #0f172a; }
      main { max-width: 960px; margin: 0 auto; padding: 40px 24px 80px; }
      .card { background: white; border: 1px solid rgba(15,23,42,.08); border-radius: 24px; padding: 24px; box-shadow: 0 20px 50px rgba(15,23,42,.08); }
      pre { overflow: auto; background: #0d1f38; color: white; padding: 20px; border-radius: 20px; }
      a { color: #2563eb; }
    </style>
  </head>
  <body>
    <main>
      <div class="card">
        <div style="font-size:12px; text-transform:uppercase; letter-spacing:.18em; color:#2563eb;">Cloaka API</div>
        <h1 style="margin-top:16px;">Current operational docs</h1>
        <p>The JSON OpenAPI document for the current backend surface is available at <a href="/api/openapi.json">/api/openapi.json</a>.</p>
        <pre>${JSON.stringify(getOpenApiDocument(), null, 2)}</pre>
      </div>
    </main>
  </body>
</html>`;
}
