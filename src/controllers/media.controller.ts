import { Request, Response } from 'express';
import VideoTagModel from '../models/mongoose/VideoTags';
import {
    avoidNanParseInt,
    httpCodes,
    responseCodes,
    S3ClientService,
    sendClientError,
    sendOkResponse,
    sendServerError,
    webErrors,
} from '@aure/commons';
import { IQueryViewModel } from '../types/commons.types';
import { serviceErrors } from '../constants/service-errors';
import { IGetBatchLinkViewModel, IGetLinkViewModel } from '../viewmodels/link.viewmodel';
import { getUserSession } from '../utils/session-helper';
import { s3ImagesBucketKey, s3Key, s3VideoBucketKey } from '../constants/secrets-contants';
import { stringToSlug } from '../utils/text-helper';
import moment from 'moment';
import { IVideoViewModel } from '../viewmodels/video.viewmodel';

export const getVideosAction = async (req: Request<{}, {}, {}, IQueryViewModel>, res: Response) => {
    const { offset, limit } = req.query;

    const results = await VideoTagModel.find({})
        .sort({ isActive: -1, createdDate: -1 })
        .skip(avoidNanParseInt(offset) ?? 0)
        .limit(avoidNanParseInt(limit) ?? 0)
        .lean()
        .exec();
    if (!results || results.length === 0)
        return sendClientError(serviceErrors.vid01, res, httpCodes.not_found);

    return sendOkResponse({ status: responseCodes.ok, videos: results }, res);
};

export const getVideoByIdAction = async (req: Request<{ id: string }>, res: Response) => {
    const { id } = req.params;
    const result = await VideoTagModel.findById(id).lean().exec();
    if (!result) return sendClientError(serviceErrors.vid02, res, httpCodes.not_found);

    return sendOkResponse({ status: responseCodes.ok, video: result }, res);
};

export const getMediaPostLink = async (
    req: Request<{}, {}, {}, IGetLinkViewModel>,
    res: Response,
) => {
    const { filename, contentName, contentType, type } = req.query;
    const { user } = getUserSession(req.headers['authorization'] as string);

    if (!type) return sendClientError(serviceErrors.vid09, res, httpCodes.bad_request);

    const result = await getMediaUrl(
        filename,
        contentName,
        contentType,
        getMediaFolder(type),
        user.id,
    );
    if (!result) return sendServerError(serviceErrors.vid06, res, webErrors.srv01);

    const { url, key } = result;

    if (!url) return sendClientError(serviceErrors.vid08, res, httpCodes.bad_request);

    sendOkResponse({ status: responseCodes.ok, url, key }, res);
};

export const getMediaBatchPostLinks = async (
    req: Request<{}, {}, IGetBatchLinkViewModel, {}>,
    res: Response,
) => {
    const { type, files } = req.body;
    const { user } = getUserSession(req.headers['authorization'] as string);

    if (!type) return sendClientError(serviceErrors.vid09, res, httpCodes.bad_request);

    if (
        !Array.isArray(files) ||
        files.length === 0 ||
        files.some(file => !file?.filename || !file?.contentName || !file?.contentType)
    ) {
        return sendClientError(serviceErrors.vid10, res, httpCodes.bad_request);
    }

    const links = await Promise.all(
        files.map(async file => {
            const folder = getMediaFolder(type);
            const result = await getMediaUrl(
                file.filename,
                file.contentName,
                file.contentType,
                folder,
                user.id,
                folder === 'images' ? s3ImagesBucketKey : s3VideoBucketKey,
            );

            if (!result?.url) return null;

            return {
                id: file.id,
                filename: file.filename,
                contentName: file.contentName,
                contentType: file.contentType,
                url: result.url,
                key: result.key,
            };
        }),
    );

    if (links.some(link => !link))
        return sendServerError(serviceErrors.vid08, res, webErrors.srv01);

    sendOkResponse({ status: responseCodes.ok, links }, res);
};

