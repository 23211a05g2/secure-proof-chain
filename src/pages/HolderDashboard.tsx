import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import { Share2, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const HolderDashboard = () => {
  const { user, role, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [certificates, setCertificates] = useState<any[]>([]);

  useEffect(() => {
    if (!authLoading && (!user || role !== 'holder')) {
      navigate('/login');
    }
  }, [user, role, authLoading]);

  useEffect(() => {
    if (user) {
      supabase
        .from('certificates')
        .select('*')
        .eq('student_email', user.email)
        .order('created_at', { ascending: false })
        .then(({ data }) => setCertificates(data || []));
    }
  }, [user]);

  const shareLink = (certId: string) => {
    const url = `${window.location.origin}/verify/${certId}`;
    navigator.clipboard.writeText(url);
    toast({ title: 'Link copied!', description: url });
  };

  if (authLoading) return null;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="font-display text-3xl font-bold mb-8">My Certificates</h1>

        {certificates.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No certificates linked to your account yet. Certificates will appear here when issued to your email address.
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {certificates.map(cert => (
              <Card key={cert.id} className="animate-fade-in">
                <CardHeader className="flex flex-row items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{cert.degree}</CardTitle>
                    <p className="text-sm text-muted-foreground">{cert.department}</p>
                  </div>
                  <Badge variant={cert.status === 'active' ? 'default' : 'destructive'}>{cert.status}</Badge>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p><span className="font-medium">Institution:</span> {cert.institution_name}</p>
                  <p><span className="font-medium">Issue Date:</span> {cert.issue_date}</p>
                  <p><span className="font-medium">Certificate ID:</span> <code className="text-xs bg-muted px-1 py-0.5 rounded">{cert.certificate_id}</code></p>
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" variant="outline" onClick={() => shareLink(cert.certificate_id)}>
                      <Share2 className="h-3 w-3 mr-1" /> Share
                    </Button>
                    <Button size="sm" variant="outline" asChild>
                      <a href={`/verify/${cert.certificate_id}`} target="_blank" rel="noopener">
                        <ExternalLink className="h-3 w-3 mr-1" /> Verify
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HolderDashboard;
