const request = require('supertest');
const app = require('../../app');

describe('Test get dictionaries', () => {
  test('It should respond with 200', async () => {
    const response = await request(app)
      .get('/dictionary')
      .expect('Content-Type', /json/)
      .expect(200);
    // expect(response.statusCode).toBe(200);
  });
})