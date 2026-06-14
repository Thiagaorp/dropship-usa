import LegalPage from "@/components/LegalPage";

export const metadata = {
  title: "Shipping Policy — ShopDirectUSA",
  description: "Delivery times, shipping costs, and tracking information.",
};

export default function ShippingPage() {
  return (
    <LegalPage title="Shipping Policy" updated="June 2026">
      <h2>Processing Time</h2>
      <p>
        All orders are processed within <strong>1–2 business days</strong> (excluding weekends and
        holidays) after you receive your order confirmation email. You will receive another
        notification once your order has shipped.
      </p>

      <h2>Shipping Rates & Delivery Estimates</h2>
      <ul>
        <li><strong>Standard Shipping (Free over $35):</strong> 7–15 business days</li>
        <li><strong>Standard Shipping (under $35):</strong> $4.99 flat rate, 7–15 business days</li>
        <li><strong>Expedited Shipping:</strong> $12.99, 3–7 business days</li>
      </ul>
      <p>
        Delivery delays can occasionally occur during peak seasons or due to carrier issues. We
        appreciate your patience.
      </p>

      <h2>Shipment Tracking</h2>
      <p>
        When your order ships, you will receive a shipment confirmation email containing your
        tracking number. The tracking number will be active within 24–48 hours.
      </p>

      <h2>Shipping Destinations</h2>
      <p>
        We currently ship to all <strong>50 U.S. states</strong>, including Alaska and Hawaii, as
        well as U.S. territories. We do not yet offer international shipping.
      </p>

      <h2>Lost or Stolen Packages</h2>
      <p>
        ShopDirectUSA is not responsible for packages lost or stolen after they are marked
        delivered by the carrier. If your tracking shows delivered but you have not received your
        package, please contact the carrier first, then reach out to us at{" "}
        <a href="mailto:support@shopdirectusa.com">support@shopdirectusa.com</a> and we will do our
        best to help.
      </p>

      <h2>Questions?</h2>
      <p>
        If you have any questions about shipping, email us at{" "}
        <a href="mailto:support@shopdirectusa.com">support@shopdirectusa.com</a>.
      </p>
    </LegalPage>
  );
}