export const postVideoAction = async (req: Request<{}, {}, IVideoViewModel, {}>, res: Response) => {
    const { name, description, key, isActive } = req.body;

    if (isActive) await VideoTagModel.updateMany({ isActive: true }, { isActive: false }).exec();

    const video = new VideoTagModel({
        name,
        description,
        key,
        isActive,
        createdAt: moment().utc().toDate(),
        updatedAt: moment().utc().toDate(),
    });

    if (!video) return sendServerError(serviceErrors.vid03, res, webErrors.srv01);

    await video.save();

    sendOkResponse({ status: responseCodes.ok, video }, res);
};

export const updateVideoAction = async (req: Request, res: Response) => {
    const { id, title, description, videoKey, isActive } = req.body;
    const video = await VideoTagModel.findById(id).exec();
    if (!video) return sendClientError(serviceErrors.vid02, res, httpCodes.not_found);

    video.name = title ?? video.name;
    video.description = description ?? video.description;
    video.key = videoKey ?? video.key;
    video.isActive = isActive ?? video.isActive;
    video.updatedAt = moment().utc().toDate();

    await video.save();
    sendOkResponse({ status: responseCodes.ok, video }, res);
};

export const deleteVideoAction = async (req: Request<{ id: string }>, res: Response) => {
    const { id } = req.params;
    const video = await VideoTagModel.findById(id).exec();
    if (!video) return sendClientError(serviceErrors.vid02, res, httpCodes.not_found);

    const s3Res = await deleteFromS3(s3VideoBucketKey, video.key);
    if (s3Res.$metadata.httpStatusCode !== httpCodes.ok)
        return sendServerError(serviceErrors.vid05, res, webErrors.srv01);

    await video.deleteOne();

    return sendOkResponse({ status: responseCodes.ok }, res);
};

const deleteFromS3 = async (bucketId: string, key: string) => {
    const s3 = await new S3ClientService().init(s3VideoBucketKey, s3Key);
    if (!s3) throw new Error('Cannot connect to service');
    return await s3.deleteFile(key);
};

export const activateVideoAction = async (req: Request<{ id: string }>, res: Response) => {
    const { id } = req.params;

    const isOk = await changeVideoStatus(id, true);
    if (!isOk) return sendClientError(serviceErrors.vid07, res, httpCodes.bad_request);

    return sendOkResponse({ status: responseCodes.ok }, res);
};

export const deactivateVideoAction = async (req: Request<{ id: string }>, res: Response) => {
    const { id } = req.params;
    const isOk = await changeVideoStatus(id, false);
    if (!isOk) return sendClientError(serviceErrors.vid07, res, httpCodes.bad_request);

    return sendOkResponse({ status: responseCodes.ok }, res);
};

export const getActiveVideoAction = async (req: Request, res: Response) => {
    const video = await VideoTagModel.findOne({ isActive: true }).lean().exec();
    if (!video) return sendClientError(serviceErrors.vid02, res, httpCodes.not_found);

    sendOkResponse({ status: responseCodes.ok, video }, res);
};

const changeVideoStatus = async (id: string, isActive: boolean) => {
    const currentActiveVideo = await VideoTagModel.findOne({ isActive: true }).exec();
    if (isActive && currentActiveVideo) {
        currentActiveVideo.isActive = false;
        await currentActiveVideo.save();
    }

    const video = await VideoTagModel.findById(id).exec();
    if (!video) return false;
    video.isActive = isActive;
    video.updatedAt = moment().utc().toDate();
    await video.save();
    return true;
};

const getMediaUrl = async (
    filename: string,
    contentName: string,
    contentType: string,
    folder: string,
    userId: string,
    bucket: string = s3VideoBucketKey,
) => {
    const s3 = await new S3ClientService().init(bucket, s3Key);
    if (!s3) return null;

    const fileExt = filename.substring(filename.lastIndexOf('.'));
    const key = `${folder}/${userId}/${stringToSlug(
        contentName,
    )}/${moment().unix()}-${stringToSlug(filename)}${fileExt}`;
    const url = await s3.getPresignedUploadingUrl(key, contentType);

    return { url, key };
};

const getMediaFolder = (type: string) => {
    if (type.includes('video')) return 'videos';
    if (type.includes('audio')) return 'sounds';
    return 'images';
};
