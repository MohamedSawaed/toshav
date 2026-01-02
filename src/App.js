import { useState, useEffect } from 'react';
import ResidentCertificateLookup from './ResidentCertificateLookup';
import ResidentEligibilityChecker from './ResidentEligibilityChecker';
import DocumentAuthenticationRequest from './DocumentAuthenticationRequest';
import TenderAnnouncements from './TenderAnnouncements';
import OfficialDocumentRequest from './OfficialDocumentRequest';
import RequestTracker from './RequestTracker';
import AdminDashboard from './AdminDashboard';
import MeetingProtocols from './MeetingProtocols';
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
  const [currentView, setCurrentView] = useState('splash');
  const [secretCode, setSecretCode] = useState('');
  const [showAdminPrompt, setShowAdminPrompt] = useState(false);
  const [splashFading, setSplashFading] = useState(false);

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

  // Service categories with organized services
  const serviceCategories = [
    {
      id: 'resident',
      titleHe: 'שירותי תושב',
      titleAr: 'خدمات السكان',
      icon: '👤',
      services: [
        {
          id: 'residentRequest',
          icon: '📝',
          titleHe: 'בקשה לאישור תושבות לשם קבלת הנחת תושב',
          titleAr: 'طلب شهادة إقامة للحصول على خصم المقيم',
          descHe: '',
          descAr: ''
        },
        {
          id: 'eligibility',
          icon: '📋',
          titleHe: 'בדיקת מסמכים נדרשים לבקשת אישור תושב',
          titleAr: 'فحص المستندات المطلوبة',
          descHe: 'בדוק אילו מסמכים להגיש לפי מצבך',
          descAr: 'تحقق من المستندات المطلوبة حسب حالتك'
        },
        {
          id: 'certificate',
          icon: '📄',
          titleHe: 'הפקה עצמית של אישור תושב',
          titleAr: 'استخراج ذاتي لشهادة الإقامة',
          descHe: '',
          descAr: ''
        }
      ]
    },
    {
      id: 'documents',
      titleHe: 'מסמכים ואישורים',
      titleAr: 'المستندات والتصديقات',
      icon: '📋',
      services: [
        {
          id: 'documentAuth',
          icon: '✔',
          titleHe: 'אימות מסמכים',
          titleAr: 'مصادقة المستندات',
          descHe: 'אימות רשמי של מסמכים',
          descAr: 'طلب مصادقة رسمية على المستندات'
        },
        {
          id: 'officialDoc',
          icon: '📝',
          titleHe: 'מסמך רשמי',
          titleAr: 'مستند رسمي',
          descHe: 'בקשה להכנת מסמך',
          descAr: 'طلب إعداد مستند رسمي'
        },
        {
          id: 'tracker',
          icon: '🔍',
          titleHe: 'מעקב בקשות',
          titleAr: 'تتبع الطلبات',
          descHe: 'מעקב אחר סטטוס הבקשה',
          descAr: 'تتبع حالة طلبك'
        }
      ]
    },
    {
      id: 'council',
      titleHe: 'מידע ציבורי',
      titleAr: 'المعلومات العامة',
      icon: '��️',
      services: [
        {
          id: 'tenders',
          icon: '📋',
          titleHe: 'מכרזים',
          titleAr: 'المناقصات',
          descHe: 'צפייה במכרזים פעילים',
          descAr: 'عرض المناقصات النشطة'
        },
        {
          id: 'protocols',
          icon: '📑',
          titleHe: 'פרוטוקולים',
          titleAr: 'بروتوكولات الجلسات',
          descHe: 'צפייה בפרוטוקולי ישיבות',
          descAr: 'عرض بروتوكولات جلسات اللجنة'
        }
      ]
    }
  ];

  // Flatten services for backward compatibility
  const services = serviceCategories.flatMap(cat => cat.services);

  const styles = {
    container: {
      minHeight: '100vh',
      background: '#edf2f7',
      fontFamily: "'Segoe UI', 'Arial', sans-serif",
      direction: 'rtl'
    },
    headerStripe: {
      height: '6px',
      background: 'linear-gradient(90deg, #1a365d 0%, #234e70 50%, #2b6cb0 100%)'
    },
    header: {
      background: '#ffffff',
      borderBottom: '1px solid #e2e8f0',
      boxShadow: '0 2px 4px rgba(0,0,0,0.04)'
    },
    headerContent: {
      maxWidth: '1100px',
      margin: '0 auto',
      padding: '16px 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '20px'
    },
    logoSection: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px'
    },
    emblem: {
      width: '56px',
      height: '56px',
      background: 'linear-gradient(135deg, #1a365d 0%, #234e70 100%)',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#ffffff',
      fontSize: '20px',
      fontWeight: 'bold',
      border: '3px solid #b7791f',
      flexShrink: 0
    },
    titleSection: {
      textAlign: 'right'
    },
    titleAr: {
      fontSize: '1.35rem',
      fontWeight: '700',
      color: '#1a365d',
      margin: 0,
      lineHeight: 1.3
    },
    titleHe: {
      fontSize: '0.95rem',
      color: '#4a5568',
      margin: 0
    },
    nav: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    navBadge: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      padding: '8px 14px',
      background: '#c6f6d5',
      border: '1px solid #276749',
      borderRadius: '20px',
      fontSize: '0.8rem',
      fontWeight: '600',
      color: '#276749'
    },
    main: {
      maxWidth: '1100px',
      margin: '0 auto',
      padding: '40px 24px 60px'
    },
    welcomeSection: {
      textAlign: 'center',
      marginBottom: '40px'
    },
    welcomeTitle: {
      fontSize: '1.75rem',
      fontWeight: '700',
      color: '#1a365d',
      margin: '0 0 8px 0'
    },
    welcomeSubtitle: {
      fontSize: '1rem',
      color: '#4a5568',
      margin: 0
    },
    infoBox: {
      background: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRight: '4px solid #1a365d',
      borderRadius: '6px',
      padding: '16px 20px',
      marginBottom: '32px',
      display: 'flex',
      alignItems: 'flex-start',
      gap: '12px'
    },
    infoIcon: {
      fontSize: '20px',
      color: '#1a365d'
    },
    infoText: {
      fontSize: '0.9rem',
      color: '#4a5568',
      margin: 0,
      lineHeight: 1.6
    },
    servicesGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
      gap: '20px'
    },
    serviceCard: {
      background: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: '6px',
      padding: '24px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      position: 'relative',
      overflow: 'hidden'
    },
    serviceCardHover: {
      borderColor: '#2b6cb0',
      boxShadow: '0 4px 12px rgba(43, 108, 176, 0.15)',
      transform: 'translateY(-2px)'
    },
    serviceCardTop: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '3px',
      background: '#1a365d'
    },
    serviceHeader: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '16px',
      marginBottom: '12px'
    },
    serviceIcon: {
      width: '48px',
      height: '48px',
      background: '#edf2f7',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '22px',
      border: '1px solid #e2e8f0',
      flexShrink: 0
    },
    serviceTitles: {
      flex: 1
    },
    serviceTitleHe: {
      fontSize: '1.1rem',
      fontWeight: '600',
      color: '#1a365d',
      margin: '0 0 2px 0'
    },
    serviceTitleAr: {
      fontSize: '0.95rem',
      color: '#4a5568',
      margin: 0
    },
    serviceDesc: {
      fontSize: '0.85rem',
      color: '#718096',
      margin: 0,
      lineHeight: 1.5
    },
    serviceArrow: {
      position: 'absolute',
      left: '20px',
      top: '50%',
      transform: 'translateY(-50%)',
      fontSize: '18px',
      color: '#a0aec0',
      transition: 'all 0.2s ease'
    },
    footer: {
      background: '#1a365d',
      color: '#ffffff',
      padding: '32px 24px',
      marginTop: 'auto'
    },
    footerContent: {
      maxWidth: '1100px',
      margin: '0 auto',
      textAlign: 'center'
    },
    footerDivider: {
      width: '50px',
      height: '3px',
      background: '#b7791f',
      margin: '0 auto 16px'
    },
    footerTitle: {
      fontSize: '1rem',
      fontWeight: '600',
      margin: '0 0 8px 0'
    },
    footerText: {
      fontSize: '0.85rem',
      opacity: 0.8,
      margin: 0
    },
    modalOverlay: {
      position: 'fixed',
      inset: 0,
      background: 'rgba(26, 54, 93, 0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '24px',
      backdropFilter: 'blur(4px)'
    },
    modal: {
      background: '#ffffff',
      borderRadius: '8px',
      width: '100%',
      maxWidth: '400px',
      boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      overflow: 'hidden'
    },
    modalHeader: {
      background: 'linear-gradient(135deg, #1a365d 0%, #234e70 100%)',
      color: '#ffffff',
      padding: '20px 24px',
      borderBottom: '3px solid #b7791f',
      textAlign: 'center'
    },
    modalTitle: {
      fontSize: '1.1rem',
      fontWeight: '600',
      margin: 0
    },
    modalBody: {
      padding: '24px'
    },
    modalInput: {
      width: '100%',
      padding: '14px 18px',
      fontSize: '1.25rem',
      border: '2px solid #e2e8f0',
      borderRadius: '6px',
      textAlign: 'center',
      fontFamily: 'monospace',
      letterSpacing: '6px',
      marginBottom: '16px',
      transition: 'all 0.2s ease',
      outline: 'none'
    },
    modalBtn: {
      width: '100%',
      padding: '12px',
      background: '#edf2f7',
      border: 'none',
      borderRadius: '6px',
      fontSize: '0.95rem',
      fontWeight: '600',
      color: '#4a5568',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    },
    backButton: {
      position: 'fixed',
      top: '20px',
      right: '20px',
      zIndex: 1000,
      padding: '12px 20px',
      background: 'linear-gradient(135deg, #1a365d 0%, #234e70 100%)',
      border: 'none',
      borderRadius: '6px',
      fontSize: '0.9rem',
      fontWeight: '600',
      color: '#ffffff',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      boxShadow: '0 4px 12px rgba(26, 54, 93, 0.3)',
      transition: 'all 0.2s ease'
    }
  };

  const BackButton = () => (
    <button
      onClick={() => setCurrentView('home')}
      style={styles.backButton}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 6px 16px rgba(26, 54, 93, 0.4)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(26, 54, 93, 0.3)';
      }}
    >
      <span>←</span>
      <span>חזרה לתפריט</span>
    </button>
  );

  const navigateTo = (view) => {
    // Redirect to WhatsApp for certificate conditions
    if (view === 'certificate') {
      window.open('https://api.whatsapp.com/send/?phone=97243760274&text&type=phone_number&app_absent=0', '_blank');
      return;
    }
    // Redirect to external site for resident request
    if (view === 'residentRequest') {
      window.open('https://mas.misgav.org.il/', '_blank');
      return;
    }
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle entering the app from splash screen
  const enterApp = () => {
    setSplashFading(true);
    setTimeout(() => {
      setCurrentView('home');
      setSplashFading(false);
    }, 500);
  };

  // Auto-redirect from splash after 2 seconds
  useEffect(() => {
    if (currentView === 'splash') {
      const timer = setTimeout(() => {
        enterApp();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [currentView]);

  // Loading Screen - Advanced Black & White Geometric
  if (currentView === 'splash') {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#000',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Courier New', monospace",
        direction: 'ltr',
        opacity: splashFading ? 0 : 1,
        transition: 'opacity 0.4s ease',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <style>{`
          @keyframes rotate {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @keyframes rotateReverse {
            from { transform: rotate(360deg); }
            to { transform: rotate(0deg); }
          }
          @keyframes scale {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
          }
          @keyframes morph {
            0%, 100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
            25% { border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%; }
            50% { border-radius: 50% 60% 30% 60% / 30% 60% 70% 40%; }
            75% { border-radius: 60% 40% 60% 30% / 70% 30% 50% 60%; }
          }
          @keyframes trace {
            0% { stroke-dashoffset: 1000; }
            100% { stroke-dashoffset: 0; }
          }
          @keyframes pulse {
            0%, 100% { opacity: 0.3; }
            50% { opacity: 1; }
          }
          @keyframes scanline {
            0% { top: -10%; }
            100% { top: 110%; }
          }
          @keyframes glitch {
            0%, 90%, 100% { transform: translate(0); }
            92% { transform: translate(-2px, 1px); }
            94% { transform: translate(2px, -1px); }
            96% { transform: translate(-1px, -1px); }
            98% { transform: translate(1px, 1px); }
          }
          @keyframes blink {
            0%, 49% { opacity: 1; }
            50%, 100% { opacity: 0; }
          }
          @keyframes wave {
            0%, 100% { transform: translateY(0) scaleY(1); }
            25% { transform: translateY(-2px) scaleY(1.5); }
            50% { transform: translateY(0) scaleY(1); }
            75% { transform: translateY(2px) scaleY(0.5); }
          }
        `}</style>

        {/* Scanline Effect */}
        <div style={{
          position: 'absolute',
          width: '100%',
          height: '2px',
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
          animation: 'scanline 3s linear infinite',
          pointerEvents: 'none'
        }} />

        {/* Grid Background */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }} />

        {/* Radial Gradient Overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at center, transparent 0%, #000 70%)'
        }} />

        {/* Main Loader */}
        <div style={{
          position: 'relative',
          width: '200px',
          height: '200px'
        }}>
          {/* Outer Morphing Shape */}
          <div style={{
            position: 'absolute',
            inset: '10px',
            border: '1px solid rgba(255,255,255,0.1)',
            animation: 'morph 8s ease-in-out infinite, rotate 20s linear infinite'
          }} />

          {/* Concentric Circles */}
          {[0, 1, 2, 3, 4].map((i) => (
            <svg key={i} style={{
              position: 'absolute',
              width: '200px',
              height: '200px',
              animation: `${i % 2 === 0 ? 'rotate' : 'rotateReverse'} ${10 + i * 3}s linear infinite`
            }}>
              <circle
                cx="100" cy="100" r={90 - i * 15}
                fill="none"
                stroke={`rgba(255,255,255,${0.05 + i * 0.03})`}
                strokeWidth="0.5"
                strokeDasharray={i % 2 === 0 ? `${5 + i * 2} ${10 + i * 3}` : 'none'}
              />
            </svg>
          ))}

          {/* Rotating Lines */}
          <svg style={{
            position: 'absolute',
            width: '200px',
            height: '200px',
            animation: 'rotate 15s linear infinite'
          }}>
            {[0, 45, 90, 135].map((angle) => (
              <line
                key={angle}
                x1="100" y1="20"
                x2="100" y2="40"
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="1"
                transform={`rotate(${angle} 100 100)`}
              />
            ))}
          </svg>

          {/* Counter Rotating Lines */}
          <svg style={{
            position: 'absolute',
            width: '200px',
            height: '200px',
            animation: 'rotateReverse 12s linear infinite'
          }}>
            {[22.5, 67.5, 112.5, 157.5].map((angle) => (
              <line
                key={angle}
                x1="100" y1="25"
                x2="100" y2="35"
                stroke="rgba(255,255,255,0.15)"
                strokeWidth="0.5"
                transform={`rotate(${angle} 100 100)`}
              />
            ))}
          </svg>

          {/* Center Element */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)'
          }}>
            {/* Pulsing Core */}
            <div style={{
              width: '40px',
              height: '40px',
              border: '1px solid rgba(255,255,255,0.5)',
              animation: 'scale 2s ease-in-out infinite'
            }}>
              <div style={{
                width: '100%',
                height: '100%',
                border: '1px solid rgba(255,255,255,0.3)',
                transform: 'rotate(45deg) scale(0.7)',
                animation: 'scale 2s ease-in-out infinite reverse'
              }} />
            </div>
          </div>

          {/* Orbiting Points */}
          {[0, 1, 2, 3].map((i) => (
            <div key={i} style={{
              position: 'absolute',
              width: '200px',
              height: '200px',
              animation: `rotate ${6 + i * 2}s linear infinite`,
              animationDelay: `${i * 0.5}s`
            }}>
              <div style={{
                position: 'absolute',
                top: '15px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '4px',
                height: '4px',
                background: '#fff',
                opacity: 0.8 - i * 0.15
              }} />
            </div>
          ))}

          {/* Data Stream Lines */}
          <svg style={{
            position: 'absolute',
            width: '200px',
            height: '200px'
          }}>
            <path
              d="M100,20 Q150,50 180,100 Q150,150 100,180 Q50,150 20,100 Q50,50 100,20"
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="1"
              strokeDasharray="5 10"
              style={{ animation: 'trace 4s linear infinite' }}
            />
          </svg>
        </div>

        {/* Text Display */}
        <div style={{
          marginTop: '40px',
          textAlign: 'center',
          animation: 'glitch 3s infinite'
        }}>
          {/* Status Bars */}
          <div style={{
            display: 'flex',
            gap: '3px',
            justifyContent: 'center',
            marginBottom: '16px'
          }}>
            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div key={i} style={{
                width: '3px',
                height: '12px',
                background: '#fff',
                opacity: 0.3,
                animation: `wave 1s ease-in-out infinite`,
                animationDelay: `${i * 0.1}s`
              }} />
            ))}
          </div>

          {/* Terminal Text */}
          <p style={{
            fontSize: '11px',
            color: 'rgba(255,255,255,0.5)',
            margin: 0,
            letterSpacing: '4px',
            textTransform: 'uppercase'
          }}>
            <span style={{ color: 'rgba(255,255,255,0.8)' }}>[</span>
            LOADING
            <span style={{ color: 'rgba(255,255,255,0.8)' }}>]</span>
            <span style={{ animation: 'blink 1s step-end infinite' }}>_</span>
          </p>
        </div>

        {/* Corner Brackets */}
        {[
          { top: '30px', left: '30px', transform: 'rotate(0deg)' },
          { top: '30px', right: '30px', transform: 'rotate(90deg)' },
          { bottom: '30px', right: '30px', transform: 'rotate(180deg)' },
          { bottom: '30px', left: '30px', transform: 'rotate(270deg)' }
        ].map((pos, i) => (
          <svg key={i} style={{ position: 'absolute', ...pos, width: '30px', height: '30px' }}>
            <path d="M0 20 L0 0 L20 0" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
          </svg>
        ))}

        {/* Coordinate Display */}
        <div style={{
          position: 'absolute',
          bottom: '30px',
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: '9px',
          color: 'rgba(255,255,255,0.2)',
          letterSpacing: '2px',
          fontFamily: "'Courier New', monospace"
        }}>
          SYS.INIT
        </div>
      </div>
    );
  }

  // Home Page
  if (currentView === 'home') {
    return (
      <div style={styles.container}>
        {/* Header Stripe */}
        <div style={styles.headerStripe} />

        {/* Header */}
        <header style={styles.header}>
          <div style={styles.headerContent}>
            <div style={styles.logoSection}>
              <div style={styles.titleSection}>
                <h1 style={styles.titleAr}>اللجنة المحلية - الحسينية</h1>
                <p style={styles.titleHe}>הוועדה המקומית חוסניה</p>
              </div>
            </div>
            <nav style={styles.nav}>
              <div style={styles.navBadge}>
                <span style={{ width: '8px', height: '8px', background: '#276749', borderRadius: '50%' }} />
                <span>الخدمات متاحة</span>
              </div>
            </nav>
          </div>
        </header>

        {/* Main Content */}
        <main style={styles.main}>
          {/* Info Box */}
          <div style={styles.infoBox}>
            <span style={styles.infoIcon}>ℹ</span>
            <p style={styles.infoText}>
              مرحباً بكم في بوابة الخدمات الإلكترونية الرسمية للجنة المحلية الحسينية.
              جميع الخدمات متاحة على مدار الساعة.
              <br />
              <span style={{ color: '#718096' }}>
                ברוכים הבאים לפורטל השירותים הדיגיטליים הרשמי של הוועדה המקומית חוסניה.
              </span>
            </p>
          </div>

{/* Services by Category */}
          {serviceCategories.map((category) => (
            <div key={category.id} style={{ marginBottom: '32px' }}>
              {/* Category Header */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '16px',
                paddingBottom: '12px',
                borderBottom: '2px solid #e2e8f0'
              }}>
                <span style={{ fontSize: '24px' }}>{category.icon}</span>
                <div>
                  <h2 style={{
                    margin: 0,
                    fontSize: '1.1rem',
                    fontWeight: '700',
                    color: '#1a365d'
                  }}>{category.titleAr}</h2>
                  <span style={{
                    fontSize: '0.85rem',
                    color: '#718096'
                  }}>{category.titleHe}</span>
                </div>
              </div>

              {/* Category Services Grid */}
              <div style={styles.servicesGrid}>
                {category.services.map((service) => (
                  <div
                    key={service.id}
                    style={styles.serviceCard}
                    onClick={() => navigateTo(service.id)}
                    onMouseEnter={(e) => {
                      Object.assign(e.currentTarget.style, styles.serviceCardHover);
                      e.currentTarget.querySelector('.arrow').style.color = '#2b6cb0';
                      e.currentTarget.querySelector('.arrow').style.transform = 'translateY(-50%) translateX(-4px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#e2e8f0';
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.querySelector('.arrow').style.color = '#a0aec0';
                      e.currentTarget.querySelector('.arrow').style.transform = 'translateY(-50%)';
                    }}
                  >
                    <div style={styles.serviceCardTop} />
                    <div style={styles.serviceHeader}>
                      <div style={styles.serviceIcon}>{service.icon}</div>
                      <div style={styles.serviceTitles}>
                        <h3 style={styles.serviceTitleHe}>{service.titleHe}</h3>
                        <p style={styles.serviceTitleAr}>{service.titleAr}</p>
                      </div>
                    </div>
                    <p style={styles.serviceDesc}>
                      {service.descAr}
                      <br />
                      <span style={{ color: '#a0aec0' }}>{service.descHe}</span>
                    </p>
                    <span className="arrow" style={styles.serviceArrow}>←</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </main>

        {/* Footer */}
        <footer style={styles.footer}>
          <div style={styles.footerContent}>
            <div style={styles.footerDivider} />
            <h3 style={styles.footerTitle}>اللجنة المحلية - الحسينية</h3>
            <p style={styles.footerText}>
              הוועדה המקומית חוסניה | جميع الحقوق محفوظة © {new Date().getFullYear()}
            </p>
          </div>
        </footer>

        {/* Admin Access Button */}
        <div
          onClick={() => setShowAdminPrompt(true)}
          style={{
            position: 'fixed',
            bottom: '20px',
            left: '20px',
            width: '44px',
            height: '44px',
            background: '#ffffff',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 1000,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            border: '1px solid #e2e8f0',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
          }}
        >
          <span style={{ fontSize: '20px' }}>⚙</span>
        </div>

        {/* Admin Login Modal */}
        {showAdminPrompt && (
          <div
            style={styles.modalOverlay}
            onClick={() => setShowAdminPrompt(false)}
          >
            <div
              style={styles.modal}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={styles.modalHeader}>
                <h3 style={styles.modalTitle}>כניסת מנהל | دخول المدير</h3>
              </div>
              <div style={styles.modalBody}>
                <input
                  type="password"
                  placeholder="••••"
                  autoFocus
                  style={styles.modalInput}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#2b6cb0';
                    e.target.style.boxShadow = '0 0 0 3px rgba(43, 108, 176, 0.1)';
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
                        e.target.style.borderColor = '#9b2c2c';
                      }
                    } else if (e.key === 'Escape') {
                      setShowAdminPrompt(false);
                    }
                  }}
                />
                <button
                  onClick={() => setShowAdminPrompt(false)}
                  style={styles.modalBtn}
                  onMouseEnter={(e) => {
                    e.target.style.background = '#e2e8f0';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = '#edf2f7';
                  }}
                >
                  ביטול | إلغاء
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Admin Dashboard
  if (currentView === 'admin') {
    return <AdminDashboard />;
  }

  // Other Views
  const views = {
    eligibility: ResidentEligibilityChecker,
    certificate: ResidentCertificateLookup,
    documentAuth: DocumentAuthenticationRequest,
    tenders: TenderAnnouncements,
    officialDoc: OfficialDocumentRequest,
    tracker: RequestTracker,
    protocols: MeetingProtocols
  };

  const ViewComponent = views[currentView];

  if (ViewComponent) {
    return (
      <div style={styles.container}>
        <div style={styles.headerStripe} />
        <BackButton />
        <ViewComponent />
      </div>
    );
  }

  return null;
}

export default App;
