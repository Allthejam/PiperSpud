"use client";

import React from 'react';
import { HazardObservation } from '@/types/route';

interface RiskMatrix5x5Props {
  hazards: HazardObservation[];
  onSelectHazard?: (hazard: HazardObservation) => void;
}

export default function RiskMatrix5x5({ hazards, onSelectHazard }: RiskMatrix5x5Props) {
  // 5x5 Matrix (Severity 1-5 rows, Likelihood 1-5 cols)
  // Row 5 is Severity 5 (Catastrophic), Col 5 is Likelihood 5 (Almost Certain)
  const severities = [5, 4, 3, 2, 1];
  const likelihoods = [1, 2, 3, 4, 5];

  const getCellColor = (score: number) => {
    if (score >= 15) return 'bg-red-500/80 hover:bg-red-600 text-white';
    if (score >= 8) return 'bg-amber-400/80 hover:bg-amber-500 text-slate-900';
    return 'bg-emerald-500/80 hover:bg-emerald-600 text-white';
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-sm sm:text-base font-bold text-slate-900">5×5 HSE Risk Assessment Matrix</h4>
          <p className="text-xs text-slate-500">Distribution of residual risk scores across route corridor</p>
        </div>
        <div className="flex items-center space-x-2 text-[10px] sm:text-xs font-bold">
          <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">1-6 Low</span>
          <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800">8-12 Med</span>
          <span className="px-2 py-0.5 rounded bg-red-100 text-red-800">15-25 High</span>
        </div>
      </div>

      <div className="relative overflow-x-auto">
        <div className="min-w-[320px]">
          
          {/* Likelihood Header */}
          <div className="text-center text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Likelihood (1 = Rare ➔ 5 = Almost Certain)
          </div>

          <div className="grid grid-cols-6 gap-1.5 text-center">
            {/* Corner empty */}
            <div className="flex items-center justify-center text-[11px] font-bold text-slate-400">
              Sev \ Lik
            </div>

            {likelihoods.map((l) => (
              <div key={l} className="py-1 text-xs font-bold text-slate-600 bg-slate-100 rounded-lg">
                L{l}
              </div>
            ))}

            {/* Matrix Rows */}
            {severities.map((s) => (
              <React.Fragment key={s}>
                {/* Severity Label */}
                <div className="flex items-center justify-center text-xs font-bold text-slate-600 bg-slate-100 rounded-lg py-2">
                  S{s}
                </div>

                {/* Likelihood Cells */}
                {likelihoods.map((l) => {
                  const score = s * l;
                  const matchingHazards = hazards.filter(
                    (h) => h.residualSeverity === s && h.residualLikelihood === l
                  );

                  return (
                    <div
                      key={`${s}-${l}`}
                      className={`h-12 rounded-xl border flex flex-col items-center justify-center p-1 transition-all ${getCellColor(
                        score
                      )}`}
                    >
                      <span className="text-[10px] font-mono font-bold opacity-80">{score}</span>
                      {matchingHazards.length > 0 && (
                        <span className="mt-0.5 px-1.5 py-0.2 bg-black/80 text-white rounded-full text-[10px] font-black animate-pulse">
                          {matchingHazards.length}
                        </span>
                      )}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>

          {/* Severity Footer Info */}
          <div className="mt-2 text-center text-[11px] text-slate-400">
            Vertical: Severity (1 = Negligible ➔ 5 = Catastrophic / Fatal)
          </div>

        </div>
      </div>
    </div>
  );
}
