import express from 'express'
import { rzpSubscriptionWebhook } from '../controllers/webhookController.js';

const router = express.Router();

router.post('/subscription', rzpSubscriptionWebhook)

export default router;