import Stripe from "stripe";

import Cart from "../../../db/models/cart.model.js";
import Coupon from "../../../db/models/coupon.model.js";
import Order from "../../../db/models/order.model.js";
import Product from "../../../db/models/product.model.js";
import { asyncHandller } from "../../middlewares/errorHandling.js";
import ApiError from "../../utils/errorClass.js";
import { createInvoice } from "../../utils/pdf.js";

import { sendMail } from "../../services/sendEmail.service.js";

import { payment } from "../../utils/payment.js";

export const createOrder = asyncHandller(async (req, res, next) => {
  const { productId, quantity, couponCode, address, phone, paymentMethod } =
    req.body;
  if (couponCode) {
    const coupon = await Coupon.findOne({
      code: couponCode.toLowerCase(),
      usedBy: {
        $nin: [req.user._id],
      },
    });
    if (!coupon || coupon.toDate < Date.now()) {
      return next(
        new ApiError("coupon not exist or expired or already used", 404)
      );
    }
    req.body.coupon = coupon;
  }

  let products = [];
  let flag = false;
  if (productId) {
    products = [{ productId, quantity }];
  } else {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart.products.length) {
      return next(new ApiError("Cart is empty please select product", 404));
    }
    products = cart.products;
    flag = true;
  }

  let finalProducts = [];

  let subPrice = 0;
  for (let product of products) {
    const checkProduct = await Product.findOne({
      _id: product.productId,
      stock: { $gte: product.quantity },
    });

    if (!checkProduct) {
      return next(new ApiError("Product not exist or out of stock", 404));
    }

    if (flag) {
      product = product.toObject();
    }

    product.title = checkProduct.title;
    product.price = checkProduct.price;
    product.finalPrice = checkProduct.subPrice * product.quantity;
    product.discount = checkProduct.discount || 0;

    subPrice += product.finalPrice;

    finalProducts.push(product);
  }

  const order = await Order.create({
    user: req.user._id,
    products: finalProducts,
    subPrice,
    couponId: req.body?.coupon?._id,
    totalPrice: subPrice - subPrice * ((req.body?.coupon?.amount || 0) / 100),
    paymentMethod,
    status: paymentMethod == "cash" ? "placed" : "waitPayment",
    phone,
    address,
  });

  if (req.body?.coupon) {
    await Coupon.updateOne(
      {
        _id: req.body.coupon._ic,
      },
      {
        $push: { usedBy: req.user._id },
      }
    );
  }

  for (let product of finalProducts) {
    await Product.findByIdAndUpdate(product.productId, {
      $inc: { stock: -product.quantity },
    });
  }
  if (flag) {
    await Cart.updateOne({ user: req.user._id }, { products: [] });
  }

  const invoice = {
    shipping: {
      name: req.user.name,
      address: address,
      city: "Cairo",

      country: "Egypt",
    },
    items: order.products,
    subtotal: order.subPrice,
    paid: order.totalPrice,
    invoice_nr: order._id,
    date: order.createdAt,
    coupon: req.body?.coupon?.amount,
  };

  // await createInvoice(invoice, "invoice.pdf");
  // await sendMail({
  //   to: req.user.email,
  //   subject: "Order Placed",
  //   textMessage: "Your Order has been placed successfully",
  //   attachments: {
  //     path: "invoice.pdf",
  //     contentType: "application/pdf",
  //   },
  // });

  if (paymentMethod == "card") {
    const stripe = new Stripe(process.env.STRIP_KEY);

    if (req.body?.coupon) {
      const coupon = await stripe.coupons.create({
        percent_off: req.body.coupon.amount,
        duration: "once",
      });
      req.body.couponId = coupon.id;
    }
    const session = await payment({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: req.user.email,
      metadata: {
        orderId: order._id.toString(),
      },
      success_url: `${req.protocol}://${req.headers.host}/orders/sucess/${order._id}`,
      cancel_url: `${req.protocol}://${req.headers.host}/orders/cancel/${order._id}`,
      line_items: order.products.map((product) => {
        return {
          price_data: {
            currency: "egp",
            product_data: {
              name: product.title,
            },
            unit_amount: product.price * 100,
          },
          quantity: product.quantity,
        };
      }),
      discounts: req.body?.coupon ? [{ coupon: req.body.couponId }] : [],
    });
    res.status(201).json({
      status: "success",
      session,
    });
  }
  res.status(201).json({
    status: "success",
  });
});

export const webHook = asyncHandller(async (req, res, next) => {
  const stripe = new Stripe(process.env.STRIP_KEY);
  const sig = req.headers["stripe-signature"];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.ENDPONIT_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  if (event.type !== "checkout.session.completed") {
    const { orderId } = event.data.object.metadata;
    await Order.findOneAndUpdate({ _id: orderId }, { status: "rejected" });
    return res.status(400).json({
      msg: "fail",
    });
  }
  const { orderId } = event.data.object.metadata;
  await Order.findOneAndUpdate({ _id: orderId }, { status: "placed" });
  return res.status(200).json({
    msg: "done",
  });
});
export const cancelOrder = asyncHandller(async (req, res, next) => {
  // const { id } = req.params;
  // const { reason } = req.body;

  // const order = await Order.findOne({ _id: id, user: req.user._id });
  // if (!order) {
  //   return next(new ApiError("order not found ", 404));
  // }
  // if (
  //   (order.paymentMethod == "cash" && order.status != "placed") ||
  //   (order.paymentMethod == "card" && order.status != "waitPayment")
  // ) {
  //   return next(new ApiError("you cannont cancel this order", 404));
  // }

  // await Order.updateOne(
  //   {
  //     _id: id,
  //   },
  //   { status: "cancelled", cancelledBy: req.user_id, reason }
  // );

  // if (order?.coupon) {
  //   await Coupon.updateOne(
  //     { _id: order?.couponId },
  //     {
  //       $pull: { usedBy: req.user._id },
  //     }
  //   );
  // }

  // for (let product of order.products) {
  //   await Product.updateOne(
  //     { _id: product.productId },
  //     {
  //       $inc: { stock: product.quantity },
  //     }
  //   );
  // }
  createIn;

  res.status(200).json({
    status: "success",
    msg: "done",
  });
});
