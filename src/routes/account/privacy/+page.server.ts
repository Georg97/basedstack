import { fail, redirect } from "@sveltejs/kit";
import { registry } from "$lib/gdpr/registry";
import { eraseUserData, listRequests, recordRequest } from "$lib/gdpr";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user) redirect(302, "/login");

  return {
    requests: await listRequests(locals.user.id),
    // What we hold about you, summarised from the registry — drives the dashboard list.
    holdings: registry.records
      .filter((r) => r.export !== false)
      .map((r) => ({
        key: r.key,
        purpose: r.purpose ?? null,
        lawfulBasis: r.lawfulBasis ?? null,
        retention: r.retention ?? null,
      })),
  };
};

export const actions: Actions = {
  // Erasure (Art. 17). Requires the user to type DELETE to confirm.
  erase: async ({ locals, request, getClientAddress }) => {
    if (!locals.user) redirect(302, "/login");

    const form = await request.formData();
    if (String(form.get("confirm") ?? "") !== "DELETE") {
      return fail(400, { error: "Type DELETE to confirm." });
    }

    let ipAddress: string | null = null;
    try {
      ipAddress = getClientAddress();
    } catch {
      ipAddress = null;
    }

    await recordRequest(locals.user.id, "erasure");
    await eraseUserData(locals.user.id, { ipAddress });

    // The session row is gone now; send them home with a flag for a toast.
    redirect(303, "/?erased=1");
  },
};
