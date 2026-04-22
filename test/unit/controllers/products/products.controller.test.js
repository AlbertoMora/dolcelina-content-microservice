// test/unit/controllers/products/products.controller.test.js

// ── Module mocks ──────────────────────────────────────────────────────────────
jest.mock('@aure/commons', () => ({
    avoidNanParseInt: jest.fn(v => (v !== undefined ? parseInt(v, 10) : undefined)),
    responseCodes: { ok: 'OK' },
    sendOkResponse: jest.fn(),
}));

jest.mock('../../../../dist/services/sequelize-service', () => ({
    SequelizeService: { getInstance: jest.fn() },
}));

jest.mock('../../../../dist/utils/session-helper', () => ({
    getUserSession: jest.fn().mockReturnValue({ user: { id: 'test-user-id' } }),
}));

// ── Imports under test ────────────────────────────────────────────────────────
const {
    getProductsAction,
    getProductByIdAction,
    createProductAction,
    getCategoriesAction,
    createCategoryAction,
} = require('../../../../dist/controllers/products.controller');

const { SequelizeService } = require('../../../../dist/services/sequelize-service');
const { sendOkResponse } = require('@aure/commons');
const { getUserSession } = require('../../../../dist/utils/session-helper');

// ── Shared response stub ──────────────────────────────────────────────────────
const buildRes = () => ({ status: jest.fn().mockReturnThis(), send: jest.fn() });

