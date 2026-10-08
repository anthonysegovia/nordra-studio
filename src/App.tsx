import { Header } from "./components/layout/Header";
import { Hero } from "./sections/Hero";
import { Seasonal } from "./sections/Seasonal";
import { About } from "./sections/About";
import { Packages } from "./sections/Packages";
import { Events } from "./sections/Events";
import { Footer } from "./components/layout/Footer";
import { ScrollAurora } from "./components/layout/ScrollAurora";
import { Payment } from "./sections/Payment";

export default function App() {
  const paymentToken = new URLSearchParams(window.location.search).get("pago");
  if (paymentToken !== null) return <Payment token={paymentToken} />;
  return (
    <div className="min-h-screen text-foreground aurora-page">
      <ScrollAurora />
      <Header />
      <main>
        <Hero />
        <Seasonal />
        <About />
        <Packages />
        <Events />
      </main>
      <Footer />
    </div>
  );
}
