import { Shield } from 'lucide-react';

const Footer = () => (
  <footer className="bg-card border-t border-border py-8 mt-auto">
    <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-2 font-display text-lg font-bold text-primary">
        <Shield className="h-5 w-5" />
        CertChain
      </div>
      <p className="text-sm text-muted-foreground">
        © {new Date().getFullYear()} CertChain. Tamper-proof certificate verification.
      </p>
    </div>
  </footer>
);

export default Footer;
