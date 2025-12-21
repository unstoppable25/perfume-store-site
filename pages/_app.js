import '../styles/globals.css'
import { CartProvider } from '../context/CartContext'

function FloatingWhatsAppButton() {
  return (
    <a
      href="https://api.whatsapp.com/send?phone=2347035805171"
      target="_blank"
      rel="noopener noreferrer"
      className="floating-whatsapp"
      title="Chat with us on WhatsApp"
    >
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="24" cy="24" r="24" fill="#25D366"/>
        <path fill="#fff" d="M34.6 13.4A11.9 11.9 0 0024 12c-6.6 0-12 5.4-12 12 0 2.1.5 4.1 1.5 5.9L12 36l6.3-1.7c1.8.9 3.7 1.4 5.7 1.4 6.6 0 12-5.4 12-12 0-2.6-.8-5-2.4-7zm-10.6 16.4c-1.3 0-2.6-.3-3.7-.9l-.3-.2-3.7 1 .9-3.6-.2-.4c-.9-1.5-1.4-3.2-1.4-5 0-5.1 4.1-9.2 9.2-9.2 2.5 0 4.9 1 6.7 2.8a9.2 9.2 0 012.7 6.6c0 5.1-4.1 9.2-9.2 9.2zm4.7-7.4c-.3-.1-1.8-.9-2-.9-.3-.1-.5-.1-.7.2-.2.3-.7.9-.9 1.1-.2.2-.3.2-.6.1-.3-.1-1.2-.4-2.3-1.4-.8-.7-1.3-1.6-1.5-1.9-.2-.3 0-.4.1-.6.1-.1.3-.3.4-.5.1-.2.2-.3.3-.5.1-.2.1-.4 0-.5-.1-.1-.6-1.5-.8-2.1-.2-.6-.5-.5-.7-.5-.2 0-.4 0-.6 0-.2 0-.5.1-.8.4-.3.3-1 1-1 2.4 0 1.4 1 2.7 1.2 2.9.1.2 1.9 2.9 4.6 4.1.7.3 1.2.5 1.5.6.7.2 1.3.2 1.8.1.5-.1 1.6-.7 1.8-1.3.2-.6.2-1.2.1-1.3-.1-.1-.2-.2-.5-.3z"/>
      </svg>
    </a>
  )
}

export default function MyApp({ Component, pageProps }) {
  return (
    <CartProvider>
      <Component {...pageProps} />
      <FloatingWhatsAppButton />
    </CartProvider>
  )
}
