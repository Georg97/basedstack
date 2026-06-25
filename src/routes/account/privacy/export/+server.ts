import { error } from "@sveltejs/kit";
import { audit, exportUserData, recordRequest } from "$lib/gdpr";
import type { RequestHandler } from "./$types";

// GET /account/privacy/export → downloads the signed-in user's data as JSON.
// A plain GET endpoint (not a form action) so the browser performs a file download.
export const GET: RequestHandler = async ({ locals, getClientAddress }) => {
  if (!locals.user) error(401, "Not signed in");

  const data = await exportUserData(locals.user.id);
  await recordRequest(locals.user.id, "export");

  let ipAddress: string | null = null;
  try {
    ipAddress = getClientAddress();
  } catch {
    ipAddress = null;
  }
  await audit({ subject: locals.user.id, event: "data.exported", ipAddress });

  const body = JSON.stringify(data, null, 2);
  const filename = `my-data-${data.generatedAt.slice(0, 10)}.json`;

  return new Response(body, {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "content-disposition": `attachment; filename="${filename}"`,
    },
  });
};
