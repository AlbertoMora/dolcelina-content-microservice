import { Express } from 'express';
import bannersRoutes from '../routes/banners.routes';
import mediaRoutes from '../routes/media.routes';

export const setRoutesConfig = (app: Express) => {
    app.use('/v1/banners/', bannersRoutes);
    app.use('/v1/media/', mediaRoutes);
};
