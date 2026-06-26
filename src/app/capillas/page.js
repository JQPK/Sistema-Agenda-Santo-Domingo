'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, doc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { Plus, Trash2, MapPin, Shield } from 'lucide-react';

export default function CapillasPage() {
  const { userData } = useAuth();
  const [capillas, setCapillas] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [nombre, setNombre] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchCapillas();
  }, []);

  const fetchCapillas = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'locations'));
      const capillasData = [];
      querySnapshot.forEach((doc) => {
        if (doc.data().type === 'Capilla') {
          capillasData.push({ id: doc.id, ...doc.data() });
        }
      });
      setCapillas(capillasData);
    } catch (error) {
      console.error("Error fetching capillas:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCapilla = async (e) => {
    e.preventDefault();
    if (!nombre) return;

    try {
      await addDoc(collection(db, 'locations'), {
        name: nombre,
        type: 'Capilla',
        createdAt: serverTimestamp()
      });
      setIsModalOpen(false);
      setNombre('');
      fetchCapillas();
    } catch (error) {
      console.error("Error saving capilla:", error);
    }
  };

  const handleDeleteCapilla = async (id) => {
    if (window.confirm('¿Seguro que deseas eliminar esta capilla?')) {
      await deleteDoc(doc(db, 'locations', id));
      fetchCapillas();
    }
  };

  if (userData?.rol !== 'parroco') {
    return (
      <DashboardLayout>
        <div className="card glass">
          <h2 className="text-xl text-red-600 flex items-center gap-2"><Shield /> Acceso Denegado</h2>
          <p className="mt-2 text-muted">Solo el párroco tiene permisos para administrar capillas.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <header className="flex items-center justify-between mb-8">
        <h1 style={{ fontSize: '2rem' }}>Gestión de Capillas</h1>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={18} /> Nueva Capilla
        </button>
      </header>

      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div className="card" style={{ width: '100%', maxWidth: '400px' }}>
            <h2 className="text-xl font-bold mb-4">Agregar Capilla</h2>
            <form onSubmit={handleSaveCapilla}>
              <div className="input-group">
                <label>Nombre de la Capilla</label>
                <input className="input" value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Ej. Capilla San Juan" required />
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="card glass">
        {loading ? (
          <p>Cargando capillas...</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid hsl(var(--border))', textAlign: 'left' }}>
                <th style={{ padding: '1rem' }}>Nombre</th>
                <th style={{ padding: '1rem', width: '100px' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {capillas.map(c => (
                <tr key={c.id} style={{ borderBottom: '1px solid hsl(var(--border))' }}>
                  <td style={{ padding: '1rem' }} className="flex items-center gap-2">
                    <MapPin size={16} className="text-muted" /> {c.name}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <button className="text-red-500 hover:text-red-700" onClick={() => handleDeleteCapilla(c.id)}>
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {capillas.length === 0 && (
                <tr>
                  <td colSpan="2" style={{ padding: '1rem', textAlign: 'center', color: 'hsl(var(--text-muted))' }}>No hay capillas registradas.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </DashboardLayout>
  );
}
