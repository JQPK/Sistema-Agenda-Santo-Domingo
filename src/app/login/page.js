'use client';

import { useState, useEffect } from 'react';
import { auth } from '@/lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Lock, Mail } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      router.push('/');
    }
  }, [user, loading, router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/');
    } catch (err) {
      setError('Credenciales incorrectas o usuario no encontrado.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || user) return null;

  return (
    <div className="flex items-center justify-center h-screen" style={{ backgroundColor: 'hsl(var(--surface))' }}>
      
      <div className="card glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '400px', margin: '20px', display: 'flex', flexDirection: 'column', zIndex: 10, padding: '40px 24px', borderRadius: '20px' }}>
        <div className="text-center" style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '6px', color: '#1a1a1a', letterSpacing: '-0.5px' }}>Santo Domingo</h1>
          <p style={{ fontWeight: '500', fontSize: '13px', color: '#787671' }}>Sistema de Agenda Parroquial</p>
        </div>

        {error && (
          <div className="mb-4" style={{ backgroundColor: '#fee2e2', border: '1px solid #f87171', color: '#b91c1c', padding: '0.75rem', borderRadius: '0.5rem', fontSize: '0.875rem' }}>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="flex-col">
          <div style={{ marginBottom: '16px' }}>
            <label htmlFor="email" style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#787671', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>Correo Electrónico</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Mail style={{ position: 'absolute', left: '12px', color: '#a4a097' }} size={16} />
              <input
                id="email"
                type="email"
                className="input"
                style={{ paddingLeft: '2.5rem' }}
                placeholder="usuario@parroquia.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label htmlFor="password" style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#787671', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>Contraseña</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Lock style={{ position: 'absolute', left: '12px', color: '#a4a097' }} size={16} />
              <input
                id="password"
                type="password"
                className="input"
                style={{ paddingLeft: '2.5rem' }}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary w-full" 
            disabled={isSubmitting}
            style={{ padding: '12px', fontSize: '14px', borderRadius: '12px' }}
          >
            {isSubmitting ? 'Iniciando sesión...' : 'Ingresar al Sistema'}
          </button>
        </form>
      </div>
    </div>
  );
}
