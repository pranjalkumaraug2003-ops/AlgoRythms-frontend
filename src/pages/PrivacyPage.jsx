import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import Footer from "../components/Footer";

export default function PrivacyPolicy() {
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
          Privacy Policy
        </h1>
        
        <div className="prose prose-invert max-w-none space-y-8 text-gray-300 bg-white/5 p-8 md:p-12 rounded-3xl border border-white/10 shadow-2xl">
          <section>
            <p className="text-sm text-gray-400 mb-6">Last Updated: {new Date().toLocaleDateString()}</p>
            <h2 className="text-2xl font-bold text-white mb-4">1. Information We Collect</h2>
            <p className="leading-relaxed mb-4">We collect information to provide better services to all our users. Information we collect includes:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Account Information:</strong> When you sign up, we collect your email address, username, and securely hashed password.</li>
              <li><strong>Usage Data:</strong> We track your likes, dislikes, and playlist curations to improve the recommendation algorithm specifically for your account.</li>
              <li><strong>Search Queries:</strong> Queries entered into our standard, Pro, and Mood searches are temporarily processed to fetch relevant music but are not permanently logged against your personal identity outside of your active session data.</li>
              <li><strong>Payment Information:</strong> If you subscribe to AlgoRythms Plus, your payment details are securely processed and stored by Razorpay. AlgoRythms does not store your full credit card number or UPI details on our servers.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. How We Use Information</h2>
            <p className="leading-relaxed">
              We securely store your data in our MongoDB databases. We use the information we collect to:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li>Provide, maintain, and improve our Service.</li>
              <li>Train our machine learning models (SVD + Nearest Neighbors) strictly to provide better song recommendations for you.</li>
              <li>Develop new features and customize your user experience.</li>
              <li>Process transactions and send related information (e.g., confirmations, receipts).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. Data Sharing and Third Parties</h2>
            <p className="leading-relaxed">
              We do not sell your personal data to third parties. We share data only in the following scenarios:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li><strong>Google Gemini AI:</strong> When you use Pro Search or Mood Search, your query is sent to the Gemini API to generate musical recommendations. No identifying account information is sent.</li>
              <li><strong>YouTube:</strong> Interacting with our embed player falls under YouTube's Privacy Policy.</li>
              <li><strong>Spotify:</strong> We request metadata from Spotify, but no personal user data is transferred back to Spotify from our platform.</li>
              <li><strong>Razorpay:</strong> Necessary billing information is shared securely for processing subscription payments.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. Your Rights</h2>
            <p className="leading-relaxed">
              You have the right to access, edit, or delete your personal data. You can manage your liked and disliked songs directly from your Profile page. If you wish to permanently delete your account and remove all associated data, you can do so from the Settings menu, which will wipe your information from our MongoDB records.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">5. Contact Us</h2>
            <p className="leading-relaxed">
              If you have any questions about this Privacy Policy, please contact our support team.
            </p>
          </section>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
