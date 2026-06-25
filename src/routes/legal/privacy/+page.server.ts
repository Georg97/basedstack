import { gdprConfig, isConfigured } from "$lib/gdpr/config";
import { generateRopa } from "$lib/gdpr/ropa";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async () => {
  return {
    config: gdprConfig,
    ropa: generateRopa(),
    configured: isConfigured(),
  };
};
