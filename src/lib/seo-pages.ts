// Definitions for the /classes/[city]/[category] SEO landing pages:
// 10 cities x 8 categories. City slugs map to the exact Provider.location
// strings, and each category gets a search-shaped phrase ("Kids Swim
// Lessons", not "Swim Classes") used in titles, H1s and descriptions.

export type SeoCity = { slug: string; name: string; location: string };

export const SEO_CITIES: SeoCity[] = [
  { slug: "bellevue", name: "Bellevue", location: "Bellevue, WA" },
  { slug: "bothell", name: "Bothell", location: "Bothell, WA" },
  { slug: "issaquah", name: "Issaquah", location: "Issaquah, WA" },
  { slug: "kirkland", name: "Kirkland", location: "Kirkland, WA" },
  { slug: "mercer-island", name: "Mercer Island", location: "Mercer Island, WA" },
  { slug: "redmond", name: "Redmond", location: "Redmond, WA" },
  { slug: "sammamish", name: "Sammamish", location: "Sammamish, WA" },
  { slug: "seattle", name: "Seattle", location: "Seattle, WA" },
  { slug: "shoreline", name: "Shoreline", location: "Shoreline, WA" },
  { slug: "woodinville", name: "Woodinville", location: "Woodinville, WA" },
];

// How parents actually search: "swim lessons", "music lessons", but
// "dance classes", "art classes". Keyed by category slug.
export const CATEGORY_PHRASES: Record<string, string> = {
  sports: "Kids Sports Classes",
  arts: "Kids Art Classes",
  music: "Kids Music Lessons",
  dance: "Kids Dance Classes",
  enrichment: "Kids Enrichment Classes",
  "performing-arts": "Kids Performing Arts Classes",
  swim: "Kids Swim Lessons",
  camps: "Kids Camps",
};

export function cityBySlug(slug: string): SeoCity | undefined {
  return SEO_CITIES.find((c) => c.slug === slug);
}
