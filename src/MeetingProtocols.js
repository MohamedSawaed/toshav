import React, { useState, useEffect } from 'react';
import API_BASE_URL from './config';

const API_URL = `${API_BASE_URL}/api`;

const MeetingProtocols = () => {
  const [protocols, setProtocols] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProtocol, setSelectedProtocol] = useState(null);
  const [downloading, setDownloading] = useState(null);

  useEffect(() => {
    fetchProtocols();
  }, []);

  const fetchProtocols = async () => {
    try {
      const response = await fetch(`${API_URL}/protocols/published`);
      const data = await response.json();
      setProtocols(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching protocols:', error);
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const formatDateHe = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('he-IL', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  // Handle file download properly
  const handleDownload = async (protocol) => {
    if (!protocol.file || !protocol.file.url) {
      alert('لا يوجد ملف للتحميل');
      return;
    }

    const protocolId = protocol.id || protocol._id;
    setDownloading(protocolId);

    try {
      // Use the dedicated download endpoint
      const downloadUrl = `${API_URL}/protocols/${protocolId}/download`;

      // Create a hidden link and trigger download
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', protocol.file.originalname || 'protocol.pdf');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download error:', error);
      alert('حدث خطأ أثناء تحميل الملف');
    } finally {
      setTimeout(() => setDownloading(null), 1000);
    }
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

        .protocol-card {
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .protocol-card:hover {
          transform: translateY(-6px);
          border-color: rgba(43, 108, 176, 0.4) !important;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15) !important;
        }

        .view-btn:hover {
          background: linear-gradient(135deg, #2b6cb0 0%, #1a365d 100%) !important;
          color: #fff !important;
          transform: translateY(-2px);
        }

        .download-btn:hover {
          background: rgba(26, 54, 93, 0.1) !important;
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
      `}</style>

      <div style={styles.wrapper}>
        {/* Header */}
        <header style={styles.header}>
          <div style={styles.headerContent}>
            <div style={styles.badge}>
              <span style={{ color: '#fff', fontSize: '15px', fontWeight: '600' }}>
                بروتوكولات الجلسات | פרוטוקולי ישיבות
              </span>
            </div>
          </div>
        </header>

        {/* Stats Bar */}
        <div style={styles.statsBar}>
          <div style={styles.statItem}>
            <span style={styles.statNumber}>{protocols.length}</span>
            <span style={styles.statLabel}>بروتوكولات منشورة | פרוטוקולים שפורסמו</span>
          </div>
        </div>

        {/* Info Box */}
        <div style={styles.infoBox}>
          <span style={styles.infoIcon}>ℹ</span>
          <div>
            <p style={styles.infoText}>
              هنا يمكنكم الاطلاع على بروتوكولات جلسات اللجنة المحلية وتحميلها.
            </p>
            <p style={styles.infoTextHe}>
              כאן תוכלו לצפות ולהוריד פרוטוקולים של ישיבות הוועדה המקומית.
            </p>
          </div>
        </div>

        {/* Protocols List */}
        <div style={styles.protocolsGrid}>
          {loading ? (
            <div style={styles.emptyState}>
              <span style={styles.emptyIcon}>⏳</span>
              <h3 style={styles.emptyTitle}>جاري تحميل البروتوكولات...</h3>
              <p style={styles.emptyText}>يرجى الانتظار | אנא המתינו</p>
            </div>
          ) : protocols.length === 0 ? (
            <div style={styles.emptyState}>
              <span style={styles.emptyIcon}>📭</span>
              <h3 style={styles.emptyTitle}>لا توجد بروتوكولات حالياً</h3>
              <p style={styles.emptyText}>سيتم نشر البروتوكولات الجديدة هنا | פרוטוקולים חדשים יפורסמו כאן</p>
            </div>
          ) : (
            protocols.map((protocol, index) => (
              <div
                key={protocol.id || protocol._id}
                className="protocol-card"
                style={{
                  ...styles.protocolCard,
                  animationDelay: `${index * 0.1}s`
                }}
              >
                {/* Card Header */}
                <div style={styles.cardHeader}>
                  <div style={styles.protocolNumber}>
                    <span style={styles.numberLabel}>جلسة رقم | ישיבה מס'</span>
                    <span style={styles.numberValue}>{protocol.meetingNumber || '-'}</span>
                  </div>
                  <div style={styles.dateBadge}>
                    <span style={styles.dateIcon}>📅</span>
                    <span>{formatDate(protocol.meetingDate)}</span>
                  </div>
                </div>

                {/* Card Body */}
                <div style={styles.cardBody}>
                  <div style={styles.typeIcon}>📋</div>
                  <h2 style={styles.protocolTitle}>{protocol.title}</h2>
                  {protocol.titleHe && (
                    <p style={styles.protocolTitleHe}>{protocol.titleHe}</p>
                  )}

                  {protocol.description && (
                    <p style={styles.protocolDesc}>{protocol.description}</p>
                  )}
                  {protocol.descriptionHe && (
                    <p style={styles.protocolDescHe}>{protocol.descriptionHe}</p>
                  )}
                </div>

                {/* Card Footer */}
                <div style={styles.cardFooter}>
                  <div style={styles.dateInfo}>
                    <div style={styles.dateRow}>
                      <span style={styles.dateIconSmall}>📅</span>
                      <div>
                        <span style={styles.dateLabel}>تاريخ الجلسة</span>
                        <span style={styles.dateValue}>{formatDate(protocol.meetingDate)}</span>
                      </div>
                    </div>
                    <div style={styles.dateRow}>
                      <span style={styles.dateIconSmall}>🗓️</span>
                      <div>
                        <span style={styles.dateLabel}>תאריך הישיבה</span>
                        <span style={styles.dateValue}>{formatDateHe(protocol.meetingDate)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div style={styles.cardActions}>
                  {protocol.file && protocol.file.url && (
                    <button
                      onClick={() => handleDownload(protocol)}
                      disabled={downloading === (protocol.id || protocol._id)}
                      className="view-btn"
                      style={{
                        ...styles.viewBtn,
                        opacity: downloading === (protocol.id || protocol._id) ? 0.7 : 1,
                        cursor: downloading === (protocol.id || protocol._id) ? 'wait' : 'pointer'
                      }}
                    >
                      <svg viewBox="0 0 24 24" fill="none" style={{ width: 18, height: 18 }}>
                        <path d="M21 15V19C21 20.1 20.1 21 19 21H5C3.9 21 3 20.1 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M7 10L12 15L17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span>{downloading === (protocol.id || protocol._id) ? 'جاري التحميل...' : 'تحميل البروتوكول | הורדת הפרוטוקול'}</span>
                    </button>
                  )}
                  <button
                    className="download-btn"
                    style={styles.detailBtn}
                    onClick={() => setSelectedProtocol(protocol)}
                  >
                    <svg viewBox="0 0 24 24" fill="none" style={{ width: 20, height: 20 }}>
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                    <span>عرض التفاصيل</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <footer style={styles.footer}>
          <p>© {new Date().getFullYear()} اللجنة المحلية – قرية الحسينية • جميع الحقوق محفوظة</p>
          <p style={{ marginTop: '4px', fontSize: '12px' }}>הוועדה המקומית חוסניה • כל הזכויות שמורות</p>
        </footer>
      </div>

      {/* Detail Modal */}
      {selectedProtocol && (
        <div className="modal-overlay" style={styles.modalOverlay} onClick={() => setSelectedProtocol(null)}>
          <div className="modal-content" style={styles.modalContent} onClick={e => e.stopPropagation()}>
            {/* Modal Header */}
            <div style={styles.modalHeader}>
              <div>
                <div style={styles.modalNumber}>جلسة رقم {selectedProtocol.meetingNumber || '-'} | ישיבה מס' {selectedProtocol.meetingNumber || '-'}</div>
                <h2 style={styles.modalTitle}>{selectedProtocol.title}</h2>
                {selectedProtocol.titleHe && (
                  <p style={styles.modalTitleHe}>{selectedProtocol.titleHe}</p>
                )}
              </div>
              <button className="close-btn" style={styles.closeBtn} onClick={() => setSelectedProtocol(null)}>
                <svg viewBox="0 0 24 24" fill="none" style={{ width: 24, height: 24 }}>
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div style={styles.modalBody}>
              {/* Meeting Date */}
              <div style={styles.modalSection}>
                <h3 style={styles.sectionTitle}>
                  <span style={styles.sectionIcon}>📅</span>
                  تاريخ الجلسة | תאריך הישיבה
                </h3>
                <div style={styles.dateDisplay}>
                  <span>{formatDate(selectedProtocol.meetingDate)}</span>
                  <span style={styles.dateDivider}>|</span>
                  <span>{formatDateHe(selectedProtocol.meetingDate)}</span>
                </div>
              </div>

              {/* Description */}
              {(selectedProtocol.description || selectedProtocol.descriptionHe) && (
                <div style={styles.modalSection}>
                  <h3 style={styles.sectionTitle}>
                    <span style={styles.sectionIcon}>📋</span>
                    وصف الجلسة | תיאור הישיבה
                  </h3>
                  {selectedProtocol.description && (
                    <p style={styles.sectionText}>{selectedProtocol.description}</p>
                  )}
                  {selectedProtocol.descriptionHe && (
                    <p style={styles.sectionTextHe}>{selectedProtocol.descriptionHe}</p>
                  )}
                </div>
              )}

              {/* File Info */}
              {selectedProtocol.file && (
                <div style={styles.modalSection}>
                  <h3 style={styles.sectionTitle}>
                    <span style={styles.sectionIcon}>📎</span>
                    ملف البروتوكول | קובץ הפרוטוקול
                  </h3>
                  <div style={styles.fileInfo}>
                    <span style={styles.fileIcon}>📄</span>
                    <div>
                      <span style={styles.fileName}>{selectedProtocol.file.originalname || 'Protocol File'}</span>
                      {selectedProtocol.file.size && (
                        <span style={styles.fileSize}>
                          {(selectedProtocol.file.size / 1024).toFixed(1)} KB
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div style={styles.modalFooter}>
              {selectedProtocol.file && selectedProtocol.file.url && (
                <button
                  onClick={() => handleDownload(selectedProtocol)}
                  disabled={downloading === (selectedProtocol.id || selectedProtocol._id)}
                  style={{
                    ...styles.modalDownloadBtn,
                    opacity: downloading === (selectedProtocol.id || selectedProtocol._id) ? 0.7 : 1,
                    cursor: downloading === (selectedProtocol.id || selectedProtocol._id) ? 'wait' : 'pointer',
                    border: 'none'
                  }}
                >
                  <svg viewBox="0 0 24 24" fill="none" style={{ width: 20, height: 20 }}>
                    <path d="M21 15V19C21 20.1 20.1 21 19 21H5C3.9 21 3 20.1 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M7 10L12 15L17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {downloading === (selectedProtocol.id || selectedProtocol._id) ? 'جاري التحميل...' : 'تحميل البروتوكول | הורדת הפרוטוקול'}
                </button>
              )}
              <button
                style={styles.closeModalBtn}
                onClick={() => setSelectedProtocol(null)}
              >
                إغلاق | סגור
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
    padding: '24px',
    background: '#fff',
    borderRadius: '16px',
    border: '2px solid #e2e8f0',
    marginBottom: '24px',
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
  infoBox: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '16px',
    padding: '20px 24px',
    background: '#ebf8ff',
    borderRadius: '12px',
    border: '2px solid #bee3f8',
    marginBottom: '32px',
  },
  infoIcon: {
    fontSize: '24px',
    color: '#2b6cb0',
  },
  infoText: {
    fontSize: '14px',
    color: '#2c5282',
    margin: '0 0 4px 0',
    lineHeight: 1.6,
  },
  infoTextHe: {
    fontSize: '13px',
    color: '#4a6fa5',
    margin: 0,
    lineHeight: 1.6,
  },
  protocolsGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  protocolCard: {
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
  protocolNumber: {
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
  dateBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    background: '#ebf8ff',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: '600',
    color: '#2b6cb0',
    border: '1px solid #bee3f8',
  },
  dateIcon: {
    fontSize: '16px',
  },
  cardBody: {
    padding: '28px',
  },
  typeIcon: {
    fontSize: '48px',
    marginBottom: '16px',
  },
  protocolTitle: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#1a365d',
    margin: '0 0 8px',
    lineHeight: 1.4,
  },
  protocolTitleHe: {
    fontSize: '16px',
    color: '#718096',
    margin: '0 0 16px',
    fontFamily: "'Heebo', sans-serif",
  },
  protocolDesc: {
    fontSize: '15px',
    color: '#4a5568',
    lineHeight: 1.7,
    margin: '0 0 8px 0',
  },
  protocolDescHe: {
    fontSize: '14px',
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
  dateIconSmall: {
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
  cardActions: {
    display: 'flex',
    gap: '12px',
    padding: '0 28px 28px',
  },
  viewBtn: {
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
    fontSize: '14px',
    fontWeight: '600',
    fontFamily: '"Tajawal", sans-serif',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 12px rgba(26, 54, 93, 0.3)',
    textDecoration: 'none',
  },
  detailBtn: {
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
    maxWidth: '600px',
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
    fontSize: '20px',
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
    marginBottom: '24px',
  },
  sectionTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '16px',
    fontWeight: '700',
    color: '#1a365d',
    margin: '0 0 12px',
  },
  sectionIcon: {
    fontSize: '20px',
  },
  sectionText: {
    fontSize: '15px',
    color: '#4a5568',
    lineHeight: 1.8,
    margin: '0 0 8px 0',
  },
  sectionTextHe: {
    fontSize: '14px',
    color: '#718096',
    lineHeight: 1.8,
    margin: 0,
  },
  dateDisplay: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '16px 20px',
    background: '#f8fafc',
    borderRadius: '10px',
    fontSize: '15px',
    color: '#1a365d',
    fontWeight: '600',
  },
  dateDivider: {
    color: '#cbd5e0',
  },
  fileInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '16px 20px',
    background: '#f8fafc',
    borderRadius: '10px',
    border: '1px solid #e2e8f0',
  },
  fileIcon: {
    fontSize: '32px',
  },
  fileName: {
    display: 'block',
    fontSize: '14px',
    color: '#1a365d',
    fontWeight: '600',
  },
  fileSize: {
    display: 'block',
    fontSize: '12px',
    color: '#718096',
    marginTop: '4px',
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
    fontSize: '14px',
    fontWeight: '600',
    fontFamily: '"Tajawal", sans-serif',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 12px rgba(26, 54, 93, 0.3)',
    textDecoration: 'none',
  },
  closeModalBtn: {
    padding: '14px 24px',
    background: 'transparent',
    border: '2px solid #e2e8f0',
    borderRadius: '10px',
    color: '#1a365d',
    fontSize: '14px',
    fontWeight: '600',
    fontFamily: '"Tajawal", sans-serif',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
};

export default MeetingProtocols;
