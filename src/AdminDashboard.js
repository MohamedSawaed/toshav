import React, { useState, useEffect } from 'react';
import API_BASE_URL from './config';

const API_URL = `${API_BASE_URL}/api`;
const ADMIN_TOKEN = 'admin-secret-token'; // In production, use proper authentication

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [loading, setLoading] = useState(false);
  const [publishedTenders, setPublishedTenders] = useState([]);
  const [showTenderForm, setShowTenderForm] = useState(false);
  const [downloadsLog, setDownloadsLog] = useState([]);
  const [downloadsStats, setDownloadsStats] = useState(null);
  const [visitsLog, setVisitsLog] = useState([]);
  const [visitsStats, setVisitsStats] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [protocols, setProtocols] = useState([]);
  const [showProtocolForm, setShowProtocolForm] = useState(false);
  const [editingProtocol, setEditingProtocol] = useState(null);

  // Handle window resize for responsive design
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const headers = {
    'Authorization': `Bearer ${ADMIN_TOKEN}`,
    'Content-Type': 'application/json'
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    if (activeTab !== 'overview' && activeTab !== 'publish-tender' && activeTab !== 'downloads' && activeTab !== 'visits' && activeTab !== 'protocols') {
      fetchSubmissions(activeTab);
    } else if (activeTab === 'publish-tender') {
      fetchPublishedTenders();
    } else if (activeTab === 'downloads') {
      fetchDownloadsLog();
      fetchDownloadsStats();
    } else if (activeTab === 'visits') {
      fetchVisitsLog();
      fetchVisitsStats();
    } else if (activeTab === 'protocols') {
      fetchProtocols();
    }
  }, [activeTab]);

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_URL}/admin/stats`, { headers });
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchSubmissions = async (type) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/admin/submissions/${type}`, { headers });
      const data = await response.json();
      setSubmissions(data.submissions || []);
    } catch (error) {
      console.error('Error fetching submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPublishedTenders = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/admin/tenders/all`, { headers });
      const data = await response.json();
      setPublishedTenders(data);
    } catch (error) {
      console.error('Error fetching tenders:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDownloadsLog = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/admin/downloads?limit=100`, { headers });
      const data = await response.json();
      setDownloadsLog(data.downloads || []);
    } catch (error) {
      console.error('Error fetching downloads log:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDownloadsStats = async () => {
    try {
      const response = await fetch(`${API_URL}/admin/downloads/stats`, { headers });
      const data = await response.json();
      setDownloadsStats(data);
    } catch (error) {
      console.error('Error fetching downloads stats:', error);
    }
  };

  const fetchVisitsLog = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/admin/visits?limit=100`, { headers });
      const data = await response.json();
      setVisitsLog(data.visits || []);
    } catch (error) {
      console.error('Error fetching visits log:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchVisitsStats = async () => {
    try {
      const response = await fetch(`${API_URL}/admin/visits/stats`, { headers });
      const data = await response.json();
      setVisitsStats(data);
    } catch (error) {
      console.error('Error fetching visits stats:', error);
    }
  };

  const fetchProtocols = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/admin/protocols/all`, { headers });
      const data = await response.json();
      setProtocols(data);
    } catch (error) {
      console.error('Error fetching protocols:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteProtocol = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا البروتوكول؟')) return;

    try {
      await fetch(`${API_URL}/admin/protocols/${id}`, {
        method: 'DELETE',
        headers
      });
      fetchProtocols();
    } catch (error) {
      console.error('Error deleting protocol:', error);
    }
  };

  const updateSubmissionStatus = async (id, status, notes) => {
    try {
      await fetch(`${API_URL}/admin/submission/${id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status, notes })
      });
      fetchSubmissions(activeTab);
      setSelectedSubmission(null);
      fetchStats();
    } catch (error) {
      console.error('Error updating submission:', error);
    }
  };

  const deleteSubmission = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا الطلب؟')) return;

    try {
      await fetch(`${API_URL}/admin/submission/${id}`, {
        method: 'DELETE',
        headers
      });
      fetchSubmissions(activeTab);
      setSelectedSubmission(null);
      fetchStats();
    } catch (error) {
      console.error('Error deleting submission:', error);
    }
  };

  const uploadResponseFile = async (id, file) => {
    if (!file) return;

    setUploadingFile(true);
    try {
      const formData = new FormData();
      formData.append('responseFile', file);

      const response = await fetch(`${API_URL}/admin/submission/${id}/upload-response`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${ADMIN_TOKEN}`
        },
        body: formData
      });

      const data = await response.json();
      if (data.success) {
        setSelectedSubmission({ ...selectedSubmission, adminResponseFile: data.file });
        fetchSubmissions(activeTab);
        alert('تم رفع الملف بنجاح');
      } else {
        alert('فشل في رفع الملف');
      }
    } catch (error) {
      console.error('Error uploading response file:', error);
      alert('حدث خطأ أثناء رفع الملف');
    } finally {
      setUploadingFile(false);
    }
  };

  const deleteResponseFile = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف ملف الرد؟')) return;

    setUploadingFile(true);
    try {
      const response = await fetch(`${API_URL}/admin/submission/${id}/response-file`, {
        method: 'DELETE',
        headers
      });

      const data = await response.json();
      if (data.success) {
        setSelectedSubmission({ ...selectedSubmission, adminResponseFile: null });
        fetchSubmissions(activeTab);
        alert('تم حذف الملف بنجاح');
      } else {
        alert('فشل في حذف الملف');
      }
    } catch (error) {
      console.error('Error deleting response file:', error);
      alert('حدث خطأ أثناء حذف الملف');
    } finally {
      setUploadingFile(false);
    }
  };

  const deleteTender = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المكرز؟')) return;

    try {
      await fetch(`${API_URL}/admin/tenders/${id}`, {
        method: 'DELETE',
        headers
      });
      fetchPublishedTenders();
    } catch (error) {
      console.error('Error deleting tender:', error);
    }
  };

  const renderOverview = () => {
    if (!stats) return <div style={styles.loading}>جاري التحميل...</div>;

    return (
      <div style={styles.overviewContainer}>
        <h2 style={styles.sectionTitle}>لوحة المراقبة</h2>

        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>📄</div>
            <h3 style={styles.statTitle}>طلبات المصادقة</h3>
            <div style={styles.statNumber}>{stats.documentAuth.total}</div>
            <div style={styles.statBreakdown}>
              <span>قيد الانتظار: {stats.documentAuth.pending}</span>
              <span>مقبول: {stats.documentAuth.approved}</span>
              <span>مرفوض: {stats.documentAuth.rejected}</span>
            </div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statIcon}>📋</div>
            <h3 style={styles.statTitle}>طلبات المستندات</h3>
            <div style={styles.statNumber}>{stats.officialDoc.total}</div>
            <div style={styles.statBreakdown}>
              <span>قيد الانتظار: {stats.officialDoc.pending}</span>
              <span>مقبول: {stats.officialDoc.approved}</span>
              <span>مرفوض: {stats.officialDoc.rejected}</span>
            </div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statIcon}>🏗️</div>
            <h3 style={styles.statTitle}>عروض المناقصات</h3>
            <div style={styles.statNumber}>{stats.tenders.total}</div>
            <div style={styles.statBreakdown}>
              <span>قيد الانتظار: {stats.tenders.pending}</span>
              <span>مقبول: {stats.tenders.approved}</span>
              <span>مرفوض: {stats.tenders.rejected}</span>
            </div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statIcon}>🔍</div>
            <h3 style={styles.statTitle}>طلبات الشهادات</h3>
            <div style={styles.statNumber}>{stats.certificates.total}</div>
          </div>
        </div>
      </div>
    );
  };

  const renderSubmissionsList = () => {
    if (loading) return <div style={styles.loading}>جاري التحميل...</div>;

    const getTitleByType = () => {
      switch(activeTab) {
        case 'documentAuth': return 'طلبات مصادقة المستندات';
        case 'officialDoc': return 'طلبات إعداد المستندات';
        case 'tenders': return 'عروض المناقصات';
        case 'certificates': return 'طلبات الشهادات';
        default: return 'الطلبات';
      }
    };

    return (
      <div>
        <h2 style={styles.sectionTitle}>{getTitleByType()}</h2>

        {submissions.length === 0 ? (
          <div style={styles.emptyState}>لا توجد طلبات حالياً</div>
        ) : (
          <div style={styles.submissionsTable}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th>رقم الطلب</th>
                  <th>الاسم</th>
                  <th>تاريخ التقديم</th>
                  <th>الحالة</th>
                  <th>إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map(submission => (
                  <tr key={submission.id}>
                    <td>{submission.id}</td>
                    <td>{submission.data?.fullName || submission.data?.name || 'غير متوفر'}</td>
                    <td>{new Date(submission.submittedAt).toLocaleDateString('ar')}</td>
                    <td>
                      <span style={{
                        ...styles.statusBadge,
                        ...(submission.status === 'pending' && styles.statusPending),
                        ...(submission.status === 'approved' && styles.statusApproved),
                        ...(submission.status === 'rejected' && styles.statusRejected)
                      }}>
                        {submission.status === 'pending' && 'قيد الانتظار'}
                        {submission.status === 'approved' && 'مقبول'}
                        {submission.status === 'rejected' && 'مرفوض'}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => setSelectedSubmission(submission)}
                        style={styles.viewBtn}
                      >
                        عرض
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {selectedSubmission && renderSubmissionDetails()}
      </div>
    );
  };

  const renderSubmissionDetails = () => {
    return (
      <div style={styles.modal} onClick={() => setSelectedSubmission(null)}>
        <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
          <div style={styles.modalHeader}>
            <h3>تفاصيل الطلب #{selectedSubmission.id}</h3>
            <button onClick={() => setSelectedSubmission(null)} style={styles.closeBtn}>✕</button>
          </div>

          <div style={styles.modalBody}>
            <div style={styles.detailsGrid}>
              {Object.entries(selectedSubmission.data).map(([key, value]) => (
                <div key={key} style={styles.detailItem}>
                  <strong>{key}:</strong> {typeof value === 'object' ? JSON.stringify(value) : value}
                </div>
              ))}
            </div>

            {selectedSubmission.files && selectedSubmission.files.length > 0 && (
              <div style={styles.filesSection}>
                <h4>المرفقات:</h4>
                {selectedSubmission.files.map((file, index) => (
                  <div key={index} style={styles.fileItem}>
                    <span>📎 {file.originalname}</span>
                    <a
                      href={`${API_URL}/download?url=${encodeURIComponent(file.url)}&filename=${encodeURIComponent(file.originalname)}`}
                      style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: '600' }}
                    >
                      تحميل
                    </a>
                  </div>
                ))}
              </div>
            )}

            {/* Admin Response File Section */}
            <div style={styles.responseFileSection}>
              <h4 style={styles.responseFileTitle}>📁 ملف الرد للمستخدم:</h4>

              {selectedSubmission.adminResponseFile ? (
                <div style={styles.responseFileItem}>
                  <div style={styles.responseFileInfo}>
                    <span style={styles.responseFileIcon}>📄</span>
                    <div>
                      <span style={styles.responseFileName}>{selectedSubmission.adminResponseFile.originalname}</span>
                      <span style={styles.responseFileSize}>
                        ({(selectedSubmission.adminResponseFile.size / 1024).toFixed(1)} KB)
                      </span>
                    </div>
                  </div>
                  <div style={styles.responseFileActions}>
                    <a
                      href={`${API_URL}/download?url=${encodeURIComponent(selectedSubmission.adminResponseFile.url)}&filename=${encodeURIComponent(selectedSubmission.adminResponseFile.originalname)}`}
                      style={styles.downloadResponseBtn}
                    >
                      تحميل
                    </a>
                    <button
                      onClick={() => deleteResponseFile(selectedSubmission.id)}
                      disabled={uploadingFile}
                      style={styles.deleteResponseBtn}
                    >
                      حذف
                    </button>
                  </div>
                </div>
              ) : (
                <div style={styles.uploadSection}>
                  <p style={styles.uploadHint}>لم يتم رفع ملف رد بعد. ارفع ملفاً ليتمكن المستخدم من تحميله عند تتبع طلبه.</p>
                  <input
                    type="file"
                    id="responseFileInput"
                    onChange={(e) => {
                      if (e.target.files[0]) {
                        uploadResponseFile(selectedSubmission.id, e.target.files[0]);
                      }
                    }}
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="responseFileInput" style={styles.uploadBtn}>
                    {uploadingFile ? 'جاري الرفع...' : '📤 رفع ملف'}
                  </label>
                </div>
              )}
            </div>

            <div style={styles.actionsSection}>
              <div style={styles.notesSection}>
                <label>ملاحظات:</label>
                <textarea
                  value={selectedSubmission.notes || ''}
                  onChange={(e) => setSelectedSubmission({...selectedSubmission, notes: e.target.value})}
                  style={styles.notesInput}
                  rows={4}
                  placeholder="أضف ملاحظات للمستخدم..."
                />
              </div>

              <h4>تحديث الحالة:</h4>
              <div style={styles.actionButtons}>
                <button
                  onClick={() => updateSubmissionStatus(selectedSubmission.id, 'approved', selectedSubmission.notes || '')}
                  style={{ ...styles.actionBtn, ...styles.approveBtn }}
                >
                  قبول
                </button>
                <button
                  onClick={() => updateSubmissionStatus(selectedSubmission.id, 'rejected', selectedSubmission.notes || '')}
                  style={{ ...styles.actionBtn, ...styles.rejectBtn }}
                >
                  رفض
                </button>
                <button
                  onClick={() => updateSubmissionStatus(selectedSubmission.id, 'pending', selectedSubmission.notes || '')}
                  style={{ ...styles.actionBtn, ...styles.pendingBtn }}
                >
                  قيد الانتظار
                </button>
                <button
                  onClick={() => deleteSubmission(selectedSubmission.id)}
                  style={{ ...styles.actionBtn, ...styles.deleteBtn }}
                >
                  حذف
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const getPageName = (page) => {
    const pageNames = {
      'home': 'الصفحة الرئيسية',
      'eligibility': 'فحص الاستحقاق',
      'certificate': 'شهادة السكن',
      'documentAuth': 'مصادقة المستندات',
      'tenders': 'المناقصات',
      'officialDoc': 'طلب مستند رسمي',
      'admin': 'لوحة الإدارة'
    };
    return pageNames[page] || page;
  };

  const renderVisitsLog = () => {
    if (loading) return <div style={styles.loading}>جاري التحميل...</div>;

    return (
      <div>
        <h2 style={styles.sectionTitle}>سجل زيارات الموقع</h2>

        {/* Stats Cards */}
        {visitsStats && (
          <div style={styles.downloadsStatsGrid}>
            <div style={styles.downloadStatCard}>
              <div style={styles.downloadStatIcon}>👁️</div>
              <div style={styles.downloadStatInfo}>
                <span style={styles.downloadStatNumber}>{visitsStats.today}</span>
                <span style={styles.downloadStatLabel}>زيارات اليوم</span>
              </div>
            </div>
            <div style={styles.downloadStatCard}>
              <div style={styles.downloadStatIcon}>📆</div>
              <div style={styles.downloadStatInfo}>
                <span style={styles.downloadStatNumber}>{visitsStats.thisWeek}</span>
                <span style={styles.downloadStatLabel}>هذا الأسبوع</span>
              </div>
            </div>
            <div style={styles.downloadStatCard}>
              <div style={styles.downloadStatIcon}>📊</div>
              <div style={styles.downloadStatInfo}>
                <span style={styles.downloadStatNumber}>{visitsStats.thisMonth}</span>
                <span style={styles.downloadStatLabel}>هذا الشهر</span>
              </div>
            </div>
            <div style={styles.downloadStatCard}>
              <div style={styles.downloadStatIcon}>🌐</div>
              <div style={styles.downloadStatInfo}>
                <span style={styles.downloadStatNumber}>{visitsStats.uniqueIPs}</span>
                <span style={styles.downloadStatLabel}>زوار فريدين</span>
              </div>
            </div>
          </div>
        )}

        {/* Page Stats */}
        {visitsStats && visitsStats.pageStats && (
          <div style={styles.pageStatsCard}>
            <h3 style={styles.pageStatsTitle}>📈 إحصائيات الصفحات</h3>
            <div style={styles.pageStatsList}>
              {Object.entries(visitsStats.pageStats)
                .sort((a, b) => b[1] - a[1])
                .map(([page, count]) => (
                  <div key={page} style={styles.pageStatItem}>
                    <span style={styles.pageStatName}>{getPageName(page)}</span>
                    <span style={styles.pageStatCount}>{count} زيارة</span>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Visits Table */}
        {visitsLog.length === 0 ? (
          <div style={styles.emptyState}>لا توجد زيارات مسجلة حتى الآن</div>
        ) : (
          <div style={styles.submissionsTable}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.tableHeader}>الصفحة</th>
                  <th style={styles.tableHeader}>تاريخ ووقت الزيارة</th>
                  <th style={styles.tableHeader}>عنوان IP</th>
                </tr>
              </thead>
              <tbody>
                {visitsLog.map((visit, index) => (
                  <tr key={visit.id || index} style={styles.tableRow}>
                    <td style={styles.tableCell}>
                      <span style={styles.pageBadge}>{getPageName(visit.page)}</span>
                    </td>
                    <td style={styles.tableCell}>
                      {new Date(visit.visitedAt).toLocaleString('ar-EG', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                      })}
                    </td>
                    <td style={styles.tableCell}>
                      <span style={styles.ipBadge}>{visit.ipAddress}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <button onClick={() => { fetchVisitsLog(); fetchVisitsStats(); }} style={styles.refreshBtn}>
          🔄 تحديث البيانات
        </button>
      </div>
    );
  };

  const renderDownloadsLog = () => {
    if (loading) return <div style={styles.loading}>جاري التحميل...</div>;

    return (
      <div>
        <h2 style={styles.sectionTitle}>سجل تنزيلات شهادات السكن</h2>

        {/* Stats Cards */}
        {downloadsStats && (
          <div style={styles.downloadsStatsGrid}>
            <div style={styles.downloadStatCard}>
              <div style={styles.downloadStatIcon}>📅</div>
              <div style={styles.downloadStatInfo}>
                <span style={styles.downloadStatNumber}>{downloadsStats.today}</span>
                <span style={styles.downloadStatLabel}>تنزيلات اليوم</span>
              </div>
            </div>
            <div style={styles.downloadStatCard}>
              <div style={styles.downloadStatIcon}>📆</div>
              <div style={styles.downloadStatInfo}>
                <span style={styles.downloadStatNumber}>{downloadsStats.thisWeek}</span>
                <span style={styles.downloadStatLabel}>هذا الأسبوع</span>
              </div>
            </div>
            <div style={styles.downloadStatCard}>
              <div style={styles.downloadStatIcon}>📊</div>
              <div style={styles.downloadStatInfo}>
                <span style={styles.downloadStatNumber}>{downloadsStats.thisMonth}</span>
                <span style={styles.downloadStatLabel}>هذا الشهر</span>
              </div>
            </div>
            <div style={styles.downloadStatCard}>
              <div style={styles.downloadStatIcon}>👥</div>
              <div style={styles.downloadStatInfo}>
                <span style={styles.downloadStatNumber}>{downloadsStats.uniqueIds}</span>
                <span style={styles.downloadStatLabel}>مستخدمين فريدين</span>
              </div>
            </div>
          </div>
        )}

        {/* Downloads Table */}
        {downloadsLog.length === 0 ? (
          <div style={styles.emptyState}>لا توجد تنزيلات مسجلة حتى الآن</div>
        ) : (
          <div style={styles.submissionsTable}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.tableHeader}>رقم الهوية</th>
                  <th style={styles.tableHeader}>رقم الصفحة</th>
                  <th style={styles.tableHeader}>تاريخ ووقت التنزيل</th>
                  <th style={styles.tableHeader}>عنوان IP</th>
                </tr>
              </thead>
              <tbody>
                {downloadsLog.map((log, index) => (
                  <tr key={log.id || index} style={styles.tableRow}>
                    <td style={styles.tableCell}>
                      <span style={styles.idBadge}>{log.idNumber}</span>
                    </td>
                    <td style={styles.tableCell}>{log.pageNumber}</td>
                    <td style={styles.tableCell}>
                      {new Date(log.downloadedAt).toLocaleString('ar-EG', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td style={styles.tableCell}>
                      <span style={styles.ipBadge}>{log.ipAddress}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <button onClick={() => { fetchDownloadsLog(); fetchDownloadsStats(); }} style={styles.refreshBtn}>
          🔄 تحديث البيانات
        </button>
      </div>
    );
  };

  const renderPublishTender = () => {
    return (
      <div>
        <div style={styles.headerRow}>
          <h2 style={styles.sectionTitle}>إدارة المناقصات</h2>
          <button onClick={() => setShowTenderForm(!showTenderForm)} style={styles.publishBtn}>
            {showTenderForm ? 'إلغاء' : '+ نشر مناقصة جديدة'}
          </button>
        </div>

        {showTenderForm && <TenderForm onSuccess={() => { setShowTenderForm(false); fetchPublishedTenders(); }} />}

        <div style={styles.tendersGrid}>
          {publishedTenders.map(tender => (
            <div key={tender.id} style={styles.tenderCard}>
              <div style={styles.tenderHeader}>
                <h3>{tender.title}</h3>
                <span style={{
                  ...styles.statusBadge,
                  ...(tender.status === 'active' && styles.statusApproved),
                  ...(tender.status === 'closed' && styles.statusRejected)
                }}>
                  {tender.status === 'active' ? 'نشط' : 'مغلق'}
                </span>
              </div>
              <p style={styles.tenderDesc}>{tender.description}</p>
              <div style={styles.tenderDetails}>
                <div><strong>الموعد النهائي:</strong> {new Date(tender.deadline).toLocaleDateString('ar')}</div>
                <div><strong>الميزانية:</strong> {tender.budget} ₪</div>
              </div>
              <div style={styles.tenderActions}>
                <button onClick={() => deleteTender(tender.id)} style={styles.deleteTenderBtn}>
                  حذف
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderProtocolsManagement = () => {
    return (
      <div>
        <div style={styles.headerRow}>
          <h2 style={styles.sectionTitle}>إدارة بروتوكولات الجلسات</h2>
          <button onClick={() => { setShowProtocolForm(!showProtocolForm); setEditingProtocol(null); }} style={styles.publishBtn}>
            {showProtocolForm ? 'إلغاء' : '+ إضافة بروتوكول جديد'}
          </button>
        </div>

        {showProtocolForm && (
          <ProtocolForm
            onSuccess={() => { setShowProtocolForm(false); setEditingProtocol(null); fetchProtocols(); }}
            editingProtocol={editingProtocol}
          />
        )}

        {loading ? (
          <div style={styles.loading}>جاري التحميل...</div>
        ) : protocols.length === 0 ? (
          <div style={styles.emptyState}>لا توجد بروتوكولات حالياً</div>
        ) : (
          <div style={styles.tendersGrid}>
            {protocols.map(protocol => (
              <div key={protocol.id || protocol._id} style={styles.protocolCard}>
                <div style={styles.tenderHeader}>
                  <h3 style={styles.protocolTitle}>{protocol.title}</h3>
                  <span style={{
                    ...styles.statusBadge,
                    ...(protocol.status === 'published' && styles.statusApproved),
                    ...(protocol.status === 'draft' && styles.statusPending)
                  }}>
                    {protocol.status === 'published' ? 'منشور' : 'مسودة'}
                  </span>
                </div>
                {protocol.titleHe && <p style={styles.protocolTitleHe}>{protocol.titleHe}</p>}
                <div style={styles.protocolMeta}>
                  <div style={styles.protocolMetaItem}>
                    <span>📅</span>
                    <span>تاريخ الجلسة: {new Date(protocol.meetingDate).toLocaleDateString('ar')}</span>
                  </div>
                  {protocol.meetingNumber && (
                    <div style={styles.protocolMetaItem}>
                      <span>🔢</span>
                      <span>رقم الجلسة: {protocol.meetingNumber}</span>
                    </div>
                  )}
                </div>
                {protocol.description && <p style={styles.tenderDesc}>{protocol.description}</p>}
                {protocol.file && protocol.file.url && (
                  <div style={styles.protocolFileInfo}>
                    <span>📎</span>
                    <a
                      href={`${API_URL}/protocols/${protocol.id || protocol._id}/download`}
                      style={styles.protocolFileLink}
                    >
                      {protocol.file.originalname || 'تحميل الملف'}
                    </a>
                  </div>
                )}
                <div style={styles.tenderActions}>
                  <button
                    onClick={() => { setEditingProtocol(protocol); setShowProtocolForm(true); }}
                    style={styles.editProtocolBtn}
                  >
                    تعديل
                  </button>
                  <button onClick={() => deleteProtocol(protocol.id || protocol._id)} style={styles.deleteTenderBtn}>
                    حذف
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  const navItems = [
    { id: 'overview', icon: '📊', label: 'نظرة عامة' },
    { id: 'documentAuth', icon: '📄', label: 'طلبات المصادقة' },
    { id: 'officialDoc', icon: '📋', label: 'طلبات المستندات' },
    { id: 'tenders', icon: '🏗️', label: 'عروض المناقصات' },
    { id: 'certificates', icon: '🔍', label: 'طلبات الشهادات' },
    { id: 'downloads', icon: '📥', label: 'سجل التنزيلات' },
    { id: 'visits', icon: '👁️', label: 'سجل الزيارات' },
    { id: 'publish-tender', icon: '📢', label: 'نشر مناقصة' },
    { id: 'protocols', icon: '📑', label: 'بروتوكولات الجلسات' },
  ];

  return (
    <div style={{...styles.container, ...(isMobile && styles.containerMobile)}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;600;700&display=swap');

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        @media (max-width: 768px) {
          .admin-table {
            display: block;
            overflow-x: auto;
            white-space: nowrap;
          }
        }
      `}</style>

      {/* Mobile Header */}
      {isMobile && (
        <div style={styles.mobileHeader}>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={styles.hamburgerBtn}
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
          <h1 style={styles.mobileTitle}>لوحة التحكم</h1>
          <div style={styles.mobileAvatar}>A</div>
        </div>
      )}

      {/* Mobile Navigation Overlay */}
      {isMobile && mobileMenuOpen && (
        <div style={styles.mobileOverlay} onClick={() => setMobileMenuOpen(false)}>
          <div style={styles.mobileMenu} onClick={(e) => e.stopPropagation()}>
            <div style={styles.mobileMenuHeader}>
              <span style={styles.logoIcon}>⚙️</span>
              <h2 style={styles.mobileMenuTitle}>القائمة</h2>
            </div>
            <nav style={styles.mobileNav}>
              {navItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => handleTabChange(item.id)}
                  style={{
                    ...styles.mobileNavBtn,
                    ...(activeTab === item.id && styles.mobileNavBtnActive)
                  }}
                >
                  <span style={styles.navIcon}>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      {!isMobile && (
        <div style={styles.sidebar}>
          <div style={styles.logo}>
            <span style={styles.logoIcon}>⚙️</span>
            <h2>لوحة التحكم</h2>
          </div>

          <nav style={styles.nav}>
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{ ...styles.navBtn, ...(activeTab === item.id && styles.navBtnActive) }}
              >
                {item.icon} {item.label}
              </button>
            ))}
          </nav>
        </div>
      )}

      <div style={{...styles.main, ...(isMobile && styles.mainMobile)}}>
        {/* Desktop Header */}
        {!isMobile && (
          <div style={styles.header}>
            <h1>اللجنة المحلية - الحسينية</h1>
            <div style={styles.userInfo}>
              <span>مسؤول</span>
              <div style={styles.avatar}>A</div>
            </div>
          </div>
        )}

        <div style={{...styles.content, ...(isMobile && styles.contentMobile)}}>
          {activeTab === 'overview' && renderOverview()}
          {['documentAuth', 'officialDoc', 'tenders', 'certificates'].includes(activeTab) && renderSubmissionsList()}
          {activeTab === 'downloads' && renderDownloadsLog()}
          {activeTab === 'visits' && renderVisitsLog()}
          {activeTab === 'publish-tender' && renderPublishTender()}
          {activeTab === 'protocols' && renderProtocolsManagement()}
        </div>
      </div>
    </div>
  );
};

const TenderForm = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    titleHe: '',
    description: '',
    descriptionHe: '',
    category: 'construction',
    deadline: '',
    budget: '',
    requirements: '',
    contactEmail: '',
    contactPhone: '',
    status: 'active'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${API_URL}/admin/tenders/publish`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${ADMIN_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ tenderData: JSON.stringify(formData) })
      });

      if (response.ok) {
        alert('تم نشر المناقصة بنجاح');
        onSuccess();
      }
    } catch (error) {
      console.error('Error publishing tender:', error);
      alert('حدث خطأ أثناء نشر المناقصة');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={styles.tenderForm}>
      <div style={styles.formGrid}>
        <div style={styles.formGroup}>
          <label>العنوان (عربي)</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            required
            style={styles.input}
          />
        </div>

        <div style={styles.formGroup}>
          <label>العنوان (עברית)</label>
          <input
            type="text"
            value={formData.titleHe}
            onChange={(e) => setFormData({...formData, titleHe: e.target.value})}
            required
            style={styles.input}
          />
        </div>

        <div style={{ ...styles.formGroup, gridColumn: '1 / -1' }}>
          <label>الوصف (عربي)</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            required
            style={styles.textarea}
            rows={3}
          />
        </div>

        <div style={{ ...styles.formGroup, gridColumn: '1 / -1' }}>
          <label>الوصف (עברית)</label>
          <textarea
            value={formData.descriptionHe}
            onChange={(e) => setFormData({...formData, descriptionHe: e.target.value})}
            required
            style={styles.textarea}
            rows={3}
          />
        </div>

        <div style={styles.formGroup}>
          <label>الفئة</label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({...formData, category: e.target.value})}
            style={styles.input}
          >
            <option value="construction">بناء</option>
            <option value="maintenance">صيانة</option>
            <option value="supply">توريد</option>
          </select>
        </div>

        <div style={styles.formGroup}>
          <label>الموعد النهائي</label>
          <input
            type="date"
            value={formData.deadline}
            onChange={(e) => setFormData({...formData, deadline: e.target.value})}
            required
            style={styles.input}
          />
        </div>

        <div style={styles.formGroup}>
          <label>الميزانية (₪)</label>
          <input
            type="number"
            value={formData.budget}
            onChange={(e) => setFormData({...formData, budget: e.target.value})}
            required
            style={styles.input}
          />
        </div>

        <div style={styles.formGroup}>
          <label>بريد التواصل</label>
          <input
            type="email"
            value={formData.contactEmail}
            onChange={(e) => setFormData({...formData, contactEmail: e.target.value})}
            required
            style={styles.input}
          />
        </div>

        <div style={{ ...styles.formGroup, gridColumn: '1 / -1' }}>
          <label>المتطلبات</label>
          <textarea
            value={formData.requirements}
            onChange={(e) => setFormData({...formData, requirements: e.target.value})}
            style={styles.textarea}
            rows={3}
          />
        </div>
      </div>

      <button type="submit" style={styles.submitBtn}>نشر المناقصة</button>
    </form>
  );
};

const ProtocolForm = ({ onSuccess, editingProtocol }) => {
  const [formData, setFormData] = useState({
    title: editingProtocol?.title || '',
    titleHe: editingProtocol?.titleHe || '',
    meetingDate: editingProtocol?.meetingDate ? new Date(editingProtocol.meetingDate).toISOString().split('T')[0] : '',
    meetingNumber: editingProtocol?.meetingNumber || '',
    description: editingProtocol?.description || '',
    descriptionHe: editingProtocol?.descriptionHe || '',
    status: editingProtocol?.status || 'published'
  });
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('protocolData', JSON.stringify({
        title: formData.title,
        titleHe: formData.titleHe,
        meetingDate: formData.meetingDate,
        meetingNumber: formData.meetingNumber,
        description: formData.description,
        descriptionHe: formData.descriptionHe,
        status: formData.status
      }));
      if (file) {
        formDataToSend.append('file', file);
      }

      const url = editingProtocol
        ? `${API_URL}/admin/protocols/${editingProtocol.id || editingProtocol._id}`
        : `${API_URL}/admin/protocols/add`;

      const response = await fetch(url, {
        method: editingProtocol ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${ADMIN_TOKEN}`
        },
        body: formDataToSend
      });

      if (response.ok) {
        alert(editingProtocol ? 'تم تحديث البروتوكول بنجاح' : 'تم إضافة البروتوكول بنجاح');
        onSuccess();
      } else {
        alert('حدث خطأ أثناء حفظ البروتوكول');
      }
    } catch (error) {
      console.error('Error saving protocol:', error);
      alert('حدث خطأ أثناء حفظ البروتوكول');
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={styles.tenderForm}>
      <div style={styles.formGrid}>
        <div style={styles.formGroup}>
          <label>العنوان (عربي) *</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            required
            style={styles.input}
          />
        </div>

        <div style={styles.formGroup}>
          <label>العنوان (עברית)</label>
          <input
            type="text"
            value={formData.titleHe}
            onChange={(e) => setFormData({...formData, titleHe: e.target.value})}
            style={styles.input}
          />
        </div>

        <div style={styles.formGroup}>
          <label>تاريخ الجلسة *</label>
          <input
            type="date"
            value={formData.meetingDate}
            onChange={(e) => setFormData({...formData, meetingDate: e.target.value})}
            required
            style={styles.input}
          />
        </div>

        <div style={styles.formGroup}>
          <label>رقم الجلسة</label>
          <input
            type="text"
            value={formData.meetingNumber}
            onChange={(e) => setFormData({...formData, meetingNumber: e.target.value})}
            style={styles.input}
            placeholder="مثال: 15/2024"
          />
        </div>

        <div style={{ ...styles.formGroup, gridColumn: '1 / -1' }}>
          <label>الوصف (عربي)</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            style={styles.textarea}
            rows={3}
          />
        </div>

        <div style={{ ...styles.formGroup, gridColumn: '1 / -1' }}>
          <label>الوصف (עברית)</label>
          <textarea
            value={formData.descriptionHe}
            onChange={(e) => setFormData({...formData, descriptionHe: e.target.value})}
            style={styles.textarea}
            rows={3}
          />
        </div>

        <div style={styles.formGroup}>
          <label>الحالة</label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({...formData, status: e.target.value})}
            style={styles.input}
          >
            <option value="published">منشور</option>
            <option value="draft">مسودة</option>
          </select>
        </div>

        <div style={styles.formGroup}>
          <label>ملف البروتوكول (PDF)</label>
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={(e) => setFile(e.target.files[0])}
            style={styles.input}
          />
          {editingProtocol?.file?.originalname && !file && (
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              الملف الحالي: {editingProtocol.file.originalname}
            </span>
          )}
        </div>
      </div>

      <button type="submit" style={styles.submitBtn} disabled={uploading}>
        {uploading ? 'جاري الحفظ...' : (editingProtocol ? 'تحديث البروتوكول' : 'إضافة البروتوكول')}
      </button>
    </form>
  );
};

const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    fontFamily: "'Tajawal', sans-serif",
    direction: 'rtl',
    background: '#f5f7fa',
  },
  sidebar: {
    width: '280px',
    background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '40px',
    color: '#fff',
  },
  logoIcon: {
    fontSize: '32px',
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  navBtn: {
    padding: '14px 16px',
    background: 'transparent',
    border: 'none',
    borderRadius: '8px',
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'right',
    cursor: 'pointer',
    fontSize: '15px',
    fontFamily: "'Tajawal', sans-serif",
    fontWeight: '500',
    transition: 'all 0.2s',
  },
  navBtnActive: {
    background: 'rgba(59, 130, 246, 0.2)',
    color: '#60a5fa',
  },
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    background: '#fff',
    padding: '20px 32px',
    borderBottom: '1px solid #e5e7eb',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  avatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: '#3b82f6',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
  },
  content: {
    flex: 1,
    padding: '32px',
  },
  sectionTitle: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: '24px',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
    gap: '16px',
  },
  statCard: {
    background: '#fff',
    borderRadius: '16px',
    padding: '16px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  statIcon: {
    fontSize: '28px',
    marginBottom: '8px',
  },
  statTitle: {
    fontSize: '14px',
    color: '#64748b',
    marginBottom: '6px',
  },
  statNumber: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: '12px',
  },
  statBreakdown: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    fontSize: '12px',
    color: '#64748b',
  },
  submissionsTable: {
    background: '#fff',
    borderRadius: '12px',
    overflow: 'auto',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    WebkitOverflowScrolling: 'touch',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    minWidth: '500px',
  },
  statusBadge: {
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
  },
  statusPending: {
    background: '#fef3c7',
    color: '#f59e0b',
  },
  statusApproved: {
    background: '#dcfce7',
    color: '#16a34a',
  },
  statusRejected: {
    background: '#fee2e2',
    color: '#dc2626',
  },
  viewBtn: {
    padding: '8px 16px',
    background: '#3b82f6',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontFamily: "'Tajawal', sans-serif",
  },
  modal: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modalContent: {
    background: '#fff',
    borderRadius: '16px',
    maxWidth: '800px',
    width: '95%',
    maxHeight: '90vh',
    overflow: 'auto',
    margin: '20px',
  },
  modalHeader: {
    padding: '16px',
    borderBottom: '1px solid #e5e7eb',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: '#64748b',
  },
  modalBody: {
    padding: '16px',
  },
  detailsGrid: {
    display: 'grid',
    gap: '12px',
    marginBottom: '24px',
  },
  detailItem: {
    padding: '12px',
    background: '#f8fafc',
    borderRadius: '8px',
  },
  filesSection: {
    marginBottom: '24px',
  },
  fileItem: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '12px',
    background: '#f8fafc',
    borderRadius: '8px',
    marginTop: '8px',
  },
  responseFileSection: {
    marginBottom: '24px',
    padding: '20px',
    background: '#f0fdf4',
    borderRadius: '12px',
    border: '2px solid #bbf7d0',
  },
  responseFileTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#166534',
    margin: '0 0 16px 0',
  },
  responseFileItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px',
    background: '#fff',
    borderRadius: '8px',
    border: '1px solid #86efac',
  },
  responseFileInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  responseFileIcon: {
    fontSize: '28px',
  },
  responseFileName: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '600',
    color: '#166534',
  },
  responseFileSize: {
    fontSize: '12px',
    color: '#64748b',
  },
  responseFileActions: {
    display: 'flex',
    gap: '8px',
  },
  downloadResponseBtn: {
    padding: '8px 16px',
    background: '#22c55e',
    color: '#fff',
    borderRadius: '6px',
    textDecoration: 'none',
    fontSize: '13px',
    fontFamily: "'Tajawal', sans-serif",
    fontWeight: '600',
  },
  deleteResponseBtn: {
    padding: '8px 16px',
    background: '#ef4444',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px',
    fontFamily: "'Tajawal', sans-serif",
    fontWeight: '600',
  },
  uploadSection: {
    textAlign: 'center',
    padding: '20px',
    background: '#fff',
    borderRadius: '8px',
    border: '2px dashed #86efac',
  },
  uploadHint: {
    fontSize: '14px',
    color: '#64748b',
    marginBottom: '16px',
  },
  uploadBtn: {
    display: 'inline-block',
    padding: '12px 24px',
    background: '#22c55e',
    color: '#fff',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontFamily: "'Tajawal', sans-serif",
    fontWeight: '600',
    transition: 'background 0.2s',
  },
  actionsSection: {
    borderTop: '1px solid #e5e7eb',
    paddingTop: '24px',
  },
  actionButtons: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
    marginTop: '12px',
    marginBottom: '24px',
  },
  actionBtn: {
    padding: '10px 18px',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontFamily: "'Tajawal', sans-serif",
    fontWeight: '600',
    flex: '1 1 auto',
    minWidth: '80px',
  },
  approveBtn: {
    background: '#22c55e',
    color: '#fff',
  },
  rejectBtn: {
    background: '#ef4444',
    color: '#fff',
  },
  pendingBtn: {
    background: '#f59e0b',
    color: '#fff',
  },
  deleteBtn: {
    background: '#64748b',
    color: '#fff',
  },
  notesSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  notesInput: {
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
    fontSize: '14px',
    fontFamily: "'Tajawal', sans-serif",
  },
  saveNotesBtn: {
    padding: '10px 20px',
    background: '#3b82f6',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontFamily: "'Tajawal', sans-serif",
    alignSelf: 'flex-start',
  },
  loading: {
    textAlign: 'center',
    padding: '40px',
    fontSize: '18px',
    color: '#64748b',
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px',
    fontSize: '16px',
    color: '#94a3b8',
    background: '#fff',
    borderRadius: '12px',
  },
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
  },
  publishBtn: {
    padding: '12px 24px',
    background: '#22c55e',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '15px',
    fontFamily: "'Tajawal', sans-serif",
    fontWeight: '600',
  },
  tendersGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '16px',
  },
  tenderCard: {
    background: '#fff',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  tenderHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'start',
    marginBottom: '12px',
  },
  tenderDesc: {
    color: '#64748b',
    fontSize: '14px',
    marginBottom: '16px',
  },
  tenderDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    fontSize: '13px',
    color: '#64748b',
    marginBottom: '16px',
  },
  tenderActions: {
    display: 'flex',
    gap: '8px',
  },
  deleteTenderBtn: {
    padding: '8px 16px',
    background: '#ef4444',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px',
    fontFamily: "'Tajawal', sans-serif",
  },
  tenderForm: {
    background: '#fff',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '32px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '16px',
    marginBottom: '24px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  input: {
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
    fontSize: '14px',
    fontFamily: "'Tajawal', sans-serif",
  },
  textarea: {
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
    fontSize: '14px',
    fontFamily: "'Tajawal', sans-serif",
    resize: 'vertical',
  },
  submitBtn: {
    padding: '14px 32px',
    background: '#22c55e',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
    fontFamily: "'Tajawal', sans-serif",
    fontWeight: '600',
  },
  overviewContainer: {
  },
  // Downloads Log Styles
  downloadsStatsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
    gap: '12px',
    marginBottom: '24px',
  },
  downloadStatCard: {
    background: '#fff',
    borderRadius: '12px',
    padding: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  downloadStatIcon: {
    fontSize: '24px',
  },
  downloadStatInfo: {
    display: 'flex',
    flexDirection: 'column',
  },
  downloadStatNumber: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#1e293b',
  },
  downloadStatLabel: {
    fontSize: '11px',
    color: '#64748b',
  },
  tableHeader: {
    padding: '14px 16px',
    textAlign: 'right',
    background: '#f8fafc',
    color: '#475569',
    fontWeight: '600',
    fontSize: '14px',
    borderBottom: '2px solid #e2e8f0',
  },
  tableRow: {
    borderBottom: '1px solid #f1f5f9',
    transition: 'background 0.2s',
  },
  tableCell: {
    padding: '14px 16px',
    fontSize: '14px',
    color: '#334155',
  },
  idBadge: {
    background: '#dbeafe',
    color: '#1e40af',
    padding: '4px 10px',
    borderRadius: '6px',
    fontWeight: '600',
    fontFamily: 'monospace',
    fontSize: '13px',
  },
  ipBadge: {
    background: '#f1f5f9',
    color: '#64748b',
    padding: '4px 8px',
    borderRadius: '4px',
    fontFamily: 'monospace',
    fontSize: '12px',
  },
  refreshBtn: {
    marginTop: '20px',
    padding: '12px 24px',
    background: '#3b82f6',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontFamily: "'Tajawal', sans-serif",
    fontWeight: '600',
    transition: 'background 0.2s',
  },
  // Page Stats Styles
  pageStatsCard: {
    background: '#fff',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  pageStatsTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: '16px',
  },
  pageStatsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  pageStatItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 14px',
    background: '#f8fafc',
    borderRadius: '8px',
  },
  pageStatName: {
    fontWeight: '600',
    color: '#334155',
  },
  pageStatCount: {
    color: '#64748b',
    fontSize: '14px',
  },
  pageBadge: {
    background: '#e0f2fe',
    color: '#0369a1',
    padding: '4px 10px',
    borderRadius: '6px',
    fontWeight: '600',
    fontSize: '13px',
  },
  // Mobile Styles
  containerMobile: {
    flexDirection: 'column',
  },
  mobileHeader: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    height: '60px',
    background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 16px',
    zIndex: 1000,
    boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
  },
  hamburgerBtn: {
    width: '44px',
    height: '44px',
    background: 'rgba(255,255,255,0.1)',
    border: 'none',
    borderRadius: '10px',
    color: '#fff',
    fontSize: '24px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mobileTitle: {
    color: '#fff',
    fontSize: '18px',
    fontWeight: '700',
    margin: 0,
  },
  mobileAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: '#3b82f6',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    fontSize: '16px',
  },
  mobileOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.5)',
    zIndex: 2000,
    display: 'flex',
  },
  mobileMenu: {
    width: '280px',
    maxWidth: '85%',
    height: '100%',
    background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
    padding: '20px',
    overflowY: 'auto',
    animation: 'slideIn 0.3s ease',
  },
  mobileMenuHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '30px',
    paddingBottom: '20px',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
  },
  mobileMenuTitle: {
    color: '#fff',
    fontSize: '20px',
    fontWeight: '700',
    margin: 0,
  },
  mobileNav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  mobileNavBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    padding: '16px',
    background: 'transparent',
    border: 'none',
    borderRadius: '12px',
    color: 'rgba(255,255,255,0.7)',
    fontSize: '16px',
    fontFamily: "'Tajawal', sans-serif",
    fontWeight: '500',
    cursor: 'pointer',
    textAlign: 'right',
    transition: 'all 0.2s',
  },
  mobileNavBtnActive: {
    background: 'rgba(59, 130, 246, 0.2)',
    color: '#60a5fa',
  },
  navIcon: {
    fontSize: '22px',
  },
  mainMobile: {
    marginTop: '60px',
    width: '100%',
  },
  contentMobile: {
    padding: '16px',
  },
  // Protocol Styles
  protocolCard: {
    background: '#fff',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    border: '1px solid #e2e8f0',
  },
  protocolTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#1e293b',
    margin: 0,
  },
  protocolTitleHe: {
    fontSize: '14px',
    color: '#64748b',
    marginTop: '4px',
    marginBottom: '12px',
  },
  protocolMeta: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginBottom: '12px',
  },
  protocolMetaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '13px',
    color: '#64748b',
  },
  protocolFileInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 14px',
    background: '#f8fafc',
    borderRadius: '8px',
    marginBottom: '16px',
  },
  protocolFileLink: {
    color: '#3b82f6',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '500',
  },
  editProtocolBtn: {
    padding: '8px 16px',
    background: '#3b82f6',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px',
    fontFamily: "'Tajawal', sans-serif",
  },
};

export default AdminDashboard;
