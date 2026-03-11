export async function generateHash(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function generateCertificateHash(cert: {
  student_name: string;
  degree: string;
  department: string;
  institution_name: string;
  issue_date: string;
  certificate_id: string;
}): Promise<string> {
  const data = `${cert.certificate_id}|${cert.student_name}|${cert.degree}|${cert.department}|${cert.institution_name}|${cert.issue_date}`;
  return generateHash(data);
}

export async function generateBlockHash(block: {
  block_index: number;
  previous_hash: string;
  certificate_data: any;
  timestamp: string;
}): Promise<string> {
  const data = `${block.block_index}|${block.previous_hash}|${JSON.stringify(block.certificate_data)}|${block.timestamp}`;
  return generateHash(data);
}
