export interface EmployeeRecord {
  id: string;
  name: string;
  designation: string; // e.g., Senior Mathematics Faculty
  division: string; // e.g., JEE Division
  educatorId: string;
  centreName: string;
  periodStart: string;
  periodEnd: string;
  issueDate: string;
  place: string;
  signatoryName: string;
  signatoryDesignation: string;
}

export interface Assets {
  logoUrl: string;
  stampUrl: string;
  watermarkUrl: string;
  signatureUrl: string; // Digital signature
}

export interface CertificateData {
  record: EmployeeRecord;
  assets: Assets;
}