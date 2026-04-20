import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { collection, query, where, getDocs, addDoc, serverTimestamp, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Shield, Plus, Trash2, Download, AlertTriangle, CheckCircle, Activity, Globe, Server, FileText } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import toast from 'react-hot-toast';

interface Asset {
  id: string;
  value: string;
  type: 'DOMAIN' | 'IP';
}

const MOCK_THREAT_TRENDS = [
  { date: 'Mon', critical: 0, high: 1, medium: 4 },
  { date: 'Tue', critical: 1, high: 0, medium: 2 },
  { date: 'Wed', critical: 0, high: 2, medium: 5 },
  { date: 'Thu', critical: 0, high: 1, medium: 2 },
  { date: 'Fri', critical: 0, high: 0, medium: 3 },
  { date: 'Sat', critical: 2, high: 1, medium: 4 },
  { date: 'Sun', critical: 0, high: 0, medium: 1 },
];

export default function ClientDashboard() {
  const { user } = useAuth();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [newAsset, setNewAsset] = useState('');
  const [assetType, setAssetType] = useState<'DOMAIN' | 'IP'>('DOMAIN');
  const [loading, setLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  
  const dashboardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      fetchAssets();
    }
  }, [user]);

  const fetchAssets = async () => {
    if (!user) return;
    try {
      const q = query(collection(db, 'assets'), where('ownerId', '==', user.uid));
      const snap = await getDocs(q);
      const fetched = snap.docs.map(d => ({ id: d.id, ...d.data() } as Asset));
      setAssets(fetched);
    } catch (e) {
      console.error(e);
      // It might fail due to lack of index or permissions initially, but will recover gracefully
    } finally {
      setLoading(false);
    }
  };

  const handleAddAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newAsset.trim()) return;
    
    try {
      const docRef = await addDoc(collection(db, 'assets'), {
        value: newAsset.trim(),
        type: assetType,
        ownerId: user.uid,
        createdAt: serverTimestamp()
      });
      setAssets([...assets, { id: docRef.id, value: newAsset.trim(), type: assetType }]);
      setNewAsset('');
      toast.success('Asset added successfully for monitoring');
    } catch (error: any) {
      toast.error('Failed to add asset: ' + error.message);
    }
  };

  const handleRemoveAsset = async (id: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'assets', id));
      setAssets(assets.filter(a => a.id !== id));
      toast.success('Asset removed from monitoring');
    } catch (error: any) {
      toast.error('Failed to remove asset');
    }
  };

  const exportPdfReport = async () => {
    if (!dashboardRef.current) return;
    setIsExporting(true);
    toast.loading('Generating Executive PDF Report...', { id: 'pdfExport' });
    
    try {
      const canvas = await html2canvas(dashboardRef.current, {
        scale: 2,
        backgroundColor: '#000000',
        windowWidth: dashboardRef.current.scrollWidth,
        windowHeight: dashboardRef.current.scrollHeight
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`EgySafe_Executive_Report_${new Date().toISOString().split('T')[0]}.pdf`);
      
      toast.success('Report downloaded successfully!', { id: 'pdfExport' });
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate report', { id: 'pdfExport' });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Header Actions */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-3">
            <Activity className="w-8 h-8 text-cyan" /> Workspace Overview
          </h2>
          <p className="text-neutral-400 mt-2">Threat intelligence & attack surface management metrics</p>
        </div>
        <button 
          onClick={exportPdfReport}
          disabled={isExporting}
          className="bg-white/5 border border-white/10 hover:bg-white/10 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 transition-all font-semibold disabled:opacity-50"
        >
          {isExporting ? <span className="animate-spin text-cyan">⌛</span> : <FileText className="w-4 h-4 text-cyan" />}
          {isExporting ? 'Generating...' : 'Export PDF Report'}
        </button>
      </div>

      {/* Main Dashboard Ref for PDF */}
      <div ref={dashboardRef} className="flex flex-col gap-8 bg-black p-4 rounded-xl -m-4">
        
        {/* KPI Widgets */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="cyber-glass-card p-6 flex flex-col relative overflow-hidden group border border-white/10 rounded-xl bg-gradient-to-br from-white/5 to-transparent">
            <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-100 transition-opacity"><Globe className="w-8 h-8 text-cyan" /></div>
            <p className="text-sm text-neutral-400 mb-1">Monitored Assets</p>
            <p className="text-4xl font-bold text-white">{assets.length}</p>
          </div>
          
          <div className="cyber-glass-card p-6 flex flex-col relative overflow-hidden group border border-red-500/20 rounded-xl bg-gradient-to-br from-red-500/5 to-transparent">
            <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-100 transition-opacity"><AlertTriangle className="w-8 h-8 text-red-500" /></div>
            <p className="text-sm text-neutral-400 mb-1">Active Threats</p>
            <p className="text-4xl font-bold text-red-500">2</p>
          </div>

          <div className="cyber-glass-card p-6 flex flex-col relative overflow-hidden group border border-green-500/20 rounded-xl bg-gradient-to-br from-green-500/5 to-transparent">
            <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-100 transition-opacity"><CheckCircle className="w-8 h-8 text-green-500" /></div>
            <p className="text-sm text-neutral-400 mb-1">Mitigated This Week</p>
            <p className="text-4xl font-bold text-green-500">12</p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="cyber-glass-card border border-white/10 rounded-xl p-6 bg-[#0A0A0A]">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2"><Activity className="w-5 h-5 text-cyan"/> Threat Detection Trend (7 Days)</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MOCK_THREAT_TRENDS} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCritical" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorMedium" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis dataKey="date" stroke="#888" tick={{fill: '#888'}} />
                <YAxis stroke="#888" tick={{fill: '#888'}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111', borderColor: '#333', color: '#fff', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="critical" stroke="#ef4444" fillOpacity={1} fill="url(#colorCritical)" strokeWidth={2} name="Critical Alerts" />
                <Area type="monotone" dataKey="medium" stroke="#06b6d4" fillOpacity={1} fill="url(#colorMedium)" strokeWidth={2} name="Medium/Low Alerts" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Asset Inventory Section */}
        <div className="cyber-glass-card border border-white/10 rounded-xl p-6 bg-[#0A0A0A]">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <h3 className="text-lg font-bold flex items-center gap-2"><Server className="w-5 h-5 text-cyan"/> Asset Inventory</h3>
            
            <form onSubmit={handleAddAsset} className="flex flex-col sm:flex-row gap-2 w-full md:w-auto" data-html2canvas-ignore>
              <select 
                value={assetType} 
                onChange={(e) => setAssetType(e.target.value as any)}
                className="bg-[#111] border border-white/10 text-white rounded-lg px-3 py-2 outline-none focus:border-cyan"
              >
                <option value="DOMAIN">Domain</option>
                <option value="IP">IP Address</option>
              </select>
              <input 
                type="text" 
                value={newAsset}
                onChange={(e) => setNewAsset(e.target.value)}
                placeholder="e.g. corp.example.com"
                className="bg-[#111] border border-white/10 text-white rounded-lg px-4 py-2 outline-none focus:border-cyan flex-1"
                required
              />
              <button 
                type="submit"
                className="bg-cyan/10 hover:bg-cyan/20 border border-cyan/30 text-cyan px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors font-medium whitespace-nowrap"
              >
                <Plus className="w-4 h-4" /> Add Asset
              </button>
            </form>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-neutral-500 uppercase tracking-widest text-[10px]">
                  <th className="py-4 px-4 font-semibold">Asset Value</th>
                  <th className="py-4 px-4 font-semibold">Type</th>
                  <th className="py-4 px-4 font-semibold">Status</th>
                  <th className="py-4 px-4 text-right font-semibold" data-html2canvas-ignore>Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={4} className="text-center py-8 text-neutral-500">Loading assets...</td></tr>
                ) : assets.length === 0 ? (
                  <tr><td colSpan={4} className="text-center py-8 text-neutral-500">No assets monitored yet. Add your first domain or IP.</td></tr>
                ) : (
                  assets.map((asset) => (
                    <tr key={asset.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="py-4 px-4 text-white font-medium">{asset.value}</td>
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-semibold bg-white/5 text-neutral-300 border border-white/10">
                          {asset.type}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-cyan text-xs font-medium flex items-center gap-1.5 mt-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan shadow-[0_0_8px_rgba(0,194,255,0.8)]"></span> Actively Monitored
                      </td>
                      <td className="py-4 px-4 text-right" data-html2canvas-ignore>
                        <button 
                          onClick={() => handleRemoveAsset(asset.id)}
                          className="text-neutral-500 hover:text-red-500 p-2 transition-colors"
                          title="Stop Monitoring"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
