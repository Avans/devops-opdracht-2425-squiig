const { ExpectationFailed } = require("http-errors");
const request = require("supertest");
const app = require("../../app");
const db = require("../../services/database");
const User = require("../../models/user");

describe("Get Users", () => {
  beforeEach(async () => {
    await User.deleteMany({});
  });

  // afterAll(async () => {
  //   db.connection.close();
  // });

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
