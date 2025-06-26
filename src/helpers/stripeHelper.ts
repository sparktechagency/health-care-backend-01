import Stripe from 'stripe';
import stripe from '../config/stripe';
import fs from 'fs';
import path from 'path';
import ApiError from '../errors/ApiError';
import { StatusCodes } from 'http-status-codes';


// const createCheckoutSession = async (userId: string, id: string) => {

//   const session = await stripe.checkout.sessions.create({
//     payment_method_types: ['card', 'ideal'],
//     line_items: [
//       {
//         price_data: {
//           currency: 'eur',
//           product_data: {
//             name: 'Consultation service.',
//             description: 'Consultation service from dokter for you',
//           },
//           unit_amount: 2500,
//         },
//         quantity: 1,
//       },
//     ],
//     mode: 'payment',
//     success_url: `http://10.0.70.30:5002/api/v1/consultation/create/success?session_id={CHECKOUT_SESSION_ID}&id=${id}`,
//     cancel_url: `https://www.dokterforyou.com/profile?isSuccess=false`,
//     metadata: {
//       userId,
//     },
//   });


//   return session;
// };
const createCheckoutSession = async (userId: string, id: string, totalAmount: number) => {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card', 'ideal'],
    line_items: [
      {
        price_data: {
          currency: 'eur',
          product_data: {
            name: 'Consultation service.',
            description: 'Consultation service from dokter for you',
          },
          unit_amount: Math.round(totalAmount * 100), // Convert to cents
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `http://10.0.70.208:5002/api/v1/consultation/create/success?session_id={CHECKOUT_SESSION_ID}&id=${id}`,
    cancel_url: `https://www.dokterforyou.com/profile?isSuccess=false`,
    metadata: {
      userId,
    },
  });

  return session;
};




















const createPaymentLink = async (product: Stripe.Product) => {
  const paymentLink = await stripe.paymentLinks.create({
    line_items: [
      {
        price: product.default_price as string,
        quantity: 1,
      },
    ],
    payment_method_types: ['card', 'ideal'],
  });

  return paymentLink.url;
};
const createStripeProduct = async (
  name: string,
  description: string = 'Another medspace connect package',
  price: number
) => {
  const product: Stripe.Product = await stripe.products.create({
    name,
    description,
    default_price_data: {
      currency: 'eur',
      unit_amount: price * 100,
    },
  });

  const paymentLink = await createPaymentLink(product);
  return {
    ...product,
    priceId: product.default_price as string,
    paymentLink,
  };
};

// Coupon Related Functions
const createCoupon = async (
  percent_off: number,
  max_redemptions: number,
  redeem_by: number
) => {
  try {
    const coupon = await stripe.coupons.create({
      percent_off,
      duration: 'once',
      max_redemptions,
      redeem_by,
    });
    return coupon;
  } catch (error) {
    console.error('Coupon creation error:', error);
    throw error;
  }
};
const createPromotionCode = async (couponId: string, name: string) => {
  const promotionCode = await stripe.promotionCodes.create({
    coupon: couponId,
    code: name,
  });

  return promotionCode;
};
const deleteCoupon = async (couponId: string) => {
  try {
    const deletedCoupon = await stripe.coupons.del(couponId);
    return deletedCoupon;
  } catch (error) {
    console.error('Error deleting coupon:', error);
    throw error;
  }
};

export const stripeHelper = {
  createCoupon,
  createPromotionCode,
  deleteCoupon,
  createStripeProduct,
  createCheckoutSession,
};
