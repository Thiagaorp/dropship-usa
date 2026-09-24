import LegalPage from "@/components/LegalPage";
import { SHIPPING, TRANSIT_LABEL } from "@/lib/business";

export const metadata = {
  title: "Shipping Policy — ShopDirectUSA",
  description: "Delivery times, shipping costs, and tracking information.",
};

// Delivery promises come from lib/business.ts, which mirrors the Merchant Center
// shipping settings. Keep them in sync — a mismatch is a policy violation.
export default function ShippingPage() {
  return (
    <LegalPage title="Shipping Policy" updated="September 2026">
      <h2>Processing Time</h2>
      <p>
        Orders are processed within <strong>{SHIPPING.handlingMaxDays} business day</strong>{" "}
        (excluding weekends and holidays) after you receive your order confirmation email. You will
        receive another notification once your order has shipped.
      </p>

      <h2>Shipping Rates & Delivery Estimates</h2>
      <ul>
        <li>
          <strong>Standard Shipping — FREE on all orders:</strong> {TRANSIT_LABEL} after processing
        </li>
      </ul>
      <p>
        Standard shipping is the only shipping method we offer. Items ship from our fulfillment
        partners&apos; warehouses; some items are stocked in a U.S. warehouse and may arrive sooner
        than the estimate above.
      </p>
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
