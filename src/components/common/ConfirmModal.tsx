"use client";

import React from 'react';
import { useRouteContext } from '@/context/RouteContext';
import { AlertTriangle, AlertCircle } from 'lucide-react';

export default function ConfirmModal() {
  const { confirmModal, hideConfirmModal } = useRouteContext();

  if (!confirmModal.isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200 text-center transform animate-in zoom-in-95 duration-200">
        
        {/* Warning Icon Banner */}
        <div className={`w-14 h-14 rounded-full mx-auto flex items-center justify-center mb-4 ${
          confirmModal.isDestructive ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-stagecoach-amber'
        }`}>
          {confirmModal.isDestructive ? (
            <AlertCircle className="w-8 h-8" />
          ) : (
            <AlertTriangle className="w-8 h-8" />
          )}
        </div>

        <h3 className="text-xl font-bold text-slate-900 mb-2">
          {confirmModal.title}
        </h3>

        <p className="text-sm text-slate-600 mb-6 leading-relaxed">
          {confirmModal.message}
        </p>

        <div className="flex items-center justify-center space-x-3">
          <button
            type="button"
            onClick={hideConfirmModal}
            className="w-1/2 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              confirmModal.onConfirm();
              hideConfirmModal();
            }}
            className={`w-1/2 py-2.5 px-4 text-white text-sm font-bold rounded-xl shadow-lg transition-colors ${
              confirmModal.isDestructive
                ? 'bg-red-600 hover:bg-red-700 shadow-red-600/30'
                : 'bg-stagecoach-blue hover:bg-blue-800 shadow-blue-800/30'
            }`}
          >
            {confirmModal.confirmText || 'Proceed'}
          </button>
        </div>
      </div>
    </div>
  );
}
