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
        <path d="M34.6 28.2c-.4-.2-2.3-1.1-2.6-1.2-.3-.1-.5-.2-.7.2-.2.3-.8 1.1-1 1.3-.2.2-.4.2-.7.1-.3-.2-1.4-.5-2.7-1.6-1-0.9-1.7-2-1.9-2.3-.2-.3 0-.5.1-.7.1-.1.3-.4.4-.5.1-.2.2-.3.3-.5.1-.2.1-.4 0-.6-.1-.2-.7-1.8-1-2.5-.3-.7-.5-.6-.7-.6-.2 0-.4 0-.6 0-.2 0-.5.1-.8.4-.3.3-1.2 1.1-1.2 2.7 0 1.6 1.2 3.1 1.4 3.3.1.2 2.4 3.5 5.8 4.9.8.3 1.4.5 1.9.7.8.2 1.6.2 2.1.1.6-.1 2-.8 2.2-1.6.2-.8.2-1.4.1-1.6-.1-.2-.3-.2-.6-.4z" fill="#fff"/>
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
