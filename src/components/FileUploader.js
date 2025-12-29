import React, { useState, useRef, useCallback } from 'react';

const FileUploader = ({
  onFilesSelected,
  maxFiles = 5,
  maxSizeMB = 10,
  acceptedTypes = '.pdf,.doc,.docx,.jpg,.jpeg,.png,.xls,.xlsx',
  label = 'إرفاق ملفات',
  labelHe = 'צרף קבצים'
}) => {
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const fileInputRef = useRef(null);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileName) => {
    const ext = fileName.split('.').pop().toLowerCase();
    const icons = {
      pdf: '📄',
      doc: '📝',
      docx: '📝',
      xls: '📊',
      xlsx: '📊',
      jpg: '🖼️',
      jpeg: '🖼️',
      png: '🖼️',
      gif: '🖼️',
      zip: '📦',
      rar: '📦',
      txt: '📃',
      default: '📎'
    };
    return icons[ext] || icons.default;
  };

  const validateFile = (file) => {
    const maxSize = maxSizeMB * 1024 * 1024;
    if (file.size > maxSize) {
      return { valid: false, error: `حجم الملف يتجاوز ${maxSizeMB}MB` };
    }

    const allowedExtensions = acceptedTypes.split(',').map(t => t.trim().toLowerCase());
    const fileExt = '.' + file.name.split('.').pop().toLowerCase();
    if (!allowedExtensions.includes(fileExt)) {
      return { valid: false, error: 'نوع الملف غير مدعوم' };
    }

    return { valid: true };
  };

  const simulateUploadProgress = (fileId) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 30;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
      }
      setUploadProgress(prev => ({ ...prev, [fileId]: Math.min(progress, 100) }));
    }, 200);
  };

  const handleFiles = useCallback((newFiles) => {
    const fileArray = Array.from(newFiles);
    const validFiles = [];

    for (const file of fileArray) {
      if (files.length + validFiles.length >= maxFiles) {
        alert(`الحد الأقصى ${maxFiles} ملفات`);
        break;
      }

      const validation = validateFile(file);
      if (validation.valid) {
        const fileId = Date.now() + Math.random().toString(36);
        const fileWithId = {
          id: fileId,
          file: file,
          name: file.name,
          size: file.size,
          preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
        };
        validFiles.push(fileWithId);
        simulateUploadProgress(fileId);
      } else {
        alert(`${file.name}: ${validation.error}`);
      }
    }

    const updatedFiles = [...files, ...validFiles];
    setFiles(updatedFiles);
    if (onFilesSelected) {
      onFilesSelected(updatedFiles.map(f => f.file));
    }
  }, [files, maxFiles, onFilesSelected, maxSizeMB, acceptedTypes]);

  const removeFile = (fileId) => {
    const updatedFiles = files.filter(f => f.id !== fileId);
    setFiles(updatedFiles);
    setUploadProgress(prev => {
      const newProgress = { ...prev };
      delete newProgress[fileId];
      return newProgress;
    });
    if (onFilesSelected) {
      onFilesSelected(updatedFiles.map(f => f.file));
    }
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      handleFiles(droppedFiles);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleInputChange = (e) => {
    if (e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  return (
    <div style={styles.container}>
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes progressBar {
          0% { background-position: 0 0; }
          100% { background-position: 40px 0; }
        }
        .file-item {
          animation: fadeInUp 0.3s ease-out forwards;
        }
        .upload-zone:hover {
          border-color: #3b82f6 !important;
          background: linear-gradient(135deg, #eff6ff 0%, #f0f9ff 100%) !important;
        }
        .upload-zone.dragging {
          border-color: #3b82f6 !important;
          background: linear-gradient(135deg, #dbeafe 0%, #e0f2fe 100%) !important;
          transform: scale(1.02);
        }
        .remove-btn:hover {
          background: #ef4444 !important;
          color: white !important;
          transform: rotate(90deg);
        }
        .progress-bar-animated {
          background: linear-gradient(
            45deg,
            #3b82f6 25%,
            #60a5fa 25%,
            #60a5fa 50%,
            #3b82f6 50%,
            #3b82f6 75%,
            #60a5fa 75%
          );
          background-size: 40px 40px;
          animation: progressBar 1s linear infinite;
        }
      `}</style>

      {/* Upload Zone */}
      <div
        className={`upload-zone ${isDragging ? 'dragging' : ''}`}
        style={{
          ...styles.uploadZone,
          borderColor: isDragging ? '#3b82f6' : '#d1d5db',
          background: isDragging
            ? 'linear-gradient(135deg, #dbeafe 0%, #e0f2fe 100%)'
            : 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
          transform: isDragging ? 'scale(1.02)' : 'scale(1)'
        }}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes}
          onChange={handleInputChange}
          style={{ display: 'none' }}
        />

        <div style={styles.uploadIcon}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" style={{ color: isDragging ? '#3b82f6' : '#64748b' }}>
            <path
              d="M12 15V3M12 3L8 7M12 3L16 7"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M2 17L2.621 19.485C2.72915 19.9177 2.97882 20.3018 3.33033 20.5763C3.68184 20.8508 4.11501 20.9999 4.561 21H19.439C19.885 20.9999 20.3182 20.8508 20.6697 20.5763C21.0212 20.3018 21.2708 19.9177 21.379 19.485L22 17"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <div style={styles.uploadText}>
          <p style={styles.uploadTitle}>{label}</p>
          <p style={styles.uploadTitleHe}>{labelHe}</p>
          <p style={styles.uploadHint}>
            اسحب الملفات هنا أو انقر للاختيار
            <br />
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>
              גרור קבצים לכאן או לחץ לבחירה
            </span>
          </p>
          <p style={styles.uploadMeta}>
            الحد الأقصى: {maxFiles} ملفات • {maxSizeMB}MB لكل ملف
          </p>
        </div>

        <div style={styles.acceptedTypes}>
          {acceptedTypes.split(',').slice(0, 5).map((type, i) => (
            <span key={i} style={styles.typeTag}>
              {type.replace('.', '').toUpperCase()}
            </span>
          ))}
        </div>
      </div>

      {/* Files List */}
      {files.length > 0 && (
        <div style={styles.filesList}>
          <div style={styles.filesHeader}>
            <span style={styles.filesCount}>
              📎 {files.length} / {maxFiles} ملفات
            </span>
          </div>

          {files.map((fileItem, index) => (
            <div
              key={fileItem.id}
              className="file-item"
              style={{
                ...styles.fileItem,
                animationDelay: `${index * 0.1}s`
              }}
            >
              {/* File Preview/Icon */}
              <div style={styles.filePreview}>
                {fileItem.preview ? (
                  <img
                    src={fileItem.preview}
                    alt={fileItem.name}
                    style={styles.previewImage}
                  />
                ) : (
                  <span style={styles.fileIcon}>{getFileIcon(fileItem.name)}</span>
                )}
              </div>

              {/* File Info */}
              <div style={styles.fileInfo}>
                <p style={styles.fileName}>{fileItem.name}</p>
                <p style={styles.fileSize}>{formatFileSize(fileItem.size)}</p>

                {/* Progress Bar */}
                {uploadProgress[fileItem.id] !== undefined && uploadProgress[fileItem.id] < 100 && (
                  <div style={styles.progressContainer}>
                    <div
                      className="progress-bar-animated"
                      style={{
                        ...styles.progressBar,
                        width: `${uploadProgress[fileItem.id]}%`
                      }}
                    />
                  </div>
                )}

                {uploadProgress[fileItem.id] === 100 && (
                  <span style={styles.uploadComplete}>✓ تم الرفع</span>
                )}
              </div>

              {/* Remove Button */}
              <button
                className="remove-btn"
                style={styles.removeBtn}
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(fileItem.id);
                }}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    width: '100%',
    fontFamily: '"Tajawal", "Heebo", sans-serif',
  },
  uploadZone: {
    border: '2px dashed #d1d5db',
    borderRadius: '16px',
    padding: '32px 24px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'relative',
    overflow: 'hidden',
  },
  uploadIcon: {
    marginBottom: '16px',
    transition: 'transform 0.3s ease',
  },
  uploadText: {
    marginBottom: '16px',
  },
  uploadTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#1e293b',
    margin: '0 0 4px 0',
  },
  uploadTitleHe: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#64748b',
    margin: '0 0 12px 0',
  },
  uploadHint: {
    fontSize: '14px',
    color: '#64748b',
    margin: '0 0 8px 0',
    lineHeight: 1.6,
  },
  uploadMeta: {
    fontSize: '12px',
    color: '#94a3b8',
    margin: 0,
  },
  acceptedTypes: {
    display: 'flex',
    gap: '8px',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginTop: '16px',
  },
  typeTag: {
    padding: '4px 10px',
    background: '#e2e8f0',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: '600',
    color: '#475569',
  },
  filesList: {
    marginTop: '20px',
    background: '#f8fafc',
    borderRadius: '12px',
    padding: '16px',
    border: '1px solid #e2e8f0',
  },
  filesHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
    paddingBottom: '12px',
    borderBottom: '1px solid #e2e8f0',
  },
  filesCount: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#1e293b',
  },
  fileItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px',
    background: '#fff',
    borderRadius: '10px',
    marginBottom: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    transition: 'all 0.2s ease',
    border: '1px solid #e2e8f0',
  },
  filePreview: {
    width: '48px',
    height: '48px',
    borderRadius: '8px',
    overflow: 'hidden',
    background: '#f1f5f9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  previewImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  fileIcon: {
    fontSize: '24px',
  },
  fileInfo: {
    flex: 1,
    minWidth: 0,
  },
  fileName: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1e293b',
    margin: '0 0 4px 0',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  fileSize: {
    fontSize: '12px',
    color: '#64748b',
    margin: 0,
  },
  progressContainer: {
    height: '4px',
    background: '#e2e8f0',
    borderRadius: '2px',
    marginTop: '8px',
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: '2px',
    transition: 'width 0.3s ease',
  },
  uploadComplete: {
    fontSize: '12px',
    color: '#16a34a',
    fontWeight: '600',
    marginTop: '4px',
    display: 'inline-block',
  },
  removeBtn: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    border: 'none',
    background: '#fee2e2',
    color: '#dc2626',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
};

export default FileUploader;
