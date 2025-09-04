"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.stripeAccountService = void 0;
const stripe_config_1 = __importDefault(require("../../config/stripe.config"));
const stripeAccount_model_1 = require("./stripeAccount.model");
const createStripeAccount = (user, host, protocol) => __awaiter(void 0, void 0, void 0, function* () {
    // console.log('user',user);
    const existingAccount = yield stripeAccount_model_1.StripeAccount.findOne({
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
        const onboardingLink = yield stripe_config_1.default.accountLinks.create({
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
    const account = yield stripe_config_1.default.accounts.create({
        type: 'express',
        email: user.email,
        country: 'US',
        capabilities: {
            card_payments: { requested: true },
            transfers: { requested: true },
        },
    });
    // console.log('stripe account', account);
    yield stripeAccount_model_1.StripeAccount.create({ accountId: account.id, userId: user.userId });
    const onboardingLink = yield stripe_config_1.default.accountLinks.create({
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
});
const refreshAccountConnect = (id, host, protocol) => __awaiter(void 0, void 0, void 0, function* () {
    const onboardingLink = yield stripe_config_1.default.accountLinks.create({
        account: id,
        refresh_url: `${protocol}://${host}/api/v1/stripe/refreshAccountConnect/${id}`,
        return_url: `${protocol}://${host}/api/v1/stripe/success-account/${id}`,
        type: 'account_onboarding',
    });
    return onboardingLink.url;
});
exports.stripeAccountService = {
    createStripeAccount,
    refreshAccountConnect,
};
