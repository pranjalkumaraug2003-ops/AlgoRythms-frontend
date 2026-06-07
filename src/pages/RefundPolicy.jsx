import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import Footer from "../components/Footer";

export default function RefundPolicy() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  const homePath = localStorage.getItem("currentUser") ? "/main" : "/";
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0d0d0d] via-[#121212] to-[#1a1a2e] text-white flex flex-col">
      <nav className="flex justify-between items-center py-6 px-6 md:px-12 border-b border-white/10 bg-black/40 backdrop-blur-xl sticky top-0 z-50">
        <Link to="/" className="text-xl font-black bg-gradient-to-r from-[#1db954] to-[#1ed760] bg-clip-text text-transparent">
          AlgoRythms
        </Link>
        <Link to={homePath} className="text-sm font-semibold text-gray-300 hover:text-white transition-colors">
          Back to Home
        </Link>
      </nav>

      <div className="flex-1 max-w-4xl mx-auto w-full px-6 py-16">
        <h1 className="text-4xl md:text-5xl font-black mb-10 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
          Refund Policy
        </h1>
        
        <div className="prose prose-invert max-w-none space-y-8 text-gray-300 bg-white/5 p-8 md:p-12 rounded-3xl border border-white/10 shadow-2xl">
          <section>
            <p className="text-sm text-gray-400 mb-6">Last Updated: {new Date().toLocaleDateString()}</p>
            <h2 className="text-2xl font-bold text-white mb-4">1. General Policy</h2>
            <p className="leading-relaxed">
              At AlgoRythms, we strive to ensure our users are satisfied with our services. This Refund Policy explains our guidelines regarding refunds for our premium subscription, "AlgoRythms Plus".
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. Subscription Payments</h2>
            <p className="leading-relaxed">
              AlgoRythms Plus is billed on a monthly basis. All charges are processed securely through Razorpay.
            </p>
            <p className="leading-relaxed mt-4 font-bold text-white">
              All subscription payments are non-refundable once processed.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. Cancellations</h2>
            <p className="leading-relaxed">
              You may cancel your AlgoRythms Plus subscription at any time. When you cancel, you will continue to have access to premium features until the end of your current billing cycle. After that, your account will revert to the standard free tier. We do not provide prorated refunds for partial months.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. Billing Errors</h2>
            <p className="leading-relaxed">
              If you believe there has been a billing error on your account (e.g., being charged twice or charged after cancellation), please contact our support team immediately. If we verify that an error occurred on our end or with our payment processor, we will issue a full refund for the erroneous charge.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">5. Contact Us</h2>
            <p className="leading-relaxed">
              If you have any questions about this Refund Policy or wish to report a billing issue, please contact us. Note that Razorpay is only responsible for payment processing; any refund requests must be directed to AlgoRythms.
            </p>
          </section>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
