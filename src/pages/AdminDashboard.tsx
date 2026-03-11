import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Navbar from '@/components/Navbar';
import { ShieldCheck, FileText, Activity } from 'lucide-react';

const AdminDashboard = () => {
  const { user, role, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ certs: 0, verifications: 0, active: 0 });
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    if (!authLoading && (!user || role !== 'admin')) {
      navigate('/login');
    }
  }, [user, role, authLoading]);

  useEffect(() => {
    if (user && role === 'admin') {
      // Fetch stats
      supabase.from('certificates').select('id', { count: 'exact', head: true }).then(({ count }) =>
        setStats(s => ({ ...s, certs: count || 0 })));
      supabase.from('certificates').select('id', { count: 'exact', head: true }).eq('status', 'active').then(({ count }) =>
        setStats(s => ({ ...s, active: count || 0 })));
      supabase.from('verification_logs').select('id', { count: 'exact', head: true }).then(({ count }) =>
        setStats(s => ({ ...s, verifications: count || 0 })));

      // Recent logs
      supabase.from('verification_logs').select('*').order('created_at', { ascending: false }).limit(20)
        .then(({ data }) => setLogs(data || []));
    }
  }, [user, role, authLoading]);

  if (authLoading) return null;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8 space-y-8">
        <h1 className="font-display text-3xl font-bold">Admin Dashboard</h1>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: FileText, label: 'Total Certificates', value: stats.certs },
            { icon: ShieldCheck, label: 'Active Certificates', value: stats.active },
            { icon: Activity, label: 'Total Verifications', value: stats.verifications },
          ].map(({ icon: Icon, label, value }) => (
            <Card key={label}>
              <CardContent className="flex items-center gap-4 py-6">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{label}</p>
                  <p className="text-2xl font-bold">{value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent verification logs */}
        <Card>
          <CardHeader><CardTitle>Recent Verification Activity</CardTitle></CardHeader>
          <CardContent>
            {logs.length === 0 ? (
              <p className="text-sm text-muted-foreground">No verifications yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Certificate ID</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Result</TableHead>
                      <TableHead>Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map(log => (
                      <TableRow key={log.id}>
                        <TableCell className="font-mono text-xs">{log.certificate_id}</TableCell>
                        <TableCell>{log.verification_method}</TableCell>
                        <TableCell>{log.result}</TableCell>
                        <TableCell className="text-xs">{new Date(log.created_at).toLocaleString()}</TableCell>
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

export default AdminDashboard;
