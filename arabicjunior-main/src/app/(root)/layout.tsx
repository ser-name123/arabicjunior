import Newsletter from "@/globals/Newsletter";
import "../globals.css";
import { Footer, Header } from "@/globals";
import WhatsAppFloatingButton from "@/components/WhatsAppFloatingButton";

export default function HomeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div aria-label="home-layout">
      <Header />
      <div>{children}</div>
      <Newsletter />
      <Footer />
      <WhatsAppFloatingButton />
    </div>
  );
}
