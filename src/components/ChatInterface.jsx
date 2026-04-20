import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Send, Smile } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { useAppStore } from '../store/store';

const roomInfoMap = {
  'literature': { title: 'Literature & Cinema', emoji: '📖' },
  'it': { title: 'IT & Startup', emoji: '💻' },
  'sport': { title: 'Sports & Active', emoji: '🏃' },
  'aesthetic': { title: 'Aesthetics & Mood', emoji: '🎨' },
  'general': { title: 'Coffee Break Lounge', emoji: '☕' }
};

export default function ChatInterface() {
  const { user } = useAppStore();
  const { roomId } = useParams();
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  
  const messagesEndRef = useRef(null);
  const [chatPartner, setChatPartner] = useState(null);
  const roomInfo = roomId?.startsWith('private_') 
    ? (chatPartner ? { title: `${chatPartner.first_name} ${chatPartner.last_name || ''}`, emoji: '👤' } : { title: 'Чат', emoji: '💬' })
    : (roomInfoMap[roomId] || { title: 'Комната', emoji: '💬' });

  useEffect(() => {
    if (user && roomId?.startsWith('private_')) {
      const parts = roomId.split('_');
      const partnerId = parts[1] === user.id ? parts[2] : parts[1];
      if (partnerId) {
        supabase.from('profiles').select('*').eq('id', partnerId).single()
          .then(({ data }) => setChatPartner(data));
      }
    }
  }, [user, roomId]);

  useEffect(() => {
    if (user && roomId) {
      loadMessages();
    }
  }, [user, roomId]);

  const loadMessages = async () => {
    setLoading(true);
    try {
      if (roomId?.startsWith('private_')) {
        const parts = roomId.split('_');
        const partnerId = parts[1] === user.id ? parts[2] : parts[1];
        const data = await useAppStore.getState().fetchDirectMessages(user.id, partnerId);
        setMessages(data || []);
      } else {
        const { data, error } = await supabase
          .from('posts')
          .select('*, profiles!user_id(first_name, last_name, avatar_url)')
          .eq('type', `room_${roomId}`)
          .order('created_at', { ascending: true })
          .limit(100);
        if (error) throw error;
        setMessages(data || []);
      }
      scrollToBottom();
    } catch (err) {
      console.error("Error loading messages:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!roomId || !user) return;

    let channel;
    if (roomId.startsWith('private_')) {
      const parts = roomId.split('_');
      const partnerId = parts[1] === user.id ? parts[2] : parts[1];
      
      channel = supabase.channel(`direct_${roomId}`)
        .on('postgres_changes', { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages',
          filter: `recipient_id=eq.${user.id}` 
        }, payload => {
           if (payload.new.sender_id === partnerId) {
             fetchNewDirectWithProfile(payload.new.id);
           }
        })
        .subscribe();
    } else {
      channel = supabase.channel(`realtime:room_${roomId}`)
        .on('postgres_changes', { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'posts',
          filter: `type=eq.room_${roomId}`
        }, payload => {
          fetchNewMessageWithProfile(payload.new.id);
        })
        .subscribe();
    }

    return () => { if (channel) supabase.removeChannel(channel); };
  }, [roomId, user]);

  const fetchNewDirectWithProfile = async (msgId) => {
    const { data } = await supabase
      .from('messages')
      .select('*, sender:profiles!sender_id(first_name, last_name, avatar_url)')
      .eq('id', msgId)
      .single();
      
    if (data) {
      setMessages(prev => {
        if (prev.find(m => m.id === msgId)) return prev;
        return [...prev, data];
      });
      scrollToBottom();
    }
  };

  const fetchNewMessageWithProfile = async (msgId) => {
    const { data } = await supabase
      .from('posts')
      .select('*, profiles!user_id(first_name, last_name, avatar_url)')
      .eq('id', msgId)
      .single();
      
    if (data) {
      setMessages(prev => {
        if (prev.find(m => m.id === msgId)) return prev;
        return [...prev, data];
      });
      scrollToBottom();
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !user) return;

    const text = newMessage.trim();
    setNewMessage('');

    if (roomId.startsWith('private_')) {
      const parts = roomId.split('_');
      const partnerId = parts[1] === user.id ? parts[2] : parts[1];
      const sent = await useAppStore.getState().sendDirectMessage(partnerId, text);
      if (sent) {
        setMessages(prev => [...prev, sent]);
        scrollToBottom();
      }
    } else {
      const tempId = 'temp-' + Date.now();
      const optimisticMsg = {
        id: tempId,
        user_id: user.id,
        content: text,
        created_at: new Date().toISOString(),
        profiles: {
          first_name: user?.user_metadata?.firstName || user?.email?.split('@')[0] || 'Участник',
          last_name: user?.user_metadata?.lastName || '',
          avatar: user?.user_metadata?.avatarUrl || null
        }
      };
      
      setMessages(prev => [...prev, optimisticMsg]);
      scrollToBottom();

      const { error } = await supabase.from('posts').insert([{
        user_id: user.id,
        content: text,
        type: `room_${roomId}`
      }]);
      
      if (error) {
        setMessages(prev => prev.filter(m => m.id !== tempId));
      }
    }
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ backgroundColor: 'var(--bg-base)' }}>
      {/* Header */}
      <div className="px-4 py-3 flex items-center shrink-0 z-10 sticky top-0 border-b" 
           style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)', backdropFilter: 'blur(20px)' }}>
        <button 
          onClick={() => navigate('/app/chats')} 
          className="p-2 mr-2 rounded-xl transition-colors shrink-0"
          style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)' }}
        >
          <ArrowLeft size={22} />
        </button>
        
        <div>
          <h3 className="font-bold text-[16px] leading-tight flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <span className="text-xl">{roomInfo.emoji}</span> {roomInfo.title}
          </h3>
          <p className="text-[11px] font-black uppercase tracking-widest mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {roomId?.startsWith('private_') ? 'Personal Chat' : 'Mood Room'}
          </p>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 no-scrollbar flex flex-col">
        {messages.length === 0 ? (
          <div className="text-center my-auto flex flex-col items-center">
            <div className="text-4xl mb-4">💬</div>
            <p className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>Напишите первое сообщение! 👋</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isSent = user && (msg.user_id === user.id || msg.sender_id === user.id);
            const author = msg.profiles || msg.sender;
            
            return (
              <div key={msg.id} className={`flex max-w-[85%] ${isSent ? 'self-end' : 'self-start'} gap-2`}>
                {!isSent && (
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 mt-auto mb-1 overflow-hidden"
                       style={{ background: 'linear-gradient(135deg, #fce7f3, #d9f99d)', color: 'var(--text-secondary)' }}>
                    {author?.avatar_url 
                      ? <img src={author.avatar_url} className="w-full h-full object-cover" />
                      : author?.first_name?.charAt(0) || '👤'
                    }
                  </div>
                )}
                
                <div className={`flex flex-col ${isSent ? 'items-end' : 'items-start'}`}>
                  {!isSent && (
                    <span className="text-[10px] uppercase font-black tracking-widest ml-1 mb-1" style={{ color: 'var(--text-muted)' }}>
                      {author?.first_name} {author?.last_name}
                    </span>
                  )}
                  <div 
                    className={`px-4 py-2.5 rounded-2xl text-[15px] shadow-sm ${
                      isSent 
                        ? 'text-white rounded-br-sm' 
                        : 'rounded-bl-sm border transition-colors'
                    }`}
                    style={isSent ? {
                      background: 'linear-gradient(135deg, #1d4ed8, #047857)'
                    } : {
                      backgroundColor: 'var(--bg-card)',
                      borderColor: 'var(--border)',
                      color: 'var(--text-primary)'
                    }}
                  >
                    {msg.content}
                  </div>
                  <span className="text-[10px] font-bold mt-1 px-1" style={{ color: 'var(--text-muted)' }}>
                    {new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 shrink-0 border-t" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
        <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="flex items-center gap-2 max-w-4xl mx-auto mb-20 md:mb-0">
          <button type="button" className="p-2.5 rounded-xl transition-colors" style={{ color: 'var(--text-muted)' }}>
            <Smile size={22} />
          </button>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Написать сообщение..."
            className="input-base flex-1"
          />
          <button 
            type="submit"
            disabled={!newMessage.trim()}
            className="w-11 h-11 shrink-0 rounded-xl text-white disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 active:scale-95 transition-all shadow-md flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #1d4ed8, #047857)' }}
          >
            <Send size={18} className="translate-x-[1px]" />
          </button>
        </form>
      </div>
    </div>
  );
}
