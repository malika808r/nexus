import { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../components/ui/Toast';
import { Search, MapPin, Users, Calendar, Ticket, Info, Sparkles } from 'lucide-react';
import { useAppStore } from '../store/store';

const EVENT_ICONS = {
  hackathon: { color: '#ec4899', emoji: '🚀', label: 'Хакатон' },
  meetup:    { color: '#84cc16', emoji: '👥', label: 'Митап' },
  coworking: { color: '#6366f1', emoji: '💻', label: 'Коворкинг' },
  coffee:    { color: '#f97316', emoji: '☕', label: 'Coffee break' },
};

const createEventIcon = (type) => {
  const cfg = EVENT_ICONS[type] || EVENT_ICONS.coworking;
  return L.divIcon({
    className: 'bg-transparent border-0',
    html: `<div style="background:${cfg.color}" class="w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg border-2 border-white/20 text-xl transform rotate-3 transition-transform hover:scale-110">${cfg.emoji}</div>`,
    iconSize: [40, 40], iconAnchor: [20, 20]
  });
};

const bishkekCenter = [42.8746, 74.5698];

const mockEvents = [
  { id: 1, lat: 42.8760, lng: 74.5750, type: 'hackathon', title: 'AI Startup Weekend', date: 'Завтра в 10:00', price: 'Бесплатно', participants: 45 },
  { id: 2, lat: 42.8680, lng: 74.5820, type: 'meetup', title: 'React JS Community', date: 'Среда в 19:00', price: 'Свободный', participants: 120 },
  { id: 3, lat: 42.8820, lng: 74.5900, type: 'coworking', title: 'Ololo Haus Open Space', date: 'Круглосуточно', price: 'От 500 сомов', participants: 18 },
  { id: 4, lat: 42.8700, lng: 74.5600, type: 'coffee', title: 'Designers Breakfast', date: 'Воскресенье в 11:00', price: 'Оплата по счету', participants: 8 },
];

export default function Events() {
  const { theme } = useAppStore();
  const { show } = useToast();
  const [sheetOpen, setSheetOpen] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [mapCenter, setMapCenter] = useState(bishkekCenter);

  const mapUrl = theme === 'dark' 
    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
    : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";

  return (
    <div className="relative w-full h-screen overflow-hidden" style={{ backgroundColor: 'var(--bg-base)' }}>
      {/* КАРТА */}
      <MapContainer center={mapCenter} zoom={14} zoomControl={false} className="absolute inset-0 w-full h-full z-0">
        <TileLayer 
          url={mapUrl}
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        />

        {mockEvents.map(event => (
          <Marker 
            key={event.id} 
            position={[event.lat, event.lng]} 
            icon={createEventIcon(event.type)}
            eventHandlers={{ 
              click: () => {
                setSelectedEvent(event);
                setSheetOpen(true);
              } 
            }}
          >
            <Popup className="custom-popup">
              <div className="card p-4 border-none shadow-xl">
                <div className="text-[10px] font-black uppercase tracking-widest mb-1 text-pink-500">
                  {EVENT_ICONS[event.type].label}
                </div>
                <div className="font-black text-[15px] leading-tight mb-2">
                  {event.title}
                </div>
                <div className="text-xs font-bold mb-3 text-lime-500">{event.date}</div>
                <button 
                  onClick={(e) => { e.stopPropagation(); show('Заявка на участие отправлена', 'success'); }}
                  className="btn-pulse w-full h-10 text-[11px] py-0 px-4"
                >
                  Присоединиться
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* ВЕРХНЯЯ ПАНЕЛЬ ПОИСКА */}
      <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        className="absolute top-6 left-4 right-4 z-[1000] flex flex-col gap-3 max-w-xl mx-auto">
        <div onClick={() => setSheetOpen(true)}
          className="flex items-center gap-4 px-6 h-16 rounded-[2rem] shadow-2xl border cursor-pointer hover:scale-[1.01] transition-all"
          style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)', backdropFilter: 'blur(32px)' }}>
          <Search className="w-6 h-6 text-pink-500" />
          <span className="text-[15px] font-bold opacity-60">Найти хакатон или митап...</span>
        </div>
      </motion.div>

      {/* НИЖНЯЯ ШТОРКА */}
      <AnimatePresence>
        {sheetOpen && (
          <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute bottom-0 left-0 right-0 z-[1000] md:w-[480px] md:left-1/2 md:-translate-x-1/2 md:bottom-8 md:rounded-[2.5rem] rounded-t-[2.5rem] shadow-[0_-10px_60px_rgba(0,0,0,0.15)] border overflow-hidden"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)', backdropFilter: 'blur(32px)' }}>
            <div className="p-8 md:pb-8 pb-32 no-scrollbar max-h-[80vh] overflow-y-auto">
              
              <div className="flex justify-between items-start mb-8">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles size={18} className="text-pink-500" />
                    <h2 className="text-3xl font-black tracking-tight">Nexus Events</h2>
                  </div>
                  <p className="text-[11px] font-black uppercase tracking-widest pl-6 opacity-40">Карта офлайн созидания</p>
                </div>
                <button onClick={() => setSheetOpen(false)} className="w-10 h-10 flex items-center justify-center rounded-full bg-muted-foreground/5 hover:scale-110 transition-transform">✕</button>
              </div>

              {!selectedEvent && (
                <div className="bg-pink-500/5 rounded-3xl p-6 mb-8 border border-pink-500/10 flex items-start gap-4">
                  <div className="p-2 bg-white dark:bg-slate-900 rounded-xl shadow-sm">
                    <Info size={20} className="text-pink-500" />
                  </div>
                  <p className="text-[14px] font-medium leading-relaxed opacity-70">
                    Находите мероприятия рядом. Хакатоны, коворкинг-сессии и митапы — всё это здесь. 
                    <span className="font-black text-pink-500 block mt-2">Выберите иконку на карте для деталей.</span>
                  </p>
                </div>
              )}

              {selectedEvent && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  className="rounded-[2rem] p-6 mb-8 text-white relative overflow-hidden shadow-2xl glow-card-pink"
                  style={{ background: EVENT_ICONS[selectedEvent.type].color }}>
                   <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/20 blur-3xl rounded-full pointer-events-none" />
                   <div className="relative z-10">
                     <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-lg text-[10px] font-black uppercase tracking-widest mb-4 border border-white/20">
                       {EVENT_ICONS[selectedEvent.type].label}
                     </span>
                     <h3 className="text-2xl font-black mb-3 leading-tight">{selectedEvent.title}</h3>
                     <div className="flex items-center gap-5 text-xs font-bold text-white/90 mb-8">
                       <span className="flex items-center gap-2 bg-white/10 px-2 py-1 rounded-md"><Calendar size={14}/> {selectedEvent.date}</span>
                       <span className="flex items-center gap-2 bg-white/10 px-2 py-1 rounded-md"><Users size={14}/> {selectedEvent.participants} идут</span>
                     </div>
                     <button 
                       onClick={() => show('Инвайт будет выслан на вашу почту', 'success')}
                       className="w-full h-14 bg-white text-slate-900 rounded-2xl font-black shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all text-sm flex items-center justify-center gap-3">
                       <Ticket size={20} /> Получить инвайт • {selectedEvent.price}
                     </button>
                   </div>
                </motion.div>
              )}

              <div className="space-y-3">
                <p className="text-[11px] font-black uppercase tracking-widest mb-4 mt-2 px-1 opacity-40">Рекомендуемые рядом</p>
                {mockEvents.map(event => (
                  <div key={event.id} 
                    onClick={() => { setSelectedEvent(event); setMapCenter([event.lat, event.lng]); }}
                    className="flex items-center gap-5 p-5 rounded-[1.5rem] border cursor-pointer transition-all hover:bg-muted-foreground/5 shadow-sm"
                    style={{ 
                      backgroundColor: selectedEvent?.id === event.id ? 'var(--bg-input)' : 'var(--bg-card)',
                      borderColor: selectedEvent?.id === event.id ? '#ec4899' : 'var(--border)'
                    }}>
                    <div className="text-3xl w-14 h-14 flex items-center justify-center rounded-2xl shrink-0 shadow-inner" style={{ backgroundColor: 'var(--bg-input)' }}>
                      {EVENT_ICONS[event.type].emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-black text-[16px] truncate">{event.title}</h4>
                      <p className="text-xs font-bold mt-1 text-lime-500 uppercase tracking-wide">{event.date}</p>
                    </div>
                    <div className="text-[14px] font-black w-10 h-10 flex items-center justify-center rounded-full bg-muted-foreground/5 opacity-50 shrink-0">
                      {event.participants}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .leaflet-popup-content-wrapper { background: transparent !important; box-shadow: none !important; padding: 0 !important; }
        .leaflet-popup-tip-container { display: none !important; }
        .leaflet-popup-content { margin: 0 !important; width: 240px !important; }
      `}</style>
    </div>
  );
}
