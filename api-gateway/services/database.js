const mongoose = require("mongoose");
const mongoUri = process.env.MONGO_URL || "mongodb://gatewaydb:27017/users";

mongoose
  .connect(mongoUri)
  .then(() => {
    console.log("Connected to MongoDB");
    require("./seed")();
  })
  .catch((err) => console.error("Error connecting to MongoDB:", err));

module.exports = mongoose;
