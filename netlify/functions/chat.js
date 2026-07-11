// netlify/functions/chat.js
import fetch from "node-fetch";

const must = (v, name) => {
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
};

const onlyDigits = (s) => (s || "").replace(/\D+/g, "");
const PHONE_REGEX = /\b(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g;

export async function handler(event) {
  try {
    if (event.httpMethod !== "POST") {
      return { statusCode: 405, body: "Method Not Allowed" };
    }

    const endpoint   = must(process.env.AZURE_OPENAI_ENDPOINT, "AZURE_OPENAI_ENDPOINT");
    const apiKey     = must(process.env.AZURE_OPENAI_KEY, "AZURE_OPENAI_KEY");
    const deployment = must(process.env.AZURE_OPENAI_DEPLOYMENT, "AZURE_OPENAI_DEPLOYMENT");
    const apiVersion = process.env.API_VERSION || "2024-10-21";

    // ✅ Set these in Netlify → Site settings → Environment variables
    const COMPANY_PHONE = process.env.COMPANY_PHONE || "";          // e.g. "(803) 555-6789"
    const CONTACT_URL   = process.env.CONTACT_URL   || "/contact";  // your contact page

    const parsed = JSON.parse(event.body || "{}");
    const userMessages = Array.isArray(parsed.messages) ? parsed.messages : [];

    // Always prepend a strict system message (prevents “made-up” info)
    const system = {
      role: "system",
      content:
        `You are Llenroc Tech’s website assistant. Be concise and helpful.
         RULES:
         - Never invent phone numbers, emails, addresses, prices, or links.
         - If asked for a phone number and none is configured, say you don't have it
           and direct the user to ${CONTACT_URL}.
         - If a phone number is configured, use it exactly as provided.
         CONFIG:
         COMPANY_PHONE=${COMPANY_PHONE}`,
    };

    const defaultConversation = [
      system,
      { role: "user", content: "Hello!" },
    ];

    const messages = userMessages.length
      ? [system, ...userMessages]
      : defaultConversation;

    const payload = {
      messages,
      max_tokens: 300,
      temperature: 0.2,  // lower = less “creative” hallucinations
    };

    const url = `${endpoint}/openai/deployments/${encodeURIComponent(deployment)}/chat/completions?api-version=${apiVersion}`;
    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "api-key": apiKey },
      body: JSON.stringify(payload),
    });

    const text = await resp.text();
    if (!resp.ok) {
      console.error("Azure OpenAI error:", resp.status, text);
      return {
        statusCode: 502,
        body: JSON.stringify({ error: "Azure OpenAI error", status: resp.status, details: text }),
      };
    }

    let data;
    try { data = JSON.parse(text); } catch (e) {
      return { statusCode: 502, body: JSON.stringify({ error: "Bad JSON from Azure", raw: text }) };
    }

    let reply = data?.choices?.[0]?.message?.content;
    if (!reply) {
      console.error("No content in Azure response:", data);
      return { statusCode: 502, body: JSON.stringify({ error: "No content in Azure response", data }) };
    }

    // ✅ Post-process: block any phone number that isn't YOURS
    const allowedDigits = onlyDigits(COMPANY_PHONE);
    reply = reply.replace(PHONE_REGEX, (m) => {
      if (!allowedDigits) {
        // No configured phone — never show any numbers
        return "[phone redacted — please use our contact page]";
      }
      const matchDigits = onlyDigits(m);
      // Compare last 10 digits to allow various formats of your number
      const last10 = (s) => s.slice(-10);
      return last10(matchDigits) === last10(allowedDigits) ? m : "[phone redacted]";
    });

    // If the model wanted to give a number but we redacted it, add a friendly pointer
    if (reply.includes("[phone redacted]") && !COMPANY_PHONE) {
      reply += `\n\nI don’t have a phone number on file—please reach us via ${CONTACT_URL}.`;
    }

    return { statusCode: 200, body: JSON.stringify({ reply }) };
  } catch (err) {
    console.error("Function error:", err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message || String(err) }) };
  }
}
