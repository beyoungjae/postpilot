import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const geistSans = Geist({
   variable: '--font-geist-sans',
   subsets: ['latin'],
})

const geistMono = Geist_Mono({
   variable: '--font-geist-mono',
   subsets: ['latin'],
})

export const metadata: Metadata = {
   title: 'PostPilot - AI 콘텐츠 생성 도구',
   description: 'AI를 활용한 SNS 콘텐츠 생성 도구, 키워드 기반 문장 생성, 이미지 분석 및 글쓰기 보조',
   icons: {
      icon: '/favicon.ico',
   },
}

export default function RootLayout({
   children,
}: Readonly<{
   children: React.ReactNode
}>) {
   return (
      <html lang="ko" className="scroll-smooth">
         <body id="root" className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}>
            {children}
         </body>
      </html>
   )
}
