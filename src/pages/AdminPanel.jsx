import { useEffect } from 'react';
import { useAppStore } from '../store/store';
import { Trash2, Shield, Users as UsersIcon } from 'lucide-react';

export default function AdminPanel() {
    const { adminData, fetchAdminData, deleteAnyPost, user } = useAppStore();

    useEffect(() => { fetchAdminData(); }, []);

    // Простая проверка на админа (в идеале делать через ProtectedRoute)
    if (user?.user_metadata?.role !== 'admin' && user?.email !== 'malikaraiymm@gmail.com') {
        return <div className="p-20 text-center">Доступ запрещен</div>;
    }

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <h1 className="text-3xl font-black mb-8">Панель управления</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                <div className="card p-6 bg-blue-500/5 border-blue-500/20">
                    <div className="flex items-center gap-4">
                        <UsersIcon className="text-blue-500" />
                        <div>
                            <p className="text-sm opacity-50">Пользователей</p>
                            <p className="text-2xl font-bold">{adminData.users.length}</p>
                        </div>
                    </div>
                </div>
                <div className="card p-6 bg-pink-500/5 border-pink-500/20">
                    <div className="flex items-center gap-4">
                        <Shield className="text-pink-500" />
                        <div>
                            <p className="text-sm opacity-50">Всего постов</p>
                            <p className="text-2xl font-bold">{adminData.posts.length}</p>
                        </div>
                    </div>
                </div>
            </div>

            <h2 className="text-xl font-bold mb-4">Управление контентом</h2>
            <div className="overflow-x-auto rounded-2xl border border-[var(--border)]">
                <table className="w-full text-left bg-[var(--bg-card)]">
                    <thead>
                        <tr className="border-b border-[var(--border)] opacity-50 text-xs uppercase tracking-widest">
                            <th className="p-4">Контент</th>
                            <th className="p-4">ID Автора</th>
                            <th className="p-4">Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        {adminData.posts.map(post => (
                            <tr key={post.id} className="border-b border-[var(--border)] text-sm">
                                <td className="p-4 truncate max-w-xs">{post.content}</td>
                                <td className="p-4 font-mono text-xs">{post.goals?.user_id}</td>
                                <td className="p-4">
                                    <button onClick={() => deleteAnyPost(post.id)} className="text-red-500 hover:scale-110 transition-transform">
                                        <Trash2 size={18} />
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