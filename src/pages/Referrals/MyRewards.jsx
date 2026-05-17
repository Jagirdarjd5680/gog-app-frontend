import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { useTheme } from '../../context/ThemeContext';
import { 
    Gift, 
    TrendingUp, 
    History, 
    ArrowUpRight, 
    ArrowDownLeft,
    Clock,
    CheckCircle,
    XCircle,
    Wallet
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const MyRewards = () => {
    const [withdrawals, setWithdrawals] = useState([]);
    const [stats, setStats] = useState({ points: 0, walletBalance: 0, totalReferrals: 0 });
    const [loading, setLoading] = useState(true);
    const { darkMode } = useTheme();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [statsRes, withRes] = await Promise.all([
                api.get('/referrals/stats'),
                api.get('/referrals/my-withdrawals')
            ]);
            setStats(statsRes.data.data);
            setWithdrawals(withRes.data.data);
        } catch (error) {
            toast.error('Failed to load rewards data');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className={`p-8 ${darkMode ? 'text-white' : 'text-slate-900'}`}>Loading rewards...</div>;

    return (
        <div className={`p-6 min-h-screen ${darkMode ? 'bg-[#020617] text-slate-200' : 'bg-slate-50 text-slate-700'}`}>
            <div className="mb-10">
                <h1 className={`text-3xl font-bold flex items-center gap-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                    <Gift className="text-purple-500" />
                    My Rewards
                </h1>
                <p className={`${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Track your points, earnings and withdrawals</p>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className={`border p-6 rounded-3xl relative overflow-hidden group ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-10 -mt-10 blur-2xl"></div>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                            <TrendingUp size={24} />
                        </div>
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total Points</span>
                    </div>
                    <h2 className={`text-4xl font-black mb-1 ${darkMode ? 'text-white' : 'text-slate-900'}`}>{stats.points}</h2>
                    <p className="text-xs text-slate-500">Value: ₹{(stats.points / 10).toFixed(2)}</p>
                </div>

                <div className={`border p-6 rounded-3xl relative overflow-hidden group ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-10 -mt-10 blur-2xl"></div>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                            <Wallet size={24} />
                        </div>
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Wallet Balance</span>
                    </div>
                    <h2 className={`text-4xl font-black mb-1 ${darkMode ? 'text-white' : 'text-slate-900'}`}>₹{stats.walletBalance}</h2>
                    <p className="text-xs text-slate-500">Available for withdrawal</p>
                </div>

                <div className={`border p-6 rounded-3xl relative overflow-hidden group ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full -mr-10 -mt-10 blur-2xl"></div>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500">
                            <ArrowUpRight size={24} />
                        </div>
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total Referrals</span>
                    </div>
                    <h2 className={`text-4xl font-black mb-1 ${darkMode ? 'text-white' : 'text-slate-900'}`}>{stats.totalReferrals}</h2>
                    <p className="text-xs text-slate-500">Successful invites</p>
                </div>
            </div>

            {/* Withdrawal History */}
            <div className={`border rounded-3xl overflow-hidden shadow-sm ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <div className={`p-6 border-b flex items-center justify-between ${darkMode ? 'border-slate-800 bg-slate-950/50' : 'border-slate-200 bg-slate-50'}`}>
                    <h3 className={`text-lg font-bold flex items-center gap-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                        <History size={20} className="text-slate-500" />
                        Withdrawal History
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className={`text-[10px] font-black uppercase tracking-widest ${darkMode ? 'bg-slate-950/30 text-slate-500' : 'bg-slate-100 text-slate-500'}`}>
                                <th className="px-6 py-4">Transaction Details</th>
                                <th className="px-6 py-4">Amount</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Reference</th>
                            </tr>
                        </thead>
                        <tbody className={`divide-y ${darkMode ? 'divide-slate-800' : 'divide-slate-200'}`}>
                            {withdrawals.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-20 text-center text-slate-500">
                                        <div className="flex flex-col items-center gap-2">
                                            <Clock size={40} className="opacity-20" />
                                            <p className="font-bold uppercase tracking-widest text-xs">No withdrawal history yet</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                withdrawals.map(w => (
                                    <tr key={w._id} className={`transition-colors ${darkMode ? 'hover:bg-slate-800/30' : 'hover:bg-slate-50'}`}>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                                    w.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500' : 
                                                    w.status === 'pending' ? 'bg-amber-500/10 text-amber-500' : 'bg-red-500/10 text-red-500'
                                                }`}>
                                                    {w.status === 'approved' ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                                                </div>
                                                <div>
                                                    <p className={`font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Points Redemption</p>
                                                    <p className="text-[10px] text-slate-500 font-mono">{w.upiId}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className={`font-black ${darkMode ? 'text-white' : 'text-slate-900'}`}>₹{w.amount}</p>
                                            <p className="text-[10px] text-slate-500 font-bold">{w.points} Points</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                                w.status === 'pending' ? 'bg-amber-500/10 text-amber-600' :
                                                w.status === 'approved' ? 'bg-emerald-500/10 text-emerald-600' :
                                                'bg-red-500/10 text-red-600'
                                            }`}>
                                                {w.status === 'pending' && <Clock size={12} />}
                                                {w.status === 'approved' && <CheckCircle size={12} />}
                                                {w.status === 'rejected' && <XCircle size={12} />}
                                                {w.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">
                                            {new Date(w.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            {w.transactionId ? (
                                                <span className={`text-[10px] font-mono px-2 py-1 rounded border ${darkMode ? 'bg-slate-950 border-slate-800 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-600'}`}>
                                                    {w.transactionId}
                                                </span>
                                            ) : (
                                                <span className="text-[10px] text-slate-500 italic">Processing...</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default MyRewards;
