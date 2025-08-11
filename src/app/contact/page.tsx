import { Metadata } from 'next';
import { ContactForm } from '@/components/forms/ContactForm';

export const metadata: Metadata = {
  title: 'Contact - BorderlessBits',
  description:
    'Get in touch with BorderlessBits for expert cloud architecture and healthcare software consulting services.',
  keywords: [
    'contact',
    'cloud architecture',
    'healthcare software',
    'consulting',
    'BorderlessBits',
  ],
  openGraph: {
    title: 'Contact BorderlessBits - Expert Cloud & Healthcare Consulting',
    description:
      'Connect with our team for professional cloud architecture and healthcare software consulting services.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact BorderlessBits - Expert Cloud & Healthcare Consulting',
    description:
      'Connect with our team for professional cloud architecture and healthcare software consulting services.',
  },
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Get in Touch</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Ready to transform your technology infrastructure? Let's discuss your project
            requirements and how we can help you achieve your goals.
          </p>
        </div>

        {/* Contact Form Section */}
        <div className="bg-white rounded-lg shadow-xl p-8 mb-12">
          <ContactForm />
        </div>

        {/* Contact Information */}
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Our Services</h3>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-start">
                <svg
                  className="h-5 w-5 text-blue-500 mt-0.5 mr-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Cloud Architecture & Migration
              </li>
              <li className="flex items-start">
                <svg
                  className="h-5 w-5 text-blue-500 mt-0.5 mr-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Healthcare Software Development
              </li>
              <li className="flex items-start">
                <svg
                  className="h-5 w-5 text-blue-500 mt-0.5 mr-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Enterprise Technology Consulting
              </li>
              <li className="flex items-start">
                <svg
                  className="h-5 w-5 text-blue-500 mt-0.5 mr-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                HIPAA Compliance & Security
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Why Choose BorderlessBits?</h3>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-start">
                <svg
                  className="h-5 w-5 text-green-500 mt-0.5 mr-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Proven expertise in enterprise environments
              </li>
              <li className="flex items-start">
                <svg
                  className="h-5 w-5 text-green-500 mt-0.5 mr-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Focus on measurable business outcomes
              </li>
              <li className="flex items-start">
                <svg
                  className="h-5 w-5 text-green-500 mt-0.5 mr-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Comprehensive security and compliance
              </li>
              <li className="flex items-start">
                <svg
                  className="h-5 w-5 text-green-500 mt-0.5 mr-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Agile approach with rapid delivery
              </li>
            </ul>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <p className="text-lg text-gray-600">
            Have questions about your project? We're here to help.
          </p>
        </div>
      </div>
    </div>
  );
}
