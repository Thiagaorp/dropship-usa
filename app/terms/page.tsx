import LegalPage from "@/components/LegalPage";

export const metadata = {
  title: "Terms of Service — ShopDirectUSA",
  description: "The terms and conditions governing your use of our store.",
};

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service" updated="June 2026">
      <p>
        Welcome to ShopDirectUSA. By accessing or using our website and placing an order, you agree
        to be bound by these Terms of Service. Please read them carefully.
      </p>

      <h2>Use of Our Website</h2>
      <p>
        You may use our website for lawful purposes only. You agree not to use the site in any way
        that could damage, disable, or impair the service, or interfere with any other party&apos;s use
        of the site.
      </p>

      <h2>Products & Pricing</h2>
      <p>
        We strive to display accurate product descriptions, images, and prices. However, we do not
        guarantee that all information is error-free. We reserve the right to correct any errors and
        to change prices at any time without prior notice. Colors may vary slightly due to screen
        settings.
      </p>

      <h2>Orders</h2>
      <p>
        When you place an order, you make an offer to purchase the product at the listed price. We
        reserve the right to accept or decline any order, and to limit or cancel quantities
        purchased per person or per order. If we cancel an order after payment, you will receive a
        full refund.
      </p>

      <h2>Payment</h2>
      <p>
        All payments are processed securely through Stripe. By submitting your payment information,
        you represent that you are authorized to use the payment method provided.
      </p>

      <h2>Shipping & Returns</h2>
      <p>
        Shipping timelines and return eligibility are described in our{" "}
        <a href="/shipping">Shipping Policy</a> and <a href="/returns">Returns &amp; Refunds</a>{" "}
        pages, which form part of these Terms.
      </p>

      <h2>Intellectual Property</h2>
      <p>
        All content on this website, including text, graphics, logos, and images, is the property of
        ShopDirectUSA or its content suppliers and is protected by applicable intellectual property
        laws. You may not reproduce or reuse it without our written permission.
      </p>

      <h2>Limitation of Liability</h2>
      <p>
        To the fullest extent permitted by law, ShopDirectUSA shall not be liable for any indirect,
        incidental, or consequential damages arising from your use of our website or products.
      </p>

      <h2>Changes to These Terms</h2>
      <p>
        We may update these Terms of Service at any time. Continued use of the website after changes
        are posted constitutes acceptance of the revised terms.
      </p>

      <h2>Contact Us</h2>
      <p>
        Questions about these Terms can be sent to{" "}
        <a href="mailto:support@shopdirectusa.com">support@shopdirectusa.com</a>.
      </p>
    </LegalPage>
  );
}
