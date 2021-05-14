import { Router } from 'express';
import {
  getCheckout,
  setConsignmentToCheckout,
  updateShippingOption,
  setBillingAddressToCheckout,
  createOrder
} from '../controller/checkout';
import { permissionMiddleware } from '../middleware';

const router = Router();

router.get('/getCheckout', permissionMiddleware, getCheckout);
router.post(
  '/setConsignmentToCheckout',
  permissionMiddleware,
  setConsignmentToCheckout
);
router.put('/updateShippingOption', permissionMiddleware, updateShippingOption);
router.post(
  '/setBillingAddressToCheckout',
  permissionMiddleware,
  setBillingAddressToCheckout
);
router.post('/createOrder', permissionMiddleware, createOrder);

export default router;
