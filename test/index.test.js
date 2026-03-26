const request = require('supertest');
const app = require('../dist/index');
const { sequelize, user } = require('../dist/models/index');

describe('POST Login Action', () => {
    it('Should return success login', async () => {
        jest.SpyOn(user);
        return request(app)
            .post('/v1/auth/login')
            .expect('Content-Type', /json/)
            .expect(200)
            .then(res => {
                expect(res.success).toBe('SUCCESS');
            });
    });
});
