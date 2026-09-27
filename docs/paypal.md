# PayPal billing for Pivoa

Pivoa charges subscribers directly with PayPal Subscriptions. This is not PayPal Multiparty or a marketplace. Plan limits, support tickets, and the admin portal stay the same.

PayPal has no customer portal inside Pivoa. The payer approves on PayPal, updates their payment method in their PayPal account, and Pivoa cancels the subscription through the API. Cancel stops future charges. Access lasts until the period already paid.

Put these variables on the API host only (Railway). Never put the client secret on Vercel.

## Catalog

Create the catalog once in the PayPal dashboard. One product per tier (Plus, Pro). One billing plan per price. Do not put both tiers on one product. Currency is USD.

| Plan | Cycle | Price |
|---|---|---|
| Plus monthly | Every 1 month | $7 |
| Plus yearly | Every 1 year | $59 |
| Pro monthly | Every 1 month | $14 |
| Pro yearly | Every 1 year | $119 |

Plus plans only: add a first trial cycle of 14 days at $0, then the regular cycle. Pro has no trial.

Sandbox: [developer.paypal.com](https://developer.paypal.com) → Sandbox → Subscriptions plans. Copy the four plan ids (`P-...`) into:

- `PAYPAL_PLAN_PLUS_MONTHLY`
- `PAYPAL_PLAN_PLUS_YEARLY`
- `PAYPAL_PLAN_PRO_MONTHLY`
- `PAYPAL_PLAN_PRO_YEARLY`

## App credentials

Create a REST app under the same sandbox (or live) account.

- `PAYPAL_MODE` = `sandbox` or `live` (hosts `api-m.sandbox.paypal.com` / `api-m.paypal.com`)
- `PAYPAL_CLIENT_ID`
- `PAYPAL_CLIENT_SECRET`

The API requests an access token with HTTP basic auth and `grant_type=client_credentials`, then caches it until expiry. Do not log the secret or the token.

## Webhook

Register a webhook for `https://<api-host>/api/billing/webhook`.

Subscribe to:

- `BILLING.SUBSCRIPTION.ACTIVATED`
- `BILLING.SUBSCRIPTION.UPDATED`
- `BILLING.SUBSCRIPTION.CANCELLED`
- `BILLING.SUBSCRIPTION.SUSPENDED`
- `BILLING.SUBSCRIPTION.EXPIRED`
- `BILLING.SUBSCRIPTION.PAYMENT.FAILED`

Copy the webhook id into `PAYPAL_WEBHOOK_ID`. The API verifies each event with PayPal before it changes a plan. Checkout does not grant Plus or Pro by itself. After the payer returns to Settings, the app syncs the subscription, and the webhook does the same.

`ADMIN_EMAILS` is a comma-separated list. Those accounts can open `/admin`. Complimentary plans are granted there and do not call PayPal.

PayPal collects and remits according to the merchant account. This app does not calculate tax.
