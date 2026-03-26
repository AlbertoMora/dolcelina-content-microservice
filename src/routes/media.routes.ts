import { Router } from 'express';
import { checkTokenMiddleware, controllerHandler } from '@aure/commons';
import {
    activateVideoAction,
    deactivateVideoAction,
    deleteVideoAction,
    getActiveVideoAction,
    getMediaBatchPostLinks,
    getVideoByIdAction,
    getMediaPostLink,
    getVideosAction,
    postVideoAction,
    updateVideoAction,
} from '../controllers/media.controller';

const router = Router();

//? Video Routes
router.get('/video/', controllerHandler(getVideosAction));
router.get('/video/active', controllerHandler(getActiveVideoAction));
router.get('/link', checkTokenMiddleware, controllerHandler(getMediaPostLink));
router.post('/links', checkTokenMiddleware, controllerHandler(getMediaBatchPostLinks));
router.post('/video/', checkTokenMiddleware, controllerHandler(postVideoAction));
router.put('/video/', checkTokenMiddleware, controllerHandler(updateVideoAction));
router.delete('/video/', checkTokenMiddleware, controllerHandler(deleteVideoAction));
router.put('/video/activate/:id', checkTokenMiddleware, controllerHandler(activateVideoAction));
router.put('/video/deactivate/:id', checkTokenMiddleware, controllerHandler(deactivateVideoAction));
router.get('/video/:id', controllerHandler(getVideoByIdAction));

export default router;
