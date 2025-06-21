import {jest} from '@jest/globals';
import request from "supertest";
import app from "../../app.js";
import db from "../../services/database.js";
import User from "../../models/user.js";

describe("Get Users", () => {
  beforeEach(async () => {
    await db.connect();
    await User.deleteMany({});
  });

  afterAll(async () => {
    await db.disconnect();
  });

  it("should get all users in array", async () => {
    const expected = { email: "foo@bar.com", passwordHash: "foobar", role: "user" };
    await User.insertOne(expected);
    delete expected._id;

    const res = await request(app).get("/users");
    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toEqual(1);
    expect(res.body[0]).toEqual(expect.objectContaining(expected));
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
