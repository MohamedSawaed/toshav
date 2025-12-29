import React, { useState, useCallback, useEffect } from 'react';
import { PDFDocument } from 'pdf-lib';
import API_URL from './config';

// Import PDF from src folder
import toshavmailPdf from './toshavmail.pdf';

// ID to Page mapping - 216 residents from Misgav Regional Council
const ID_TO_PAGE = {
  "66013491": 1, "301532289": 2, "29758745": 3, "42821462": 4, "300723095": 5,
  "39653811": 6, "29750379": 7, "59913178": 8, "28257277": 9, "28262855": 10,
  "33417338": 11, "305313504": 12, "50106244": 13, "21007687": 14, "50476217": 15,
  "54463815": 16, "23397896": 17, "23392087": 18, "29906930": 19, "302973169": 20,
  "40161275": 21, "29977964": 22, "34664821": 23, "300723103": 24, "34451419": 25,
  "33888561": 26, "43107002": 27, "311385033": 28, "33378241": 29, "23302623": 30,
  "39480066": 31, "55827232": 32, "203891007": 33, "203131255": 34, "304925837": 35,
  "23392178": 36, "34224931": 37, "37003464": 38, "39383476": 39, "27594076": 40,
  "59329136": 41, "33679556": 42, "23206758": 43, "53012001": 44, "24746802": 45,
  "21009113": 46, "53881074": 47, "53866745": 48, "305084188": 49, "56879588": 50,
  "26378307": 51, "23392111": 52, "59529230": 53, "43224112": 54, "28263275": 55,
  "33957556": 56, "54791231": 57, "27594498": 58, "29883907": 59, "21007471": 60,
  "50439553": 61, "55827166": 62, "21007695": 63, "58982802": 64, "26313072": 65,
  "54791199": 66, "55847818": 67, "23389802": 68, "21009097": 69, "50753490": 70,
  "28242303": 71, "21007505": 72, "39322284": 73, "33925983": 74, "33276767": 75,
  "24759292": 76, "57587412": 77, "58957143": 78, "23392095": 79, "59935742": 80,
  "21007901": 81, "39708094": 82, "53722922": 83, "59951103": 84, "201009107": 85,
  "204649818": 86, "34619247": 87, "29798675": 88, "56972821": 89, "203450499": 90,
  "66233685": 91, "57587313": 92, "23190770": 93, "23102395": 94, "50914720": 95,
  "21007893": 96, "53103016": 97, "21007489": 98, "50476191": 99, "50799642": 100,
  "53881157": 101, "21007422": 102, "24799470": 103, "303123996": 104, "34357996": 105,
  "28204477": 106, "54791249": 107, "57587305": 108, "29908233": 109, "53866752": 110,
  "40084519": 111, "33589003": 112, "303113161": 113, "205825193": 114, "55827240": 115,
  "26371344": 116, "27544659": 117, "206520173": 118, "25818931": 119, "29200052": 120,
  "29233095": 121, "29927662": 122, "28255057": 123, "33419144": 124, "50439538": 125,
  "39221767": 126, "40162091": 127, "25825217": 128, "300243201": 129, "203998240": 130,
  "54792825": 131, "318464054": 132, "59959213": 133, "55827091": 134, "33032046": 135,
  "32692527": 136, "26373886": 137, "54453139": 138, "58957077": 139, "35479567": 140,
  "29906237": 141, "53755393": 142, "25851494": 143, "25875329": 144, "29109337": 145,
  "58957168": 146, "37035052": 147, "66605494": 148, "50479799": 149, "21007430": 150,
  "23205263": 151, "303113856": 152, "26224089": 153, "34331603": 154, "200807063": 155,
  "24759300": 156, "28258663": 157, "5898986": 158, "25824186": 159, "307926691": 160,
  "21007513": 161, "39196563": 162, "28312262": 163, "23227432": 164, "20134581": 165,
  "37181559": 166, "309700805": 167, "43108786": 168, "28263077": 169, "43105055": 170,
  "39108618": 171, "55844955": 172, "57587370": 173, "203323795": 174, "50493063": 175,
  "50438993": 176, "300243094": 177, "58985995": 178, "50753375": 179, "59452912": 180,
  "50438977": 181, "29111515": 182, "54791256": 183, "209023753": 184, "29111523": 185,
  "37183084": 186, "37419157": 187, "29777018": 188, "49843428": 189, "311445712": 190,
  "313311607": 191, "66091075": 192, "301618963": 193, "316435692": 194, "207723206": 195,
  "37223690": 196, "54803663": 197, "26418988": 198, "36089621": 199, "26174854": 200,
  "37414968": 201, "59934851": 202, "55827158": 203, "301429106": 204, "59354431": 205,
  "33564469": 206, "21007711": 207, "36096170": 208, "21007398": 209, "54463807": 210,
  "39308523": 211, "24755373": 212, "24747461": 213, "59538124": 214, "23119357": 215,
  "27573922": 216
};

