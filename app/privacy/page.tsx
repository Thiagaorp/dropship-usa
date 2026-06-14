import LegalPage from "@/components/LegalPage";

export const metadata = {
  title: "Privacy Policy — ShopDirectUSA",
  description: "How we collect, use, and protect your personal information.",
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="June 2026">
      <p>
        ShopDirectUSA (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) respects your privacy. This Privacy Policy
        explains how we collect, use, and protect your personal information when you visit or make a
        purchase from our website.
      </p>

      <h2>Information We Collect</h2>
      <p>When you place an order or contact us, we may collect:</p>
      <ul>
        <li>Contact details such as your name, email address, and phone number</li>
        <li>Shipping and billing addresses</li>
        <li>Payment information (processed securely by Stripe — we never store card numbers)</li>
        <li>Order history and preferences</li>
        <li>Device and browsing information collected automatically via cookies</li>
      </ul>

      <h2>How We Use Your Information</h2>
      <ul>
        <li>To process and fulfill your orders</li>
        <li>To communicate with you about your order and provide customer support</li>
        <li>To send order confirmations and shipping updates</li>
        <li>To improve our website and product offerings</li>
        <li>To prevent fraud and ensure the security of our store</li>
      </ul>

      <h2>Payment Security</h2>
      <p>
        All payments are processed through <strong>Stripe</strong>, a PCI-DSS compliant payment
        processor. Your payment card details are encrypted and transmitted directly to Stripe — we
        never see or store your full card number.
      </p>

      <h2>Sharing Your Information</h2>
      <p>
        We do not sell your personal information. We share data only with trusted service providers
        who help us operate our store, such as our payment processor (Stripe), shipping carriers,
        and product suppliers, strictly for the purpose of fulfilling your order.
      </p>

      <h2>Cookies</h2>
      <p>
        We use cookies to keep items in your cart, remember your preferences, and analyze site
        traffic. You can disable cookies in your browser settings, though some features may not work
        properly.
      </p>

      <h2>Your Rights</h2>
      <p>
        You have the right to access, correct, or request deletion of your personal information. To
        make a request, email us at{" "}
        <a href="mailto:support@shopdirectusa.com">support@shopdirectusa.com</a>.
      </p>

      <h2>Changes to This Policy</h2>
      <p>
        We may update this Privacy Policy from time to time. Any changes will be posted on this page
        with an updated revision date.
      </p>

      <h2>Contact Us</h2>
      <p>
        If you have questions about this Privacy Policy, contact us at{" "}
        <a href="mailto:support@shopdirectusa.com">support@shopdirectusa.com</a>.
      </p>
    </LegalPage>
  );
}
