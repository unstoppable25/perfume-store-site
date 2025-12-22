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
        <circle cx="24" cy="24" r="24" fill="#92400e"/>
        <path d="M33.8 14.2A9.9 9.9 0 0024 14c-5.5 0-10 4.5-10 10 0 1.7.4 3.3 1.2 4.7l-1.3 4.7 4.8-1.3c1.3.7 2.8 1.1 4.3 1.1 5.5 0 10-4.5 10-10 0-2.2-.7-4.2-2-5.9zm-9.8 13.7c-1.1 0-2.2-.3-3.1-.8l-.2-.1-3.1.8.8-3.1-.2-.3c-.7-1.3-1.1-2.7-1.1-4.2 0-4.3 3.5-7.8 7.8-7.8 2.1 0 4.1.8 5.6 2.3a7.8 7.8 0 012.2 5.6c0 4.3-3.5 7.8-7.8 7.8zm4-6.3c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.2-.2.2-.6.7-.8.9-.2.2-.3.2-.5.1-.2-.1-1-.3-1.9-1.2-.7-.6-1.1-1.3-1.3-1.6-.2-.2 0-.3.1-.5.1-.1.2-.2.3-.4.1-.2.2-.2.2-.4.1-.2.1-.3 0-.4-.1-.1-.5-1.2-.7-1.7-.2-.5-.4-.4-.6-.4-.2 0-.3 0-.5 0-.2 0-.4.1-.7.3-.2.2-.8.8-.8 2 0 1.2.8 2.2 1 2.4.1.2 1.6 2.4 3.8 3.4.6.2 1 .4 1.3.5.6.2 1.1.2 1.5.1.4-.1 1.3-.6 1.5-1.1.2-.5.2-1 .1-1.1-.1-.1-.2-.2-.4-.3z" fill="#fff"/>
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
