"use client";

import Link from "next/link";
import Accordion from "@/components/Accordion";
import Footer from "@/components/Footer";

export default function FAQPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 py-20">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold text-white mb-6">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-white/90 mb-8">
            Everything you need to know about EventHub
          </p>
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white font-semibold rounded-full transition-all duration-200 border border-white/20"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-16 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Accordion
            items={[
              {
                id: 'faq-1',
                question: 'How do I create an event on EventHub?',
                answer: 'Creating an event is easy! Simply sign up for an Organizer account, click on "Create Event" in the navigation menu, fill in your event details including name, date, location, and pricing, then publish it. Your event will be visible to thousands of potential attendees immediately.'
              },
              {
                id: 'faq-2',
                question: 'What payment methods are accepted?',
                answer: 'EventHub accepts various payment methods including bank transfers, credit/debit cards, and popular Indonesian e-wallets. All transactions are secure and encrypted. After purchasing a ticket, you can upload your payment proof for verification by the event organizer.'
              },
              {
                id: 'faq-3',
                question: 'How does the referral system work?',
                answer: 'When you refer a friend using your unique referral code, they get a 10% discount coupon valid for 3 months, and you earn 10,000 points! Points can be used to reduce ticket prices. Your referral code is available in your profile after registration.'
              },
              {
                id: 'faq-4',
                question: 'Can I get a refund if I can\'t attend an event?',
                answer: 'Refund policies are set by individual event organizers. Some events offer full refunds, partial refunds, or no refunds. Please check the specific event\'s terms and conditions before purchasing. If eligible, you can request a refund through your transaction history.'
              },
              {
                id: 'faq-5',
                question: 'How do I use my discount coupons and points?',
                answer: 'During checkout, you\'ll see options to apply coupon codes and use your accumulated points. Coupons provide percentage or fixed discounts, while points directly reduce the ticket price (1 point = IDR 1). You can combine coupons with points for maximum savings!'
              },
              {
                id: 'faq-6',
                question: 'What happens after I purchase a ticket?',
                answer: 'After purchasing, you\'ll have 2 hours to upload payment proof. Once the organizer confirms your payment (within 3 days), your ticket status changes to "Done" and you\'ll receive a confirmation email. You can view and download your tickets from "My Tickets" section anytime.'
              },
              {
                id: 'faq-7',
                question: 'Can I review an event?',
                answer: 'Yes! After attending an event, you can leave a rating (1-5 stars) and write a review. Your feedback helps other users make informed decisions and helps organizers improve their events. Reviews are visible on the event organizer\'s profile.'
              },
              {
                id: 'faq-8',
                question: 'How do I become an event organizer?',
                answer: 'Simply register and select "Event Organizer" as your account type. As an organizer, you\'ll get access to powerful tools including event creation, ticket management, analytics dashboard, promotion codes, and attendee management. Start hosting events today!'
              },
              {
                id: 'faq-9',
                question: 'How can I contact customer support?',
                answer: 'You can reach our customer support team through multiple channels: email us at support@eventhub.com, use the live chat feature on our website, or visit our Contact page. Our support team is available 24/7 to assist you with any questions or issues.'
              },
              {
                id: 'faq-10',
                question: 'Is my personal information secure?',
                answer: 'Yes, absolutely! EventHub uses industry-standard encryption and security measures to protect your personal information. We never share your data with third parties without your consent. Please read our Privacy Policy for detailed information about how we handle your data.'
              }
            ]}
          />

          {/* Still have questions? */}
          <div className="mt-16 text-center">
            <div className="inline-block bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 px-8 py-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                Still have questions?
              </h3>
              <p className="text-lg text-gray-700 mb-6">
                We&apos;re here to help! Reach out to our support team and we&apos;ll get back to you as soon as possible.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/contact"
                  className="inline-block px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-full transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                >
                  Contact Support
                </Link>
                <Link
                  href="/help"
                  className="inline-block px-8 py-3 bg-white hover:bg-gray-50 text-gray-800 font-semibold rounded-full transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 border border-gray-200"
                >
                  Help Center
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
