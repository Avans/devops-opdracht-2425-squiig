const { ExpectationFailed } = require("http-errors");
const request = require("supertest");
const app = require("../../app");
const db = require("../../services/database");
const User = require("../../models/user");

describe("Get Users", () => {
  beforeEach(async () => {
    await User.deleteMany({});
  });

  afterAll(async () => {
    db.connection.close();
  });

  it("should get all users in array", async () => {
    const expected = { foo: "bar" };
    await User.insertOne(expected);
    delete expected._id;

    const res = await request(app).get("/users");
    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toEqual(1);
    expect(res.body[0]).toEqual(expect.objectContaining(expected));
  });
});
