import OrderModel from "../models/order.model.js";
import ProductModel from "../models/product.model.js";
import UserModel from "../models/user.model.js";
import AddressModel from "../models/address.model.js";
import { isValidObjectId } from "mongoose";
import Razorpay from "razorpay";
import { razorpayInstance } from "../config/loadRazorPay.js";

export const getOrderDetailsByUserController = async (request, response) => {
  try {
    const { userId } = request;

    if (!userId) {
      return response.status(401).json({
        errorMessage: "Unauthorized: User ID is required",
        success: false,
        timestamp: new Date().toISOString(),
      });
    }

    const orders = await OrderModel.find({ user_id: userId })
      .populate("products.product_id", "name price image")
      .populate("user_id", "name email phone_number")
      .populate("delivery_address", "address_line city state zip_code");

    if (!orders || orders.length === 0) {
      return response.status(404).json({
        errorMessage: "No orders found for this user",
        success: false,
        timestamp: new Date().toISOString(),
      });
    }

    return response.status(200).json({
      message: "Orders retrieved successfully",
      data: orders,
      success: true,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Get Order Details Error", error);
    return response.status(500).json({
      errorMessage: error.message,
      errorDetails: error,
      success: false,
      timestamp: new Date().toISOString(),
    });
  }
};

export const createCashOnDeliveryOrderController = async (request, response) => {
  try {
    const { userId } = request;
    const {
      products,
      deliveryAddressId,
      subtotalAmount,
      totalAmount,
      paymentMethod,
    } = request.body;

    if (!userId) {
      return response.status(401).json({
        errorMessage: "Unauthorized: User ID is required",
        success: false,
        timestamp: new Date().toISOString(),
      });
    }

    const requiredFields = {
      products,
      deliveryAddressId,
      subtotalAmount,
      totalAmount,
    };

    const missingFields = Object.keys(requiredFields).filter(
      (field) => !requiredFields[field]
    );

    if (missingFields.length > 0) {
      return response.status(400).json({
        errorMessage: "Missing required order fields",
        missingFields,
        success: false,
        timestamp: new Date().toISOString(),
      });
    }

    // Validate ObjectIDs
    if (!isValidObjectId(userId) || !isValidObjectId(deliveryAddressId)) {
      return response.status(400).json({
        errorMessage: "Invalid user ID or address ID format",
        success: false,
        timestamp: new Date().toISOString(),
      });
    }

    // Check if delivery address belongs to the user
    const user = await UserModel.findById(userId);
    if (!user) {
      return response.status(404).json({
        errorMessage: "User not found",
        success: false,
        timestamp: new Date().toISOString(),
      });
    }

    // Verify address belongs to user
    const addressBelongsToUser = user.address_details.some(
      (addressId) => addressId.toString() === deliveryAddressId
    );

    if (!addressBelongsToUser) {
      return response.status(403).json({
        errorMessage: "Delivery address does not belong to this user",
        success: false,
        timestamp: new Date().toISOString(),
      });
    }

    // Validate product stock before creating order
    for (const product of products) {
      if (!isValidObjectId(product.productId)) {
        return response.status(400).json({
          errorMessage: `Invalid product ID format: ${product.productId}`,
          success: false,
          timestamp: new Date().toISOString(),
        });
      }

      const fetchedProduct = await ProductModel.findById(product.productId);
      if (!fetchedProduct) {
        return response.status(404).json({
          errorMessage: `Product with ID ${product.productId} not found`,
          success: false,
          timestamp: new Date().toISOString(),
        });
      }

      if (fetchedProduct.stock < product.quantity) {
        return response.status(400).json({
          errorMessage: `Insufficient stock for product ${fetchedProduct.name}`,
          product: {
            id: fetchedProduct._id,
            name: fetchedProduct.name,
            requestedQuantity: product.quantity,
            availableStock: fetchedProduct.stock,
          },
          success: false,
          timestamp: new Date().toISOString(),
        });
      }
    }

    // Create order
    const newOrder = await OrderModel.create({
      user_id: userId,
      order_id: `ORD-${Date.now()}`,
      products: products.map((product) => ({
        product_id: product.productId,
        quantity: product.quantity,
      })),
      payment_mode: paymentMethod || "COD", // Default to COD if not provided
      payment_id: "", // No payment ID for COD
      delivery_address: deliveryAddressId,
      sub_total_amount: subtotalAmount,
      total_amount: totalAmount,
    });

    // Add order to user's history
    await UserModel.findByIdAndUpdate(
      userId,
      {
        $push: {
          order_history: {
            $each: [newOrder._id],
            $position: 0,
          },
        },
      },
      { new: true }
    );

    // Update product stock
    for (const product of products) {
      await ProductModel.findByIdAndUpdate(
        product.productId,
        { $inc: { stock: -1 * product.quantity } },
        { new: true }
      );
    }

    return response.status(201).json({
      message: "Order placed successfully",
      data: newOrder,
      success: true,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("COD Order Error", error);
    return response.status(500).json({
      errorMessage: error.message,
      errorDetails: error,
      success: false,
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * Controller to handle online payments with Razorpay
 */
export const createOnlinePaymentOrderController = async (request, response) => {
  try {
    const { userId } = request;
    const { products, deliveryAddressId, subtotalAmount, totalAmount } =
      request.body;

    if (!userId) {
      return response.status(401).json({
        errorMessage: "Unauthorized: User ID is required",
        success: false,
        timestamp: new Date().toISOString(),
      });
    }

    const requiredFields = {
      products,
      deliveryAddressId,
      subtotalAmount,
      totalAmount,
    };

    const missingFields = Object.keys(requiredFields).filter(
      (field) => !requiredFields[field]
    );

    if (missingFields.length > 0) {
      return response.status(400).json({
        errorMessage: "Missing required order fields",
        missingFields,
        success: false,
        timestamp: new Date().toISOString(),
      });
    }

    // Validate ObjectIDs
    if (!isValidObjectId(userId) || !isValidObjectId(deliveryAddressId)) {
      return response.status(400).json({
        errorMessage: "Invalid user ID or address ID format",
        success: false,
        timestamp: new Date().toISOString(),
      });
    }

    // Check if delivery address belongs to the user
    const user = await UserModel.findById(userId);
    if (!user) {
      return response.status(404).json({
        errorMessage: "User not found",
        success: false,
        timestamp: new Date().toISOString(),
      });
    }

    // Verify address belongs to user
    const addressBelongsToUser = user.address_details.some(
      (addressId) => addressId.toString() === deliveryAddressId
    );

    if (!addressBelongsToUser) {
      return response.status(403).json({
        errorMessage: "Delivery address does not belong to this user",
        success: false,
        timestamp: new Date().toISOString(),
      });
    }

    // Validate product stock before creating order
    for (const product of products) {
      if (!isValidObjectId(product.productId)) {
        return response.status(400).json({
          errorMessage: `Invalid product ID format: ${product.productId}`,
          success: false,
          timestamp: new Date().toISOString(),
        });
      }

      const fetchedProduct = await ProductModel.findById(product.productId);
      if (!fetchedProduct) {
        return response.status(404).json({
          errorMessage: `Product with ID ${product.productId} not found`,
          success: false,
          timestamp: new Date().toISOString(),
        });
      }

      if (fetchedProduct.stock < product.quantity) {
        return response.status(400).json({
          errorMessage: `Insufficient stock for product ${fetchedProduct.name}`,
          product: {
            id: fetchedProduct._id,
            name: fetchedProduct.name,
            requestedQuantity: product.quantity,
            availableStock: fetchedProduct.stock,
          },
          success: false,
          timestamp: new Date().toISOString(),
        });
      }
    }

    // Create Razorpay order
    const paymentOrderId = `ORDER-${Date.now()}-${userId.substring(0, 5)}`;
    const razorpayOrder = await razorpayInstance.orders.create({
      amount: totalAmount * 100, // Razorpay expects amount in smallest currency unit (paise)
      currency: "INR",
      receipt: paymentOrderId,
      payment_capture: 1, // Auto-capture payment
      notes: {
        userId: userId,
        deliveryAddressId: deliveryAddressId,
        products: JSON.stringify(
          products.map((p) => ({
            id: p.productId,
            quantity: p.quantity,
          }))
        ),
      },
    });

    if (!razorpayOrder || !razorpayOrder.id) {
      return response.status(500).json({
        errorMessage: "Failed to create Razorpay order",
        success: false,
        timestamp: new Date().toISOString(),
      });
    }

    // Create a temporary order in our database with pending status
    const newOrder = await OrderModel.create({
      user_id: userId,
      order_id: paymentOrderId,
      products: products.map((product) => ({
        product_id: product.productId,
        quantity: product.quantity,
      })),
      payment_mode: "Card", // Or appropriate payment method
      payment_id: razorpayOrder.id, // Store Razorpay order ID
      delivery_address: deliveryAddressId,
      sub_total_amount: subtotalAmount,
      total_amount: totalAmount,
      payment_status: "Pending", // Add this field to your Order model
      razorpay_order_id: razorpayOrder.id,
    });

    return response.status(201).json({
      message: "Payment order created successfully",
      data: {
        order: newOrder,
        paymentDetails: {
          razorpayOrderId: razorpayOrder.id,
          amount: totalAmount,
          currency: "INR",
          keyId: process.env.RAZORPAY_KEY_ID,
        },
      },
      success: true,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Create Online Payment Order Error", error);
    return response.status(500).json({
      errorMessage: error.message,
      errorDetails: error,
      success: false,
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * Controller to handle Razorpay webhook events
 * This endpoint receives payment events directly from Razorpay servers
 */
export const razorpayWebhookController = async (request, response) => {
  try {
    // Extract event data from request body
    const webhookBody = request.body;
    const webhookSignature = request.headers["x-razorpay-signature"];

    // Verify webhook signature
    if (!webhookSignature) {
      console.error("Webhook signature missing");
      // Return 200 to acknowledge receipt even for invalid requests
      // This prevents Razorpay from retrying the webhook
      return response
        .status(200)
        .send("Webhook received but signature missing");
    }

    // Verify webhook signature using the webhook secret (different from key_secret)
    const crypto = require("crypto");
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(JSON.stringify(webhookBody))
      .digest("hex");

    if (generatedSignature !== webhookSignature) {
      console.error("Invalid webhook signature");
      // Still return 200 to acknowledge receipt
      return response.status(200).send("Webhook signature verification failed");
    }

    // Process different event types
    const eventType = webhookBody.event;
    console.log(`Processing webhook event: ${eventType}`);

    switch (eventType) {
      case "payment.authorized":
        await handlePaymentAuthorized(webhookBody.payload.payment.entity);
        break;

      case "payment.captured":
        await handlePaymentCaptured(webhookBody.payload.payment.entity);
        break;

      case "payment.failed":
        await handlePaymentFailed(webhookBody.payload.payment.entity);
        break;

      case "refund.created":
        await handleRefundCreated(webhookBody.payload.refund.entity);
        break;

      case "order.paid":
        await handleOrderPaid(webhookBody.payload.order.entity);
        break;

      default:
        console.log(`Unhandled webhook event: ${eventType}`);
    }

    // Always return success to acknowledge receipt
    return response.status(200).json({
      message: "Webhook processed successfully",
      success: true,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Webhook processing error:", error);
    // Still return 200 to acknowledge receipt even on errors
    return response.status(200).json({
      message: "Webhook received with processing errors",
      success: false,
      timestamp: new Date().toISOString(),
    });
  }
};

// Helper functions for webhook event processing

/**
 * Handle payment.authorized event
 * @param {Object} payment - The payment entity from Razorpay
 */
const handlePaymentAuthorized = async (payment) => {
  try {
    const { order_id, id: payment_id } = payment;

    console.log(`Payment authorized: ${payment_id} for order ${order_id}`);

    // Find the corresponding order in our database
    const order = await OrderModel.findOne({ razorpay_order_id: order_id });

    if (order) {
      // Update the order status to indicate payment is authorized but not yet captured
      order.payment_status = "Authorized";
      order.payment_id = payment_id;
      await order.save();
    }

    await logWebhookEvent("payment.authorized", payment);
  } catch (error) {
    console.error("Error handling payment.authorized:", error);
  }
};

/**
 * Handle payment.captured event
 * @param {Object} payment - The payment entity from Razorpay
 */
const handlePaymentCaptured = async (payment) => {
  try {
    const { order_id, id: payment_id, notes } = payment;

    console.log(`Payment captured: ${payment_id} for order ${order_id}`);

    // Find the corresponding order in our database
    const order = await OrderModel.findOne({ razorpay_order_id: order_id });

    if (order) {
      // Update order status to completed
      order.payment_status = "Completed";
      order.payment_id = payment_id;

      // Update product stock if not already updated
      if (!order.stock_updated) {
        for (const product of order.products) {
          await ProductModel.findByIdAndUpdate(
            product.product_id,
            { $inc: { stock: -1 * product.quantity } },
            { new: true }
          );
        }

        // Mark stock as updated to prevent duplicate stock reductions
        order.stock_updated = true;

        // Add order to user's history if not already added
        if (!order.added_to_history) {
          await UserModel.findByIdAndUpdate(
            order.user_id,
            {
              $push: {
                order_history: {
                  $each: [order._id],
                  $position: 0,
                },
              },
            },
            { new: true }
          );

          order.added_to_history = true;
        }
      }

      await order.save();
    } else {
      console.error(`Order not found for Razorpay order ID: ${order_id}`);
    }

    await logWebhookEvent("payment.captured", payment);
  } catch (error) {
    console.error("Error handling payment.captured:", error);
  }
};

/**
 * Handle payment.failed event
 * @param {Object} payment - The payment entity from Razorpay
 */
const handlePaymentFailed = async (payment) => {
  try {
    const { order_id, id: payment_id, error_code, error_description } = payment;

    console.log(
      `Payment failed: ${payment_id} for order ${order_id}. Error: ${error_code} - ${error_description}`
    );

    // Find the corresponding order in our database
    const order = await OrderModel.findOne({ razorpay_order_id: order_id });

    if (order) {
      // Update order status to failed
      order.payment_status = "Failed";
      order.payment_error = `${error_code}: ${error_description}`;
      await order.save();
    }

    await logWebhookEvent("payment.failed", payment);
  } catch (error) {
    console.error("Error handling payment.failed:", error);
  }
};

/**
 * Handle order.paid event
 * @param {Object} orderData - The order entity from Razorpay
 */
const handleOrderPaid = async (orderData) => {
  try {
    const { id: razorpay_order_id, receipt, amount } = orderData;

    console.log(
      `Order paid: ${razorpay_order_id}, receipt: ${receipt}, amount: ${
        amount / 100
      }`
    );

    // Find the corresponding order in our database
    const order = await OrderModel.findOne({ razorpay_order_id });

    if (order) {
      // This is sometimes fired before payment.captured, so we should update
      // the status if it's not already completed
      if (order.payment_status !== "Completed") {
        order.payment_status = "Paid";
        await order.save();
      }
    }

    await logWebhookEvent("order.paid", orderData);
  } catch (error) {
    console.error("Error handling order.paid:", error);
  }
};

/**
 * Handle refund.created event
 * @param {Object} refund - The refund entity from Razorpay
 */
const handleRefundCreated = async (refund) => {
  try {
    const { payment_id, id: refund_id, amount, notes } = refund;

    console.log(
      `Refund created: ${refund_id} for payment ${payment_id}, amount: ${
        amount / 100
      }`
    );

    // Find order by payment ID
    const order = await OrderModel.findOne({ payment_id });

    if (order) {
      // Add refund information to order
      if (!order.refunds) order.refunds = [];

      order.refunds.push({
        refund_id,
        amount: amount / 100,
        reason: notes?.reason || "",
        created_at: new Date(),
      });

      // Update order status based on refund amount
      const totalRefundAmount = order.refunds.reduce(
        (sum, r) => sum + r.amount,
        0
      );

      if (Math.abs(totalRefundAmount - order.total_amount) < 0.01) {
        // Consider floating point issues
        order.payment_status = "Refunded";
      } else {
        order.payment_status = "PartiallyRefunded";
      }

      await order.save();
    }

    await logWebhookEvent("refund.created", refund);
  } catch (error) {
    console.error("Error handling refund.created:", error);
  }
};

/**
 * Log webhook events for auditing
 * @param {String} eventType - The type of event
 * @param {Object} data - The event data
 */
const logWebhookEvent = async (eventType, data) => {
  try {
    // In production, you would store this in a database
    // For now, we'll just log it to console
    console.log(
      `[WebhookLog] Event: ${eventType}, Time: ${new Date().toISOString()}`
    );
    console.log(`[WebhookLog] Data: ${JSON.stringify(data)}`);

    // You could implement a more sophisticated logging system:
    /*
    await WebhookLogModel.create({
      event_type: eventType,
      payload: data,
      timestamp: new Date()
    });
    */
  } catch (error) {
    console.error("Error logging webhook event:", error);
  }
};
