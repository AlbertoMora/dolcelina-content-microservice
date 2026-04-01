import { Express } from 'express';
import bannersRoutes from '../routes/banners.routes';
import mediaRoutes from '../routes/media.routes';
import productsRoutes from '../routes/products.route';

export const setRoutesConfig = (app: Express) => {
    app.use('/v1/banners/', bannersRoutes);
    app.use('/v1/media/', mediaRoutes);
    app.use('/v1/products/', productsRoutes);
};
