import React, { useState, useCallback } from 'react';
import API_URL from './config';

const OfficialDocumentRequest = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    documentType: '',
    recipientEntity: '',
    documentPurpose: '',
    fullName: '',
    idNumber: '',
    address: '',
    phone: '',
    email: '',
    subjectDescription: '',
    attachments: []
  });
  const [dragActive, setDragActive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const documentTypes = [
    { id: 'residency', label: 'شهادة إقامة', labelHe: 'אישור תושבות', icon: '🏠' },
    { id: 'confirmation', label: 'تأكيد معلومات', labelHe: 'אישור פרטים', icon: '✅' },
    { id: 'other', label: 'أخرى', labelHe: 'אחר', icon: '📋' }
  ];

  const recipientEntities = [
    { id: 'government', label: 'جهة حكومية', labelHe: 'גוף ממשלתי', icon: '🏛️' },
    { id: 'education', label: 'مؤسسة تعليمية', labelHe: 'מוסד חינוכי', icon: '🎓' },
    { id: 'health', label: 'مؤسسة صحية', labelHe: 'מוסד בריאות', icon: '🏥' },
    { id: 'employer', label: 'جهة عمل', labelHe: 'מעסיק', icon: '🏢' },
    { id: 'court', label: 'محكمة / جهة قانونية', labelHe: 'בית משפט / גוף משפטי', icon: '⚖️' },
    { id: 'other', label: 'جهة أخرى', labelHe: 'גוף אחר', icon: '📌' }
  ];

  const documentPurposes = [
    { id: 'registration', label: 'تسجيل / انتساب', icon: '📝' },
    { id: 'other', label: 'غرض آخر', icon: '📋' }
  ];

  const steps = [
    { number: 1, title: 'نوع المستند', titleHe: 'סוג המסמך', icon: '📄' },
    { number: 2, title: 'الجهة والغاية', titleHe: 'גוף ומטרה', icon: '🎯' },
    { number: 3, title: 'البيانات الشخصية', titleHe: 'פרטים אישיים', icon: '👤' },
    { number: 4, title: 'تفاصيل الطلب', titleHe: 'פרטי הבקשה', icon: '📝' },
    { number: 5, title: 'مراجعة وإرسال', titleHe: 'סקירה ושליחה', icon: '✓' }
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
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFiles = Array.from(e.dataTransfer.files);
      setFormData(prev => ({
        ...prev,
        attachments: [...prev.attachments, ...newFiles].slice(0, 5)
      }));
    }
  }, []);

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setFormData(prev => ({
        ...prev,
        attachments: [...prev.attachments, ...newFiles].slice(0, 5)
      }));
    }
  };

  const removeFile = (index) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return formData.documentType !== '';
      case 2: return formData.recipientEntity !== '' && formData.documentPurpose !== '';
      case 3: return formData.fullName && formData.idNumber && formData.address && formData.phone;
      case 4: return formData.subjectDescription.length >= 10;
      default: return true;
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('formData', JSON.stringify({
        documentType: formData.documentType,
        documentTypeLabel: getSelectedLabel(documentTypes, formData.documentType),
        recipientEntity: formData.recipientEntity,
        recipientEntityLabel: getSelectedLabel(recipientEntities, formData.recipientEntity),
        documentPurpose: formData.documentPurpose,
        fullName: formData.fullName,
        idNumber: formData.idNumber,
        address: formData.address,
        phone: formData.phone,
        email: formData.email,
        subjectDescription: formData.subjectDescription
      }));

      // Add attachments
      formData.attachments.forEach((file) => {
        formDataToSend.append('documents', file);
      });

      const response = await fetch(`${API_URL}/api/official-doc`, {
        method: 'POST',
        body: formDataToSend
      });

      const result = await response.json();

      if (result.success) {
        setIsSubmitted(true);
      } else {
        alert('حدث خطأ أثناء إرسال الطلب. يرجى المحاولة مرة أخرى.');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('حدث خطأ أثناء إرسال الطلب. تأكد من تشغيل الخادم.');
    }

    setIsSubmitting(false);
  };

  const resetForm = () => {
    setFormData({
      documentType: '',
      recipientEntity: '',
      documentPurpose: '',
      fullName: '',
      idNumber: '',
      address: '',
      phone: '',
      email: '',
      subjectDescription: '',
      attachments: []
    });
    setCurrentStep(1);
    setIsSubmitted(false);
  };

  const getSelectedLabel = (items, id) => {
    const item = items.find(i => i.id === id);
    return item ? item.label : '';
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
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }
        
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        
        @keyframes checkmark {
          0% { stroke-dashoffset: 100; }
          100% { stroke-dashoffset: 0; }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .step-indicator {
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .step-indicator:hover {
          transform: scale(1.05);
        }
        
        .option-card {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .option-card:hover {
          transform: translateY(-4px);
          border-color: rgba(212, 168, 83, 0.4) !important;
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3) !important;
        }
        
        .input-field {
          transition: all 0.3s ease;
        }
        
        .input-field:focus {
          border-color: #d4a853 !important;
          box-shadow: 0 0 0 4px rgba(212, 168, 83, 0.15) !important;
          outline: none;
        }
        
        .btn-primary {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .btn-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(212, 168, 83, 0.4);
        }
        
        .btn-secondary {
          transition: all 0.3s ease;
        }
        
        .btn-secondary:hover {
          background: rgba(255, 255, 255, 0.1) !important;
        }
        
        .upload-zone {
          transition: all 0.3s ease;
        }
        
        .upload-zone:hover {
          border-color: rgba(212, 168, 83, 0.5) !important;
          background: rgba(212, 168, 83, 0.05) !important;
        }
        
        .file-item {
          transition: all 0.3s ease;
        }
        
        .file-item:hover {
          background: rgba(255, 255, 255, 0.08) !important;
        }
        
        .remove-btn:hover {
          background: rgba(239, 68, 68, 0.3) !important;
          transform: scale(1.1);
        }
      `}</style>

      <div style={styles.wrapper}>
        {/* Header */}
        <header style={styles.header}>
          <div style={styles.headerContent}>
            <div style={styles.badge}>
              <span style={{ color: '#fff', fontSize: '15px', fontWeight: '600' }}>
                طلب إعداد مستند رسمي | בקשה להכנת מסמך רשמי
              </span>
            </div>
          </div>
        </header>

        {/* Progress Steps */}
        <div style={styles.stepsContainer}>
          {steps.map((step, index) => (
            <div key={step.number} className="step-indicator" style={styles.stepWrapper}>
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
                }}>{step.title}</span>
                <span style={styles.stepTitleHe}>{step.titleHe}</span>
              </div>
              {index < steps.length - 1 && (
                <div style={{
                  ...styles.stepConnector,
                  ...(currentStep > step.number ? styles.stepConnectorActive : {})
                }} />
              )}
            </div>
          ))}
        </div>

        {/* Main Content */}
        <main style={styles.mainContent}>
          {isSubmitted ? (
            <div style={styles.successContainer}>
              <div style={styles.successIconWrapper}>
                <svg width="100" height="100" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="#22c55e" strokeWidth="3" opacity="0.3"/>
                  <circle cx="50" cy="50" r="45" fill="none" stroke="#22c55e" strokeWidth="3"
                    strokeDasharray="283" strokeDashoffset="0"
                    style={{ animation: 'checkmark 1s ease-out forwards' }}
                  />
                  <path d="M30 52 L45 67 L70 37" fill="none" stroke="#22c55e" strokeWidth="5"
                    strokeLinecap="round" strokeLinejoin="round"
                    strokeDasharray="100" strokeDashoffset="100"
                    style={{ animation: 'checkmark 0.5s ease-out 0.5s forwards' }}
                  />
                </svg>
              </div>
              <h2 style={styles.successTitle}>تم إرسال الطلب بنجاح!</h2>
              <p style={styles.successMessage}>سيتم مراجعة طلبك وإعداد المستند خلال 3-5 أيام عمل</p>
              
              <div style={styles.referenceCard}>
                <span style={styles.refLabel}>رقم الطلب</span>
                <span style={styles.refValue}>DOC-{Date.now().toString().slice(-8)}</span>
              </div>

              <div style={styles.summaryCard}>
                <h3 style={styles.summaryTitle}>ملخص الطلب</h3>
                <div style={styles.summaryRow}>
                  <span style={styles.summaryLabel}>نوع المستند:</span>
                  <span style={styles.summaryValue}>{getSelectedLabel(documentTypes, formData.documentType)}</span>
                </div>
                <div style={styles.summaryRow}>
                  <span style={styles.summaryLabel}>الجهة الموجّه إليها:</span>
                  <span style={styles.summaryValue}>{getSelectedLabel(recipientEntities, formData.recipientEntity)}</span>
                </div>
                <div style={styles.summaryRow}>
                  <span style={styles.summaryLabel}>مقدم الطلب:</span>
                  <span style={styles.summaryValue}>{formData.fullName}</span>
                </div>
              </div>

              <button onClick={resetForm} className="btn-primary" style={styles.newRequestBtn}>
                تقديم طلب جديد
              </button>
            </div>
          ) : (
            <div style={styles.formCard}>
              {/* Step 1: Document Type */}
              {currentStep === 1 && (
                <div style={styles.stepContent}>
                  <h2 style={styles.stepHeading}>اختر نوع المستند المطلوب</h2>
                  <p style={styles.stepDescription}>حدد نوع المستند الرسمي الذي تحتاج إلى إعداده</p>
                  
                  <div style={styles.optionsGrid}>
                    {documentTypes.map((type) => (
                      <div
                        key={type.id}
                        className="option-card"
                        style={{
                          ...styles.optionCard,
                          ...(formData.documentType === type.id ? styles.optionCardSelected : {})
                        }}
                        onClick={() => handleInputChange('documentType', type.id)}
                      >
                        <span style={styles.optionIcon}>{type.icon}</span>
                        <div style={styles.optionLabels}>
                          <span style={styles.optionLabel}>{type.label}</span>
                          <span style={styles.optionLabelHe}>{type.labelHe}</span>
                        </div>
                        {formData.documentType === type.id && (
                          <div style={styles.selectedCheck}>✓</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 2: Recipient & Purpose */}
              {currentStep === 2 && (
                <div style={styles.stepContent}>
                  <h2 style={styles.stepHeading}>الجهة الموجّه إليها والغاية</h2>
                  <p style={styles.stepDescription}>حدد الجهة التي سيُقدّم إليها المستند والغرض منه</p>
                  
                  <div style={styles.sectionBlock}>
                    <h3 style={styles.sectionLabel}>
                      <span style={styles.sectionIcon}>🏢</span>
                      الجهة الموجّه إليها
                    </h3>
                    <div style={styles.optionsGridSmall}>
                      {recipientEntities.map((entity) => (
                        <div
                          key={entity.id}
                          className="option-card"
                          style={{
                            ...styles.optionCardSmall,
                            ...(formData.recipientEntity === entity.id ? styles.optionCardSelected : {})
                          }}
                          onClick={() => handleInputChange('recipientEntity', entity.id)}
                        >
                          <span style={styles.optionIconSmall}>{entity.icon}</span>
                          <span style={styles.optionLabelSmall}>{entity.label}</span>
                          {formData.recipientEntity === entity.id && (
                            <div style={styles.selectedCheckSmall}>✓</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={styles.sectionBlock}>
                    <h3 style={styles.sectionLabel}>
                      <span style={styles.sectionIcon}>🎯</span>
                      الغاية من المستند
                    </h3>
                    <div style={styles.optionsGridSmall}>
                      {documentPurposes.map((purpose) => (
                        <div
                          key={purpose.id}
                          className="option-card"
                          style={{
                            ...styles.optionCardSmall,
                            ...(formData.documentPurpose === purpose.id ? styles.optionCardSelected : {})
                          }}
                          onClick={() => handleInputChange('documentPurpose', purpose.id)}
                        >
                          <span style={styles.optionIconSmall}>{purpose.icon}</span>
                          <span style={styles.optionLabelSmall}>{purpose.label}</span>
                          {formData.documentPurpose === purpose.id && (
                            <div style={styles.selectedCheckSmall}>✓</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Personal Information */}
              {currentStep === 3 && (
                <div style={styles.stepContent}>
                  <h2 style={styles.stepHeading}>البيانات الشخصية</h2>
                  <p style={styles.stepDescription}>أدخل بياناتك الشخصية للتواصل</p>
                  
                  <div style={styles.formGrid}>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>
                        <span style={styles.labelIcon}>👤</span>
                        الاسم الكامل *
                      </label>
                      <input
                        type="text"
                        className="input-field"
                        style={styles.input}
                        value={formData.fullName}
                        onChange={(e) => handleInputChange('fullName', e.target.value)}
                        placeholder="أدخل اسمك الكامل"
                      />
                    </div>
                    
                    <div style={styles.formGroup}>
                      <label style={styles.label}>
                        <span style={styles.labelIcon}>🪪</span>
                        رقم الهوية *
                      </label>
                      <input
                        type="text"
                        className="input-field"
                        style={styles.input}
                        value={formData.idNumber}
                        onChange={(e) => handleInputChange('idNumber', e.target.value)}
                        placeholder="أدخل رقم الهوية"
                        dir="ltr"
                      />
                    </div>
                    
                    <div style={{ ...styles.formGroup, gridColumn: '1 / -1' }}>
                      <label style={styles.label}>
                        <span style={styles.labelIcon}>📍</span>
                        العنوان الكامل *
                      </label>
                      <input
                        type="text"
                        className="input-field"
                        style={styles.input}
                        value={formData.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        placeholder="الشارع، رقم البيت، القرية"
                      />
                    </div>
                    
                    <div style={styles.formGroup}>
                      <label style={styles.label}>
                        <span style={styles.labelIcon}>📞</span>
                        رقم الهاتف *
                      </label>
                      <input
                        type="tel"
                        className="input-field"
                        style={styles.input}
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="05X-XXXXXXX"
                        dir="ltr"
                      />
                    </div>
                    
                    <div style={styles.formGroup}>
                      <label style={styles.label}>
                        <span style={styles.labelIcon}>📧</span>
                        البريد الإلكتروني
                      </label>
                      <input
                        type="email"
                        className="input-field"
                        style={styles.input}
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="example@email.com"
                        dir="ltr"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Request Details */}
              {currentStep === 4 && (
                <div style={styles.stepContent}>
                  <h2 style={styles.stepHeading}>تفاصيل الطلب</h2>
                  <p style={styles.stepDescription}>اشرح موضوع طلبك وأرفق المستندات الداعمة إن وُجدت</p>
                  
                  <div style={styles.formGroup}>
                    <label style={styles.label}>
                      <span style={styles.labelIcon}>📝</span>
                      شرح مختصر للموضوع *
                    </label>
                    <textarea
                      className="input-field"
                      style={{ ...styles.input, ...styles.textarea }}
                      value={formData.subjectDescription}
                      onChange={(e) => handleInputChange('subjectDescription', e.target.value)}
                      placeholder="اشرح بإيجاز الغرض من المستند وأي تفاصيل مهمة يجب تضمينها..."
                      rows={5}
                    />
                    <div style={styles.charCount}>
                      <span style={{
                        color: formData.subjectDescription.length >= 10 ? '#4ade80' : '#f87171'
                      }}>
                        {formData.subjectDescription.length}
                      </span>
                      <span> / 10 حرف على الأقل</span>
                    </div>
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>
                      <span style={styles.labelIcon}>📎</span>
                      مستندات داعمة (اختياري)
                    </label>
                    <div
                      className="upload-zone"
                      style={{
                        ...styles.uploadZone,
                        ...(dragActive ? styles.uploadZoneActive : {})
                      }}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                      onClick={() => document.getElementById('attachmentInput').click()}
                    >
                      <input
                        type="file"
                        id="attachmentInput"
                        style={{ display: 'none' }}
                        multiple
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                        onChange={handleFileInput}
                      />
                      <span style={styles.uploadIcon}>📤</span>
                      <p style={styles.uploadText}>اسحب الملفات هنا أو انقر للاختيار</p>
                      <p style={styles.uploadHint}>PDF, JPG, PNG, DOC (حتى 5 ملفات)</p>
                    </div>

                    {formData.attachments.length > 0 && (
                      <div style={styles.filesList}>
                        {formData.attachments.map((file, index) => (
                          <div key={index} className="file-item" style={styles.fileItem}>
                            <span style={styles.fileIcon}>📄</span>
                            <div style={styles.fileInfo}>
                              <span style={styles.fileName}>{file.name}</span>
                              <span style={styles.fileSize}>
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                              </span>
                            </div>
                            <button
                              className="remove-btn"
                              style={styles.removeBtn}
                              onClick={(e) => {
                                e.stopPropagation();
                                removeFile(index);
                              }}
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Step 5: Review */}
              {currentStep === 5 && (
                <div style={styles.stepContent}>
                  <h2 style={styles.stepHeading}>مراجعة الطلب</h2>
                  <p style={styles.stepDescription}>راجع جميع المعلومات قبل الإرسال</p>
                  
                  <div style={styles.reviewContainer}>
                    {/* Document Info */}
                    <div style={styles.reviewSection}>
                      <h3 style={styles.reviewSectionTitle}>
                        <span style={styles.reviewIcon}>📄</span>
                        معلومات المستند
                      </h3>
                      <div style={styles.reviewGrid}>
                        <div style={styles.reviewItem}>
                          <span style={styles.reviewLabel}>نوع المستند</span>
                          <span style={styles.reviewValue}>
                            {getSelectedLabel(documentTypes, formData.documentType)}
                          </span>
                        </div>
                        <div style={styles.reviewItem}>
                          <span style={styles.reviewLabel}>الجهة الموجّه إليها</span>
                          <span style={styles.reviewValue}>
                            {getSelectedLabel(recipientEntities, formData.recipientEntity)}
                          </span>
                        </div>
                        <div style={styles.reviewItem}>
                          <span style={styles.reviewLabel}>الغاية</span>
                          <span style={styles.reviewValue}>
                            {getSelectedLabel(documentPurposes, formData.documentPurpose)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Personal Info */}
                    <div style={styles.reviewSection}>
                      <h3 style={styles.reviewSectionTitle}>
                        <span style={styles.reviewIcon}>👤</span>
                        البيانات الشخصية
                      </h3>
                      <div style={styles.reviewGrid}>
                        <div style={styles.reviewItem}>
                          <span style={styles.reviewLabel}>الاسم</span>
                          <span style={styles.reviewValue}>{formData.fullName}</span>
                        </div>
                        <div style={styles.reviewItem}>
                          <span style={styles.reviewLabel}>رقم الهوية</span>
                          <span style={styles.reviewValue}>{formData.idNumber}</span>
                        </div>
                        <div style={styles.reviewItem}>
                          <span style={styles.reviewLabel}>العنوان</span>
                          <span style={styles.reviewValue}>{formData.address}</span>
                        </div>
                        <div style={styles.reviewItem}>
                          <span style={styles.reviewLabel}>الهاتف</span>
                          <span style={styles.reviewValue}>{formData.phone}</span>
                        </div>
                        {formData.email && (
                          <div style={styles.reviewItem}>
                            <span style={styles.reviewLabel}>البريد</span>
                            <span style={styles.reviewValue}>{formData.email}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Request Details */}
                    <div style={styles.reviewSection}>
                      <h3 style={styles.reviewSectionTitle}>
                        <span style={styles.reviewIcon}>📝</span>
                        تفاصيل الطلب
                      </h3>
                      <p style={styles.descriptionText}>{formData.subjectDescription}</p>
                      
                      {formData.attachments.length > 0 && (
                        <div style={styles.attachmentsSummary}>
                          <span style={styles.attachmentsLabel}>المرفقات:</span>
                          <span style={styles.attachmentsCount}>
                            {formData.attachments.length} ملف
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Processing Info */}
                  <div style={styles.processingInfo}>
                    <div style={styles.infoIcon}>ℹ️</div>
                    <div>
                      <strong>معلومات المعالجة:</strong>
                      <p style={styles.infoText}>
                        سيتم مراجعة طلبك وإعداد المستند خلال 3-5 أيام عمل. 
                        سيتم التواصل معك عبر الهاتف لاستلام المستند.
                      </p>
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
                    <svg viewBox="0 0 24 24" fill="none" style={{ width: 18, height: 18 }}>
                      <path d="M19 12H5M5 12L12 5M5 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    السابق
                  </button>
                )}
                
                {currentStep < 5 ? (
                  <button
                    className="btn-primary"
                    style={{
                      ...styles.btnPrimary,
                      ...(canProceed() ? {} : styles.btnDisabled)
                    }}
                    onClick={() => setCurrentStep(prev => prev + 1)}
                    disabled={!canProceed()}
                  >
                    التالي
                    <svg viewBox="0 0 24 24" fill="none" style={{ width: 18, height: 18 }}>
                      <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
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
                      <>
                        <span style={styles.spinner} />
                        جاري الإرسال...
                      </>
                    ) : (
                      <>
                        إرسال الطلب
                        <svg viewBox="0 0 24 24" fill="none" style={{ width: 18, height: 18 }}>
                          <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer style={styles.footer}>
          <p>© {new Date().getFullYear()} اللجنة المحلية – قرية الحسينية • جميع الحقوق محفوظة</p>
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
    animation: 'slideIn 0.4s ease-out',
  },
  stepHeading: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#1a365d',
    margin: '0 0 8px',
  },
  stepDescription: {
    fontSize: '15px',
    color: '#718096',
    margin: '0 0 28px',
    lineHeight: 1.6,
  },
  optionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
    gap: '14px',
  },
  optionCard: {
    padding: '20px 16px',
    borderRadius: '12px',
    border: '2px solid #e2e8f0',
    background: '#fff',
    cursor: 'pointer',
    position: 'relative',
    textAlign: 'center',
  },
  optionCardSelected: {
    borderColor: '#1a365d',
    background: '#ebf8ff',
    boxShadow: '0 8px 24px rgba(26, 54, 93, 0.15)',
  },
  optionIcon: {
    fontSize: '36px',
    display: 'block',
    marginBottom: '12px',
  },
  optionLabels: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  optionLabel: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1a365d',
  },
  optionLabelHe: {
    fontSize: '12px',
    color: '#718096',
    fontFamily: "'Heebo', sans-serif",
  },
  selectedCheck: {
    position: 'absolute',
    top: '-8px',
    left: '-8px',
    width: '26px',
    height: '26px',
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
  sectionBlock: {
    marginBottom: '28px',
  },
  sectionLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '16px',
    fontWeight: '600',
    color: '#1a365d',
    margin: '0 0 16px',
  },
  sectionIcon: {
    fontSize: '20px',
  },
  optionsGridSmall: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
    gap: '12px',
  },
  optionCardSmall: {
    padding: '14px 12px',
    borderRadius: '10px',
    border: '2px solid #e2e8f0',
    background: '#fff',
    cursor: 'pointer',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  optionIconSmall: {
    fontSize: '22px',
  },
  optionLabelSmall: {
    fontSize: '13px',
    fontWeight: '500',
    color: '#1a365d',
  },
  selectedCheckSmall: {
    position: 'absolute',
    top: '-6px',
    left: '-6px',
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    background: '#48bb78',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '11px',
    fontWeight: '700',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '20px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
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
    background: '#fff',
    color: '#1a365d',
    fontSize: '15px',
    fontFamily: '"Tajawal", sans-serif',
  },
  textarea: {
    resize: 'vertical',
    minHeight: '120px',
    lineHeight: 1.7,
  },
  charCount: {
    fontSize: '12px',
    color: '#718096',
    textAlign: 'left',
    direction: 'ltr',
  },
  uploadZone: {
    border: '2px dashed #e2e8f0',
    borderRadius: '12px',
    padding: '36px 24px',
    textAlign: 'center',
    cursor: 'pointer',
    background: '#f8fafc',
  },
  uploadZoneActive: {
    borderColor: '#1a365d',
    background: '#ebf8ff',
  },
  uploadIcon: {
    fontSize: '40px',
    display: 'block',
    marginBottom: '12px',
    animation: 'float 3s ease-in-out infinite',
  },
  uploadText: {
    fontSize: '15px',
    color: '#1a365d',
    margin: '0 0 6px',
    fontWeight: '500',
  },
  uploadHint: {
    fontSize: '12px',
    color: '#718096',
    margin: 0,
  },
  filesList: {
    marginTop: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  fileItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    background: '#f0fff4',
    borderRadius: '10px',
    border: '2px solid #c6f6d5',
  },
  fileIcon: {
    fontSize: '24px',
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    display: 'block',
    fontSize: '14px',
    color: '#1a365d',
    fontWeight: '500',
  },
  fileSize: {
    fontSize: '12px',
    color: '#718096',
  },
  removeBtn: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    border: 'none',
    background: '#fed7d7',
    color: '#c53030',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
  },
  reviewContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  reviewSection: {
    padding: '20px',
    background: '#f8fafc',
    borderRadius: '12px',
    border: '2px solid #e2e8f0',
  },
  reviewSectionTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '16px',
    fontWeight: '700',
    color: '#1a365d',
    margin: '0 0 16px',
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
    color: '#1a365d',
    fontWeight: '500',
  },
  descriptionText: {
    fontSize: '14px',
    color: '#1a365d',
    lineHeight: 1.8,
    margin: 0,
    padding: '12px 16px',
    background: '#fff',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
  },
  attachmentsSummary: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginTop: '12px',
    padding: '10px 14px',
    background: '#ebf8ff',
    borderRadius: '8px',
    border: '1px solid #bee3f8',
  },
  attachmentsLabel: {
    fontSize: '13px',
    color: '#718096',
  },
  attachmentsCount: {
    fontSize: '13px',
    color: '#2b6cb0',
    fontWeight: '600',
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
  infoText: {
    fontSize: '14px',
    color: '#2b6cb0',
    margin: '8px 0 0',
    lineHeight: 1.7,
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
    margin: '0 0 12px',
  },
  successMessage: {
    fontSize: '16px',
    color: '#718096',
    margin: '0 0 32px',
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
  summaryCard: {
    padding: '24px',
    background: '#f8fafc',
    borderRadius: '12px',
    marginBottom: '28px',
    textAlign: 'right',
    border: '2px solid #e2e8f0',
  },
  summaryTitle: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#1a365d',
    margin: '0 0 16px',
    paddingBottom: '12px',
    borderBottom: '1px solid #e2e8f0',
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '10px 0',
    borderBottom: '1px solid #e2e8f0',
  },
  summaryLabel: {
    fontSize: '14px',
    color: '#718096',
  },
  summaryValue: {
    fontSize: '14px',
    color: '#1a365d',
    fontWeight: '500',
  },
  newRequestBtn: {
    marginRight: 0,
    padding: '14px 28px',
  },
  footer: {
    textAlign: 'center',
    marginTop: '40px',
    color: '#718096',
    fontSize: '13px',
  },
};

export default OfficialDocumentRequest;