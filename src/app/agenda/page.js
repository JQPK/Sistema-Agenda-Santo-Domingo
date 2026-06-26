'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { Plus, Search, Filter, ChevronLeft, ChevronRight, Calendar as CalendarIcon, List as ListIcon, X } from 'lucide-react';
import { ACTIVITY_CATEGORIES, getFieldsForActivity } from '@/lib/activityTypes';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, startOfMonth, endOfMonth, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';

export default function AgendaPage() {
  const { userData } = useAuth();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Views and Calendar states
  const [viewMode, setViewMode] = useState('calendar'); // 'list' or 'calendar'
  const [currentDate, setCurrentDate] = useState(new Date());

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    categoria: 'Misa',
    tipo: 'misa dominical',
  });

  const canEdit = userData?.rol === 'parroco' || userData?.rol === 'secretario';

  useEffect(() => {
    const q = query(collection(db, 'activities'), orderBy('fechaHora', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = [];
      snapshot.forEach(doc => {
        data.push({ id: doc.id, ...doc.data() });
      });
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
      await addDoc(collection(db, 'activities'), {
        ...formData,
        createdBy: userData.uid,
        createdAt: serverTimestamp()
      });
      setIsModalOpen(false);
      setFormData({ categoria: 'Misa', tipo: 'misa dominical' });
    } catch (error) {
      console.error("Error saving activity:", error);
    }
  };

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const today = () => setCurrentDate(new Date());

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
              <option value="Capilla">Capilla (Definida en sistema)</option>
              <option value="Otros">Otros</option>
            </select>
            {formData[field.name] === 'Otros' && (
              <input type="text" className="input mt-2" name={`${field.name}_direccion`} placeholder="Especificar dirección" onChange={handleInputChange} required />
            )}
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
            <label>{field.label} {field.required && '*'}</label>
            <textarea className="input" name={field.name} value={formData[field.name] || ''} onChange={handleInputChange} required={field.required} rows={3}></textarea>
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

  const renderCalendarView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 0 }); // Sunday
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });
    const days = eachDayOfInterval({ start: startDate, end: endDate });

    const weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

    return (
      <div className="card glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--surface-soft))' }}>
          {weekDays.map(day => (
            <div key={day} style={{ flex: 1, padding: '12px', textAlign: 'center', fontWeight: '600', fontSize: '13px', color: 'hsl(var(--slate))', borderRight: '1px solid hsl(var(--border))' }}>
              {day}
            </div>
          ))}
        </div>
        
        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
          {days.map((day, i) => {
            const isCurrentMonth = isSameMonth(day, monthStart);
            const isToday = isSameDay(day, new Date());
            const dayActivities = activities.filter(a => a.fechaHora && isSameDay(new Date(a.fechaHora), day));

            return (
              <div key={day.toString()} style={{
                width: '14.285%',
                minHeight: '120px',
                borderBottom: '1px solid hsl(var(--border))',
                borderRight: (i + 1) % 7 !== 0 ? '1px solid hsl(var(--border))' : 'none',
                backgroundColor: isCurrentMonth ? 'hsl(var(--canvas))' : 'hsl(var(--surface-soft))',
                padding: '8px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
                  <div style={{ 
                    fontSize: '12px', 
                    fontWeight: '600', 
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: isToday ? 'hsl(var(--primary))' : 'transparent',
                    color: isToday ? 'white' : (isCurrentMonth ? 'hsl(var(--text-main))' : 'hsl(var(--text-muted))')
                  }}>
                    {format(day, 'd')}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {dayActivities.map(act => {
                    const bg = act.categoria === 'Misa' ? 'var(--tint-lavender)' : (act.categoria === 'Sacramento' ? 'var(--tint-mint)' : 'var(--tint-peach)');
                    const color = act.categoria === 'Misa' ? 'hsl(var(--primary))' : (act.categoria === 'Sacramento' ? 'hsl(140 30% 30%)' : 'hsl(20 60% 30%)');
                    
                    return (
                      <div 
                        key={act.id} 
                        onClick={() => setSelectedActivity(act)}
                        style={{ 
                          fontSize: '11px', 
                          padding: '4px 6px', 
                          backgroundColor: `hsl(${bg})`, 
                          color: color, 
                          borderRadius: '4px',
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          fontWeight: '500',
                          border: `1px solid ${color}`
                        }}
                        title={act.tipo}>
                        {format(new Date(act.fechaHora), 'HH:mm')} - {act.tipo}
                      </div>
                    )
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderListView = () => {
    return (
      <div className="card glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid hsl(var(--border))', textAlign: 'left', backgroundColor: 'hsl(var(--surface-soft))' }}>
                <th style={{ padding: '16px', color: 'hsl(var(--slate))', fontSize: '13px', fontWeight: '600' }}>Fecha y Hora</th>
                <th style={{ padding: '16px', color: 'hsl(var(--slate))', fontSize: '13px', fontWeight: '600' }}>Actividad</th>
                <th style={{ padding: '16px', color: 'hsl(var(--slate))', fontSize: '13px', fontWeight: '600' }}>Lugar</th>
                <th style={{ padding: '16px', color: 'hsl(var(--slate))', fontSize: '13px', fontWeight: '600' }}>Estado</th>
                <th style={{ padding: '16px', color: 'hsl(var(--slate))', fontSize: '13px', fontWeight: '600' }}>Precio</th>
              </tr>
            </thead>
            <tbody>
              {activities.map(act => (
                <tr key={act.id} style={{ borderBottom: '1px solid hsl(var(--border))' }} onClick={() => setSelectedActivity(act)} className="hover:bg-slate-50 transition-colors cursor-pointer">
                  <td style={{ padding: '16px', fontSize: '14px' }}>
                    {act.fechaHora ? format(new Date(act.fechaHora), 'dd/MM/yyyy HH:mm') : 'No asignada'}
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div className="font-bold" style={{ fontSize: '14px' }}>{act.categoria} - {act.tipo}</div>
                    <div className="text-xs text-muted" style={{ marginTop: '4px' }}>{act.intencion || act.bautizado || act.esposo || ''}</div>
                  </td>
                  <td style={{ padding: '16px', fontSize: '14px' }}>{act.lugar || 'No especificado'} {act.lugar_direccion ? `(${act.lugar_direccion})` : ''}</td>
                  <td style={{ padding: '16px' }}>
                    <span style={{ 
                      padding: '4px 10px', 
                      borderRadius: '999px', 
                      backgroundColor: act.estado?.includes('Pendiente') ? 'hsl(var(--tint-yellow))' : 'hsl(var(--tint-mint))',
                      color: act.estado?.includes('Pendiente') ? 'hsl(var(--charcoal))' : 'hsl(140 40% 20%)',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>
                      {act.estado || 'No especificado'}
                    </span>
                  </td>
                  <td style={{ padding: '16px', fontWeight: '500', fontSize: '14px' }}>{act.precio ? `S/. ${act.precio}` : '-'}</td>
                </tr>
              ))}
              {activities.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ padding: '32px', textAlign: 'center', color: 'hsl(var(--text-muted))' }}>
                    No hay actividades programadas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout>
      <header className="flex items-center justify-between mb-8">
        <h1 style={{ fontSize: '28px', margin: 0 }}>Agenda</h1>
        {canEdit && (
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={16} /> Nueva Actividad
          </button>
        )}
      </header>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 mb-6" style={{ flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button 
            onClick={() => setViewMode('calendar')} 
            style={{ 
              padding: '8px 12px', 
              borderRadius: '6px', 
              backgroundColor: viewMode === 'calendar' ? 'hsl(var(--surface-soft))' : 'transparent',
              color: viewMode === 'calendar' ? 'hsl(var(--text-main))' : 'hsl(var(--slate))',
              display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: '500',
              border: viewMode === 'calendar' ? '1px solid hsl(var(--border))' : '1px solid transparent'
            }}>
            <CalendarIcon size={16}/> Calendario
          </button>
          <button 
            onClick={() => setViewMode('list')} 
            style={{ 
              padding: '8px 12px', 
              borderRadius: '6px', 
              backgroundColor: viewMode === 'list' ? 'hsl(var(--surface-soft))' : 'transparent',
              color: viewMode === 'list' ? 'hsl(var(--text-main))' : 'hsl(var(--slate))',
              display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: '500',
              border: viewMode === 'list' ? '1px solid hsl(var(--border))' : '1px solid transparent'
            }}>
            <ListIcon size={16}/> Lista
          </button>
        </div>

        {viewMode === 'calendar' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button onClick={today} className="btn btn-secondary" style={{ padding: '6px 12px' }}>Hoy</button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <button onClick={prevMonth} className="btn btn-secondary" style={{ padding: '6px', borderRadius: '50%' }}><ChevronLeft size={18}/></button>
              <h2 style={{ fontSize: '16px', width: '140px', textAlign: 'center', margin: 0 }}>
                {format(currentDate, 'MMMM yyyy', { locale: es })}
              </h2>
              <button onClick={nextMonth} className="btn btn-secondary" style={{ padding: '6px', borderRadius: '50%' }}><ChevronRight size={18}/></button>
            </div>
          </div>
        )}

        <div className="relative flex-1" style={{ maxWidth: '300px', marginLeft: viewMode === 'list' ? 'auto' : '0' }}>
          <Search className="absolute left-3 top-3 text-muted" size={16} />
          <input className="input pl-10" placeholder="Buscar actividad..." style={{ height: '38px', fontSize: '14px' }} />
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'hsl(var(--text-muted))' }}>Cargando agenda...</div>
      ) : (
        viewMode === 'calendar' ? renderCalendarView() : renderListView()
      )}

      {/* Modal Nueva Actividad */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '16px', overflowY: 'auto' }}>
          <div className="card glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 className="font-bold mb-4" style={{ fontSize: '20px' }}>Registrar Actividad</h2>
            <form onSubmit={handleSaveActivity}>
              <div className="flex gap-4 mb-4">
                <div className="input-group flex-1">
                  <label>Categoría</label>
                  <select className="input" name="categoria" value={formData.categoria} onChange={(e) => {
                    handleInputChange(e);
                    setFormData(prev => ({...prev, tipo: ACTIVITY_CATEGORIES[e.target.value][0]}));
                  }}>
                    {Object.keys(ACTIVITY_CATEGORIES).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <div className="input-group flex-1">
                  <label>Tipo de Actividad</label>
                  <select className="input" name="tipo" value={formData.tipo} onChange={handleInputChange}>
                    {ACTIVITY_CATEGORIES[formData.categoria]?.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ borderTop: '1px solid hsl(var(--border))', paddingTop: '16px', marginTop: '16px' }}>
                <h3 className="font-bold mb-4" style={{ fontSize: '16px', color: 'hsl(var(--primary))' }}>Detalles de {formData.tipo}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {renderDynamicFields()}
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-gray-200" style={{ borderColor: 'hsl(var(--border))' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Guardar Actividad</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Detalles de Actividad */}
      {selectedActivity && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '16px' }}>
          <div className="card glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '420px', position: 'relative' }}>
            <button 
              onClick={() => setSelectedActivity(null)} 
              style={{ position: 'absolute', top: '16px', right: '16px', padding: '4px', color: 'hsl(var(--slate))' }}>
              <X size={18} />
            </button>
            <h2 style={{ fontSize: '20px', marginBottom: '4px' }}>{selectedActivity.categoria}</h2>
            <p className="text-muted" style={{ fontSize: '14px', marginBottom: '24px' }}>{selectedActivity.tipo}</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid hsl(var(--border))', paddingBottom: '8px' }}>
                <span style={{ color: 'hsl(var(--slate))', fontWeight: '500' }}>Fecha y Hora</span>
                <span style={{ fontWeight: '600' }}>{format(new Date(selectedActivity.fechaHora), 'dd/MM/yyyy HH:mm')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid hsl(var(--border))', paddingBottom: '8px' }}>
                <span style={{ color: 'hsl(var(--slate))', fontWeight: '500' }}>Lugar</span>
                <span style={{ fontWeight: '600' }}>{selectedActivity.lugar || 'No especificado'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid hsl(var(--border))', paddingBottom: '8px' }}>
                <span style={{ color: 'hsl(var(--slate))', fontWeight: '500' }}>Estado</span>
                <span style={{ 
                    padding: '2px 8px', 
                    borderRadius: '4px', 
                    backgroundColor: selectedActivity.estado?.includes('Pendiente') ? 'hsl(var(--tint-yellow))' : 'hsl(var(--tint-mint))',
                    fontSize: '12px', fontWeight: '600'
                  }}>
                  {selectedActivity.estado || 'No especificado'}
                </span>
              </div>
              
              {/* Extra Dynamic Fields mapped generically for simplicity */}
              {Object.keys(selectedActivity).map(key => {
                if (['id', 'categoria', 'tipo', 'fechaHora', 'lugar', 'estado', 'createdBy', 'createdAt'].includes(key)) return null;
                if (!selectedActivity[key]) return null;
                return (
                  <div key={key} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid hsl(var(--border))', paddingBottom: '8px' }}>
                    <span style={{ color: 'hsl(var(--slate))', fontWeight: '500', textTransform: 'capitalize' }}>{key.replace('_', ' ')}</span>
                    <span style={{ fontWeight: '600', maxWidth: '60%', textAlign: 'right' }}>{selectedActivity[key]}</span>
                  </div>
                );
              })}
            </div>
            
            <div className="flex justify-end mt-6">
              <button className="btn btn-secondary" onClick={() => setSelectedActivity(null)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
