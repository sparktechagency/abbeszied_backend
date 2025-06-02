import AppError from '../../error/AppError';
import { User } from '../user/user.models';
import QueryBuilder from '../../builder/QueryBuilder';
import moment from 'moment';
import Stripe from 'stripe';
import httpStatus from 'http-status';
import config from '../../config';
import mongoose from 'mongoose';
import stripe from '../../config/stripe.config';
import { StripeAccount } from './stripeAccount.model';

const createStripeAccount = async (
  user: any,
  host: string,
  protocol: string,
): Promise<any> => {
  // console.log('user',user);
  const existingAccount = await StripeAccount.findOne({
    userId: user.userId,
  }).select('user accountId isCompleted');
  // console.log('existingAccount', existingAccount);
  console.log({ user, host, protocol });
  console.log(existingAccount);

  if (existingAccount) {
    if (existingAccount.isCompleted) {
      return {
        success: false,
        message: 'Account already exists',
        data: existingAccount,
      };
    }

    const onboardingLink = await stripe.accountLinks.create({
      account: existingAccount.accountId,
      refresh_url: `${protocol}://${host}/api/v1/stripe/refreshAccountConnect/${existingAccount.accountId}`,
      return_url: `${protocol}://${host}/api/v1/stripe/success-account/${existingAccount.accountId}`,
      type: 'account_onboarding',
    });
    // console.log('onboardingLink-1', onboardingLink);

    return {
      success: true,
      message: 'Please complete your account',
      url: onboardingLink.url,
    };
  }

  const account = await stripe.accounts.create({
    type: 'express',
    email: user.email,
    country: 'US',
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
  });
  // console.log('stripe account', account);

  await StripeAccount.create({ accountId: account.id, userId: user.userId });

  const onboardingLink = await stripe.accountLinks.create({
    account: account.id,
    refresh_url: `${protocol}://${host}/api/v1/stripe/refreshAccountConnect/${account.id}`,
    return_url: `${protocol}://${host}/api/v1/stripe/success-account/${account.id}`,
    type: 'account_onboarding',
  });
  // console.log('onboardingLink-2', onboardingLink);

  return {
    success: true,
    message: 'Please complete your account',
    url: onboardingLink.url,
  };
};
const refreshAccountConnect = async (
  id: string,
  host: string,
  protocol: string,
): Promise<string> => {
  const onboardingLink = await stripe.accountLinks.create({
    account: id,
    refresh_url: `${protocol}://${host}/api/v1/stripe/refreshAccountConnect/${id}`,
    return_url: `${protocol}://${host}/api/v1/stripe/success-account/${id}`,
    type: 'account_onboarding',
  });
  return onboardingLink.url;
};

export const stripeAccountService = {
  createStripeAccount,
  refreshAccountConnect,
};
