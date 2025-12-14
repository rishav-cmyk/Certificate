import { createClient } from '@supabase/supabase-js';
import { CertificateData, EmployeeRecord, Assets } from '../types';

/**
 * SUPABASE SETUP INSTRUCTIONS
 * 
 * 1. Create a Supabase project at https://supabase.com
 * 2. Get your VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY from Project Settings > API
 * 3. Add these to your Vercel Environment Variables.
 * 4. Run the following SQL in the Supabase SQL Editor:
 * 
 *    -- Create Employees Table
 *    create table employees (
 *      id uuid default gen_random_uuid() primary key,
 *      educator_id text unique not null,
 *      name text not null,
 *      designation text,
 *      division text,
 *      centre_name text,
 *      period_start text,
 *      period_end text,
 *      issue_date text,
 *      place text,
 *      signatory_name text,
 *      signatory_designation text,
 *      created_at timestamp with time zone default timezone('utc'::text, now())
 *    );
 * 
 *    -- Create Assets Table (Single Row Config)
 *    create table assets (
 *      id integer primary key generated always as identity,
 *      logo_url text,
 *      stamp_url text,
 *      watermark_url text,
 *      signature_url text
 *    );
 * 
 *    -- Initialize Assets Row (ID 1)
 *    insert into assets (id, logo_url, stamp_url, watermark_url, signature_url)
 *    overriding system value
 *    values (1, '', '', '', '');
 */

// --- Configuration ---

// Safely access env vars to prevent runtime crashes if import.meta.env is undefined
const env = (import.meta as any).env || {};
const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseKey = env.VITE_SUPABASE_ANON_KEY;

const isSupabaseConnected = typeof supabaseUrl === 'string' && typeof supabaseKey === 'string' && supabaseUrl.length > 0;

let supabase: any = null;

if (isSupabaseConnected) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey);
    console.log("Supabase Client Initialized");
  } catch (e) {
    console.warn("Failed to initialize Supabase client", e);
    supabase = null;
  }
} else {
  console.log("Supabase credentials missing. Using Mock Database.");
}

// --- Default Assets (Fallback) ---
let CURRENT_ASSETS: Assets = {
  logoUrl: "https://placehold.co/400x100/transparent/08bd80?text=unacademy&font=playfair", 
  stampUrl: "https://placehold.co/150x150/transparent/darkblue?text=STAMP&font=oswald", 
  watermarkUrl: "https://placehold.co/400x400/transparent/e0e0e0?text=UNACADEMY&font=roboto",
  signatureUrl: "https://placehold.co/200x60/transparent/black?text=Saurabh+Suman&font=dancing-script"
};

// --- Mock DB (Fallback) ---
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
  }
};

// --- Mappers ---

const mapRowToRecord = (row: any): EmployeeRecord => ({
  id: row.educator_id, // We use educator_id as the app's logical ID
  educatorId: row.educator_id,
  name: row.name,
  designation: row.designation,
  division: row.division,
  centreName: row.centre_name,
  periodStart: row.period_start,
  periodEnd: row.period_end,
  issueDate: row.issue_date,
  place: row.place,
  signatoryName: row.signatory_name,
  signatoryDesignation: row.signatory_designation,
});

const mapRecordToRow = (record: EmployeeRecord) => ({
  educator_id: record.educatorId,
  name: record.name,
  designation: record.designation,
  division: record.division,
  centre_name: record.centreName,
  period_start: record.periodStart,
  period_end: record.periodEnd,
  issue_date: record.issueDate,
  place: record.place,
  signatory_name: record.signatoryName,
  signatory_designation: record.signatoryDesignation,
});

// --- Service Methods ---

export const getAssets = async (): Promise<Assets> => {
  if (isSupabaseConnected && supabase) {
    try {
      const { data, error } = await supabase.from('assets').select('*').eq('id', 1).single();
      if (!error && data) {
        return {
          logoUrl: data.logo_url || CURRENT_ASSETS.logoUrl,
          stampUrl: data.stamp_url || CURRENT_ASSETS.stampUrl,
          watermarkUrl: data.watermark_url || CURRENT_ASSETS.watermarkUrl,
          signatureUrl: data.signature_url || CURRENT_ASSETS.signatureUrl
        };
      }
    } catch (e) {
      console.error("Error fetching assets from Supabase:", e);
    }
  }
  return CURRENT_ASSETS;
};

export const updateAssets = async (newAssets: Partial<Assets>): Promise<Assets> => {
  if (isSupabaseConnected && supabase) {
    // Merge new assets with existing local state to prepare for DB update
    const current = await getAssets();
    const updated = { ...current, ...newAssets };
    
    // Map to DB columns
    const dbPayload = {
      logo_url: updated.logoUrl,
      stamp_url: updated.stampUrl,
      watermark_url: updated.watermarkUrl,
      signature_url: updated.signatureUrl
    };

    const { error } = await supabase
      .from('assets')
      .upsert({ id: 1, ...dbPayload });

    if (error) throw new Error(error.message);
    
    // Update local fallback just in case
    CURRENT_ASSETS = updated;
    return updated;
  }

  // Mock implementation
  await new Promise(resolve => setTimeout(resolve, 500));
  CURRENT_ASSETS = { ...CURRENT_ASSETS, ...newAssets };
  return CURRENT_ASSETS;
};

export const fetchCertificateData = async (educatorId: string): Promise<CertificateData> => {
  if (isSupabaseConnected && supabase) {
    const { data: recordData, error } = await supabase
      .from('employees')
      .select('*')
      .eq('educator_id', educatorId)
      .single();

    if (error || !recordData) {
      throw new Error(`Record not found for Educator ID: ${educatorId}`);
    }

    const assets = await getAssets();
    return {
      record: mapRowToRecord(recordData),
      assets
    };
  }

  // Mock implementation
  await new Promise(resolve => setTimeout(resolve, 500));
  const record = MOCK_DB[educatorId];
  if (!record) throw new Error(`Record not found for Educator ID: ${educatorId}`);
  return { record, assets: CURRENT_ASSETS };
};

export const addEmployeeRecord = async (record: EmployeeRecord): Promise<void> => {
  if (isSupabaseConnected && supabase) {
    const row = mapRecordToRow(record);
    const { error } = await supabase.from('employees').insert([row]);
    
    if (error) {
      if (error.code === '23505') throw new Error(`Educator ID ${record.educatorId} already exists.`);
      throw new Error(error.message);
    }
    return;
  }

  // Mock implementation
  await new Promise(resolve => setTimeout(resolve, 500));
  if (MOCK_DB[record.educatorId]) throw new Error(`Record with Educator ID ${record.educatorId} already exists.`);
  MOCK_DB[record.educatorId] = record;
};

export const getAllRecords = async (): Promise<EmployeeRecord[]> => {
  if (isSupabaseConnected && supabase) {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw new Error(error.message);
    return (data || []).map(mapRowToRecord);
  }

  // Mock implementation
  await new Promise(resolve => setTimeout(resolve, 500));
  return Object.values(MOCK_DB);
};