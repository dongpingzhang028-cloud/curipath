import { PrismaClient } from "../src/generated/prisma";

const prisma = new PrismaClient();

const categories = [
  { name: "Art & Craft", slug: "art-craft", icon: "🎨" },
  { name: "Sports & Fitness", slug: "sports-fitness", icon: "⚽" },
  { name: "Music", slug: "music", icon: "🎵" },
  { name: "Coding & STEM", slug: "coding-stem", icon: "💻" },
  { name: "Dance", slug: "dance", icon: "💃" },
  { name: "Swim", slug: "swim", icon: "🏊" },
  { name: "Academic", slug: "academic", icon: "📚" },
  { name: "Outdoors & Nature", slug: "outdoors-nature", icon: "🌳" },
];

const providers = [
  {
    name: "Bright Minds Academy",
    bio: "Paint, sculpt, and imagine! Bright Minds gives kids of every age a colorful space to create alongside real working artists.",
    imageUrl: "https://images.unsplash.com/photo-1512253080918-79cf0c2e0650?w=400&h=250&fit=crop",
    location: "Austin, TX",
    address: "301 Congress Ave, Austin, TX 78701",
    categorySlug: "art-craft",
  },
  {
    name: "Kinetic Sports Club",
    bio: "Run, jump, and play! Kinetic Sports Club builds confidence and teamwork through fun, energetic coaching for kids of every skill level.",
    imageUrl: "https://images.unsplash.com/photo-1700914297434-4dad8d710262?w=400&h=250&fit=crop",
    location: "Denver, CO",
    address: "1600 Glenarm Pl, Denver, CO 80202",
    categorySlug: "sports-fitness",
  },
  {
    name: "Harmony Music Studio",
    bio: "Tap your toes and find your sound! Kids explore piano, guitar, and voice with patient, encouraging teachers in a low-pressure studio.",
    imageUrl: "https://images.unsplash.com/photo-1540593463874-59835505e99d?w=400&h=250&fit=crop",
    location: "Nashville, TN",
    address: "150 4th Ave N, Nashville, TN 37219",
    categorySlug: "music",
  },
  {
    name: "Arena Sports Remond",
    bio: "Soccer, laughter, and the Inflatable FunZone! Arena Sports keeps kids of every age moving, playing, and making friends.",
    imageUrl: "https://images.unsplash.com/photo-1526232761682-d26e03ac148e?w=400&h=250&fit=crop",
    location: "Redmond, WA",
    address: "9040 Willows Road NE, Redmond, WA 98052",
    keywords: ["soccer", "game"],
    categorySlug: "sports-fitness",
  },
  {
    name: "Rhythm & Motion Dance",
    bio: "A welcoming dance studio offering ballet, hip-hop, and jazz for every skill level.",
    imageUrl: "https://picsum.photos/seed/rhythm-motion/200/200",
    location: "Chicago, IL",
    address: "233 S Wacker Dr, Chicago, IL 60606",
    categorySlug: "dance",
  },
];

async function main() {
  console.log("Seeding database...");

  await prisma.savedProvider.deleteMany();
  await prisma.calendarSync.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.provider.deleteMany();
  await prisma.category.deleteMany();
  await prisma.child.deleteMany();
  await prisma.user.deleteMany();

  const categoryMap = new Map<string, string>();
  for (const c of categories) {
    const created = await prisma.category.create({ data: c });
    categoryMap.set(c.slug, created.id);
  }

  for (const { categorySlug, ...p } of providers) {
    await prisma.provider.create({
      data: { ...p, categoryId: categoryMap.get(categorySlug) },
    });
  }

  console.log(`Seeded ${categories.length} categories, ${providers.length} providers.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
