import React from 'react';

interface SellerReport {
  id: string;
  name: string;
  totalRevenue: number;
  totalCommission: number;
}

interface SellerBarChartProps {
  data: SellerReport[];
}

const SellerBarChart: React.FC<SellerBarChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
        <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-slate-100">
            <h3 className="text-lg font-black text-slate-800 mb-2 uppercase tracking-tight">Performance Venditori</h3>
            <p className="text-center text-slate-400 py-12 font-medium italic">Nessun dato di vendita disponibile per generare il grafico.</p>
        </div>
    );
  }

  // Trova il valore massimo per scalare le barre
  const maxValue = Math.max(...data.flatMap(d => [d.totalRevenue, d.totalCommission]), 1);

  return (
    <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-50">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Performance Venditori</h3>
          <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mt-1">Confronto Fatturato vs Provvigioni</p>
        </div>
        <div className="flex items-center gap-6 bg-slate-50 px-6 py-3 rounded-2xl border border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-md shadow-lg shadow-blue-500/20"></div>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Fatturato</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-md shadow-lg shadow-emerald-500/20"></div>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Provvigioni</span>
          </div>
        </div>
      </div>

      <div className="space-y-10">
        {data.map(seller => (
          <div key={seller.id} className="group">
            <div className="flex justify-between items-end mb-3 px-1">
              <span className="text-sm font-black text-slate-700 uppercase tracking-tight group-hover:text-blue-600 transition-colors">{seller.name}</span>
              <div className="flex gap-4 text-[11px] font-black">
                <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100">€{seller.totalRevenue.toLocaleString()}</span>
                <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100">€{seller.totalCommission.toLocaleString()}</span>
              </div>
            </div>
            
            <div className="space-y-2">
              {/* Barra Fatturato */}
              <div className="relative h-4 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                <div
                  className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all duration-1000 cubic-bezier(0.4, 0, 0.2, 1)"
                  style={{ width: `${(seller.totalRevenue / maxValue) * 100}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
              </div>
              
              {/* Barra Provvigione */}
              <div className="relative h-3 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                <div
                  className="absolute left-0 top-0 h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all duration-1000 cubic-bezier(0.4, 0, 0.2, 1) delay-100"
                  style={{ width: `${(seller.totalCommission / maxValue) * 100}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SellerBarChart;