import { Request, Response } from 'express';
import { SequelizeService } from '../services/sequelize-service';
import {
    ICreateCategoryViewModel,
    ICreateProductViewModel,
    IGetCategoryViewModel,
    IGetProductsQueryViewModel,
    IUpdateProductViewModel,
} from '../viewmodels/products.viewmodels';
import { col, fn, Op } from 'sequelize';
import { avoidNanParseInt, responseCodes, sendOkResponse } from '@amora95/commons';
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
        include: [
            {
                model: sequelize.db.category,
                as: 'category',
                attributes: ['id', 'name'],
            },
        ],
    });

    const total = await sequelize.db.product.count({});
    const minMaxPrice = (await sequelize.db.product.findOne({
        attributes: [
            [fn('MIN', col('price')), 'minPrice'],
            [fn('MAX', col('price')), 'maxPrice'],
        ],
    })) as any;

    return sendOkResponse(
        {
            products,
            total,
            minPrice: minMaxPrice?.getDataValue('minPrice') ?? 0,
            maxPrice: minMaxPrice?.getDataValue('maxPrice') ?? 0,
            status: responseCodes.ok,
        },
        res,
    );
};

export const getProductByIdAction = async (req: Request, res: Response) => {
    const { id } = req.params;
    const sequelize = await SequelizeService.getInstance();
    const product = await sequelize.db.product.findByPk(id);

    if (!product) return res.status(404).send({ message: 'Product not found' });
    return res.send({ status: responseCodes.ok, product });
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

export const createCategoryAction = async (
    req: Request<{}, {}, ICreateCategoryViewModel, {}>,
    res: Response,
) => {
    const { name, description } = req.body;

    const sequelize = await SequelizeService.getInstance();

    const newCategory = await sequelize.db.category.create({
        id: crypto.randomUUID(),
        name,
        description,
        creation_date: moment().utc().toDate(),
    });

    return sendOkResponse(
        {
            status: responseCodes.ok,
            category: newCategory,
        },
        res,
    );
};

export const getCategoriesAction = async (
    req: Request<{}, {}, {}, IGetCategoryViewModel>,
    res: Response,
) => {
    const { orderDirection, orderField, limit, offset } = req.query;
    const where = getCategoriesQueryParams(req.query);

    const sequelize = await SequelizeService.getInstance();
    const categories = await sequelize.db.category.findAll({
        where,
        limit: avoidNanParseInt(limit),
        offset: avoidNanParseInt(offset),
        order: [[orderField, orderDirection]],
    });
    return sendOkResponse(
        {
            status: responseCodes.ok,
            categories,
        },
        res,
    );
};

export const updateProductAction = async (
    req: Request<{ id: string }, {}, IUpdateProductViewModel>,
    res: Response,
) => {
    const { id } = req.params;
    const { images, ...data } = req.body;
    const sequelize = await SequelizeService.getInstance();

    const product = await sequelize.db.product.findByPk(id);
    if (!product) return res.status(404).send({ message: 'Product not found' });

    await product.update({
        ...data,
        last_modified: moment().utc().toDate(),
    });

    if (images && images.length > 0) {
        await sequelize.db.product_image.destroy({ where: { product_id: id } });
        await Promise.all(
            images.map(imageId =>
                sequelize.db.product_image.create({
                    id: crypto.randomUUID(),
                    product_id: id,
                    image_url: imageId,
                    created_at: moment().utc().toDate(),
                }),
            ),
        );
    }

    return sendOkResponse(
        { status: responseCodes.ok, message: 'Product updated successfully', product },
        res,
    );
};

const getProductQueryParams = (query: IGetProductsQueryViewModel) => {
    const where: any = {};

    if (query.name) where.title = { [Op.like]: `%${query.name}%` };
    if (query.calories) where.calories = query.calories;
    if (query.min_price) where.price = { ...where.price, [Op.gte]: query.min_price };
    if (query.max_price) where.price = { ...where.price, [Op.lte]: query.max_price };
    if (query.is_active !== undefined) where.is_active = query.is_active ? 1 : 0;
    if (query.category_id) where.category_id = query.category_id;

    return where;
};

const getCategoriesQueryParams = (query: IGetCategoryViewModel) => {
    const where: any = {};

    if (query.id) where.id = query.id;
    if (query.name) where.name = { [Op.like]: `%${query.name}%` };
    if (query.description) where.description = { [Op.like]: `%${query.description}%` };
    if (query.creation_date) where.creation_date = query.creation_date;
    return where;
};
