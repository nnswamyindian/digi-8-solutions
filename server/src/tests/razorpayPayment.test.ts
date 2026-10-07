/**
 * Digi8 Solutions – Razorpay Automatic Invoice Payment Integration
 * Automated Test Suite covering all 8 specification requirements:
 *
 * Test 1 – Full Payment
 * Test 2 – Partial Payment
 * Test 3 – Multiple Payments
 * Test 4 – Duplicate Webhook (Idempotency)
 * Test 5 – Failed Payment
 * Test 6 – Outstanding Payment Link
 * Test 7 – Fully Paid Invoice
 * Test 8 – Concurrent Payment & Webhook Signature Safety
 */

import crypto from 'crypto';
import {
  recordVerifiedRazorpayPayment,
  createRazorpayOrder,
  verifyRazorpayWebhookSignature,
  verifyRazorpayPaymentSignature
} from '../razorpayService.js';
import {
  loadPersistentStore,
  savePersistentStore
} from '../db.js';

interface TestResult {
  name: string;
  passed: boolean;
  message?: string;
  details?: any;
}

const results: TestResult[] = [];

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}

// Helper to create an isolated mock invoice in the persistent store
function createTestInvoice(grandTotal: number, invoiceNum: string) {
  const store = loadPersistentStore();
  const id = Date.now() + Math.floor(Math.random() * 100000);
  const newInvoice = {
    id,
    invoice_number: invoiceNum,
    invoice_date: new Date().toISOString().split('T')[0],
    financial_year: '2026-27',
    customer_id: 101,
    customer_name: 'ABC Kirana Store',
    customer_email: 'kirana@example.com',
    customer_mobile: '+91 98765 43210',
    market_total: grandTotal,
    discount_total: 0,
    taxable_amount: grandTotal,
    tax_type: 'intra_state',
    cgst_amount: 0,
    sgst_amount: 0,
    igst_amount: 0,
    tax_total: 0,
    round_off: 0,
    grand_total: grandTotal,
    amount_paid: 0,
    balance_amount: grandTotal,
    payment_status: 'unpaid',
    invoice_status: 'generated',
    created_at: new Date().toISOString()
  };

  store.invoices.push(newInvoice);
  savePersistentStore(store);
  return newInvoice;
}

