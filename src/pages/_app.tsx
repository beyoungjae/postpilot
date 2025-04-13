import '../app/globals.css'
import type { AppProps } from 'next/app'
import Modal from 'react-modal'

if (typeof window !== 'undefined') {
   Modal.setAppElement('#__next')
}

export default function App({ Component, pageProps }: AppProps) {
   return <Component {...pageProps} />
}
