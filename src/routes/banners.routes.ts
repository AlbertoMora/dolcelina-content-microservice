import { Router } from 'express';
import { checkTokenMiddleware, controllerHandler } from '@amora95/commons';
import {
    createBannerAction,
    deleteBannerAction,
    getBannerByIdAction,
    getBannersAction,
    getImagePostLink,
    updateBannerAction,
} from '../controllers/banners.controller';

const router = Router();

router.get('/', controllerHandler(getBannersAction));
router.get('/:id', controllerHandler(getBannerByIdAction));
router.get('/image/link', checkTokenMiddleware, controllerHandler(getImagePostLink));
router.post('/', checkTokenMiddleware, controllerHandler(createBannerAction));
router.put('/:id', checkTokenMiddleware, controllerHandler(updateBannerAction));
router.delete('/:id', checkTokenMiddleware, controllerHandler(deleteBannerAction));

export default router;
