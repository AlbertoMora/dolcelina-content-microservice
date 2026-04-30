import { Router } from 'express';

import { checkTokenMiddleware, controllerHandler } from '@amora95/commons';
import {
    createCategoryAction,
    createProductAction,
    getCategoriesAction,
    getProductByIdAction,
    getProductsAction,
    updateProductAction,
} from '../controllers/products.controller';

const router = Router();

router.get('/', controllerHandler(getProductsAction));
router.post('/', checkTokenMiddleware, controllerHandler(createProductAction));
router.put('/:id', checkTokenMiddleware, controllerHandler(updateProductAction));
//router.delete('/', checkTokenMiddleware, controllerHandler(deleteProductAction));
router.get('/:id', controllerHandler(getProductByIdAction));
router.get('/categories/', controllerHandler(getCategoriesAction));
router.post('/categories/', checkTokenMiddleware, controllerHandler(createCategoryAction));

export default router;
