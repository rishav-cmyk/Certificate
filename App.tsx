import React, { useState, useEffect } from 'react';
import { fetchCertificateData, addEmployeeRecord, updateAssets, getAssets, getAllRecords } from './services/mockDatabase';
import { CertificateData, EmployeeRecord, Assets } from './types';
import CertificateTemplate from './components/CertificateTemplate';
import { Printer, Loader2, Search, AlertCircle, FileCheck, Plus, Settings, Layout, Upload, Save, ChevronRight, X } from 'lucide-react';

type Tab = 'generate' | 'add' | 'config';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('generate');
  
  // Generator State
  const [inputId, setInputId] = useState('131830246');
  const [data, setData] = useState<CertificateData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedRecords, setSavedRecords] = useState<EmployeeRecord[]>([]);

  // Add Record State
  // Default values provided for fields hidden from the UI
  const DEFAULT_RECORD_VALUES = {
    designation: 'Senior Faculty',
    division: 'Academics',
    centreName: 'Unacademy Centre',
    periodStart: 'January 2024',
    periodEnd: 'December 2024',
    issueDate: new Date().toLocaleDateString('en-GB'),
    place: 'New Delhi',
    signatoryName: 'Centre Head',
    signatoryDesignation: 'Authorized Signatory'
  };

  const [newRecord, setNewRecord] = useState<Partial<EmployeeRecord>>({
    educatorId: '',
    name: '',
    ...DEFAULT_RECORD_VALUES
  });
  const [addStatus, setAddStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [addMessage, setAddMessage] = useState('');

  // Config State
  const [assets, setAssets] = useState<Assets | null>(null);
  const [configStatus, setConfigStatus] = useState<'idle' | 'saving' | 'success'>('idle');

  // Load initial data based on tab
  useEffect(() => {
    if (activeTab === 'config') {
      getAssets().then(setAssets);
    } else if (activeTab === 'generate') {
      getAllRecords().then(setSavedRecords);
    }
  }, [activeTab]);

  // --- Handlers: Generator ---
  const handleFetch = async (e?: React.FormEvent, idOverride?: string) => {
    if (e) e.preventDefault();
    const idToFetch = idOverride || inputId;
    
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const result = await fetchCertificateData(idToFetch);
      setData(result);
      if (idOverride) setInputId(idOverride);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch record');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const clearPreview = () => {
      setData(null);
      setError(null);
      getAllRecords().then(setSavedRecords); // Refresh list
  };

  // --- Handlers: Add Record ---
  const handleRecordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewRecord(prev => ({ ...prev, [name]: value }));
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddStatus('submitting');
    
    // Basic validation
    if (!newRecord.educatorId || !newRecord.name) {
        setAddStatus('error');
        setAddMessage('Educator ID and Name are required.');
        return;
    }

    // Ensure ID is set
    const recordToSave = {
        ...newRecord,
        id: newRecord.educatorId // Map educatorId to id
    } as EmployeeRecord;

    try {
      await addEmployeeRecord(recordToSave);
      setAddStatus('success');
      setAddMessage(`Record for ${newRecord.name} added successfully!`);
      
      // Reset form with defaults
      setNewRecord({
        educatorId: '',
        name: '',
        ...DEFAULT_RECORD_VALUES
      });

      // Optional: switch to generate tab after delay
      setTimeout(() => {
          if (recordToSave.educatorId) setInputId(recordToSave.educatorId);
      }, 1500);
      
    } catch (err: any) {
      setAddStatus('error');
      setAddMessage(err.message);
    }
  };

  // --- Handlers: Config ---
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, key: keyof Assets) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        setConfigStatus('saving');
        await updateAssets({ [key]: base64String });
        const updated = await getAssets();
        setAssets(updated);
        setConfigStatus('success');
        setTimeout(() => setConfigStatus('idle'), 2000);
      };
      reader.readAsDataURL(file);
    }
  };

  // --- Render Helpers ---

  const renderTabs = () => (
    <div className="bg-white shadow-sm border-b border-gray-200 print:hidden sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                    U
                    </div>
                    <h1 className="text-xl font-bold text-gray-800 hidden sm:block">CertGen <span className="text-blue-600">Pro</span></h1>
                </div>
                <div className="flex space-x-4">
                    <button
                        onClick={() => setActiveTab('generate')}
                        className={`inline-flex items-center px-3 py-2 border-b-2 text-sm font-medium ${
                            activeTab === 'generate'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        <Layout className="w-4 h-4 mr-2" />
                        Generate
                    </button>
                    <button
                        onClick={() => setActiveTab('add')}
                        className={`inline-flex items-center px-3 py-2 border-b-2 text-sm font-medium ${
                            activeTab === 'add'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Record
                    </button>
                    <button
                        onClick={() => setActiveTab('config')}
                        className={`inline-flex items-center px-3 py-2 border-b-2 text-sm font-medium ${
                            activeTab === 'config'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        <Settings className="w-4 h-4 mr-2" />
                        Config
                    </button>
                </div>
            </div>
        </div>
    </div>
  );

  const renderGenerator = () => (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col items-center">
        {/* Search Bar */}
        <div className="w-full max-w-xl mb-8 print:hidden">
            <form onSubmit={(e) => handleFetch(e)} className="flex gap-2 shadow-sm">
                <div className="relative flex-grow">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                        type="text"
                        value={inputId}
                        onChange={(e) => setInputId(e.target.value)}
                        placeholder="Enter Educator ID (e.g., 131830246)"
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-base"
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-r-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50 min-w-[120px] justify-center"
                >
                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Fetch'}
                </button>
            </form>
        </div>

        {/* State: Initial / Dashboard (Table of Records) */}
        {!data && !loading && !error && (
            <div className="w-full max-w-4xl print:hidden animate-in fade-in duration-500">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <FileCheck className="w-5 h-5 text-blue-600" />
                        Available Records
                    </h3>
                    <span className="text-sm text-gray-500">{savedRecords.length} records found</span>
                </div>
                <div className="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Educator ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Designation</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Place</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {savedRecords.map((rec) => (
                                <tr key={rec.id} className="hover:bg-blue-50 transition-colors group cursor-pointer" onClick={() => handleFetch(undefined, rec.educatorId)}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{rec.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">{rec.educatorId}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">{rec.designation}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">{rec.place}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button 
                                            className="text-blue-600 hover:text-blue-900 font-semibold inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            Generate <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {savedRecords.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                        <div className="flex flex-col items-center">
                                            <AlertCircle className="w-10 h-10 text-gray-300 mb-2" />
                                            <p>No records found. Switch to the <strong>Add Record</strong> tab to create one.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                        </table>
                    </div>
                </div>
            </div>
        )}

        {/* State: Error */}
        {error && (
          <div className="w-full max-w-xl bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg flex items-center justify-between gap-3 print:hidden mb-8">
            <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <p>{error}</p>
            </div>
            <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700"><X className="w-5 h-5"/></button>
          </div>
        )}

        {/* State: Loading */}
        {loading && (
          <div className="mt-20 flex flex-col items-center print:hidden">
             <Loader2 className="h-10 w-10 animate-spin text-blue-600 mb-4" />
             <p className="text-gray-500 animate-pulse">Fetching records and assets...</p>
          </div>
        )}

        {/* State: Success - Show Preview */}
        {data && (
          <div className="flex flex-col items-center w-full animate-in slide-in-from-bottom-4 duration-500">
            <div className="w-full max-w-[210mm] flex justify-between items-center mb-6 print:hidden">
               <div className="text-sm text-gray-500 flex items-center gap-2">
                  <button onClick={clearPreview} className="hover:text-gray-800 underline">Records</button> 
                  <span>/</span> 
                  <span className="font-semibold text-gray-900">Preview</span>
               </div>
               <div className="flex gap-2">
                    <button
                        onClick={clearPreview}
                        className="bg-white border border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition-all"
                    >
                        Back
                    </button>
                    <button
                        onClick={handlePrint}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                    >
                        <Printer className="h-5 w-5" />
                        Print Certificate
                    </button>
               </div>
            </div>

            <div className="shadow-2xl print:shadow-none print:w-full">
              <div className="w-[210mm] min-h-[297mm] bg-white print:w-full print:h-full overflow-hidden">
                <CertificateTemplate data={data} />
              </div>
            </div>
          </div>
        )}
    </div>
  );

  const renderAddRecord = () => (
      <div className="max-w-xl mx-auto px-4 py-8">
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Plus className="w-6 h-6 text-blue-600" />
                Add New Employee
            </h2>
            
            {addStatus === 'success' && (
                <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md flex items-center gap-2">
                    <FileCheck className="w-5 h-5" />
                    {addMessage}
                </div>
            )}
            
             {addStatus === 'error' && (
                <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    {addMessage}
                </div>
            )}

            <form onSubmit={handleAddSubmit} className="flex flex-col gap-6">
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Educator Name *</label>
                    <input name="name" value={newRecord.name} onChange={handleRecordChange} required className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. Mr. John Doe" />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Educator ID (Unique) *</label>
                    <input name="educatorId" value={newRecord.educatorId} onChange={handleRecordChange} required className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. 123456789" />
                </div>
                
                <p className="text-xs text-gray-500 italic">
                  * Other certificate details (Designation, Division, Centre, etc.) will be auto-generated with default values.
                </p>

                <div className="mt-2">
                    <button type="submit" disabled={addStatus === 'submitting'} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg shadow transition-colors flex justify-center items-center gap-2">
                        {addStatus === 'submitting' ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        Save Record to Database
                    </button>
                </div>

            </form>
          </div>
      </div>
  );

  const renderConfig = () => (
      <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-8">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <Settings className="w-6 h-6 text-gray-600" />
                    Asset Configuration
                </h2>
                {configStatus === 'success' && <span className="text-green-600 font-medium flex items-center gap-1"><FileCheck className="w-4 h-4"/> Saved!</span>}
            </div>
            
            <p className="text-gray-500 mb-8">Upload images to customize the certificate assets. These updates apply to all generated certificates immediately.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Logo Config */}
                <div className="border rounded-lg p-4 flex flex-col items-center">
                    <h3 className="font-semibold text-gray-700 mb-4">Company Logo</h3>
                    <div className="w-full h-32 bg-gray-50 flex items-center justify-center border border-dashed border-gray-300 rounded mb-4 overflow-hidden relative group">
                        {assets?.logoUrl ? 
                           <img src={assets.logoUrl} alt="Logo" className="h-full object-contain" /> : 
                           <span className="text-gray-400 text-sm">No Logo</span>
                        }
                    </div>
                     <label className="cursor-pointer bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded shadow-sm text-sm font-medium flex items-center gap-2 transition-colors">
                        <Upload className="w-4 h-4" />
                        Upload New Logo
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, 'logoUrl')} />
                    </label>
                </div>

                 {/* Stamp Config */}
                 <div className="border rounded-lg p-4 flex flex-col items-center">
                    <h3 className="font-semibold text-gray-700 mb-4">Rubber Stamp</h3>
                    <div className="w-full h-32 bg-gray-50 flex items-center justify-center border border-dashed border-gray-300 rounded mb-4 overflow-hidden">
                         {assets?.stampUrl ? 
                           <img src={assets.stampUrl} alt="Stamp" className="h-24 w-24 object-contain opacity-80 rotate-[-12deg]" /> : 
                           <span className="text-gray-400 text-sm">No Stamp</span>
                        }
                    </div>
                     <label className="cursor-pointer bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded shadow-sm text-sm font-medium flex items-center gap-2 transition-colors">
                        <Upload className="w-4 h-4" />
                        Upload New Stamp
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, 'stampUrl')} />
                    </label>
                </div>

                 {/* Watermark Config */}
                 <div className="border rounded-lg p-4 flex flex-col items-center">
                    <h3 className="font-semibold text-gray-700 mb-4">Watermark</h3>
                    <div className="w-full h-32 bg-gray-50 flex items-center justify-center border border-dashed border-gray-300 rounded mb-4 overflow-hidden">
                        {assets?.watermarkUrl ? 
                           <div className="w-24 h-24 rounded-full border-2 border-gray-200 flex items-center justify-center" style={{ backgroundImage: `url(${assets.watermarkUrl})`, backgroundSize: 'contain', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}></div> : 
                           <span className="text-gray-400 text-sm">No Watermark</span>
                        }
                    </div>
                     <label className="cursor-pointer bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded shadow-sm text-sm font-medium flex items-center gap-2 transition-colors">
                        <Upload className="w-4 h-4" />
                        Upload New Watermark
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, 'watermarkUrl')} />
                    </label>
                </div>

                 {/* Signature Config */}
                 <div className="border rounded-lg p-4 flex flex-col items-center">
                    <h3 className="font-semibold text-gray-700 mb-4">Digital Signature</h3>
                    <div className="w-full h-32 bg-gray-50 flex items-center justify-center border border-dashed border-gray-300 rounded mb-4 overflow-hidden">
                         {assets?.signatureUrl ? 
                           <img src={assets.signatureUrl} alt="Signature" className="h-16 object-contain" /> : 
                           <span className="text-gray-400 text-sm">No Signature</span>
                        }
                    </div>
                     <label className="cursor-pointer bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded shadow-sm text-sm font-medium flex items-center gap-2 transition-colors">
                        <Upload className="w-4 h-4" />
                        Upload New Signature
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, 'signatureUrl')} />
                    </label>
                </div>
            </div>
          </div>
      </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col font-sans">
      {renderTabs()}

      <main className="flex-grow print:p-0 print:block">
        <div className="print:hidden">
            {activeTab === 'generate' && renderGenerator()}
            {activeTab === 'add' && renderAddRecord()}
            {activeTab === 'config' && renderConfig()}
        </div>
        
        {/* Force render Generator in print mode regardless of active tab */}
        <div className="hidden print:block">
             {data ? (
                 <div className="w-full h-full">
                     <CertificateTemplate data={data} />
                 </div>
             ) : (
                 <div className="flex items-center justify-center h-screen text-xl font-bold text-gray-400">
                     Please fetch a record in the Generate tab before printing.
                 </div>
             )}
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 py-6 mt-auto print:hidden">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} Unacademy Internal Systems. Confidential.
        </div>
      </footer>
    </div>
  );
};

export default App;