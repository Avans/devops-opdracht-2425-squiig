jest.mock('../../mqtt/publisher', () => ({ publishDirectExchange: jest.fn() }));
jest.mock('../../mqtt/subscriber', () => ({ subscribe: jest.fn() }));
jest.mock('../../services/tagMatcher', () => ({ compareImage: jest.fn() }));

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../app');
const Submission = require('../../models/submission');
const Target = require('../../models/target');
const { compareImage } = require('../../services/tagMatcher');
const publisher = require('../../mqtt/publisher');

const oneHourFromNowDate = () => new Date(Date.now() + 60 * 60 * 1000);
const oneHourAgoDate = () => new Date(Date.now() - 60 * 60 * 1000);

async function createTarget(overrides = {}) {
  return Target.create({
    user_id: 'user-1',
    starttime: oneHourAgoDate(),
    endtime: oneHourFromNowDate(),
    description: 'Test target',
    imageData: 'target-image-data',
    ...overrides,
  });
}

describe('POST /', () => {
  beforeAll(() => mongoose.connect(process.env.MONGO_URL));
  beforeEach(async () => {
    await Promise.all([Submission.deleteMany({}), Target.deleteMany({})]);
    jest.clearAllMocks();
  });
  afterAll(() => mongoose.disconnect());

  it('returns 201 and creates a submission for a valid target', async () => {
    const target = await createTarget();
    compareImage.mockResolvedValue(75);

    const res = await request(app).post('/').send({
      targetId: target._id.toString(),
      image: 'submission-image-data',
      userId: 'user-42',
    });

    expect(res.statusCode).toBe(201);
    expect(publisher.publishDirectExchange).toHaveBeenCalledWith(
      expect.objectContaining({ submission: expect.anything() }),
      'direct_submission',
      'create'
    );
  });

  it('returns 404 when the target does not exist', async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();

    const res = await request(app).post('/').send({
      targetId: fakeId,
      image: 'submission-image-data',
      userId: 'user-42',
    });

    expect(res.statusCode).toBe(404);
  });

  it('returns 400 when the target is expired', async () => {
    const target = await createTarget({
      starttime: oneHourAgoDate(),
      endtime: new Date(Date.now() - 1000),
    });

    const res = await request(app).post('/').send({
      targetId: target._id.toString(),
      image: 'submission-image-data',
      userId: 'user-42',
    });

    expect(res.statusCode).toBe(400);
  });

  it('returns 400 on duplicate user+target submission', async () => {
    const target = await createTarget();
    compareImage.mockResolvedValue(50);

    await request(app).post('/').send({
      targetId: target._id.toString(),
      image: 'first-image',
      userId: 'user-42',
    });

    const res = await request(app).post('/').send({
      targetId: target._id.toString(),
      image: 'second-image',
      userId: 'user-42',
    });

    expect(res.statusCode).toBe(400);
  });
});

describe('DELETE /targets/:targetId/user/:user', () => {
  beforeAll(() => mongoose.connect(process.env.MONGO_URL));
  beforeEach(async () => {
    await Promise.all([Submission.deleteMany({}), Target.deleteMany({})]);
    jest.clearAllMocks();
  });
  afterAll(() => mongoose.disconnect());

  it('returns 200 and deletes the matching submission', async () => {
    const target = await createTarget();
    const submission = await Submission.create({
      targetId: target._id.toString(),
      image: 'some-image',
      createdByUser: 'user-1',
      score: 50,
    });

    const res = await request(app)
      .delete(`/targets/${target._id}/user/user-1`);

    expect(res.statusCode).toBe(200);
    expect(await Submission.findById(submission._id)).toBeNull();
    expect(publisher.publishDirectExchange).toHaveBeenCalledWith(
      expect.objectContaining({ _id: submission._id }),
      'direct_submission',
      'delete'
    );
  });

  it('returns 200 even when no submission exists', async () => {
    const target = await createTarget();

    const res = await request(app)
      .delete(`/targets/${target._id}/user/nonexistent-user`);

    expect(res.statusCode).toBe(200);
    expect(publisher.publishDirectExchange).not.toHaveBeenCalled();
  });
});

describe('DELETE /targets/:targetId', () => {
  beforeAll(() => mongoose.connect(process.env.MONGO_URL));
  beforeEach(async () => {
    await Promise.all([Submission.deleteMany({}), Target.deleteMany({})]);
    jest.clearAllMocks();
  });
  afterAll(() => mongoose.disconnect());

  it('returns 200 and removes all submissions for the target', async () => {
    const target = await createTarget();
    await Submission.insertMany([
      { targetId: target._id.toString(), image: 'img-1', createdByUser: 'user-1', score: 10 },
      { targetId: target._id.toString(), image: 'img-2', createdByUser: 'user-2', score: 20 },
    ]);

    const res = await request(app).delete(`/targets/${target._id}`);

    expect(res.statusCode).toBe(200);
    expect(await Submission.countDocuments({ targetId: target._id.toString() })).toBe(0);
    expect(publisher.publishDirectExchange).toHaveBeenCalledTimes(2);
  });

  it('returns 200 with a message when no submissions exist', async () => {
    const target = await createTarget();

    const res = await request(app).delete(`/targets/${target._id}`);

    expect(res.statusCode).toBe(200);
    expect(res.text).toContain('No submissions found');
  });
});

describe('DELETE /user/:userId', () => {
  beforeAll(() => mongoose.connect(process.env.MONGO_URL));
  beforeEach(async () => {
    await Promise.all([Submission.deleteMany({}), Target.deleteMany({})]);
    jest.clearAllMocks();
  });
  afterAll(() => mongoose.disconnect());

  it('returns 200 and removes all submissions for the user', async () => {
    const t1 = await createTarget({ imageData: 'target-img-1' });
    const t2 = await createTarget({ imageData: 'target-img-2' });
    await Submission.insertMany([
      { targetId: t1._id.toString(), image: 'img-1', createdByUser: 'user-99', score: 10 },
      { targetId: t2._id.toString(), image: 'img-2', createdByUser: 'user-99', score: 20 },
    ]);

    const res = await request(app).delete('/user/user-99');

    expect(res.statusCode).toBe(200);
    expect(await Submission.countDocuments({ createdByUser: 'user-99' })).toBe(0);
    expect(publisher.publishDirectExchange).toHaveBeenCalledTimes(2);
  });

  it('returns 200 with a message when the user has no submissions', async () => {
    const res = await request(app).delete('/user/ghost-user');

    expect(res.statusCode).toBe(200);
    expect(res.text).toContain('No submissions found');
  });
});
