// test/unit/controllers/media/media.controller.test.js

// ── Hoisted mock variables (must start with "mock") ──────────────────────────
const mockGetPresignedUploadingUrl = jest.fn().mockResolvedValue('https://s3.example.com/upload');
const mockDeleteFile = jest.fn().mockResolvedValue({ $metadata: { httpStatusCode: 200 } });
const mockS3Init = jest.fn();

// ── Module mocks ──────────────────────────────────────────────────────────────
jest.mock('@amora95/commons', () => ({
    avoidNanParseInt: jest.fn(v => (v !== undefined ? parseInt(v, 10) : undefined)),
    httpCodes: { ok: 200, bad_request: 400, not_found: 404 },
    responseCodes: { ok: 'OK' },
    S3ClientService: jest.fn().mockImplementation(() => ({ init: mockS3Init })),
    sendClientError: jest.fn(),
    sendOkResponse: jest.fn(),
    sendServerError: jest.fn(),
    webErrors: { srv01: { code: 'srv01' } },
}));

jest.mock('../../../../dist/models/mongoose/VideoTags', () => ({
    __esModule: true,
    default: jest.fn(),
}));

jest.mock('../../../../dist/utils/session-helper', () => ({
    getUserSession: jest.fn().mockReturnValue({ user: { id: 'test-user-id' } }),
}));

// ── Imports under test ────────────────────────────────────────────────────────
const {
    getVideosAction,
    getVideoByIdAction,
    getMediaPostLink,
    getMediaBatchPostLinks,
    postVideoAction,
    updateVideoAction,
    deleteVideoAction,
    activateVideoAction,
    deactivateVideoAction,
    getActiveVideoAction,
} = require('../../../../dist/controllers/media.controller');

const VideoTagModel = require('../../../../dist/models/mongoose/VideoTags').default;
const { sendClientError, sendOkResponse, sendServerError, httpCodes } = require('@amora95/commons');

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Builds a mock Mongoose query chain for .find() with full fluent API */
const buildFindChain = resolvedValue => ({
    sort: jest.fn().mockReturnValue({
        skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
                lean: jest.fn().mockReturnValue({
                    exec: jest.fn().mockResolvedValue(resolvedValue),
                }),
            }),
        }),
    }),
});

/** Builds a mock query chain for .findById()/.findOne() → .exec() only */
const buildExecChain = resolvedValue => ({ exec: jest.fn().mockResolvedValue(resolvedValue) });

/** Builds a mock query chain for .findById()/.findOne() → .lean() → .exec() */
const buildLeanExecChain = resolvedValue => ({
    lean: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(resolvedValue) }),
});

const res = {};

