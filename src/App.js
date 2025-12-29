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

  const services = [
    {
      id: 'eligibility',
      icon: '✓',
      titleHe: 'בדיקת זכאות',
      titleAr: 'فحص الاستحقاق',
      descHe: 'בדוק זכאות לאישור תושב',
      descAr: 'تحقق من أهليتك للحصول على شهادة السكن'
    },
    {
      id: 'certificate',
      icon: '📄',
      titleHe: 'תנאים להפקה עצמית של אישור תושב',
      titleAr: 'شروط الاستخراج الذاتي لشهادة السكن',
      descHe: '',
      descAr: ''
    },
    {
      id: 'documentAuth',
      icon: '✔',
      titleHe: 'אימות מסמכים',
      titleAr: 'مصادقة المستندات',
      descHe: 'אימות רשמי של מסמכים',
      descAr: 'طلب مصادقة رسمية على المستندات'
    },
    {
      id: 'tenders',
      icon: '📋',
      titleHe: 'מכרזים',
      titleAr: 'المناقصات',
      descHe: 'צפייה במכרזים פעילים',
      descAr: 'عرض المناقصات النشطة'
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
    },
    {
      id: 'protocols',
      icon: '📑',
      titleHe: 'פרוטוקולים',
      titleAr: 'بروتوكولات الجلسات',
      descHe: 'צפייה בפרוטוקולי ישיבות',
      descAr: 'عرض بروتوكولات جلسات اللجنة'
    }
  ];

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

  // Loading Screen - Geometric Mathematical Design
  if (currentView === 'splash') {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#0f172a',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Segoe UI', 'Arial', sans-serif",
        direction: 'rtl',
        opacity: splashFading ? 0 : 1,
        transition: 'opacity 0.4s ease',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <style>{`
          @keyframes rotate {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes rotateReverse {
            0% { transform: rotate(360deg); }
            100% { transform: rotate(0deg); }
          }
          @keyframes pulse {
            0%, 100% { opacity: 0.4; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.05); }
          }
          @keyframes dash {
            0% { stroke-dashoffset: 283; }
            50% { stroke-dashoffset: 70; }
            100% { stroke-dashoffset: 283; }
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes dots {
            0%, 20% { opacity: 0; }
            40% { opacity: 1; }
            100% { opacity: 0; }
          }
        `}</style>

        {/* Background Grid Pattern */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(59, 130, 246, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59, 130, 246, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          opacity: 0.5
        }} />

        {/* Geometric Loader Container */}
        <div style={{
          position: 'relative',
          width: '120px',
          height: '120px',
          marginBottom: '32px'
        }}>
          {/* Outer Ring - Rotating */}
          <svg style={{
            position: 'absolute',
            width: '120px',
            height: '120px',
            animation: 'rotate 8s linear infinite'
          }}>
            <circle
              cx="60" cy="60" r="55"
              fill="none"
              stroke="rgba(59, 130, 246, 0.2)"
              strokeWidth="1"
            />
            <circle
              cx="60" cy="60" r="55"
              fill="none"
              stroke="#3b82f6"
              strokeWidth="2"
              strokeDasharray="30 20"
              strokeLinecap="round"
            />
          </svg>

          {/* Middle Ring - Counter Rotating */}
          <svg style={{
            position: 'absolute',
            width: '120px',
            height: '120px',
            animation: 'rotateReverse 6s linear infinite'
          }}>
            <circle
              cx="60" cy="60" r="42"
              fill="none"
              stroke="rgba(99, 102, 241, 0.15)"
              strokeWidth="1"
            />
            <circle
              cx="60" cy="60" r="42"
              fill="none"
              stroke="#6366f1"
              strokeWidth="1.5"
              strokeDasharray="15 25"
              strokeLinecap="round"
            />
          </svg>

          {/* Inner Progress Ring */}
          <svg style={{
            position: 'absolute',
            width: '120px',
            height: '120px',
            transform: 'rotate(-90deg)'
          }}>
            <circle
              cx="60" cy="60" r="28"
              fill="none"
              stroke="rgba(139, 92, 246, 0.1)"
              strokeWidth="3"
            />
            <circle
              cx="60" cy="60" r="28"
              fill="none"
              stroke="url(#gradient)"
              strokeWidth="3"
              strokeDasharray="176"
              strokeLinecap="round"
              style={{ animation: 'dash 2s ease-in-out infinite' }}
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="50%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
            </defs>
          </svg>

          {/* Center Hexagon */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            animation: 'pulse 2s ease-in-out infinite'
          }}>
            <svg width="36" height="36" viewBox="0 0 36 36">
              <polygon
                points="18,2 32,10 32,26 18,34 4,26 4,10"
                fill="none"
                stroke="url(#hexGradient)"
                strokeWidth="1.5"
              />
              <polygon
                points="18,8 26,13 26,23 18,28 10,23 10,13"
                fill="rgba(59, 130, 246, 0.1)"
                stroke="rgba(99, 102, 241, 0.5)"
                strokeWidth="1"
              />
              <defs>
                <linearGradient id="hexGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* Orbiting Dots */}
          {[0, 1, 2].map((i) => (
            <div key={i} style={{
              position: 'absolute',
              width: '120px',
              height: '120px',
              animation: `rotate ${4 + i}s linear infinite`,
              animationDelay: `${i * 0.3}s`
            }}>
              <div style={{
                position: 'absolute',
                top: '0',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '6px',
                height: '6px',
                background: `hsl(${220 + i * 30}, 80%, 60%)`,
                borderRadius: '50%',
                boxShadow: `0 0 10px hsl(${220 + i * 30}, 80%, 60%)`
              }} />
            </div>
          ))}
        </div>

        {/* Loading Text */}
        <div style={{
          textAlign: 'center',
          animation: 'fadeIn 0.6s ease'
        }}>
          <p style={{
            fontSize: '0.9rem',
            color: '#94a3b8',
            fontWeight: '400',
            margin: 0,
            letterSpacing: '3px',
            textTransform: 'uppercase'
          }}>
            <span style={{ animation: 'dots 1.4s infinite', animationDelay: '0s' }}>.</span>
            <span style={{ animation: 'dots 1.4s infinite', animationDelay: '0.2s' }}>.</span>
            <span style={{ animation: 'dots 1.4s infinite', animationDelay: '0.4s' }}>.</span>
          </p>
        </div>

        {/* Decorative Corner Lines */}
        <svg style={{ position: 'absolute', top: '20px', left: '20px', width: '60px', height: '60px', opacity: 0.3 }}>
          <path d="M0 40 L0 0 L40 0" fill="none" stroke="#3b82f6" strokeWidth="1" />
        </svg>
        <svg style={{ position: 'absolute', top: '20px', right: '20px', width: '60px', height: '60px', opacity: 0.3 }}>
          <path d="M60 40 L60 0 L20 0" fill="none" stroke="#3b82f6" strokeWidth="1" />
        </svg>
        <svg style={{ position: 'absolute', bottom: '20px', left: '20px', width: '60px', height: '60px', opacity: 0.3 }}>
          <path d="M0 20 L0 60 L40 60" fill="none" stroke="#3b82f6" strokeWidth="1" />
        </svg>
        <svg style={{ position: 'absolute', bottom: '20px', right: '20px', width: '60px', height: '60px', opacity: 0.3 }}>
          <path d="M60 20 L60 60 L20 60" fill="none" stroke="#3b82f6" strokeWidth="1" />
        </svg>
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

          {/* Services Grid */}
          <div style={styles.servicesGrid}>
            {services.map((service) => (
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