// Inject global styles
const injectStyles = () => {
  if (document.getElementById('resident-cert-styles')) return;

  const styleSheet = document.createElement('style');
  styleSheet.id = 'resident-cert-styles';
  styleSheet.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;500;600;700;800&display=swap');

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }

    .resident-cert-input::placeholder {
      color: #a0aec0;
    }

    .resident-cert-input:focus {
      border-color: #1a365d !important;
      background: #fff !important;
      box-shadow: 0 0 0 4px rgba(26, 54, 93, 0.1) !important;
    }

    .resident-cert-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(26, 54, 93, 0.3) !important;
    }

    .resident-cert-btn:active:not(:disabled) {
      transform: translateY(0);
    }

    .resident-cert-download:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(72, 187, 120, 0.4) !important;
    }
  `;
  document.head.appendChild(styleSheet);
};

export default function ResidentCertificateLookup() {
  const [idNumber, setIdNumber] = useState('');
  const [pdfUrl, setPdfUrl] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [pageNumber, setPageNumber] = useState(null);
  const [pdfData, setPdfData] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(true);

  // Inject styles on mount
  useEffect(() => {
    injectStyles();
  }, []);

  // Load PDF on mount
  useEffect(() => {
    const loadPdf = async () => {
      try {
        const response = await fetch(toshavmailPdf);
        const arrayBuffer = await response.arrayBuffer();
        setPdfData(arrayBuffer);
      } catch (err) {
        console.error('Error loading PDF:', err);
        setError('שגיאה בטעינת קובץ האישורים');
      } finally {
        setPdfLoading(false);
      }
    };
    loadPdf();
  }, []);

  // Extract specific page from PDF
  const extractPage = useCallback(async (pageNum) => {
    if (!pdfData) return null;
    
    try {
      const pdfDoc = await PDFDocument.load(pdfData);
      const newPdfDoc = await PDFDocument.create();
      const [copiedPage] = await newPdfDoc.copyPages(pdfDoc, [pageNum - 1]);
      newPdfDoc.addPage(copiedPage);
      const pdfBytes = await newPdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      return URL.createObjectURL(blob);
    } catch (err) {
      console.error('Error extracting page:', err);
      return null;
    }
  }, [pdfData]);

  // Search handler
  const handleSearch = useCallback(async () => {
    setError('');
    setPdfUrl(null);
    setSuccess(false);
    setPageNumber(null);
    
    const cleanId = idNumber.trim();

    if (!cleanId) {
      setError('אנא הזן מספר תעודת זהות');
      return;
    }

    if (!/^\d{5,9}$/.test(cleanId)) {
      setError('מספר תעודת זהות לא תקין');
      return;
    }

    // Remove leading zeros for lookup (IDs in database don't have leading zeros)
    const normalizedId = cleanId.replace(/^0+/, '');

    const page = ID_TO_PAGE[normalizedId];
    
    if (!page) {
      setError('מספר תעודת הזהות לא נמצא במערכת');
      return;
    }

    setLoading(true);
    
    try {
      const url = await extractPage(page);
      if (url) {
        setPdfUrl(url);
        setSuccess(true);
        setPageNumber(page);
      } else {
        setError('שגיאה בטעינת האישור');
      }
    } finally {
      setLoading(false);
    }
  }, [idNumber, extractPage]);

  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter') handleSearch();
  }, [handleSearch]);

  const handleDownload = useCallback(async () => {
    if (pdfUrl) {
      // Log the download to the server
      try {
        await fetch(`${API_URL}/api/certificate/download-log`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            idNumber: idNumber,
            pageNumber: pageNumber,
            timestamp: new Date().toISOString()
          })
        });
      } catch (err) {
        console.error('Failed to log download:', err);
        // Continue with download even if logging fails
      }

      // Proceed with download
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = `אישור_תושבות_${idNumber}.pdf`;
      link.click();
    }
  }, [pdfUrl, idNumber, pageNumber]);

  const handleClear = useCallback(() => {
    setIdNumber('');
    setPdfUrl(null);
    setError('');
    setSuccess(false);
    setPageNumber(null);
  }, []);

  return (
    <div dir="rtl" style={styles.container}>
      <div style={styles.wrapper}>
        {/* Header */}
        <header style={styles.header}>
          <div style={styles.headerContent}>
            <div style={styles.badge}>
              <span style={{ color: '#fff', fontSize: '15px', fontWeight: '600' }}>
                מערכת אישורי תושבות | מערכת שירותים דיגיטליים רשמית
              </span>
            </div>
          </div>
        </header>

        {/* Requirements Section */}
        <div style={styles.requirementsCard}>
          <div style={styles.requirementsHeader}>
            <div style={styles.requirementsIcon}>
              <svg viewBox="0 0 24 24" fill="none" style={{ width: 24, height: 24 }}>
                <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
            <div>
              <h3 style={styles.requirementsTitle}>התנאים להפקה עצמית של אישור תושב</h3>
              <p style={styles.requirementsSubtitle}>شروط الاستخراج الذاتي لشهادة السكن</p>
            </div>
          </div>
          <div style={styles.requirementsList}>
            <div style={styles.requirementItem}>
              <div style={styles.requirementCheckbox}>☐</div>
              <span>כרטסת המיסים (ארנונה) של הרשות</span>
            </div>
            <div style={styles.requirementItem}>
              <div style={styles.requirementCheckbox}>☐</div>
              <span>הרישום בתעודת הזהות של הנ"ל (במהלך מרוכז - אישור תושב במרשם התושבים)</span>
            </div>
            <div style={styles.requirementItem}>
              <div style={styles.requirementCheckbox}>☐</div>
              <span>ילדי המבקש/ת לומדים במוסד חינוכי (גן, ביה"ס) ביישוב או מחוצה לו ורשומים במחלקת החינוך ביישוב</span>
            </div>
            <div style={styles.requirementItem}>
              <div style={styles.requirementCheckbox}>☐</div>
              <span>חשבון מים</span>
            </div>
            <div style={styles.requirementItem}>
              <div style={styles.requirementCheckbox}>☐</div>
              <span>חוזה שכירות דירה/בית</span>
            </div>
          </div>
        </div>

        {/* Main Card */}
        <main style={styles.card}>

          <div style={styles.cardContent}>
            {/* Search Box */}
            <div style={styles.searchBox}>
              <div style={styles.inputWrapper}>
                <div style={styles.inputIcon}>
                  <svg viewBox="0 0 24 24" fill="none" style={{ width: 22, height: 22 }}>
                    <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M3 10H21" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M7 15H12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </div>
                <input
                  type="text"
                  value={idNumber}
                  onChange={(e) => setIdNumber(e.target.value.replace(/\D/g, ''))}
                  onKeyPress={handleKeyPress}
                  placeholder="הזן מספר תעודת זהות"
                  style={styles.input}
                  className="resident-cert-input"
                  maxLength={9}
                  disabled={loading || pdfLoading}
                />
                {idNumber && (
                  <button onClick={() => setIdNumber('')} style={styles.clearInput}>
                    ✕
                  </button>
                )}
              </div>
              
              <button
                onClick={handleSearch}
                disabled={loading || pdfLoading || !idNumber}
                style={{
                  ...styles.searchBtn,
                  ...(loading || pdfLoading || !idNumber ? styles.searchBtnDisabled : {})
                }}
                className="resident-cert-btn"
              >
                {loading ? (
                  <span style={styles.spinner} />
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" fill="none" style={{ width: 20, height: 20 }}>
                      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2"/>
                      <path d="M20 20L16 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    חפש
                  </>
                )}
              </button>
            </div>

            {/* Messages */}
            {error && (
              <div style={styles.errorMsg}>
                <div style={styles.errorIcon}>!</div>
                <span>{error}</span>
              </div>
            )}

            {success && !pdfUrl && (
              <div style={styles.successMsg}>
                <div style={styles.successIcon}>✓</div>
                <span>האישור נמצא בעמוד {pageNumber}</span>
              </div>
            )}

            {/* PDF Result */}
            {pdfUrl && (
              <div style={styles.resultSection}>
                <div style={styles.resultHeader}>
                  <div style={styles.resultInfo}>
                    <div style={styles.resultBadge}>נמצא</div>
                    <div>
                      <h3 style={styles.resultTitle}>אישור תושבות</h3>
                      <p style={styles.resultMeta}>ת.ז {idNumber} • עמוד {pageNumber}</p>
                    </div>
                  </div>
                  
                  <div style={styles.resultActions}>
                    <button onClick={handleClear} style={styles.newSearchBtn}>
                      חיפוש חדש
                    </button>
                    <button 
                      onClick={handleDownload} 
                      style={styles.downloadBtn}
                      className="resident-cert-download"
                    >
                      <svg viewBox="0 0 24 24" fill="none" style={{ width: 18, height: 18 }}>
                        <path d="M12 3V15M12 15L7 10M12 15L17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M3 17V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                      הורד PDF
                    </button>
                  </div>
                </div>
                
                <div style={styles.pdfFrame}>
                  <iframe
                    src={pdfUrl}
                    style={styles.iframe}
                    title="אישור תושבות"
                  />
                </div>
              </div>
            )}

            {/* Empty State */}
            {!pdfUrl && !error && (
              <div style={styles.emptyState}>
                <div style={styles.emptyVisual}>
                  <div style={styles.emptyCircle}>
                    <svg viewBox="0 0 48 48" fill="none" style={{ width: 48, height: 48 }}>
                      <path d="M8 12C8 9.79 9.79 8 12 8H28L40 20V36C40 38.21 38.21 40 36 40H12C9.79 40 8 38.21 8 36V12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M28 8V20H40" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M16 28H32" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      <path d="M16 34H26" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </div>
                </div>
                <h3 style={styles.emptyTitle}>חיפוש אישור תושבות</h3>
                <p style={styles.emptyText}>הזן את מספר תעודת הזהות שלך לקבלת האישור</p>
              </div>
            )}
          </div>
        </main>

        {/* Footer */}
        <footer style={styles.footer}>
          <p>© {new Date().getFullYear()} ועד מקומי חוסנייה</p>
        </footer>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: '#f8fafc',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: "'Heebo', 'Segoe UI', sans-serif",
  },
  wrapper: {
    position: 'relative',
    zIndex: 1,
    maxWidth: '800px',
    margin: '0 auto',
    padding: '0 20px 32px 20px',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    background: 'linear-gradient(135deg, #1e3a5f 0%, #1a365d 50%, #153e75 100%)',
    padding: '40px 24px',
    textAlign: 'center',
    margin: '0 -20px 32px -20px',
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
  card: {
    background: '#fff',
    borderRadius: '16px',
    border: '2px solid #e2e8f0',
    overflow: 'hidden',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
  },
  cardContent: {
    padding: '32px',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  searchBox: {
    display: 'flex',
    gap: '12px',
    marginBottom: '24px',
  },
  inputWrapper: {
    flex: 1,
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    right: '16px',
    color: '#718096',
    pointerEvents: 'none',
  },
  input: {
    width: '100%',
    padding: '18px 48px 18px 40px',
    fontSize: '17px',
    fontWeight: '500',
    border: '2px solid #e2e8f0',
    borderRadius: '12px',
    background: '#fff',
    color: '#1a365d',
    outline: 'none',
    transition: 'all 0.25s ease',
    fontFamily: "'Heebo', sans-serif",
    letterSpacing: '0.03em',
  },
  clearInput: {
    position: 'absolute',
    left: '14px',
    background: '#e2e8f0',
    border: 'none',
    color: '#718096',
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    cursor: 'pointer',
    fontSize: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
  },
  searchBtn: {
    padding: '18px 32px',
    fontSize: '16px',
    fontWeight: '600',
    border: 'none',
    borderRadius: '12px',
    background: '#1a365d',
    color: '#fff',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    transition: 'all 0.25s ease',
    boxShadow: '0 4px 12px rgba(26, 54, 93, 0.3)',
    fontFamily: "'Heebo', sans-serif",
    whiteSpace: 'nowrap',
  },
  searchBtnDisabled: {
    opacity: 0.4,
    cursor: 'not-allowed',
    boxShadow: 'none',
  },
  spinner: {
    width: '22px',
    height: '22px',
    border: '2.5px solid rgba(255,255,255,0.2)',
    borderTopColor: '#fff',
    borderRadius: '50%',
    animation: 'spin 0.7s linear infinite',
  },
  errorMsg: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px 20px',
    background: '#fff5f5',
    border: '2px solid #e53e3e',
    borderRadius: '12px',
    color: '#c53030',
    fontSize: '15px',
    marginBottom: '20px',
    animation: 'fadeIn 0.3s ease',
  },
  errorIcon: {
    width: '24px',
    height: '24px',
    background: '#e53e3e',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#fff',
  },
  successMsg: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px 20px',
    background: '#f0fff4',
    border: '2px solid #48bb78',
    borderRadius: '12px',
    color: '#276749',
    fontSize: '15px',
    marginBottom: '20px',
    animation: 'fadeIn 0.3s ease',
  },
  successIcon: {
    width: '24px',
    height: '24px',
    background: '#48bb78',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '13px',
    fontWeight: 'bold',
    color: '#fff',
  },
  resultSection: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    animation: 'fadeIn 0.4s ease',
  },
  resultHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    flexWrap: 'wrap',
    gap: '16px',
  },
  resultInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
  },
  resultBadge: {
    padding: '6px 12px',
    background: '#f0fff4',
    border: '2px solid #48bb78',
    borderRadius: '8px',
    color: '#276749',
    fontSize: '12px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  resultTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1a365d',
    margin: 0,
  },
  resultMeta: {
    fontSize: '13px',
    color: '#718096',
    margin: '3px 0 0 0',
  },
  resultActions: {
    display: 'flex',
    gap: '10px',
  },
  newSearchBtn: {
    padding: '12px 20px',
    fontSize: '14px',
    fontWeight: '500',
    border: '2px solid #e2e8f0',
    borderRadius: '10px',
    background: 'transparent',
    color: '#1a365d',
    cursor: 'pointer',
    transition: 'all 0.2s',
    fontFamily: "'Heebo', sans-serif",
  },
  downloadBtn: {
    padding: '12px 20px',
    fontSize: '14px',
    fontWeight: '600',
    border: 'none',
    borderRadius: '10px',
    background: '#48bb78',
    color: '#fff',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.25s ease',
    boxShadow: '0 4px 12px rgba(72, 187, 120, 0.3)',
    fontFamily: "'Heebo', sans-serif",
  },
  pdfFrame: {
    flex: 1,
    minHeight: '450px',
    borderRadius: '12px',
    overflow: 'hidden',
    border: '2px solid #e2e8f0',
    background: '#fff',
  },
  iframe: {
    width: '100%',
    height: '100%',
    minHeight: '450px',
    border: 'none',
  },
  emptyState: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    padding: '40px 20px',
  },
  emptyVisual: {
    marginBottom: '24px',
  },
  emptyCircle: {
    width: '100px',
    height: '100px',
    background: '#f8fafc',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#718096',
    border: '2px solid #e2e8f0',
  },
  emptyTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#1a365d',
    margin: '0 0 8px 0',
  },
  emptyText: {
    fontSize: '15px',
    color: '#718096',
    margin: 0,
    maxWidth: '280px',
  },
  footer: {
    marginTop: '28px',
    textAlign: 'center',
    color: '#718096',
    fontSize: '13px',
  },
  requirementsCard: {
    background: '#fff',
    borderRadius: '16px',
    border: '2px solid #e2e8f0',
    padding: '24px',
    marginBottom: '24px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
  },
  requirementsHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    marginBottom: '20px',
    paddingBottom: '16px',
    borderBottom: '1px solid #e2e8f0',
  },
  requirementsIcon: {
    width: '48px',
    height: '48px',
    background: '#edf2f7',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#1a365d',
  },
  requirementsTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#1a365d',
    margin: '0 0 4px 0',
  },
  requirementsSubtitle: {
    fontSize: '14px',
    color: '#718096',
    margin: 0,
  },
  requirementsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  requirementItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    padding: '12px 16px',
    background: '#f8fafc',
    borderRadius: '10px',
    border: '1px solid #e2e8f0',
    fontSize: '14px',
    color: '#2d3748',
    lineHeight: '1.5',
  },
  requirementCheckbox: {
    color: '#1a365d',
    fontSize: '16px',
    fontWeight: '600',
    flexShrink: 0,
  },
};