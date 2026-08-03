import "dotenv/config";
import { writeFileSync } from "fs";
import { PrismaClient } from "../src/generated/prisma/index.js";

const prisma = new PrismaClient();
const apiKey = process.env.GOOGLE_PLACES_API_KEY;

if (!apiKey) {
  console.error("Missing GOOGLE_PLACES_API_KEY in .env");
  process.exit(1);
}

type Review = {
  text?: { text: string };
  rating?: number;
  relativePublishTimeDescription?: string;
};

async function getReviews(placeId: string): Promise<Review[]> {
  const res = await fetch(`https://places.googleapis.com/v1/places/${placeId}`, {
    headers: {
      "X-Goog-Api-Key": apiKey!,
      "X-Goog-FieldMask": "reviews",
    },
  });
  if (!res.ok) {
    throw new Error(`Place Details ${res.status}: ${await res.text()}`);
  }
  const data = await res.json();
  return data.reviews ?? [];
}

async function main() {
  const providers = await prisma.provider.findMany({
    where: { placeId: { not: null } },
    select: { id: true, name: true, placeId: true },
    orderBy: { name: "asc" },
  });

  const results: Record<string, { name: string; reviews: { text: string; rating?: number; when?: string }[] }> = {};
  let done = 0;
  let failed = 0;

  for (const p of providers) {
    try {
      const reviews = await getReviews(p.placeId!);
      results[p.id] = {
        name: p.name,
        reviews: reviews
          .filter((r) => r.text?.text)
          .map((r) => ({ text: r.text!.text, rating: r.rating, when: r.relativePublishTimeDescription })),
      };
      console.log(`${p.name}: ${results[p.id].reviews.length} review excerpts`);
      done++;
    } catch (err) {
      console.error(`Failed: ${p.name} —`, err instanceof Error ? err.message : err);
      failed++;
    }
    await new Promise((r) => setTimeout(r, 150));
  }

  const outPath = process.argv[2] || "scratch_google_reviews.json";
  writeFileSync(outPath, JSON.stringify(results, null, 2));
  console.log(`\nDone. Fetched: ${done}, Failed: ${failed}. Written to ${outPath}`);
  await prisma.$disconnect();
}

main();
