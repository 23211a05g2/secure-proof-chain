import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { generateCertificateHash, generateBlockHash } from '@/lib/blockchain';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import { PlusCircle, Ban } from 'lucide-react';

const InstitutionDashboard = () => {
  const { user, role, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [certificates, setCertificates] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Form state
  const [form, setForm] = useState({
    student_name: '', student_email: '', degree: '', department: '', issue_date: '', institution_name: '',
  });

  useEffect(() => {
    if (!authLoading && (!user || role !== 'institution')) {
      navigate('/login');
    }
  }, [user, role, authLoading]);

  useEffect(() => {
    if (user) fetchCertificates();
  }, [user]);

  const fetchCertificates = async () => {
    const { data } = await supabase
      .from('certificates')
      .select('*')
      .eq('issued_by', user!.id)
      .order('created_at', { ascending: false });
    setCertificates(data || []);
  };

  const generateCertId = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let id = 'CERT-';
    for (let i = 0; i < 6; i++) id += chars[Math.floor(Math.random() * chars.length)];
    return id;
  };

  const handleIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const certificate_id = generateCertId();
    const hash = await generateCertificateHash({ ...form, certificate_id });

    const { error } = await supabase.from('certificates').insert({
      certificate_id,
      ...form,
      hash,
      issued_by: user!.id,
      status: 'active',
    });

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      setLoading(false);
      return;
    }

    // Add to blockchain ledger
    const { data: lastBlock } = await supabase
      .from('blockchain_ledger')
      .select('block_index, block_hash')
      .order('block_index', { ascending: false })
      .limit(1)
      .maybeSingle();

    const newIndex = (lastBlock?.block_index ?? -1) + 1;
    const previousHash = lastBlock?.block_hash ?? '0'.repeat(64);
    const timestamp = new Date().toISOString();

    const blockHash = await generateBlockHash({
      block_index: newIndex,
      previous_hash: previousHash,
      certificate_data: { certificate_id, ...form, hash },
      timestamp,
    });

    await supabase.from('blockchain_ledger').insert({
      block_index: newIndex,
      previous_hash: previousHash,
      block_hash: blockHash,
      certificate_id,
      certificate_data: { certificate_id, ...form, hash } as any,
    });

    toast({ title: 'Certificate issued!', description: `ID: ${certificate_id}` });
    setForm({ student_name: '', student_email: '', degree: '', department: '', issue_date: '', institution_name: '' });
    fetchCertificates();
    setLoading(false);
  };

  const handleRevoke = async (certId: string) => {
    await supabase.from('certificates').update({ status: 'revoked' }).eq('certificate_id', certId);
    toast({ title: 'Certificate revoked' });
    fetchCertificates();
  };

  if (authLoading) return null;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8 space-y-8">
        <h1 className="font-display text-3xl font-bold">Institution Dashboard</h1>

        {/* Issue form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><PlusCircle className="h-5 w-5" /> Issue Certificate</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleIssue} className="grid md:grid-cols-2 gap-4">
              <div><Label>Student Name</Label><Input value={form.student_name} onChange={e => setForm({ ...form, student_name: e.target.value })} required /></div>
              <div><Label>Student Email</Label><Input type="email" value={form.student_email} onChange={e => setForm({ ...form, student_email: e.target.value })} required /></div>
              <div><Label>Degree</Label><Input value={form.degree} onChange={e => setForm({ ...form, degree: e.target.value })} required /></div>
              <div><Label>Department</Label><Input value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} required /></div>
              <div><Label>Institution Name</Label><Input value={form.institution_name} onChange={e => setForm({ ...form, institution_name: e.target.value })} required /></div>
              <div><Label>Issue Date</Label><Input type="date" value={form.issue_date} onChange={e => setForm({ ...form, issue_date: e.target.value })} required /></div>
              <div className="md:col-span-2">
                <Button type="submit" disabled={loading}>{loading ? 'Issuing…' : 'Issue Certificate'}</Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Certificates table */}
        <Card>
          <CardHeader><CardTitle>Issued Certificates ({certificates.length})</CardTitle></CardHeader>
          <CardContent>
            {certificates.length === 0 ? (
              <p className="text-muted-foreground text-sm">No certificates issued yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Student</TableHead>
                      <TableHead>Degree</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {certificates.map(cert => (
                      <TableRow key={cert.id}>
                        <TableCell className="font-mono text-xs">{cert.certificate_id}</TableCell>
                        <TableCell>{cert.student_name}</TableCell>
                        <TableCell>{cert.degree}</TableCell>
                        <TableCell>{cert.issue_date}</TableCell>
                        <TableCell>
                          <Badge variant={cert.status === 'active' ? 'default' : 'destructive'}>
                            {cert.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {cert.status === 'active' && (
                            <Button variant="ghost" size="sm" onClick={() => handleRevoke(cert.certificate_id)}>
                              <Ban className="h-4 w-4 mr-1" /> Revoke
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InstitutionDashboard;
