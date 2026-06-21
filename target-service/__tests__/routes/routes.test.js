// routes.js calls publisher.publishDirectExchange() when a target changes,
// which would try to reach RabbitMQ. Mock it so the test only exercises
// HTTP + MongoDB.
jest.mock('../../mqtt/publisher', () => ({ publishDirectExchange: jest.fn() }));

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../app');
const Target = require('../../models/target');
const publisher = require('../../mqtt/publisher');

const oneHourAgo = () => new Date(Date.now() - 60 * 60 * 1000);
const oneHourFromNow = () => new Date(Date.now() + 60 * 60 * 1000);

let imageCounter = 0;
function uploadBody(overrides = {}) {
  imageCounter += 1;
  return {
    user: 'user-1',
    imageData: `target-image-${imageCounter}`,
    additionalString: {
      starttime: oneHourAgo(),
      endtime: oneHourFromNow(),
      description: 'Test target',
    },
    ...overrides,
  };
}

describe('POST /upload', () => {
  beforeAll(() => mongoose.connect(process.env.MONGO_URL));
  beforeEach(async () => {
    await Target.deleteMany({});
    jest.clearAllMocks();
  });
  afterAll(() => mongoose.disconnect());

  it('creates a target and publishes a create message', async () => {
    const res = await request(app).post('/upload').send(uploadBody());

    expect(res.statusCode).toBe(201);
    expect(await Target.countDocuments({})).toBe(1);
    expect(publisher.publishDirectExchange).toHaveBeenCalledWith(
      expect.objectContaining({ target: expect.anything() }),
      'direct_target',
      'create'
    );
  });

  it('rejects a duplicate image with 400', async () => {
    const body = uploadBody();
    await request(app).post('/upload').send(body);

    const res = await request(app).post('/upload').send(body);

    expect(res.statusCode).toBe(400);
    expect(await Target.countDocuments({})).toBe(1);
  });
});
