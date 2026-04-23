import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, updateDoc, serverTimestamp, query, orderBy, limit } from 'firebase/firestore';
import { multiFactor } from 'firebase/auth';
import { db, auth } from '../lib/firebase';
import { useAuth, UserRole } from '../context/AuthContext';
import { logUserAction } from '../lib/audit';
import { Shield, Users, UserCog, Check, Smartphone, KeyRound, ShieldAlert, FileText, Download, KeySquare, Trash2, Save, Activity, AlertTriangle, Zap, Server } from 'lucide-react';
import toast from 'react-hot-toast';
import { fetchWithCsrf } from '../lib/csrf';
import MfaSetupModal from './MfaSetupModal';
import RemediationTasks from './RemediationTasks';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';

interface UserData {
  id: string;
  email: string;
  role: UserRole;
  createdAt?: any;
}

interface AuditLogData {
  id: string;
  action: string;
  details?: string;
  createdAt: any;
  userId: string;
}

export default function AdminPanel() {
  const { user, profile, loading: authLoading } = useAuth();
  const [users, setUsers] = useState<UserData[]>([]);
  const [logs, setLogs] = useState<AuditLogData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMfaModalOpen, setIsMfaModalOpen] = useState(false);
  const [enrolledFactors, setEnrolledFactors] = useState<any[]>([]);
  
  // API Keys state
  const [hasVtKey, setHasVtKey] = useState(false);
  const [vtKeyInput, setVtKeyInput] = useState('');
  const [isSavingKey, setIsSavingKey] = useState(false);

  useEffect(() => {
    if (profile?.role === 'Admin') {
      fetchUsers();
      fetchLogs();
      if (user) {
        checkVaultedKey('virustotal');
      }
    } else {
      setLoading(false);
    }
  }, [profile]);

  useEffect(() => {
    if (user) {
      try {
        const factors = multiFactor(user).enrolledFactors || [];
        setEnrolledFactors(factors);
      } catch (e) {
        console.error("MFA check failed", e);
      }
    }
  }, [user, isMfaModalOpen]);

  const checkVaultedKey = async (provider: string) => {
    if (!user) return;
    try {
      const idToken = await user.getIdToken();
      const res = await fetch(`/api/vault/keys/${user.uid}/${provider}`, {
        headers: { 'Authorization': `Bearer ${idToken}` }
      });
      const data = await res.json();
      if (data.hasKey) {
        if (provider === 'virustotal') setHasVtKey(true);
      }
    } catch (error) {
      console.error('Failed to check vaulted key', error);
    }
  };

  const saveApiKey = async (provider: string, apiKey: string) => {
    if (!user || !apiKey) return;
    setIsSavingKey(true);
    try {
      const idToken = await user.getIdToken();
      // 1. Fetch the server's public RSA key
      const pkRes = await fetch('/api/vault/public-key');
      const pkData = await pkRes.json();
      
      // 2. Client-side encryption using Web Crypto API
      // Robust PEM to DER conversion
      const cleanPem = pkData.publicKey
        .replace(/-----BEGIN PUBLIC KEY-----/g, '')
        .replace(/-----END PUBLIC KEY-----/g, '')
        .replace(/-----BEGIN RSA PUBLIC KEY-----/g, '')
        .replace(/-----END RSA PUBLIC KEY-----/g, '')
        .replace(/\s/g, '');
        
      const binaryDerString = window.atob(cleanPem);
      const binaryDer = new ArrayBuffer(binaryDerString.length);
      const uint8Array = new Uint8Array(binaryDer);
      for (let i = 0; i < binaryDerString.length; i++) {
        uint8Array[i] = binaryDerString.charCodeAt(i);
      }
      
      const cryptoKey = await window.crypto.subtle.importKey(
        "spki",
        binaryDer,
        { name: "RSA-OAEP", hash: "SHA-256" },
        true,
        ["encrypt"]
      );
      
      const encodedMessage = new TextEncoder().encode(apiKey);
      const encryptedBuffer = await window.crypto.subtle.encrypt(
        { name: "RSA-OAEP" },
        cryptoKey,
        encodedMessage
      );
      
      const encryptedBase64 = window.btoa(String.fromCharCode(...new Uint8Array(encryptedBuffer)));

      // 3. Send securely
      const res = await fetchWithCsrf('/api/vault/keys', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({ userId: user.uid, provider, encryptedKey: encryptedBase64 })
      });
      
      const data = await res.json();
      if (data.success) {
        toast.success(`${provider} API Key securely vaulted`);
        if (provider === 'virustotal') {
          setHasVtKey(true);
          setVtKeyInput('');
        }
        await logUserAction('API Key Updated', `Securely encrypted and stored ${provider} API key`);
      } else {
        throw new Error(data.error || 'Failed to securely vault key');
      }
    } catch (error: any) {
      toast.error('Failed to save key: ' + error.message);
    } finally {
      setIsSavingKey(false);
    }
  };

  const deleteApiKey = async (provider: string) => {
    if (!user) return;
    if (profile?.role !== 'Admin') {
      toast.error('Unauthorized: Admin access required to delete keys');
      return;
    }
    
    if (!window.confirm(`Are you sure you want to permanently delete the ${provider} API Key? This action cannot be undone and may break integrations.`)) {
      return;
    }

    try {
      const idToken = await user.getIdToken();
      const res = await fetchWithCsrf(`/api/vault/keys/${user.uid}/${provider}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${idToken}` }
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`${provider} API Key erased`);
        if (provider === 'virustotal') setHasVtKey(false);
        await logUserAction('API Key Deleted', `Erased ${provider} API key from vault`);
      }
    } catch (error: any) {
      toast.error('Failed to delete key: ' + error.message);
    }
  };

  const fetchUsers = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'users'));
      const fetchedUsers: UserData[] = [];
      querySnapshot.forEach((doc) => {
        fetchedUsers.push({ id: doc.id, ...doc.data() } as UserData);
      });
      setUsers(fetchedUsers);
    } catch (error: any) {
      toast.error("Failed to load users: " + error.message);
    } finally {
      if(loading) setLoading(false);
    }
  };

  const fetchLogs = async () => {
    try {
      const logsQuery = query(collection(db, 'logs'), orderBy('createdAt', 'desc'), limit(50));
      const querySnapshot = await getDocs(logsQuery);
      const fetchedLogs: AuditLogData[] = [];
      querySnapshot.forEach((doc) => {
        fetchedLogs.push({ id: doc.id, ...doc.data() } as AuditLogData);
      });
      setLogs(fetchedLogs);
    } catch (error: any) {
      console.error("Failed to load logs:", error);
    }
  };

  const handleRoleChangeFix = async (userId: string, newRole: UserRole) => {
    if (profile?.role !== 'Admin') {
      toast.error('Unauthorized: Admin access required to change user roles');
      return;
    }

    if (!window.confirm(`Are you sure you want to change this user's role to ${newRole}?`)) {
      return;
    }

    try {
      const toastId = toast.loading('Updating role...');
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, { 
        role: newRole, 
        updatedAt: serverTimestamp()
      });
      
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
      toast.success('Role updated successfully', { id: toastId });
      
      const targetUser = users.find(u => u.id === userId);
      await logUserAction('Role Update', `Role updated to ${newRole} for user ${targetUser?.email}`);
      fetchLogs();
    } catch (error: any) {
      toast.error('Failed to update role: ' + error.message);
    }
  };

  const handleUnenrollMfa = async (uid: string) => {
    if (!user) return;
    if (profile?.role !== 'Admin') {
      toast.error('Unauthorized: Admin access required to modify MFA settings');
      return;
    }

    if (!window.confirm("Are you sure you want to remove this 2FA method? This will reduce the security of your account.")) {
      return;
    }

    try {
      await multiFactor(user).unenroll(uid);
      setEnrolledFactors(multiFactor(user).enrolledFactors || []);
      toast.success('Removed 2FA method');
    } catch (error: any) {
      toast.error('Failed to remove 2FA: ' + error.message);
    }
  };

  if (authLoading || loading) {
    return <div className="py-20 text-center text-neutral-500">Loading access control...</div>;
  }

  if (profile?.role !== 'Admin') {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-center">
        <Shield className="w-16 h-16 text-neutral-400 mb-4" />
        <h2 className="text-xl font-bold dark:text-white">Access Denied</h2>
        <p className="text-neutral-500 mt-2">You must be an Administrator to view this panel.</p>
        <p className="text-sm border border-cyan/30 text-cyan px-4 py-2 mt-4 rounded">Your Current Role: {profile?.role || 'Guest'}</p>
      </div>
    );
  }

  const mockActivityData = [
    { name: 'Mon', activity: 400, alerts: 24 },
    { name: 'Tue', activity: 300, alerts: 13 },
    { name: 'Wed', activity: 450, alerts: 58 },
    { name: 'Thu', activity: 278, alerts: 39 },
    { name: 'Fri', activity: 189, alerts: 48 },
    { name: 'Sat', activity: 239, alerts: 38 },
    { name: 'Sun', activity: 349, alerts: 43 },
  ];

  const mockThreatData = [
    { name: 'W1', blocked: 40, critical: 2 },
    { name: 'W2', blocked: 55, critical: 1 },
    { name: 'W3', blocked: 80, critical: 0 },
    { name: 'W4', blocked: 27, critical: 3 },
  ];

  return (
    <div className="p-6 sm:p-10 max-w-5xl mx-auto space-y-12">
      {/* Dashboard Overview */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <Activity className="w-8 h-8 text-cyan" />
          <h2 className="text-2xl font-bold dark:text-white">Admin Dashboard</h2>
        </div>
        
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-[#111] border border-black/10 dark:border-white/10 rounded-xl p-5 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-neutral-500 font-medium mb-1">Total Users</p>
                <h3 className="text-3xl font-bold text-black dark:text-white">{users.length}</h3>
              </div>
              <div className="p-2 bg-cyan/10 rounded-lg text-cyan">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 text-xs text-green-500 flex items-center gap-1">
              <span className="font-bold">+12%</span> from last month
            </div>
          </div>

          <div className="bg-white dark:bg-[#111] border border-black/10 dark:border-white/10 rounded-xl p-5 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-neutral-500 font-medium mb-1">Active Alerts</p>
                <h3 className="text-3xl font-bold text-black dark:text-white">24</h3>
              </div>
              <div className="p-2 bg-red/10 rounded-lg text-red">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 text-xs text-red flex items-center gap-1">
              <span className="font-bold">+4</span> critical threats detected
            </div>
          </div>

          <div className="bg-white dark:bg-[#111] border border-black/10 dark:border-white/10 rounded-xl p-5 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-neutral-500 font-medium mb-1">Audit Logs</p>
                <h3 className="text-3xl font-bold text-black dark:text-white">{logs.length}+</h3>
              </div>
              <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500">
                <FileText className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 text-xs text-neutral-500">
              System events captured
            </div>
          </div>

          <div className="bg-white dark:bg-[#111] border border-black/10 dark:border-white/10 rounded-xl p-5 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-neutral-500 font-medium mb-1">System Health</p>
                <h3 className="text-3xl font-bold text-black dark:text-white">99.9%</h3>
              </div>
              <div className="p-2 bg-green-500/10 rounded-lg text-green-500">
                <Server className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 text-xs text-green-500 flex items-center gap-1">
              All infrastructure operational
            </div>
          </div>
        </div>

        {/* Charts underneath */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Activity Area Chart */}
          <div className="bg-white dark:bg-[#111] border border-black/10 dark:border-white/10 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-black dark:text-white mb-6">Traffic & Activity</h3>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockActivityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorActivity" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00E5FF" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#00E5FF" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Area type="monotone" dataKey="activity" stroke="#00E5FF" fillOpacity={1} fill="url(#colorActivity)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Threat Blocked Bar Chart */}
          <div className="bg-white dark:bg-[#111] border border-black/10 dark:border-white/10 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-black dark:text-white mb-6">Threat Mitigation</h3>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockThreatData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                    contentStyle={{ backgroundColor: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  />
                  <Bar dataKey="blocked" fill="#00E5FF" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="critical" fill="#FF3366" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* API Integrations Vault */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <KeySquare className="w-8 h-8 text-cyan" />
          <h2 className="text-2xl font-bold dark:text-white">Integration Vault</h2>
        </div>
        <p className="text-neutral-600 dark:text-neutral-400 mb-6 max-w-3xl text-sm">
          Securely vault your 3rd-party API credentials. Keys are symmetrically encrypted on the server utilizing AES-256 before being stored and are never remitted nakedly back to the client.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-[#111] border border-black/10 dark:border-white/10 rounded-xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-black dark:text-offwhite">VirusTotal API</h3>
                <p className="text-xs text-neutral-500 mt-1">Required for advanced file correlation in the incident feed.</p>
              </div>
              <div className={`px-2 py-1 rounded text-[10px] font-bold tracking-widest uppercase border ${hasVtKey ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red/10 text-red border-red/20'}`}>
                {hasVtKey ? 'VAULTED' : 'UNCONFIGURED'}
              </div>
            </div>
            
            {hasVtKey ? (
              <div className="flex items-center justify-between bg-black/5 dark:bg-white/5 p-3 rounded-lg border border-black/5 dark:border-white/5">
                <div className="text-sm font-mono text-neutral-500">
                  ••••••••••••••••••••••••••••••••
                </div>
                <button 
                  onClick={() => deleteApiKey('virustotal')}
                  className="p-2 text-red hover:bg-red/10 rounded transition-colors"
                  title="Erase Vaulted Key"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <input 
                  type="password" 
                  value={vtKeyInput}
                  onChange={(e) => setVtKeyInput(e.target.value)}
                  placeholder="Paste Enterprise v3 API Key"
                  className="w-full bg-black/5 dark:bg-[#050505] border border-black/10 dark:border-white/10 rounded-lg px-4 py-2 text-sm text-black dark:text-white placeholder:text-neutral-500 focus:outline-none focus:border-cyan"
                />
                <button 
                  onClick={() => saveApiKey('virustotal', vtKeyInput)}
                  disabled={!vtKeyInput.trim() || isSavingKey}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-cyan/10 hover:bg-cyan/20 text-cyan disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-bold text-sm transition-all"
                >
                  <Save className="w-4 h-4" />
                  {isSavingKey ? 'Encrypting...' : 'Secure & Vault Key'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Security Settings Section */}
      <div className="pt-8 border-t border-black/5 dark:border-white/5">
        <div className="flex items-center gap-3 mb-6">
          <ShieldAlert className="w-8 h-8 text-red" />
          <h2 className="text-2xl font-bold dark:text-white">Your Security Settings</h2>
        </div>
        
        <div className="bg-white dark:bg-[#0A0A0A] border border-black/10 dark:border-white/10 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h3 className="text-lg font-bold text-black dark:text-white mb-2">Two-Factor Authentication (2FA)</h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 max-w-xl">
              Add an extra layer of security to your admin account. Manage your authenticator app settings, view enrolled devices, and enforce strict login requirements.
            </p>
          </div>

          <div className="flex-shrink-0">
            <button 
              onClick={() => setIsMfaModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 bg-cyan text-black px-6 py-3 rounded-lg font-bold hover:bg-cyan/90 transition-colors shadow-[0_0_15px_rgba(0,194,255,0.2)] whitespace-nowrap w-full md:w-auto focus:outline-none focus:ring-2 focus:ring-cyan focus:ring-offset-2 focus:ring-offset-black"
            >
              <KeyRound className="w-4 h-4" /> 
              {enrolledFactors.length > 0 ? 'Manage 2FA Settings' : 'Enroll in 2FA'}
            </button>
          </div>
        </div>
      </div>

      {/* User Management Section */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <UserCog className="w-8 h-8 text-cyan" />
          <h2 className="text-2xl font-bold dark:text-white">User Role Management</h2>
        </div>

        <div className="bg-white dark:bg-[#0A0A0A] border border-black/10 dark:border-white/10 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 dark:bg-[#111] border-b border-black/5 dark:border-white/5">
                  <th className="px-6 py-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">User Account</th>
                  <th className="px-6 py-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Assigned Role</th>
                  <th className="px-6 py-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 dark:divide-white/5">
                {users.map(userItem => (
                  <tr key={userItem.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-cyan/10 flex items-center justify-center text-cyan font-bold tracking-wider uppercase text-xs">
                          {userItem.email.substring(0, 2)}
                        </div>
                        <div className="font-medium text-black dark:text-white">{userItem.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wider uppercase border 
                        ${userItem.role === 'Admin' ? 'border-purple-500/30 text-purple-500 bg-purple-500/10' : 
                          userItem.role === 'Analyst' ? 'border-cyan/30 text-cyan bg-cyan/10' : 
                          'border-neutral-500/30 text-neutral-500 bg-neutral-500/10'}`}>
                        {userItem.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <select
                        value={userItem.role}
                        onChange={(e) => handleRoleChangeFix(userItem.id, e.target.value as UserRole)}
                        className="bg-gray-50 dark:bg-[#111] border border-black/10 dark:border-white/10 rounded-lg px-3 py-1.5 text-sm text-black dark:text-white outline-none focus:border-cyan disabled:opacity-50"
                        disabled={profile?.email === userItem.email} // Prevent changing own role for safety
                      >
                        <option value="Viewer">Viewer</option>
                        <option value="Analyst">Analyst</option>
                        <option value="Admin">Admin</option>
                      </select>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-neutral-500">
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* System Logs Section */}
      <div className="pt-8 border-t border-black/5 dark:border-white/5">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <FileText className="w-8 h-8 text-cyan" />
            <h2 className="text-2xl font-bold dark:text-white">System Audit Logs</h2>
          </div>
          <button 
            onClick={fetchLogs}
            className="text-sm text-neutral-500 hover:text-black dark:hover:text-white transition-colors"
          >
            Refresh
          </button>
        </div>

        <div className="bg-white dark:bg-[#0A0A0A] border border-black/10 dark:border-white/10 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto max-h-[400px]">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-gray-100 dark:bg-[#111] border-b border-black/5 dark:border-white/5 z-10">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Timestamp</th>
                  <th className="px-6 py-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Action</th>
                  <th className="px-6 py-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 dark:divide-white/5">
                {logs.map(log => (
                  <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-sm">
                    <td className="px-6 py-4 whitespace-nowrap text-neutral-500 font-mono">
                      {log.createdAt ? new Date(log.createdAt.toDate ? log.createdAt.toDate() : log.createdAt).toLocaleString() : 'Just now'}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-black dark:text-white">{log.action}</span>
                    </td>
                    <td className="px-6 py-4 text-neutral-600 dark:text-neutral-400">
                      {log.details || '-'}
                    </td>
                  </tr>
                ))}
                {logs.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-neutral-500">
                      No logs found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {/* Remediation Tasks */}
      <RemediationTasks />
      
      {/* 2FA Setup Modal */}
      <MfaSetupModal isOpen={isMfaModalOpen} onClose={() => setIsMfaModalOpen(false)} />
    </div>
  );
}
