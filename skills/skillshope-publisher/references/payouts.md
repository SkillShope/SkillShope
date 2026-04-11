# Setting Up Payouts

## Stripe Connect Express

RoughInHub uses Stripe Connect Express for automatic publisher payouts. You must complete this setup before listing paid skills.

## Setup Steps

1. **Go to your dashboard** at roughinhub.com/dashboard
2. **Click "Connect"** on the payout setup banner
3. **Complete Stripe onboarding** — Stripe will ask for:
   - Business type (individual or company)
   - Personal information (name, DOB, address)
   - Bank account for payouts
   - Tax information (SSN or EIN for US publishers)
4. **Return to dashboard** — you'll see "Payouts enabled" confirmation

## How Payouts Work

| Event | What happens |
|-------|-------------|
| Buyer purchases your skill | Stripe processes payment |
| Platform fee deducted | RoughInHub takes 15% |
| Funds transferred | 85% goes to your connected Stripe account |
| Payout to bank | Stripe deposits to your bank on rolling basis (typically 2 business days) |

## Revenue Example

| Skill price | Buyer pays | You receive (85%) | Platform fee (15%) |
|------------|-----------|-------------------|-------------------|
| $4.99 | $4.99 | $4.24 | $0.75 |
| $9.99 | $9.99 | $8.49 | $1.50 |
| $19.99 | $19.99 | $16.99 | $3.00 |

Stripe's processing fees (~2.9% + $0.30) are absorbed by the platform, not the publisher.

## Troubleshooting

- **"Set up payouts" still showing after onboarding?** — You may not have completed all Stripe verification steps. Click "Continue" to resume
- **Payouts not arriving?** — Check your Stripe Express dashboard for any pending verification requirements
- **Want to change bank account?** — You can update payout details in your Stripe Express dashboard
