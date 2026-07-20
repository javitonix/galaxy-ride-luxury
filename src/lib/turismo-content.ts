import { createClient } from "@supabase/supabase-js";
import { createServerFn } from "@tanstack/react-start";

import type { Database, Tables } from "@/integrations/supabase/types";

export type FleetRecord = Tables<"fleet">;
export type GalleryRecord = Tables<"gallery_items">;
export type TestimonialRecord = Tables<"testimonials">;
export type OfficeLocationRecord = Tables<"office_locations">;
export type ContactRecord = Tables<"contact_information">;
export type SocialLinkRecord = Tables<"social_media_links">;

export type TurismoContent = {
  fleet: FleetRecord[];
  gallery: GalleryRecord[];
  testimonials: TestimonialRecord[];
  locations: OfficeLocationRecord[];
  contact: ContactRecord | null;
  social: SocialLinkRecord[];
};

function createPublicClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    throw new Error("Missing backend environment variables");
  }

  return createClient<Database>(url, key, {
    auth: {
      storage: undefined,
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) {
          headers.delete("Authorization");
        }
        headers.set("apikey", key);
        return fetch(input, { ...init, headers });
      },
    },
  });
}

export const getTurismoContent = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = createPublicClient();

  const [fleetRes, galleryRes, testimonialsRes, locationsRes, contactRes, socialRes] = await Promise.all([
    supabase.from("fleet").select("*").order("sort_order", { ascending: true }),
    supabase
      .from("gallery_items")
      .select("*")
      .eq("is_published", true)
      .order("sort_order", { ascending: true }),
    supabase
      .from("testimonials")
      .select("*")
      .eq("is_published", true)
      .order("sort_order", { ascending: true }),
    supabase.from("office_locations").select("*").order("sort_order", { ascending: true }),
    supabase.from("contact_information").select("*").limit(1).maybeSingle(),
    supabase.from("social_media_links").select("*").order("sort_order", { ascending: true }),
  ]);

  const errors = [
    fleetRes.error,
    galleryRes.error,
    testimonialsRes.error,
    locationsRes.error,
    contactRes.error,
    socialRes.error,
  ].filter(Boolean);

  if (errors.length > 0) {
    throw new Error(errors.map((error) => error?.message).join(" | "));
  }

  return {
    fleet: fleetRes.data ?? [],
    gallery: galleryRes.data ?? [],
    testimonials: testimonialsRes.data ?? [],
    locations: locationsRes.data ?? [],
    contact: contactRes.data ?? null,
    social: socialRes.data ?? [],
  } satisfies TurismoContent;
});