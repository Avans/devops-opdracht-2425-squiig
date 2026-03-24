import {jest} from '@jest/globals';
import request from "supertest";
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
    const expected = { email: "foo@bar.com", passwordHash: "foobar", role: "user" };
    await User.create(expected);
    delete expected._id;

    const res = await request(app).get("/users");
    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toEqual(1);
    expect(res.body[0]).toEqual(expect.objectContaining(expected));
    console.log("Test done");
  });
});

// probeersel
/*
describe("Get User", () => {
  beforeEach(async () => {
    await User.deleteMany({});
  });

  // afterAll(async () => {
  //   db.connection.close();
  // });

  it("should get user by id", async () => {
    const expected = { foo: "bar" };
    await User.insertOne(expected);
    delete expected._id;

    const res = await request(app).get(`/users/${expected._id}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual(expect.objectContaining(expected));
  });

  it("should return 404 if user does not exist", async () => {
    const res = await request(app).get("/users/5f6d0a3d4d5e4a1d8c7b");
    expect(res.statusCode).toEqual(404);
  });
});
*/
