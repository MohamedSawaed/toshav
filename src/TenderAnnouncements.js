import React, { useState, useEffect } from 'react';

const API_URL = 'http://localhost:3001/api';

const TenderAnnouncements = () => {
  const [selectedTender, setSelectedTender] = useState(null);
  const [tenders, setTenders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch published tenders from the backend
  useEffect(() => {
    fetchTenders();
  }, []);

  const fetchTenders = async () => {
    try {
      const response = await fetch(`${API_URL}/tenders/published`);
      const data = await response.json();

      // Filter only active tenders and map to the format we need
      const activeTenders = data
        .filter(tender => tender.status === 'active')
        .map(tender => ({
          id: tender.id,
          number: tender.id,
          title: tender.title,
          titleHe: tender.titleHe,
          type: tender.category,
          typeLabel: getCategoryLabel(tender.category),
          typeLabelHe: getCategoryLabelHe(tender.category),
          status: 'open',
          publishDate: new Date(tender.publishedAt || Date.now()).toISOString().split('T')[0],
          deadline: tender.deadline,
          deadlineTime: '14:00',
          description: tender.description,
          descriptionHe: tender.descriptionHe,
          requirements: Array.isArray(tender.requirements) ? tender.requirements : (tender.requirements ? tender.requirements.split('\n').filter(r => r.trim()) : []),
          scope: Array.isArray(tender.scope) ? tender.scope : (tender.scope ? tender.scope.split('\n').filter(s => s.trim()) : []),
          documents: Array.isArray(tender.documents) ? tender.documents : (tender.documents ? tender.documents.split('\n').filter(d => d.trim()) : []),
          contactPhone: tender.contactPhone || '04-1234567',
          contactEmail: tender.contactEmail || 'husniua.committe@gmail.com',
          estimatedBudget: tender.budget ? `₪ ${Number(tender.budget).toLocaleString()}` : 'غير محدد'
        }));

      setTenders(activeTenders);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching tenders:', error);
      setLoading(false);
    }
  };

  const getCategoryLabel = (category) => {
    const labels = {
      construction: 'بناء',
      maintenance: 'صيانة',
      supply: 'توريد'
    };
    return labels[category] || category;
  };

  const getCategoryLabelHe = (category) => {
    const labels = {
      construction: 'בנייה',
      maintenance: 'תחזוקה',
      supply: 'אספקה'
    };
    return labels[category] || category;
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'open':
        return { bg: 'rgba(34, 197, 94, 0.15)', color: '#4ade80', label: 'مفتوحة', labelHe: 'פתוח' };
      case 'closed':
        return { bg: 'rgba(239, 68, 68, 0.15)', color: '#f87171', label: 'مغلقة', labelHe: 'סגור' };
      case 'evaluation':
        return { bg: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', label: 'قيد التقييم', labelHe: 'בהערכה' };
      default:
        return { bg: 'rgba(148, 163, 184, 0.15)', color: '#94a3b8', label: 'غير محدد', labelHe: 'לא מוגדר' };
    }
  };

  const getTypeIcon = (type) => {
    const icons = {
      infrastructure: '🏗️',
      maintenance: '🔧',
      electricity: '⚡',
      cleaning: '🧹',
      supplies: '📦',
      construction: '🏢'
    };
    return icons[type] || '📋';
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const getDaysRemaining = (deadline) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div style={styles.container}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;600;700;800&display=swap');
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(212, 168, 83, 0.3); }
          50% { box-shadow: 0 0 40px rgba(212, 168, 83, 0.5); }
        }
        
        .tender-card {
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .tender-card:hover {
          transform: translateY(-6px);
          border-color: rgba(212, 168, 83, 0.4) !important;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3) !important;
        }
        
        .detail-btn:hover {
          background: linear-gradient(135deg, #d4a853 0%, #b8922e 100%) !important;
          color: #fff !important;
          transform: translateY(-2px);
        }
        
        .download-btn:hover {
          background: rgba(255, 255, 255, 0.15) !important;
          transform: translateY(-2px);
        }
        
        .modal-overlay {
          animation: fadeIn 0.3s ease-out;
        }
        
        .modal-content {
          animation: slideIn 0.4s ease-out;
        }
        
        .close-btn:hover {
          background: rgba(255, 255, 255, 0.15) !important;
          transform: rotate(90deg);
        }
        
        .section-item {
          transition: all 0.3s ease;
        }
        
        .section-item:hover {
          background: rgba(255, 255, 255, 0.05);
          padding-right: 20px;
        }
      `}</style>

      <div style={styles.wrapper}>
        {/* Header */}
        <header style={styles.header}>
          <div style={styles.headerContent}>
            <div style={styles.badge}>
              <span style={{ color: '#fff', fontSize: '15px', fontWeight: '600' }}>
                إعلانات المناقصات | מכרזים והזמנות להציע הצעות
              </span>
            </div>
          </div>
        </header>

        {/* Stats Bar */}
        <div style={styles.statsBar}>
          <div style={styles.statItem}>
            <span style={styles.statNumber}>{tenders.filter(t => t.status === 'open').length}</span>
            <span style={styles.statLabel}>مناقصات مفتوحة</span>
          </div>
          <div style={styles.statDivider} />
          <div style={styles.statItem}>
            <span style={styles.statNumber}>{tenders.length}</span>
            <span style={styles.statLabel}>إجمالي المناقصات</span>
          </div>
        </div>

        {/* Tenders List */}
        <div style={styles.tendersGrid}>
          {loading ? (
            <div style={styles.emptyState}>
              <span style={styles.emptyIcon}>⏳</span>
              <h3 style={styles.emptyTitle}>جاري تحميل المناقصات...</h3>
              <p style={styles.emptyText}>يرجى الانتظار</p>
            </div>
          ) : tenders.length === 0 ? (
            <div style={styles.emptyState}>
              <span style={styles.emptyIcon}>📭</span>
              <h3 style={styles.emptyTitle}>لا توجد مناقصات حالياً</h3>
              <p style={styles.emptyText}>سيتم نشر المناقصات الجديدة هنا</p>
            </div>
          ) : (
            tenders.map((tender, index) => {
              const status = getStatusStyle(tender.status);
              const daysRemaining = getDaysRemaining(tender.deadline);
              
              return (
                <div
                  key={tender.id}
                  className="tender-card"
                  style={{
                    ...styles.tenderCard,
                    animationDelay: `${index * 0.1}s`
                  }}
                >
                  {/* Card Header */}
                  <div style={styles.cardHeader}>
                    <div style={styles.tenderNumber}>
                      <span style={styles.numberLabel}>مناقصة رقم</span>
                      <span style={styles.numberValue}>{tender.number}</span>
                    </div>
                    <div style={{ ...styles.statusBadge, background: status.bg, color: status.color }}>
                      <span style={styles.statusDot} />
                      {status.label}
                    </div>
                  </div>

                  {/* Card Body */}
                  <div style={styles.cardBody}>
                    <div style={styles.typeIcon}>{getTypeIcon(tender.type)}</div>
                    <h2 style={styles.tenderTitle}>{tender.title}</h2>
                    <p style={styles.tenderTitleHe}>{tender.titleHe}</p>
                    
                    <div style={styles.typeBadge}>
                      <span>{tender.typeLabel}</span>
                      <span style={styles.typeDivider}>|</span>
                      <span>{tender.typeLabelHe}</span>
                    </div>

                    <p style={styles.tenderDesc}>{tender.description}</p>
                  </div>

                  {/* Card Footer */}
                  <div style={styles.cardFooter}>
                    <div style={styles.dateInfo}>
                      <div style={styles.dateRow}>
                        <span style={styles.dateIcon}>📅</span>
                        <div>
                          <span style={styles.dateLabel}>آخر موعد للتقديم</span>
                          <span style={styles.dateValue}>{formatDate(tender.deadline)}</span>
                        </div>
                      </div>
                      <div style={styles.dateRow}>
                        <span style={styles.dateIcon}>⏰</span>
                        <div>
                          <span style={styles.dateLabel}>حتى الساعة</span>
                          <span style={styles.dateValue}>{tender.deadlineTime}</span>
                        </div>
                      </div>
                    </div>

                    {daysRemaining > 0 && tender.status === 'open' && (
                      <div style={{
                        ...styles.daysRemaining,
                        background: daysRemaining <= 7 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(34, 197, 94, 0.15)',
                        color: daysRemaining <= 7 ? '#f87171' : '#4ade80'
                      }}>
                        <span style={styles.daysNumber}>{daysRemaining}</span>
                        <span style={styles.daysLabel}>يوم متبقي</span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div style={styles.cardActions}>
                    <button
                      className="detail-btn"
                      style={styles.detailBtn}
                      onClick={() => setSelectedTender(tender)}
                    >
                      <span>عرض التفاصيل</span>
                      <svg viewBox="0 0 24 24" fill="none" style={{ width: 18, height: 18 }}>
                        <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                    <button className="download-btn" style={styles.downloadBtn}>
                      <svg viewBox="0 0 24 24" fill="none" style={{ width: 20, height: 20 }}>
                        <path d="M21 15V19C21 20.1 20.1 21 19 21H5C3.9 21 3 20.1 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M7 10L12 15L17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span>كراسة الشروط</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <footer style={styles.footer}>
          <p>© {new Date().getFullYear()} اللجنة المحلية – قرية الحسينية • جميع الحقوق محفوظة</p>
        </footer>
      </div>

      {/* Detail Modal */}
      {selectedTender && (
        <div className="modal-overlay" style={styles.modalOverlay} onClick={() => setSelectedTender(null)}>
          <div className="modal-content" style={styles.modalContent} onClick={e => e.stopPropagation()}>
            {/* Modal Header */}
            <div style={styles.modalHeader}>
              <div>
                <div style={styles.modalNumber}>مناقصة رقم {selectedTender.number}</div>
                <h2 style={styles.modalTitle}>{selectedTender.title}</h2>
                <p style={styles.modalTitleHe}>{selectedTender.titleHe}</p>
              </div>
              <button className="close-btn" style={styles.closeBtn} onClick={() => setSelectedTender(null)}>
                <svg viewBox="0 0 24 24" fill="none" style={{ width: 24, height: 24 }}>
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div style={styles.modalBody}>
              {/* Description */}
              <div style={styles.modalSection}>
                <h3 style={styles.sectionTitle}>
                  <span style={styles.sectionIcon}>📋</span>
                  وصف المناقصة
                </h3>
                <p style={styles.sectionText}>{selectedTender.description}</p>
              </div>

              {/* Scope */}
              <div style={styles.modalSection}>
                <h3 style={styles.sectionTitle}>
                  <span style={styles.sectionIcon}>🎯</span>
                  نطاق العمل
                </h3>
                <ul style={styles.sectionList}>
                  {selectedTender.scope.map((item, i) => (
                    <li key={i} className="section-item" style={styles.sectionItem}>
                      <span style={styles.bulletIcon}>◆</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Requirements */}
              <div style={styles.modalSection}>
                <h3 style={styles.sectionTitle}>
                  <span style={styles.sectionIcon}>✅</span>
                  شروط المشاركة
                </h3>
                <ul style={styles.sectionList}>
                  {selectedTender.requirements.map((item, i) => (
                    <li key={i} className="section-item" style={styles.sectionItem}>
                      <span style={styles.bulletIcon}>◆</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Documents */}
              <div style={styles.modalSection}>
                <h3 style={styles.sectionTitle}>
                  <span style={styles.sectionIcon}>📎</span>
                  المستندات المطلوبة
                </h3>
                <ul style={styles.sectionList}>
                  {selectedTender.documents.map((item, i) => (
                    <li key={i} className="section-item" style={styles.sectionItem}>
                      <span style={styles.bulletIcon}>◆</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Important Dates */}
              <div style={styles.datesGrid}>
                <div style={styles.dateCard}>
                  <span style={styles.dateCardIcon}>📅</span>
                  <span style={styles.dateCardLabel}>تاريخ النشر</span>
                  <span style={styles.dateCardValue}>{formatDate(selectedTender.publishDate)}</span>
                </div>
                <div style={{ ...styles.dateCard, ...styles.deadlineCard }}>
                  <span style={styles.dateCardIcon}>⏰</span>
                  <span style={styles.dateCardLabel}>آخر موعد للتقديم</span>
                  <span style={styles.dateCardValue}>{formatDate(selectedTender.deadline)}</span>
                  <span style={styles.dateCardTime}>حتى الساعة {selectedTender.deadlineTime}</span>
                </div>
              </div>

              {/* Contact Info */}
              <div style={styles.contactCard}>
                <h3 style={styles.contactTitle}>
                  <span style={styles.sectionIcon}>📞</span>
                  للاستفسار والتواصل
                </h3>
                <div style={styles.contactGrid}>
                  <div style={styles.contactItem}>
                    <span style={styles.contactIcon}>📞</span>
                    <span style={styles.contactValue}>{selectedTender.contactPhone}</span>
                  </div>
                  <div style={styles.contactItem}>
                    <span style={styles.contactIcon}>📧</span>
                    <span style={styles.contactValue}>{selectedTender.contactEmail}</span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div style={styles.notesCard}>
                <h4 style={styles.notesTitle}>⚠️ ملاحظات هامة</h4>
                <ul style={styles.notesList}>
                  <li>اللجنة غير ملزمة بقبول أقل الأسعار</li>
                  <li>أي عرض غير مستوفٍ للشروط يُستبعد</li>
                  <li>للجنة الحق في إلغاء المناقصة دون إبداء الأسباب</li>
                  <li>تُقدّم العروض بمغلف مغلق إلى مكتب اللجنة المحلية</li>
                </ul>
              </div>
            </div>

            {/* Modal Footer */}
            <div style={styles.modalFooter}>
              <button className="download-btn" style={styles.modalDownloadBtn}>
                <svg viewBox="0 0 24 24" fill="none" style={{ width: 20, height: 20 }}>
                  <path d="M21 15V19C21 20.1 20.1 21 19 21H5C3.9 21 3 20.1 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M7 10L12 15L17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                تحميل كراسة الشروط
              </button>
              <button className="detail-btn" style={styles.inquiryBtn}>
                <svg viewBox="0 0 24 24" fill="none" style={{ width: 20, height: 20 }}>
                  <path d="M21 11.5C21 16.75 16.75 21 11.5 21C6.25 21 2 16.75 2 11.5C2 6.25 6.25 2 11.5 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M22 22L20 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M15 9H22M22 9L19 6M22 9L19 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                طلب توضيح
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    direction: 'rtl',
    fontFamily: '"Tajawal", "Segoe UI", sans-serif',
    background: '#f8fafc',
    position: 'relative',
    overflow: 'hidden',
  },
  wrapper: {
    position: 'relative',
    zIndex: 1,
    maxWidth: '900px',
    margin: '0 auto',
    padding: '0 24px 50px 24px',
  },
  header: {
    background: 'linear-gradient(135deg, #1e3a5f 0%, #1a365d 50%, #153e75 100%)',
    padding: '40px 24px',
    textAlign: 'center',
    margin: '0 -24px 40px -24px',
  },
  headerContent: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '12px',
    background: 'rgba(255,255,255,0.1)',
    padding: '12px 24px',
    borderRadius: '50px',
    border: '1px solid rgba(255,255,255,0.2)',
  },
  statsBar: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '40px',
    padding: '24px',
    background: '#fff',
    borderRadius: '16px',
    border: '2px solid #e2e8f0',
    marginBottom: '40px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
  },
  statItem: {
    textAlign: 'center',
  },
  statNumber: {
    display: 'block',
    fontSize: '36px',
    fontWeight: '800',
    color: '#1a365d',
    lineHeight: 1,
  },
  statLabel: {
    fontSize: '14px',
    color: '#718096',
    marginTop: '8px',
    display: 'block',
  },
  statDivider: {
    width: '1px',
    height: '50px',
    background: '#e2e8f0',
  },
  tendersGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  tenderCard: {
    background: '#fff',
    borderRadius: '16px',
    border: '2px solid #e2e8f0',
    overflow: 'hidden',
    animation: 'fadeIn 0.5s ease-out forwards',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 28px',
    background: '#f8fafc',
    borderBottom: '2px solid #e2e8f0',
  },
  tenderNumber: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  numberLabel: {
    fontSize: '12px',
    color: '#718096',
    fontWeight: '500',
  },
  numberValue: {
    fontSize: '20px',
    fontWeight: '800',
    color: '#1a365d',
    fontFamily: 'monospace',
    letterSpacing: '1px',
  },
  statusBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: '600',
  },
  statusDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: 'currentColor',
    animation: 'pulse 2s infinite',
  },
  cardBody: {
    padding: '28px',
  },
  typeIcon: {
    fontSize: '48px',
    marginBottom: '16px',
  },
  tenderTitle: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#1a365d',
    margin: '0 0 8px',
    lineHeight: 1.4,
  },
  tenderTitleHe: {
    fontSize: '16px',
    color: '#718096',
    margin: '0 0 16px',
    fontFamily: "'Heebo', sans-serif",
  },
  typeBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '10px',
    padding: '8px 16px',
    background: '#ebf8ff',
    borderRadius: '8px',
    fontSize: '13px',
    color: '#2b6cb0',
    marginBottom: '16px',
    border: '1px solid #bee3f8',
  },
  typeDivider: {
    opacity: 0.4,
  },
  tenderDesc: {
    fontSize: '15px',
    color: '#718096',
    lineHeight: 1.7,
    margin: 0,
  },
  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 28px',
    background: '#f8fafc',
    borderTop: '2px solid #e2e8f0',
  },
  dateInfo: {
    display: 'flex',
    gap: '24px',
  },
  dateRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  dateIcon: {
    fontSize: '20px',
  },
  dateLabel: {
    display: 'block',
    fontSize: '11px',
    color: '#718096',
  },
  dateValue: {
    display: 'block',
    fontSize: '14px',
    color: '#1a365d',
    fontWeight: '600',
  },
  daysRemaining: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '12px 20px',
    borderRadius: '12px',
  },
  daysNumber: {
    fontSize: '28px',
    fontWeight: '800',
    lineHeight: 1,
  },
  daysLabel: {
    fontSize: '11px',
    marginTop: '4px',
  },
  cardActions: {
    display: 'flex',
    gap: '12px',
    padding: '0 28px 28px',
  },
  detailBtn: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    padding: '14px 24px',
    background: '#1a365d',
    border: 'none',
    borderRadius: '10px',
    color: '#fff',
    fontSize: '15px',
    fontWeight: '600',
    fontFamily: '"Tajawal", sans-serif',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 12px rgba(26, 54, 93, 0.3)',
  },
  downloadBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '14px 20px',
    background: 'transparent',
    border: '2px solid #e2e8f0',
    borderRadius: '10px',
    color: '#1a365d',
    fontSize: '14px',
    fontWeight: '500',
    fontFamily: '"Tajawal", sans-serif',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  emptyState: {
    textAlign: 'center',
    padding: '80px 40px',
    background: '#fff',
    borderRadius: '16px',
    border: '2px dashed #e2e8f0',
  },
  emptyIcon: {
    fontSize: '64px',
    display: 'block',
    marginBottom: '20px',
  },
  emptyTitle: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#1a365d',
    margin: '0 0 12px',
  },
  emptyText: {
    fontSize: '15px',
    color: '#718096',
    margin: 0,
  },
  footer: {
    textAlign: 'center',
    marginTop: '50px',
    color: '#718096',
    fontSize: '13px',
  },
  // Modal Styles
  modalOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.5)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    zIndex: 1000,
  },
  modalContent: {
    width: '100%',
    maxWidth: '700px',
    maxHeight: '90vh',
    background: '#fff',
    borderRadius: '16px',
    border: '2px solid #e2e8f0',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: '28px',
    background: '#f8fafc',
    borderBottom: '2px solid #e2e8f0',
  },
  modalNumber: {
    fontSize: '13px',
    color: '#1a365d',
    fontWeight: '600',
    marginBottom: '8px',
  },
  modalTitle: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#1a365d',
    margin: '0 0 6px',
  },
  modalTitleHe: {
    fontSize: '15px',
    color: '#718096',
    margin: 0,
    fontFamily: "'Heebo', sans-serif",
  },
  closeBtn: {
    width: '44px',
    height: '44px',
    background: '#e2e8f0',
    border: 'none',
    borderRadius: '10px',
    color: '#1a365d',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s ease',
  },
  modalBody: {
    padding: '28px',
    overflowY: 'auto',
    flex: 1,
  },
  modalSection: {
    marginBottom: '28px',
  },
  sectionTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '17px',
    fontWeight: '700',
    color: '#1a365d',
    margin: '0 0 16px',
  },
  sectionIcon: {
    fontSize: '20px',
  },
  sectionText: {
    fontSize: '15px',
    color: '#718096',
    lineHeight: 1.8,
    margin: 0,
  },
  sectionList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  sectionItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    fontSize: '14px',
    color: '#1a365d',
    borderRadius: '8px',
    marginBottom: '8px',
    background: '#f8fafc',
  },
  bulletIcon: {
    color: '#1a365d',
    fontSize: '10px',
  },
  datesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '16px',
    marginBottom: '28px',
  },
  dateCard: {
    padding: '20px',
    background: '#f8fafc',
    borderRadius: '12px',
    textAlign: 'center',
    border: '2px solid #e2e8f0',
  },
  deadlineCard: {
    background: '#fff5f5',
    border: '2px solid #feb2b2',
  },
  dateCardIcon: {
    fontSize: '28px',
    display: 'block',
    marginBottom: '12px',
  },
  dateCardLabel: {
    display: 'block',
    fontSize: '12px',
    color: '#718096',
    marginBottom: '4px',
  },
  dateCardValue: {
    display: 'block',
    fontSize: '16px',
    fontWeight: '700',
    color: '#1a365d',
  },
  dateCardTime: {
    display: 'block',
    fontSize: '13px',
    color: '#c53030',
    marginTop: '6px',
    fontWeight: '600',
  },
  contactCard: {
    padding: '24px',
    background: '#ebf8ff',
    borderRadius: '12px',
    border: '2px solid #bee3f8',
    marginBottom: '28px',
  },
  contactTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '16px',
    fontWeight: '700',
    color: '#1a365d',
    margin: '0 0 16px',
  },
  contactGrid: {
    display: 'flex',
    gap: '24px',
  },
  contactItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  contactIcon: {
    fontSize: '18px',
  },
  contactValue: {
    fontSize: '14px',
    color: '#2b6cb0',
    fontFamily: 'monospace',
  },
  notesCard: {
    padding: '20px',
    background: '#fffaf0',
    borderRadius: '12px',
    border: '2px solid #fbd38d',
  },
  notesTitle: {
    fontSize: '15px',
    fontWeight: '700',
    color: '#c05621',
    margin: '0 0 12px',
  },
  notesList: {
    margin: 0,
    paddingRight: '20px',
    fontSize: '13px',
    color: '#744210',
    lineHeight: 2,
  },
  modalFooter: {
    display: 'flex',
    gap: '12px',
    padding: '20px 28px',
    background: '#f8fafc',
    borderTop: '2px solid #e2e8f0',
  },
  modalDownloadBtn: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    padding: '14px 24px',
    background: '#1a365d',
    border: 'none',
    borderRadius: '10px',
    color: '#fff',
    fontSize: '15px',
    fontWeight: '600',
    fontFamily: '"Tajawal", sans-serif',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 12px rgba(26, 54, 93, 0.3)',
  },
  inquiryBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '14px 24px',
    background: 'transparent',
    border: '2px solid #e2e8f0',
    borderRadius: '10px',
    color: '#1a365d',
    fontSize: '15px',
    fontWeight: '600',
    fontFamily: '"Tajawal", sans-serif',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
};

export default TenderAnnouncements;