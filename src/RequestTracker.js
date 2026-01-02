import React, { useState } from 'react';
import API_URL from './config';

const RequestTracker = () => {
  const [searchType, setSearchType] = useState('idNumber');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [requestData, setRequestData] = useState(null);
  const [multipleRequests, setMultipleRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchPerformed, setSearchPerformed] = useState(false);

  const handleSearch = async () => {
    if (searchType === 'reference' && !referenceNumber.trim()) {
      setError('الرجاء إدخال رقم المرجع');
      return;
    }
    if (searchType === 'idNumber' && !idNumber.trim()) {
      setError('الرجاء إدخال رقم الهوية');
      return;
    }

    setLoading(true);
    setError('');
    setRequestData(null);
    setMultipleRequests([]);
    setSearchPerformed(true);

    try {
      let response;
      if (searchType === 'reference') {
        response = await fetch(`${API_URL}/api/track/${referenceNumber.trim()}`);
      } else {
        response = await fetch(`${API_URL}/api/track-by-id/${idNumber.trim()}`);
      }

      if (!response.ok) {
        setError('خطأ في الاتصال بالخادم');
        return;
      }

      const data = await response.json();

      if (data.found) {
        if (searchType === 'reference') {
          setRequestData(data.request);
        } else {
          setMultipleRequests(data.requests);
        }
      } else {
        setError(searchType === 'reference'
          ? 'لم يتم العثور على طلب بهذا الرقم'
          : 'لم يتم العثور على طلبات مرتبطة برقم الهوية هذا');
      }
    } catch (err) {
      console.error('Search error:', err);
      setError('تعذر الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };

  const resetSearch = () => {
    setSearchPerformed(false);
    setRequestData(null);
    setMultipleRequests([]);
    setError('');
    setReferenceNumber('');
    setIdNumber('');
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case 'pending':
        return {
          label: 'قيد المراجعة',
          labelHe: 'בבדיקה',
          color: '#2c5282',
          bgColor: '#bee3f8',
          icon: '⏳'
        };
      case 'approved':
        return {
          label: 'تمت الموافقة',
          labelHe: 'אושר',
          color: '#276749',
          bgColor: '#c6f6d5',
          icon: '✓'
        };
      case 'rejected':
        return {
          label: 'مرفوض',
          labelHe: 'נדחה',
          color: '#9b2c2c',
          bgColor: '#fed7d7',
          icon: '✕'
        };
      default:
        return {
          label: 'غير معروف',
          labelHe: 'לא ידוע',
          color: '#718096',
          bgColor: '#e2e8f0',
          icon: '?'
        };
    }
  };

  const getTypeLabel = (type) => {
    const types = {
      documentAuth: { ar: 'مصادقة مستند', he: 'אימות מסמך' },
      officialDoc: { ar: 'مستند رسمي', he: 'מסמך רשמי' },
      certificate: { ar: 'شهادة إقامة', he: 'אישור תושבות' }
    };
    return types[type] || { ar: type, he: type };
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const styles = {
    container: {
      maxWidth: '800px',
      margin: '0 auto',
      padding: '40px 24px 60px',
      direction: 'rtl'
    },
    card: {
      background: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: '6px',
      boxShadow: '0 2px 8px rgba(26, 54, 93, 0.08)',
      overflow: 'hidden'
    },
    cardHeader: {
      background: 'linear-gradient(135deg, #1a365d 0%, #234e70 100%)',
      color: '#ffffff',
      padding: '24px',
      borderBottom: '3px solid #b7791f',
      textAlign: 'center'
    },
    cardTitle: {
      fontSize: '1.25rem',
      fontWeight: '600',
      margin: '0 0 4px 0'
    },
    cardSubtitle: {
      fontSize: '0.9rem',
      opacity: 0.85,
      margin: 0
    },
    cardBody: {
      padding: '24px'
    },
    tabContainer: {
      display: 'flex',
      gap: '8px',
      marginBottom: '24px',
      background: '#edf2f7',
      padding: '4px',
      borderRadius: '6px'
    },
    tab: {
      flex: 1,
      padding: '12px 16px',
      border: 'none',
      borderRadius: '4px',
      fontSize: '0.9rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      fontFamily: 'inherit'
    },
    tabActive: {
      background: '#ffffff',
      color: '#1a365d',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    tabInactive: {
      background: 'transparent',
      color: '#718096'
    },
    formGroup: {
      marginBottom: '20px'
    },
    label: {
      display: 'block',
      fontSize: '0.875rem',
      fontWeight: '600',
      color: '#2d3748',
      marginBottom: '8px'
    },
    input: {
      width: '100%',
      padding: '12px 16px',
      fontSize: '1rem',
      border: '2px solid #e2e8f0',
      borderRadius: '6px',
      transition: 'all 0.2s ease',
      outline: 'none',
      fontFamily: 'inherit'
    },
    button: {
      width: '100%',
      padding: '14px 24px',
      background: 'linear-gradient(135deg, #1a365d 0%, #234e70 100%)',
      color: '#ffffff',
      border: 'none',
      borderRadius: '6px',
      fontSize: '1rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      fontFamily: 'inherit',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px'
    },
    buttonSecondary: {
      background: '#edf2f7',
      color: '#4a5568',
      marginTop: '12px'
    },
    errorBox: {
      background: '#fed7d7',
      border: '1px solid #9b2c2c',
      borderRadius: '6px',
      padding: '12px 16px',
      color: '#9b2c2c',
      fontSize: '0.9rem',
      marginBottom: '16px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    resultCard: {
      background: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: '6px',
      marginTop: '24px',
      overflow: 'hidden'
    },
    resultHeader: {
      background: '#f7fafc',
      padding: '16px 20px',
      borderBottom: '1px solid #e2e8f0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    statusBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      padding: '6px 14px',
      borderRadius: '20px',
      fontSize: '0.85rem',
      fontWeight: '600'
    },
    resultBody: {
      padding: '20px'
    },
    infoGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '16px'
    },
    infoItem: {
      background: '#f7fafc',
      padding: '14px 16px',
      borderRadius: '6px',
      border: '1px solid #e2e8f0'
    },
    infoLabel: {
      fontSize: '0.8rem',
      color: '#718096',
      marginBottom: '4px'
    },
    infoValue: {
      fontSize: '0.95rem',
      color: '#1a202c',
      fontWeight: '600'
    },
    notesSection: {
      marginTop: '20px',
      padding: '16px',
      background: '#fffbeb',
      border: '1px solid #d69e2e',
      borderRight: '4px solid #d69e2e',
      borderRadius: '6px'
    },
    notesTitle: {
      fontSize: '0.9rem',
      fontWeight: '600',
      color: '#975a16',
      marginBottom: '8px',
      display: 'flex',
      alignItems: 'center',
      gap: '6px'
    },
    notesText: {
      fontSize: '0.9rem',
      color: '#744210',
      lineHeight: 1.6,
      margin: 0
    },
    downloadSection: {
      marginTop: '20px',
      padding: '16px',
      background: '#c6f6d5',
      border: '1px solid #276749',
      borderRadius: '6px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '12px'
    },
    downloadInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    downloadIcon: {
      width: '40px',
      height: '40px',
      background: '#276749',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#ffffff',
      fontSize: '18px'
    },
    downloadDetails: {
      flex: 1
    },
    downloadName: {
      fontSize: '0.9rem',
      fontWeight: '600',
      color: '#276749',
      margin: '0 0 2px 0'
    },
    downloadSize: {
      fontSize: '0.8rem',
      color: '#22543d',
      margin: 0
    },
    downloadBtn: {
      padding: '10px 20px',
      background: '#276749',
      color: '#ffffff',
      borderRadius: '6px',
      textDecoration: 'none',
      fontSize: '0.9rem',
      fontWeight: '600',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      transition: 'all 0.2s ease'
    },
    helpSection: {
      marginTop: '32px',
      padding: '20px',
      background: '#f7fafc',
      border: '1px solid #e2e8f0',
      borderRadius: '6px',
      textAlign: 'center'
    },
    helpTitle: {
      fontSize: '1rem',
      fontWeight: '600',
      color: '#1a365d',
      marginBottom: '8px'
    },
    helpText: {
      fontSize: '0.85rem',
      color: '#718096',
      margin: 0,
      lineHeight: 1.6
    },
    spinner: {
      width: '20px',
      height: '20px',
      border: '2px solid rgba(255,255,255,0.3)',
      borderTopColor: '#ffffff',
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite'
    }
  };

  return (
    <div style={styles.container}>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

      <div style={styles.card}>
        {/* Header */}
        <div style={styles.cardHeader}>
          <h1 style={styles.cardTitle}>تتبع الطلبات | מעקב בקשות</h1>
          <p style={styles.cardSubtitle}>استعلام عن حالة الطلب</p>
        </div>

        {/* Body */}
        <div style={styles.cardBody}>
          {/* Tabs */}
          <div style={styles.tabContainer}>
            <button
              style={{
                ...styles.tab,
                ...(searchType === 'idNumber' ? styles.tabActive : styles.tabInactive)
              }}
              onClick={() => {
                setSearchType('idNumber');
                setError('');
              }}
            >
              بحث برقم الهوية
            </button>
            <button
              style={{
                ...styles.tab,
                ...(searchType === 'reference' ? styles.tabActive : styles.tabInactive)
              }}
              onClick={() => {
                setSearchType('reference');
                setError('');
              }}
            >
              بحث برقم المرجع
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div style={styles.errorBox}>
              <span>⚠</span>
              <span>{error}</span>
            </div>
          )}

          {/* Search Form */}
          {!searchPerformed && (
            <>
              <div style={styles.formGroup}>
                <label style={styles.label}>
                  {searchType === 'idNumber' ? 'رقم الهوية | מספר זהות' : 'رقم المرجع | מספר אסמכתא'}
                </label>
                <input
                  type="text"
                  value={searchType === 'idNumber' ? idNumber : referenceNumber}
                  onChange={(e) => {
                    if (searchType === 'idNumber') {
                      setIdNumber(e.target.value);
                    } else {
                      setReferenceNumber(e.target.value);
                    }
                    setError('');
                  }}
                  placeholder={searchType === 'idNumber' ? 'أدخل رقم الهوية' : 'أدخل رقم المرجع'}
                  style={styles.input}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#2b6cb0';
                    e.target.style.boxShadow = '0 0 0 3px rgba(43, 108, 176, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e2e8f0';
                    e.target.style.boxShadow = 'none';
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSearch();
                  }}
                />
              </div>

              <button
                onClick={handleSearch}
                disabled={loading}
                style={{
                  ...styles.button,
                  opacity: loading ? 0.7 : 1
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 4px 12px rgba(26, 54, 93, 0.3)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                {loading ? (
                  <>
                    <div style={styles.spinner} />
                    <span>جاري البحث...</span>
                  </>
                ) : (
                  <>
                    <span>🔍</span>
                    <span>بحث | חיפוש</span>
                  </>
                )}
              </button>
            </>
          )}

          {/* Results - Multiple Requests */}
          {searchPerformed && multipleRequests.length > 0 && (
            <>
              <div style={{
                background: '#bee3f8',
                border: '1px solid #2c5282',
                borderRadius: '6px',
                padding: '12px 16px',
                marginBottom: '20px',
                fontSize: '0.9rem',
                color: '#1a365d'
              }}>
                تم العثور على {multipleRequests.length} طلب/طلبات
              </div>

              {multipleRequests.map((request, index) => {
                const statusInfo = getStatusInfo(request.status);
                const typeLabel = getTypeLabel(request.type);

                return (
                  <div key={request.id} style={{ ...styles.resultCard, marginTop: index > 0 ? '16px' : '0' }}>
                    <div style={styles.resultHeader}>
                      <div>
                        <div style={{ fontSize: '0.85rem', color: '#718096', marginBottom: '4px' }}>
                          {typeLabel.ar} | {typeLabel.he}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#a0aec0' }}>
                          {formatDate(request.submittedAt)}
                        </div>
                      </div>
                      <div
                        style={{
                          ...styles.statusBadge,
                          background: statusInfo.bgColor,
                          color: statusInfo.color,
                          border: `1px solid ${statusInfo.color}`
                        }}
                      >
                        <span>{statusInfo.icon}</span>
                        <span>{statusInfo.label}</span>
                      </div>
                    </div>

                    <div style={styles.resultBody}>
                      {/* Full Details Grid */}
                      <div style={styles.infoGrid}>
                        {/* Reference Number */}
                        <div style={styles.infoItem}>
                          <div style={styles.infoLabel}>رقم المرجع | מספר אסמכתא</div>
                          <div style={{ ...styles.infoValue, fontFamily: 'monospace', fontSize: '0.85rem' }}>
                            {request.id || request._id}
                          </div>
                        </div>

                        {/* Full Name */}
                        {request.data?.fullName && (
                          <div style={styles.infoItem}>
                            <div style={styles.infoLabel}>الاسم الكامل | שם מלא</div>
                            <div style={styles.infoValue}>{request.data.fullName}</div>
                          </div>
                        )}

                        {/* ID Number */}
                        {request.data?.idNumber && (
                          <div style={styles.infoItem}>
                            <div style={styles.infoLabel}>رقم الهوية | מספר זהות</div>
                            <div style={styles.infoValue}>{request.data.idNumber}</div>
                          </div>
                        )}

                        {/* Phone */}
                        {request.data?.phone && (
                          <div style={styles.infoItem}>
                            <div style={styles.infoLabel}>رقم الهاتف | טלפון</div>
                            <div style={styles.infoValue}>{request.data.phone}</div>
                          </div>
                        )}

                        {/* Email */}
                        {request.data?.email && (
                          <div style={styles.infoItem}>
                            <div style={styles.infoLabel}>البريد الإلكتروني | אימייל</div>
                            <div style={styles.infoValue}>{request.data.email}</div>
                          </div>
                        )}

                        {/* Address */}
                        {request.data?.address && (
                          <div style={styles.infoItem}>
                            <div style={styles.infoLabel}>العنوان | כתובת</div>
                            <div style={styles.infoValue}>{request.data.address}</div>
                          </div>
                        )}

                        {/* Document Type - for documentAuth */}
                        {request.data?.documentType && (
                          <div style={styles.infoItem}>
                            <div style={styles.infoLabel}>نوع المستند | סוג מסמך</div>
                            <div style={styles.infoValue}>{request.data.documentType}</div>
                          </div>
                        )}

                        {/* Copies - for documentAuth */}
                        {request.data?.copies && (
                          <div style={styles.infoItem}>
                            <div style={styles.infoLabel}>عدد النسخ | מספר עותקים</div>
                            <div style={styles.infoValue}>{request.data.copies}</div>
                          </div>
                        )}

                        {/* Purpose - for officialDoc */}
                        {request.data?.purpose && (
                          <div style={styles.infoItem}>
                            <div style={styles.infoLabel}>الغرض | מטרה</div>
                            <div style={styles.infoValue}>{request.data.purpose}</div>
                          </div>
                        )}

                        {/* Urgency */}
                        {request.data?.urgency && (
                          <div style={styles.infoItem}>
                            <div style={styles.infoLabel}>الأولوية | דחיפות</div>
                            <div style={styles.infoValue}>
                              {request.data.urgency === 'urgent' ? 'عاجل | דחוף' : 'عادي | רגיל'}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Additional Notes from User */}
                      {request.data?.notes && (
                        <div style={{ ...styles.notesSection, background: '#e2e8f0', borderColor: '#718096' }}>
                          <div style={{ ...styles.notesTitle, color: '#4a5568' }}>
                            <span>📋</span>
                            <span>ملاحظات الطلب | הערות הבקשה</span>
                          </div>
                          <p style={{ ...styles.notesText, color: '#4a5568' }}>{request.data.notes}</p>
                        </div>
                      )}

                      {/* Attached Files from User */}
                      {request.files && request.files.length > 0 && (
                        <div style={{ marginTop: '16px' }}>
                          <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#1a365d', marginBottom: '10px' }}>
                            📎 المرفقات المقدمة | קבצים מצורפים ({request.files.length})
                          </div>
                          {request.files.map((file, fileIndex) => (
                            <div key={fileIndex} style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '10px 14px',
                              background: '#f7fafc',
                              border: '1px solid #e2e8f0',
                              borderRadius: '6px',
                              marginBottom: '8px'
                            }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span style={{ fontSize: '1.2rem' }}>📄</span>
                                <div>
                                  <div style={{ fontSize: '0.85rem', fontWeight: '500', color: '#2d3748' }}>
                                    {file.originalname}
                                  </div>
                                  {file.size && (
                                    <div style={{ fontSize: '0.75rem', color: '#718096' }}>
                                      {(file.size / 1024).toFixed(1)} KB
                                    </div>
                                  )}
                                </div>
                              </div>
                              <a
                                href={`${API_URL}/api/submission/${request.id || request._id}/file/${fileIndex}/download`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  padding: '6px 12px',
                                  background: '#3b82f6',
                                  color: '#fff',
                                  borderRadius: '4px',
                                  textDecoration: 'none',
                                  fontSize: '0.8rem',
                                  fontWeight: '500'
                                }}
                              >
                                تحميل
                              </a>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Admin Notes */}
                      {request.notes && (
                        <div style={styles.notesSection}>
                          <div style={styles.notesTitle}>
                            <span>📝</span>
                            <span>ملاحظات الإدارة | הערות המנהל</span>
                          </div>
                          <p style={styles.notesText}>{request.notes}</p>
                        </div>
                      )}

                      {/* Admin Response File */}
                      {request.adminResponseFile && (
                        <div style={styles.downloadSection}>
                          <div style={styles.downloadInfo}>
                            <div style={styles.downloadIcon}>📎</div>
                            <div style={styles.downloadDetails}>
                              <p style={styles.downloadName}>ملف الرد | קובץ תגובה</p>
                              <p style={styles.downloadSize}>
                                {request.adminResponseFile.originalname} - {(request.adminResponseFile.size / 1024).toFixed(1)} KB
                              </p>
                            </div>
                          </div>
                          <a
                            href={`${API_URL}/api/submission/${request.id || request._id}/response/download`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={styles.downloadBtn}
                          >
                            <span>⬇</span>
                            <span>تحميل</span>
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              <button
                onClick={resetSearch}
                style={{ ...styles.button, ...styles.buttonSecondary }}
              >
                بحث جديد | חיפוש חדש
              </button>
            </>
          )}

          {/* Results - Single Request */}
          {searchPerformed && requestData && (
            <>
              {(() => {
                const statusInfo = getStatusInfo(requestData.status);
                const typeLabel = getTypeLabel(requestData.type);

                return (
                  <div style={styles.resultCard}>
                    <div style={styles.resultHeader}>
                      <div>
                        <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#1a365d' }}>
                          {typeLabel.ar} | {typeLabel.he}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#718096', marginTop: '4px' }}>
                          {formatDate(requestData.submittedAt)}
                        </div>
                      </div>
                      <div
                        style={{
                          ...styles.statusBadge,
                          background: statusInfo.bgColor,
                          color: statusInfo.color,
                          border: `1px solid ${statusInfo.color}`
                        }}
                      >
                        <span>{statusInfo.icon}</span>
                        <span>{statusInfo.label}</span>
                      </div>
                    </div>

                    <div style={styles.resultBody}>
                      {/* Full Details Grid */}
                      <div style={styles.infoGrid}>
                        {/* Reference Number */}
                        <div style={styles.infoItem}>
                          <div style={styles.infoLabel}>رقم المرجع | מספר אסמכתא</div>
                          <div style={{ ...styles.infoValue, fontFamily: 'monospace', fontSize: '0.85rem' }}>
                            {requestData.id || requestData._id}
                          </div>
                        </div>

                        {/* Full Name */}
                        {requestData.data?.fullName && (
                          <div style={styles.infoItem}>
                            <div style={styles.infoLabel}>الاسم الكامل | שם מלא</div>
                            <div style={styles.infoValue}>{requestData.data.fullName}</div>
                          </div>
                        )}

                        {/* ID Number */}
                        {requestData.data?.idNumber && (
                          <div style={styles.infoItem}>
                            <div style={styles.infoLabel}>رقم الهوية | מספר זהות</div>
                            <div style={styles.infoValue}>{requestData.data.idNumber}</div>
                          </div>
                        )}

                        {/* Phone */}
                        {requestData.data?.phone && (
                          <div style={styles.infoItem}>
                            <div style={styles.infoLabel}>رقم الهاتف | טלפון</div>
                            <div style={styles.infoValue}>{requestData.data.phone}</div>
                          </div>
                        )}

                        {/* Email */}
                        {requestData.data?.email && (
                          <div style={styles.infoItem}>
                            <div style={styles.infoLabel}>البريد الإلكتروني | אימייל</div>
                            <div style={styles.infoValue}>{requestData.data.email}</div>
                          </div>
                        )}

                        {/* Address */}
                        {requestData.data?.address && (
                          <div style={styles.infoItem}>
                            <div style={styles.infoLabel}>العنوان | כתובת</div>
                            <div style={styles.infoValue}>{requestData.data.address}</div>
                          </div>
                        )}

                        {/* Document Type */}
                        {requestData.data?.documentType && (
                          <div style={styles.infoItem}>
                            <div style={styles.infoLabel}>نوع المستند | סוג מסמך</div>
                            <div style={styles.infoValue}>{requestData.data.documentType}</div>
                          </div>
                        )}

                        {/* Copies */}
                        {requestData.data?.copies && (
                          <div style={styles.infoItem}>
                            <div style={styles.infoLabel}>عدد النسخ | מספר עותקים</div>
                            <div style={styles.infoValue}>{requestData.data.copies}</div>
                          </div>
                        )}

                        {/* Purpose */}
                        {requestData.data?.purpose && (
                          <div style={styles.infoItem}>
                            <div style={styles.infoLabel}>الغرض | מטרה</div>
                            <div style={styles.infoValue}>{requestData.data.purpose}</div>
                          </div>
                        )}

                        {/* Urgency */}
                        {requestData.data?.urgency && (
                          <div style={styles.infoItem}>
                            <div style={styles.infoLabel}>الأولوية | דחיפות</div>
                            <div style={styles.infoValue}>
                              {requestData.data.urgency === 'urgent' ? 'عاجل | דחוף' : 'عادي | רגיל'}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* User Notes */}
                      {requestData.data?.notes && (
                        <div style={{ ...styles.notesSection, background: '#e2e8f0', borderColor: '#718096' }}>
                          <div style={{ ...styles.notesTitle, color: '#4a5568' }}>
                            <span>📋</span>
                            <span>ملاحظات الطلب | הערות הבקשה</span>
                          </div>
                          <p style={{ ...styles.notesText, color: '#4a5568' }}>{requestData.data.notes}</p>
                        </div>
                      )}

                      {/* Attached Files from User */}
                      {requestData.files && requestData.files.length > 0 && (
                        <div style={{ marginTop: '16px' }}>
                          <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#1a365d', marginBottom: '10px' }}>
                            📎 المرفقات المقدمة | קבצים מצורפים ({requestData.files.length})
                          </div>
                          {requestData.files.map((file, fileIndex) => (
                            <div key={fileIndex} style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '10px 14px',
                              background: '#f7fafc',
                              border: '1px solid #e2e8f0',
                              borderRadius: '6px',
                              marginBottom: '8px'
                            }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span style={{ fontSize: '1.2rem' }}>📄</span>
                                <div>
                                  <div style={{ fontSize: '0.85rem', fontWeight: '500', color: '#2d3748' }}>
                                    {file.originalname}
                                  </div>
                                  {file.size && (
                                    <div style={{ fontSize: '0.75rem', color: '#718096' }}>
                                      {(file.size / 1024).toFixed(1)} KB
                                    </div>
                                  )}
                                </div>
                              </div>
                              <a
                                href={`${API_URL}/api/submission/${requestData.id || requestData._id}/file/${fileIndex}/download`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  padding: '6px 12px',
                                  background: '#3b82f6',
                                  color: '#fff',
                                  borderRadius: '4px',
                                  textDecoration: 'none',
                                  fontSize: '0.8rem',
                                  fontWeight: '500'
                                }}
                              >
                                تحميل
                              </a>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Admin Notes */}
                      {requestData.notes && (
                        <div style={styles.notesSection}>
                          <div style={styles.notesTitle}>
                            <span>📝</span>
                            <span>ملاحظات الإدارة | הערות המנהל</span>
                          </div>
                          <p style={styles.notesText}>{requestData.notes}</p>
                        </div>
                      )}

                      {/* Admin Response File */}
                      {requestData.adminResponseFile && (
                        <div style={styles.downloadSection}>
                          <div style={styles.downloadInfo}>
                            <div style={styles.downloadIcon}>📎</div>
                            <div style={styles.downloadDetails}>
                              <p style={styles.downloadName}>ملف الرد | קובץ תגובה</p>
                              <p style={styles.downloadSize}>
                                {requestData.adminResponseFile.originalname} - {(requestData.adminResponseFile.size / 1024).toFixed(1)} KB
                              </p>
                            </div>
                          </div>
                          <a
                            href={`${API_URL}/api/submission/${requestData.id || requestData._id}/response/download`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={styles.downloadBtn}
                          >
                            <span>⬇</span>
                            <span>تحميل الملف</span>
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

              <button
                onClick={resetSearch}
                style={{ ...styles.button, ...styles.buttonSecondary }}
              >
                بحث جديد | חיפוש חדש
              </button>
            </>
          )}

          {/* No Results */}
          {searchPerformed && !requestData && multipleRequests.length === 0 && !error && (
            <>
              <div style={{
                textAlign: 'center',
                padding: '40px 20px',
                color: '#718096'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }}>🔍</div>
                <p style={{ fontSize: '1rem', margin: '0 0 8px 0' }}>لم يتم العثور على نتائج</p>
                <p style={{ fontSize: '0.85rem', margin: 0, color: '#a0aec0' }}>
                  לא נמצאו תוצאות
                </p>
              </div>
              <button
                onClick={resetSearch}
                style={{ ...styles.button, ...styles.buttonSecondary }}
              >
                بحث جديد | חיפוש חדש
              </button>
            </>
          )}
        </div>
      </div>

      {/* Help Section */}
      <div style={styles.helpSection}>
        <h3 style={styles.helpTitle}>هل تحتاج مساعدة؟ | צריכים עזרה?</h3>
        <p style={styles.helpText}>
          إذا واجهت أي مشكلة في تتبع طلبك، يرجى التواصل مع مكتب اللجنة المحلية.
          <br />
          אם יש לך בעיה במעקב אחר הבקשה שלך, אנא פנה למשרדי הוועדה המקומית.
        </p>
      </div>
    </div>
  );
};

export default RequestTracker;
