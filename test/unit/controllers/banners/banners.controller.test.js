// test/unit/controllers/banners/banners.controller.test.js

// ── Hoisted mock variables (must start with "mock") ──────────────────────────
const mockGetPresignedUploadingUrl = jest.fn().mockResolvedValue('https://s3.example.com/upload');
const mockS3Init = jest.fn();

// ── Module mocks ──────────────────────────────────────────────────────────────
jest.mock('@aure/commons', () => ({
    avoidNanParseInt: jest.fn(v => (v !== undefined ? parseInt(v, 10) : undefined)),
    httpCodes: { ok: 200, bad_request: 400, not_found: 404, server_error: 500 },
    responseCodes: { ok: 'OK' },
    S3ClientService: jest.fn().mockImplementation(() => ({ init: mockS3Init })),
    sendClientError: jest.fn(),
    sendOkResponse: jest.fn(),
    sendServerError: jest.fn(),
    webErrors: { srv01: { code: 'srv01' } },
}));

jest.mock('../../../../dist/services/sequelize-service', () => ({
    SequelizeService: { getInstance: jest.fn() },
}));

jest.mock('../../../../dist/utils/session-helper', () => ({
    getUserSession: jest.fn().mockReturnValue({ user: { id: 'test-user-id' } }),
}));

// ── Imports under test ────────────────────────────────────────────────────────
const {
    getBannersAction,
    getBannerByIdAction,
    createBannerAction,
    updateBannerAction,
    deleteBannerAction,
    getImagePostLink,
} = require('../../../../dist/controllers/banners.controller');

const { SequelizeService } = require('../../../../dist/services/sequelize-service');
const { sendClientError, sendOkResponse, sendServerError, httpCodes } = require('@aure/commons');

// ── Helpers ───────────────────────────────────────────────────────────────────
const res = {};

