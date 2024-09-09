import './globals.css'
import { Poppins } from 'next/font/google';
import { ThemeProvider } from "@/components/theme-provider"

const poppins = Poppins({
  weight: '400',
  subsets: ['latin'],
});

export const metadata = {
  title: 'Annie',
  description: 'A riven frontend',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body className={poppins.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}