// ── Tests ─────────────────────────────────────────────────────────────────────
describe('media.controller', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockS3Init.mockResolvedValue({
            getPresignedUploadingUrl: mockGetPresignedUploadingUrl,
            deleteFile: mockDeleteFile,
        });
        // Attach static methods to the constructor mock
        VideoTagModel.find = jest.fn();
        VideoTagModel.findById = jest.fn();
        VideoTagModel.findOne = jest.fn();
        VideoTagModel.updateMany = jest.fn();
    });

    // ── getVideosAction ───────────────────────────────────────────────────────
    describe('getVideosAction', () => {
        it('returns videos when results are found', async () => {
            const videos = [{ _id: 'v1', name: 'Intro' }];
            VideoTagModel.find.mockReturnValue(buildFindChain(videos));

            await getVideosAction({ query: { offset: '0', limit: '5' } }, res);

            expect(sendOkResponse).toHaveBeenCalledWith({ status: 'OK', videos }, res);
        });

        it('calls sendClientError when results array is empty', async () => {
            VideoTagModel.find.mockReturnValue(buildFindChain([]));

            await getVideosAction({ query: { offset: '0', limit: '5' } }, res);

            expect(sendClientError).toHaveBeenCalledWith(
                expect.anything(),
                res,
                httpCodes.not_found,
            );
        });

        it('calls sendClientError when results are null', async () => {
            VideoTagModel.find.mockReturnValue(buildFindChain(null));

            await getVideosAction({ query: {} }, res);

            expect(sendClientError).toHaveBeenCalled();
        });
    });

    // ── getVideoByIdAction ────────────────────────────────────────────────────
    describe('getVideoByIdAction', () => {
        it('returns video when found', async () => {
            const video = { _id: 'v1', name: 'Tutorial' };
            VideoTagModel.findById.mockReturnValue(buildLeanExecChain(video));

            await getVideoByIdAction({ params: { id: 'v1' } }, res);

            expect(sendOkResponse).toHaveBeenCalledWith({ status: 'OK', video }, res);
        });

        it('calls sendClientError when video is not found', async () => {
            VideoTagModel.findById.mockReturnValue(buildLeanExecChain(null));

            await getVideoByIdAction({ params: { id: 'missing' } }, res);

            expect(sendClientError).toHaveBeenCalledWith(
                expect.anything(),
                res,
                httpCodes.not_found,
            );
        });
    });

    // ── getMediaPostLink ──────────────────────────────────────────────────────
    describe('getMediaPostLink', () => {
        const authHeader = { authorization: 'Bearer token' };

        it('returns bad request when type is missing', async () => {
            await getMediaPostLink(
                {
                    query: { filename: 'v.mp4', contentName: 'V', contentType: 'video/mp4' },
                    headers: authHeader,
                },
                res,
            );

            expect(sendClientError).toHaveBeenCalledWith(
                expect.anything(),
                res,
                httpCodes.bad_request,
            );
        });

        it('returns server error when S3 init fails', async () => {
            mockS3Init.mockResolvedValueOnce(null);

            await getMediaPostLink(
                {
                    query: {
                        filename: 'v.mp4',
                        contentName: 'V',
                        contentType: 'video/mp4',
                        type: 'video/mp4',
                    },
                    headers: authHeader,
                },
                res,
            );

            expect(sendServerError).toHaveBeenCalled();
        });

        it('returns bad request when presigned URL is null', async () => {
            mockGetPresignedUploadingUrl.mockResolvedValueOnce(null);

            await getMediaPostLink(
                {
                    query: {
                        filename: 'v.mp4',
                        contentName: 'V',
                        contentType: 'video/mp4',
                        type: 'video/mp4',
                    },
                    headers: authHeader,
                },
                res,
            );

            expect(sendClientError).toHaveBeenCalled();
        });

        it('returns ok with url and key on success', async () => {
            mockGetPresignedUploadingUrl.mockResolvedValueOnce('https://presigned.url/123');

            await getMediaPostLink(
                {
                    query: {
                        filename: 'clip.mp4',
                        contentName: 'My Clip',
                        contentType: 'video/mp4',
                        type: 'video/mp4',
                    },
                    headers: authHeader,
                },
                res,
            );

            expect(sendOkResponse).toHaveBeenCalledWith(
                expect.objectContaining({ status: 'OK', url: 'https://presigned.url/123' }),
                res,
            );
        });

        it('uses images bucket for image type', async () => {
            await getMediaPostLink(
                {
                    query: {
                        filename: 'photo.jpg',
                        contentName: 'My Photo',
                        contentType: 'image/jpeg',
                        type: 'image/jpeg',
                    },
                    headers: authHeader,
                },
                res,
            );

            expect(sendOkResponse).toHaveBeenCalled();
        });

        it('supports audio type routing (covers getMediaFolder audio branch)', async () => {
            await getMediaPostLink(
                {
                    query: {
                        filename: 'clip.mp3',
                        contentName: 'Audio Clip',
                        contentType: 'audio/mpeg',
                        type: 'audio/mpeg',
                    },
                    headers: authHeader,
                },
                res,
            );

            expect(sendOkResponse).toHaveBeenCalled();
        });
    });

    // ── getMediaBatchPostLinks ────────────────────────────────────────────────
    describe('getMediaBatchPostLinks', () => {
        const authHeader = { authorization: 'Bearer token' };

        it('returns bad request when type is missing', async () => {
            await getMediaBatchPostLinks({ body: { files: [] }, headers: authHeader }, res);

            expect(sendClientError).toHaveBeenCalledWith(
                expect.anything(),
                res,
                httpCodes.bad_request,
            );
        });

        it('returns bad request when files array is empty', async () => {
            await getMediaBatchPostLinks(
                { body: { type: 'video/mp4', files: [] }, headers: authHeader },
                res,
            );

            expect(sendClientError).toHaveBeenCalledWith(
                expect.anything(),
                res,
                httpCodes.bad_request,
            );
        });

        it('returns bad request when a file is missing required fields', async () => {
            await getMediaBatchPostLinks(
                {
                    body: { type: 'video/mp4', files: [{ filename: 'v.mp4' }] },
                    headers: authHeader,
                },
                res,
            );

            expect(sendClientError).toHaveBeenCalled();
        });

        it('returns server error when S3 fails for a file', async () => {
            mockS3Init.mockResolvedValueOnce(null);

            await getMediaBatchPostLinks(
                {
                    body: {
                        type: 'video/mp4',
                        files: [
                            {
                                id: 'f1',
                                filename: 'v.mp4',
                                contentName: 'Video',
                                contentType: 'video/mp4',
                            },
                        ],
                    },
                    headers: authHeader,
                },
                res,
            );

            expect(sendServerError).toHaveBeenCalled();
        });

        it('returns all links for valid file list', async () => {
            mockGetPresignedUploadingUrl.mockResolvedValue('https://batch.url/upload');

            await getMediaBatchPostLinks(
                {
                    body: {
                        type: 'video/mp4',
                        files: [
                            {
                                id: 'f1',
                                filename: 'v1.mp4',
                                contentName: 'Video 1',
                                contentType: 'video/mp4',
                            },
                            {
                                id: 'f2',
                                filename: 'v2.mp4',
                                contentName: 'Video 2',
                                contentType: 'video/mp4',
                            },
                        ],
                    },
                    headers: authHeader,
                },
                res,
            );

            expect(sendOkResponse).toHaveBeenCalledWith(
                expect.objectContaining({ status: 'OK', links: expect.any(Array) }),
                res,
            );
        });
    });

    // ── postVideoAction ───────────────────────────────────────────────────────
    describe('postVideoAction', () => {
        it('creates video without deactivating others when isActive is false', async () => {
            const mockSave = jest.fn().mockResolvedValue({});
            VideoTagModel.mockImplementation(() => ({ save: mockSave }));

            await postVideoAction(
                {
                    body: {
                        name: 'Tutorial',
                        description: 'Guide',
                        key: 'videos/guide.mp4',
                        isActive: false,
                    },
                },
                res,
            );

            expect(VideoTagModel.updateMany).not.toHaveBeenCalled();
            expect(mockSave).toHaveBeenCalled();
            expect(sendOkResponse).toHaveBeenCalledWith(
                expect.objectContaining({ status: 'OK' }),
                res,
            );
        });

        it('deactivates all existing videos when isActive is true', async () => {
            const mockSave = jest.fn().mockResolvedValue({});
            VideoTagModel.mockImplementation(() => ({ save: mockSave }));
            VideoTagModel.updateMany.mockReturnValue({ exec: jest.fn().mockResolvedValue({}) });

            await postVideoAction(
                {
                    body: {
                        name: 'New Promo',
                        description: 'Promo',
                        key: 'videos/promo.mp4',
                        isActive: true,
                    },
                },
                res,
            );

            expect(VideoTagModel.updateMany).toHaveBeenCalledWith(
                { isActive: true },
                { isActive: false },
            );
            expect(mockSave).toHaveBeenCalled();
            expect(sendOkResponse).toHaveBeenCalled();
        });
    });

    // ── updateVideoAction ─────────────────────────────────────────────────────
    describe('updateVideoAction', () => {
        it('returns not found when video does not exist', async () => {
            VideoTagModel.findById.mockReturnValue(buildExecChain(null));

            await updateVideoAction({ body: { id: 'missing' } }, res);

            expect(sendClientError).toHaveBeenCalledWith(
                expect.anything(),
                res,
                httpCodes.not_found,
            );
        });

        it('updates all provided fields and saves', async () => {
            const mockVideo = {
                name: 'Old',
                description: 'Old',
                key: 'old.mp4',
                isActive: false,
                updatedAt: null,
                save: jest.fn().mockResolvedValue({}),
            };
            VideoTagModel.findById.mockReturnValue(buildExecChain(mockVideo));

            await updateVideoAction(
                {
                    body: {
                        id: 'v1',
                        title: 'New Name',
                        description: 'New Desc',
                        videoKey: 'new.mp4',
                        isActive: true,
                    },
                },
                res,
            );

            expect(mockVideo.name).toBe('New Name');
            expect(mockVideo.description).toBe('New Desc');
            expect(mockVideo.key).toBe('new.mp4');
            expect(mockVideo.isActive).toBe(true);
            expect(mockVideo.save).toHaveBeenCalled();
            expect(sendOkResponse).toHaveBeenCalledWith({ status: 'OK', video: mockVideo }, res);
        });

        it('keeps previous fields when nullable payload fields are undefined', async () => {
            const mockVideo = {
                name: 'KeepName',
                description: 'KeepDesc',
                key: 'keep.mp4',
                isActive: true,
                updatedAt: null,
                save: jest.fn().mockResolvedValue({}),
            };
            VideoTagModel.findById.mockReturnValue(buildExecChain(mockVideo));

            await updateVideoAction(
                {
                    body: {
                        id: 'v1',
                        title: undefined,
                        description: undefined,
                        videoKey: undefined,
                        isActive: undefined,
                    },
                },
                res,
            );

            expect(mockVideo.name).toBe('KeepName');
            expect(mockVideo.description).toBe('KeepDesc');
            expect(mockVideo.key).toBe('keep.mp4');
            expect(mockVideo.isActive).toBe(true);
            expect(mockVideo.save).toHaveBeenCalled();
        });
    });

    // ── deleteVideoAction ─────────────────────────────────────────────────────
    describe('deleteVideoAction', () => {
        it('returns not found when video does not exist', async () => {
            VideoTagModel.findById.mockReturnValue(buildExecChain(null));

            await deleteVideoAction({ params: { id: 'missing' } }, res);

            expect(sendClientError).toHaveBeenCalledWith(
                expect.anything(),
                res,
                httpCodes.not_found,
            );
        });

        it('deletes video from DB and S3 on success', async () => {
            const mockVideo = {
                key: 'videos/clip.mp4',
                deleteOne: jest.fn().mockResolvedValue({}),
            };
            VideoTagModel.findById.mockReturnValue(buildExecChain(mockVideo));

            await deleteVideoAction({ params: { id: 'v1' } }, res);

            expect(mockDeleteFile).toHaveBeenCalledWith('videos/clip.mp4');
            expect(mockVideo.deleteOne).toHaveBeenCalled();
            expect(sendOkResponse).toHaveBeenCalledWith({ status: 'OK' }, res);
        });

        it('returns server error when S3 delete fails', async () => {
            const mockVideo = { key: 'videos/clip.mp4', deleteOne: jest.fn() };
            VideoTagModel.findById.mockReturnValue(buildExecChain(mockVideo));
            mockDeleteFile.mockResolvedValueOnce({ $metadata: { httpStatusCode: 500 } });

            await deleteVideoAction({ params: { id: 'v1' } }, res);

            expect(sendServerError).toHaveBeenCalled();
            expect(mockVideo.deleteOne).not.toHaveBeenCalled();
        });

        it('throws when S3 client cannot be initialized', async () => {
            const mockVideo = { key: 'videos/clip.mp4', deleteOne: jest.fn() };
            VideoTagModel.findById.mockReturnValue(buildExecChain(mockVideo));
            mockS3Init.mockResolvedValueOnce(null);

            await expect(deleteVideoAction({ params: { id: 'v1' } }, res)).rejects.toThrow(
                'Cannot connect to service',
            );
        });
    });

    // ── getActiveVideoAction ──────────────────────────────────────────────────
    describe('getActiveVideoAction', () => {
        it('returns active video when found', async () => {
            const video = { _id: 'v1', isActive: true };
            VideoTagModel.findOne.mockReturnValue(buildLeanExecChain(video));

            await getActiveVideoAction({}, res);

            expect(sendOkResponse).toHaveBeenCalledWith({ status: 'OK', video }, res);
        });

        it('returns not found when no active video exists', async () => {
            VideoTagModel.findOne.mockReturnValue(buildLeanExecChain(null));

            await getActiveVideoAction({}, res);

            expect(sendClientError).toHaveBeenCalledWith(
                expect.anything(),
                res,
                httpCodes.not_found,
            );
        });
    });

    // ── activateVideoAction ───────────────────────────────────────────────────
    describe('activateVideoAction', () => {
        it('returns bad request when target video is not found', async () => {
            // findOne returns no current active video; findById also returns null
            VideoTagModel.findOne.mockReturnValue(buildExecChain(null));
            VideoTagModel.findById.mockReturnValue(buildExecChain(null));

            await activateVideoAction({ params: { id: 'missing' } }, res);

            expect(sendClientError).toHaveBeenCalledWith(
                expect.anything(),
                res,
                httpCodes.bad_request,
            );
        });

        it('deactivates current active video and activates target', async () => {
            const currentActive = { isActive: true, save: jest.fn().mockResolvedValue({}) };
            const targetVideo = {
                isActive: false,
                updatedAt: null,
                save: jest.fn().mockResolvedValue({}),
            };

            VideoTagModel.findOne.mockReturnValue(buildExecChain(currentActive));
            VideoTagModel.findById.mockReturnValue(buildExecChain(targetVideo));

            await activateVideoAction({ params: { id: 'v2' } }, res);

            expect(currentActive.isActive).toBe(false);
            expect(currentActive.save).toHaveBeenCalled();
            expect(targetVideo.isActive).toBe(true);
            expect(targetVideo.save).toHaveBeenCalled();
            expect(sendOkResponse).toHaveBeenCalledWith({ status: 'OK' }, res);
        });

        it('activates target video when no video is currently active', async () => {
            const targetVideo = {
                isActive: false,
                updatedAt: null,
                save: jest.fn().mockResolvedValue({}),
            };

            VideoTagModel.findOne.mockReturnValue(buildExecChain(null));
            VideoTagModel.findById.mockReturnValue(buildExecChain(targetVideo));

            await activateVideoAction({ params: { id: 'v2' } }, res);

            expect(targetVideo.isActive).toBe(true);
            expect(targetVideo.save).toHaveBeenCalled();
            expect(sendOkResponse).toHaveBeenCalledWith({ status: 'OK' }, res);
        });
    });

    // ── deactivateVideoAction ─────────────────────────────────────────────────
    describe('deactivateVideoAction', () => {
        it('deactivates target video successfully', async () => {
            const targetVideo = {
                isActive: true,
                updatedAt: null,
                save: jest.fn().mockResolvedValue({}),
            };

            VideoTagModel.findOne.mockReturnValue(buildExecChain(null));
            VideoTagModel.findById.mockReturnValue(buildExecChain(targetVideo));

            await deactivateVideoAction({ params: { id: 'v1' } }, res);

            expect(targetVideo.isActive).toBe(false);
            expect(targetVideo.save).toHaveBeenCalled();
            expect(sendOkResponse).toHaveBeenCalledWith({ status: 'OK' }, res);
        });

        it('returns bad request when video to deactivate is not found', async () => {
            VideoTagModel.findOne.mockReturnValue(buildExecChain(null));
            VideoTagModel.findById.mockReturnValue(buildExecChain(null));

            await deactivateVideoAction({ params: { id: 'missing' } }, res);

            expect(sendClientError).toHaveBeenCalledWith(
                expect.anything(),
                res,
                httpCodes.bad_request,
            );
        });
    });
});
