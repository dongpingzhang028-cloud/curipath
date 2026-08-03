import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/index.js";

const prisma = new PrismaClient();
const apiKey = process.env.GOOGLE_PLACES_API_KEY;

if (!apiKey) {
  console.error("Missing GOOGLE_PLACES_API_KEY in .env — see README for setup.");
  process.exit(1);
}

type PlaceResult = {
  id: string;
  rating?: number;
  userRatingCount?: number;
  displayName?: { text: string };
};

async function findPlace(query: string): Promise<PlaceResult | null> {
  const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey!,
      "X-Goog-FieldMask": "places.id,places.rating,places.userRatingCount,places.displayName",
    },
    body: JSON.stringify({ textQuery: query, maxResultCount: 1 }),
  });

  if (!res.ok) {
    throw new Error(`Places API ${res.status}: ${await res.text()}`);
  }

  const data = await res.json();
  return data.places?.[0] ?? null;
}

async function main() {
  const providers = await prisma.provider.findMany({
    select: { id: true, name: true, address: true, location: true },
    orderBy: { name: "asc" },
  });

  let updated = 0;
  let skipped = 0;
  let failed = 0;

  for (const provider of providers) {
    const query = `${provider.name}, ${provider.address ?? provider.location}`;
    try {
      const place = await findPlace(query);
      if (!place || place.rating == null) {
        console.log(`No Google rating found: ${provider.name}`);
        skipped++;
        continue;
      }

      await prisma.provider.update({
        where: { id: provider.id },
        data: {
          googleRating: place.rating,
          placeId: place.id,
          ratingSource: "google",
          ratingSyncedAt: new Date(),
        },
      });
      console.log(`Updated ${provider.name}: ${place.rating}★ (${place.userRatingCount ?? "?"} reviews)`);
      updated++;
    } catch (err) {
      console.error(`Failed: ${provider.name} —`, err instanceof Error ? err.message : err);
      failed++;
    }

    // Be polite to the API rather than firing requests back-to-back.
    await new Promise((r) => setTimeout(r, 200));
  }

  console.log(`\nDone. Updated: ${updated}, No rating found: ${skipped}, Failed: ${failed}`);
  await prisma.$disconnect();
}

main();
