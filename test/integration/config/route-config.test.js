// test/integration/config/route-config.test.js

jest.mock('../../../dist/routes/banners.routes', () => ({
    __esModule: true,
    default: jest.fn(),
}));

jest.mock('../../../dist/routes/media.routes', () => ({
    __esModule: true,
    default: jest.fn(),
}));

jest.mock('../../../dist/routes/products.route', () => ({
    __esModule: true,
    default: jest.fn(),
}));

const { setRoutesConfig } = require('../../../dist/config/route-config');

describe('setRoutesConfig', () => {
    it('mounts all route modules under the correct v1 prefixes', () => {
        const app = { use: jest.fn() };

        setRoutesConfig(app);

        expect(app.use).toHaveBeenCalledWith('/v1/banners/', expect.any(Function));
        expect(app.use).toHaveBeenCalledWith('/v1/media/', expect.any(Function));
        expect(app.use).toHaveBeenCalledWith('/v1/products/', expect.any(Function));
    });

    it('mounts exactly three routes', () => {
        const app = { use: jest.fn() };

        setRoutesConfig(app);

        expect(app.use).toHaveBeenCalledTimes(3);
    });
});
