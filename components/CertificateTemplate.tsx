import React from 'react';
import { CertificateData } from '../types';

interface Props {
  data: CertificateData;
}

const CertificateTemplate: React.FC<Props> = ({ data }) => {
  const { record, assets } = data;

  return (
    <div className="relative w-full h-full bg-white text-black font-serif leading-relaxed p-12 text-[12pt] flex flex-col justify-between">
      
      {/* Watermark - Absolute Positioned */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10 z-0">
         <div 
          className="w-[500px] h-[500px] rounded-full border-8 border-gray-300 flex items-center justify-center rotate-[-45deg]"
          style={{ backgroundImage: `url(${assets.watermarkUrl})`, backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundPosition: 'center' }}
         />
      </div>

      {/* Main Content Container (z-10 to sit above watermark) */}
      <div className="relative z-10 flex flex-col h-full">
        
        {/* Header Section */}
        <div className="flex justify-between items-start border-b-2 border-brand-blue pb-4 mb-8">
          <div className="flex items-center">
            {/* Dynamic Logo */}
            {assets.logoUrl ? (
                <img src={assets.logoUrl} alt="Logo" className="h-12 w-auto object-contain" />
            ) : (
                <div className="flex items-center gap-2">
                    {/* Fallback Simulation if no logo URL */}
                    <div className="w-10 h-10 bg-gradient-to-b from-blue-400 to-green-400 rounded-b-full rounded-tr-full rounded-tl-sm relative"></div>
                    <span className="text-3xl font-bold text-blue-500 tracking-tight font-sans">unacademy</span>
                </div>
            )}
          </div>
          
          <div className="text-right text-sm text-gray-700 font-sans w-1/2">
            <p className="font-semibold">{record.centreName}-Near Ashirwad hospital,</p>
            <p>Kashipur, {record.place} 848101</p>
            <p>Email: suman.saurabh@unacademy.com</p>
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-12 mt-4">
          <h1 className="text-xl font-bold uppercase tracking-wide border-b border-transparent inline-block">
            NO DUES CERTIFICATE
          </h1>
        </div>

        {/* Body Paragraphs */}
        <div className="space-y-8 text-justify">
          <p>
            This is to certify that <strong>{record.name}</strong>, {record.designation}, {record.division}, Educator ID <strong>{record.educatorId}</strong>, {record.centreName}, has no financial or material dues pending towards the centre for the period <strong>{record.periodStart}</strong> to <strong>{record.periodEnd}</strong>.
          </p>

          <p>
            All salary, incentives, and other settlements for the above period have been cleared as per centre records
          </p>

          <p>
            This certificate is being issued on the request of the faculty for official and record purposes. <br/>
            <span className="block mt-4 text-right">Date: {record.issueDate}</span>
          </p>
        </div>

        {/* Footer / Signatures - Pushed to bottom via flex-grow/margin */}
        <div className="mt-auto pt-16">
          <div className="mb-8">
            <p>Place: {record.place}</p>
          </div>

          <div className="flex flex-col gap-8">
            <div className="relative">
              <p className="mb-8">Signature: <span className="inline-block border-b border-black w-48 relative top-1">
                 {/* Digital Signature Overlay */}
                 <img src={assets.signatureUrl} alt="Signature" className="absolute -top-8 left-4 h-12 opacity-90 mix-blend-multiply" />
              </span></p>
            </div>

            <div className="space-y-2">
              <p>Name: {record.signatoryName}<span className="inline-block border-b border-black w-48 ml-2"></span></p>
              <p>Designation: {record.signatoryDesignation}</p>
            </div>

            <div className="relative mt-4">
              <div className="flex items-end">
                <p>Unacademy {record.place} Stamp: </p>
                <div className="border-b border-black w-48 ml-2 relative">
                  {/* Stamp Overlay */}
                  <img 
                    src={assets.stampUrl} 
                    alt="Stamp" 
                    className="absolute -top-12 left-8 h-20 w-20 opacity-80 rotate-[-12deg] mix-blend-multiply" 
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Page Border (Blue line at top is handled by header border, but full page border is common in certs, 
          though reference image shows a simple border) */}
      <div className="absolute inset-0 border border-blue-600 pointer-events-none m-4"></div>
    </div>
  );
};

export default CertificateTemplate;