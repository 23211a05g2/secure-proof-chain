import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { generateCertificateHash } from '@/lib/blockchain';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Search, QrCode, FileUp, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

type VerifyResult = { status: 'valid' | 'invalid' | 'revoked'; certificate?: any } | null;

const Verify = () => {
  const { certificateId: paramId } = useParams();
  const [certId, setCertId] = useState(paramId || '');
  const [result, setResult] = useState<VerifyResult>(null);
  const [loading, setLoading] = useState(false);

  const verifyCertificate = async (id: string) => {
    if (!id.trim()) return;
    setLoading(true);
    setResult(null);

    const { data: cert } = await supabase
      .from('certificates')
      .select('*')
      .eq('certificate_id', id.trim())
      .maybeSingle();

    if (!cert) {
      setResult({ status: 'invalid' });
      // log
      await supabase.from('verification_logs').insert({
        certificate_id: id.trim(),
        verification_method: 'id_lookup',
        result: 'invalid',
      });
      setLoading(false);
      return;
    }

    if (cert.status === 'revoked') {
      setResult({ status: 'revoked', certificate: cert });
      await supabase.from('verification_logs').insert({
        certificate_id: id.trim(),
        verification_method: 'id_lookup',
        result: 'revoked',
      });
      setLoading(false);
      return;
    }

    // Verify hash integrity
    const computedHash = await generateCertificateHash({
      student_name: cert.student_name,
      degree: cert.degree,
      department: cert.department,
      institution_name: cert.institution_name,
      issue_date: cert.issue_date,
      certificate_id: cert.certificate_id,
    });

    const isValid = computedHash === cert.hash;
    setResult({ status: isValid ? 'valid' : 'invalid', certificate: cert });

    await supabase.from('verification_logs').insert({
      certificate_id: id.trim(),
      verification_method: 'id_lookup',
      result: isValid ? 'valid' : 'invalid',
    });

    setLoading(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Extract cert ID from filename pattern: CERT-XXXX
    const match = file.name.match(/CERT-[A-Z0-9]+/i);
    if (match) {
      setCertId(match[0]);
      verifyCertificate(match[0]);
    }
  };

  const statusConfig = {
    valid: { icon: CheckCircle, color: 'text-success', bg: 'bg-success/10', label: 'Certificate Verified ✅' },
    invalid: { icon: XCircle, color: 'text-destructive', bg: 'bg-destructive/10', label: 'Certificate Not Found ❌' },
    revoked: { icon: AlertTriangle, color: 'text-warning', bg: 'bg-warning/10', label: 'Certificate Revoked ⚠️' },
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 container mx-auto px-4 py-12 max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-bold mb-2">Verify Certificate</h1>
          <p className="text-muted-foreground">Enter a certificate ID to check its authenticity</p>
        </div>

        <Tabs defaultValue="id" className="mb-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="id"><Search className="h-4 w-4 mr-1" /> ID Lookup</TabsTrigger>
            <TabsTrigger value="qr"><QrCode className="h-4 w-4 mr-1" /> QR Code</TabsTrigger>
            <TabsTrigger value="file"><FileUp className="h-4 w-4 mr-1" /> File Upload</TabsTrigger>
          </TabsList>

          <TabsContent value="id">
            <Card>
              <CardContent className="pt-6">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Label htmlFor="certId" className="sr-only">Certificate ID</Label>
                    <Input
                      id="certId"
                      placeholder="e.g. CERT-A1B2C3"
                      value={certId}
                      onChange={e => setCertId(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && verifyCertificate(certId)}
                    />
                  </div>
                  <Button onClick={() => verifyCertificate(certId)} disabled={loading}>
                    {loading ? 'Verifying…' : 'Verify'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="qr">
            <Card>
              <CardContent className="pt-6 text-center">
                <QrCode className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-sm text-muted-foreground">QR code scanning coming soon. Use the ID lookup for now.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="file">
            <Card>
              <CardContent className="pt-6">
                <Label htmlFor="file">Upload Certificate PDF</Label>
                <Input id="file" type="file" accept=".pdf" onChange={handleFileUpload} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-2">File name should contain the certificate ID (e.g. CERT-A1B2C3.pdf)</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Result */}
        {result && (
          <Card className={`${statusConfig[result.status].bg} border-0 animate-fade-in`}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-4">
                {(() => {
                  const Icon = statusConfig[result.status].icon;
                  return <Icon className={`h-8 w-8 ${statusConfig[result.status].color}`} />;
                })()}
                <h3 className={`text-xl font-bold ${statusConfig[result.status].color}`}>
                  {statusConfig[result.status].label}
                </h3>
              </div>
              {result.certificate && (
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="font-medium">Student:</span> {result.certificate.student_name}</div>
                  <div><span className="font-medium">Degree:</span> {result.certificate.degree}</div>
                  <div><span className="font-medium">Department:</span> {result.certificate.department}</div>
                  <div><span className="font-medium">Institution:</span> {result.certificate.institution_name}</div>
                  <div><span className="font-medium">Issue Date:</span> {result.certificate.issue_date}</div>
                  <div><span className="font-medium">Certificate ID:</span> {result.certificate.certificate_id}</div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Verify;
