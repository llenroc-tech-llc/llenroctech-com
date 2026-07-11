import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import fetch from "node-fetch";

// Prefer Managed Identity. Flip USE_MANAGED_IDENTITY=true in App Settings to enable
const useMI = (process.env.USE_MANAGED_IDENTITY || "true").toLowerCase() === "true";

const siteId = must(process.env.SP_SITE_ID, "SP_SITE_ID");
// Map formType → env var name that holds the SharePoint list ID
const LIST_MAP: Record<string,string> = {
  "data-mapping":        must(process.env.SP_LIST_DATA_MAPPING_ID, "SP_LIST_DATA_MAPPING_ID"),
  "cookies-tracking":    must(process.env.SP_LIST_COOKIES_TRACKING_ID, "SP_LIST_COOKIES_TRACKING_ID"),
  "dsr-log":             must(process.env.SP_LIST_DSR_LOG_ID, "SP_LIST_DSR_LOG_ID"),
  "lawful-basis":        must(process.env.SP_LIST_LAWFUL_BASIS_ID, "SP_LIST_LAWFUL_BASIS_ID"),
  "privacy-policy":      must(process.env.SP_LIST_PRIVACY_POLICY_ID, "SP_LIST_PRIVACY_POLICY_ID"),
  // add more as needed
};

function must(v?: string, name?: string) {
  if (!v) throw new Error(`Missing app setting: ${name}`);
  return v;
}

async function getGraphToken(): Promise<string> {
  if (useMI) {
    // Managed Identity (assign System-Assigned identity, grant Sites.Selected on Graph + site permission)
    const resource = "https://graph.microsoft.com";
    const resp = await fetch(`${process.env.IDENTITY_ENDPOINT}?resource=${resource}&api-version=2019-08-01`, {
      headers: { "X-IDENTITY-HEADER": must(process.env.IDENTITY_HEADER, "IDENTITY_HEADER") }
    });
    if (!resp.ok) throw new Error(`MI token error ${resp.status}`);
    const j = await resp.json();
    return j.access_token;
  } else {
    // Client credentials fallback
    const tenant = must(process.env.AAD_TENANT_ID, "AAD_TENANT_ID");
    const clientId = must(process.env.AAD_CLIENT_ID, "AAD_CLIENT_ID");
    const clientSecret = must(process.env.AAD_CLIENT_SECRET, "AAD_CLIENT_SECRET");
    const body = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      scope: "https://graph.microsoft.com/.default",
      grant_type: "client_credentials"
    });
    const resp = await fetch(`https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`, {
      method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body
    });
    if (!resp.ok) throw new Error(`Token error ${resp.status}`);
    const j = await resp.json();
    return j.access_token;
  }
}

export default async function handler(req: HttpRequest, ctx: InvocationContext): Promise<HttpResponseInit> {
  try {
    const formType = req.params["formType"];
    if (!formType || !LIST_MAP[formType]) {
      return { status: 400, jsonBody: { error: "Unknown formType" } };
    }

    const payload = await req.json() as Record<string, any>; // your form fields (key → value)
    // Ensure Title is set; SharePoint lists generally expect it (or make Title column not required)
    if (!payload.Title) payload.Title = `[${formType}] ${new Date().toISOString()}`;

    const token = await getGraphToken();
    const resp = await fetch(
      `https://graph.microsoft.com/v1.0/sites/${siteId}/lists/${LIST_MAP[formType]}/items`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ fields: payload })
      }
    );

    const data = await resp.json();
    if (!resp.ok) {
      ctx.error("Graph error", data);
      return { status: resp.status, jsonBody: data };
    }
    return { status: 201, jsonBody: { ok: true, id: data.id } };
  } catch (e: any) {
    ctx.error(e?.message || e);
    return { status: 500, jsonBody: { error: e?.message || "Server error" } };
  }
}

app.http("submit-form", {
  methods: ["POST"],
  authLevel: "function",
  route: "submit-form/{formType}",
  handler
});
