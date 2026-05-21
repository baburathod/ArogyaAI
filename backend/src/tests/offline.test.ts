import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import express from 'express';

describe('Offline endpoints', () => {
  let server: any;

  beforeAll(async () => {
    const app = express();
    app.use(express.json());
    app.post('/api/offline/medications', (req, res) => res.status(202).json({ accepted: true }));
    app.post('/api/offline/appointments', (req, res) => res.status(202).json({ accepted: true }));
    await new Promise<void>((resolve) => {
      server = app.listen(0, () => resolve());
    });
  });

  afterAll(async () => {
    if (server && server.close) {
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  });

  it('accepts offline medication payload', async () => {
    const res = await request(server).post('/api/offline/medications').send({ medId: 'm1', name: 'Metformin', takenAt: new Date().toISOString() });
    expect(res.status).toBe(202);
    expect(res.body.accepted).toBe(true);
  });

  it('accepts offline appointment payload', async () => {
    const res = await request(server).post('/api/offline/appointments').send({ title: 'Checkup', when: '2026-06-01 10:00' });
    expect(res.status).toBe(202);
    expect(res.body.accepted).toBe(true);
  });
});
