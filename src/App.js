import React, { useState, useEffect } from 'react';
import ResidentCertificateLookup from './ResidentCertificateLookup';
import ResidentEligibilityChecker from './ResidentEligibilityChecker';
import DocumentAuthenticationRequest from './DocumentAuthenticationRequest';
import TenderAnnouncements from './TenderAnnouncements';
import OfficialDocumentRequest from './OfficialDocumentRequest';
import RequestTracker from './RequestTracker';
import AdminDashboard from './AdminDashboard';

// Helper function to log visits
const logVisit = async (page) => {
  try {
    await fetch('http://localhost:3001/api/visit/log', {
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
    { id: 'eligibility', icon: '✓', titleHe: 'בדיקת זכאות', titleAr: 'فحص الاستحقاق', desc: 'בדוק זכאות לאישור תושב' },
    { id: 'certificate', icon: '⬇', titleHe: 'אישור תושבות', titleAr: 'شهادة السكن', desc: 'הורדת אישור מיידית' },
    { id: 'documentAuth', icon: '✓', titleHe: 'אימות מסמכים', titleAr: 'مصادقة المستندات', desc: 'אימות רשמי של מסמכים' },
    { id: 'tenders', icon: '☰', titleHe: 'מכרזים', titleAr: 'المناقصات', desc: 'צפייה והגשת הצעות' },
    { id: 'officialDoc', icon: '✎', titleHe: 'מסמך רשמי', titleAr: 'مستند رسمي', desc: 'בקשה להכנת מסמך' },
    { id: 'tracker', icon: '🔍', titleHe: 'מעקב בקשות', titleAr: 'تتبع الطلبات', desc: 'מעקב אחר סטטוס הבקשה' }
  ];

  const BackButton = () => (
    <button
      onClick={() => setCurrentView('home')}
      style={{
        position: 'fixed',
        top: 24,
        right: 24,
        zIndex: 1000,
        padding: '14px 28px',
        background: '#1a365d',
        border: 'none',
        borderRadius: '8px',
        fontSize: '15px',
        fontWeight: '700',
        color: '#fff',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        fontFamily: 'inherit',
        transition: 'all 0.2s ease',
        boxShadow: '0 4px 12px rgba(26, 54, 93, 0.4)'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = '#2c5282';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = '#1a365d';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      ← חזרה לתפריט
    </button>
  );

  if (currentView === 'home') {
    return (
      <div
        dir="rtl"
        style={{
          minHeight: '100vh',
          background: '#f8fafc',
          fontFamily: "'Segoe UI', 'Arial', sans-serif"
        }}
      >
        {/* Admin Login Modal */}
        {showAdminPrompt && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
          }}>
            <div style={{
              background: '#fff',
              padding: '32px',
              borderRadius: '16px',
              textAlign: 'center',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
            }}>
              <h3 style={{ margin: '0 0 20px 0', color: '#1a365d', fontSize: '18px' }}>
                כניסת מנהל
              </h3>
              <input
                type="password"
                placeholder="הזן סיסמה"
                autoFocus
                style={{
                  padding: '12px 16px',
                  fontSize: '16px',
                  border: '2px solid #e2e8f0',
                  borderRadius: '8px',
                  width: '200px',
                  textAlign: 'center',
                  marginBottom: '16px'
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    if (e.target.value === '5587') {
                      setCurrentView('admin');
                      setShowAdminPrompt(false);
                    } else {
                      e.target.value = '';
                      e.target.style.borderColor = '#c53030';
                    }
                  } else if (e.key === 'Escape') {
                    setShowAdminPrompt(false);
                  }
                }}
              />
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <button
                  onClick={() => setShowAdminPrompt(false)}
                  style={{
                    padding: '10px 24px',
                    background: '#e2e8f0',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                >
                  ביטול
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <header style={{
          background: 'linear-gradient(135deg, #1e3a5f 0%, #1a365d 50%, #153e75 100%)',
          padding: '40px 24px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Decorative Pattern */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.05,
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            pointerEvents: 'none'
          }} />

          {/* Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 28px',
            background: 'rgba(255,255,255,0.15)',
            borderRadius: '50px',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              background: '#48bb78',
              borderRadius: '50%',
              boxShadow: '0 0 8px #48bb78'
            }} />
            <span style={{ color: '#fff', fontSize: '15px', fontWeight: '600' }}>
              منظومة الخدمات الإلكترونية الرسمية | מערכת שירותים דיגיטליים רשמית
            </span>
          </div>
        </header>

        {/* Services Section */}
        <main style={{
          maxWidth: '1100px',
          margin: '0 auto',
          padding: '50px 24px'
        }}>
          {/* Section Title */}
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h2 style={{
              fontSize: '28px',
              fontWeight: '800',
              color: '#1a365d',
              margin: '0 0 8px 0'
            }}>
              الخدمات المتاحة
            </h2>
            <p style={{
              fontSize: '16px',
              color: '#718096',
              margin: 0
            }}>
              اختر الخدمة التي تحتاجها
            </p>
          </div>

          {/* Services Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '20px'
          }}>
            {services.map((service, index) => {
              const isHovered = hoveredCard === service.id;

              return (
                <div
                  key={service.id}
                  onClick={() => setCurrentView(service.id)}
                  onMouseEnter={() => setHoveredCard(service.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                  style={{
                    background: '#fff',
                    borderRadius: '16px',
                    padding: '28px',
                    cursor: 'pointer',
                    border: '2px solid',
                    borderColor: isHovered ? '#1a365d' : '#e2e8f0',
                    transition: 'all 0.25s ease',
                    transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
                    boxShadow: isHovered
                      ? '0 20px 40px rgba(26, 54, 93, 0.15)'
                      : '0 4px 12px rgba(0,0,0,0.05)',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '20px',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  {/* Number Badge */}
                  <div style={{
                    position: 'absolute',
                    top: '16px',
                    left: '16px',
                    fontSize: '12px',
                    fontWeight: '800',
                    color: isHovered ? '#1a365d' : '#cbd5e0',
                    transition: 'color 0.25s ease'
                  }}>
                    0{index + 1}
                  </div>

                  {/* Icon */}
                  <div style={{
                    width: '64px',
                    height: '64px',
                    background: isHovered ? '#1a365d' : '#edf2f7',
                    borderRadius: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '28px',
                    color: isHovered ? '#fff' : '#1a365d',
                    transition: 'all 0.25s ease',
                    flexShrink: 0
                  }}>
                    {service.icon}
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1 }}>
                    <h3 style={{
                      fontSize: '20px',
                      fontWeight: '800',
                      color: '#1a365d',
                      margin: '0 0 4px 0'
                    }}>
                      {service.titleHe}
                    </h3>
                    <p style={{
                      fontSize: '16px',
                      color: '#4a5568',
                      margin: '0 0 8px 0',
                      fontWeight: '600'
                    }}>
                      {service.titleAr}
                    </p>
                    <p style={{
                      fontSize: '14px',
                      color: '#718096',
                      margin: 0
                    }}>
                      {service.desc}
                    </p>
                  </div>

                  {/* Arrow */}
                  <div style={{
                    width: '40px',
                    height: '40px',
                    background: isHovered ? '#1a365d' : '#edf2f7',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: isHovered ? '#fff' : '#1a365d',
                    fontSize: '20px',
                    transition: 'all 0.25s ease',
                    alignSelf: 'center',
                    transform: isHovered ? 'translateX(-4px)' : 'translateX(0)'
                  }}>
                    ←
                  </div>
                </div>
              );
            })}
          </div>
        </main>

        {/* Footer */}
        <footer style={{
          background: '#1a365d',
          padding: '40px 24px',
          textAlign: 'center'
        }}>
          <div style={{
            maxWidth: '800px',
            margin: '0 auto'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '40px',
              marginBottom: '24px',
              flexWrap: 'wrap'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: '800', color: '#fff' }}>24/7</div>
                <div style={{ fontSize: '13px', color: '#a0aec0' }}>خدمة متواصلة</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: '800', color: '#fff' }}>100%</div>
                <div style={{ fontSize: '13px', color: '#a0aec0' }}>رسمي وموثوق</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: '800', color: '#fff' }}>5+</div>
                <div style={{ fontSize: '13px', color: '#a0aec0' }}>خدمات إلكترونية</div>
              </div>
            </div>
            <div style={{
              borderTop: '1px solid rgba(255,255,255,0.1)',
              paddingTop: '24px'
            }}>
              <p style={{ fontSize: '14px', color: '#a0aec0', margin: 0 }}>
                © {new Date().getFullYear()} جميع الحقوق محفوظة | כל הזכויות שמורות
              </p>
            </div>
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
      <div style={{
        minHeight: '100vh',
        background: '#f8fafc',
        fontFamily: "'Segoe UI', 'Arial', sans-serif"
      }}>
        <BackButton />
        <ViewComponent />
      </div>
    );
  }

  return null;
}

export default App;
