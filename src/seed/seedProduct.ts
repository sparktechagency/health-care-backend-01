import { stripeHelper } from '../helpers/stripeHelper';

export async function seedProduct() {
  const product = await stripeHelper.createStripeProduct(
    'Consultation Service',
    'Consultation Service from Dokter For You',
    25
  );
  return product;
}
