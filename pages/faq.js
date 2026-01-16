import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null)
  const [faqs, setFaqs] = useState([])

  useEffect(() => {
    // Fetch FAQs from settings
    const fetchFAQs = async () => {
      try {
        const res = await fetch('/api/settings')
        const data = await res.json()
        if (data.success && data.settings?.faqs) {
          setFaqs(data.settings.faqs)
        } else {
          // Fallback to default FAQs if none are set
          setFaqs([
            {
              question: 'How long does shipping take?',
              answer: 'Standard shipping within Nigeria typically takes 3-5 business days. Express shipping is available for 1-2 business day delivery.'
            },
            {
              question: 'Do you ship internationally?',
              answer: 'Currently, we only ship within Nigeria. We are working on expanding our shipping options to international locations.'
            },
            {
              question: 'Are your perfumes authentic?',
              answer: 'Yes, all our perfumes are 100% authentic and sourced directly from authorized distributors. We guarantee the quality and authenticity of every product.'
            }
          ])
        }
      } catch (err) {
        console.error('Failed to fetch FAQs:', err)
        // Fallback to default FAQs
        setFaqs([
          {
            question: 'How long does shipping take?',
            answer: 'Standard shipping within Nigeria typically takes 3-5 business days. Express shipping is available for 1-2 business day delivery.'
          },
          {
            question: 'Do you ship internationally?',
            answer: 'Currently, we only ship within Nigeria. We are working on expanding our shipping options to international locations.'
          },
          {
            question: 'Are your perfumes authentic?',
            answer: 'Yes, all our perfumes are 100% authentic and sourced directly from authorized distributors. We guarantee the quality and authenticity of every product.'
          }
        ])
      }
    }
    fetchFAQs()
  }, [])

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      {/* Header */}
      <nav className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-purple-600">ScentLumus</Link>
          <div className="flex gap-6">
            <Link href="/" className="text-gray-700 hover:text-purple-600">Home</Link>
            <Link href="/cart" className="text-gray-700 hover:text-purple-600">Cart</Link>
            <Link href="/contact" className="text-gray-700 hover:text-purple-600">Contact</Link>
          </div>
        </div>
      </nav>

      {/* FAQ Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">Frequently Asked Questions</h1>
            <p className="text-gray-600 text-lg">
              Find answers to common questions about our products, shipping, and services.
            </p>
          </div>

          {/* FAQ List */}
          <div className="space-y-4">
            {faqs.length === 0 ? (
              <div className="bg-white rounded-lg shadow-lg p-8 text-center">
                <p className="text-gray-500">No FAQs available yet. Check back soon!</p>
              </div>
            ) : (
              faqs.map((faq, index) => {
                const isOpen = openIndex === index

                return (
                  <div key={index} className="bg-white rounded-lg shadow-lg">
                    <button
                      onClick={() => toggleFAQ(index)}
                      className="w-full flex justify-between items-center p-6 text-left hover:bg-gray-50 transition-colors"
                    >
                      <span className="font-semibold text-gray-800 pr-4">{faq.question}</span>
                      <svg
                        className={`w-5 h-5 text-purple-600 flex-shrink-0 transform transition-transform ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {isOpen && (
                      <div className="px-6 pb-6 text-gray-600">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>

          {/* Return Policy Highlight */}
          <div className="mt-12 bg-amber-50 rounded-lg p-8 text-center border border-amber-200">
            <h3 className="text-2xl font-bold text-amber-900 mb-4">Return Policy</h3>
            <ul className="list-disc pl-6 text-gray-700 text-left max-w-xl mx-auto space-y-2">
              <li>You may return unused and undamaged products within <b>10 days</b> of delivery for a full refund or exchange.</li>
              <li>Returned items must be in their original packaging and condition.</li>
              <li>If your item arrives damaged or defective, contact us within 48 hours for a replacement or refund.</li>
              <li>Return processing takes <b>1–2 weeks</b> after we receive your item.</li>
              <li>Shipping fees are non-refundable unless the return is due to our error or a defective product.</li>
              <li>To start a return, email <a href="mailto:support@scentlumus.com" className="text-amber-700 underline">support@scentlumus.com</a> with your order number and reason for return.</li>
            </ul>
          </div>

          {/* Still Have Questions */}
          <div className="mt-8 bg-purple-100 rounded-lg p-8 text-center">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Still have questions?</h3>
            <p className="text-gray-600 mb-6">
              Can't find the answer you're looking for? Please reach out to our customer support team.
            </p>
            <Link
              href="/contact"
              className="inline-block bg-purple-600 hover:bg-purple-700 text-white py-3 px-8 rounded-lg font-semibold transition duration-300"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
