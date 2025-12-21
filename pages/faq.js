import { useState } from 'react'
import Link from 'next/link'

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null)

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  const faqs = [
    {
      category: 'Orders & Shipping',
      questions: [
        {
          q: 'How long does shipping take?',
          a: 'Standard shipping within Nigeria typically takes 3-5 business days. Express shipping is available for 1-2 business day delivery.'
        },
        {
          q: 'Do you ship internationally?',
          a: 'Currently, we only ship within Nigeria. We are working on expanding our shipping options to international locations.'
        },
        {
          q: 'How can I track my order?',
          a: 'Once your order ships, you will receive an email with tracking information. You can also check your order status by contacting our customer service.'
        },
        {
          q: 'What are the shipping costs?',
          a: 'Shipping costs vary based on your location and order size. Standard shipping starts at ₦2,000. Orders over ₦50,000 qualify for free shipping.'
        }
      ]
    },
    {
      category: 'Products & Quality',
      questions: [
        {
          q: 'Are your perfumes authentic?',
          a: 'Yes, all our perfumes are 100% authentic and sourced directly from authorized distributors. We guarantee the quality and authenticity of every product.'
        },
        {
          q: 'How should I store my perfume?',
          a: 'Store perfumes in a cool, dry place away from direct sunlight and heat. Keep the bottle tightly closed when not in use to preserve the fragrance.'
        },
        {
          q: 'How long do perfumes last?',
          a: 'When stored properly, unopened perfumes can last 3-5 years. Once opened, they typically maintain their quality for 1-3 years.'
        },
        {
          q: 'Do you offer testers or samples?',
          a: 'We occasionally offer sample sizes for select fragrances. Check our website or contact us to see current sample availability.'
        }
      ]
    },
    {
      category: 'Returns & Refunds',
      questions: [
        {
          q: 'What is your return policy?',
          a: 'You may return unused and undamaged products within 10 days of delivery for a full refund or exchange. Items must be in their original packaging and condition.'
        },
        {
          q: 'Can I return an opened perfume?',
          a: 'Due to hygiene reasons, we cannot accept returns of opened or used perfumes unless the product is defective or damaged upon arrival.'
        },
        {
          q: 'How long do refunds take?',
          a: 'Return processing takes 1–2 weeks after we receive your item. Refunds are issued to your original payment method.'
        },
        {
          q: 'What if my product arrives damaged?',
          a: 'If your product arrives damaged or defective, contact us within 48 hours for a replacement or refund. Please provide photos for faster processing.'
        }
      ]
    },
    {
      category: 'Payment & Security',
      questions: [
        {
          q: 'What payment methods do you accept?',
          a: 'We accept credit/debit cards (via Stripe), bank transfers, and cash on delivery for select locations. All card payments are processed securely.'
        },
        {
          q: 'Is my payment information secure?',
          a: 'Yes, we use industry-standard SSL encryption and secure payment gateways. We never store your complete card information on our servers.'
        },
        {
          q: 'Can I cancel my order?',
          a: 'You can cancel your order within 2 hours of placement if it has not been processed yet. Contact us immediately to request cancellation.'
        },
        {
          q: 'Do you offer cash on delivery?',
          a: 'Yes, cash on delivery is available for orders within Lagos and select major cities. A small fee may apply for this service.'
        }
      ]
    },
    {
      category: 'Account & Newsletter',
      questions: [
        {
          q: 'Do I need an account to place an order?',
          a: 'No, you can checkout as a guest. However, creating an account allows you to track orders and save your information for faster checkout.'
        },
        {
          q: 'How do I subscribe to your newsletter?',
          a: 'Simply enter your email in the newsletter subscription box at the bottom of our homepage. You will receive exclusive offers and new product updates.'
        },
        {
          q: 'How can I unsubscribe from emails?',
          a: 'You can unsubscribe anytime by clicking the unsubscribe link at the bottom of any promotional email we send you.'
        },
        {
          q: 'How do I contact customer service?',
          a: 'You can reach us via our contact form, email at info@scentlumus.com, or call us during business hours. We typically respond within 24 hours.'
        }
      ]
    }
  ]

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

          {/* FAQ Categories */}
          <div className="space-y-8">
            {faqs.map((category, catIndex) => (
              <div key={catIndex} className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold text-purple-600 mb-4">{category.category}</h2>
                <div className="space-y-2">
                  {category.questions.map((faq, qIndex) => {
                    const index = `${catIndex}-${qIndex}`
                    const isOpen = openIndex === index

                    return (
                      <div key={qIndex} className="border-b border-gray-200 last:border-b-0">
                        <button
                          onClick={() => toggleFAQ(index)}
                          className="w-full flex justify-between items-center py-4 text-left hover:text-purple-600 transition-colors"
                        >
                          <span className="font-semibold text-gray-800 pr-4">{faq.q}</span>
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
                          <div className="pb-4 text-gray-600">
                            {faq.a}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
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
