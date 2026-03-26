import { Request, Response } from 'express';
import { SequelizeService } from '../services/sequelize-service';
import {
    ICreateProductViewModel,
    IGetProductsQueryViewModel,
} from '../viewmodels/products.viewmodels';
import { Op } from 'sequelize';
import { avoidNanParseInt, responseCodes, sendOkResponse } from '@aure/commons';
import { getUserSession } from '../utils/session-helper';
import moment from 'moment';

export const getProductsAction = async (
    req: Request<{}, {}, {}, IGetProductsQueryViewModel>,
    res: Response,
) => {
    const { orderField, orderDirection, limit, offset } = req.query;
    const queryParams = getProductQueryParams(req.query);

    const sequelize = await SequelizeService.getInstance();

    const products = await sequelize.db.product.findAll({
        limit: avoidNanParseInt(limit),
        offset: avoidNanParseInt(offset),
        order: [[orderField, orderDirection]],
        where: queryParams,
    });

    return sendOkResponse(
        {
            products,
        },
        res,
    );
};

export const getProductByIdAction = async (req: Request, res: Response) => {
    const { id } = req.params;
    const sequelize = await SequelizeService.getInstance();
    const product = await sequelize.db.product.findByPk(id);

    if (!product) return res.status(404).send({ message: 'Product not found' });
    return res.send(product);
};

export const createProductAction = async (
    req: Request<{}, {}, ICreateProductViewModel>,
    res: Response,
) => {
    const { images, ...data } = req.body;
    const sequelize = await SequelizeService.getInstance();
    const userInfo = getUserSession(req.headers.authorization || '');

    const newProduct = await sequelize.db.product.create({
        id: crypto.randomUUID(),
        ...data,
        created_by: userInfo?.user.id ?? 'system',
        creation_date: moment().utc().toDate(),
        last_modified: moment().utc().toDate(),
    });

    const savedImages = await Promise.all(
        images.map(imageId =>
            sequelize.db.product_image.create({
                id: crypto.randomUUID(),
                product_id: newProduct.id,
                image_url: imageId,
                created_at: moment().utc().toDate(),
            }),
        ),
    );

    return sendOkResponse(
        {
            status: responseCodes.ok,
            product: newProduct,
            images: savedImages,
        },
        res,
    );
};

const getProductQueryParams = (query: IGetProductsQueryViewModel) => {
    const where: any = {};

    if (query.name) where.name = query.name;
    if (query.calories) where.calories = query.calories;
    if (query.price_min) where.price = { ...where.price, [Op.gte]: query.price_min };
    if (query.price_max) where.price = { ...where.price, [Op.lte]: query.price_max };
    if (query.is_active !== undefined) where.is_active = query.is_active ? 1 : 0;

    return where;
};
