import express from 'express';
import pb from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';

const router = express.Router();

// Create Order
router.post('/create', async (req, res) => {
  const {
    userId,
    items,
    subtotal,
    tax,
    discount,
    total,
    paymentMethod,
    billingAddress,
    paymentStatus,
  } = req.body;

  if (
    !userId ||
    !items ||
    !Array.isArray(items) ||
    items.length === 0 ||
    subtotal === undefined ||
    tax === undefined ||
    discount === undefined ||
    total === undefined ||
    !paymentMethod ||
    !billingAddress ||
    !paymentStatus
  ) {
    return res.status(400).json({
      error: 'Missing or invalid required fields',
    });
  }

  // Create order record
  const orderRecord = await pb.collection('orders').create({
    userId,
    subtotal,
    tax,
    discount,
    total,
    paymentMethod,
    billingAddress: JSON.stringify(billingAddress),
    paymentStatus,
    orderStatus: 'pending',
  });

  logger.info(`Order created: ${orderRecord.id}`);

  // Create order items
  for (const item of items) {
    await pb.collection('orderItems').create({
      orderId: orderRecord.id,
      productId: item.productId,
      productName: item.productName,
      quantity: item.quantity,
      price: item.price,
      subtotal: item.subtotal,
    });
  }

  logger.info(`Order items created for order: ${orderRecord.id}`);

  // Create payment record
  const paymentRecord = await pb.collection('payments').create({
    orderId: orderRecord.id,
    userId,
    amount: total,
    paymentMethod,
    paymentStatus,
    transactionId: '',
  });

  logger.info(`Payment record created: ${paymentRecord.id}`);

  res.json({
    orderId: orderRecord.id,
    status: 'success',
    message: 'Order created successfully',
  });
});

// Create Order (New endpoint for orders/create-order)
router.post('/create-order', async (req, res) => {
  const {
    customerId,
    customerName,
    customerEmail,
    customerMobile,
    customerCompany,
    serviceRequirement,
    items,
    totalAmount,
    razorpayPaymentId,
    razorpayOrderId,
  } = req.body;

  if (
    !customerId ||
    !customerName ||
    !customerEmail ||
    !customerMobile ||
    !items ||
    !Array.isArray(items) ||
    items.length === 0 ||
    totalAmount === undefined ||
    !razorpayPaymentId ||
    !razorpayOrderId
  ) {
    return res.status(400).json({
      error: 'Missing or invalid required fields: customerId, customerName, customerEmail, customerMobile, items, totalAmount, razorpayPaymentId, razorpayOrderId',
    });
  }

  // Create order in PocketBase
  const order = await pb.collection('orders').create({
    orderId: 'ORD-' + Date.now(),
    customerId,
    customerName,
    customerEmail,
    customerMobile,
    customerCompany: customerCompany || '',
    serviceRequirement: serviceRequirement || '',
    items: JSON.stringify(items),
    totalAmount,
    razorpayPaymentId,
    razorpayOrderId,
    status: 'New Order',
    createdAt: new Date(),
  });

  logger.info(`Order created: ${order.id}`);

  // Create lead in PocketBase
  const lead = await pb.collection('leads').create({
    name: customerName,
    email: customerEmail,
    mobile: customerMobile,
    company: customerCompany || '',
    serviceInterest: serviceRequirement || '',
    source: 'Website - Direct Purchase',
    status: 'New Order',
    description: serviceRequirement || '',
  });

  logger.info(`Lead created: ${lead.id}`);

  res.json({
    orderId: order.id,
    success: true,
  });
});

export default router;