import { CertificateData, EmployeeRecord, Assets } from '../types';

// Mutable Mock Assets "Database"
let CURRENT_ASSETS: Assets = {
  // Using a placeholder that resembles a generic logo
  logoUrl: "https://placehold.co/400x100/transparent/08bd80?text=unacademy&font=playfair", 
  // Simulated rubber stamp
  stampUrl: "https://placehold.co/150x150/transparent/darkblue?text=STAMP&font=oswald", 
  // Faint watermark
  watermarkUrl: "https://placehold.co/400x400/transparent/e0e0e0?text=UNACADEMY&font=roboto",
  // Simulated signature
  signatureUrl: "https://placehold.co/200x60/transparent/black?text=Saurabh+Suman&font=dancing-script"
};

// Mutable Mock Employee Records "Database"
const MOCK_DB: Record<string, EmployeeRecord> = {
  "131830246": {
    id: "131830246",
    name: "Mr. Raj Vardhan",
    designation: "Senior Mathematics Faculty",
    division: "JEE Division",
    educatorId: "131830246",
    centreName: "Unacademy Centre Samastipur",
    periodStart: "April 2025",
    periodEnd: "November 2025",
    issueDate: "07 / 12 / 2025",
    place: "Samastipur",
    signatoryName: "Saurabh Suman",
    signatoryDesignation: "Centre Head"
  },
  "999999999": {
    id: "999999999",
    name: "Ms. Anita Sharma",
    designation: "Physics Faculty",
    division: "NEET Division",
    educatorId: "999999999",
    centreName: "Unacademy Centre Delhi",
    periodStart: "January 2024",
    periodEnd: "December 2024",
    issueDate: "15 / 01 / 2025",
    place: "New Delhi",
    signatoryName: "Amit Kumar",
    signatoryDesignation: "Regional Manager"
  }
};

export const fetchCertificateData = async (educatorId: string): Promise<CertificateData> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));

  const record = MOCK_DB[educatorId];
  
  if (!record) {
    throw new Error(`Record not found for Educator ID: ${educatorId}`);
  }

  return {
    record,
    assets: CURRENT_ASSETS
  };
};

export const addEmployeeRecord = async (record: EmployeeRecord): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  if (MOCK_DB[record.educatorId]) {
    throw new Error(`Record with Educator ID ${record.educatorId} already exists.`);
  }
  MOCK_DB[record.educatorId] = record;
};

export const getAllRecords = async (): Promise<EmployeeRecord[]> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return Object.values(MOCK_DB);
};

export const updateAssets = async (newAssets: Partial<Assets>): Promise<Assets> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  CURRENT_ASSETS = { ...CURRENT_ASSETS, ...newAssets };
  return CURRENT_ASSETS;
};

export const getAssets = async (): Promise<Assets> => {
  return CURRENT_ASSETS;
};