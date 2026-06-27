'use client';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Calendar, Users, MapPin, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const { userData } = useAuth();

  const cards = [
    {
      title: 'Agenda',
      description: 'Consulta y gestiona todas las misas y sacramentos programados.',
      icon: <Calendar size={24} />,
      tint: '#e6e0f5',
      color: '#5645d4',
      href: '/agenda'
    },
    {
      title: 'Usuarios',
      description: 'Administra el acceso y los roles del personal de la parroquia.',
      icon: <Users size={24} />,
      tint: '#d9f3e1',
      color: '#1aae39',
      href: '/usuarios'
    },
    {
      title: 'Capillas',
      description: 'Gestiona los lugares y capillas donde se celebran actividades.',
      icon: <MapPin size={24} />,
      tint: '#ffe8d4',
      color: '#dd5b00',
      href: '/capillas'
    },
  ];

  return (
    <DashboardLayout>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <p style={{ fontSize: '13px', fontWeight: '600', color: '#787671', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>Panel Principal</p>
        <h1 style={{ fontSize: '28px', fontWeight: '600', color: '#1a1a1a', letterSpacing: '-0.5px', margin: 0 }}>
          Bienvenido, {userData?.nombre?.split(' ')[0] || 'Usuario'}
        </h1>
        <p style={{ fontSize: '14px', color: '#787671', marginTop: '6px' }}>
          Sistema de Agenda Parroquial · Santo Domingo
        </p>
      </div>

      {/* Status card */}
      <div style={{
        backgroundColor: '#e6e0f5',
        borderRadius: '12px',
        padding: '20px 24px',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        border: '1px solid #d6c8f0'
      }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#5645d4', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <CheckCircle size={20} color="white" />
        </div>
        <div>
          <p style={{ fontSize: '14px', fontWeight: '600', color: '#391c57', margin: 0 }}>Sistema en línea</p>
          <p style={{ fontSize: '13px', color: '#5645d4', margin: 0, marginTop: '2px' }}>
            Conectado a Firebase · Datos en tiempo real
          </p>
        </div>
      </div>

      {/* Quick access cards */}
      <p style={{ fontSize: '13px', fontWeight: '600', color: '#787671', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '14px' }}>
        Acceso rápido
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {cards.map(card => (
          <Link key={card.title} href={card.href} style={{ textDecoration: 'none' }}>
            <div style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e5e3df',
              borderRadius: '12px',
              padding: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              transition: 'box-shadow 0.15s ease',
            }}>
              <div style={{
                width: '46px', height: '46px', borderRadius: '10px',
                backgroundColor: card.tint,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, color: card.color
              }}>
                {card.icon}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '15px', fontWeight: '600', color: '#1a1a1a', margin: 0 }}>{card.title}</p>
                <p style={{ fontSize: '13px', color: '#787671', margin: 0, marginTop: '3px', lineHeight: '1.4' }}>{card.description}</p>
              </div>
              <div style={{ color: '#c8c4be', fontSize: '18px' }}>›</div>
            </div>
          </Link>
        ))}
      </div>
    </DashboardLayout>
  );
}
