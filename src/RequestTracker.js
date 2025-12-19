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
          color: '#f59e0b',
          bgColor: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
          lightBg: '#fffbeb',
          icon: '⏳',
          step: 2
        };
      case 'approved':
        return {
          label: 'تمت الموافقة',
          labelHe: 'אושר',
          color: '#10b981',
          bgColor: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
          lightBg: '#ecfdf5',
          icon: '✓',
          step: 3
        };
      case 'rejected':
        return {
          label: 'مرفوض',
          labelHe: 'נדחה',
          color: '#ef4444',
          bgColor: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
          lightBg: '#fef2f2',
          icon: '✕',
          step: 3
        };
      default:
        return {
          label: 'غير معروف',
          labelHe: 'לא ידוע',
          color: '#6b7280',
          bgColor: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
          lightBg: '#f9fafb',
          icon: '?',
          step: 1
        };
    }
  };

  const getTypeInfo = (type) => {
    const types = {
      'documentAuth': { ar: 'مصادقة مستند', he: 'אימות מסמך', icon: '📄', color: '#8b5cf6' },
      'officialDoc': { ar: 'مستند رسمي', he: 'מסמך רשמי', icon: '📝', color: '#3b82f6' },
      'tenders': { ar: 'عرض مناقصة', he: 'הצעה למכרז', icon: '📋', color: '#f59e0b' },
      'certificates': { ar: 'شهادة', he: 'אישור', icon: '🎓', color: '#10b981' }
    };
    return types[type] || { ar: type, he: type, icon: '📄', color: '#6b7280' };
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return {
      date: date.toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' }),
      time: date.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
    };
  };

  const statusInfo = requestData ? getStatusInfo(requestData.status) : null;

  return (
    <div style={styles.pageContainer}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;600;700;800;900&display=swap');

        /* Animations */
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }

        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(30px); }
          to { opacity: 1; transform: translateX(0); }
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes bounceIn {
          0% { opacity: 0; transform: scale(0.3); }
          50% { transform: scale(1.05); }
          70% { transform: scale(0.9); }
          100% { opacity: 1; transform: scale(1); }
        }

        @keyframes progressLine {
          from { width: 0; }
          to { width: 100%; }
        }

        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.3); }
          50% { box-shadow: 0 0 40px rgba(59, 130, 246, 0.6); }
        }

        .page-animate {
          animation: fadeInUp 0.6s ease-out;
        }

        .card-animate {
          animation: scaleIn 0.5s ease-out;
        }

        .result-animate {
          animation: fadeInUp 0.6s ease-out;
        }

        .timeline-step {
          animation: slideInRight 0.5s ease-out backwards;
        }

        .timeline-step:nth-child(1) { animation-delay: 0.1s; }
        .timeline-step:nth-child(2) { animation-delay: 0.2s; }
        .timeline-step:nth-child(3) { animation-delay: 0.3s; }

        .request-card {
          animation: fadeInUp 0.4s ease-out backwards;
        }

        .request-card:nth-child(1) { animation-delay: 0.1s; }
        .request-card:nth-child(2) { animation-delay: 0.15s; }
        .request-card:nth-child(3) { animation-delay: 0.2s; }
        .request-card:nth-child(4) { animation-delay: 0.25s; }
        .request-card:nth-child(5) { animation-delay: 0.3s; }

        .search-input:focus {
          border-color: #3b82f6 !important;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.15) !important;
        }

        .tab-btn {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .tab-btn:hover {
          transform: translateY(-2px);
        }

        .tab-btn.active {
          animation: pulse 0.3s ease-out;
        }

        .search-btn:hover:not(:disabled) {
          transform: translateY(-3px);
          box-shadow: 0 12px 30px rgba(59, 130, 246, 0.4) !important;
        }

        .search-btn:active:not(:disabled) {
          transform: translateY(-1px);
        }

        .status-badge {
          animation: bounceIn 0.5s ease-out;
        }

        .download-btn:hover {
          transform: translateY(-3px) scale(1.02);
          box-shadow: 0 12px 30px rgba(16, 185, 129, 0.4) !important;
        }

        .help-card {
          transition: all 0.3s ease;
        }

        .help-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }

        .float-icon {
          animation: float 3s ease-in-out infinite;
        }

        .glow-effect {
          animation: glow 2s ease-in-out infinite;
        }

        /* Scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
        }

        ::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }

        ::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #3b82f6, #1d4ed8);
          border-radius: 10px;
        }
      `}</style>

      {/* Decorative Background */}
      <div style={styles.bgDecoration1} />
      <div style={styles.bgDecoration2} />
      <div style={styles.bgDecoration3} />

      <div className="page-animate" style={styles.container}>
        {/* Hero Header */}
        <header style={styles.heroHeader}>
          <div style={styles.heroPattern} />

          <div style={styles.heroContent}>
            <div className="float-icon" style={styles.heroIconWrapper}>
              <span style={styles.heroIcon}>🔍</span>
            </div>

            <h1 style={styles.heroTitle}>تتبع طلباتك</h1>
            <p style={styles.heroSubtitle}>
              راقب حالة طلباتك بسهولة وسرعة
            </p>

            <div style={styles.heroBadge}>
              <span style={styles.heroBadgeDot} />
              <span>متاح على مدار الساعة</span>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main style={styles.mainContent}>
          {/* Search Section */}
          <section className="card-animate" style={styles.searchSection}>
            {/* Search Type Tabs */}
            <div style={styles.tabsContainer}>
              <button
                className={`tab-btn ${searchType === 'idNumber' ? 'active' : ''}`}
                onClick={() => { setSearchType('idNumber'); setError(''); resetSearch(); }}
                style={{
                  ...styles.tabBtn,
                  ...(searchType === 'idNumber' ? styles.tabBtnActive : {})
                }}
              >
                <span style={styles.tabIcon}>🪪</span>
                <div style={styles.tabText}>
                  <span style={styles.tabTitle}>رقم الهوية</span>
                  <span style={styles.tabDesc}>عرض جميع طلباتك</span>
                </div>
              </button>

              <button
                className={`tab-btn ${searchType === 'reference' ? 'active' : ''}`}
                onClick={() => { setSearchType('reference'); setError(''); resetSearch(); }}
                style={{
                  ...styles.tabBtn,
                  ...(searchType === 'reference' ? styles.tabBtnActive : {})
                }}
              >
                <span style={styles.tabIcon}>🔢</span>
                <div style={styles.tabText}>
                  <span style={styles.tabTitle}>رقم الطلب</span>
                  <span style={styles.tabDesc}>البحث عن طلب محدد</span>
                </div>
              </button>
            </div>

            {/* Search Input */}
            <div style={styles.searchInputWrapper}>
              <div style={styles.inputContainer}>
                <span style={styles.inputIcon}>
                  {searchType === 'idNumber' ? '🪪' : '🔢'}
                </span>
                <input
                  type="text"
                  className="search-input"
                  value={searchType === 'reference' ? referenceNumber : idNumber}
                  onChange={(e) => searchType === 'reference'
                    ? setReferenceNumber(e.target.value)
                    : setIdNumber(e.target.value)
                  }
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder={searchType === 'idNumber'
                    ? 'أدخل رقم الهوية (9 أرقام)'
                    : 'أدخل رقم الطلب...'
                  }
                  style={styles.searchInput}
                  dir="ltr"
                  maxLength={searchType === 'idNumber' ? 9 : 50}
                />
              </div>

              <button
                className="search-btn"
                onClick={handleSearch}
                disabled={loading}
                style={{
                  ...styles.searchBtn,
                  ...(loading ? styles.searchBtnLoading : {})
                }}
              >
                {loading ? (
                  <div style={styles.spinner} />
                ) : (
                  <>
                    <span>بحث</span>
                    <span style={styles.searchBtnArrow}>←</span>
                  </>
                )}
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div style={styles.errorMessage}>
                <span style={styles.errorIcon}>⚠️</span>
                <span>{error}</span>
              </div>
            )}
          </section>

          {/* Results Section */}
          {(requestData || multipleRequests.length > 0) && (
            <section className="result-animate" style={styles.resultsSection}>
              {/* Back to Search Button */}
              <button onClick={resetSearch} style={styles.backBtn}>
                <span>→</span>
                <span>بحث جديد</span>
              </button>

              {/* Multiple Results */}
              {multipleRequests.length > 0 && (
                <div style={styles.multipleResults}>
                  <div style={styles.resultsHeader}>
                    <div style={styles.resultsCount}>
                      <span style={styles.resultsCountNumber}>{multipleRequests.length}</span>
                      <span style={styles.resultsCountText}>طلب/طلبات</span>
                    </div>
                    <h2 style={styles.resultsTitle}>نتائج البحث</h2>
                  </div>

                  <div style={styles.requestsList}>
                    {multipleRequests.map((request, index) => {
                      const status = getStatusInfo(request.status);
                      const type = getTypeInfo(request.type);
                      const dateInfo = formatDate(request.submittedAt);

                      return (
                        <div key={request.id} className="request-card" style={styles.requestCard}>
                          {/* Card Header */}
                          <div style={styles.requestCardHeader}>
                            <div style={{
                              ...styles.requestTypeIcon,
                              background: `linear-gradient(135deg, ${type.color}20, ${type.color}10)`
                            }}>
                              <span>{type.icon}</span>
                            </div>
                            <div style={styles.requestInfo}>
                              <h3 style={styles.requestType}>{type.ar}</h3>
                              <span style={styles.requestDate}>
                                {dateInfo.date} • {dateInfo.time}
                              </span>
                            </div>
                            <div className="status-badge" style={{
                              ...styles.statusBadge,
                              background: status.bgColor,
                              color: status.color
                            }}>
                              <span>{status.icon}</span>
                              <span>{status.label}</span>
                            </div>
                          </div>

                          {/* Card Body */}
                          <div style={styles.requestCardBody}>
                            <div style={styles.requestIdRow}>
                              <span style={styles.requestIdLabel}>رقم الطلب:</span>
                              <code style={styles.requestIdValue}>{request.id}</code>
                            </div>

                            {request.data?.fullName && (
                              <div style={styles.requestNameRow}>
                                <span>👤</span>
                                <span>{request.data.fullName}</span>
                              </div>
                            )}
                          </div>

                          {/* Notes */}
                          {request.notes && (
                            <div style={styles.requestNotes}>
                              <span style={styles.notesIcon}>💬</span>
                              <div>
                                <span style={styles.notesLabel}>ملاحظات الإدارة:</span>
                                <p style={styles.notesText}>{request.notes}</p>
                              </div>
                            </div>
                          )}

                          {/* Download File */}
                          {request.adminResponseFile && (
                            <div style={styles.requestFile}>
                              <div style={styles.fileInfo}>
                                <span style={styles.fileIcon}>📥</span>
                                <div>
                                  <span style={styles.fileName}>{request.adminResponseFile.originalname}</span>
                                  <span style={styles.fileSize}>
                                    ({(request.adminResponseFile.size / 1024).toFixed(1)} KB)
                                  </span>
                                </div>
                              </div>
                              <a
                                href={request.adminResponseFile.url || `${API_URL}/${request.adminResponseFile.path}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="download-btn"
                                style={styles.downloadBtn}
                              >
                                تحميل
                              </a>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Single Result */}
              {requestData && (
                <div style={styles.singleResult}>
                  {/* Status Card */}
                  <div style={{
                    ...styles.statusCard,
                    background: statusInfo.bgColor
                  }}>
                    <div className="status-badge" style={{
                      ...styles.statusIconLarge,
                      background: statusInfo.color
                    }}>
                      <span>{statusInfo.icon}</span>
                    </div>
                    <div style={styles.statusContent}>
                      <h2 style={{ ...styles.statusLabel, color: statusInfo.color }}>
                        {statusInfo.label}
                      </h2>
                      <p style={styles.statusLabelHe}>{statusInfo.labelHe}</p>
                    </div>
                  </div>

                  {/* Timeline */}
                  <div style={styles.timelineCard}>
                    <h3 style={styles.timelineTitle}>
                      <span>📊</span>
                      مراحل معالجة الطلب
                    </h3>

                    <div style={styles.timeline}>
                      {/* Step 1 */}
                      <div className="timeline-step" style={styles.timelineStep}>
                        <div style={{
                          ...styles.timelineNode,
                          background: 'linear-gradient(135deg, #10b981, #059669)',
                          color: '#fff'
                        }}>
                          <span>✓</span>
                        </div>
                        <div style={styles.timelineStepContent}>
                          <span style={styles.timelineStepTitle}>تم استلام الطلب</span>
                          <span style={styles.timelineStepDate}>
                            {formatDate(requestData.submittedAt).date}
                          </span>
                        </div>
                        <div style={{
                          ...styles.timelineConnector,
                          background: statusInfo.step >= 2 ? '#10b981' : '#e2e8f0'
                        }} />
                      </div>

                      {/* Step 2 */}
                      <div className="timeline-step" style={styles.timelineStep}>
                        <div style={{
                          ...styles.timelineNode,
                          background: statusInfo.step >= 2
                            ? 'linear-gradient(135deg, #f59e0b, #d97706)'
                            : '#e2e8f0',
                          color: statusInfo.step >= 2 ? '#fff' : '#94a3b8'
                        }}>
                          <span>{statusInfo.step >= 2 ? '⏳' : '2'}</span>
                        </div>
                        <div style={styles.timelineStepContent}>
                          <span style={styles.timelineStepTitle}>قيد المراجعة</span>
                          <span style={styles.timelineStepDate}>
                            {statusInfo.step >= 2 ? 'جاري المعالجة...' : 'في الانتظار'}
                          </span>
                        </div>
                        <div style={{
                          ...styles.timelineConnector,
                          background: statusInfo.step >= 3 ? statusInfo.color : '#e2e8f0'
                        }} />
                      </div>

                      {/* Step 3 */}
                      <div className="timeline-step" style={styles.timelineStep}>
                        <div style={{
                          ...styles.timelineNode,
                          background: statusInfo.step >= 3
                            ? `linear-gradient(135deg, ${statusInfo.color}, ${statusInfo.color}dd)`
                            : '#e2e8f0',
                          color: statusInfo.step >= 3 ? '#fff' : '#94a3b8'
                        }}>
                          <span>{statusInfo.step >= 3 ? statusInfo.icon : '3'}</span>
                        </div>
                        <div style={styles.timelineStepContent}>
                          <span style={styles.timelineStepTitle}>القرار النهائي</span>
                          <span style={styles.timelineStepDate}>
                            {statusInfo.step >= 3
                              ? (requestData.status === 'approved' ? 'تمت الموافقة' : 'تم الرفض')
                              : 'في انتظار القرار'
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Details Card */}
                  <div style={styles.detailsCard}>
                    <h3 style={styles.detailsTitle}>
                      <span>📋</span>
                      تفاصيل الطلب
                    </h3>

                    <div style={styles.detailsGrid}>
                      <div style={styles.detailBox}>
                        <span style={styles.detailIcon}>🔢</span>
                        <div style={styles.detailContent}>
                          <span style={styles.detailLabel}>رقم المرجع</span>
                          <code style={styles.detailValue}>{requestData.id}</code>
                        </div>
                      </div>

                      <div style={styles.detailBox}>
                        <span style={styles.detailIcon}>{getTypeInfo(requestData.type).icon}</span>
                        <div style={styles.detailContent}>
                          <span style={styles.detailLabel}>نوع الطلب</span>
                          <span style={styles.detailValue}>{getTypeInfo(requestData.type).ar}</span>
                        </div>
                      </div>

                      <div style={styles.detailBox}>
                        <span style={styles.detailIcon}>📅</span>
                        <div style={styles.detailContent}>
                          <span style={styles.detailLabel}>تاريخ التقديم</span>
                          <span style={styles.detailValue}>{formatDate(requestData.submittedAt).date}</span>
                        </div>
                      </div>

                      {requestData.data?.fullName && (
                        <div style={styles.detailBox}>
                          <span style={styles.detailIcon}>👤</span>
                          <div style={styles.detailContent}>
                            <span style={styles.detailLabel}>مقدم الطلب</span>
                            <span style={styles.detailValue}>{requestData.data.fullName}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Notes */}
                    {requestData.notes && (
                      <div style={styles.notesCard}>
                        <div style={styles.notesHeader}>
                          <span>💬</span>
                          <span>ملاحظات من الإدارة</span>
                        </div>
                        <p style={styles.notesContent}>{requestData.notes}</p>
                      </div>
                    )}

                    {/* Download File */}
                    {requestData.adminResponseFile && (
                      <div style={styles.downloadCard}>
                        <div style={styles.downloadHeader}>
                          <div style={styles.downloadIconWrapper}>
                            <span>📥</span>
                          </div>
                          <div>
                            <h4 style={styles.downloadTitle}>ملف متاح للتحميل</h4>
                            <p style={styles.downloadSubtitle}>
                              {requestData.adminResponseFile.originalname}
                              <span style={styles.downloadSize}>
                                ({(requestData.adminResponseFile.size / 1024).toFixed(1)} KB)
                              </span>
                            </p>
                          </div>
                        </div>
                        <a
                          href={requestData.adminResponseFile.url || `${API_URL}/${requestData.adminResponseFile.path}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="download-btn"
                          style={styles.downloadBtnLarge}
                        >
                          <span>تحميل الملف</span>
                          <span>↓</span>
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Contact Card */}
                  <div style={styles.contactCard}>
                    <span style={styles.contactIcon}>📞</span>
                    <div style={styles.contactContent}>
                      <p style={styles.contactText}>للاستفسار عن طلبك:</p>
                      <a href="mailto:husniua.committe@gmail.com" style={styles.contactEmail}>
                        husniua.committe@gmail.com
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </section>
          )}

          {/* Help Section - Only when no results */}
          {!searchPerformed && (
            <section style={styles.helpSection}>
              <h3 style={styles.helpTitle}>
                <span>💡</span>
                كيف أتتبع طلباتي؟
              </h3>

              <div style={styles.helpGrid}>
                <div className="help-card" style={styles.helpCard}>
                  <div style={styles.helpCardIcon}>🪪</div>
                  <h4 style={styles.helpCardTitle}>برقم الهوية</h4>
                  <p style={styles.helpCardText}>
                    أدخل رقم هويتك المكون من 9 أرقام لعرض جميع طلباتك السابقة والحالية
                  </p>
                </div>

                <div className="help-card" style={styles.helpCard}>
                  <div style={styles.helpCardIcon}>🔢</div>
                  <h4 style={styles.helpCardTitle}>برقم الطلب</h4>
                  <p style={styles.helpCardText}>
                    استخدم رقم الطلب الذي حصلت عليه عند تقديم الطلب للبحث عن طلب محدد
                  </p>
                </div>

                <div className="help-card" style={styles.helpCard}>
                  <div style={styles.helpCardIcon}>⚡</div>
                  <h4 style={styles.helpCardTitle}>متابعة فورية</h4>
                  <p style={styles.helpCardText}>
                    تابع حالة طلبك لحظة بلحظة واحصل على إشعارات بأي تحديثات
                  </p>
                </div>
              </div>
            </section>
          )}
        </main>

        {/* Footer */}
        <footer style={styles.footer}>
          <div style={styles.footerContent}>
            <p style={styles.footerText}>
              اللجنة المحلية - الحسينية | הוועדה המקומית - חוסניה
            </p>
            <p style={styles.footerSubtext}>
              خدمة تتبع الطلبات الإلكترونية
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

const styles = {
  pageContainer: {
    minHeight: '100vh',
    direction: 'rtl',
    fontFamily: '"Tajawal", sans-serif',
    background: 'linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%)',
    position: 'relative',
    overflow: 'hidden',
  },
  bgDecoration1: {
    position: 'fixed',
    top: '-20%',
    right: '-15%',
    width: '500px',
    height: '500px',
    background: 'radial-gradient(circle, rgba(59, 130, 246, 0.12) 0%, transparent 70%)',
    borderRadius: '50%',
    filter: 'blur(60px)',
    pointerEvents: 'none',
    zIndex: 0,
  },
  bgDecoration2: {
    position: 'fixed',
    bottom: '10%',
    left: '-10%',
    width: '400px',
    height: '400px',
    background: 'radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, transparent 70%)',
    borderRadius: '50%',
    filter: 'blur(60px)',
    pointerEvents: 'none',
    zIndex: 0,
  },
  bgDecoration3: {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '800px',
    height: '800px',
    background: 'radial-gradient(circle, rgba(16, 185, 129, 0.05) 0%, transparent 70%)',
    borderRadius: '50%',
    filter: 'blur(80px)',
    pointerEvents: 'none',
    zIndex: 0,
  },
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '0 20px 60px',
    position: 'relative',
    zIndex: 1,
  },
  heroHeader: {
    background: 'linear-gradient(135deg, #1e3a5f 0%, #1a365d 50%, #2c5282 100%)',
    borderRadius: '0 0 40px 40px',
    padding: '50px 30px 60px',
    textAlign: 'center',
    position: 'relative',
    overflow: 'hidden',
    marginBottom: '30px',
  },
  heroPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.05,
    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
    pointerEvents: 'none',
  },
  heroContent: {
    position: 'relative',
    zIndex: 1,
  },
  heroIconWrapper: {
    width: '90px',
    height: '90px',
    background: 'rgba(255,255,255,0.15)',
    backdropFilter: 'blur(10px)',
    borderRadius: '28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 24px',
    border: '2px solid rgba(255,255,255,0.2)',
  },
  heroIcon: {
    fontSize: '42px',
  },
  heroTitle: {
    fontSize: 'clamp(28px, 6vw, 40px)',
    fontWeight: '900',
    color: '#fff',
    margin: '0 0 12px 0',
    textShadow: '0 4px 20px rgba(0,0,0,0.2)',
  },
  heroSubtitle: {
    fontSize: '17px',
    color: 'rgba(255,255,255,0.85)',
    margin: '0 0 24px 0',
    fontWeight: '500',
  },
  heroBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 24px',
    background: 'rgba(255,255,255,0.1)',
    borderRadius: '50px',
    border: '1px solid rgba(255,255,255,0.2)',
    color: '#fff',
    fontSize: '14px',
    fontWeight: '600',
  },
  heroBadgeDot: {
    width: '8px',
    height: '8px',
    background: '#10b981',
    borderRadius: '50%',
    boxShadow: '0 0 10px #10b981',
  },
  mainContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  searchSection: {
    background: '#fff',
    borderRadius: '28px',
    padding: '32px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
    border: '1px solid rgba(255,255,255,0.8)',
  },
  tabsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '16px',
    marginBottom: '28px',
  },
  tabBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '20px',
    background: '#f8fafc',
    border: '3px solid #e2e8f0',
    borderRadius: '20px',
    cursor: 'pointer',
    fontFamily: 'inherit',
    textAlign: 'right',
  },
  tabBtnActive: {
    background: 'linear-gradient(135deg, #ebf8ff 0%, #dbeafe 100%)',
    borderColor: '#3b82f6',
    boxShadow: '0 8px 25px rgba(59, 130, 246, 0.2)',
  },
  tabIcon: {
    fontSize: '32px',
    flexShrink: 0,
  },
  tabText: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  tabTitle: {
    fontSize: '17px',
    fontWeight: '700',
    color: '#1a365d',
  },
  tabDesc: {
    fontSize: '13px',
    color: '#64748b',
  },
  searchInputWrapper: {
    display: 'flex',
    gap: '14px',
    marginBottom: '16px',
  },
  inputContainer: {
    flex: 1,
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    right: '20px',
    fontSize: '22px',
    pointerEvents: 'none',
    zIndex: 1,
  },
  searchInput: {
    width: '100%',
    padding: '20px 60px 20px 24px',
    fontSize: '18px',
    border: '3px solid #e2e8f0',
    borderRadius: '18px',
    fontFamily: 'monospace',
    letterSpacing: '2px',
    textAlign: 'center',
    transition: 'all 0.3s ease',
    outline: 'none',
    background: '#f8fafc',
  },
  searchBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    padding: '20px 36px',
    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: '18px',
    fontSize: '18px',
    fontWeight: '700',
    fontFamily: 'inherit',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 8px 25px rgba(59, 130, 246, 0.3)',
    flexShrink: 0,
  },
  searchBtnLoading: {
    opacity: 0.7,
    cursor: 'wait',
  },
  searchBtnArrow: {
    fontSize: '22px',
  },
  spinner: {
    width: '24px',
    height: '24px',
    border: '3px solid rgba(255,255,255,0.3)',
    borderTopColor: '#fff',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  errorMessage: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    padding: '18px 24px',
    background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
    borderRadius: '16px',
    color: '#dc2626',
    fontSize: '15px',
    fontWeight: '600',
    border: '2px solid #fca5a5',
  },
  errorIcon: {
    fontSize: '22px',
  },
  resultsSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  backBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '10px',
    alignSelf: 'flex-start',
    padding: '12px 24px',
    background: '#fff',
    border: '2px solid #e2e8f0',
    borderRadius: '12px',
    color: '#64748b',
    fontSize: '15px',
    fontWeight: '600',
    fontFamily: 'inherit',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  multipleResults: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  resultsHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '20px 24px',
    background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
    borderRadius: '20px',
    border: '2px solid #a7f3d0',
  },
  resultsCount: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '8px',
  },
  resultsCountNumber: {
    fontSize: '36px',
    fontWeight: '900',
    color: '#059669',
  },
  resultsCountText: {
    fontSize: '16px',
    color: '#059669',
    fontWeight: '600',
  },
  resultsTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#065f46',
    margin: 0,
  },
  requestsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  requestCard: {
    background: '#fff',
    borderRadius: '24px',
    padding: '24px',
    boxShadow: '0 6px 25px rgba(0,0,0,0.06)',
    border: '2px solid #f1f5f9',
    transition: 'all 0.3s ease',
  },
  requestCardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '20px',
  },
  requestTypeIcon: {
    width: '56px',
    height: '56px',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '28px',
    flexShrink: 0,
  },
  requestInfo: {
    flex: 1,
  },
  requestType: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#1a365d',
    margin: '0 0 4px 0',
  },
  requestDate: {
    fontSize: '13px',
    color: '#64748b',
  },
  statusBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 18px',
    borderRadius: '50px',
    fontSize: '14px',
    fontWeight: '700',
  },
  requestCardBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    padding: '16px',
    background: '#f8fafc',
    borderRadius: '14px',
    marginBottom: '16px',
  },
  requestIdRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  requestIdLabel: {
    fontSize: '13px',
    color: '#64748b',
  },
  requestIdValue: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#1a365d',
    background: '#e2e8f0',
    padding: '4px 12px',
    borderRadius: '6px',
    fontFamily: 'monospace',
  },
  requestNameRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '15px',
    color: '#334155',
    fontWeight: '600',
  },
  requestNotes: {
    display: 'flex',
    gap: '14px',
    padding: '18px',
    background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
    borderRadius: '14px',
    marginBottom: '16px',
    border: '2px solid #fcd34d',
  },
  notesIcon: {
    fontSize: '24px',
    flexShrink: 0,
  },
  notesLabel: {
    display: 'block',
    fontSize: '13px',
    fontWeight: '700',
    color: '#92400e',
    marginBottom: '6px',
  },
  notesText: {
    fontSize: '14px',
    color: '#78350f',
    margin: 0,
    lineHeight: 1.6,
  },
  requestFile: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '18px',
    background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
    borderRadius: '14px',
    border: '2px solid #a7f3d0',
  },
  fileInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
  },
  fileIcon: {
    fontSize: '28px',
  },
  fileName: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '600',
    color: '#065f46',
  },
  fileSize: {
    fontSize: '12px',
    color: '#059669',
  },
  downloadBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '12px 24px',
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    color: '#fff',
    borderRadius: '12px',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '700',
    boxShadow: '0 6px 20px rgba(16, 185, 129, 0.3)',
    transition: 'all 0.3s ease',
  },
  singleResult: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  statusCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
    padding: '32px',
    borderRadius: '28px',
    border: '3px solid rgba(255,255,255,0.5)',
  },
  statusIconLarge: {
    width: '80px',
    height: '80px',
    borderRadius: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '36px',
    color: '#fff',
    flexShrink: 0,
    boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
  },
  statusContent: {},
  statusLabel: {
    fontSize: '28px',
    fontWeight: '900',
    margin: '0 0 6px 0',
  },
  statusLabelHe: {
    fontSize: '18px',
    color: '#64748b',
    margin: 0,
    fontWeight: '500',
  },
  timelineCard: {
    background: '#fff',
    borderRadius: '28px',
    padding: '32px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
  },
  timelineTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '20px',
    fontWeight: '800',
    color: '#1a365d',
    margin: '0 0 28px 0',
  },
  timeline: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0',
  },
  timelineStep: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '20px',
    position: 'relative',
    paddingBottom: '32px',
  },
  timelineNode: {
    width: '52px',
    height: '52px',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '22px',
    fontWeight: '800',
    flexShrink: 0,
    zIndex: 1,
    boxShadow: '0 6px 20px rgba(0,0,0,0.1)',
  },
  timelineStepContent: {
    paddingTop: '12px',
  },
  timelineStepTitle: {
    display: 'block',
    fontSize: '17px',
    fontWeight: '700',
    color: '#1a365d',
    marginBottom: '6px',
  },
  timelineStepDate: {
    fontSize: '14px',
    color: '#64748b',
  },
  timelineConnector: {
    position: 'absolute',
    right: '25px',
    top: '56px',
    width: '3px',
    height: 'calc(100% - 32px)',
    borderRadius: '2px',
  },
  detailsCard: {
    background: '#fff',
    borderRadius: '28px',
    padding: '32px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
  },
  detailsTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '20px',
    fontWeight: '800',
    color: '#1a365d',
    margin: '0 0 24px 0',
  },
  detailsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '16px',
    marginBottom: '24px',
  },
  detailBox: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '16px',
    padding: '20px',
    background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
    borderRadius: '18px',
  },
  detailIcon: {
    fontSize: '28px',
    flexShrink: 0,
  },
  detailContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  detailLabel: {
    fontSize: '13px',
    color: '#64748b',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: '15px',
    color: '#1a365d',
    fontWeight: '700',
  },
  notesCard: {
    padding: '24px',
    background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
    borderRadius: '20px',
    border: '3px solid #fcd34d',
    marginBottom: '24px',
  },
  notesHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '16px',
    fontWeight: '700',
    color: '#92400e',
    marginBottom: '12px',
  },
  notesContent: {
    fontSize: '15px',
    color: '#78350f',
    margin: 0,
    lineHeight: 1.7,
  },
  downloadCard: {
    padding: '28px',
    background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
    borderRadius: '24px',
    border: '3px solid #a7f3d0',
  },
  downloadHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '18px',
    marginBottom: '20px',
  },
  downloadIconWrapper: {
    width: '60px',
    height: '60px',
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    borderRadius: '18px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '28px',
    boxShadow: '0 8px 25px rgba(16, 185, 129, 0.3)',
  },
  downloadTitle: {
    fontSize: '18px',
    fontWeight: '800',
    color: '#065f46',
    margin: '0 0 6px 0',
  },
  downloadSubtitle: {
    fontSize: '14px',
    color: '#059669',
    margin: 0,
  },
  downloadSize: {
    marginRight: '8px',
    opacity: 0.8,
  },
  downloadBtnLarge: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    width: '100%',
    padding: '18px 32px',
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    color: '#fff',
    borderRadius: '16px',
    textDecoration: 'none',
    fontSize: '18px',
    fontWeight: '800',
    boxShadow: '0 10px 30px rgba(16, 185, 129, 0.35)',
    transition: 'all 0.3s ease',
  },
  contactCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    padding: '24px 28px',
    background: 'linear-gradient(135deg, #ebf8ff 0%, #dbeafe 100%)',
    borderRadius: '20px',
    border: '3px solid #93c5fd',
  },
  contactIcon: {
    fontSize: '36px',
    flexShrink: 0,
  },
  contactContent: {},
  contactText: {
    fontSize: '14px',
    color: '#1e40af',
    margin: '0 0 6px 0',
  },
  contactEmail: {
    fontSize: '17px',
    color: '#1d4ed8',
    fontWeight: '700',
    textDecoration: 'none',
    direction: 'ltr',
    display: 'inline-block',
  },
  helpSection: {
    background: '#fff',
    borderRadius: '28px',
    padding: '36px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
  },
  helpTitle: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    fontSize: '22px',
    fontWeight: '800',
    color: '#1a365d',
    margin: '0 0 28px 0',
  },
  helpGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '20px',
  },
  helpCard: {
    textAlign: 'center',
    padding: '28px 20px',
    background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
    borderRadius: '24px',
    border: '2px solid #e2e8f0',
    cursor: 'pointer',
  },
  helpCardIcon: {
    fontSize: '48px',
    marginBottom: '18px',
    display: 'block',
  },
  helpCardTitle: {
    fontSize: '17px',
    fontWeight: '700',
    color: '#1a365d',
    margin: '0 0 10px 0',
  },
  helpCardText: {
    fontSize: '14px',
    color: '#64748b',
    margin: 0,
    lineHeight: 1.6,
  },
  footer: {
    textAlign: 'center',
    marginTop: '50px',
    paddingTop: '30px',
    borderTop: '2px solid #e2e8f0',
  },
  footerContent: {},
  footerText: {
    fontSize: '15px',
    color: '#475569',
    margin: '0 0 6px 0',
    fontWeight: '600',
  },
  footerSubtext: {
    fontSize: '13px',
    color: '#94a3b8',
    margin: 0,
  },

  // Responsive styles applied via media query in CSS
  '@media (max-width: 768px)': {
    tabsContainer: {
      gridTemplateColumns: '1fr',
    },
    detailsGrid: {
      gridTemplateColumns: '1fr',
    },
    helpGrid: {
      gridTemplateColumns: '1fr',
    },
    searchInputWrapper: {
      flexDirection: 'column',
    },
  },
};

export default RequestTracker;
