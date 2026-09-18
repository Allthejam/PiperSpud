"use client";

import React, { useRef, useState, useEffect } from 'react';
import { useRouteContext } from '@/context/RouteContext';
import { GovernanceSignOff as IGovernanceSignOff } from '@/types/route';
import { ShieldCheck, CheckCircle2, FileSignature, Printer, RotateCcw, AlertTriangle } from 'lucide-react';

export default function GovernanceSignOff() {
  const { currentRoute, updateCurrentRoute, showToast } = useRouteContext();

  const assessorCanvasRef = useRef<HTMLCanvasElement>(null);
  const managerCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isAssessorDrawing, setIsAssessorDrawing] = useState(false);
  const [isManagerDrawing, setIsManagerDrawing] = useState(false);

  const [formData, setFormData] = useState<IGovernanceSignOff>({
    assessorName: '',
    assessorRole: '',
    assessorDate: '',
    managerName: '',
    managerRole: '',
    managerDate: '',
    status: 'DRAFT',
    reviewComments: '',
  });

  useEffect(() => {
    if (currentRoute?.governance) {
      setFormData(currentRoute.governance);
    }
  }, [currentRoute]);

  if (!currentRoute) return null;

  // Canvas drawing handlers for Assessor
  const startAssessorDraw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = assessorCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = '#002D62';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    setIsAssessorDrawing(true);
  };

  const drawAssessor = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isAssessorDrawing) return;
    const canvas = assessorCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopAssessorDraw = () => {
    setIsAssessorDrawing(false);
  };

  const clearAssessorCanvas = () => {
    const canvas = assessorCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  // Canvas drawing handlers for Manager
  const startManagerDraw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = managerCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = '#002D62';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    setIsManagerDrawing(true);
  };

  const drawManager = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isManagerDrawing) return;
    const canvas = managerCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopManagerDraw = () => {
    setIsManagerDrawing(false);
  };

  const clearManagerCanvas = () => {
    const canvas = managerCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleSaveSignOff = (e: React.FormEvent) => {
    e.preventDefault();

    let assessorSig = formData.assessorSignature;
    if (assessorCanvasRef.current) {
      assessorSig = assessorCanvasRef.current.toDataURL();
    }

    let managerSig = formData.managerSignature;
    if (managerCanvasRef.current) {
      managerSig = managerCanvasRef.current.toDataURL();
    }

    const updatedGov: IGovernanceSignOff = {
      ...formData,
      assessorSignature: assessorSig,
      managerSignature: managerSig,
    };

    updateCurrentRoute((prev) => ({
      ...prev,
      governance: updatedGov,
      status: updatedGov.status === 'APPROVED' ? 'Approved' : 'Requires Review',
    }));

    showToast(`Governance sign-off recorded for Route ${currentRoute.routeNumber}`);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6 pb-24 md:pb-12">
      
      {/* Header Banner */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black uppercase">
              Route {currentRoute.routeNumber}
            </span>
            <span className="text-xs text-slate-500 font-semibold">Governance & Legal Audit</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
            Formal RRA Sign-off & Audit Trail
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Health and Safety at Work Act 1974 & DVSA Public Transport Compliance Certification.
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="inline-flex items-center px-4 py-2 bg-stagecoach-navy hover:bg-slate-800 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md transition-colors"
        >
          <Printer className="w-4 h-4 mr-1.5" />
          <span>Generate Signed Dossier</span>
        </button>
      </div>

      <form onSubmit={handleSaveSignOff} className="space-y-6">
        
        {/* Assessor Sign-Off Section */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center space-x-2.5 pb-3 border-b border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center text-stagecoach-blue">
              <FileSignature className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">1. Route Risk Assessor Sign-off</h3>
              <p className="text-xs text-slate-500">I confirm the route has been surveyed and hazards mitigated.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Assessor Full Name *
              </label>
              <input
                type="text"
                required
                value={formData.assessorName}
                onChange={(e) => setFormData({ ...formData, assessorName: e.target.value })}
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-stagecoach-blue focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Role / Title *
              </label>
              <input
                type="text"
                required
                value={formData.assessorRole}
                onChange={(e) => setFormData({ ...formData, assessorRole: e.target.value })}
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-stagecoach-blue focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Date of Survey *
              </label>
              <input
                type="date"
                required
                value={formData.assessorDate || new Date().toISOString().split('T')[0]}
                onChange={(e) => setFormData({ ...formData, assessorDate: e.target.value })}
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-stagecoach-blue focus:outline-none"
              />
            </div>
          </div>

          {/* Assessor Signature Pad */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Assessor Digital Signature (Draw / Touch)
              </label>
              <button
                type="button"
                onClick={clearAssessorCanvas}
                className="inline-flex items-center text-[11px] text-slate-500 hover:text-slate-800"
              >
                <RotateCcw className="w-3 h-3 mr-1" />
                Clear Pad
              </button>
            </div>
            <div className="border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50 overflow-hidden touch-none h-28 relative">
              <canvas
                ref={assessorCanvasRef}
                width={700}
                height={120}
                onMouseDown={startAssessorDraw}
                onMouseMove={drawAssessor}
                onMouseUp={stopAssessorDraw}
                onMouseLeave={stopAssessorDraw}
                onTouchStart={startAssessorDraw}
                onTouchMove={drawAssessor}
                onTouchEnd={stopAssessorDraw}
                className="w-full h-full cursor-crosshair"
              />
              <span className="absolute bottom-2 right-3 text-[10px] text-slate-400 font-mono pointer-events-none">
                Sign above line
              </span>
            </div>
          </div>
        </div>

        {/* Operations Safety Manager Sign-Off Section */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center space-x-2.5 pb-3 border-b border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">2. Operations Safety Manager Approval</h3>
              <p className="text-xs text-slate-500">Official management authorization for commercial service operation.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Manager Full Name *
              </label>
              <input
                type="text"
                required
                value={formData.managerName}
                onChange={(e) => setFormData({ ...formData, managerName: e.target.value })}
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-stagecoach-blue focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Manager Role / Title *
              </label>
              <input
                type="text"
                required
                value={formData.managerRole}
                onChange={(e) => setFormData({ ...formData, managerRole: e.target.value })}
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-stagecoach-blue focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Approval Status *
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 border border-slate-300 rounded-xl bg-slate-50 font-bold focus:outline-none focus:ring-2 focus:ring-stagecoach-blue"
              >
                <option value="DRAFT">DRAFT - In Progress</option>
                <option value="PENDING_REVIEW">PENDING REVIEW</option>
                <option value="APPROVED">APPROVED - Cleared for Service</option>
                <option value="REJECTED">REJECTED - Further Mitigation Needed</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Manager Review & Audit Comments
            </label>
            <textarea
              rows={2}
              value={formData.reviewComments || ''}
              onChange={(e) => setFormData({ ...formData, reviewComments: e.target.value })}
              placeholder="e.g. Cleared for double deckers with strict bridge speed enforcement. Annual review logged."
              className="w-full text-xs sm:text-sm px-3.5 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-stagecoach-blue focus:outline-none resize-none"
            />
          </div>

          {/* Manager Signature Pad */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Manager Digital Signature (Draw / Touch)
              </label>
              <button
                type="button"
                onClick={clearManagerCanvas}
                className="inline-flex items-center text-[11px] text-slate-500 hover:text-slate-800"
              >
                <RotateCcw className="w-3 h-3 mr-1" />
                Clear Pad
              </button>
            </div>
            <div className="border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50 overflow-hidden touch-none h-28 relative">
              <canvas
                ref={managerCanvasRef}
                width={700}
                height={120}
                onMouseDown={startManagerDraw}
                onMouseMove={drawManager}
                onMouseUp={stopManagerDraw}
                onMouseLeave={stopManagerDraw}
                onTouchStart={startManagerDraw}
                onTouchMove={drawManager}
                onTouchEnd={stopManagerDraw}
                className="w-full h-full cursor-crosshair"
              />
              <span className="absolute bottom-2 right-3 text-[10px] text-slate-400 font-mono pointer-events-none">
                Sign above line
              </span>
            </div>
          </div>
        </div>

        {/* Legal Disclaimer Box */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-slate-500 text-xs leading-relaxed flex items-start space-x-2.5">
          <ShieldCheck className="w-5 h-5 text-stagecoach-blue flex-shrink-0 mt-0.5" />
          <p>
            By submitting this digital sign-off, you certify under Stagecoach Safety Directorate policies that this Route Risk Assessment has been performed accurately, with all severe physical constraints, turning radiuses, foliage corridors, and speed hazards logged and mitigated.
          </p>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end space-x-4 pt-2">
          <button
            type="submit"
            className="px-8 py-3 bg-stagecoach-blue hover:bg-blue-800 text-white text-sm font-extrabold rounded-xl shadow-lg transition-all"
          >
            Save & Certify Route Governance
          </button>
        </div>

      </form>

    </div>
  );
}
