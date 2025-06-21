const invokedFromCli = import.meta.url === `file://${process.argv[1]}`;

const seed = async () => {
  console.log("Starting seeder...");
  await seedUsers();
  console.log("Seeding complete.");
};

const seedUsers = async () => {
  console.log("Starting user seeding...");

  const User = await import("./models/user.js");
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

  try {
    const db = await import("./services/database.js");
    await db.ensureConnected();

    // Remove any existing users
    // console.log('Deleting existing users...');

    // await User.deleteMany({}).exec()
    //   .then((response) => {
    //     console.log(`Removed ${response.deletedCount} existing users.`);
    //   })
    //   .catch((err) => {
    //     console.error('FAILED to delete users!', err);
    //     throw err;
    //   });

    // Create new users
    console.log("Seeding new users...");
    for (const template of templates) {
      if (await User.findOne({ email: template.email }).exec()) {
        console.log(
          "User already exists, skipping seeding of:",
          template.email
        );
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
  } catch (err) {
    console.error("Aborting user seeder! Unexpected error:", err);
  }
};

// Top-level auto-execution in case this file is run directly from the CLI
if (invokedFromCli) {
  const dotenv = await import("dotenv");
  const dotEnvOutput = dotenv.config();
  if (dotEnvOutput.error)
    console.error("Error parsing .env file!", dotEnvOutput.error);

  const mongoose = await import("mongoose");
  const dbUri = process.env["MONGO_URL"] || "mongodb://gatewaydb:27017/users";

  const dbNotConnected = (mongoose.connection.readyState !== 1) | 2;
  if (dbNotConnected) {
    console.log("Connecting to MongoDB...");
    try {
      await mongoose.connect(dbUri);
      console.log("✅ MongoDB connected for seeding");

      try {
        await seed();
        console.log("🌱 Seeding completed");
      } catch (seedErr) {
        console.error("❌ Seeding failed:", seedErr);
      }

      try {
        await mongoose.connection.close();
        console.log("🔌 MongoDB connection closed");
      } catch (closeErr) {
        console.error("⚠️ Failed to close connection:", closeErr);
      }
    } catch (connErr) {
      console.error("❌ Error connecting to MongoDB:", connErr);
    }
  } else {
    console.log("MongoDB already connected, skipping connection...");
    seed();
  }
}

export default seed;
