import { Router } from 'express';

import { checkTokenMiddleware, controllerHandler } from '@aure/commons';
import {
    createCategoryAction,
    createProductAction,
    getCategoriesAction,
    getProductsAction,
} from '../controllers/products.controller';

const router = Router();

router.get('/', controllerHandler(getProductsAction));
router.post('/', checkTokenMiddleware, controllerHandler(createProductAction));
//router.put('/', checkTokenMiddleware, controllerHandler(updateProductAction));
//router.delete('/', checkTokenMiddleware, controllerHandler(deleteProductAction));
//router.get('/:id', controllerHandler(getProductByIdAction));
router.get('/categories/', controllerHandler(getCategoriesAction));
router.post('/categories/', checkTokenMiddleware, controllerHandler(createCategoryAction));

export default router;
