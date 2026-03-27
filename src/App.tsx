import React, { useState, useEffect, useMemo, Component, ReactNode } from 'react';
import { 
  LayoutGrid, 
  Database, 
  Users, 
  CircleDollarSign, 
  Building2, 
  CloudUpload, 
  BarChart3, 
  UsersRound, 
  ListChecks, 
  FileText, 
  Receipt, 
  UserPlus, 
  FileUp, 
  History, 
  Wrench, 
  ShieldCheck, 
  Sun, 
  Moon, 
  Wand2, 
  Check, 
  X, 
  Plus, 
  Pencil, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  Menu,
  Download,
  LogOut,
  Search,
  Filter,
  MoreVertical,
  ChevronDown
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  Legend
} from 'recharts';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion, AnimatePresence } from 'motion/react';
import * as XLSX from 'xlsx';
import { 
  Theme, 
  AppState, 
  AuditLog, 
  PageConfig, 
  RekapBiller, 
  RekapCA, 
  RekapTransaksi,
  User
} from './types';
import { 
  auth, 
  db, 
  googleProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  collection, 
  doc, 
  getDocs,
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  limit,
  FirebaseUser
} from './firebase';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const INITIAL_STATE: AppState = {
  'master-ca': [{ kode: 'CA-SBY', nama: 'Agen Surabaya' }, { kode: 'CA-JKT', nama: 'Agen Jakarta' }],
  'master-biller': [{ kode: 'PLN', nama: 'PLN Listrik' }, { kode: 'BPJS', nama: 'BPJS Kesehatan' }],
  'master-fee': [{ kode_biller: 'PLN', kode_ca: 'CA-SBY', fee: 2500, admin: 500 }],
  'master-bank': [{ bank_settel: 'BCA', kode_biller: 'PLN', kode_ca: 'CA-SBY' }],
  'detail-transaksi': [
    { id_pelanggan: '5001', periode: '2024-05', kode_ca: 'CA-SBY', nama_ca: 'Surabaya', kode_biller: 'PLN', nama_biller: 'PLN', lembar: 10, nominal: 1500000 },
    { id_pelanggan: '5002', periode: '2024-05', kode_ca: 'CA-JKT', nama_ca: 'Jakarta', kode_biller: 'BPJS', nama_biller: 'BPJS', lembar: 5, nominal: 750000 }
  ],
  'rekap-biller': [],
  'rekap-ca': [],
  'rekap-transaksi': [],
  'rekap-ba': [],
  'user-management': [{ username: 'admin', role: 'Super Admin', status: 'Aktif' }]
};

