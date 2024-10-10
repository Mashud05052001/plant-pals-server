import { Router } from 'express';
import validateRequest from '../../middleware/validateRequest';
import paymentValidationSchema from './payment.validation';
import auth from '../../middleware/auth';
import { PaymentService } from './payment.services';

const router = Router();

// aamarPay
router.post(
  '/',
  validateRequest(paymentValidationSchema),
  auth(false, 'ADMIN', 'USER'),
  PaymentService.createPayment,
);

router.post('/success', PaymentService.confirmationPayment);
router.post('/failed', PaymentService.confirmationPayment);

router.get('/', auth(false, 'ADMIN'), PaymentService.getAllPayments);

export const PaymentRoutes = router;
