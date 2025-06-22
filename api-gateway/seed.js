const invokedFromCli = import.meta.url === `file://${process.argv[1]}`;

const seed = async () => {
  console.log("Starting seeder...");
  await seedUsers().catch((seedErr) =>
    console.error("❌ User seeding failed:", seedErr)
  );
  console.log("🌱 Seed finished");
};

const seedUsers = async () => {
  console.log("Starting user seeding...");

  const { default: User } = await import("./models/user.js");
  const bcrypt = await import("bcrypt");
  const saltRounds = 10;

  const templates = [
    {
      email: "freek@mail.nl",
      passwordHash: await bcrypt.hash("test", saltRounds),
      role: "user",
    },
    {
      email: "admin@mail.nl",
      passwordHash: await bcrypt.hash("admin", saltRounds),
      role: "admin",
    },
  ];

  const { default: db } = await import("./services/database.js");
  await db.ensureConnected();

  // Create new users
  console.log("Seeding new users...");
  for (const template of templates) {
    if (await User.findOne({ email: template.email }).exec()) {
      console.log("User already exists, skipping seeding of:", template.email);
      continue;
    }
    await new User(template)
      .save()
      .then((response) => {
        console.log("User seeded successfully:", response);
      })
      .catch((err) => {
        console.error("FAILED to seed user!", err);
      });
  }

  console.log("User seeding complete.");
};

// Top-level auto-execution in case this file is run directly from the CLI
if (invokedFromCli) {
  console.log("Running seeder from CLI...");

  await seed();
}

export default seed;
