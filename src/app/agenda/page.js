'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { Plus, Search, ChevronLeft, ChevronRight, Calendar as CalendarIcon, List as ListIcon, X, ChevronDown } from 'lucide-react';
import { ACTIVITY_CATEGORIES, getFieldsForActivity } from '@/lib/activityTypes';
import { 
  format, startOfWeek, endOfWeek, eachDayOfInterval, startOfMonth, endOfMonth,
  isSameMonth, isSameDay, addMonths, subMonths, addDays, subDays, parseISO
} from 'date-fns';
import { es } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';

export default function AgendaPage() {
  const { userData } = useAuth();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [viewMode, setViewMode] = useState('calendar');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isMobile, setIsMobile] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pickerMonth, setPickerMonth] = useState(new Date());

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState({ categoria: 'Misa', tipo: 'misa dominical' });

  const canEdit = userData?.rol === 'parroco' || userData?.rol === 'secretario';

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'activities'), orderBy('fechaHora', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = [];
      snapshot.forEach(doc => data.push({ id: doc.id, ...doc.data() }));
      setActivities(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [userData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveActivity = async (e) => {
    e.preventDefault();
    try {
      const docRef = await addDoc(collection(db, 'activities'), {
        ...formData,
        createdBy: userData.uid,
        createdAt: serverTimestamp()
      });
      // Notificación automática
      await addDoc(collection(db, 'notifications'), {
        title: `Nueva actividad: ${formData.tipo}`,
        message: `${formData.categoria} — ${formData.lugar || 'Sin lugar'} — Creado por ${userData.nombre || userData.email}`,
        type: 'actividad',
        refId: docRef.id,
        createdAt: serverTimestamp(),
        read: false,
      });
      setIsModalOpen(false);
      setFormData({ categoria: 'Misa', tipo: 'misa dominical' });
    } catch (error) {
      console.error("Error saving activity:", error);
    }
  };

  // Day navigation
  const nextDay = () => setCurrentDate(addDays(currentDate, 1));
  const prevDay = () => setCurrentDate(subDays(currentDate, 1));
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const today = () => setCurrentDate(new Date());

  const filteredActivities = activities.filter(a => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (a.tipo || '').toLowerCase().includes(q) ||
           (a.categoria || '').toLowerCase().includes(q) ||
           (a.lugar || '').toLowerCase().includes(q);
  });

  const getEventColor = (categoria) => {
    if (categoria === 'Misa') return { bg: '#e6e0f5', color: '#5645d4', border: '#c4b8ec' };
    if (categoria === 'Sacramento') return { bg: '#d9f3e1', color: '#1aae39', border: '#b3e6c3' };
    return { bg: '#ffe8d4', color: '#dd5b00', border: '#f5c9a0' };
  };

  const renderDynamicFields = () => {
    const fields = getFieldsForActivity(formData.tipo, formData.categoria);
    if (!fields || fields.length === 0) return null;
    return fields.map((field, idx) => {
      if (field.type === 'location') {
        return (
          <div className="input-group" key={idx}>
            <label>{field.label} {field.required && '*'}</label>
            <select className="input" name={field.name} value={formData[field.name] || ''} onChange={handleInputChange} required={field.required}>
              <option value="">Seleccione...</option>
              <option value="Templo - central">Templo - central</option>
              <option value="Capilla">Capilla</option>
              <option value="Otros">Otros</option>
            </select>
          </div>
        );
      }
      if (field.type === 'select') {
        return (
          <div className="input-group" key={idx}>
            <label>{field.label} {field.required && '*'}</label>
            <select className="input" name={field.name} value={formData[field.name] || ''} onChange={handleInputChange} required={field.required}>
              <option value="">Seleccione...</option>
              {field.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
        );
      }
      if (field.type === 'textarea') {
        return (
          <div className="input-group" key={idx}>
            <label>{field.label}</label>
            <textarea className="input" name={field.name} value={formData[field.name] || ''} onChange={handleInputChange} rows={3}></textarea>
          </div>
        );
      }
      return (
        <div className="input-group" key={idx}>
          <label>{field.label} {field.required && '*'}</label>
          <input className="input" type={field.type} name={field.name} value={formData[field.name] || ''} onChange={handleInputChange} required={field.required} />
        </div>
      );
    });
  };

  // Mini calendar picker for filtering
  const renderMiniCalendar = () => {
    const monthStart = startOfMonth(pickerMonth);
    const monthEnd = endOfMonth(pickerMonth);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    const weekDays = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];

    return (
      <div style={{
        position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)',
        marginTop: '8px', backgroundColor: '#ffffff', border: '1px solid #e5e3df',
        borderRadius: '12px', padding: '16px', zIndex: 100, width: '260px',
        boxShadow: 'rgba(15, 15, 15, 0.16) 0px 16px 48px -8px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <button onClick={() => setPickerMonth(subMonths(pickerMonth, 1))} style={{ padding: '4px', borderRadius: '6px', border: '1px solid #e5e3df', cursor: 'pointer', background: 'none' }}>
            <ChevronLeft size={14} />
          </button>
          <span style={{ fontSize: '13px', fontWeight: '600', color: '#1a1a1a' }}>
            {format(pickerMonth, 'MMMM yyyy', { locale: es })}
          </span>
          <button onClick={() => setPickerMonth(addMonths(pickerMonth, 1))} style={{ padding: '4px', borderRadius: '6px', border: '1px solid #e5e3df', cursor: 'pointer', background: 'none' }}>
            <ChevronRight size={14} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', marginBottom: '8px' }}>
          {weekDays.map((d, i) => (
            <div key={i} style={{ textAlign: 'center', fontSize: '11px', fontWeight: '600', color: '#a4a097', padding: '4px 0' }}>{d}</div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
          {days.map(day => {
            const inMonth = isSameMonth(day, pickerMonth);
            const isSelected = isSameDay(day, currentDate);
            const isToday = isSameDay(day, new Date());
            const hasEvents = activities.some(a => a.fechaHora && isSameDay(new Date(a.fechaHora), day));

            return (
              <div key={day.toString()} onClick={() => { setCurrentDate(day); setShowDatePicker(false); }}
                style={{
                  textAlign: 'center', fontSize: '12px', fontWeight: isSelected ? '600' : '400',
                  padding: '5px 2px', borderRadius: '6px', cursor: 'pointer',
                  backgroundColor: isSelected ? '#5645d4' : isToday ? '#e6e0f5' : 'transparent',
                  color: isSelected ? 'white' : inMonth ? (isToday ? '#5645d4' : '#1a1a1a') : '#c8c4be',
                  position: 'relative'
                }}>
                {format(day, 'd')}
                {hasEvents && !isSelected && (
                  <div style={{ width: '3px', height: '3px', borderRadius: '50%', backgroundColor: '#5645d4', margin: '1px auto 0' }}></div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Mobile 1-day view
  const renderMobileDayView = () => {
    const dayActivities = filteredActivities.filter(a => a.fechaHora && isSameDay(new Date(a.fechaHora), currentDate));

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {dayActivities.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 16px', color: '#a4a097' }}>
            <CalendarIcon size={32} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
            <p style={{ fontSize: '14px', fontWeight: '500' }}>Sin actividades este día</p>
            <p style={{ fontSize: '13px', marginTop: '4px' }}>Navega a otro día con las flechas</p>
          </div>
        ) : (
          dayActivities.map(act => {
            const c = getEventColor(act.categoria);
            return (
              <div key={act.id} onClick={() => setSelectedActivity(act)}
                style={{
                  backgroundColor: '#ffffff', border: '1px solid #e5e3df',
                  borderRadius: '12px', padding: '16px',
                  borderLeft: `4px solid ${c.color}`, cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', gap: '6px'
                }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                  <div>
                    <p style={{ fontSize: '15px', fontWeight: '600', color: '#1a1a1a', margin: 0 }}>{act.tipo}</p>
                    <p style={{ fontSize: '13px', color: '#787671', margin: 0, marginTop: '2px' }}>{act.categoria}</p>
                  </div>
                  <span style={{
                    fontSize: '12px', fontWeight: '600', padding: '3px 8px',
                    borderRadius: '9999px', backgroundColor: c.bg, color: c.color,
                    flexShrink: 0
                  }}>
                    {act.fechaHora ? format(new Date(act.fechaHora), 'HH:mm') : '--:--'}
                  </span>
                </div>
                {act.lugar && (
                  <p style={{ fontSize: '12px', color: '#a4a097', margin: 0 }}>📍 {act.lugar}</p>
                )}
                <div style={{ display: 'flex', gap: '6px', marginTop: '2px' }}>
                  <span style={{ fontSize: '11px', fontWeight: '600', padding: '2px 8px', borderRadius: '4px', backgroundColor: act.estado?.includes('Pendiente') ? '#fef7d6' : '#d9f3e1', color: act.estado?.includes('Pendiente') ? '#dd5b00' : '#1aae39' }}>
                    {act.estado || 'Sin estado'}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    );
  };

  // Desktop calendar grid
  const renderCalendarGrid = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    const weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

    return (
      <div style={{ border: '1px solid #e5e3df', borderRadius: '12px', overflow: 'hidden', backgroundColor: '#ffffff' }}>
        <div style={{ display: 'flex', backgroundColor: '#fafaf9', borderBottom: '1px solid #e5e3df' }}>
          {weekDays.map(d => (
            <div key={d} style={{ flex: 1, padding: '10px', textAlign: 'center', fontSize: '12px', fontWeight: '600', color: '#787671' }}>{d}</div>
          ))}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
          {days.map((day, i) => {
            const inMonth = isSameMonth(day, monthStart);
            const isToday = isSameDay(day, new Date());
            const isSelected = isSameDay(day, currentDate);
            const dayActivities = filteredActivities.filter(a => a.fechaHora && isSameDay(new Date(a.fechaHora), day));

            return (
              <div key={day.toString()}
                onClick={() => { setCurrentDate(day); if (isMobile) setViewMode('calendar'); }}
                style={{
                  width: '14.285%', minHeight: '90px',
                  borderBottom: '1px solid #e5e3df',
                  borderRight: (i + 1) % 7 !== 0 ? '1px solid #e5e3df' : 'none',
                  backgroundColor: isSelected ? '#f0edfc' : inMonth ? '#ffffff' : '#fafaf9',
                  padding: '6px', cursor: 'pointer'
                }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '4px' }}>
                  <span style={{
                    fontSize: '12px', fontWeight: '600', width: '22px', height: '22px',
                    borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    backgroundColor: isToday ? '#5645d4' : 'transparent',
                    color: isToday ? 'white' : inMonth ? '#1a1a1a' : '#c8c4be'
                  }}>
                    {format(day, 'd')}
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  {dayActivities.slice(0, 2).map(act => {
                    const c = getEventColor(act.categoria);
                    return (
                      <div key={act.id} onClick={(e) => { e.stopPropagation(); setSelectedActivity(act); }}
                        style={{ fontSize: '10px', padding: '2px 5px', borderRadius: '4px', backgroundColor: c.bg, color: c.color, fontWeight: '500', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', cursor: 'pointer' }}>
                        {act.fechaHora ? format(new Date(act.fechaHora), 'HH:mm') : ''} {act.tipo}
                      </div>
                    );
                  })}
                  {dayActivities.length > 2 && (
                    <div style={{ fontSize: '10px', color: '#787671', padding: '1px 4px' }}>+{dayActivities.length - 2} más</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderListView = () => (
    <div style={{ border: '1px solid #e5e3df', borderRadius: '12px', overflow: 'hidden', backgroundColor: '#ffffff' }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '500px' }}>
          <thead>
            <tr style={{ backgroundColor: '#fafaf9', borderBottom: '1px solid #e5e3df' }}>
              {['Fecha y Hora', 'Actividad', 'Lugar', 'Estado'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#787671', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredActivities.map(act => {
              const c = getEventColor(act.categoria);
              return (
                <tr key={act.id} style={{ borderBottom: '1px solid #e5e3df', cursor: 'pointer' }} onClick={() => setSelectedActivity(act)}>
                  <td style={{ padding: '14px 16px', fontSize: '13px', fontWeight: '500', color: '#37352f', whiteSpace: 'nowrap' }}>
                    {act.fechaHora ? format(new Date(act.fechaHora), 'dd/MM/yy HH:mm') : '—'}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <p style={{ fontSize: '14px', fontWeight: '600', color: '#1a1a1a', margin: 0 }}>{act.tipo}</p>
                    <p style={{ fontSize: '12px', color: '#787671', margin: 0, marginTop: '2px' }}>{act.categoria}</p>
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: '13px', color: '#5d5b54' }}>{act.lugar || '—'}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ fontSize: '12px', fontWeight: '600', padding: '3px 8px', borderRadius: '9999px', backgroundColor: act.estado?.includes('Pendiente') ? '#fef7d6' : '#d9f3e1', color: act.estado?.includes('Pendiente') ? '#dd5b00' : '#1aae39' }}>
                      {act.estado || '—'}
                    </span>
                  </td>
                </tr>
              );
            })}
            {filteredActivities.length === 0 && (
              <tr><td colSpan="4" style={{ padding: '40px', textAlign: 'center', color: '#a4a097', fontSize: '14px' }}>No hay actividades.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <DashboardLayout>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', gap: '12px' }}>
        <div>
          <p style={{ fontSize: '12px', fontWeight: '600', color: '#787671', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>Parroquia Santo Domingo</p>
          <h1 style={{ fontSize: '24px', fontWeight: '600', color: '#1a1a1a', margin: 0, letterSpacing: '-0.3px' }}>Agenda</h1>
        </div>
        {canEdit && (
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)} style={{ flexShrink: 0, fontSize: '13px', padding: '9px 14px' }}>
            <Plus size={15} /> Nueva
          </button>
        )}
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
        {/* View switcher + Search */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {/* View tabs */}
          <div style={{ display: 'flex', backgroundColor: '#f6f5f4', borderRadius: '8px', padding: '3px', gap: '2px', flexShrink: 0 }}>
            {[{ id: 'calendar', label: 'Calendario', icon: <CalendarIcon size={13}/> }, { id: 'list', label: 'Lista', icon: <ListIcon size={13}/> }].map(v => (
              <button key={v.id} onClick={() => setViewMode(v.id)} style={{
                padding: '6px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '500',
                display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', border: 'none',
                backgroundColor: viewMode === v.id ? '#ffffff' : 'transparent',
                color: viewMode === v.id ? '#1a1a1a' : '#787671',
                boxShadow: viewMode === v.id ? '0 1px 3px rgba(0,0,0,0.08)' : 'none'
              }}>
                {v.icon}{v.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#a4a097' }} />
            <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="Buscar..." style={{
                width: '100%', height: '36px', paddingLeft: '32px', paddingRight: '12px',
                borderRadius: '8px', border: '1px solid #e5e3df', backgroundColor: '#ffffff',
                fontSize: '13px', color: '#1a1a1a', outline: 'none'
              }} />
          </div>
        </div>

        {/* Date navigator */}
        {viewMode === 'calendar' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button onClick={today} style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #e5e3df', fontSize: '12px', fontWeight: '500', cursor: 'pointer', backgroundColor: '#ffffff', color: '#37352f' }}>Hoy</button>
            
            <button onClick={isMobile ? prevDay : prevMonth} style={{ padding: '6px 8px', borderRadius: '8px', border: '1px solid #e5e3df', cursor: 'pointer', backgroundColor: '#ffffff', display: 'flex', alignItems: 'center' }}>
              <ChevronLeft size={16} color="#37352f" />
            </button>

            {/* Date label — click to open picker */}
            <div style={{ position: 'relative' }}>
              <button onClick={() => { setPickerMonth(currentDate); setShowDatePicker(!showDatePicker); }}
                style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid #e5e3df', backgroundColor: '#ffffff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', fontWeight: '600', color: '#1a1a1a' }}>
                {isMobile
                  ? format(currentDate, "d 'de' MMMM", { locale: es })
                  : format(currentDate, 'MMMM yyyy', { locale: es })
                }
                <ChevronDown size={13} color="#787671" />
              </button>
              {showDatePicker && renderMiniCalendar()}
            </div>

            <button onClick={isMobile ? nextDay : nextMonth} style={{ padding: '6px 8px', borderRadius: '8px', border: '1px solid #e5e3df', cursor: 'pointer', backgroundColor: '#ffffff', display: 'flex', alignItems: 'center' }}>
              <ChevronRight size={16} color="#37352f" />
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '48px', color: '#a4a097', fontSize: '14px' }}>Cargando...</div>
      ) : viewMode === 'list' ? renderListView()
        : isMobile ? renderMobileDayView()
        : renderCalendarGrid()
      }

      {/* Modal Nueva Actividad */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
            style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 100 }}
          >
            <motion.form 
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onSubmit={handleSaveActivity} 
              style={{ backgroundColor: '#ffffff', borderRadius: '16px 16px 0 0', width: '100%', maxWidth: '600px', maxHeight: '88vh', display: 'flex', flexDirection: 'column' }}
            >
              {/* Header fijo */}
              <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid #e5e3df', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                <p style={{ fontSize: '16px', fontWeight: '500', color: '#1a1a1a', margin: 0, letterSpacing: '-0.2px' }}>Nueva actividad</p>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ width: '28px', height: '28px', borderRadius: '50%', border: '1px solid #e5e3df', cursor: 'pointer', background: '#f6f5f4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={14} /></button>
              </div>
              {/* Zona scrollable */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '4px' }}>
                  <div className="input-group" style={{ flex: 1 }}>
                    <label style={{ fontSize: '12px', fontWeight: '500', color: '#787671', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Categoría</label>
                    <select className="input" name="categoria" value={formData.categoria} onChange={(e) => { handleInputChange(e); setFormData(prev => ({...prev, tipo: ACTIVITY_CATEGORIES[e.target.value][0]})); }}>
                      {Object.keys(ACTIVITY_CATEGORIES).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>
                  <div className="input-group" style={{ flex: 1 }}>
                    <label style={{ fontSize: '12px', fontWeight: '500', color: '#787671', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Tipo</label>
                    <select className="input" name="tipo" value={formData.tipo} onChange={handleInputChange}>
                      {ACTIVITY_CATEGORIES[formData.categoria]?.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{ borderTop: '1px solid #e5e3df', paddingTop: '14px', marginTop: '12px' }}>
                  {renderDynamicFields()}
                </div>
              </div>
              {/* Botones siempre visibles */}
              <div style={{ padding: '14px 20px', paddingBottom: 'calc(16px + env(safe-area-inset-bottom))', borderTop: '1px solid #e5e3df', display: 'flex', gap: '10px', flexShrink: 0, backgroundColor: '#ffffff' }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setIsModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Guardar</button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Detalle Actividad */}
      <AnimatePresence>
        {selectedActivity && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
            style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 100 }}
          >
            <motion.div 
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 300 }}
              style={{ backgroundColor: '#ffffff', borderRadius: '16px 16px 0 0', width: '100%', maxWidth: '480px', maxHeight: '82vh', display: 'flex', flexDirection: 'column' }}
            >
              {/* Header fijo */}
              <div style={{ padding: '18px 20px', borderBottom: '1px solid #e5e3df', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                <div>
                  <span style={{ fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.06em', color: getEventColor(selectedActivity.categoria).color }}>
                    {selectedActivity.categoria}
                  </span>
                  <p style={{ fontSize: '16px', fontWeight: '500', margin: '4px 0 0', color: '#1a1a1a', letterSpacing: '-0.2px' }}>{selectedActivity.tipo}</p>
                </div>
                <button onClick={() => setSelectedActivity(null)} style={{ width: '28px', height: '28px', borderRadius: '50%', border: '1px solid #e5e3df', cursor: 'pointer', background: '#f6f5f4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={14} /></button>
              </div>
              {/* Zona scrollable */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px' }}>
                {[
                  { label: 'Fecha y Hora', value: selectedActivity.fechaHora ? format(new Date(selectedActivity.fechaHora), "d 'de' MMMM yyyy, HH:mm", { locale: es }) : '—' },
                  { label: 'Lugar', value: selectedActivity.lugar || '—' },
                  { label: 'Estado', value: selectedActivity.estado || '—' },
                  ...Object.keys(selectedActivity)
                    .filter(k => !['id','categoria','tipo','fechaHora','lugar','estado','createdBy','createdAt'].includes(k) && selectedActivity[k])
                    .map(k => ({ label: k.charAt(0).toUpperCase() + k.slice(1).replace('_', ' '), value: selectedActivity[k] }))
                ].map((row, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '13px 0', borderBottom: '1px solid #e5e3df', gap: '16px' }}>
                    <span style={{ fontSize: '13px', color: '#a4a097', flexShrink: 0 }}>{row.label}</span>
                    <span style={{ fontSize: '13px', fontWeight: '500', color: '#1a1a1a', textAlign: 'right' }}>{row.value}</span>
                  </div>
                ))}
              </div>
              {/* Botón siempre visible */}
              <div style={{ padding: '14px 20px', paddingBottom: 'calc(16px + env(safe-area-inset-bottom))', borderTop: '1px solid #e5e3df', flexShrink: 0, backgroundColor: '#ffffff' }}>
                <button className="btn btn-secondary" style={{ width: '100%' }} onClick={() => setSelectedActivity(null)}>Cerrar</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
