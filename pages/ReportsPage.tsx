import React, { useMemo } from 'react';
import { Client, Product, Seller } from '../types';
import { DownloadIcon, BarChartIcon, CalculatorIcon, BriefcaseIcon } from '../components/Icons';
import SellerBarChart from '../components/SellerBarChart';

interface ReportsPageProps {
  clients: Client[];
  products: Product[];
  sellers: Seller[];
}

const ReportsPage: React.FC<ReportsPageProps> = ({ clients, products, sellers }) => {
  const sellerReports = useMemo(() => {
    return sellers.map(seller => {
      const sellerClients = clients.filter(client => client.sellerId === seller.id);
      
      const report = sellerClients.reduce((acc, client) => {
        const product = products.find(p => p.id === client.productId);
        if (product) {
          const commission = (product.price * seller.commissionRate) / 100;
          acc.totalRevenue += product.price;
          acc.totalCommission += commission;
          acc.sales.push({
            clientName: `${client.name} ${client.surname}`,
            productName: product.name,
            productPrice: product.price,
            commission,
          });
        }
        return acc;
      }, { totalRevenue: 0, totalCommission: 0, sales: [] as any[] });

      return {
        ...seller,
        totalSales: sellerClients.length,
        ...report,
      };
    });
  }, [clients, products, sellers]);

  // Calcoli Globali
  const globalStats = useMemo(() => {
    const totalRev = sellerReports.reduce((acc, r) => acc + r.totalRevenue, 0);
    const totalComm = sellerReports.reduce((acc, r) => acc + r.totalCommission, 0);
    const totalSales = sellerReports.reduce((acc, r) => acc + r.totalSales, 0);
    return {
      totalRevenue: totalRev,
      totalCommission: totalComm,
      avgSale: totalSales > 0 ? totalRev / totalSales : 0,
      totalSales
    };
  }, [sellerReports]);

   const exportToCsv = (filename: string, data: any[]) => {
    if (!data || data.length === 0) {
      alert('Nessun dato da esportare.');
      return;
    }
    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(',')];

    for (const row of data) {
      const values = headers.map(header => {
        const value = row[header];
        const stringValue = value === null || value === undefined ? '' : String(value);
        const escaped = stringValue.replace(/"/g, '""');
        return `"${escaped}"`;
      });
      csvRows.push(values.join(','));
    }

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  
  const handleExport = () => {
    const allSales = sellerReports.flatMap(report => 
      report.sales.map(sale => ({
        'Venditore': report.name,
        'Cliente': sale.clientName,
        'Prodotto': sale.productName,
        'Prezzo Prodotto (€)': sale.productPrice.toFixed(2),
        'Provvigione (€)': sale.commission.toFixed(2),
      }))
    );
    exportToCsv('report_vendite.csv', allSales);
  };

  return (
    <div className="space-y-12 pb-20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Reportistica Vendite</h1>
              <p className="text-slate-400 font-bold text-sm mt-1 uppercase tracking-widest opacity-80">Analisi performance e provvigioni rete vendita</p>
            </div>
            <button
                onClick={handleExport}
                className="flex items-center gap-3 bg-emerald-600 text-white font-black py-4 px-8 rounded-2xl shadow-2xl shadow-emerald-600/30 hover:bg-emerald-700 hover:-translate-y-1 transition-all active:translate-y-0"
            >
                <DownloadIcon className="w-6 h-6" />
                <span>ESPORTA DATI CSV</span>
            </button>
        </div>

        {/* Global Highlights Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl shadow-slate-100/50">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-xl"><CalculatorIcon className="w-5 h-5" /></div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Fatturato Totale</span>
            </div>
            <p className="text-3xl font-black text-slate-900 tracking-tighter">€{globalStats.totalRevenue.toLocaleString('it-IT', { minimumFractionDigits: 2 })}</p>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl shadow-slate-100/50">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl"><BarChartIcon className="w-5 h-5" /></div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Provvigioni</span>
            </div>
            <p className="text-3xl font-black text-emerald-600 tracking-tighter">€{globalStats.totalCommission.toLocaleString('it-IT', { minimumFractionDigits: 2 })}</p>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl shadow-slate-100/50">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-slate-50 text-slate-600 rounded-xl"><BriefcaseIcon className="w-5 h-5" /></div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Vendite Chiuse</span>
            </div>
            <p className="text-3xl font-black text-slate-900 tracking-tighter">{globalStats.totalSales}</p>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl shadow-slate-100/50">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-50 text-purple-600 rounded-xl"><BarChartIcon className="w-5 h-5" /></div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Ticket Medio</span>
            </div>
            <p className="text-3xl font-black text-purple-600 tracking-tighter">€{globalStats.avgSale.toLocaleString('it-IT', { maximumFractionDigits: 0 })}</p>
          </div>
        </div>

        {/* Visual Chart */}
        <SellerBarChart data={sellerReports} />

        {/* Detailed Individual Reports */}
        <div className="space-y-12">
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter border-b-4 border-blue-600 w-fit pb-1">Dettaglio Venditori</h2>
            
            {sellerReports.map(report => (
                <div key={report.id} className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
                    <div className="p-8 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                        <div>
                          <h2 className="text-3xl font-black text-slate-900 tracking-tighter">{report.name}</h2>
                          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">Report individuale vendite e incentivi</p>
                        </div>
                        <div className="flex gap-4">
                          <div className="bg-white px-4 py-2 rounded-2xl shadow-sm border border-slate-200">
                             <span className="text-[10px] font-black text-slate-400 block uppercase">Fatturato</span>
                             <span className="text-lg font-black text-slate-900">€{report.totalRevenue.toFixed(2)}</span>
                          </div>
                          <div className="bg-white px-4 py-2 rounded-2xl shadow-sm border border-slate-200">
                             <span className="text-[10px] font-black text-slate-400 block uppercase">Provvigione</span>
                             <span className="text-lg font-black text-emerald-600">€{report.totalCommission.toFixed(2)}</span>
                          </div>
                        </div>
                    </div>
                    
                    <div className="p-8">
                      <div className="overflow-x-auto">
                          {report.sales.length > 0 ? (
                              <table className="min-w-full">
                                  <thead>
                                  <tr className="border-b border-slate-100">
                                      <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Cliente</th>
                                      <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Prodotto</th>
                                      <th className="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Prezzo</th>
                                      <th className="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Provvigione</th>
                                  </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-50">
                                      {report.sales.map((sale, index) => (
                                          <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                                              <td className="px-6 py-4 whitespace-nowrap font-bold text-slate-800">{sale.clientName}</td>
                                              <td className="px-6 py-4 whitespace-nowrap text-slate-500 font-medium">{sale.productName}</td>
                                              <td className="px-6 py-4 whitespace-nowrap text-right font-black text-slate-900">€{sale.productPrice.toFixed(2)}</td>
                                              <td className="px-6 py-4 whitespace-nowrap text-right text-emerald-600 font-black">€{sale.commission.toFixed(2)}</td>
                                          </tr>
                                      ))}
                                  </tbody>
                              </table>
                          ) : (
                              <div className="py-12 text-center">
                                <p className="text-slate-400 font-medium italic">Nessuna vendita registrata per questo periodo.</p>
                              </div>
                          )}
                      </div>
                    </div>
                </div>
            ))}
        </div>
    </div>
  );
};

export default ReportsPage;