// app.js calls subscriber.subscribe() at import time, which would try to reach
// RabbitMQ. Mock it so the test only exercises HTTP + MongoDB.
jest.mock('../../mqtt/subscriber', () => ({ subscribe: jest.fn() }));

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../app');
const Target = require('../../models/target');

const oneHourAgo = () => new Date(Date.now() - 60 * 60 * 1000);
const oneHourFromNow = () => new Date(Date.now() + 60 * 60 * 1000);

let imageCounter = 0;
async function createTarget(overrides = {}) {
  imageCounter += 1;
  return Target.create({
    user_id: 'user-1',
    starttime: oneHourAgo(),
    endtime: oneHourFromNow(),
    description: 'Test target',
    imageData: `target-image-${imageCounter}`,
    ...overrides,
  });
}

describe('GET /targets/get/:id', () => {
  beforeAll(() => mongoose.connect(process.env.MONGO_URL));
  beforeEach(() => Target.deleteMany({}));
  afterAll(() => mongoose.disconnect());

  it('returns only the targets belonging to the requested user', async () => {
    await createTarget({ user_id: 'alice' });
    await createTarget({ user_id: 'alice' });
    await createTarget({ user_id: 'bob' });

    const res = await request(app).get('/targets/get/alice');

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(res.body.every((target) => target.user_id === 'alice')).toBe(true);
  });
});
