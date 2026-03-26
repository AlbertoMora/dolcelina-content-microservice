import { Request, Response } from 'express';
import { SequelizeService } from '../services/sequelize-service';
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
import { serviceErrors } from '../constants/service-errors';
import {
    ICreateBannerViewModel,
    IGetBannersQueryViewModel,
} from '../viewmodels/banners.viewmodels';
import { IGetLinkViewModel } from '../viewmodels/link.viewmodel';
import { getUserSession } from '../utils/session-helper';
import { stringToSlug } from '../utils/text-helper';
import moment from 'moment';
import { s3ImagesBucketKey, s3Key } from '../constants/secrets-contants';
import { Op } from 'sequelize';
import { IQueryViewModel } from '../types/commons.types';

export const getBannersAction = async (
    req: Request<{}, {}, {}, IGetBannersQueryViewModel>,
    res: Response,
) => {
    const { orderField, orderDirection, limit, offset, ...rest } = req.query;
    const params = getSearchableFields(rest);

    const sequelize = await SequelizeService.getInstance();

    const banners = await sequelize.db.banner.findAll({
        limit: avoidNanParseInt(limit),
        offset: avoidNanParseInt(offset),
        order: [[orderField, orderDirection]],
        where: {
            ...params,
        },
    });

    if (!banners) return sendClientError(serviceErrors.srv01, res, httpCodes.not_found);

    return sendOkResponse(
        {
            status: responseCodes.ok,
            banners,
        },
        res,
    );
};

export const getBannerByIdAction = async (req: Request, res: Response) => {
    const { id } = req.params;
    const sequelize = await SequelizeService.getInstance();

    const banner = await sequelize.db.banner.findByPk(id);

    if (!banner) return sendClientError(serviceErrors.srv01, res, httpCodes.not_found);

    return sendOkResponse({ status: responseCodes.ok, banner }, res);
};

export const createBannerAction = async (
    req: Request<{}, {}, ICreateBannerViewModel, {}>,
    res: Response,
) => {
    const { title, description, has_button, is_active, redirects, image_url, btn_icon, btn_text } =
        req.body;

    const { user } = getUserSession(req.headers['authorization'] as string);

    const sequelize = await SequelizeService.getInstance();
    const newBanner = await sequelize.db.banner.create({
        id: crypto.randomUUID(),
        title,
        description,
        has_button: has_button ? 1 : 0,
        is_active: is_active ? 1 : 0,
        redirects,
        image_url,
        btn_icon,
        btn_text,
        created_at: moment().utc().toDate(),
        last_modified: moment().utc().toDate(),
        created_by: user.id,
    });

    if (!newBanner)
        return sendServerError(new Error('Error creating banner'), res, serviceErrors.srv01);
    return sendOkResponse({ status: responseCodes.ok, banner: newBanner }, res);
};

export const updateBannerAction = async (
    req: Request<{ id: string }, {}, ICreateBannerViewModel, {}>,
    res: Response,
) => {
    const { id } = req.params;
    const { title, description, has_button, is_active, redirects, image_url, btn_icon, btn_text } =
        req.body;

    const sequelize = await SequelizeService.getInstance();

    const banner = await sequelize.db.banner.findByPk(id);
    if (!banner) return sendClientError(serviceErrors.srv01, res, httpCodes.not_found);

    const updatePayload: Record<string, unknown> = {
        last_modified: moment().utc().toDate(),
    };

    if (title !== undefined) updatePayload.title = title;
    if (description !== undefined) updatePayload.description = description;
    if (redirects !== undefined) updatePayload.redirects = redirects;
    if (image_url !== undefined) updatePayload.image_url = image_url;
    if (has_button !== undefined) updatePayload.has_button = has_button ? 1 : 0;
    if (is_active !== undefined) updatePayload.is_active = is_active ? 1 : 0;
    if (btn_icon !== undefined) updatePayload.btn_icon = btn_icon;
    if (btn_text !== undefined) updatePayload.btn_text = btn_text;

    const updatedBanner = await banner.update(updatePayload);

    return sendOkResponse({ status: responseCodes.ok, banner: updatedBanner }, res);
};

export const deleteBannerAction = async (req: Request<{ id: string }>, res: Response) => {
    const { id } = req.params;

    const sequelize = await SequelizeService.getInstance();

    const bannerCount = await sequelize.db.banner.count();
    if (bannerCount <= 1) return sendClientError(serviceErrors.srv05, res, httpCodes.bad_request);

    const banner = await sequelize.db.banner.findByPk(id);
    if (!banner) return sendClientError(serviceErrors.srv01, res, httpCodes.not_found);

    const updatedBanner = await banner.update({
        is_active: 0,
        last_modified: moment().utc().toDate(),
    });

    return sendOkResponse({ status: responseCodes.ok, banner: updatedBanner }, res);
};

export const getImagePostLink = async (
    req: Request<{}, {}, {}, IGetLinkViewModel>,
    res: Response,
) => {
    const { filename, contentName, contentType } = req.query;
    const { user } = getUserSession(req.headers['authorization'] as string);

    const s3 = await new S3ClientService().init(s3ImagesBucketKey, s3Key);
    if (!s3) return sendServerError(new Error('Cannot connect to service'), res, webErrors.srv01);

    const fileExt = filename.substring(filename.lastIndexOf('.'));
    const key = `banners/${user.id}/${stringToSlug(
        contentName,
    )}/${moment().unix()}-${stringToSlug(filename)}${fileExt}`;

    const url = await s3.getPresignedUploadingUrl(key, contentType);

    sendOkResponse({ status: responseCodes.ok, url, key }, res);
};

const getSearchableFields = (query: Omit<IGetBannersQueryViewModel, keyof IQueryViewModel>) => {
    const { description, has_button, is_active, title } = query;
    const searchableFields: Record<string, unknown> = {};

    if (description) searchableFields.description = { [Op.like]: `%${description}%` };
    if (has_button !== undefined) searchableFields.has_button = has_button ? 1 : 0;
    if (is_active !== undefined) searchableFields.is_active = is_active ? 1 : 0;
    if (title) searchableFields.title = { [Op.like]: `%${title}%` };
    return searchableFields;
};
