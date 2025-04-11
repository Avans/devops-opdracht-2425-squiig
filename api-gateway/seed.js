const invokedFromCli = require.main === module;

const seedUsers = async () => {
  console.log("Starting user seeder...");

  const User = require("./models/user");
  const bcrypt = require("bcrypt");
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

if (invokedFromCli) {
  const dotEnvOutput = require("dotenv").config();
  if (dotEnvOutput.error)
    console.error("Error parsing .env file!", dotEnvOutput.error);
  const mongoose = require("mongoose");
  const dbUri = process.env["MONGO_URL"] || "mongodb://gatewaydb:27017/users";

  if ((mongoose.connection.readyState !== 1) | 2) {
    console.log("Connecting to MongoDB...");
    mongoose
      .connect(dbUri)
      .then(() => {
        console.log("MongoDB connected for seeding");
        return seedUsers();
      })
      .then(() => {
        return mongoose.connection.close();
      })
      .catch((err) => {
        console.error("Error connecting to MongoDB:", err);
      });
  } else {
    console.log("MongoDB already connected, skipping connection...");
    seedUsers();
  }
} else {
  module.exports = seedUsers;
}