// ── Tests ─────────────────────────────────────────────────────────────────────
describe('products.controller', () => {
    beforeEach(() => jest.clearAllMocks());

    // ── getProductsAction ─────────────────────────────────────────────────────
    describe('getProductsAction', () => {
        it('returns products with total and price range', async () => {
            const products = [{ id: 'p1', name: 'Pizza Margherita' }];
            const mockMinMax = {
                getDataValue: jest.fn(key => (key === 'minPrice' ? 5.5 : 25.0)),
            };

            SequelizeService.getInstance.mockResolvedValue({
                db: {
                    product: {
                        findAll: jest.fn().mockResolvedValue(products),
                        count: jest.fn().mockResolvedValue(1),
                        findOne: jest.fn().mockResolvedValue(mockMinMax),
                    },
                    category: {},
                },
            });

            const req = {
                query: { orderField: 'name', orderDirection: 'ASC', limit: '10', offset: '0' },
            };

            await getProductsAction(req, {});

            expect(sendOkResponse).toHaveBeenCalledWith(
                expect.objectContaining({
                    products,
                    total: 1,
                    minPrice: 5.5,
                    maxPrice: 25.0,
                    status: 'OK',
                }),
                {},
            );
        });

        it('returns 0 for min/max price when findOne resolves null', async () => {
            SequelizeService.getInstance.mockResolvedValue({
                db: {
                    product: {
                        findAll: jest.fn().mockResolvedValue([]),
                        count: jest.fn().mockResolvedValue(0),
                        findOne: jest.fn().mockResolvedValue(null),
                    },
                    category: {},
                },
            });

            await getProductsAction({ query: {} }, {});

            expect(sendOkResponse).toHaveBeenCalledWith(
                expect.objectContaining({ minPrice: 0, maxPrice: 0 }),
                {},
            );
        });

        it('applies all query filters to findAll', async () => {
            const mockFindAll = jest.fn().mockResolvedValue([]);
            const mockMinMax = { getDataValue: jest.fn().mockReturnValue(0) };

            SequelizeService.getInstance.mockResolvedValue({
                db: {
                    product: {
                        findAll: mockFindAll,
                        count: jest.fn().mockResolvedValue(0),
                        findOne: jest.fn().mockResolvedValue(mockMinMax),
                    },
                    category: {},
                },
            });

            await getProductsAction(
                {
                    query: {
                        orderField: 'price',
                        orderDirection: 'ASC',
                        name: 'pizza',
                        calories: '300',
                        min_price: '5',
                        max_price: '50',
                        is_active: true,
                        category_id: 'cat-1',
                    },
                },
                {},
            );

            expect(mockFindAll).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({
                        name: 'pizza',
                        calories: '300',
                        category_id: 'cat-1',
                    }),
                }),
            );
        });
    });

    // ── getProductByIdAction ──────────────────────────────────────────────────
    describe('getProductByIdAction', () => {
        it('returns the product when found', async () => {
            const product = { id: 'p1', name: 'Pizza' };
            SequelizeService.getInstance.mockResolvedValue({
                db: { product: { findByPk: jest.fn().mockResolvedValue(product) } },
            });

            const res = buildRes();
            await getProductByIdAction({ params: { id: 'p1' } }, res);

            expect(res.send).toHaveBeenCalledWith(product);
        });

        it('returns 404 when product is not found', async () => {
            SequelizeService.getInstance.mockResolvedValue({
                db: { product: { findByPk: jest.fn().mockResolvedValue(null) } },
            });

            const res = buildRes();
            await getProductByIdAction({ params: { id: 'missing' } }, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.send).toHaveBeenCalledWith({ message: 'Product not found' });
        });
    });

    // ── createProductAction ───────────────────────────────────────────────────
    describe('createProductAction', () => {
        it('creates product with images and returns ok', async () => {
            const newProduct = { id: 'new-p1' };
            const mockCreate = jest.fn().mockResolvedValue(newProduct);
            const mockCreateImage = jest.fn().mockResolvedValue({ id: 'img-1' });

            SequelizeService.getInstance.mockResolvedValue({
                db: {
                    product: { create: mockCreate },
                    product_image: { create: mockCreateImage },
                },
            });

            await createProductAction(
                {
                    body: {
                        name: 'Pizza',
                        description: 'Delicious pizza',
                        price: 12.5,
                        calories: 800,
                        is_active: true,
                        category_id: 'cat-1',
                        images: ['url-img-1', 'url-img-2'],
                    },
                    headers: { authorization: 'Bearer token' },
                },
                {},
            );

            expect(mockCreate).toHaveBeenCalledWith(
                expect.objectContaining({ name: 'Pizza', created_by: 'test-user-id' }),
            );
            expect(mockCreateImage).toHaveBeenCalledTimes(2);
            expect(sendOkResponse).toHaveBeenCalledWith(
                expect.objectContaining({ status: 'OK', product: newProduct }),
                {},
            );
        });

        it('creates product with empty images list', async () => {
            const newProduct = { id: 'new-p2' };
            const mockCreate = jest.fn().mockResolvedValue(newProduct);
            const mockCreateImage = jest.fn();

            SequelizeService.getInstance.mockResolvedValue({
                db: {
                    product: { create: mockCreate },
                    product_image: { create: mockCreateImage },
                },
            });

            await createProductAction(
                {
                    body: { name: 'Salad', images: [] },
                    headers: { authorization: 'Bearer token' },
                },
                {},
            );

            expect(mockCreateImage).not.toHaveBeenCalled();
            expect(sendOkResponse).toHaveBeenCalled();
        });

        it('uses "system" as created_by when user session is missing', async () => {
            const newProduct = { id: 'new-p3' };
            const mockCreate = jest.fn().mockResolvedValue(newProduct);
            const mockCreateImage = jest.fn();
            getUserSession.mockReturnValueOnce(null);

            SequelizeService.getInstance.mockResolvedValue({
                db: {
                    product: { create: mockCreate },
                    product_image: { create: mockCreateImage },
                },
            });

            await createProductAction(
                {
                    body: { name: 'Soup', images: [] },
                    headers: { authorization: '' },
                },
                {},
            );

            expect(mockCreate).toHaveBeenCalledWith(
                expect.objectContaining({ created_by: 'system' }),
            );
            expect(sendOkResponse).toHaveBeenCalled();
        });
    });

    // ── getCategoriesAction ───────────────────────────────────────────────────
    describe('getCategoriesAction', () => {
        it('returns all categories', async () => {
            const categories = [{ id: 'cat1', name: 'Starters' }];
            SequelizeService.getInstance.mockResolvedValue({
                db: { category: { findAll: jest.fn().mockResolvedValue(categories) } },
            });

            await getCategoriesAction({ query: { orderField: 'name', orderDirection: 'ASC' } }, {});

            expect(sendOkResponse).toHaveBeenCalledWith({ status: 'OK', categories }, {});
        });

        it('applies all search filters', async () => {
            const mockFindAll = jest.fn().mockResolvedValue([]);
            SequelizeService.getInstance.mockResolvedValue({
                db: { category: { findAll: mockFindAll } },
            });

            await getCategoriesAction(
                {
                    query: {
                        id: 'cat1',
                        name: 'Main',
                        description: 'main course',
                        creation_date: '2024-01-01',
                        orderField: 'name',
                        orderDirection: 'DESC',
                    },
                },
                {},
            );

            expect(mockFindAll).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({ id: 'cat1' }),
                }),
            );
        });
    });

    // ── createCategoryAction ──────────────────────────────────────────────────
    describe('createCategoryAction', () => {
        it('creates category and returns ok', async () => {
            const newCategory = { id: 'cat-new', name: 'Desserts' };
            SequelizeService.getInstance.mockResolvedValue({
                db: { category: { create: jest.fn().mockResolvedValue(newCategory) } },
            });

            await createCategoryAction({ body: { name: 'Desserts', description: 'Sweet' } }, {});

            expect(sendOkResponse).toHaveBeenCalledWith(
                { status: 'OK', category: newCategory },
                {},
            );
        });
    });
});
