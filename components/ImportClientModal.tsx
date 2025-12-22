import React, { useState, useCallback } from 'react';
import { Client, Product, Seller, SubscriptionType } from '../types';
import { XIcon, UploadIcon } from './Icons';

interface ImportClientModalProps {
  onClose: () => void;
  onImport: (clients: Omit<Client, 'id'>[]) => void;
  products: Product[];
  sellers: Seller[];
}

const parseDate = (dateStr: string): Date | null => {
    if (!dateStr) return null;
    let date;
    if (dateStr.includes('/')) {
        const parts = dateStr.split('/');
        if (parts.length === 3) {
            date = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
        }
    } else if (dateStr.includes('-')) {
        date = new Date(dateStr);
    }
    
    if (date && !isNaN(date.getTime())) {
        return date;
    }
    return null;
}

const ImportClientModal: React.FC<ImportClientModalProps> = ({ onClose, onImport, products, sellers }) => {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [parsedClients, setParsedClients] = useState<Omit<Client, 'id'>[]>([]);
  const [isParsing, setIsParsing] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setParsedClients([]);
      setError(null);
      parseCsv(selectedFile);
    }
  };
  
  const parseCsv = useCallback((csvFile: File) => {
    setIsParsing(true);
    setError(null);
    setParsedClients([]);

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (!text) {
        setError("Il file è vuoto o illeggibile.");
        setIsParsing(false);
        return;
      }

      const lines = text.split(/\r\n|\n/);
      if (lines.length < 2) {
        setError("Il file non contiene dati sufficienti.");
        setIsParsing(false);
        return;
      }

      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      
      const requiredHeaders = ['nome', 'cognome', 'email', 'prodotto', 'inizio abbonamento', 'fine abbonamento'];
      const missingHeaders = requiredHeaders.filter(rh => !headers.includes(rh));

      if (missingHeaders.length > 0) {
        setError(`Intestazioni CSV mancanti: ${missingHeaders.join(', ')}.`);
        setIsParsing(false);
        return;
      }
      
      const headerMap: { [key: string]: number } = {};
      headers.forEach((h, i) => headerMap[h] = i);

      const clientsToImport: Omit<Client, 'id'>[] = [];
      const errors: string[] = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (!line.trim()) continue;

        // Gestione base dei campi tra virgolette se necessario, qui split semplice
        const data = line.split(',').map(d => d.trim().replace(/^"|"$/g, ''));

        const name = data[headerMap['nome']];
        const surname = data[headerMap['cognome']];
        const email = data[headerMap['email']];
        const productName = data[headerMap['prodotto']];
        const startDateStr = data[headerMap['inizio abbonamento']];
        const endDateStr = data[headerMap['fine abbonamento']];

        if (!name || !surname || !email || !productName || !startDateStr || !endDateStr) {
          errors.push(`Riga ${i + 1}: Dati obbligatori mancanti.`);
          continue;
        }

        const product = products.find(p => p.name.toLowerCase() === productName.toLowerCase());
        if (!product) {
          errors.push(`Riga ${i + 1}: Prodotto "${productName}" non censito.`);
          continue;
        }

        const sellerName = data[headerMap['venditore']];
        const seller = sellerName ? sellers.find(s => s.name.toLowerCase() === sellerName.toLowerCase()) : undefined;

        const startDate = parseDate(startDateStr);
        const endDate = parseDate(endDateStr);
        
        if (!startDate || !endDate || startDate >= endDate) {
            errors.push(`Riga ${i + 1}: Date non valide.`);
            continue;
        }
        
        const tipoAbbonamento = (data[headerMap['tipo abbonamento']] || '').toLowerCase();
        let subscriptionType: SubscriptionType = 'monthly';
        if (tipoAbbonamento === 'annuale' || tipoAbbonamento === 'annual') subscriptionType = 'annual';
        else if (tipoAbbonamento === 'prova' || tipoAbbonamento === 'trial') subscriptionType = 'trial';

        clientsToImport.push({
          name,
          surname,
          companyName: data[headerMap['nome azienda']] || '',
          vatNumber: data[headerMap['partita iva']] || '',
          email,
          phone: data[headerMap['telefono']] || data[headerMap['phone']] || '',
          address: data[headerMap['indirizzo']] || '',
          iban: data[headerMap['iban']] || '',
          otherInfo: data[headerMap['info aggiuntive']] || '',
          productId: product.id,
          sellerId: seller?.id,
          subscriptionType: subscriptionType,
          subscription: {
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
          },
        });
      }
      
      if(errors.length > 0) {
          setError(`Rilevati errori in ${errors.length} righe. Esempio: ${errors[0]}`);
      } else {
          setParsedClients(clientsToImport);
      }
      setIsParsing(false);
    };

    reader.onerror = () => {
        setError("Errore lettura file.");
        setIsParsing(false);
    }

    reader.readAsText(csvFile);
  }, [products, sellers]);
  
  const handleSubmit = () => {
      if(parsedClients.length > 0) {
          onImport(parsedClients);
          onClose();
      }
  }

  return (
    <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100">
        <div className="p-8 border-b flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Importazione CSV</h2>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Caricamento massivo anagrafiche</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400">
            <XIcon className="w-6 h-6" />
          </button>
        </div>
        <div className="p-8">
          <div className="bg-slate-50 rounded-2xl p-4 mb-6 text-[11px] font-medium text-slate-500 leading-relaxed border border-slate-100">
            Header richiesti: <span className="font-black text-slate-700">nome, cognome, email, prodotto, inizio abbonamento, fine abbonamento</span>. 
            Opzionali: <span className="font-black text-slate-700">telefono, nome azienda, partita iva, indirizzo, iban, info aggiuntive, venditore, tipo abbonamento</span>.
          </div>
          
          <label htmlFor="csv-upload" className="w-full flex flex-col items-center justify-center p-10 border-2 border-dashed border-slate-200 rounded-[2rem] cursor-pointer hover:bg-slate-50 hover:border-blue-400 transition-all group">
            <div className="bg-blue-50 text-blue-600 p-4 rounded-2xl mb-4 group-hover:scale-110 transition-transform">
                <UploadIcon className="w-8 h-8" />
            </div>
            <span className="text-sm font-black text-slate-600 uppercase tracking-tight text-center">
              {file ? file.name : 'Seleziona o trascina il file .csv'}
            </span>
            <input id="csv-upload" type="file" accept=".csv" className="hidden" onChange={handleFileChange} />
          </label>
          
          <div className="mt-6">
            {isParsing && <div className="flex items-center gap-3 text-blue-600 font-bold text-sm"><div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div> ANALISI IN CORSO...</div>}
            {error && <div className="bg-red-50 border border-red-100 text-red-700 p-4 rounded-xl text-xs font-bold">{error}</div>}
            {parsedClients.length > 0 && (
                <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 p-4 rounded-xl text-xs font-bold flex items-center justify-between">
                    <span>PRONTO: {parsedClients.length} CLIENTI RILEVATI</span>
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                </div>
            )}
          </div>
        </div>
        <div className="p-8 bg-slate-50 flex justify-end gap-4 border-t border-slate-100">
          <button type="button" onClick={onClose} className="px-6 py-3 text-slate-500 font-bold uppercase text-xs tracking-widest hover:bg-white rounded-xl transition-all">Annulla</button>
          <button 
            type="button" 
            onClick={handleSubmit}
            disabled={isParsing || parsedClients.length === 0}
            className="bg-blue-600 text-white font-black py-3 px-8 rounded-xl shadow-lg shadow-blue-600/30 hover:bg-blue-700 transition-all disabled:opacity-30 disabled:cursor-not-allowed uppercase text-xs tracking-widest">
              Importa Dati
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportClientModal;