import React, { useState, useCallback } from 'react';

const DocumentAuthenticationRequest = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    documentFile: null,
    documentType: '',
    ownerName: '',
    ownerId: '',
    ownerPhone: '',
    ownerEmail: '',
    notes: ''
  });
  const [dragActive, setDragActive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const documentTypes = [
    { id: 'certificate', labelAr: 'شهادة', labelHe: 'תעודה', icon: '📜' },
    { id: 'pledge', labelAr: 'تعهد', labelHe: 'התחייבות', icon: '✍️' },
    { id: 'statement', labelAr: 'إفادة', labelHe: 'הצהרה', icon: '📋' },
    { id: 'education', labelAr: 'مستند تعليمي', labelHe: 'מסמך לימודים', icon: '🎓' },
    { id: 'employment', labelAr: 'مستند عمل', labelHe: 'מסמך עבודה', icon: '💼' }
  ];

  const steps = [
    { number: 1, titleAr: 'رفع المستند', titleHe: 'העלאת מסמך' },
    { number: 2, titleAr: 'نوع المصادقة', titleHe: 'סוג האימות' },
    { number: 3, titleAr: 'بيانات المالك', titleHe: 'פרטי בעלים' },
    { number: 4, titleAr: 'مراجعة وإرسال', titleHe: 'בדיקה ושליחה' }
  ];

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFormData(prev => ({ ...prev, documentFile: e.dataTransfer.files[0] }));
    }
  }, []);

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, documentFile: e.target.files[0] }));
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return formData.documentFile !== null;
      case 2: return formData.documentType !== '';
      case 3: return formData.ownerName && formData.ownerId && formData.ownerPhone;
      default: return true;
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const formDataObj = new FormData();
      formDataObj.append('formData', JSON.stringify(formData));

      if (formData.documentFile) {
        formDataObj.append('documents', formData.documentFile);
      }

      const response = await fetch('http://localhost:3001/api/document-auth', {
        method: 'POST',
        body: formDataObj
      });

      const result = await response.json();

      if (result.success) {
        setIsSubmitted(true);
      } else {
        alert('حدث خطأ أثناء إرسال الطلب');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('حدث خطأ أثناء إرسال الطلب. تأكد من تشغيل الخادم.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      documentFile: null,
      documentType: '',
      ownerName: '',
      ownerId: '',
      ownerPhone: '',
      ownerEmail: '',
      notes: ''
    });
    setCurrentStep(1);
    setIsSubmitted(false);
  };

  return (
    <div style={styles.container}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;800&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;500;600;700&display=swap');

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        @keyframes checkmark {
          0% { stroke-dashoffset: 100; }
          100% { stroke-dashoffset: 0; }
        }

        .step-item {
          transition: all 0.3s ease;
        }

        .step-item:hover {
          transform: translateY(-2px);
        }

        .upload-zone {
          transition: all 0.3s ease;
        }

        .upload-zone:hover {
          border-color: #1a365d !important;
          background: #ebf8ff !important;
        }

        .doc-type-card {
          transition: all 0.3s ease;
        }

        .doc-type-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(26, 54, 93, 0.15);
          border-color: #1a365d;
        }

        .input-field {
          transition: all 0.3s ease;
        }

        .input-field:focus {
          border-color: #1a365d !important;
          box-shadow: 0 0 0 3px rgba(26, 54, 93, 0.1) !important;
          outline: none;
        }

        .btn-primary {
          transition: all 0.3s ease;
        }

        .btn-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(26, 54, 93, 0.35);
        }

        .btn-secondary {
          transition: all 0.3s ease;
        }

        .btn-secondary:hover {
          background: #f8fafc;
          border-color: #1a365d;
        }
      `}</style>

      <div style={styles.wrapper}>
        {/* Header */}
        <header style={styles.header}>
          <div style={styles.headerContent}>
            <div style={styles.badge}>
              <span style={{ color: '#fff', fontSize: '15px', fontWeight: '600' }}>
                طلب مصادقة مستند | בקשה לאימות מסמך
              </span>
            </div>
          </div>
        </header>

        {/* Progress Steps */}
        <div style={styles.stepsContainer}>
          {steps.map((step, index) => (
            <div key={step.number} className="step-item" style={styles.stepWrapper}>
              <div style={{
                ...styles.stepCircle,
                ...(currentStep >= step.number ? styles.stepCircleActive : {}),
                ...(currentStep > step.number ? styles.stepCircleCompleted : {})
              }}>
                {currentStep > step.number ? (
                  <span style={styles.checkIcon}>✓</span>
                ) : (
                  <span style={styles.stepNumber}>{step.number}</span>
                )}
              </div>
              <div style={styles.stepInfo}>
                <span style={{
                  ...styles.stepTitle,
                  ...(currentStep >= step.number ? styles.stepTitleActive : {})
                }}>{step.titleAr}</span>
                <span style={styles.stepTitleHe}>{step.titleHe}</span>
              </div>
              {index < steps.length - 1 && (
                <div style={{
                  ...styles.stepConnector,
                  ...(currentStep > step.number ? styles.stepConnectorActive : {})
                }}></div>
              )}
            </div>
          ))}
        </div>

        {/* Main Content */}
        <main style={styles.mainContent}>
          {isSubmitted ? (
            <div style={styles.successContainer}>
              <div style={styles.successIconWrapper}>
                <svg width="80" height="80" viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="38" fill="none" stroke="#48bb78" strokeWidth="3"/>
                  <path
                    d="M24 42 L35 53 L56 28"
                    fill="none"
                    stroke="#48bb78"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{
                      strokeDasharray: 100,
                      animation: 'checkmark 0.6s ease-out forwards'
                    }}
                  />
                </svg>
              </div>
              <h2 style={styles.successTitle}>تم إرسال الطلب بنجاح!</h2>
              <p style={styles.successSubtitle}>הבקשה נשלחה בהצלחה!</p>
              <p style={styles.successMessage}>
                تم إرسال طلبك إلى اللجنة المحلية وسيتم الرد خلال 3-5 أيام عمل
              </p>

              <div style={styles.referenceCard}>
                <span style={styles.refLabel}>رقم الطلب | מספר בקשה</span>
                <span style={styles.refValue}>DOC-{Date.now().toString().slice(-8)}</span>
              </div>

              <button
                onClick={resetForm}
                className="btn-primary"
                style={styles.newRequestBtn}
              >
                تقديم طلب جديد | בקשה חדשה
              </button>
            </div>
          ) : (
            <div style={styles.formCard}>
              {/* Step 1: Upload Document */}
              {currentStep === 1 && (
                <div style={styles.stepContent}>
                  <h2 style={styles.stepHeading}>رفع نسخة المستند</h2>
                  <p style={styles.stepHeadingHe}>העלאת עותק המסמך</p>
                  <p style={styles.stepDescription}>
                    يرجى رفع نسخة واضحة من المستند المراد تصديقه (PDF, JPG, PNG)
                  </p>

                  <div
                    className="upload-zone"
                    style={{
                      ...styles.uploadZone,
                      ...(dragActive ? styles.uploadZoneActive : {}),
                      ...(formData.documentFile ? styles.uploadZoneSuccess : {})
                    }}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById('fileInput').click()}
                  >
                    <input
                      type="file"
                      id="fileInput"
                      style={{ display: 'none' }}
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileInput}
                    />

                    {formData.documentFile ? (
                      <div style={styles.filePreview}>
                        <div style={styles.fileIcon}>📄</div>
                        <div style={styles.fileInfo}>
                          <span style={styles.fileName}>{formData.documentFile.name}</span>
                          <span style={styles.fileSize}>
                            {(formData.documentFile.size / 1024 / 1024).toFixed(2)} MB
                          </span>
                        </div>
                        <button
                          style={styles.removeFileBtn}
                          onClick={(e) => {
                            e.stopPropagation();
                            setFormData(prev => ({ ...prev, documentFile: null }));
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <>
                        <div style={styles.uploadIconWrapper}>
                          <span style={{ fontSize: '48px', animation: 'float 3s ease-in-out infinite' }}>📤</span>
                        </div>
                        <p style={styles.uploadText}>اسحب الملف هنا أو انقر للاختيار</p>
                        <p style={styles.uploadTextHe}>גרור קובץ לכאן או לחץ לבחירה</p>
                        <p style={styles.uploadHint}>الحد الأقصى: 10 MB | מקסימום: 10 MB</p>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Step 2: Document Type */}
              {currentStep === 2 && (
                <div style={styles.stepContent}>
                  <h2 style={styles.stepHeading}>نوع المصادقة المطلوبة</h2>
                  <p style={styles.stepHeadingHe}>סוג האימות הנדרש</p>
                  <p style={styles.stepDescription}>
                    اختر نوع المستند الذي تريد تصديقه
                  </p>

                  <div style={styles.docTypesGrid}>
                    {documentTypes.map((type) => (
                      <div
                        key={type.id}
                        className="doc-type-card"
                        style={{
                          ...styles.docTypeCard,
                          ...(formData.documentType === type.id ? styles.docTypeCardSelected : {})
                        }}
                        onClick={() => handleInputChange('documentType', type.id)}
                      >
                        <span style={styles.docTypeIcon}>{type.icon}</span>
                        <span style={styles.docTypeLabel}>{type.labelAr}</span>
                        <span style={styles.docTypeLabelHe}>{type.labelHe}</span>
                        {formData.documentType === type.id && (
                          <div style={styles.selectedBadge}>✓</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 3: Owner Information */}
              {currentStep === 3 && (
                <div style={styles.stepContent}>
                  <h2 style={styles.stepHeading}>بيانات صاحب المستند</h2>
                  <p style={styles.stepHeadingHe}>פרטי בעל המסמך</p>
                  <p style={styles.stepDescription}>
                    أدخل معلومات صاحب المستند للتواصل
                  </p>

                  <div style={styles.formGrid}>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>
                        <span style={styles.labelIcon}>👤</span>
                        الاسم الكامل * | שם מלא
                      </label>
                      <input
                        type="text"
                        className="input-field"
                        style={styles.input}
                        value={formData.ownerName}
                        onChange={(e) => handleInputChange('ownerName', e.target.value)}
                        placeholder="أدخل الاسم الكامل"
                      />
                    </div>

                    <div style={styles.formGroup}>
                      <label style={styles.label}>
                        <span style={styles.labelIcon}>🪪</span>
                        رقم الهوية * | מספר ת.ז
                      </label>
                      <input
                        type="text"
                        className="input-field"
                        style={styles.input}
                        value={formData.ownerId}
                        onChange={(e) => handleInputChange('ownerId', e.target.value)}
                        placeholder="أدخل رقم الهوية"
                        dir="ltr"
                      />
                    </div>

                    <div style={styles.formGroup}>
                      <label style={styles.label}>
                        <span style={styles.labelIcon}>📱</span>
                        رقم الهاتف * | טלפון
                      </label>
                      <input
                        type="tel"
                        className="input-field"
                        style={styles.input}
                        value={formData.ownerPhone}
                        onChange={(e) => handleInputChange('ownerPhone', e.target.value)}
                        placeholder="05X-XXXXXXX"
                        dir="ltr"
                      />
                    </div>

                    <div style={styles.formGroup}>
                      <label style={styles.label}>
                        <span style={styles.labelIcon}>📧</span>
                        البريد الإلكتروني | דוא"ל
                      </label>
                      <input
                        type="email"
                        className="input-field"
                        style={styles.input}
                        value={formData.ownerEmail}
                        onChange={(e) => handleInputChange('ownerEmail', e.target.value)}
                        placeholder="example@email.com"
                        dir="ltr"
                      />
                    </div>

                    <div style={{ ...styles.formGroup, gridColumn: '1 / -1' }}>
                      <label style={styles.label}>
                        <span style={styles.labelIcon}>📝</span>
                        ملاحظات إضافية | הערות
                      </label>
                      <textarea
                        className="input-field"
                        style={{ ...styles.input, ...styles.textarea }}
                        value={formData.notes}
                        onChange={(e) => handleInputChange('notes', e.target.value)}
                        placeholder="أي معلومات إضافية ترغب في إضافتها..."
                        rows={3}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Review */}
              {currentStep === 4 && (
                <div style={styles.stepContent}>
                  <h2 style={styles.stepHeading}>مراجعة الطلب</h2>
                  <p style={styles.stepHeadingHe}>סקירת הבקשה</p>
                  <p style={styles.stepDescription}>
                    راجع المعلومات قبل الإرسال
                  </p>

                  <div style={styles.reviewCard}>
                    <div style={styles.reviewSection}>
                      <h3 style={styles.reviewSectionTitle}>
                        <span style={styles.reviewIcon}>📄</span>
                        المستند | המסמך
                      </h3>
                      <div style={styles.reviewGrid}>
                        <div style={styles.reviewItem}>
                          <span style={styles.reviewLabel}>اسم الملف:</span>
                          <span style={styles.reviewValue}>{formData.documentFile?.name}</span>
                        </div>
                        <div style={styles.reviewItem}>
                          <span style={styles.reviewLabel}>نوع المصادقة:</span>
                          <span style={styles.reviewValue}>
                            {documentTypes.find(t => t.id === formData.documentType)?.labelAr}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div style={styles.reviewSection}>
                      <h3 style={styles.reviewSectionTitle}>
                        <span style={styles.reviewIcon}>👤</span>
                        صاحب المستند | בעל המסמך
                      </h3>
                      <div style={styles.reviewGrid}>
                        <div style={styles.reviewItem}>
                          <span style={styles.reviewLabel}>الاسم:</span>
                          <span style={styles.reviewValue}>{formData.ownerName}</span>
                        </div>
                        <div style={styles.reviewItem}>
                          <span style={styles.reviewLabel}>رقم الهوية:</span>
                          <span style={styles.reviewValue}>{formData.ownerId}</span>
                        </div>
                        <div style={styles.reviewItem}>
                          <span style={styles.reviewLabel}>الهاتف:</span>
                          <span style={styles.reviewValue}>{formData.ownerPhone}</span>
                        </div>
                        {formData.ownerEmail && (
                          <div style={styles.reviewItem}>
                            <span style={styles.reviewLabel}>البريد:</span>
                            <span style={styles.reviewValue}>{formData.ownerEmail}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {formData.notes && (
                      <div style={styles.reviewSection}>
                        <h3 style={styles.reviewSectionTitle}>
                          <span style={styles.reviewIcon}>📝</span>
                          ملاحظات | הערות
                        </h3>
                        <p style={styles.notesText}>{formData.notes}</p>
                      </div>
                    )}
                  </div>

                  <div style={styles.processingInfo}>
                    <div style={styles.infoIcon}>ℹ️</div>
                    <div>
                      <strong style={{ color: '#2b6cb0' }}>معلومات المعالجة | פרטי עיבוד:</strong>
                      <ul style={styles.infoList}>
                        <li>فحص المستند (وضوح، صلاحية، جهة الإصدار)</li>
                        <li>المصادقة بختم رسمي</li>
                        <li>مدة المعالجة: 3-5 أيام عمل</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div style={styles.navigationButtons}>
                {currentStep > 1 && (
                  <button
                    className="btn-secondary"
                    style={styles.btnSecondary}
                    onClick={() => setCurrentStep(prev => prev - 1)}
                  >
                    → السابق | הקודם
                  </button>
                )}

                {currentStep < 4 ? (
                  <button
                    className="btn-primary"
                    style={{
                      ...styles.btnPrimary,
                      ...(canProceed() ? {} : styles.btnDisabled)
                    }}
                    onClick={() => setCurrentStep(prev => prev + 1)}
                    disabled={!canProceed()}
                  >
                    التالي | הבא ←
                  </button>
                ) : (
                  <button
                    className="btn-primary"
                    style={{
                      ...styles.btnPrimary,
                      ...styles.btnSubmit,
                      ...(isSubmitting ? styles.btnLoading : {})
                    }}
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <span style={styles.loadingText}>
                        جاري الإرسال...
                        <span style={styles.spinner}></span>
                      </span>
                    ) : (
                      'إرسال الطلب | שלח בקשה'
                    )}
                  </button>
                )}
              </div>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer style={styles.footer}>
          <p>© 2024 اللجنة المحلية - جميع الحقوق محفوظة | כל הזכויות שמורות</p>
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
    position: 'relative',
    overflow: 'hidden',
  },
  wrapper: {
    position: 'relative',
    zIndex: 1,
    maxWidth: '800px',
    margin: '0 auto',
    padding: '0 24px 40px 24px',
  },
  header: {
    background: 'linear-gradient(135deg, #1e3a5f 0%, #1a365d 50%, #153e75 100%)',
    padding: '40px 24px',
    textAlign: 'center',
    margin: '0 -24px 32px -24px',
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
  stepsContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    gap: '0',
    marginBottom: '32px',
    overflowX: 'auto',
    padding: '10px 0',
  },
  stepWrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    position: 'relative',
    flex: '0 0 auto',
    minWidth: '100px',
    padding: '0 8px',
  },
  stepCircle: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    background: '#fff',
    border: '2px solid #e2e8f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '10px',
    transition: 'all 0.4s ease',
  },
  stepCircleActive: {
    borderColor: '#1a365d',
    background: '#ebf8ff',
    boxShadow: '0 0 20px rgba(26, 54, 93, 0.2)',
  },
  stepCircleCompleted: {
    borderColor: '#48bb78',
    background: '#48bb78',
  },
  stepNumber: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#718096',
  },
  checkIcon: {
    color: '#fff',
    fontSize: '20px',
    fontWeight: '700',
  },
  stepInfo: {
    textAlign: 'center',
  },
  stepTitle: {
    display: 'block',
    fontSize: '13px',
    color: '#718096',
    fontWeight: '600',
    transition: 'all 0.3s ease',
  },
  stepTitleActive: {
    color: '#1a365d',
  },
  stepTitleHe: {
    display: 'block',
    fontSize: '11px',
    color: '#a0aec0',
    fontFamily: "'Heebo', sans-serif",
    marginTop: '2px',
  },
  stepConnector: {
    position: 'absolute',
    top: '24px',
    left: '-50%',
    width: '100%',
    height: '2px',
    background: '#e2e8f0',
    zIndex: -1,
    transition: 'all 0.4s ease',
  },
  stepConnectorActive: {
    background: '#48bb78',
  },
  mainContent: {
    position: 'relative',
    zIndex: 1,
  },
  formCard: {
    background: '#fff',
    borderRadius: '16px',
    border: '2px solid #e2e8f0',
    padding: '32px',
    animation: 'fadeIn 0.5s ease-out',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
  },
  stepContent: {
    animation: 'fadeIn 0.4s ease-out',
  },
  stepHeading: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#1a365d',
    margin: '0 0 4px',
  },
  stepHeadingHe: {
    fontSize: '16px',
    color: '#718096',
    margin: '0 0 8px',
    fontFamily: "'Heebo', sans-serif",
  },
  stepDescription: {
    fontSize: '15px',
    color: '#718096',
    margin: '0 0 28px',
    lineHeight: 1.6,
  },
  uploadZone: {
    border: '2px dashed #e2e8f0',
    borderRadius: '16px',
    padding: '48px 24px',
    textAlign: 'center',
    cursor: 'pointer',
    background: '#f8fafc',
  },
  uploadZoneActive: {
    borderColor: '#1a365d',
    background: '#ebf8ff',
  },
  uploadZoneSuccess: {
    borderColor: '#48bb78',
    borderStyle: 'solid',
    background: '#f0fff4',
  },
  uploadIconWrapper: {
    marginBottom: '16px',
  },
  uploadText: {
    fontSize: '16px',
    color: '#1a365d',
    fontWeight: '600',
    margin: '0 0 4px',
  },
  uploadTextHe: {
    fontSize: '14px',
    color: '#718096',
    margin: '0 0 8px',
    fontFamily: "'Heebo', sans-serif",
  },
  uploadHint: {
    fontSize: '13px',
    color: '#a0aec0',
    margin: 0,
  },
  filePreview: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '16px',
    background: '#f0fff4',
    borderRadius: '12px',
    border: '2px solid #c6f6d5',
  },
  fileIcon: {
    fontSize: '40px',
  },
  fileInfo: {
    flex: 1,
    textAlign: 'right',
  },
  fileName: {
    display: 'block',
    fontSize: '15px',
    fontWeight: '600',
    color: '#1a365d',
    marginBottom: '4px',
  },
  fileSize: {
    fontSize: '13px',
    color: '#718096',
  },
  removeFileBtn: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    border: 'none',
    background: '#fed7d7',
    color: '#c53030',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '700',
    transition: 'all 0.2s ease',
  },
  docTypesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
    gap: '16px',
  },
  docTypeCard: {
    padding: '24px 16px',
    borderRadius: '12px',
    border: '2px solid #e2e8f0',
    background: '#fff',
    textAlign: 'center',
    cursor: 'pointer',
    position: 'relative',
  },
  docTypeCardSelected: {
    borderColor: '#1a365d',
    background: '#ebf8ff',
    boxShadow: '0 8px 24px rgba(26, 54, 93, 0.15)',
  },
  docTypeIcon: {
    fontSize: '36px',
    display: 'block',
    marginBottom: '12px',
  },
  docTypeLabel: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1a365d',
    display: 'block',
  },
  docTypeLabelHe: {
    fontSize: '12px',
    color: '#718096',
    display: 'block',
    marginTop: '4px',
    fontFamily: "'Heebo', sans-serif",
  },
  selectedBadge: {
    position: 'absolute',
    top: '-8px',
    left: '-8px',
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    background: '#48bb78',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: '700',
    boxShadow: '0 4px 12px rgba(72, 187, 120, 0.4)',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '20px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#1a365d',
  },
  labelIcon: {
    fontSize: '16px',
  },
  input: {
    padding: '14px 18px',
    borderRadius: '10px',
    border: '2px solid #e2e8f0',
    fontSize: '15px',
    fontFamily: '"Tajawal", sans-serif',
    background: '#fff',
    color: '#1a365d',
  },
  textarea: {
    resize: 'vertical',
    minHeight: '100px',
    lineHeight: 1.7,
  },
  reviewCard: {
    background: '#f8fafc',
    borderRadius: '12px',
    padding: '24px',
    border: '2px solid #e2e8f0',
  },
  reviewSection: {
    marginBottom: '24px',
    paddingBottom: '24px',
    borderBottom: '1px solid #e2e8f0',
  },
  reviewSectionTitle: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#1a365d',
    margin: '0 0 16px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  reviewIcon: {
    fontSize: '20px',
  },
  reviewGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '12px',
  },
  reviewItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  reviewLabel: {
    fontSize: '12px',
    color: '#718096',
  },
  reviewValue: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1a365d',
  },
  notesText: {
    fontSize: '14px',
    color: '#1a365d',
    lineHeight: 1.8,
    margin: 0,
    padding: '12px 16px',
    background: '#fff',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
  },
  processingInfo: {
    display: 'flex',
    gap: '14px',
    marginTop: '24px',
    padding: '18px',
    background: '#ebf8ff',
    borderRadius: '12px',
    border: '2px solid #bee3f8',
  },
  infoIcon: {
    fontSize: '22px',
    flexShrink: 0,
  },
  infoList: {
    margin: '8px 0 0',
    paddingRight: '20px',
    fontSize: '14px',
    color: '#2b6cb0',
    lineHeight: 1.8,
  },
  navigationButtons: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '32px',
    gap: '16px',
  },
  btnPrimary: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    padding: '16px 32px',
    borderRadius: '10px',
    border: 'none',
    background: '#1a365d',
    color: '#fff',
    fontSize: '16px',
    fontWeight: '700',
    fontFamily: '"Tajawal", sans-serif',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(26, 54, 93, 0.3)',
    marginRight: 'auto',
  },
  btnSecondary: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '16px 24px',
    borderRadius: '10px',
    border: '2px solid #e2e8f0',
    background: 'transparent',
    color: '#1a365d',
    fontSize: '15px',
    fontWeight: '600',
    fontFamily: '"Tajawal", sans-serif',
    cursor: 'pointer',
  },
  btnDisabled: {
    opacity: 0.4,
    cursor: 'not-allowed',
    boxShadow: 'none',
  },
  btnSubmit: {
    background: '#48bb78',
    boxShadow: '0 4px 12px rgba(72, 187, 120, 0.3)',
  },
  btnLoading: {
    opacity: 0.8,
    cursor: 'wait',
  },
  loadingText: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  spinner: {
    width: '18px',
    height: '18px',
    border: '2px solid rgba(255,255,255,0.3)',
    borderTopColor: '#fff',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  successContainer: {
    textAlign: 'center',
    padding: '50px 30px',
    background: '#fff',
    borderRadius: '16px',
    border: '2px solid #e2e8f0',
    animation: 'fadeIn 0.5s ease-out',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
  },
  successIconWrapper: {
    marginBottom: '24px',
  },
  successTitle: {
    fontSize: '28px',
    fontWeight: '800',
    color: '#48bb78',
    margin: '0 0 8px',
  },
  successSubtitle: {
    fontSize: '18px',
    color: '#48bb78',
    margin: '0 0 16px',
    fontFamily: "'Heebo', sans-serif",
  },
  successMessage: {
    fontSize: '16px',
    color: '#718096',
    margin: '0 0 32px',
    lineHeight: 1.6,
  },
  referenceCard: {
    display: 'inline-flex',
    flexDirection: 'column',
    padding: '20px 40px',
    background: '#f0fff4',
    borderRadius: '12px',
    marginBottom: '28px',
    border: '2px solid #c6f6d5',
  },
  refLabel: {
    fontSize: '12px',
    color: '#276749',
    fontWeight: '500',
    marginBottom: '6px',
  },
  refValue: {
    fontSize: '24px',
    fontWeight: '800',
    color: '#276749',
    fontFamily: 'monospace',
    letterSpacing: '2px',
  },
  newRequestBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '10px',
    padding: '16px 36px',
    background: '#1a365d',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '16px',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(26, 54, 93, 0.3)',
    fontFamily: '"Tajawal", sans-serif',
  },
  footer: {
    textAlign: 'center',
    marginTop: '40px',
    color: '#718096',
    fontSize: '13px',
  },
};

export default DocumentAuthenticationRequest;
