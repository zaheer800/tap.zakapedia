-- Run this if you already applied schema.sql and need to update the payment column name.
-- Renames razorpay_payment_id → payment_reference on both order tables.

ALTER TABLE tap.nfc_orders RENAME COLUMN razorpay_payment_id TO payment_reference;
ALTER TABLE tap.visiting_card_orders RENAME COLUMN razorpay_payment_id TO payment_reference;
