import React, { useState, useEffect } from 'react';
import ResidentCertificateLookup from './ResidentCertificateLookup';
import ResidentEligibilityChecker from './ResidentEligibilityChecker';
import DocumentAuthenticationRequest from './DocumentAuthenticationRequest';
import TenderAnnouncements from './TenderAnnouncements';
import OfficialDocumentRequest from './OfficialDocumentRequest';
import RequestTracker from './RequestTracker';
import AdminDashboard from './AdminDashboard';
import API_URL from './config';

// Helper function to log visits
const logVisit = async (page) => {
  try {
    await fetch(`${API_URL}/api/visit/log`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        page,
        userAgent: navigator.userAgent
      })
    });
  } catch (err) {
    console.error('Failed to log visit:', err);
  }
};

function App() {
  const [currentView, setCurrentView] = useState('home');
  const [hoveredCard, setHoveredCard] = useState(null);
  const [secretCode, setSecretCode] = useState('');
  const [showAdminPrompt, setShowAdminPrompt] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Initial load animation
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Log page visits
  useEffect(() => {
    logVisit(currentView);
  }, [currentView]);

  // Secret admin access - type "5587" anywhere on the page
  useEffect(() => {
    const handleKeyPress = (e) => {
      const newCode = (secretCode + e.key).slice(-4);
      setSecretCode(newCode);
      if (newCode === '5587') {
        setShowAdminPrompt(true);
        setSecretCode('');
      }
    };

    window.addEventListener('keypress', handleKeyPress);
    return () => window.removeEventListener('keypress', handleKeyPress);
  }, [secretCode]);

  const services = [
    {
      id: 'eligibility',
      icon: '✓',
      emoji: '🔍',
      titleHe: 'בדיקת זכאות',
      titleAr: 'فحص الاستحقاق',
      desc: 'בדוק זכאות לאישור תושב',
      color: '#10b981',
      gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
    },
    {
      id: 'certificate',
      icon: '⬇',
      emoji: '📄',
      titleHe: 'אישור תושבות',
      titleAr: 'شهادة السكن',
      desc: 'הורדת אישור מיידית',
      color: '#3b82f6',
      gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
    },
    {
      id: 'documentAuth',
      icon: '✓',
      emoji: '✅',
      titleHe: 'אימות מסמכים',
      titleAr: 'مصادقة المستندات',
      desc: 'אימות רשמי של מסמכים',
      color: '#8b5cf6',
      gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)'
    },
    {
      id: 'tenders',
      icon: '☰',
      emoji: '📋',
      titleHe: 'מכרזים',
      titleAr: 'المناقصات',
      desc: 'צפייה והגשת הצעות',
      color: '#f59e0b',
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
    },
    {
      id: 'officialDoc',
      icon: '✎',
      emoji: '📝',
      titleHe: 'מסמך רשמי',
      titleAr: 'مستند رسمي',
      desc: 'בקשה להכנת מסמך',
      color: '#ec4899',
      gradient: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)'
    },
    {
      id: 'tracker',
      icon: '🔍',
      emoji: '📍',
      titleHe: 'מעקב בקשות',
      titleAr: 'تتبع الطلبات',
      desc: 'מעקב אחר סטטוס הבקשה',
      color: '#06b6d4',
      gradient: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)'
    }
  ];

  const BackButton = () => (
    <button
      onClick={() => setCurrentView('home')}
      className="back-button"
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 1000,
        padding: '14px 28px',
        background: 'linear-gradient(135deg, #1e3a5f 0%, #2c5282 100%)',
        border: 'none',
        borderRadius: '16px',
        fontSize: '15px',
        fontWeight: '700',
        color: '#fff',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        fontFamily: 'inherit',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: '0 10px 30px rgba(26, 54, 93, 0.4)'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)';
        e.currentTarget.style.boxShadow = '0 15px 40px rgba(26, 54, 93, 0.5)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0) scale(1)';
        e.currentTarget.style.boxShadow = '0 10px 30px rgba(26, 54, 93, 0.4)';
      }}
    >
      <span style={{ fontSize: '18px' }}>←</span>
      <span>חזרה לתפריט</span>
    </button>
  );

  // Handle page navigation with smooth transition
  const navigateTo = (view) => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (currentView === 'home') {
    return (
      <div
        dir="rtl"
        style={{
          minHeight: '100vh',
          background: 'linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%)',
          fontFamily: "'Tajawal', 'Segoe UI', sans-serif",
          overflowX: 'hidden',
          position: 'relative'
        }}
      >
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;600;700;800;900&display=swap');

          /* Hero Animations */
          @keyframes heroGradient {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }

          @keyframes floatParticle {
            0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.6; }
            50% { transform: translateY(-20px) rotate(180deg); opacity: 1; }
          }

          @keyframes slideInDown {
            from { opacity: 0; transform: translateY(-40px); }
            to { opacity: 1; transform: translateY(0); }
          }

          @keyframes slideInUp {
            from { opacity: 0; transform: translateY(40px); }
            to { opacity: 1; transform: translateY(0); }
          }

          @keyframes scaleIn {
            from { opacity: 0; transform: scale(0.9); }
            to { opacity: 1; transform: scale(1); }
          }

          @keyframes pulseGlow {
            0%, 100% { box-shadow: 0 0 20px rgba(72, 187, 120, 0.4); }
            50% { box-shadow: 0 0 40px rgba(72, 187, 120, 0.8); }
          }

          @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }

          @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-8px); }
          }

          .hero-section {
            background: linear-gradient(-45deg, #0c1929, #1a365d, #2c5282, #1e3a5f);
            background-size: 400% 400%;
            animation: heroGradient 15s ease infinite;
          }

          .hero-badge {
            animation: slideInDown 0.8s ease-out 0.2s both;
          }

          .hero-title {
            animation: slideInDown 0.8s ease-out 0.4s both;
          }

          .hero-subtitle {
            animation: slideInDown 0.8s ease-out 0.6s both;
          }

          .hero-cta {
            animation: slideInUp 0.8s ease-out 0.8s both;
          }

          .section-header {
            animation: slideInUp 0.6s ease-out 0.2s both;
          }

          .service-card {
            opacity: 0;
            animation: cardEntrance 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          }

          @keyframes cardEntrance {
            from {
              opacity: 0;
              transform: translateY(40px) scale(0.95);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }

          .service-card:nth-child(1) { animation-delay: 0.1s; }
          .service-card:nth-child(2) { animation-delay: 0.15s; }
          .service-card:nth-child(3) { animation-delay: 0.2s; }
          .service-card:nth-child(4) { animation-delay: 0.25s; }
          .service-card:nth-child(5) { animation-delay: 0.3s; }
          .service-card:nth-child(6) { animation-delay: 0.35s; }

          .service-card:hover {
            transform: translateY(-12px) scale(1.02) !important;
          }

          .service-card:active {
            transform: scale(0.98) !important;
          }

          .card-icon {
            transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
          }

          .service-card:hover .card-icon {
            transform: scale(1.1) rotate(5deg);
          }

          .card-arrow {
            transition: all 0.3s ease;
          }

          .service-card:hover .card-arrow {
            transform: translateX(-8px);
            background: var(--card-color) !important;
            color: white !important;
          }

          .footer-stat {
            animation: slideInUp 0.6s ease-out backwards;
          }

          .footer-stat:nth-child(1) { animation-delay: 0.6s; }
          .footer-stat:nth-child(2) { animation-delay: 0.7s; }
          .footer-stat:nth-child(3) { animation-delay: 0.8s; }

          .scroll-indicator {
            animation: bounce 2s ease-in-out infinite;
          }

          /* Responsive Adjustments */
          @media (max-width: 768px) {
            .service-card {
              animation-duration: 0.4s;
            }
            .service-card:nth-child(1) { animation-delay: 0.05s; }
            .service-card:nth-child(2) { animation-delay: 0.1s; }
            .service-card:nth-child(3) { animation-delay: 0.15s; }
            .service-card:nth-child(4) { animation-delay: 0.2s; }
            .service-card:nth-child(5) { animation-delay: 0.25s; }
            .service-card:nth-child(6) { animation-delay: 0.3s; }
          }

          /* Floating Particles */
          .particle {
            position: absolute;
            border-radius: 50%;
            pointer-events: none;
            animation: floatParticle 4s ease-in-out infinite;
          }

          /* Glowing Status Dot */
          .status-dot {
            animation: pulseGlow 2s ease-in-out infinite;
          }

          /* Shimmer Effect on Cards */
          .shimmer-effect {
            position: relative;
            overflow: hidden;
          }

          .shimmer-effect::after {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: linear-gradient(
              to right,
              transparent 0%,
              rgba(255, 255, 255, 0.1) 50%,
              transparent 100%
            );
            transform: rotate(30deg);
            animation: shimmer 4s infinite;
            pointer-events: none;
          }
        `}</style>

        {/* Decorative Background Blobs */}
        <div style={{
          position: 'fixed',
          top: '10%',
          right: '-10%',
          width: '400px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(60px)',
          pointerEvents: 'none',
          zIndex: 0
        }} />
        <div style={{
          position: 'fixed',
          bottom: '20%',
          left: '-10%',
          width: '350px',
          height: '350px',
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.12) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(60px)',
          pointerEvents: 'none',
          zIndex: 0
        }} />

        {/* Admin Login Modal */}
        {showAdminPrompt && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
              backdropFilter: 'blur(8px)',
              animation: 'fadeIn 0.3s ease-out'
            }}
            onClick={() => setShowAdminPrompt(false)}
          >
            <div
              style={{
                background: 'white',
                padding: '40px',
                borderRadius: '24px',
                textAlign: 'center',
                boxShadow: '0 25px 80px rgba(0,0,0,0.4)',
                animation: 'scaleIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                maxWidth: '90%',
                width: '360px'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{
                width: '70px',
                height: '70px',
                background: 'linear-gradient(135deg, #1e3a5f 0%, #3b82f6 100%)',
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px',
                fontSize: '32px'
              }}>
                🔐
              </div>
              <h3 style={{
                margin: '0 0 8px 0',
                color: '#1a365d',
                fontSize: '24px',
                fontWeight: '800'
              }}>
                כניסת מנהל
              </h3>
              <p style={{
                margin: '0 0 24px 0',
                color: '#718096',
                fontSize: '14px'
              }}>
                הזן את הסיסמה כדי להמשיך
              </p>
              <input
                type="password"
                placeholder="••••"
                autoFocus
                style={{
                  padding: '16px 24px',
                  fontSize: '24px',
                  border: '3px solid #e2e8f0',
                  borderRadius: '16px',
                  width: '100%',
                  textAlign: 'center',
                  marginBottom: '20px',
                  fontFamily: 'monospace',
                  letterSpacing: '8px',
                  transition: 'all 0.3s ease',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3b82f6';
                  e.target.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e2e8f0';
                  e.target.style.boxShadow = 'none';
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    if (e.target.value === '5587') {
                      setCurrentView('admin');
                      setShowAdminPrompt(false);
                    } else {
                      e.target.value = '';
                      e.target.style.borderColor = '#ef4444';
                      e.target.style.animation = 'shake 0.5s ease-in-out';
                      setTimeout(() => {
                        e.target.style.borderColor = '#e2e8f0';
                        e.target.style.animation = '';
                      }, 500);
                    }
                  } else if (e.key === 'Escape') {
                    setShowAdminPrompt(false);
                  }
                }}
              />
              <button
                onClick={() => setShowAdminPrompt(false)}
                style={{
                  padding: '14px 32px',
                  background: '#f1f5f9',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '15px',
                  color: '#64748b',
                  transition: 'all 0.3s ease',
                  fontFamily: 'inherit'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#e2e8f0';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = '#f1f5f9';
                }}
              >
                ביטול
              </button>
            </div>
          </div>
        )}

        {/* Hero Section */}
        <header
          className="hero-section"
          style={{
            padding: '60px 24px 80px',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Floating Particles */}
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="particle"
              style={{
                width: `${8 + i * 4}px`,
                height: `${8 + i * 4}px`,
                background: 'rgba(255,255,255,0.3)',
                top: `${20 + i * 12}%`,
                left: `${10 + i * 15}%`,
                animationDelay: `${i * 0.5}s`,
                animationDuration: `${3 + i}s`
              }}
            />
          ))}

          {/* Decorative Pattern Overlay */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.03,
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M50 50c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c0 5.523-4.477 10-10 10s-10-4.477-10-10 4.477-10 10-10zM10 10c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c0 5.523-4.477 10-10 10S0 25.523 0 20s4.477-10 10-10zm10 8c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8zm40 40c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            pointerEvents: 'none'
          }} />

          {/* Status Badge */}
          <div
            className="hero-badge"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '12px',
              padding: '14px 28px',
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '50px',
              border: '1px solid rgba(255,255,255,0.2)',
              backdropFilter: 'blur(10px)',
              marginBottom: '32px'
            }}
          >
            <div
              className="status-dot"
              style={{
                width: '10px',
                height: '10px',
                background: '#48bb78',
                borderRadius: '50%'
              }}
            />
            <span style={{ color: '#fff', fontSize: '15px', fontWeight: '600' }}>
              منظومة الخدمات الإلكترونية | מערכת שירותים דיגיטליים
            </span>
          </div>

          {/* Main Title */}
          <h1
            className="hero-title"
            style={{
              fontSize: 'clamp(32px, 6vw, 52px)',
              fontWeight: '900',
              color: '#fff',
              margin: '0 0 16px 0',
              lineHeight: 1.2,
              textShadow: '0 4px 20px rgba(0,0,0,0.3)'
            }}
          >
            اللجنة المحلية - الحسينية
          </h1>

          <p
            className="hero-subtitle"
            style={{
              fontSize: 'clamp(16px, 3vw, 20px)',
              color: 'rgba(255,255,255,0.85)',
              margin: '0 0 40px 0',
              maxWidth: '600px',
              marginLeft: 'auto',
              marginRight: 'auto'
            }}
          >
            הוועדה המקומית חוסניה | خدمات حكومية رسمية إلكترونية
          </p>

          {/* CTA Button */}
          <div className="hero-cta">
            <button
              onClick={() => document.getElementById('services-section').scrollIntoView({ behavior: 'smooth' })}
              className="scroll-indicator"
              style={{
                background: 'rgba(255,255,255,0.15)',
                border: '2px solid rgba(255,255,255,0.3)',
                borderRadius: '50px',
                padding: '16px 40px',
                color: '#fff',
                fontSize: '16px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '12px',
                fontFamily: 'inherit',
                transition: 'all 0.3s ease',
                backdropFilter: 'blur(10px)'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(255,255,255,0.25)';
                e.target.style.transform = 'translateY(-3px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(255,255,255,0.15)';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              <span>استكشف الخدمات</span>
              <span style={{ fontSize: '20px' }}>↓</span>
            </button>
          </div>
        </header>

        {/* Services Section */}
        <main
          id="services-section"
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '60px 24px 80px',
            position: 'relative',
            zIndex: 1
          }}
        >
          {/* Section Header */}
          <div className="section-header" style={{ textAlign: 'center', marginBottom: '50px' }}>
            <span style={{
              display: 'inline-block',
              padding: '8px 20px',
              background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
              color: '#fff',
              borderRadius: '50px',
              fontSize: '13px',
              fontWeight: '700',
              marginBottom: '16px',
              letterSpacing: '1px'
            }}>
              خدماتنا
            </span>
            <h2 style={{
              fontSize: 'clamp(28px, 5vw, 40px)',
              fontWeight: '900',
              color: '#1a365d',
              margin: '0 0 12px 0'
            }}>
              الخدمات الإلكترونية المتاحة
            </h2>
            <p style={{
              fontSize: '17px',
              color: '#64748b',
              margin: 0,
              maxWidth: '500px',
              marginLeft: 'auto',
              marginRight: 'auto'
            }}>
              اختر الخدمة التي تحتاجها من القائمة أدناه
            </p>
          </div>

          {/* Services Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: '24px'
          }}>
            {services.map((service, index) => {
              const isHovered = hoveredCard === service.id;

              return (
                <div
                  key={service.id}
                  className="service-card shimmer-effect"
                  onClick={() => navigateTo(service.id)}
                  onMouseEnter={() => setHoveredCard(service.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                  style={{
                    '--card-color': service.color,
                    background: '#fff',
                    borderRadius: '24px',
                    padding: '32px',
                    cursor: 'pointer',
                    border: '2px solid',
                    borderColor: isHovered ? service.color : '#e2e8f0',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: isHovered
                      ? `0 25px 50px -12px ${service.color}40`
                      : '0 4px 20px rgba(0,0,0,0.06)',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '24px',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  {/* Background Gradient on Hover */}
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: service.gradient,
                    opacity: isHovered ? 0.03 : 0,
                    transition: 'opacity 0.4s ease',
                    pointerEvents: 'none'
                  }} />

                  {/* Number Badge */}
                  <div style={{
                    position: 'absolute',
                    top: '20px',
                    left: '20px',
                    fontSize: '13px',
                    fontWeight: '900',
                    color: isHovered ? service.color : '#cbd5e0',
                    transition: 'color 0.3s ease'
                  }}>
                    0{index + 1}
                  </div>

                  {/* Icon Container */}
                  <div
                    className="card-icon"
                    style={{
                      width: '72px',
                      height: '72px',
                      background: isHovered ? service.gradient : '#f1f5f9',
                      borderRadius: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '32px',
                      flexShrink: 0,
                      boxShadow: isHovered ? `0 10px 30px ${service.color}30` : 'none',
                      transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
                    }}
                  >
                    {service.emoji}
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{
                      fontSize: '22px',
                      fontWeight: '800',
                      color: '#1a365d',
                      margin: '0 0 6px 0',
                      transition: 'color 0.3s ease'
                    }}>
                      {service.titleHe}
                    </h3>
                    <p style={{
                      fontSize: '17px',
                      color: isHovered ? service.color : '#4a5568',
                      margin: '0 0 10px 0',
                      fontWeight: '600',
                      transition: 'color 0.3s ease'
                    }}>
                      {service.titleAr}
                    </p>
                    <p style={{
                      fontSize: '14px',
                      color: '#94a3b8',
                      margin: 0,
                      lineHeight: 1.5
                    }}>
                      {service.desc}
                    </p>
                  </div>

                  {/* Arrow Button */}
                  <div
                    className="card-arrow"
                    style={{
                      width: '48px',
                      height: '48px',
                      background: '#f1f5f9',
                      borderRadius: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#64748b',
                      fontSize: '22px',
                      alignSelf: 'center',
                      flexShrink: 0
                    }}
                  >
                    ←
                  </div>
                </div>
              );
            })}
          </div>
        </main>

        {/* Mobile Admin Access Button */}
        <div
          onClick={() => setShowAdminPrompt(true)}
          style={{
            position: 'fixed',
            bottom: '24px',
            left: '24px',
            width: '50px',
            height: '50px',
            background: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 1000,
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            border: '1px solid rgba(0,0,0,0.05)',
            backdropFilter: 'blur(10px)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)';
            e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)';
          }}
        >
          <span style={{ fontSize: '24px' }}>⚙️</span>
        </div>

        {/* Footer */}
        <footer style={{
          background: 'linear-gradient(135deg, #0c1929 0%, #1a365d 100%)',
          padding: '60px 24px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Decorative Element */}
          <div style={{
            position: 'absolute',
            top: '-100px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '600px',
            height: '200px',
            background: 'radial-gradient(ellipse, rgba(59, 130, 246, 0.15) 0%, transparent 70%)',
            pointerEvents: 'none'
          }} />

          <div style={{
            maxWidth: '900px',
            margin: '0 auto',
            textAlign: 'center',
            position: 'relative',
            zIndex: 1
          }}>
            {/* Stats */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '50px',
              marginBottom: '40px',
              flexWrap: 'wrap'
            }}>
              {[
                { value: '24/7', label: 'خدمة متواصلة', labelHe: 'שירות רציף' },
                { value: '100%', label: 'رسمي وموثوق', labelHe: 'רשמי ומהימן' },
                { value: '6+', label: 'خدمات إلكترونية', labelHe: 'שירותים דיגיטליים' }
              ].map((stat, i) => (
                <div
                  key={i}
                  className="footer-stat"
                  style={{
                    textAlign: 'center',
                    padding: '20px 30px',
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: '20px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(10px)',
                    minWidth: '150px'
                  }}
                >
                  <div style={{
                    fontSize: '36px',
                    fontWeight: '900',
                    color: '#fff',
                    marginBottom: '8px',
                    background: 'linear-gradient(135deg, #fff 0%, #a0aec0 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}>
                    {stat.value}
                  </div>
                  <div style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '4px' }}>
                    {stat.label}
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>
                    {stat.labelHe}
                  </div>
                </div>
              ))}
            </div>

            {/* Divider */}
            <div style={{
              height: '1px',
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
              margin: '0 auto 30px',
              maxWidth: '400px'
            }} />

            {/* Copyright */}
            <p style={{
              fontSize: '14px',
              color: '#64748b',
              margin: 0,
              lineHeight: 1.8
            }}>
              © {new Date().getFullYear()} اللجنة المحلية - الحسينية
              <br />
              <span style={{ color: '#4a5568' }}>
                הוועדה המקומית חוסניה | جميع الحقوق محفوظة
              </span>
            </p>
          </div>
        </footer>
      </div>
    );
  }

  const views = {
    eligibility: ResidentEligibilityChecker,
    certificate: ResidentCertificateLookup,
    documentAuth: DocumentAuthenticationRequest,
    tenders: TenderAnnouncements,
    officialDoc: OfficialDocumentRequest,
    tracker: RequestTracker,
    admin: AdminDashboard
  };

  if (currentView === 'admin') {
    return <AdminDashboard />;
  }

  const ViewComponent = views[currentView];

  if (ViewComponent) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: 'linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%)',
          fontFamily: "'Tajawal', 'Segoe UI', sans-serif"
        }}
      >
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;600;700;800;900&display=swap');

          @keyframes pageSlideIn {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .page-content {
            animation: pageSlideIn 0.5s ease-out;
          }

          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
          }
        `}</style>
        <BackButton />
        <div className="page-content">
          <ViewComponent />
        </div>
      </div>
    );
  }

  return null;
}

export default App;
