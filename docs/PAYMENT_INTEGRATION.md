# Payment Integration Guide

## Overview

The Delchris ecommerce platform uses **Paystack** as its primary payment gateway, supporting multiple payment methods:

- 💳 **Credit/Debit Cards** (Visa, Mastercard, American Express)
- 📱 **Mobile Money** (MTN MoMo, Telecel Cash, AirtelTigo Money)
- 🏦 **Bank Transfers** (Direct bank payments)

## Architecture

### Payment Flow

```
1. User enters payment details in checkout
2. Frontend initializes payment via Paystack API
3. User completes payment in Paystack modal
4. Payment verified via webhook
5. Order confirmed and email sent
```

### Key Components

#### API Routes

- **`/api/payments/initialize`** - Initializes a payment with Paystack
- **`/api/payments/verify`** - Verifies payment status
- **`/api/payments/webhook`** - Handles Paystack webhook events

#### Frontend Components

- **`app/checkout/page.tsx`** - Checkout flow with Paystack integration
- **`app/orders/[orderId]/confirmation/page.tsx`** - Order confirmation page
- **`app/account/orders/page.tsx`** - Order history

#### Services & Stores

- **`lib/services/payment.ts`** - Payment utility functions
- **`lib/store/payment.ts`** - Payment state management (Zustand)

## Setup

### 1. Get Paystack Credentials

