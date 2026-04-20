import { useEffect, useState } from 'react';
import { useAppStore } from '../store/store';
import { Trash2, Shield, Users as UsersIcon, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useToast } from '../components/ui/Toast';

export default function AdminPanel() {
    const { adminData, fetchAdminData, deleteAnyPost, user } = useAppStore();
    const { t } = useTranslation();
    const { show } = useToast();
    const [deletingId, setDeletingId] = useState(null);

    useEffect(() => { fetchAdminData(); }, []);

    const handleDeletePost = async (postId) => {
        if (!window.confirm(t('common.confirmDelete'))) return;
        
        setDeletingId(postId);
        const res = await deleteAnyPost(postId);
        
        if (res?.success) {
            show(t('profile.deleteSuccess'), 'success');
        } else {
            show(`${t('common.error')}: ${res?.error || 'Unknown'}`, 'error');
        }
        setDeletingId(null);
    };

    // Простая проверка на админа
    if (user?.user_metadata?.role !== 'admin' && user?.email !== 'malikaraiymm@gmail.com') {
        return <div className="p-20 text-center font-black tracking-tight">{t('admin.accessDenied')}</div>;
    }

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <h1 className="text-3xl font-black mb-8">{t('admin.title')}</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
                <div className="card p-6 bg-blue-500/5 border-blue-500/20">
                    <div className="flex items-center gap-4">
                        <UsersIcon className="text-blue-500" />
                        <div>
                            <p className="text-sm opacity-50 font-bold uppercase tracking-widest">{t('admin.users')}</p>
                            <p className="text-2xl font-bold">{adminData.users?.length || 0}</p>
                        </div>
                    </div>
                </div>
                <div className="card p-6 bg-pink-500/5 border-pink-500/20">
                    <div className="flex items-center gap-4">
                        <Shield className="text-pink-500" />
                        <div>
                            <p className="text-sm opacity-50 font-bold uppercase tracking-widest">{t('admin.posts')}</p>
                            <p className="text-2xl font-bold">{adminData.posts?.length || 0}</p>
                        </div>
                    </div>
                </div>
                <div className="card p-6 bg-emerald-500/5 border-emerald-500/20 min-h-[140px] flex flex-col justify-between">
                    <div>
                         <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-3">{t('goals.tracker.activity7Days')}</p>
                         <div className="flex items-end gap-1.5 h-12">
                            {[40, 70, 45, 90, 65, 80, 50].map((h, i) => (
                                <div key={i} className="flex-1 bg-emerald-500/20 rounded-t-sm relative group">
                                    <div className="absolute bottom-0 left-0 right-0 bg-emerald-500 rounded-t-sm transition-all duration-1000" style={{ height: `${h}%` }} />
                                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[8px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                        {Math.floor(h * 1.5)}
                                    </div>
                                </div>
                            ))}
                         </div>
                    </div>
                </div>
            </div>

            <h2 className="text-xl font-bold mb-4">{t('admin.contentMgmt')}</h2>
            <div className="overflow-x-auto rounded-2xl border border-[var(--border)] shadow-xl bg-[var(--bg-card)]">
                <table className="w-full text-left border-collapse min-w-[700px]">
                    <thead>
                        <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
                            <th className="p-4 font-black uppercase tracking-widest text-[10px] opacity-40">{t('admin.authorId')}</th>
                            <th className="p-4 font-black uppercase tracking-widest text-[10px] opacity-40">{t('admin.content')}</th>
                            <th className="p-4 font-black uppercase tracking-widest text-[10px] opacity-40 text-right">{t('common.actions')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {adminData.posts?.map((post) => (
                            <tr key={post.id} className="border-b last:border-0 hover:bg-muted-foreground/5 transition-colors" style={{ borderColor: 'var(--border)' }}>
                                <td className="p-4">
                                    <p className="text-[11px] font-mono opacity-60 truncate max-w-[100px]" title={post.goals?.user_id}>
                                        {post.goals?.user_id?.split('-')[0]}...
                                    </p>
                                </td>
                                <td className="p-4 max-w-md">
                                    <p className="text-[14px] font-bold mb-1 line-clamp-1">{post.content}</p>
                                    <p className="text-[10px] font-black uppercase tracking-widest opacity-40">
                                        {t('admin.goal')}: {post.goals?.title}
                                    </p>
                                </td>
                                <td className="p-4 text-right">
                                    <button
                                        onClick={() => handleDeletePost(post.id)}
                                        disabled={deletingId === post.id}
                                        className="w-10 h-10 rounded-xl inline-flex items-center justify-center text-red-500 hover:bg-red-500/10 transition-colors active:scale-90 shadow-sm disabled:opacity-50"
                                        title={t('common.delete')}
                                    >
                                        {deletingId === post.id ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
