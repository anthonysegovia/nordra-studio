import { Header } from "./components/layout/Header";
import { Hero } from "./sections/Hero";
import { About } from "./sections/About";
import { Packages } from "./sections/Packages";
import { Events } from "./sections/Events";
import { Footer } from "./components/layout/Footer";

export default function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main>
        <Hero />
        <About />
        <Packages />
        <Events />
      </main>
      <Footer />
    </div>
  );
}
