import React, { useState } from 'react';
import API_URL from './config';

const RequestTracker = () => {
  const [referenceNumber, setReferenceNumber] = useState('');
  const [requestData, setRequestData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!referenceNumber.trim()) {
      setError('الرجاء إدخال رقم المرجع');
      return;
    }

    setLoading(true);
    setError('');
    setRequestData(null);

    try {
      const response = await fetch(`${API_URL}/api/track/${referenceNumber.trim()}`);

      if (!response.ok) {
        setError('خطأ في الاتصال بالخادم');
        return;
      }

      const data = await response.json();

      if (data.found) {
        setRequestData(data.request);
      } else {
        setError('لم يتم العثور على طلب بهذا الرقم. تأكد من صحة رقم المرجع');
      }
    } catch (err) {
      console.error('Search error:', err);
      setError('تعذر الاتصال بالخادم. تأكد من تشغيل الخادم على المنفذ 3001');
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case 'pending':
        return {
          label: 'قيد المراجعة',
          labelHe: 'בבדיקה',
          color: '#f59e0b',
          bgColor: '#fef3c7',
          icon: '⏳',
          step: 2
        };
      case 'approved':
        return {
          label: 'تمت الموافقة',
          labelHe: 'אושר',
          color: '#10b981',
          bgColor: '#d1fae5',
          icon: '✓',
          step: 3
        };
      case 'rejected':
        return {
          label: 'مرفوض',
          labelHe: 'נדחה',
          color: '#ef4444',
          bgColor: '#fee2e2',
          icon: '✕',
          step: 3
        };
      default:
        return {
          label: 'غير معروف',
          labelHe: 'לא ידוע',
          color: '#6b7280',
          bgColor: '#f3f4f6',
          icon: '?',
          step: 1
        };
    }
  };

  const getTypeLabel = (type) => {
    const types = {
      'documentAuth': { ar: 'طلب مصادقة مستند', he: 'בקשה לאימות מסמך' },
      'officialDoc': { ar: 'طلب إعداد مستند رسمي', he: 'בקשה להכנת מסמך רשמי' },
      'tenders': { ar: 'عرض مناقصة', he: 'הצעה למכרז' },
      'certificates': { ar: 'طلب شهادة', he: 'בקשה לאישור' }
    };
    return types[type] || { ar: type, he: type };
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const statusInfo = requestData ? getStatusInfo(requestData.status) : null;

  return (
    <div style={styles.container}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;600;700;800&display=swap');

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        @keyframes slideIn {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }

        .search-input:focus {
          border-color: #1a365d !important;
          box-shadow: 0 0 0 4px rgba(26, 54, 93, 0.1) !important;
        }

        .search-btn:hover {
          background: #2c5282 !important;
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(26, 54, 93, 0.3) !important;
        }

        .result-card {
          animation: fadeIn 0.5s ease-out;
        }

        .timeline-step {
          animation: slideIn 0.4s ease-out backwards;
        }

        .timeline-step:nth-child(1) { animation-delay: 0.1s; }
        .timeline-step:nth-child(2) { animation-delay: 0.2s; }
        .timeline-step:nth-child(3) { animation-delay: 0.3s; }
      `}</style>

      <div style={styles.wrapper}>
        {/* Header */}
        <header style={styles.header}>
          <div style={styles.headerContent}>
            <div style={styles.badge}>
              <span style={{ color: '#fff', fontSize: '15px', fontWeight: '600' }}>
                تتبع الطلبات | מעקב בקשות
              </span>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div style={styles.mainContent}>
          {/* Search Card */}
          <div style={styles.searchCard}>
            <div style={styles.searchIcon}>🔍</div>
            <h2 style={styles.searchTitle}>تتبع حالة طلبك</h2>
            <p style={styles.searchSubtitle}>
              أدخل رقم المرجع الذي حصلت عليه عند تقديم الطلب
            </p>

            <div style={styles.searchBox}>
              <input
                type="text"
                className="search-input"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="مثال: 1765793250613"
                style={styles.input}
                dir="ltr"
              />
              <button
                className="search-btn"
                onClick={handleSearch}
                disabled={loading}
                style={{
                  ...styles.searchBtn,
                  ...(loading && styles.searchBtnLoading)
                }}
              >
                {loading ? (
                  <div style={styles.spinner}></div>
                ) : (
                  <>
                    <span>بحث</span>
                    <span style={{ fontSize: '18px' }}>←</span>
                  </>
                )}
              </button>
            </div>

            {error && (
              <div style={styles.errorBox}>
                <span style={{ fontSize: '20px' }}>⚠️</span>
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Results */}
          {requestData && (
            <div className="result-card" style={styles.resultCard}>
              {/* Status Header */}
              <div style={{
                ...styles.statusHeader,
                background: statusInfo.bgColor
              }}>
                <div style={{
                  ...styles.statusIconLarge,
                  background: statusInfo.color
                }}>
                  {statusInfo.icon}
                </div>
                <div style={styles.statusInfo}>
                  <h3 style={{ ...styles.statusLabel, color: statusInfo.color }}>
                    {statusInfo.label}
                  </h3>
                  <p style={styles.statusLabelHe}>{statusInfo.labelHe}</p>
                </div>
              </div>

              {/* Timeline */}
              <div style={styles.timeline}>
                <div className="timeline-step" style={styles.timelineStep}>
                  <div style={{
                    ...styles.timelineIcon,
                    background: '#10b981',
                    color: '#fff'
                  }}>
                    ✓
                  </div>
                  <div style={styles.timelineContent}>
                    <span style={styles.timelineTitle}>تم استلام الطلب</span>
                    <span style={styles.timelineDate}>{formatDate(requestData.submittedAt)}</span>
                  </div>
                  <div style={{ ...styles.timelineLine, background: statusInfo.step >= 2 ? '#10b981' : '#e2e8f0' }}></div>
                </div>

                <div className="timeline-step" style={styles.timelineStep}>
                  <div style={{
                    ...styles.timelineIcon,
                    background: statusInfo.step >= 2 ? '#f59e0b' : '#e2e8f0',
                    color: statusInfo.step >= 2 ? '#fff' : '#94a3b8'
                  }}>
                    {statusInfo.step >= 2 ? '⏳' : '2'}
                  </div>
                  <div style={styles.timelineContent}>
                    <span style={styles.timelineTitle}>قيد المراجعة</span>
                    <span style={styles.timelineDate}>
                      {statusInfo.step >= 2 ? 'جاري المراجعة...' : 'في انتظار المراجعة'}
                    </span>
                  </div>
                  <div style={{ ...styles.timelineLine, background: statusInfo.step >= 3 ? '#10b981' : '#e2e8f0' }}></div>
                </div>

                <div className="timeline-step" style={styles.timelineStep}>
                  <div style={{
                    ...styles.timelineIcon,
                    background: statusInfo.step >= 3 ? statusInfo.color : '#e2e8f0',
                    color: statusInfo.step >= 3 ? '#fff' : '#94a3b8'
                  }}>
                    {statusInfo.step >= 3 ? statusInfo.icon : '3'}
                  </div>
                  <div style={styles.timelineContent}>
                    <span style={styles.timelineTitle}>القرار النهائي</span>
                    <span style={styles.timelineDate}>
                      {statusInfo.step >= 3 ? (requestData.status === 'approved' ? 'تمت الموافقة' : 'تم الرفض') : 'في انتظار القرار'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Request Details */}
              <div style={styles.detailsSection}>
                <h4 style={styles.detailsTitle}>
                  <span>📋</span>
                  تفاصيل الطلب
                </h4>

                <div style={styles.detailsGrid}>
                  <div style={styles.detailItem}>
                    <span style={styles.detailLabel}>رقم المرجع</span>
                    <span style={styles.detailValue}>{requestData.id}</span>
                  </div>
                  <div style={styles.detailItem}>
                    <span style={styles.detailLabel}>نوع الطلب</span>
                    <span style={styles.detailValue}>{getTypeLabel(requestData.type).ar}</span>
                  </div>
                  <div style={styles.detailItem}>
                    <span style={styles.detailLabel}>تاريخ التقديم</span>
                    <span style={styles.detailValue}>{formatDate(requestData.submittedAt)}</span>
                  </div>
                  {requestData.data?.fullName && (
                    <div style={styles.detailItem}>
                      <span style={styles.detailLabel}>اسم مقدم الطلب</span>
                      <span style={styles.detailValue}>{requestData.data.fullName}</span>
                    </div>
                  )}
                </div>

                {requestData.notes && (
                  <div style={styles.notesBox}>
                    <h5 style={styles.notesTitle}>ملاحظات من الإدارة:</h5>
                    <p style={styles.notesText}>{requestData.notes}</p>
                  </div>
                )}

                {/* Admin Response File Download */}
                {requestData.adminResponseFile && (
                  <div style={styles.downloadFileBox}>
                    <div style={styles.downloadFileHeader}>
                      <span style={styles.downloadFileIcon}>📥</span>
                      <h5 style={styles.downloadFileTitle}>ملف متاح للتحميل</h5>
                    </div>
                    <div style={styles.downloadFileContent}>
                      <div style={styles.downloadFileInfo}>
                        <span style={styles.downloadFileName}>{requestData.adminResponseFile.originalname}</span>
                        <span style={styles.downloadFileSize}>
                          ({(requestData.adminResponseFile.size / 1024).toFixed(1)} KB)
                        </span>
                      </div>
                      <a
                        href={`${API_URL}/${requestData.adminResponseFile.path}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={styles.downloadFileBtn}
                      >
                        تحميل الملف
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {/* Contact Info */}
              <div style={styles.contactBox}>
                <span style={{ fontSize: '20px' }}>📞</span>
                <div>
                  <p style={styles.contactText}>
                    للاستفسار عن طلبك، يمكنك التواصل معنا عبر:
                  </p>
                  <p style={styles.contactEmail}>husniua.committe@gmail.com</p>
                </div>
              </div>
            </div>
          )}

          {/* Help Section */}
          {!requestData && (
            <div style={styles.helpSection}>
              <h3 style={styles.helpTitle}>أين أجد رقم المرجع؟</h3>
              <div style={styles.helpCards}>
                <div style={styles.helpCard}>
                  <span style={styles.helpIcon}>📧</span>
                  <p style={styles.helpText}>تم إرساله إلى بريدك الإلكتروني عند تقديم الطلب</p>
                </div>
                <div style={styles.helpCard}>
                  <span style={styles.helpIcon}>📝</span>
                  <p style={styles.helpText}>يظهر في صفحة التأكيد بعد إرسال الطلب</p>
                </div>
                <div style={styles.helpCard}>
                  <span style={styles.helpIcon}>🔢</span>
                  <p style={styles.helpText}>رقم مكون من 13 رقمًا يتم إرساله عند تأكيد الطلب</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer style={styles.footer}>
          <p>اللجنة المحلية - الحسينية | הוועדה המקומית - חוסניה</p>
        </footer>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    direction: 'rtl',
    fontFamily: '"Tajawal", "Segoe UI", sans-serif',
    background: '#f8fafc',
  },
  wrapper: {
    maxWidth: '700px',
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
  mainContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  searchCard: {
    background: '#fff',
    borderRadius: '16px',
    padding: '40px 32px',
    textAlign: 'center',
    border: '2px solid #e2e8f0',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
  },
  searchIcon: {
    fontSize: '48px',
    marginBottom: '16px',
  },
  searchTitle: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1a365d',
    margin: '0 0 8px 0',
  },
  searchSubtitle: {
    fontSize: '15px',
    color: '#718096',
    margin: '0 0 28px 0',
  },
  searchBox: {
    display: 'flex',
    gap: '12px',
    maxWidth: '500px',
    margin: '0 auto',
  },
  input: {
    flex: 1,
    padding: '16px 20px',
    fontSize: '16px',
    border: '2px solid #e2e8f0',
    borderRadius: '12px',
    fontFamily: 'monospace',
    letterSpacing: '1px',
    textAlign: 'center',
    transition: 'all 0.3s ease',
    outline: 'none',
  },
  searchBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '16px 28px',
    background: '#1a365d',
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: '600',
    fontFamily: '"Tajawal", sans-serif',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 12px rgba(26, 54, 93, 0.3)',
  },
  searchBtnLoading: {
    opacity: 0.7,
    cursor: 'wait',
  },
  spinner: {
    width: '20px',
    height: '20px',
    border: '2px solid rgba(255,255,255,0.3)',
    borderTopColor: '#fff',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  errorBox: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    marginTop: '20px',
    padding: '14px 20px',
    background: '#fee2e2',
    borderRadius: '10px',
    color: '#dc2626',
    fontSize: '14px',
    fontWeight: '500',
  },
  resultCard: {
    background: '#fff',
    borderRadius: '16px',
    overflow: 'hidden',
    border: '2px solid #e2e8f0',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
  },
  statusHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    padding: '28px',
  },
  statusIconLarge: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '28px',
    color: '#fff',
    flexShrink: 0,
  },
  statusInfo: {
    textAlign: 'right',
  },
  statusLabel: {
    fontSize: '24px',
    fontWeight: '700',
    margin: '0 0 4px 0',
  },
  statusLabelHe: {
    fontSize: '16px',
    color: '#64748b',
    margin: 0,
    fontFamily: "'Heebo', sans-serif",
  },
  timeline: {
    padding: '28px',
    borderTop: '2px solid #e2e8f0',
    borderBottom: '2px solid #e2e8f0',
  },
  timelineStep: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '16px',
    position: 'relative',
    paddingBottom: '24px',
  },
  timelineIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
    fontWeight: '700',
    flexShrink: 0,
    zIndex: 1,
  },
  timelineContent: {
    flex: 1,
    paddingTop: '8px',
  },
  timelineTitle: {
    display: 'block',
    fontSize: '16px',
    fontWeight: '600',
    color: '#1a365d',
    marginBottom: '4px',
  },
  timelineDate: {
    fontSize: '13px',
    color: '#64748b',
  },
  timelineLine: {
    position: 'absolute',
    right: '19px',
    top: '44px',
    width: '2px',
    height: 'calc(100% - 20px)',
  },
  detailsSection: {
    padding: '28px',
  },
  detailsTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '18px',
    fontWeight: '700',
    color: '#1a365d',
    margin: '0 0 20px 0',
  },
  detailsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '16px',
  },
  detailItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    padding: '14px',
    background: '#f8fafc',
    borderRadius: '10px',
  },
  detailLabel: {
    fontSize: '12px',
    color: '#64748b',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: '14px',
    color: '#1a365d',
    fontWeight: '600',
  },
  notesBox: {
    marginTop: '20px',
    padding: '16px',
    background: '#fffbeb',
    borderRadius: '10px',
    border: '2px solid #fcd34d',
  },
  notesTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#92400e',
    margin: '0 0 8px 0',
  },
  notesText: {
    fontSize: '14px',
    color: '#78350f',
    margin: 0,
    lineHeight: 1.6,
  },
  downloadFileBox: {
    marginTop: '20px',
    padding: '20px',
    background: '#ecfdf5',
    borderRadius: '12px',
    border: '2px solid #a7f3d0',
  },
  downloadFileHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '16px',
  },
  downloadFileIcon: {
    fontSize: '28px',
  },
  downloadFileTitle: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#065f46',
    margin: 0,
  },
  downloadFileContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px',
    background: '#fff',
    borderRadius: '10px',
    border: '1px solid #6ee7b7',
  },
  downloadFileInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  downloadFileName: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#065f46',
  },
  downloadFileSize: {
    fontSize: '12px',
    color: '#64748b',
  },
  downloadFileBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 24px',
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    color: '#fff',
    borderRadius: '10px',
    textDecoration: 'none',
    fontSize: '15px',
    fontWeight: '600',
    fontFamily: '"Tajawal", sans-serif',
    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
    transition: 'all 0.3s ease',
  },
  contactBox: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '14px',
    margin: '0 28px 28px',
    padding: '20px',
    background: '#ebf8ff',
    borderRadius: '12px',
    border: '2px solid #bee3f8',
  },
  contactText: {
    fontSize: '14px',
    color: '#1e40af',
    margin: '0 0 6px 0',
  },
  contactEmail: {
    fontSize: '15px',
    color: '#1e40af',
    fontWeight: '600',
    margin: 0,
    direction: 'ltr',
    textAlign: 'right',
  },
  helpSection: {
    background: '#fff',
    borderRadius: '16px',
    padding: '32px',
    border: '2px solid #e2e8f0',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
  },
  helpTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#1a365d',
    margin: '0 0 20px 0',
    textAlign: 'center',
  },
  helpCards: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '16px',
  },
  helpCard: {
    textAlign: 'center',
    padding: '20px 16px',
    background: '#f8fafc',
    borderRadius: '12px',
  },
  helpIcon: {
    fontSize: '32px',
    display: 'block',
    marginBottom: '12px',
  },
  helpText: {
    fontSize: '13px',
    color: '#64748b',
    margin: 0,
    lineHeight: 1.5,
  },
  footer: {
    textAlign: 'center',
    marginTop: '40px',
    color: '#718096',
    fontSize: '13px',
  },
};

export default RequestTracker;