1. Sign up at [Paystack.com](https://paystack.com)
2. Complete your business verification
3. Get your **Public Key** and **Secret Key**

### 2. Set Environment Variables

Add to your `.env.local`:

```bash
# Paystack Configuration
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_live_xxxxx  # Public key
PAYSTACK_SECRET_KEY=sk_live_xxxxx               # Secret key (server-only)
```

### 3. Configure Webhook

1. Go to [Paystack Dashboard](https://dashboard.paystack.com/#/settings/developer)
2. Navigate to **Settings > Webhooks**
3. Add webhook URL: `https://yourdomain.com/api/payments/webhook`
4. Select events:
   - `charge.success`
   - `transfer.success`
   - `transfer.failed`

## Payment Methods

### Credit/Debit Card

```typescript
// User selects card payment
paymentMethod = 'card'

// Flow:
// 1. User enters card details in Paystack modal
// 2. Card is tokenized securely by Paystack
// 3. Payment processed immediately
// 4. Confirmation email sent
```

### Mobile Money

```typescript
// User selects mobile_money
paymentMethod = 'mobile_money'
mobileMoneyProvider = 'mtn' | 'telecel' | 'airteltigo'

// Flow:
// 1. User selects provider
// 2. Paystack initiates USSD or app redirect
// 3. User authorizes payment on their phone
// 4. Payment confirmed
// 5. Webhook triggers order confirmation
```

### Bank Transfer

```typescript
// User selects bank_transfer
paymentMethod = 'bank_transfer'

// Flow:
// 1. User gets bank details and reference
// 2. Transfers amount to provided account
// 3. Payment verified via webhook
// 4. Order confirmed automatically
```

## API Reference

### Initialize Payment

**POST** `/api/payments/initialize`

Request:
```json
{
  "email": "customer@example.com",
  "amount": 1250.00,
  "orderId": "ORD-1234567890-ABC123",
  "phone": "+233123456789",
  "paymentMethod": "card|mobile_money|bank_transfer",
  "mobileMoneyProvider": "mtn|telecel|airteltigo"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "authorizationUrl": "https://checkout.paystack.com/...",
    "accessCode": "w9z07f31x7bafba",
    "reference": "ORD-1234567890-ABC123"
  }
}
```

### Verify Payment

**POST** `/api/payments/verify`

Request:
```json
{
  "reference": "ORD-1234567890-ABC123"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "reference": "ORD-1234567890-ABC123",
    "amount": 1250.00,
    "email": "customer@example.com",
    "phone": "+233123456789",
    "paymentMethod": "card",
    "status": "success",
    "paidAt": "2024-01-15T10:30:00Z"
  }
}
```

### Webhook

**POST** `/api/payments/webhook`

Headers:
```
x-paystack-signature: <SHA512 hash of body>
```

Payload:
```json
{
  "event": "charge.success",
  "data": {
    "id": 12345,
    "reference": "ORD-1234567890-ABC123",
    "amount": 125000,
    "paid_at": "2024-01-15T10:30:00Z",
    "status": "success",
    "customer": {
      "email": "customer@example.com",
      "phone": "+233123456789"
    },
    "metadata": {
      "phone": "+233123456789",
      "payment_method": "card"
    }
  }
}
```

## Frontend Integration

### Using PaymentService

```typescript
import { PaymentService } from '@/lib/services/payment'

// Initialize payment
const response = await PaymentService.initializePayment(
  'customer@example.com',
  1250.00,
  'ORD-1234567890',
  '+233123456789',
  'card'
)

if (response.success) {
  // Open Paystack modal or redirect
  window.location.href = response.data.authorizationUrl
}

// Verify payment
const verification = await PaymentService.verifyPayment('ORD-1234567890')

if (verification.success) {
  // Update order status
  // Send confirmation email
  // Redirect to confirmation page
}
```

### Using Payment Store

```typescript
import { usePaymentStore } from '@/lib/store/payment'

// In your component
const { 
  currentPayment, 
  initializePayment, 
  updatePaymentStatus,
  clearPayment 
} = usePaymentStore()

// Initialize
initializePayment({
  orderId: 'ORD-123',
  email: 'user@example.com',
  phone: '+233123456789',
  amount: 1250.00,
  paymentMethod: 'card'
})

// Update status
updatePaymentStatus('success')

// Clear after order
clearPayment()
```

## Testing

### Test Cards (Paystack)

| Card Number | Expiry | CVV | Status |
|-------------|--------|-----|--------|
| 4084084084084081 | 01/25 | 408 | Success |
| 5060666666666666 | 01/25 | 606 | Success |
| 50485065098069 | 01/25 | 408 | Success (3D Secure) |

### Test Mobile Money

For sandbox testing, Paystack provides test credentials. Check your dashboard for test mode details.

## Error Handling

### Common Errors

```typescript
// Insufficient funds
{
  error: "Insufficient funds"
}

// Invalid card
{
  error: "Card transaction failed"
}

// Network error
{
  error: "Failed to initialize payment"
}

// Invalid reference
{
  error: "Reference not found"
}
```

## Security

### Best Practices

✅ **Always verify signatures** on webhooks
✅ **Never log sensitive card data**
✅ **Use HTTPS only** in production
✅ **Keep secret keys private** (server-side only)
✅ **Validate all inputs** on backend
✅ **Use environment variables** for credentials
✅ **Implement retry logic** for failed payments
✅ **Monitor webhook failures** and implement recovery

### PCI Compliance

- ✅ Paystack handles PCI compliance
- ✅ Your site never stores card data
- ✅ All card data is tokenized by Paystack
- ✅ Use HTTPS/TLS for all communications

## Production Checklist

- [ ] Paystack account in live mode
- [ ] Production API keys configured
- [ ] Webhook URL configured and tested
- [ ] Email notifications set up
- [ ] Error logging configured
- [ ] Customer support process documented
- [ ] Refund policy implemented
- [ ] Order status emails configured
- [ ] Invoice generation implemented
- [ ] Analytics/reporting configured

## Troubleshooting

### Payment modal not opening

```typescript
// Check if Paystack script loaded
if (!window.PaystackPop) {
  console.error('Paystack script not loaded')
  // Fallback to redirect
  window.location.href = authorizationUrl
}
```

### Webhook not being called

- Verify webhook URL in Paystack dashboard
- Check server logs for incoming requests
- Ensure firewall allows incoming requests
- Test webhook manually from Paystack dashboard

### Payment verified but order not created

- Check webhook handler logs
- Verify database operations work
- Implement retry mechanism
- Use idempotency keys

## Support

- **Paystack Docs**: https://paystack.com/docs
- **Paystack Support**: support@paystack.com
- **Phone**: +234-700-PAYSTACK

## Next Steps

1. **Receipts & Invoices** - Generate PDF invoices
2. **Email Notifications** - Automated order emails
3. **Refund Management** - Handle payment refunds
4. **Analytics** - Track payment metrics
5. **Shipping Integration** - Auto-generate shipping labels
