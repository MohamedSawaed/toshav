import React, { useState, useEffect } from 'react';
import ResidentCertificateLookup from './ResidentCertificateLookup';
import ResidentEligibilityChecker from './ResidentEligibilityChecker';
import DocumentAuthenticationRequest from './DocumentAuthenticationRequest';
import TenderAnnouncements from './TenderAnnouncements';
import OfficialDocumentRequest from './OfficialDocumentRequest';
import AdminDashboard from './AdminDashboard';

// Inject global styles
const injectStyles = () => {
  if (document.getElementById('app-styles')) return;
  
  const styleSheet = document.createElement('style');
  styleSheet.id = 'app-styles';
  styleSheet.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;500;600;700;800&display=swap');
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Heebo', sans-serif;
      background: #0a0f1a;
    }
    
    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-10px); }
    }
    
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.7; }
    }
    
    @keyframes slideUp {
      from { opacity: 0; transform: translateY(30px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    .home-card:hover {
      transform: translateY(-8px) !important;
      border-color: rgba(59, 130, 246, 0.4) !important;
      box-shadow: 0 20px 60px rgba(59, 130, 246, 0.15) !important;
    }
    
    .home-card:hover .card-icon {
      transform: scale(1.1);
    }
    
    .back-btn:hover {
      background: rgba(255, 255, 255, 0.15) !important;
      transform: translateX(4px);
    }
  `;
  document.head.appendChild(styleSheet);
};

function App() {
  const [currentView, setCurrentView] = useState('home');
  const [adminClickCount, setAdminClickCount] = useState(0);

  useEffect(() => {
    injectStyles();
  }, []);

  // Secret admin access: click logo 5 times
  const handleLogoClick = () => {
    const newCount = adminClickCount + 1;
    setAdminClickCount(newCount);

    if (newCount >= 5) {
      setCurrentView('admin');
      setAdminClickCount(0);
    }

    // Reset counter after 3 seconds
    setTimeout(() => {
      setAdminClickCount(0);
    }, 3000);
  };

  // Back button component
  const BackButton = () => (
    <button
      onClick={() => setCurrentView('home')}
      className="back-btn"
      style={styles.backBtn}
    >
      <svg viewBox="0 0 24 24" fill="none" style={{ width: 20, height: 20 }}>
        <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      חזרה לתפריט הראשי
    </button>
  );

  // Home/Selection screen
  if (currentView === 'home') {
    return (
      <div dir="rtl" style={styles.container}>
        {/* Background Effects */}
        <div style={styles.bgGradient} />
        <div style={styles.bgOrb1} />
        <div style={styles.bgOrb2} />
        <div style={styles.bgOrb3} />
        <div style={styles.bgGrid} />

        <div style={styles.wrapper}>
          {/* Header */}
          <header style={styles.header}>
            <div style={styles.logoContainer}>
              <div
                style={{ ...styles.logo, cursor: 'pointer' }}
                onClick={handleLogoClick}
                title="اضغط 5 مرات للوصول إلى لوحة التحكم"
              >
                <svg viewBox="0 0 48 48" fill="none" style={{ width: 36, height: 36 }}>
                  <path d="M24 4L4 14V34L24 44L44 34V14L24 4Z" fill="url(#homeGrad)" />
                  <path d="M24 4L4 14L24 24L44 14L24 4Z" fill="white" fillOpacity="0.3" />
                  <path d="M24 24V44L44 34V14L24 24Z" fill="white" fillOpacity="0.15" />
                  <defs>
                    <linearGradient id="homeGrad" x1="4" y1="4" x2="44" y2="44">
                      <stop stopColor="#60a5fa" />
                      <stop offset="1" stopColor="#3b82f6" />
                    </linearGradient>
                  </defs>
                </svg>
                {adminClickCount > 0 && (
                  <div style={{
                    position: 'absolute',
                    top: '-10px',
                    right: '-10px',
                    background: '#3b82f6',
                    color: 'white',
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>
                    {adminClickCount}
                  </div>
                )}
              </div>
            </div>
            <h1 style={styles.title}>منظومة خدمات للمواطن - الحسينية</h1>
            <p style={styles.subtitle}>מערכת שירותי תושבים - חוסנייה</p>
          </header>

          {/* Cards Container */}
          <div style={styles.cardsContainer}>
            {/* Card 1 - Eligibility Check */}
            <div
              className="home-card"
              style={styles.card}
              onClick={() => setCurrentView('eligibility')}
            >
              <div className="card-icon" style={{ ...styles.cardIcon, background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
                <svg viewBox="0 0 24 24" fill="none" style={{ width: 32, height: 32 }}>
                  <path d="M9 11L12 14L22 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M21 12V19C21 20.1 20.1 21 19 21H5C3.9 21 3 20.1 3 19V5C3 3.9 3.9 3 5 3H16" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h2 style={styles.cardTitle}>בדיקת זכאות</h2>
              <p style={styles.cardDesc}>בדוק האם את/ה זכאי/ת לקבלת אישור תושב ביישוב מזכה</p>
              <div style={styles.cardArrow}>
                <svg viewBox="0 0 24 24" fill="none" style={{ width: 20, height: 20 }}>
                  <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div style={styles.cardBadge}>שאלון אינטראקטיבי</div>
            </div>

            {/* Card 2 - Certificate Download */}
            <div
              className="home-card"
              style={styles.card}
              onClick={() => setCurrentView('certificate')}
            >
              <div className="card-icon" style={{ ...styles.cardIcon, background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)' }}>
                <svg viewBox="0 0 24 24" fill="none" style={{ width: 32, height: 32 }}>
                  <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M14 2V8H20" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 18V12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9 15L12 18L15 15" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h2 style={styles.cardTitle}>הורדת אישור תושבות</h2>
              <p style={styles.cardDesc}>הזן תעודת זהות והורד את אישור התושבות שלך</p>
              
              {/* Requirements List */}
              <div style={styles.requirementsList}>
                <p style={styles.requirementsTitle}>תנאים לקבלת האישור:</p>
                <div style={styles.requirementItem}>
                  <span style={styles.checkMark}>✓</span>
                  <span>כרטסת מיסים ארנונה של הרשות</span>
                </div>
                <div style={styles.requirementItem}>
                  <span style={styles.checkMark}>✓</span>
                  <span>הרישום בתעודת הזהות של הנ"ל - תושב חוסנייה</span>
                </div>
                <div style={styles.requirementItem}>
                  <span style={styles.checkMark}>✓</span>
                  <span>חשבון מים</span>
                </div>
              </div>
              
              <div style={styles.cardArrow}>
                <svg viewBox="0 0 24 24" fill="none" style={{ width: 20, height: 20 }}>
                  <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div style={{ ...styles.cardBadge, background: 'rgba(34, 197, 94, 0.15)', color: '#4ade80' }}>216 תושבים</div>
            </div>

            {/* Card 3 - Document Authentication Request */}
            <div
              className="home-card"
              style={styles.card}
              onClick={() => setCurrentView('documentAuth')}
            >
              <div className="card-icon" style={{ ...styles.cardIcon, background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' }}>
                <svg viewBox="0 0 24 24" fill="none" style={{ width: 32, height: 32 }}>
                  <path d="M9 12L11 14L15 10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h2 style={styles.cardTitle}>אימות מסמכים</h2>
              <h3 style={styles.cardTitleAr}>طلب مصادقة مستند</h3>
              <p style={styles.cardDesc}>הגש בקשה לאימות מסמכים רשמיים על ידי הוועדה המקומית</p>
              
              {/* Document Types */}
              <div style={styles.docTypesList}>
                <p style={styles.requirementsTitle}>סוגי מסמכים:</p>
                <div style={styles.docTypesGrid}>
                  <span style={styles.docTypeTag}>📜 תעודות</span>
                  <span style={styles.docTypeTag}>✍️ התחייבויות</span>
                  <span style={styles.docTypeTag}>📋 הצהרות</span>
                  <span style={styles.docTypeTag}>🎓 מסמכי לימודים</span>
                  <span style={styles.docTypeTag}>💼 מסמכי עבודה</span>
                </div>
              </div>
              
              <div style={styles.cardArrow}>
                <svg viewBox="0 0 24 24" fill="none" style={{ width: 20, height: 20 }}>
                  <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div style={{ ...styles.cardBadge, background: 'rgba(139, 92, 246, 0.15)', color: '#a78bfa' }}>טופס דיגיטלי</div>
            </div>

            {/* Card 4 - Tender Announcements */}
            <div
              className="home-card"
              style={styles.card}
              onClick={() => setCurrentView('tenders')}
            >
              <div className="card-icon" style={{ ...styles.cardIcon, background: 'linear-gradient(135deg, #d4a853 0%, #b8922e 100%)' }}>
                <svg viewBox="0 0 24 24" fill="none" style={{ width: 32, height: 32 }}>
                  <path d="M19 4H5C3.89543 4 3 4.89543 3 6V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V6C21 4.89543 20.1046 4 19 4Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M16 2V6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M8 2V6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M3 10H21" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M8 14H8.01" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 14H12.01" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M16 14H16.01" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M8 18H8.01" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 18H12.01" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h2 style={styles.cardTitle}>מכרזים</h2>
              <h3 style={styles.cardTitleAr}>إعلانات المناقصات</h3>
              <p style={styles.cardDesc}>צפה במכרזים פתוחים והגש הצעות לעבודות ושירותים</p>
              
              {/* Tender Types */}
              <div style={{ ...styles.docTypesList, background: 'rgba(212, 168, 83, 0.08)', border: '1px solid rgba(212, 168, 83, 0.15)' }}>
                <p style={styles.requirementsTitle}>סוגי מכרזים:</p>
                <div style={styles.docTypesGrid}>
                  <span style={{ ...styles.docTypeTag, background: 'rgba(212, 168, 83, 0.15)', color: '#fbbf24' }}>🏗️ בנייה</span>
                  <span style={{ ...styles.docTypeTag, background: 'rgba(212, 168, 83, 0.15)', color: '#fbbf24' }}>🔧 תחזוקה</span>
                  <span style={{ ...styles.docTypeTag, background: 'rgba(212, 168, 83, 0.15)', color: '#fbbf24' }}>📦 אספקה</span>
                </div>
              </div>
              
              <div style={styles.cardArrow}>
                <svg viewBox="0 0 24 24" fill="none" style={{ width: 20, height: 20 }}>
                  <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div style={{ ...styles.cardBadge, background: 'rgba(212, 168, 83, 0.15)', color: '#fbbf24' }}>1 מכרז פתוח</div>
            </div>

            {/* Card 5 - Official Document Request */}
            <div
              className="home-card"
              style={styles.card}
              onClick={() => setCurrentView('officialDoc')}
            >
              <div className="card-icon" style={{ ...styles.cardIcon, background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }}>
                <svg viewBox="0 0 24 24" fill="none" style={{ width: 32, height: 32 }}>
                  <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M14 2V8H20" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M16 13H8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M16 17H8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M10 9H9H8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h2 style={styles.cardTitle}>הכנת מסמך רשמי</h2>
              <h3 style={styles.cardTitleAr}>طلب إعداد مستند رسمي</h3>
              <p style={styles.cardDesc}>הגש בקשה להכנת מסמך רשמי מטעם הוועדה המקומית</p>
              
              {/* Document Types Preview */}
              <div style={{ ...styles.docTypesList, background: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.15)' }}>
                <p style={styles.requirementsTitle}>סוגי מסמכים:</p>
                <div style={styles.docTypesGrid}>
                  <span style={{ ...styles.docTypeTag, background: 'rgba(59, 130, 246, 0.15)', color: '#93c5fd' }}>🏠 אישור תושבות</span>
                  <span style={{ ...styles.docTypeTag, background: 'rgba(59, 130, 246, 0.15)', color: '#93c5fd' }}>💼 אישור העסקה</span>
                  <span style={{ ...styles.docTypeTag, background: 'rgba(59, 130, 246, 0.15)', color: '#93c5fd' }}>📝 המלצות</span>
                </div>
              </div>
              
              <div style={styles.cardArrow}>
                <svg viewBox="0 0 24 24" fill="none" style={{ width: 20, height: 20 }}>
                  <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div style={{ ...styles.cardBadge, background: 'rgba(59, 130, 246, 0.15)', color: '#93c5fd' }}>טופס מקוון</div>
            </div>
          </div>

          {/* Footer */}
          <footer style={styles.footer}>
            <p>© {new Date().getFullYear()} ועד מקומי חוסנייה • כל הזכויות שמורות</p>
          </footer>
        </div>
      </div>
    );
  }

  // Eligibility Checker View
  if (currentView === 'eligibility') {
    return (
      <div style={{ position: 'relative' }}>
        <div style={styles.backBtnContainer}>
          <BackButton />
        </div>
        <ResidentEligibilityChecker />
      </div>
    );
  }

  // Certificate Lookup View
  if (currentView === 'certificate') {
    return (
      <div style={{ position: 'relative' }}>
        <div style={styles.backBtnContainer}>
          <BackButton />
        </div>
        <ResidentCertificateLookup />
      </div>
    );
  }

  // Document Authentication View
  if (currentView === 'documentAuth') {
    return (
      <div style={{ position: 'relative' }}>
        <div style={styles.backBtnContainer}>
          <BackButton />
        </div>
        <DocumentAuthenticationRequest />
      </div>
    );
  }

  // Tender Announcements View
  if (currentView === 'tenders') {
    return (
      <div style={{ position: 'relative' }}>
        <div style={styles.backBtnContainer}>
          <BackButton />
        </div>
        <TenderAnnouncements />
      </div>
    );
  }

  // Official Document Request View
  if (currentView === 'officialDoc') {
    return (
      <div style={{ position: 'relative' }}>
        <div style={styles.backBtnContainer}>
          <BackButton />
        </div>
        <OfficialDocumentRequest />
      </div>
    );
  }

  // Admin Dashboard View
  if (currentView === 'admin') {
    return <AdminDashboard />;
  }

  return null;
}

const styles = {
  container: {
    minHeight: '100vh',
    background: '#0a0f1a',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: "'Heebo', sans-serif",
  },
  bgGradient: {
    position: 'absolute',
    inset: 0,
    background: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(59, 130, 246, 0.12), transparent)',
  },
  bgOrb1: {
    position: 'absolute',
    top: '5%',
    right: '-15%',
    width: '600px',
    height: '600px',
    background: 'radial-gradient(circle, rgba(59, 130, 246, 0.08) 0%, transparent 70%)',
    borderRadius: '50%',
    filter: 'blur(60px)',
  },
  bgOrb2: {
    position: 'absolute',
    bottom: '10%',
    left: '-10%',
    width: '500px',
    height: '500px',
    background: 'radial-gradient(circle, rgba(139, 92, 246, 0.06) 0%, transparent 70%)',
    borderRadius: '50%',
    filter: 'blur(60px)',
  },
  bgOrb3: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '800px',
    height: '800px',
    background: 'radial-gradient(circle, rgba(34, 197, 94, 0.04) 0%, transparent 60%)',
    borderRadius: '50%',
    filter: 'blur(80px)',
  },
  bgGrid: {
    position: 'absolute',
    inset: 0,
    backgroundImage: `
      linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)
    `,
    backgroundSize: '80px 80px',
  },
  wrapper: {
    position: 'relative',
    zIndex: 1,
    maxWidth: '1100px',
    margin: '0 auto',
    padding: '60px 24px',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    textAlign: 'center',
    marginBottom: '60px',
  },
  logoContainer: {
    marginBottom: '24px',
  },
  logo: {
    width: '80px',
    height: '80px',
    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(59, 130, 246, 0.05) 100%)',
    borderRadius: '24px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid rgba(59, 130, 246, 0.2)',
    boxShadow: '0 8px 32px rgba(59, 130, 246, 0.15)',
    animation: 'float 4s ease-in-out infinite',
  },
  title: {
    fontSize: '36px',
    fontWeight: '800',
    color: '#fff',
    margin: '0 0 12px 0',
    letterSpacing: '-0.02em',
  },
  subtitle: {
    fontSize: '18px',
    color: 'rgba(255,255,255,0.5)',
    margin: 0,
    fontWeight: '400',
  },
  cardsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '24px',
    flex: 1,
  },
  card: {
    background: 'rgba(255,255,255,0.03)',
    backdropFilter: 'blur(20px)',
    borderRadius: '28px',
    border: '1px solid rgba(255,255,255,0.08)',
    padding: '36px',
    cursor: 'pointer',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'relative',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    minHeight: '280px',
  },
  cardIcon: {
    width: '72px',
    height: '72px',
    borderRadius: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '24px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
    transition: 'transform 0.3s ease',
  },
  cardTitle: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#fff',
    margin: '0 0 8px 0',
  },
  cardTitleAr: {
    fontSize: '18px',
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
    margin: '0 0 12px 0',
    fontFamily: "'Tajawal', 'Heebo', sans-serif",
  },
  cardDesc: {
    fontSize: '15px',
    color: 'rgba(255,255,255,0.5)',
    margin: '0 0 24px 0',
    lineHeight: '1.6',
  },
  cardArrow: {
    width: '44px',
    height: '44px',
    background: 'rgba(255,255,255,0.08)',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'rgba(255,255,255,0.6)',
    alignSelf: 'flex-start',
    marginTop: 'auto',
  },
  cardBadge: {
    position: 'absolute',
    top: '24px',
    left: '24px',
    background: 'rgba(245, 158, 11, 0.15)',
    color: '#fbbf24',
    padding: '6px 14px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
  },
  requirementsList: {
    background: 'rgba(34, 197, 94, 0.08)',
    border: '1px solid rgba(34, 197, 94, 0.15)',
    borderRadius: '14px',
    padding: '16px',
    marginBottom: '20px',
  },
  requirementsTitle: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: '13px',
    margin: '0 0 12px 0',
    fontWeight: '500',
  },
  requirementItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    color: 'rgba(255,255,255,0.8)',
    fontSize: '14px',
    padding: '6px 0',
  },
  checkMark: {
    color: '#4ade80',
    fontWeight: '700',
    fontSize: '14px',
  },
  docTypesList: {
    background: 'rgba(139, 92, 246, 0.08)',
    border: '1px solid rgba(139, 92, 246, 0.15)',
    borderRadius: '14px',
    padding: '16px',
    marginBottom: '20px',
  },
  docTypesGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
  },
  docTypeTag: {
    background: 'rgba(139, 92, 246, 0.15)',
    color: '#c4b5fd',
    padding: '6px 12px',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: '500',
  },
  footer: {
    marginTop: '60px',
    textAlign: 'center',
    color: 'rgba(255,255,255,0.25)',
    fontSize: '13px',
  },
  backBtnContainer: {
    position: 'fixed',
    top: '20px',
    right: '20px',
    zIndex: 1000,
  },
  backBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 20px',
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    borderRadius: '12px',
    color: '#fff',
    fontSize: '14px',
    fontWeight: '500',
    fontFamily: "'Heebo', sans-serif",
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    direction: 'rtl',
  },
};

export default App;