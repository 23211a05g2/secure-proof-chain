import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Shield, Upload, Search, CheckCircle, ArrowRight } from 'lucide-react';

const steps = [
  { icon: Upload, title: 'Issue', desc: 'Institutions issue tamper-proof certificates with unique hashes.' },
  { icon: Shield, title: 'Store', desc: 'Certificates are stored on a simulated blockchain ledger.' },
  { icon: Search, title: 'Verify', desc: 'Anyone can instantly verify authenticity with a certificate ID.' },
];

const Index = () => (
  <div className="min-h-screen flex flex-col">
    <Navbar />

    {/* Hero */}
    <section className="py-20 md:py-28 bg-gradient-to-br from-primary/10 via-background to-background">
      <div className="container mx-auto px-4 text-center max-w-3xl animate-fade-in">
        <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground leading-tight mb-6">
          Tamper-Proof Certificate Verification
        </h1>
        <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
          Issue, store, and verify academic certificates with blockchain-level security. Trusted by institutions worldwide.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" asChild>
            <Link to="/verify">Verify a Certificate <Search className="ml-2 h-4 w-4" /></Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link to="/signup">Get Started <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
      </div>
    </section>

    {/* How it works */}
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="font-display text-2xl md:text-3xl font-bold text-center mb-12">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {steps.map((s, i) => (
            <Card key={i} className="text-center border border-border animate-fade-in" style={{ animationDelay: `${i * 150}ms` }}>
              <CardContent className="pt-8 pb-6 px-6">
                <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <s.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>

    {/* Trust badges */}
    <section className="py-16 bg-muted/50">
      <div className="container mx-auto px-4 text-center">
        <div className="flex flex-wrap items-center justify-center gap-8">
          {['SHA-256 Hashing', 'Immutable Ledger', 'Instant Verification', 'Role-Based Access'].map((badge) => (
            <div key={badge} className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <CheckCircle className="h-4 w-4 text-success" />
              {badge}
            </div>
          ))}
        </div>
      </div>
    </section>

    <Footer />
  </div>
);

export default Index;
