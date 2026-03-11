import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Shield, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';

const Navbar = () => {
  const { user, role, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const dashboardPath = role === 'admin' ? '/admin' : role === 'institution' ? '/institution' : '/holder';

  return (
    <nav className="bg-card border-b border-border sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link to="/" className="flex items-center gap-2 font-display text-xl font-bold text-primary">
          <Shield className="h-6 w-6" />
          CertChain
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-4">
          <Link to="/verify" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Verify Certificate
          </Link>
          {user ? (
            <>
              <Link to={dashboardPath} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Dashboard
              </Link>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-1" /> Sign Out
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/login">Log In</Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/signup">Sign Up</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-card px-4 py-3 space-y-2">
          <Link to="/verify" className="block text-sm py-1" onClick={() => setMobileOpen(false)}>Verify Certificate</Link>
          {user ? (
            <>
              <Link to={dashboardPath} className="block text-sm py-1" onClick={() => setMobileOpen(false)}>Dashboard</Link>
              <button className="text-sm py-1 text-destructive" onClick={handleSignOut}>Sign Out</button>
            </>
          ) : (
            <>
              <Link to="/login" className="block text-sm py-1" onClick={() => setMobileOpen(false)}>Log In</Link>
              <Link to="/signup" className="block text-sm py-1 text-primary font-medium" onClick={() => setMobileOpen(false)}>Sign Up</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