// ── Tests ─────────────────────────────────────────────────────────────────────
describe('banners.controller', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockS3Init.mockResolvedValue({ getPresignedUploadingUrl: mockGetPresignedUploadingUrl });
    });

    // ── getBannersAction ──────────────────────────────────────────────────────
    describe('getBannersAction', () => {
        it('returns banners when found', async () => {
            const banners = [{ id: 'b1', title: 'Test' }];
            SequelizeService.getInstance.mockResolvedValue({
                db: { banner: { findAll: jest.fn().mockResolvedValue(banners) } },
            });

            await getBannersAction(
                {
                    query: {
                        orderField: 'created_at',
                        orderDirection: 'DESC',
                        limit: '10',
                        offset: '0',
                    },
                },
                res,
            );

            expect(sendOkResponse).toHaveBeenCalledWith({ status: 'OK', banners }, res);
            expect(sendClientError).not.toHaveBeenCalled();
        });

        it('returns not found when findAll resolves null', async () => {
            SequelizeService.getInstance.mockResolvedValue({
                db: { banner: { findAll: jest.fn().mockResolvedValue(null) } },
            });

            await getBannersAction({ query: {} }, res);

            expect(sendClientError).toHaveBeenCalledWith(
                expect.anything(),
                res,
                httpCodes.not_found,
            );
        });

        it('passes description and title search filters', async () => {
            const mockFindAll = jest.fn().mockResolvedValue([]);
            SequelizeService.getInstance.mockResolvedValue({
                db: { banner: { findAll: mockFindAll } },
            });

            await getBannersAction(
                {
                    query: {
                        orderField: 'title',
                        orderDirection: 'ASC',
                        description: 'summer',
                        title: 'sale',
                    },
                },
                res,
            );

            expect(mockFindAll).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({
                        description: expect.anything(),
                        title: expect.anything(),
                    }),
                }),
            );
            expect(sendOkResponse).toHaveBeenCalled();
        });

        it('passes has_button and is_active filters', async () => {
            const mockFindAll = jest.fn().mockResolvedValue([]);
            SequelizeService.getInstance.mockResolvedValue({
                db: { banner: { findAll: mockFindAll } },
            });

            await getBannersAction({ query: { has_button: true, is_active: false } }, res);

            expect(mockFindAll).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({
                        has_button: 1,
                        is_active: 0,
                    }),
                }),
            );
        });

        it('passes has_button=false and is_active=true (covers ternary false-path)', async () => {
            const mockFindAll = jest.fn().mockResolvedValue([]);
            SequelizeService.getInstance.mockResolvedValue({
                db: { banner: { findAll: mockFindAll } },
            });

            await getBannersAction({ query: { has_button: false, is_active: true } }, res);

            expect(mockFindAll).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({ has_button: 0, is_active: 1 }),
                }),
            );
        });

        it('passes date range filter when both min_date and max_date provided', async () => {
            const mockFindAll = jest.fn().mockResolvedValue([]);
            SequelizeService.getInstance.mockResolvedValue({
                db: { banner: { findAll: mockFindAll } },
            });

            await getBannersAction(
                { query: { min_date: '2024-01-01', max_date: '2024-12-31' } },
                res,
            );

            expect(mockFindAll).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({ creation_date: expect.anything() }),
                }),
            );
        });
    });

    // ── getBannerByIdAction ───────────────────────────────────────────────────
    describe('getBannerByIdAction', () => {
        it('returns banner when found', async () => {
            const banner = { id: 'b1', title: 'Promo' };
            SequelizeService.getInstance.mockResolvedValue({
                db: { banner: { findByPk: jest.fn().mockResolvedValue(banner) } },
            });

            await getBannerByIdAction({ params: { id: 'b1' } }, res);

            expect(sendOkResponse).toHaveBeenCalledWith({ status: 'OK', banner }, res);
        });

        it('returns not found when banner does not exist', async () => {
            SequelizeService.getInstance.mockResolvedValue({
                db: { banner: { findByPk: jest.fn().mockResolvedValue(null) } },
            });

            await getBannerByIdAction({ params: { id: 'missing' } }, res);

            expect(sendClientError).toHaveBeenCalledWith(
                expect.anything(),
                res,
                httpCodes.not_found,
            );
        });
    });

    // ── createBannerAction ────────────────────────────────────────────────────
    describe('createBannerAction', () => {
        const baseBody = {
            title: 'Summer Sale',
            description: 'Big discounts',
            has_button: true,
            is_active: true,
            redirects: '/sale',
            image_url: 'http://img.jpg',
            btn_icon: 'star',
            btn_text: 'Shop Now',
        };
        const baseReq = {
            body: baseBody,
            headers: { authorization: 'Bearer validtoken' },
        };

        it('creates and returns the new banner', async () => {
            const newBanner = { id: 'new-b1', ...baseBody };
            SequelizeService.getInstance.mockResolvedValue({
                db: { banner: { create: jest.fn().mockResolvedValue(newBanner) } },
            });

            await createBannerAction(baseReq, res);

            expect(sendOkResponse).toHaveBeenCalledWith({ status: 'OK', banner: newBanner }, res);
        });

        it('returns server error when create returns null', async () => {
            SequelizeService.getInstance.mockResolvedValue({
                db: { banner: { create: jest.fn().mockResolvedValue(null) } },
            });

            await createBannerAction(baseReq, res);

            expect(sendServerError).toHaveBeenCalled();
        });

        it('converts boolean has_button and is_active to 0/1', async () => {
            const mockCreate = jest.fn().mockResolvedValue({ id: 'new-b2' });
            SequelizeService.getInstance.mockResolvedValue({
                db: { banner: { create: mockCreate } },
            });

            await createBannerAction(
                { ...baseReq, body: { ...baseBody, has_button: false, is_active: false } },
                res,
            );

            expect(mockCreate).toHaveBeenCalledWith(
                expect.objectContaining({ has_button: 0, is_active: 0 }),
            );
        });
    });

    // ── updateBannerAction ────────────────────────────────────────────────────
    describe('updateBannerAction', () => {
        it('returns not found when banner does not exist', async () => {
            SequelizeService.getInstance.mockResolvedValue({
                db: { banner: { findByPk: jest.fn().mockResolvedValue(null) } },
            });

            await updateBannerAction({ params: { id: 'missing' }, body: {} }, res);

            expect(sendClientError).toHaveBeenCalledWith(
                expect.anything(),
                res,
                httpCodes.not_found,
            );
        });

        it('updates all provided fields and returns updated banner', async () => {
            const updatedBanner = { id: 'b1', title: 'New Title' };
            const mockUpdate = jest.fn().mockResolvedValue(updatedBanner);
            SequelizeService.getInstance.mockResolvedValue({
                db: {
                    banner: {
                        findByPk: jest.fn().mockResolvedValue({ id: 'b1', update: mockUpdate }),
                    },
                },
            });

            await updateBannerAction(
                {
                    params: { id: 'b1' },
                    body: {
                        title: 'New Title',
                        description: 'New Desc',
                        redirects: '/new',
                        image_url: 'http://new.jpg',
                        has_button: true,
                        is_active: false,
                        btn_icon: 'new-icon',
                        btn_text: 'Buy',
                    },
                },
                res,
            );

            expect(mockUpdate).toHaveBeenCalledWith(
                expect.objectContaining({
                    title: 'New Title',
                    description: 'New Desc',
                    has_button: 1,
                    is_active: 0,
                }),
            );
            expect(sendOkResponse).toHaveBeenCalledWith(
                { status: 'OK', banner: updatedBanner },
                res,
            );
        });

        it('updates only provided optional fields', async () => {
            const updatedBanner = { id: 'b1', title: 'Partial' };
            const mockUpdate = jest.fn().mockResolvedValue(updatedBanner);
            SequelizeService.getInstance.mockResolvedValue({
                db: {
                    banner: {
                        findByPk: jest.fn().mockResolvedValue({ id: 'b1', update: mockUpdate }),
                    },
                },
            });

            await updateBannerAction({ params: { id: 'b1' }, body: { title: 'Partial' } }, res);

            expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({ title: 'Partial' }));
            // description was not provided — should NOT be in payload
            const callArg = mockUpdate.mock.calls[0][0];
            expect(callArg).not.toHaveProperty('description');
        });

        it('converts has_button=false and is_active=true to correct integers during update', async () => {
            const mockUpdate = jest.fn().mockResolvedValue({ id: 'b1' });
            SequelizeService.getInstance.mockResolvedValue({
                db: {
                    banner: {
                        findByPk: jest.fn().mockResolvedValue({ id: 'b1', update: mockUpdate }),
                    },
                },
            });

            await updateBannerAction(
                { params: { id: 'b1' }, body: { has_button: false, is_active: true } },
                res,
            );

            expect(mockUpdate).toHaveBeenCalledWith(
                expect.objectContaining({ has_button: 0, is_active: 1 }),
            );
        });
    });

    // ── deleteBannerAction ────────────────────────────────────────────────────
    describe('deleteBannerAction', () => {
        it('returns bad request when only one banner remains', async () => {
            SequelizeService.getInstance.mockResolvedValue({
                db: { banner: { count: jest.fn().mockResolvedValue(1) } },
            });

            await deleteBannerAction({ params: { id: 'b1' } }, res);

            expect(sendClientError).toHaveBeenCalledWith(
                expect.anything(),
                res,
                httpCodes.bad_request,
            );
        });

        it('returns not found when banner does not exist', async () => {
            SequelizeService.getInstance.mockResolvedValue({
                db: {
                    banner: {
                        count: jest.fn().mockResolvedValue(3),
                        findByPk: jest.fn().mockResolvedValue(null),
                    },
                },
            });

            await deleteBannerAction({ params: { id: 'missing' } }, res);

            expect(sendClientError).toHaveBeenCalledWith(
                expect.anything(),
                res,
                httpCodes.not_found,
            );
        });

        it('deactivates banner and returns success', async () => {
            const updatedBanner = { id: 'b1', is_active: 0 };
            const mockUpdate = jest.fn().mockResolvedValue(updatedBanner);
            SequelizeService.getInstance.mockResolvedValue({
                db: {
                    banner: {
                        count: jest.fn().mockResolvedValue(3),
                        findByPk: jest.fn().mockResolvedValue({ id: 'b1', update: mockUpdate }),
                    },
                },
            });

            await deleteBannerAction({ params: { id: 'b1' } }, res);

            expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({ is_active: 0 }));
            expect(sendOkResponse).toHaveBeenCalledWith(
                { status: 'OK', banner: updatedBanner },
                res,
            );
        });
    });

    // ── getImagePostLink ──────────────────────────────────────────────────────
    describe('getImagePostLink', () => {
        const req = {
            query: { filename: 'photo.jpg', contentName: 'My Photo', contentType: 'image/jpeg' },
            headers: { authorization: 'Bearer token' },
        };

        it('returns server error when S3 init fails', async () => {
            mockS3Init.mockResolvedValueOnce(null);

            await getImagePostLink(req, res);

            expect(sendServerError).toHaveBeenCalled();
        });

        it('returns presigned URL on success', async () => {
            await getImagePostLink(req, res);

            expect(sendOkResponse).toHaveBeenCalledWith(
                expect.objectContaining({ status: 'OK', url: 'https://s3.example.com/upload' }),
                res,
            );
        });
    });
});
