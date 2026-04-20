import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../../app.js";
import db from "../../services/database.js";
import User from "../../models/user.js";

describe("Get Users", () => {
  beforeAll(async () => {
    console.log("Connecting to database before tests");
    await db.ensureConnected();
  });

  beforeEach(async () => {
    console.log("Clean the database before test.");
    await User.deleteMany({});
  });

  afterAll(async () => {
    console.log("Closing connection after test.");
    await db.disconnect();
  });

  it("should get all users in array", async () => {
    console.log("Starting test");
    const adminUser = await User.create({ email: "admin@test.com", passwordHash: "adminpass", role: "admin" });
    const token = jwt.sign({ userId: adminUser._id }, process.env.PRIVATE_KEY || "SECRET");

    const expected = { email: "foo@bar.com", passwordHash: "foobar", role: "user" };
    await User.create(expected);
    delete expected._id;

    const res = await request(app).get("/read/users").set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toEqual(2);
    expect(res.body).toEqual(expect.arrayContaining([expect.objectContaining(expected)]));
    console.log("Test done");
  });
});
