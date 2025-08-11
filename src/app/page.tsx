import type { Metadata } from 'next';
import { ContactForm } from '@/components/forms/ContactForm';

export const metadata: Metadata = {
  title: 'Home',
  description:
    'Transform your enterprise with expert cloud architecture and healthcare software consulting. Specializing in AWS, Azure, HIPAA compliance, and scalable solutions.',
};

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">BorderlessBits</h1>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a
                href="#services"
                className="text-gray-700 hover:text-primary-600 transition-colors"
              >
                Services
              </a>
              <a
                href="#case-studies"
                className="text-gray-700 hover:text-primary-600 transition-colors"
              >
                Case Studies
              </a>
              <a href="#about" className="text-gray-700 hover:text-primary-600 transition-colors">
                About
              </a>
              <a href="#contact" className="text-gray-700 hover:text-primary-600 transition-colors">
                Contact
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main id="main-content">
        {/* Hero Section */}
        <section className="section-lg bg-gradient-to-br from-primary-50 to-primary-100">
          <div className="container max-w-7xl">
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="text-5xl sm:text-6xl font-display font-bold text-gray-900 mb-6">
                Transform Your Enterprise with
                <span className="text-gradient block">Expert Cloud Architecture</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Specializing in cloud architecture, healthcare software, and enterprise consulting.
                We help organizations scale, secure, and optimize their technology infrastructure
                for sustainable growth.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="#contact" className="btn-primary btn-lg">
                  Start Your Project
                </a>
                <a href="#case-studies" className="btn-outline btn-lg">
                  View Case Studies
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section id="services" className="section">
          <div className="container max-w-7xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-display font-bold text-gray-900 mb-4">Our Expertise</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                We provide comprehensive consulting services to help your organization leverage
                modern cloud technologies and best practices.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Cloud Architecture Service */}
              <div className="card card-hover p-8">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-6">
                  <svg
                    className="w-6 h-6 text-primary-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">Cloud Architecture</h3>
                <p className="text-gray-600 mb-6">
                  Design and implement scalable, secure cloud infrastructures using AWS, Azure, and
                  multi-cloud strategies tailored to your business needs.
                </p>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li className="flex items-center">
                    <span className="w-1.5 h-1.5 bg-primary-500 rounded-full mr-2"></span>
                    Cloud migration planning & execution
                  </li>
                  <li className="flex items-center">
                    <span className="w-1.5 h-1.5 bg-primary-500 rounded-full mr-2"></span>
                    Infrastructure as Code (IaC)
                  </li>
                  <li className="flex items-center">
                    <span className="w-1.5 h-1.5 bg-primary-500 rounded-full mr-2"></span>
                    Performance optimization
                  </li>
                </ul>
              </div>

              {/* Healthcare Software Service */}
              <div className="card card-hover p-8">
                <div className="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center mb-6">
                  <svg
                    className="w-6 h-6 text-success-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">Healthcare Software</h3>
                <p className="text-gray-600 mb-6">
                  Develop HIPAA-compliant healthcare applications with focus on security,
                  interoperability, and user experience for better patient outcomes.
                </p>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li className="flex items-center">
                    <span className="w-1.5 h-1.5 bg-success-500 rounded-full mr-2"></span>
                    HIPAA compliance & security
                  </li>
                  <li className="flex items-center">
                    <span className="w-1.5 h-1.5 bg-success-500 rounded-full mr-2"></span>
                    EHR system integration
                  </li>
                  <li className="flex items-center">
                    <span className="w-1.5 h-1.5 bg-success-500 rounded-full mr-2"></span>
                    Patient data management
                  </li>
                </ul>
              </div>

              {/* Enterprise Consulting Service */}
              <div className="card card-hover p-8">
                <div className="w-12 h-12 bg-warning-100 rounded-lg flex items-center justify-center mb-6">
                  <svg
                    className="w-6 h-6 text-warning-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">Enterprise Consulting</h3>
                <p className="text-gray-600 mb-6">
                  Strategic technology consulting to help enterprises modernize their systems,
                  improve efficiency, and drive digital transformation.
                </p>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li className="flex items-center">
                    <span className="w-1.5 h-1.5 bg-warning-500 rounded-full mr-2"></span>
                    Digital transformation strategy
                  </li>
                  <li className="flex items-center">
                    <span className="w-1.5 h-1.5 bg-warning-500 rounded-full mr-2"></span>
                    System architecture review
                  </li>
                  <li className="flex items-center">
                    <span className="w-1.5 h-1.5 bg-warning-500 rounded-full mr-2"></span>
                    Technology roadmap planning
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="section bg-gray-50">
          <div className="container max-w-7xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-display font-bold text-gray-900 mb-4">
                Start Your Project Today
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Ready to transform your technology infrastructure? Let's discuss your project
                requirements and how we can help achieve your goals.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-12 items-start">
              {/* Contact Information */}
              <div className="lg:pr-8">
                <h3 className="text-2xl font-semibold text-gray-900 mb-6">Get in Touch</h3>
                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                        <svg
                          className="w-5 h-5 text-primary-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-4">
                      <h4 className="text-lg font-medium text-gray-900">Email</h4>
                      <p className="text-gray-600">richard@borderlessbits.com</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                        <svg
                          className="w-5 h-5 text-primary-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-4">
                      <h4 className="text-lg font-medium text-gray-900">Response Time</h4>
                      <p className="text-gray-600">Within 24 hours</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                        <svg
                          className="w-5 h-5 text-primary-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-4">
                      <h4 className="text-lg font-medium text-gray-900">Service Area</h4>
                      <p className="text-gray-600">United States (Remote)</p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 p-6 bg-white rounded-lg border border-gray-200">
                  <h4 className="text-lg font-medium text-gray-900 mb-3">
                    Why Choose BorderlessBits?
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center">
                      <span className="w-1.5 h-1.5 bg-primary-500 rounded-full mr-3"></span>
                      10+ years of enterprise experience
                    </li>
                    <li className="flex items-center">
                      <span className="w-1.5 h-1.5 bg-primary-500 rounded-full mr-3"></span>
                      Healthcare & compliance expertise
                    </li>
                    <li className="flex items-center">
                      <span className="w-1.5 h-1.5 bg-primary-500 rounded-full mr-3"></span>
                      Cloud-native architecture focus
                    </li>
                    <li className="flex items-center">
                      <span className="w-1.5 h-1.5 bg-primary-500 rounded-full mr-3"></span>
                      Proven track record of success
                    </li>
                  </ul>
                </div>
              </div>

              {/* Contact Form */}
              <div className="bg-white rounded-xl shadow-soft p-8">
                <ContactForm />
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="container max-w-7xl py-12">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-4">BorderlessBits</h3>
              <p className="text-gray-300 mb-4">
                Expert cloud architecture and healthcare software consulting for enterprise
                organizations.
              </p>
              <p className="text-sm text-gray-400">© 2024 BorderlessBits. All rights reserved.</p>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-gray-300">
                <li>
                  <a href="#services" className="hover:text-white transition-colors">
                    Cloud Architecture
                  </a>
                </li>
                <li>
                  <a href="#services" className="hover:text-white transition-colors">
                    Healthcare Software
                  </a>
                </li>
                <li>
                  <a href="#services" className="hover:text-white transition-colors">
                    Enterprise Consulting
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-gray-300">
                <li>richard@borderlessbits.com</li>
                <li>Response within 24 hours</li>
                <li>Remote consulting available</li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
