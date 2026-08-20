import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import Script from "next/script";
import AnimateObserver from "@/components/AnimateObserver";
import { buildPageMetadata } from "@/lib/seo";

const interSans = Inter({
  variable: "--inter-sans",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

const FALLBACK_METADATA: Metadata = {
  title: "Best Arabic Tuition Online | Affordable Arabic Language Classes for UAE Students & Dubai Schools",
  description: "Join expert-led Arabic tuition online in Dubai & UAE. Affordable one-to-one Arabic language classes for UAE students, schools & UAE curriculum. Book your class now.",
  alternates: {
    canonical: "https://arabicjuniors.com/",
  },
  keywords: [
    "Online Arabic Tuition UAE",
    "Arabic Language Classes for UAE Students",
    "Learn Arabic Online UAE",
    "Best Online Arabic Tutors in UAE",
    "UAE Arabic Tuition for Kids",
    "Arabic Tuition for Schools in UAE",
    "private Arabic tutor for online Arabic lesson in Dubai",
    "Online Arabic tuition classes",
    "Online Arabic Tuition",
    "Affordable Arabic Tuition Online UAE",
    "Private Arabic Tutor for UAE Students",
    "One-to-One Arabic Tuition UAE",
    "Arabic Conversation Practice Online UAE",
    "Certified Arabic Teacher Online UAE",
    "Affordable Arabic Classes UAE",
    "Arabic Grammar Online Classes UAE",
    "Arabic for Beginners UAE Online",
    "Best Online Arabic Teacher UAE",
    "Online Arabic Classes Dubai Abu Dhabi Sharjah",
    "Online Arabic Tutor for Indian Expats in UAE",
    "Native Arabic Teacher UAE Online",
    "Arabic Tuition with UAE Curriculum",
    "Learn Quranic Arabic Online UAE",
    "Online Arabic Courses UAE Schools",
    "How to Learn Arabic Fast Online UAE",
    "Free Arabic Tuition Trial UAE"
  ],
  openGraph: {
    title: "Best Arabic Tuition Online in UAE",
    description: "Affordable Arabic tuition for students in Dubai & across UAE. Online classes available.",
    url: "https://arabicjuniors.com/",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Best Arabic Tuition in UAE",
    description: "Affordable Arabic classes for UAE students – online tuition.",
  },
  verification: {
    google: "8B1ENIoNg-SIK74XpmjYq9g7foX18mpy4D5t6hUf8j8",
  },
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* Browser extensions inject attributes onto <body> before React hydrates,
          which React reports as a mismatch. This suppresses that for the element's
          own attributes only — mismatches inside the tree are still reported. */}
      <body className={`${interSans.variable} antialiased`} suppressHydrationWarning>
        {/* Marks the document as "JavaScript is running", which is what unlocks
            the scroll-reveal styles. Every hidden state in globals.css is
            nested under `html.js-anim`, so if this never executes — JS off, a
            blocked bundle, a hydration crash — the page renders fully visible
            instead of blank. It sits inline at the top of <body> so it runs
            before the content below is painted; no flash of hidden content. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `document.documentElement.classList.add('js-anim')`,
          }}
        />

        {/* --- Facebook Pixel --- */}
        <Script id="facebook-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '959599492909385'); 
            fbq('track', 'PageView');
          `}
        </Script>

        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src="https://www.facebook.com/tr?id=959599492909385&ev=PageView&noscript=1"
          />
        </noscript>

        {/* --- Google Analytics & Google Ads --- */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-2BPJVY1DPG"
          strategy="afterInteractive"
        />
        <Script id="gtag-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            // Google Analytics
            gtag('config', 'G-2BPJVY1DPG');

            // Google Ads Conversion Tracking
            gtag('config', 'AW-17294489351');
          `}
        </Script>

        {/* --- Google Tag Manager --- */}
        <Script id="gtm" strategy="afterInteractive">
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-56C5SWK5');
          `}
        </Script>
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-56C5SWK5"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          ></iframe>
        </noscript>

        {/* --- Microsoft Clarity --- */}
        <Script id="microsoft-clarity" strategy="afterInteractive">
          {`
            (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "td2qsu34nk");
          `}
        </Script>
        {/* <ClientWrapper /> */}
        <AnimateObserver />
        <main>{children}</main>
        <Toaster duration={10000} />
      </body>
    </html>
  );
}

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("home", FALLBACK_METADATA);
}
