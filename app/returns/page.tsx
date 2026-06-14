import LegalPage from "@/components/LegalPage";

export const metadata = {
  title: "Returns & Refunds — ShopDirectUSA",
  description: "Our 30-day return policy and refund process.",
};

export default function ReturnsPage() {
  return (
    <LegalPage title="Returns & Refunds" updated="June 2026">
      <h2>30-Day Return Policy</h2>
      <p>
        We want you to love your purchase. If you are not completely satisfied, you may return most
        items within <strong>30 days of delivery</strong> for a full refund or exchange.
      </p>

      <h2>Eligibility</h2>
      <p>To be eligible for a return, your item must be:</p>
      <ul>
        <li>Unused and in the same condition that you received it</li>
        <li>In its original packaging with all tags attached</li>
        <li>Accompanied by a receipt or proof of purchase</li>
      </ul>
      <p>
        Certain items cannot be returned, including perishable goods, personal care items, and
        intimate apparel, for hygiene reasons.
      </p>

      <h2>How to Start a Return</h2>
      <p>
        To start a return, email us at{" "}
        <a href="mailto:support@shopdirectusa.com">support@shopdirectusa.com</a> with your order
        number and the reason for the return. We will respond within 24 hours with return
        instructions.
      </p>
      <p>
        Please do not send items back before receiving return instructions, as this may delay your
        refund.
      </p>

      <h2>Refunds</h2>
      <p>
        Once we receive and inspect your returned item, we will notify you of the approval status.
        If approved, your refund will be processed to your original payment method within{" "}
        <strong>5–10 business days</strong>.
      </p>

      <h2>Damaged or Defective Items</h2>
      <p>
        If you received a damaged or defective item, please contact us within{" "}
        <strong>48 hours of delivery</strong> with a photo. We will send a free replacement or issue
        a full refund — no need to return the item.
      </p>

      <h2>Return Shipping</h2>
      <p>
        Customers are responsible for return shipping costs unless the item arrived damaged,
        defective, or incorrect. We recommend using a trackable shipping service.
      </p>

      <h2>Questions?</h2>
      <p>
        Reach our support team anytime at{" "}
        <a href="mailto:support@shopdirectusa.com">support@shopdirectusa.com</a>.
      </p>
    </LegalPage>
  );
}