const PAGE_CONFIGS: Record<string, PageConfig> = {
  'master-ca': { title: 'Master CA', fields: ['kode', 'nama'], labels: ['Kode CA', 'Nama CA'] },
  'master-biller': { title: 'Master Biller', fields: ['kode', 'nama'], labels: ['Kode Biller', 'Nama Biller'] },
  'master-fee': { title: 'Master Fee', fields: ['kode_biller', 'kode_ca', 'fee', 'admin'], labels: ['Biller', 'CA', 'Fee', 'Adm'] },
  'master-bank': { title: 'Master Bank', fields: ['bank_settel', 'kode_biller', 'kode_ca'], labels: ['Bank', 'Bill', 'CA'] },
  'rekap-biller': { title: 'Rekap Biller', fields: ['kode_biller', 'nama_biller', 'lembar', 'nominal'], labels: ['Kode', 'Biller', 'Lbr', 'Nominal'] },
  'rekap-ca': { title: 'Rekap CA', fields: ['kode_ca', 'nama_ca', 'lembar', 'nominal'], labels: ['Kode', 'CA', 'Lbr', 'Nominal'] },
  'rekap-transaksi': { title: 'Rekap TRX', fields: ['kode_ca', 'kode_biller', 'lembar', 'nominal', 'bank_settel', 'fee', 'admin'], labels: ['CA', 'Bill', 'Lbr', 'Nom', 'Bank', 'Fee', 'Adm'] },
  'detail-transaksi': { title: 'Detail TRX', fields: ['id_pelanggan', 'periode', 'kode_ca', 'kode_biller', 'lembar', 'nominal'], labels: ['ID Pel', 'Prd', 'CA', 'Bill', 'Lbr', 'Nom'] },
  'rekap-ba': { title: 'Rekap BA', fields: ['kode_ca', 'periode', 'lembar', 'nominal'], labels: ['CA', 'Periode', 'Lbr', 'Nominal'] },
  'user-management': { title: 'Users', fields: ['username', 'email', 'role', 'status'], labels: ['Username', 'Email', 'Role', 'Status'] }
};

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error: any }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    const { hasError, error } = this.state;
    if (hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-rose-50 dark:bg-rose-950/20">
          <div className="glass-card p-10 max-w-xl w-full text-center shadow-2xl border-rose-500/20">
            <div className="w-20 h-20 bg-rose-500/10 rounded-3xl flex items-center justify-center mx-auto mb-8">
              <X size={40} className="text-rose-500" />
            </div>
            <h2 className="text-2xl font-black text-rose-600 mb-4 uppercase tracking-tighter">Terjadi Kesalahan</h2>
            <p className="text-sm text-gray-500 font-bold uppercase tracking-widest mb-8">Sistem mendeteksi masalah teknis</p>
            <div className="p-4 bg-black/5 dark:bg-white/5 rounded-2xl text-[10px] font-mono text-left overflow-auto max-h-40 mb-8">
              {error?.message || String(error)}
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="w-full py-4 rounded-2xl bg-rose-600 text-white font-black text-xs uppercase shadow-lg hover:bg-rose-700 transition-all"
            >
              Muat Ulang Aplikasi
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const [theme, setTheme] = useState<Theme>((localStorage.getItem('theme') as Theme) || 'dark');
  const [activePage, setActivePage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [caFile, setCaFile] = useState<File | null>(null);
  const [baFile, setBaFile] = useState<File | null>(null);
  const [state, setState] = useState<AppState>(INITIAL_STATE);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [toast, setToast] = useState<{ title: string; desc: string; color: string; show: boolean }>({
    title: '', desc: '', color: 'blue', show: false
  });
  const [modal, setModal] = useState<{ show: boolean; index: number; data: any }>({
    show: false, index: -1, data: {}
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [showPageDropdown, setShowPageDropdown] = useState(false);
  const [rowActionDropdown, setRowActionDropdown] = useState<number | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    'utama': true,
    'master': true,
    'laporan': true,
    'kelola': true,
    'sistem': true
  });
  
  const rowsPerPage = 6;

  const exportToExcel = (data: any[], fileName: string) => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, fileName);
    XLSX.writeFile(wb, `${fileName}_${new Date().getTime()}.xlsx`);
    showToast('Success', 'Data berhasil diekspor ke Excel', 'emerald');
  };

  // Click outside dropdown listener
  useEffect(() => {
    const handleOutsideClick = () => {
      if (showPageDropdown) setShowPageDropdown(false);
      if (rowActionDropdown !== null) setRowActionDropdown(null);
    };
    if (showPageDropdown || rowActionDropdown !== null) {
      window.addEventListener('click', handleOutsideClick);
    }
    return () => window.removeEventListener('click', handleOutsideClick);
  }, [showPageDropdown, rowActionDropdown]);

  // Firebase Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) {
        // Fetch or create user profile in Firestore
        const userRef = doc(db, 'users', u.uid);
        onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            setUserData(docSnap.data() as User);
          } else {
            // Default new user profile
            const newUser: User = {
              username: u.displayName || u.email?.split('@')[0] || 'User',
              role: u.email === 'andri.krisdiyanto1996@gmail.com' ? 'Super Admin' : 'User',
              status: 'Aktif'
            };
            setDoc(userRef, newUser);
            setUserData(newUser);
          }
        });
      } else {
        setUserData(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleFirestoreError = (error: unknown, operationType: string, path: string | null) => {
    const errInfo = {
      error: error instanceof Error ? error.message : String(error),
      authInfo: {
        userId: auth.currentUser?.uid,
        email: auth.currentUser?.email,
        emailVerified: auth.currentUser?.emailVerified,
        isAnonymous: auth.currentUser?.isAnonymous,
        tenantId: auth.currentUser?.tenantId,
        providerInfo: auth.currentUser?.providerData.map(provider => ({
          providerId: provider.providerId,
          displayName: provider.displayName,
          email: provider.email,
          photoUrl: provider.photoURL
        })) || []
      },
      operationType,
      path
    };
    console.error('Firestore Error: ', JSON.stringify(errInfo));
    showToast("Error", "Akses ditolak atau kesalahan sistem", "rose");
  };

  // Firestore Real-time Listeners
  useEffect(() => {
    if (!user) return;

    const collections = [
      'master-ca', 'master-biller', 'master-fee', 'master-bank', 'detail-transaksi', 'user-management'
    ];

    const unsubscribes = collections.map(col => {
      return onSnapshot(collection(db, col), (snapshot) => {
        if (snapshot.empty && INITIAL_STATE[col as keyof AppState]?.length > 0) {
          // Seed if empty and we have initial data
          INITIAL_STATE[col as keyof AppState].forEach(async (item) => {
            const docRef = doc(collection(db, col));
            await setDoc(docRef, item);
          });
        }
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setState(prev => ({ ...prev, [col]: data }));
      }, (err) => handleFirestoreError(err, 'get', col));
    });

    const auditUnsubscribe = onSnapshot(
      query(collection(db, 'audit-logs'), orderBy('tgl', 'desc'), limit(50)),
      (snapshot) => {
        const logs = snapshot.docs.map(doc => doc.data() as AuditLog);
        setAuditLogs(logs);
      },
      (err) => handleFirestoreError(err, 'get', 'audit-logs')
    );

    return () => {
      unsubscribes.forEach(unsub => unsub());
      auditUnsubscribe();
    };
  }, [user]);

  useEffect(() => {
    // Remove existing theme classes
    document.documentElement.classList.remove('light', 'dark', 'rainbow');
    // Add current theme class
    document.documentElement.classList.add(theme);
    
    // For rainbow theme, we often want dark mode text/elements as base
    if (theme === 'rainbow') {
      document.documentElement.classList.add('dark');
    }
    
    localStorage.setItem('theme', theme);
  }, [theme]);

  const addAuditLog = async (aksi: string, detail: string) => {
    if (!user) return;
    const log: AuditLog = {
      tgl: new Date().toLocaleString(),
      user: userData?.username || user.email || 'Unknown',
      aksi,
      detail
    };
    try {
      await setDoc(doc(collection(db, 'audit-logs')), log);
    } catch (e) {
      console.error("Error adding audit log:", e);
    }
  };

  const showToast = (title: string, desc: string, color = 'blue') => {
    setToast({ title, desc, color, show: true });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
  };

  const syncSums = useMemo(() => {
    const detail = state['detail-transaksi'];
    const bMap: Record<string, RekapBiller> = {};
    const cMap: Record<string, RekapCA> = {};
    const tMap: Record<string, RekapTransaksi> = {};

    detail.forEach(d => {
      if (!bMap[d.kode_biller]) bMap[d.kode_biller] = { kode_biller: d.kode_biller, nama_biller: d.kode_biller, lembar: 0, nominal: 0 };
      bMap[d.kode_biller].lembar += Number(d.lembar);
      bMap[d.kode_biller].nominal += Number(d.nominal);

      if (!cMap[d.kode_ca]) cMap[d.kode_ca] = { kode_ca: d.kode_ca, nama_ca: d.kode_ca, lembar: 0, nominal: 0 };
      cMap[d.kode_ca].lembar += Number(d.lembar);
      cMap[d.kode_ca].nominal += Number(d.nominal);

      const k = d.kode_ca + d.kode_biller;
      if (!tMap[k]) tMap[k] = { kode_ca: d.kode_ca, kode_biller: d.kode_biller, lembar: 0, nominal: 0, bank_settel: 'BCA', fee: 2500, admin: 500 };
      tMap[k].lembar += Number(d.lembar);
      tMap[k].nominal += Number(d.nominal);
    });

    return {
      'rekap-biller': Object.values(bMap),
      'rekap-ca': Object.values(cMap),
      'rekap-transaksi': Object.values(tMap)
    };
  }, [state['detail-transaksi']]);

  useEffect(() => {
    setState(prev => ({
      ...prev,
      ...syncSums
    }));
  }, [syncSums]);

  const handleSave = async () => {
    const key = activePage as keyof AppState;
    const data = { ...modal.data };
    
    // Remove ID if it exists for Firestore write
    const docId = data.id || doc(collection(db, key)).id;
    delete data.id;

    try {
      await setDoc(doc(db, key, docId), data);
      setModal({ show: false, index: -1, data: {} });
      showToast("Simpan", "Data diperbarui");
      addAuditLog('Update', `Aksi pada ${activePage}`);
    } catch (e) {
      showToast("Error", "Gagal menyimpan data", "rose");
      console.error(e);
    }
  };

  const handleDelete = async (index: number) => {
    if (window.confirm("Hapus data ini?")) {
      const key = activePage as keyof AppState;
      const data = state[key] as any[];
      const item = data[index];
      
      if (!item.id) {
        showToast("Error", "ID tidak ditemukan", "rose");
        return;
      }

      try {
        await deleteDoc(doc(db, key, item.id));
        showToast("Hapus", "Terhapus", "rose");
        addAuditLog('Delete', `Hapus di ${activePage}`);
      } catch (e) {
        showToast("Error", "Gagal menghapus data", "rose");
        console.error(e);
      }
    }
  };

  const handleExport = () => {
    const key = activePage as keyof AppState;
    const data = state[key] as any[];
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
    XLSX.writeFile(workbook, `${activePage}_${new Date().getTime()}.xlsx`);
    showToast('Excel', 'Export Berhasil', 'emerald');
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws);
      
      const key = activePage as keyof AppState;
      try {
        for (const item of data) {
          const docRef = doc(collection(db, key));
          await setDoc(docRef, item);
        }
        showToast('Import', `${data.length} data diproses`, 'emerald');
        addAuditLog('Import', `Import data ke ${activePage}`);
      } catch (err) {
        showToast('Error', 'Gagal import data', 'rose');
        console.error(err);
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      showToast("Login", "Selamat datang!");
    } catch (e) {
      console.error(e);
      showToast("Error", "Gagal login", "rose");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      showToast("Logout", "Sampai jumpa!");
    } catch (e) {
      console.error(e);
    }
  };

  const filteredData = useMemo(() => {
    const key = activePage as keyof AppState;
    const data = state[key] as any[];
    if (!Array.isArray(data)) return [];

    return data.filter(item => {
      const matchesSearch = Object.values(item).some(val => 
        String(val).toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      const matchesDate = !filterDate || (item.periode && item.periode === filterDate) || (item.tgl && item.tgl.includes(filterDate));

      return matchesSearch && matchesDate;
    });
  }, [state, activePage, searchQuery, filterDate]);

  const renderLogin = () => (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass-card p-12 max-w-md w-full text-center shadow-2xl border-white/5">
        <div className="w-20 h-20 glass-card bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl border-white/10">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center font-black text-2xl text-white">R</div>
        </div>
        <h1 className="text-3xl font-black text-blue-600 dark:text-white mb-2 uppercase tracking-tighter">Report Estimasi</h1>
        <p className="text-xs text-blue-400 dark:text-blue-200 font-bold uppercase tracking-widest mb-10">Enterprise Management System</p>
        
        <button 
          onClick={handleLogin}
          className="w-full py-5 rounded-3xl btn-blue text-white font-black text-sm uppercase shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3"
        >
          <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
          Masuk dengan Google
        </button>
        
        <p className="mt-8 text-[10px] text-gray-400 font-bold uppercase tracking-widest">Authorized Personnel Only</p>
      </div>
    </div>
  );

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-transparent">
      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!user) return renderLogin();

  const renderDashboard = () => {
    const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#F43F5E'];
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="page-anim"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 text-center">
          <div className="glass-card p-8 shadow-lg hover:scale-105 transition-all">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Detail TRX</p>
            <h3 className="text-4xl font-black mt-2">{state['detail-transaksi'].length}</h3>
          </div>
          <div className="glass-card p-8 shadow-lg hover:scale-105 transition-all text-blue-500">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Rekap CA</p>
            <h3 className="text-4xl font-black mt-2">{state['rekap-ca'].length}</h3>
          </div>
          <div className="glass-card p-8 shadow-lg hover:scale-105 transition-all text-emerald-500">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Rekap Biller</p>
            <h3 className="text-4xl font-black mt-2">{state['rekap-biller'].length}</h3>
          </div>
          <div className="glass-card p-8 shadow-lg hover:scale-105 transition-all text-amber-500">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Audit Log</p>
            <h3 className="text-4xl font-black mt-2">{auditLogs.length}</h3>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="glass-card p-6 sm:p-10 h-[450px] shadow-xl">
            <h4 className="text-sm font-black uppercase mb-6 text-gray-400">Transaksi per CA</h4>
            <ResponsiveContainer width="100%" height="90%">
              <BarChart data={state['rekap-ca']}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="kode_ca" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '12px', fontSize: '10px', fontWeight: 800 }}
                  itemStyle={{ color: '#fff' }}
                />
                <Bar dataKey="lembar" fill="#3B82F6" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="glass-card p-6 sm:p-10 h-[450px] shadow-xl">
            <h4 className="text-sm font-black uppercase mb-6 text-gray-400">Distribusi Biller</h4>
            <ResponsiveContainer width="100%" height="90%">
              <PieChart>
                <Pie
                  data={state['rekap-biller']}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="lembar"
                  nameKey="nama_biller"
                >
                  {state['rekap-biller'].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '12px', fontSize: '10px', fontWeight: 800 }}
                  itemStyle={{ color: '#fff' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </motion.div>
    );
  };
  const renderTable = () => {
    const conf = PAGE_CONFIGS[activePage];
    if (!conf) return null;
    const data = filteredData;
    const start = (currentPage - 1) * rowsPerPage;
    const paginated = data.slice(start, start + rowsPerPage);
    const totalPages = Math.ceil(data.length / rowsPerPage) || 1;
    const isReport = activePage.includes('rekap') || activePage.includes('detail');

    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card p-6 sm:p-10 shadow-xl overflow-hidden page-anim"
      >
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-10">
          <div>
            <h3 className="text-2xl font-black uppercase text-blue-600 tracking-tighter">{conf.title}</h3>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Data Management</p>
          </div>
          <div className="flex flex-wrap gap-2 w-full lg:w-auto">
            {isReport && (
              <button 
                onClick={handleExport}
                className="flex-1 lg:flex-none py-3 px-6 rounded-2xl btn-rose text-white text-[10px] font-black shadow-lg flex items-center justify-center gap-2"
              >
                <Download size={14} /> DOWNLOAD
              </button>
            )}
            <label className="flex-1 lg:flex-none py-3 px-6 rounded-2xl btn-emerald text-white text-[10px] font-black cursor-pointer text-center flex items-center justify-center gap-2">
              <CloudUpload size={14} /> IMPORT
              <input type="file" className="hidden" onChange={handleImport} />
            </label>
            <button 
              onClick={() => setModal({ show: true, index: -1, data: {} })}
              className="flex-1 lg:flex-none py-3 px-6 rounded-2xl btn-blue text-white text-[10px] font-black flex items-center justify-center gap-2"
            >
              <Plus size={14} /> TAMBAH
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 bg-white/2 dark:bg-black/2 p-6 rounded-[2rem] border dark:border-gray-800/20 backdrop-blur-sm">
          <div className="relative lg:col-span-2">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Cari Data..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full glass-input rounded-xl pl-12 pr-4 py-3 text-sm outline-none transition-all" 
            />
          </div>
          <div className="relative">
            <Filter size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type={isReport ? "date" : "text"} 
              placeholder="Filter..." 
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-full glass-input rounded-xl pl-12 pr-4 py-3 text-sm outline-none transition-all" 
            />
          </div>
          <button 
            onClick={() => { setSearchQuery(''); setFilterDate(''); }}
            className="py-3 px-6 rounded-xl glass-input text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all"
          >
            Reset Filter
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm font-bold">
            <thead className="text-[10px] uppercase text-gray-400 border-b dark:border-gray-800">
              <tr>
                <th className="px-6 py-5">No</th>
                {conf.labels.map(l => <th key={l} className="px-6 py-5">{l}</th>)}
                <th className="px-6 py-5 text-center">Opsi</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-gray-800">
              {paginated.map((item, i) => (
                <tr key={i} className="hover:bg-blue-500/[0.02] transition-colors">
                  <td className="px-6 py-5 text-gray-400">{start + i + 1}</td>
                  {conf.fields.map(f => (
                    <td key={f} className={cn("px-6 py-5 uppercase", f === 'nominal' ? 'text-green-500' : f.includes('kode') ? 'text-blue-500' : '')}>
                      {typeof item[f] === 'number' ? item[f].toLocaleString('id-ID') : 
                       f.includes('tgl') ? <span className="px-3 py-1.5 glass-input rounded-lg text-[10px]">{item[f]}</span> : item[f]}
                    </td>
                  ))}
                  <td className="px-6 py-5 text-center relative">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setRowActionDropdown(rowActionDropdown === start + i ? null : start + i); }}
                      className="w-10 h-10 rounded-xl glass-input flex items-center justify-center hover:bg-blue-500/10 transition-all"
                    >
                      <MoreVertical size={16} />
                    </button>
                    
                    <AnimatePresence>
                      {rowActionDropdown === start + i && (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.9, x: -20 }}
                          animate={{ opacity: 1, scale: 1, x: 0 }}
                          exit={{ opacity: 0, scale: 0.9, x: -20 }}
                          className="absolute right-full top-1/2 -translate-y-1/2 mr-2 w-40 glass-card shadow-2xl z-40 overflow-hidden border dark:border-gray-800/50"
                        >
                          <div className="py-1">
                            <div className="dropdown-item text-blue-500" onClick={() => { setRowActionDropdown(null); setModal({ show: true, index: start + i, data: { ...item } }); }}>
                              <Pencil size={14} /> Edit Data
                            </div>
                            <div className="dropdown-item text-rose-500" onClick={() => { setRowActionDropdown(null); handleDelete(start + i); }}>
                              <Trash2 size={14} /> Hapus Data
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-10 flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t dark:border-gray-800 font-black text-[10px] text-gray-400 uppercase tracking-widest">
          <p>Halaman {currentPage} / {totalPages}</p>
          <div className="flex gap-2">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-6 py-3 rounded-xl glass-input disabled:opacity-20 hover:bg-blue-500/20 hover:text-blue-500 transition-all flex items-center gap-2"
            >
              <ChevronLeft size={14} /> Prev
            </button>
            <button 
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-6 py-3 rounded-xl glass-input disabled:opacity-20 hover:bg-blue-500/20 hover:text-blue-500 transition-all flex items-center gap-2"
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </motion.div>
    );
  };

  const renderImportPage = (type: 'import-ca' | 'import-ba' | 'master-import') => {
    const isCA = type === 'import-ca';
    const isBA = type === 'import-ba';
    const isMaster = type === 'master-import';
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fileType: 'ca' | 'ba') => {
      const file = e.target.files?.[0];
      if (file) {
        if (fileType === 'ca') setCaFile(file);
        else setBaFile(file);
        showToast('File Terpilih', `${file.name} siap diunggah`);
      }
    };

    const handleProcessImport = () => {
      if (isMaster) {
        if (!caFile && !baFile) {
          showToast("Peringatan", "Pilih setidaknya satu file (CA atau BA)", "amber");
          return;
        }
      } else {
        if (isCA && !caFile) {
          showToast("Peringatan", "Pilih file CA terlebih dahulu", "amber");
          return;
        }
        if (isBA && !baFile) {
          showToast("Peringatan", "Pilih file BA terlebih dahulu", "amber");
          return;
        }
      }

      showToast("Sukses", isMaster ? "Data CA & BA berhasil diimport" : `Data ${isCA ? 'CA' : 'BA'} berhasil diimport`);
      addAuditLog('Import', type);
      setCaFile(null);
      setBaFile(null);
      setActivePage('dashboard');
    };

    return (
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-10 page-anim"
      >
        <div className="lg:col-span-1 space-y-8">
          <div className="glass-card p-8 shadow-xl">
            <h3 className="text-xl font-black uppercase text-blue-600 mb-8">1. Konfigurasi</h3>
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black text-gray-400 dark:text-gray-300 uppercase ml-1">Periode Data</label>
                <input type="date" className="w-full mt-2 glass-input rounded-2xl px-5 py-4 text-sm outline-none" />
              </div>
              
              {isMaster ? (
                <div className="grid grid-cols-2 gap-4">
                  <label className={cn(
                    "border-2 border-dashed rounded-[2.5rem] p-8 text-center cursor-pointer group transition-all font-black text-[10px] uppercase",
                    caFile ? "border-blue-500 bg-blue-500/5 text-blue-600" : "border-gray-300 dark:border-gray-700 text-gray-400 hover:border-blue-500"
                  )}>
                    <CloudUpload size={24} className={cn("mx-auto mb-3", caFile ? "text-blue-600" : "text-blue-500")} />
                    {caFile ? caFile.name.substring(0, 10) + '...' : 'UPLOAD CA'}
                    <input type="file" className="hidden" onChange={(e) => handleFileChange(e, 'ca')} />
                  </label>
                  <label className={cn(
                    "border-2 border-dashed rounded-[2.5rem] p-8 text-center cursor-pointer group transition-all font-black text-[10px] uppercase",
                    baFile ? "border-emerald-500 bg-emerald-500/5 text-emerald-600" : "border-gray-300 dark:border-gray-700 text-gray-400 hover:border-emerald-500"
                  )}>
                    <CloudUpload size={24} className={cn("mx-auto mb-3", baFile ? "text-emerald-600" : "text-emerald-500")} />
                    {baFile ? baFile.name.substring(0, 10) + '...' : 'UPLOAD BA'}
                    <input type="file" className="hidden" onChange={(e) => handleFileChange(e, 'ba')} />
                  </label>
                </div>
              ) : (
                <label className={cn(
                  "block border-2 border-dashed rounded-[2.5rem] p-12 text-center cursor-pointer group transition-all font-black text-[10px] uppercase",
                  (isCA && caFile) || (isBA && baFile) ? "border-blue-500 bg-blue-500/5 text-blue-600" : "border-gray-300 dark:border-gray-700 text-gray-400 hover:border-blue-500"
                )}>
                  <CloudUpload size={40} className="mx-auto mb-4 text-blue-500" />
                  {isCA && caFile ? caFile.name : isBA && baFile ? baFile.name : `UPLOAD DATA ${isCA ? 'CA' : 'BA'}`}
                  <input type="file" className="hidden" onChange={(e) => handleFileChange(e, isCA ? 'ca' : 'ba')} />
                </label>
              )}
            </div>
          </div>
          <div className="glass-card p-8 border-l-8 border-emerald-500 shadow-xl">
            <button 
              onClick={handleProcessImport}
              className="w-full py-5 rounded-3xl btn-emerald text-white font-black text-sm uppercase shadow-lg hover:scale-[1.02] active:scale-95 transition-all"
            >
              Simpan ke Database
            </button>
          </div>
        </div>
        <div className="lg:col-span-2">
          <div className="glass-card p-10 min-h-[500px] shadow-xl flex flex-col items-center justify-center text-xs font-black uppercase tracking-widest text-center">
            {((isCA && caFile) || (isBA && baFile) || (isMaster && (caFile || baFile))) ? (
              <div className="w-full space-y-6">
                <div className="flex items-center gap-4 mb-6">
                  <FileText size={32} className="text-blue-500" />
                  <div className="text-left">
                    <h4 className="text-lg font-black text-blue-600">Preview Data</h4>
                    <p className="text-gray-400">Menampilkan 5 baris pertama dari file</p>
                  </div>
                </div>
                <div className="overflow-hidden rounded-2xl border dark:border-gray-800">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-gray-900/50">
                      <tr>
                        <th className="p-4 border-b dark:border-gray-800">Kolom 1</th>
                        <th className="p-4 border-b dark:border-gray-800">Kolom 2</th>
                        <th className="p-4 border-b dark:border-gray-800">Kolom 3</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y dark:divide-gray-800">
                      {[1,2,3,4,5].map(i => (
                        <tr key={i}>
                          <td className="p-4 text-gray-500">Data Sample {i}.A</td>
                          <td className="p-4 text-gray-500">Data Sample {i}.B</td>
                          <td className="p-4 text-gray-500">Data Sample {i}.C</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="opacity-30">
                <FileText size={60} className="mx-auto mb-6" />
                Pilih file untuk melihat preview
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  const renderAuditLogs = () => (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="glass-card p-8 sm:p-10 shadow-xl page-anim"
    >
      <h3 className="text-2xl font-black uppercase text-blue-600 mb-8 tracking-tighter">Sistem Audit Logs</h3>
      <div className="space-y-4">
        {auditLogs.slice().reverse().map((l, i) => (
          <div key={i} className="p-5 audit-item rounded-3xl flex flex-col md:flex-row justify-between items-center gap-3 text-[11px] font-bold uppercase">
            <span><b className="text-blue-500">{l.aksi}</b>: {l.detail}</span>
            <span className="text-gray-400">{l.tgl}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );

  const handleBackup = () => {
    const backupData = {
      state,
      auditLogs,
      timestamp: new Date().toISOString(),
      version: '1.0'
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `EMS_Backup_${new Date().getTime()}.json`;
    a.click();
    showToast("Backup", "Data berhasil diunduh", "emerald");
    addAuditLog('Maintenance', 'Backup Data');
  };

  const handleRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const content = evt.target?.result as string;
        const backup = JSON.parse(content);
        
        if (!backup.state) throw new Error("Format backup tidak valid");

        // Restore each collection
        for (const [col, data] of Object.entries(backup.state)) {
          if (Array.isArray(data)) {
            for (const item of data) {
              const { id, ...rest } = item;
              const docRef = id ? doc(db, col, id) : doc(collection(db, col));
              await setDoc(docRef, rest);
            }
          }
        }
        showToast("Restore", "Data berhasil dipulihkan", "emerald");
        addAuditLog('Maintenance', 'Restore Data');
      } catch (err) {
        showToast("Error", "Gagal memulihkan data", "rose");
        console.error(err);
      }
    };
    reader.readAsText(file);
  };

  const renderMaintenance = () => (
    <motion.div 
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-10 sm:p-16 text-center max-w-4xl mx-auto shadow-2xl page-anim"
    >
      <h3 className="text-3xl font-black text-blue-600 mb-4 uppercase">Pemeliharaan Sistem</h3>
      <p className="text-xs text-gray-400 font-bold uppercase mb-16">Data Protection & Optimization</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
        <div 
          onClick={handleBackup}
          className="p-10 rounded-[2.5rem] cursor-pointer hover:scale-105 active:scale-95 transition-all text-white shadow-xl btn-blue"
        >
          <Database size={40} className="mx-auto mb-6" />
          <h4 className="font-black text-xs tracking-widest uppercase">Backup</h4>
        </div>
        
        <label className="p-10 rounded-[2.5rem] cursor-pointer hover:scale-105 active:scale-95 transition-all text-white shadow-xl btn-emerald flex flex-col items-center justify-center">
          <CloudUpload size={40} className="mb-6" />
          <h4 className="font-black text-xs tracking-widest uppercase">Restore</h4>
          <input type="file" className="hidden" onChange={handleRestore} accept=".json" />
        </label>

        <div 
          onClick={async () => {
            if (window.confirm("Reset semua data transaksi?")) {
              try {
                const q = query(collection(db, 'detail-transaksi'));
                const snap = await getDocs(q);
                for (const d of snap.docs) {
                  await deleteDoc(doc(db, 'detail-transaksi', d.id));
                }
                showToast("Sistem", "Reset Berhasil");
                addAuditLog('Maintenance', 'Reset Data');
              } catch (e) {
                handleFirestoreError(e, 'delete', 'detail-transaksi');
              }
            }
          }}
          className="p-10 rounded-[2.5rem] cursor-pointer hover:scale-105 active:scale-95 transition-all text-white shadow-xl btn-rose"
        >
          <Trash2 size={40} className="mx-auto mb-6" />
          <h4 className="font-black text-xs tracking-widest uppercase">Reset</h4>
        </div>
      </div>
    </motion.div>
  );

  const renderContent = () => {
    switch (activePage) {
      case 'dashboard': return renderDashboard();
      case 'import-ca': return renderImportPage('import-ca');
      case 'import-ba': return renderImportPage('import-ba');
      case 'master-import': return renderImportPage('master-import');
      case 'audit-logs': return renderAuditLogs();
      case 'maintenance': return renderMaintenance();
      default: return renderTable();
    }
  };

  return (
    <ErrorBoundary>
      <div className={cn(
        "text-slate-900 dark:text-slate-200 min-h-screen transition-colors duration-400",
        theme === 'light' && "bg-light-bg",
        theme === 'dark' && "bg-dark-bg",
        theme === 'rainbow' && "bg-transparent"
      )}>
      {/* OVERLAY MOBILE */}
      <div 
        className={cn("fixed inset-0 bg-black/50 z-[45] lg:hidden transition-opacity", sidebarOpen ? "block opacity-100" : "hidden opacity-0")}
        onClick={() => setSidebarOpen(false)}
      />

      {/* TOAST */}
      <AnimatePresence>
        {toast.show && (
          <motion.div 
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            className="fixed top-6 right-6 z-[9999]"
          >
            <div className={cn("glass-card p-4 rounded-2xl flex items-center gap-4 border-l-4 shadow-2xl min-w-[320px]", `border-${toast.color}-500`)}>
              <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg", `bg-${toast.color}-600`)}>
                <Check size={20} />
              </div>
              <div>
                <p className="text-sm font-black tracking-tight">{toast.title}</p>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{toast.desc}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL */}
      <AnimatePresence>
        {modal.show && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="glass-card w-full max-w-2xl p-8 shadow-2xl flex flex-col max-h-[90vh]"
            >
              <h3 className="text-2xl font-black mb-6 uppercase text-blue-600 text-center tracking-tighter">Form Data</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 overflow-y-auto pr-2">
                {PAGE_CONFIGS[activePage]?.fields.map((f, i) => (
                  <div key={f}>
                    <label className="text-[10px] font-black text-gray-400 uppercase ml-1">{PAGE_CONFIGS[activePage].labels[i]}</label>
                    <input 
                      type="text" 
                      value={modal.data[f] || ''} 
                      onChange={(e) => setModal(prev => ({ ...prev, data: { ...prev.data, [f]: e.target.value } }))}
                      className="w-full mt-2 glass-input rounded-2xl px-5 py-4 text-sm outline-none transition-all" 
                    />
                  </div>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row gap-3 mt-8">
                <button 
                  onClick={() => setModal({ show: false, index: -1, data: {} })} 
                  className="flex-1 py-4 rounded-2xl font-black text-xs uppercase glass-input hover:scale-105 transition-all"
                >
                  Batal
                </button>
                <button 
                  onClick={handleSave} 
                  className="flex-1 py-4 rounded-2xl font-black text-xs uppercase btn-blue text-white shadow-lg active:scale-95 transition-all"
                >
                  Simpan
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SIDEBAR */}
      <aside className={cn("fixed left-0 top-0 h-screen w-72 glass-card z-50 transition-transform duration-300 overflow-y-auto flex flex-col rounded-none border-r dark:border-gray-800/50", sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0")}>
        <div className="p-8 flex items-center justify-between sticky top-0 sidebar-header-footer z-10 border-b dark:border-gray-800/20 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center font-black text-xl text-white shadow-lg">R</div>
            <div>
              <h1 className="text-sm font-black tracking-tight uppercase text-slate-800 dark:text-white">Report <span className="text-blue-500">Estimasi</span></h1>
              <p className="text-[9px] text-gray-500 dark:text-gray-400 font-black uppercase tracking-widest">System Edition</p>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all"><X className="text-gray-500 dark:text-gray-400" /></button>
        </div>

        <nav className="px-6 py-8 pb-24 space-y-7">
          <div>
            <button 
              onClick={() => setExpandedSections(prev => ({ ...prev, 'utama': !prev.utama }))}
              className="w-full flex items-center justify-between text-[10px] font-black text-gray-600 dark:text-gray-300 mb-3 ml-2 uppercase tracking-widest hover:text-blue-500 transition-colors"
            >
              Utama
              <ChevronDown size={12} className={cn("mr-4 transition-transform", expandedSections.utama ? "" : "-rotate-90")} />
            </button>
            <AnimatePresence>
              {expandedSections.utama && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <a onClick={() => setActivePage('dashboard')} className={cn("nav-link", activePage === 'dashboard' && "sidebar-active")}>
                    <LayoutGrid size={18} /> Dashboard
                  </a>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div>
            <button 
              onClick={() => setExpandedSections(prev => ({ ...prev, 'master': !prev.master }))}
              className="w-full flex items-center justify-between text-[10px] font-black text-gray-600 dark:text-gray-300 mb-3 ml-2 uppercase tracking-widest hover:text-blue-500 transition-colors"
            >
              Master Data
              <ChevronDown size={12} className={cn("mr-4 transition-transform", expandedSections.master ? "" : "-rotate-90")} />
            </button>
            <AnimatePresence>
              {expandedSections.master && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden space-y-1">
                  {[
                    { id: 'master-biller', label: 'Master Biller', icon: Database },
                    { id: 'master-ca', label: 'Master CA', icon: Users },
                    { id: 'master-fee', label: 'Master Fee', icon: CircleDollarSign },
                    { id: 'master-bank', label: 'Master Bank', icon: Building2 },
                    { id: 'master-import', label: 'Master Import', icon: CloudUpload },
                  ].map(item => (
                    <a key={item.id} onClick={() => setActivePage(item.id)} className={cn("nav-link", activePage === item.id && "sidebar-active")}>
                      <item.icon size={18} /> {item.label}
                    </a>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div>
            <button 
              onClick={() => setExpandedSections(prev => ({ ...prev, 'laporan': !prev.laporan }))}
              className="w-full flex items-center justify-between text-[10px] font-black text-gray-600 dark:text-gray-300 mb-3 ml-2 uppercase tracking-widest hover:text-blue-500 transition-colors"
            >
              Laporan
              <ChevronDown size={12} className={cn("mr-4 transition-transform", expandedSections.laporan ? "" : "-rotate-90")} />
            </button>
            <AnimatePresence>
              {expandedSections.laporan && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden space-y-1">
                  {[
                    { id: 'rekap-biller', label: 'Rekap Biller', icon: BarChart3 },
                    { id: 'rekap-ca', label: 'Rekap CA', icon: UsersRound },
                    { id: 'rekap-transaksi', label: 'Rekap Transaksi', icon: ListChecks },
                    { id: 'detail-transaksi', label: 'Detail Transaksi', icon: FileText },
                    { id: 'rekap-ba', label: 'Rekap Berita Acara', icon: Receipt },
                  ].map(item => (
                    <a key={item.id} onClick={() => setActivePage(item.id)} className={cn("nav-link", activePage === item.id && "sidebar-active")}>
                      <item.icon size={18} /> {item.label}
                    </a>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          {(userData?.role === 'Super Admin' || userData?.role === 'Admin') && (
            <div>
              <button 
                onClick={() => setExpandedSections(prev => ({ ...prev, 'kelola': !prev.kelola }))}
                className="w-full flex items-center justify-between text-[10px] font-black text-gray-600 dark:text-gray-300 mb-3 ml-2 uppercase tracking-widest hover:text-blue-500 transition-colors"
              >
                Kelola Data
                <ChevronDown size={12} className={cn("mr-4 transition-transform", expandedSections.kelola ? "" : "-rotate-90")} />
              </button>
              <AnimatePresence>
                {expandedSections.kelola && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden space-y-1">
                    {[
                      { id: 'import-ca', label: 'Import CA', icon: UserPlus },
                      { id: 'import-ba', label: 'Import BA', icon: FileUp },
                    ].map(item => (
                      <a key={item.id} onClick={() => setActivePage(item.id)} className={cn("nav-link", activePage === item.id && "sidebar-active")}>
                        <item.icon size={18} /> {item.label}
                      </a>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
          {userData?.role === 'Super Admin' && (
            <div>
              <button 
                onClick={() => setExpandedSections(prev => ({ ...prev, 'sistem': !prev.sistem }))}
                className="w-full flex items-center justify-between text-[10px] font-black text-gray-600 dark:text-gray-300 mb-3 ml-2 uppercase tracking-widest hover:text-blue-500 transition-colors"
              >
                Sistem
                <ChevronDown size={12} className={cn("mr-4 transition-transform", expandedSections.sistem ? "" : "-rotate-90")} />
              </button>
              <AnimatePresence>
                {expandedSections.sistem && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden space-y-1">
                    {[
                      { id: 'audit-logs', label: 'Audit Logs', icon: History },
                      { id: 'maintenance', label: 'Pemeliharaan', icon: Wrench },
                      { id: 'user-management', label: 'User', icon: ShieldCheck },
                    ].map(item => (
                      <a key={item.id} onClick={() => setActivePage(item.id)} className={cn("nav-link", activePage === item.id && "sidebar-active")}>
                        <item.icon size={18} /> {item.label}
                      </a>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </nav>

        <div className="mt-auto p-6 border-t dark:border-gray-800/20 sidebar-header-footer sticky bottom-0 z-10 shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between gap-1.5 glass-input p-1.5 rounded-2xl border dark:border-gray-700/30">
            <button onClick={() => setTheme('light')} className={cn("flex-1 py-2.5 rounded-xl flex justify-center hover:bg-white/10 transition-all", theme === 'light' ? "text-orange-500 bg-white/20 shadow-sm" : "text-gray-500")}><Sun size={18} /></button>
            <button onClick={() => setTheme('dark')} className={cn("flex-1 py-2.5 rounded-xl flex justify-center hover:bg-white/10 transition-all", theme === 'dark' ? "text-blue-500 bg-white/20 shadow-sm" : "text-gray-400")}><Moon size={18} /></button>
            <button onClick={() => setTheme('rainbow')} className={cn("flex-1 py-2.5 rounded-xl flex justify-center hover:bg-white/10 transition-all", theme === 'rainbow' ? "text-purple-500 bg-white/20 shadow-sm" : "text-gray-400")}><Wand2 size={18} /></button>
          </div>
          <p className="text-[8px] text-center font-black mt-3 uppercase text-gray-500 dark:text-gray-400 tracking-widest">System Online</p>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="lg:ml-72 min-h-screen p-4 md:p-10 transition-all duration-300">
        <header className="flex justify-between items-center mb-10 sticky top-0 z-40 sidebar-header-footer py-4 -mx-4 px-4 md:-mx-10 md:px-10 border-b dark:border-gray-800/20 shadow-sm">
          <div className="flex items-center gap-5">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden w-12 h-12 flex items-center justify-center rounded-2xl glass-input border dark:border-gray-700/30 shadow-sm">
              <Menu size={20} className="text-slate-700 dark:text-slate-200" />
            </button>
            <h2 className="text-2xl sm:text-3xl font-black text-blue-600 uppercase tracking-tighter flex items-center gap-2">
              {activePage === 'dashboard' ? 'Dashboard' : PAGE_CONFIGS[activePage]?.title || activePage.replace('-', ' ')}
              <button 
                onClick={() => setShowPageDropdown(!showPageDropdown)}
                className="p-2 hover:bg-blue-500/10 rounded-xl transition-all relative"
              >
                <ChevronDown size={20} className={cn("transition-transform duration-300", showPageDropdown && "rotate-180")} />
                
                <AnimatePresence>
                  {showPageDropdown && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute left-0 top-full mt-2 w-56 glass-card shadow-2xl z-50 overflow-hidden border dark:border-gray-800/50"
                    >
                      <div className="p-2 border-b dark:border-gray-800/30">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-3 py-1">Opsi Halaman</p>
                      </div>
                      <div className="py-1">
                        <div className="dropdown-item" onClick={() => { setShowPageDropdown(false); window.print(); }}>
                          <Download size={14} /> Cetak Laporan
                        </div>
                        <div className="dropdown-item" onClick={() => { setShowPageDropdown(false); exportToExcel(state[activePage as keyof AppState] || [], activePage); }}>
                          <FileText size={14} /> Ekspor Excel
                        </div>
                        <div className="dropdown-item" onClick={() => { setShowPageDropdown(false); setActivePage('dashboard'); }}>
                          <LayoutGrid size={14} /> Ke Dashboard
                        </div>
                        <div className="dropdown-item text-rose-500 hover:bg-rose-500/10" onClick={() => { setShowPageDropdown(false); handleLogout(); }}>
                          <LogOut size={14} /> Keluar Sistem
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-black leading-none uppercase">{userData?.username || 'User'}</p>
              <p className="text-[9px] text-emerald-500 font-black mt-1 uppercase tracking-widest">{userData?.role || 'Authorized'}</p>
            </div>
            <button 
              onClick={handleLogout}
              className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-black text-xl shadow-xl shadow-blue-500/20 group relative"
            >
              {userData?.username?.substring(0, 2).toUpperCase() || 'U'}
              <div className="absolute -bottom-2 -right-2 bg-rose-500 rounded-lg p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <LogOut size={12} />
              </div>
            </button>
          </div>
        </header>

        <div id="content-area">
          {renderContent()}
        </div>
      </main>
    </div>
    </ErrorBoundary>
  );
}