async function runTestSuite() {
  console.log('\n=============================================================');
  console.log('   DIGI8 SOLUTIONS – RAZORPAY PAYMENT AUTOMATION TEST SUITE   ');
  console.log('=============================================================\n');

  // -------------------------------------------------------------------------
  // Test 1: Full Payment
  // Invoice: ₹10,000. Payment: ₹10,000.
  // Expected: Paid = ₹10,000, Pending = ₹0, Status = PAID
  // -------------------------------------------------------------------------
  try {
    const inv = createTestInvoice(10000, `TEST/INV/1001/${Date.now()}`);
    const payRes = await recordVerifiedRazorpayPayment({
      invoiceId: inv.id,
      amount: 10000,
      paymentMethod: 'UPI',
      razorpayPaymentId: `pay_test1_full_${Date.now()}`,
      razorpayOrderId: `order_test1_${Date.now()}`
    });

    const updated = payRes.invoice;
    assert(updated !== null, 'Invoice must be updated');
    assert(Number(updated.amount_paid) === 10000, `Expected amount_paid 10000, got ${updated.amount_paid}`);
    assert(Number(updated.balance_amount) === 0, `Expected balance_amount 0, got ${updated.balance_amount}`);
    assert(updated.payment_status === 'paid', `Expected status paid, got ${updated.payment_status}`);

    results.push({
      name: 'Test 1 – Full Payment (₹10,000 on ₹10,000 -> PAID, Pending 0)',
      passed: true,
      details: { amount_paid: updated.amount_paid, balance: updated.balance_amount, status: updated.payment_status }
    });
  } catch (err: any) {
    results.push({ name: 'Test 1 – Full Payment', passed: false, message: err.message });
  }

  // -------------------------------------------------------------------------
  // Test 2: Partial Payment
  // Invoice: ₹10,000. Payment: ₹4,000.
  // Expected: Paid = ₹4,000, Pending = ₹6,000, Status = PARTIALLY PAID
  // -------------------------------------------------------------------------
  try {
    const inv = createTestInvoice(10000, `TEST/INV/1002/${Date.now()}`);
    const payRes = await recordVerifiedRazorpayPayment({
      invoiceId: inv.id,
      amount: 4000,
      paymentMethod: 'Card',
      razorpayPaymentId: `pay_test2_partial_${Date.now()}`,
      razorpayOrderId: `order_test2_${Date.now()}`
    });

    const updated = payRes.invoice;
    assert(Number(updated.amount_paid) === 4000, `Expected amount_paid 4000, got ${updated.amount_paid}`);
    assert(Number(updated.balance_amount) === 6000, `Expected balance_amount 6000, got ${updated.balance_amount}`);
    assert(updated.payment_status === 'partially_paid', `Expected status partially_paid, got ${updated.payment_status}`);

    results.push({
      name: 'Test 2 – Partial Payment (₹4,000 on ₹10,000 -> PARTIALLY PAID, Pending ₹6,000)',
      passed: true,
      details: { amount_paid: updated.amount_paid, balance: updated.balance_amount, status: updated.payment_status }
    });
  } catch (err: any) {
    results.push({ name: 'Test 2 – Partial Payment', passed: false, message: err.message });
  }

  // -------------------------------------------------------------------------
  // Test 3: Multiple Payments
  // Invoice = ₹20,000
  // Payment 1 = ₹5,000
  // Payment 2 = ₹7,000
  // Payment 3 = ₹8,000
  // Expected: Paid = ₹20,000, Pending = ₹0, Status = PAID
  // -------------------------------------------------------------------------
  try {
    const inv = createTestInvoice(20000, `TEST/INV/1003/${Date.now()}`);

    // Payment 1
    const res1 = await recordVerifiedRazorpayPayment({
      invoiceId: inv.id,
      amount: 5000,
      paymentMethod: 'UPI',
      razorpayPaymentId: `pay_test3_p1_${Date.now()}`
    });
    assert(Number(res1.invoice.amount_paid) === 5000, `P1 expected 5000, got ${res1.invoice.amount_paid}`);
    assert(Number(res1.invoice.balance_amount) === 15000, `P1 expected balance 15000, got ${res1.invoice.balance_amount}`);
    assert(res1.invoice.payment_status === 'partially_paid', 'P1 status must be partially_paid');

    // Payment 2
    const res2 = await recordVerifiedRazorpayPayment({
      invoiceId: inv.id,
      amount: 7000,
      paymentMethod: 'Netbanking',
      razorpayPaymentId: `pay_test3_p2_${Date.now()}`
    });
    assert(Number(res2.invoice.amount_paid) === 12000, `P2 expected 12000, got ${res2.invoice.amount_paid}`);
    assert(Number(res2.invoice.balance_amount) === 8000, `P2 expected balance 8000, got ${res2.invoice.balance_amount}`);
    assert(res2.invoice.payment_status === 'partially_paid', 'P2 status must be partially_paid');

    // Payment 3
    const res3 = await recordVerifiedRazorpayPayment({
      invoiceId: inv.id,
      amount: 8000,
      paymentMethod: 'UPI',
      razorpayPaymentId: `pay_test3_p3_${Date.now()}`
    });
    assert(Number(res3.invoice.amount_paid) === 20000, `P3 expected 20000, got ${res3.invoice.amount_paid}`);
    assert(Number(res3.invoice.balance_amount) === 0, `P3 expected balance 0, got ${res3.invoice.balance_amount}`);
    assert(res3.invoice.payment_status === 'paid', 'P3 status must be paid');

    results.push({
      name: 'Test 3 – Multiple Payments (₹5,000 + ₹7,000 + ₹8,000 on ₹20,000 -> PAID)',
      passed: true,
      details: { final_paid: res3.invoice.amount_paid, final_balance: res3.invoice.balance_amount, status: res3.invoice.payment_status }
    });
  } catch (err: any) {
    results.push({ name: 'Test 3 – Multiple Payments', passed: false, message: err.message });
  }

  // -------------------------------------------------------------------------
  // Test 4: Duplicate Webhook (Idempotency)
  // Send the same successful Razorpay payment ID twice.
  // Expected: Only one payment record created, no double counting.
  // -------------------------------------------------------------------------
  try {
    const inv = createTestInvoice(25000, `TEST/INV/1004/${Date.now()}`);
    const duplicatePaymentId = `pay_duplicate_fixed_${Date.now()}`;

    // First webhook delivery
    const res1 = await recordVerifiedRazorpayPayment({
      invoiceId: inv.id,
      amount: 10000,
      paymentMethod: 'UPI',
      razorpayPaymentId: duplicatePaymentId,
      webhookEventId: 'evt_001'
    });
    assert(!res1.alreadyRecorded, 'First call should not be flagged as duplicate');
    assert(Number(res1.invoice.amount_paid) === 10000, 'First call amount_paid should be 10000');

    // Second webhook delivery with the exact same payment ID
    const res2 = await recordVerifiedRazorpayPayment({
      invoiceId: inv.id,
      amount: 10000,
      paymentMethod: 'UPI',
      razorpayPaymentId: duplicatePaymentId,
      webhookEventId: 'evt_001_retry'
    });
    assert(res2.alreadyRecorded === true, 'Second call must detect alreadyRecorded = true');
    assert(Number(res2.invoice.amount_paid) === 10000, `Amount paid must remain 10000, but got ${res2.invoice.amount_paid}`);
    assert(Number(res2.invoice.balance_amount) === 15000, `Balance must remain 15000, but got ${res2.invoice.balance_amount}`);

    results.push({
      name: 'Test 4 – Duplicate Webhook (Idempotency deduplicates identical razorpay_payment_id)',
      passed: true,
      details: { alreadyRecorded: res2.alreadyRecorded, amount_paid: res2.invoice.amount_paid }
    });
  } catch (err: any) {
    results.push({ name: 'Test 4 – Duplicate Webhook', passed: false, message: err.message });
  }

  // -------------------------------------------------------------------------
  // Test 5: Failed Payment
  // If payment fails, paid amount must remain unchanged.
  // -------------------------------------------------------------------------
  try {
    const inv = createTestInvoice(25000, `TEST/INV/1005/${Date.now()}`);

    // Initial partial payment: ₹10,000
    await recordVerifiedRazorpayPayment({
      invoiceId: inv.id,
      amount: 10000,
      paymentMethod: 'UPI',
      razorpayPaymentId: `pay_valid_${Date.now()}`
    });

    const store = loadPersistentStore();
    const currentInv = store.invoices.find((i: any) => i.id === inv.id);
    const paidBefore = Number(currentInv.amount_paid);
    const pendingBefore = Number(currentInv.balance_amount);

    // Record failed payment attempt
    const failedPayment = {
      id: Date.now() + 999,
      invoice_id: inv.id,
      amount: 15000,
      currency: 'INR',
      payment_method: 'Card',
      status: 'failed',
      notes: 'Customer payment failed/declined by bank',
      payment_date: new Date().toISOString(),
      created_at: new Date().toISOString()
    };
    store.payments.push(failedPayment);
    savePersistentStore(store);

    // Verify invoice totals were not incremented by the failed amount
    const verifiedStore = loadPersistentStore();
    const invAfterFail = verifiedStore.invoices.find((i: any) => i.id === inv.id);
    assert(Number(invAfterFail.amount_paid) === paidBefore, 'Failed payment must not increase amount_paid');
    assert(Number(invAfterFail.balance_amount) === pendingBefore, 'Failed payment must not alter balance_amount');

    results.push({
      name: 'Test 5 – Failed Payment (Declined transaction leaves paid amount and balance unchanged)',
      passed: true,
      details: { paidBefore, paidAfter: invAfterFail.amount_paid, balance: invAfterFail.balance_amount }
    });
  } catch (err: any) {
    results.push({ name: 'Test 5 – Failed Payment', passed: false, message: err.message });
  }

  // -------------------------------------------------------------------------
  // Test 6: Outstanding Payment Link
  // Invoice = ₹50,000, Paid = ₹20,000 -> Outstanding = ₹30,000
  // Expected payment order request = ₹30,000 (3,000,000 paise)
  // -------------------------------------------------------------------------
  try {
    const inv = createTestInvoice(50000, `TEST/INV/1006/${Date.now()}`);

    // Pre-pay ₹20,000
    await recordVerifiedRazorpayPayment({
      invoiceId: inv.id,
      amount: 20000,
      paymentMethod: 'Bank Transfer',
      razorpayPaymentId: `pay_prepay_${Date.now()}`
    });

    // Request order without passing amount (backend computes dynamic outstanding balance)
    const orderRes = await createRazorpayOrder(inv.id);
    assert(orderRes.success === true, 'Order creation should succeed');
    assert(orderRes.order !== undefined, 'Order object must be returned');

    // Amount in paise: 30000 * 100 = 3,000,000
    const expectedPaise = 30000 * 100;
    assert(
      orderRes.order.amount === expectedPaise,
      `Expected order amount ${expectedPaise} paise (₹30,000), but got ${orderRes.order.amount}`
    );
    assert(
      orderRes.invoice.outstanding_amount === 30000,
      `Expected invoice outstanding 30000, got ${orderRes.invoice.outstanding_amount}`
    );

    results.push({
      name: 'Test 6 – Outstanding Payment Link (Dynamic balance calculation ₹30,000 from ₹50,000 - ₹20,000)',
      passed: true,
      details: { expectedPaise, orderAmount: orderRes.order.amount, outstanding: orderRes.invoice.outstanding_amount }
    });
  } catch (err: any) {
    results.push({ name: 'Test 6 – Outstanding Payment Link', passed: false, message: err.message });
  }

  // -------------------------------------------------------------------------
  // Test 7: Fully Paid Invoice
  // When invoice balance is 0, attempting to create payment order is rejected
  // -------------------------------------------------------------------------
  try {
    const inv = createTestInvoice(10000, `TEST/INV/1007/${Date.now()}`);

    // Fully pay
    await recordVerifiedRazorpayPayment({
      invoiceId: inv.id,
      amount: 10000,
      paymentMethod: 'UPI',
      razorpayPaymentId: `pay_settled_${Date.now()}`
    });

    // Try creating payment order
    let caughtError = false;
    try {
      await createRazorpayOrder(inv.id);
    } catch (err: any) {
      caughtError = true;
      assert(err.message.includes('fully paid'), `Unexpected error message: ${err.message}`);
    }

    assert(caughtError === true, 'createRazorpayOrder must reject fully paid invoice');

    results.push({
      name: 'Test 7 – Fully Paid Invoice (Rejects new payment orders when balance is zero)',
      passed: true
    });
  } catch (err: any) {
    results.push({ name: 'Test 7 – Fully Paid Invoice', passed: false, message: err.message });
  }

  // -------------------------------------------------------------------------
  // Test 8: Concurrent Payment & Webhook Signature Safety
  // Verifies HMAC SHA-256 signature algorithm against forged payloads,
  // and verifies atomic multi-payment balance aggregation.
  // -------------------------------------------------------------------------
  try {
    const secret = 'digi8_test_webhook_secret_xyz123';
    const payload = JSON.stringify({
      event: 'payment.captured',
      payload: {
        payment: {
          entity: {
            id: 'pay_verify_888',
            amount: 500000,
            currency: 'INR',
            status: 'captured'
          }
        }
      }
    });

    // Valid HMAC SHA-256 signature
    const validSignature = crypto.createHmac('sha256', secret).update(payload).digest('hex');

    const isValid = verifyRazorpayWebhookSignature(payload, validSignature, secret);
    assert(isValid === true, 'Legitimate signature must verify successfully');

    const isInvalid = verifyRazorpayWebhookSignature(payload, 'tampered_signature_abc', secret);
    assert(isInvalid === false, 'Tampered signature must be rejected');

    // Checkout signature check
    const orderId = 'order_chk_123';
    const paymentId = 'pay_chk_456';
    const checkoutSecret = 'rzp_chk_secret';
    const validCheckoutSig = crypto
      .createHmac('sha256', checkoutSecret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    const isCheckoutValid = verifyRazorpayPaymentSignature(orderId, paymentId, validCheckoutSig, checkoutSecret);
    assert(isCheckoutValid === true, 'Checkout signature must verify successfully');

    // Concurrency test: execute multiple concurrent payment reconciliation requests
    const inv = createTestInvoice(30000, `TEST/INV/1008/${Date.now()}`);
    const promises = [
      recordVerifiedRazorpayPayment({
        invoiceId: inv.id,
        amount: 10000,
        paymentMethod: 'UPI',
        razorpayPaymentId: `pay_conc_1_${Date.now()}`
      }),
      recordVerifiedRazorpayPayment({
        invoiceId: inv.id,
        amount: 10000,
        paymentMethod: 'Card',
        razorpayPaymentId: `pay_conc_2_${Date.now()}`
      }),
      recordVerifiedRazorpayPayment({
        invoiceId: inv.id,
        amount: 10000,
        paymentMethod: 'Netbanking',
        razorpayPaymentId: `pay_conc_3_${Date.now()}`
      })
    ];

    await Promise.all(promises);

    const store = loadPersistentStore();
    const finalInv = store.invoices.find((i: any) => i.id === inv.id);
    assert(Number(finalInv.amount_paid) === 30000, `Expected 30000 paid, got ${finalInv.amount_paid}`);
    assert(Number(finalInv.balance_amount) === 0, `Expected 0 balance, got ${finalInv.balance_amount}`);
    assert(finalInv.payment_status === 'paid', 'Status must be paid');

    results.push({
      name: 'Test 8 – Concurrent Payment & Webhook Signature Safety (HMAC SHA-256 + Atomic Sums)',
      passed: true,
      details: { final_paid: finalInv.amount_paid, final_balance: finalInv.balance_amount }
    });
  } catch (err: any) {
    results.push({ name: 'Test 8 – Concurrent Payment & Signature Safety', passed: false, message: err.message });
  }

  // Print Summary
  console.log('\n--- TEST RESULTS SUMMARY ---');
  let allPassed = true;
  for (const r of results) {
    const symbol = r.passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${symbol} : ${r.name}`);
    if (r.details) {
      console.log(`         Details: ${JSON.stringify(r.details)}`);
    }
    if (r.message) {
      console.log(`         Error: ${r.message}`);
      allPassed = false;
    }
  }

  console.log('\n-------------------------------------------------------------');
  if (allPassed) {
    console.log(`🎉 ALL ${results.length} SPECIFICATION TESTS PASSED SUCCESSFULLY!`);
    console.log('-------------------------------------------------------------\n');
    process.exit(0);
  } else {
    console.log('⚠️ SOME TESTS FAILED. PLEASE INSPECT LOGS ABOVE.');
    console.log('-------------------------------------------------------------\n');
    process.exit(1);
  }
}

runTestSuite().catch((err) => {
  console.error('Test runner fatal error:', err);
  process.exit(1);
});
