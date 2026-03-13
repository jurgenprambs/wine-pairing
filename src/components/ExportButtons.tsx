'use client';

import { Pairing } from '@/lib/types';
import { exportPdf } from '@/lib/exportPdf';
import { exportJson } from '@/lib/exportJson';

interface ExportButtonsProps {
  pairing: Pairing;
}

export default function ExportButtons({ pairing }: ExportButtonsProps) {
  return (
    <div className="flex gap-3">
      <button
        onClick={() => exportPdf(pairing)}
        className="btn-outline-gold flex items-center gap-2"
      >
        <span className="text-base">↓</span> Export PDF
      </button>
      <button
        onClick={() => exportJson(pairing)}
        className="btn-outline-cream flex items-center gap-2"
      >
        <span className="text-base">↓</span> Export JSON
      </button>
    </div>
  );
}
