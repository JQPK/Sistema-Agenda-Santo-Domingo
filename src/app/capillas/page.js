'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, doc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { Plus, Trash2, MapPin, Shield, X, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CapillasPage() {
  const { userData } = useAuth();
  const [capillas, setCapillas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nombre, setNombre] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => { fetchCapillas(); }, []);

  const fetchCapillas = async () => {
    try {
      const snap = await getDocs(collection(db, 'locations'));
      setCapillas(snap.docs.filter(d => d.data().type === 'Capilla').map(d => ({ id: d.id, ...d.data() })));
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleSaveCapilla = async (e) => {
    e.preventDefault();
    if (!nombre) return;
    try {
      const docRef = await addDoc(collection(db, 'locations'), { name: nombre, type: 'Capilla', createdAt: serverTimestamp() });
      // Notificación automática
      await addDoc(collection(db, 'notifications'), {
        title: `Nueva capilla registrada`,
        message: `Se agregó "${nombre}" al listado de capillas.`,
        type: 'capilla',
        refId: docRef.id,
        createdAt: serverTimestamp(),
        read: false,
      });
      setIsModalOpen(false); setNombre(''); fetchCapillas();
    } catch (e) { console.error(e); }
  };

  const handleDeleteCapilla = async (id) => {
    if (window.confirm('¿Seguro que deseas eliminar esta capilla?')) {
      await deleteDoc(doc(db, 'locations', id)); fetchCapillas();
    }
  };

  if (userData?.rol !== 'parroco') {
    return (
      <DashboardLayout>
        <div style={{ backgroundColor: '#fff0f0', border: '1px solid #fcc', borderRadius: '12px', padding: '24px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <Shield size={24} color="#e03131" />
          <div>
            <p style={{ fontWeight: '600', color: '#e03131', margin: 0 }}>Acceso Denegado</p>
            <p style={{ color: '#787671', fontSize: '13px', margin: 0, marginTop: '4px' }}>Solo el párroco puede administrar capillas.</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', gap: '12px' }}>
        <div>
          <p style={{ fontSize: '12px', fontWeight: '600', color: '#787671', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>Administración</p>
          <h1 style={{ fontSize: '24px', fontWeight: '600', color: '#1a1a1a', margin: 0, letterSpacing: '-0.3px' }}>Capillas</h1>
        </div>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)} style={{ fontSize: '13px', padding: '9px 14px', flexShrink: 0 }}>
          <Plus size={15} /> Nueva
        </button>
      </div>

      {/* Fixed locations info card */}
      <div style={{ backgroundColor: '#f6f5f4', borderRadius: '12px', padding: '16px 20px', marginBottom: '20px', border: '1px solid #e5e3df' }}>
        <p style={{ fontSize: '12px', fontWeight: '600', color: '#787671', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0, marginBottom: '12px' }}>Lugares Fijos</p>
        {['Templo Central', 'Sacristía'].map(lugar => (
          <div key={lugar} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: '1px solid #e5e3df' }}>
            <MapPin size={16} color="#5645d4" style={{ flexShrink: 0 }} />
            <p style={{ fontSize: '14px', fontWeight: '500', color: '#37352f', margin: 0 }}>{lugar}</p>
          </div>
        ))}
      </div>

      {/* Capillas list */}
      <p style={{ fontSize: '12px', fontWeight: '600', color: '#787671', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 12px' }}>Capillas Registradas</p>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '48px', color: '#a4a097' }}>Cargando...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {capillas.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px', color: '#a4a097', border: '1px dashed #e5e3df', borderRadius: '12px' }}>
              <MapPin size={28} style={{ margin: '0 auto 10px', opacity: 0.4 }} />
              <p style={{ fontSize: '14px', fontWeight: '500' }}>Sin capillas registradas</p>
              <p style={{ fontSize: '13px', marginTop: '4px' }}>Usa el botón "Nueva" para añadir una</p>
            </div>
          )}
          {capillas.map(c => (
            <div key={c.id} style={{ backgroundColor: '#ffffff', border: '1px solid #e5e3df', borderRadius: '12px', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: '#ffe8d4', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <MapPin size={18} color="#dd5b00" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '14px', fontWeight: '600', color: '#1a1a1a', margin: 0 }}>{c.name}</p>
                <p style={{ fontSize: '12px', color: '#a4a097', margin: 0, marginTop: '2px' }}>Capilla · Registro activo</p>
              </div>
              <button onClick={() => handleDeleteCapilla(c.id)} style={{ padding: '7px', borderRadius: '8px', border: '1px solid #fcc', backgroundColor: 'transparent', cursor: 'pointer', color: '#e03131', flexShrink: 0 }}>
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
            style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 100 }}
          >
            <motion.form 
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onSubmit={handleSaveCapilla} 
              style={{ backgroundColor: '#ffffff', borderRadius: '16px 16px 0 0', width: '100%', maxWidth: '480px', maxHeight: '70vh', display: 'flex', flexDirection: 'column' }}
            >
              {/* Header fijo */}
              <div style={{ padding: '18px 20px', borderBottom: '1px solid #e5e3df', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                <p style={{ fontSize: '16px', fontWeight: '500', color: '#1a1a1a', margin: 0, letterSpacing: '-0.2px' }}>Nueva capilla</p>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ width: '28px', height: '28px', borderRadius: '50%', border: '1px solid #e5e3df', cursor: 'pointer', background: '#f6f5f4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={14} /></button>
              </div>
              {/* Zona scrollable */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
                <div className="input-group">
                  <label style={{ fontSize: '12px', fontWeight: '500', color: '#787671', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Nombre de la Capilla</label>
                  <input className="input" value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Ej. Capilla San Juan" required />
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
    </DashboardLayout>
  );
}
