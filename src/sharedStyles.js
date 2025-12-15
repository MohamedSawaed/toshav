// Shared styles for consistent design across all pages
export const colors = {
  primary: '#1a365d',
  primaryLight: '#2c5282',
  primaryDark: '#153e75',
  background: '#f8fafc',
  card: '#ffffff',
  text: '#1a365d',
  textLight: '#718096',
  border: '#e2e8f0',
  success: '#48bb78',
  error: '#e53e3e',
  accent: '#1a365d'
};

export const sharedStyles = {
  // Page container
  pageContainer: {
    minHeight: '100vh',
    background: colors.background,
    fontFamily: "'Segoe UI', 'Arial', sans-serif",
    direction: 'rtl'
  },

  // Header styles
  pageHeader: {
    background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryLight} 50%, ${colors.primaryDark} 100%)`,
    padding: '40px 24px',
    textAlign: 'center',
    position: 'relative'
  },

  pageTitle: {
    fontSize: 'clamp(24px, 5vw, 36px)',
    fontWeight: '800',
    color: '#fff',
    margin: '0 0 8px 0'
  },

  pageSubtitle: {
    fontSize: '16px',
    color: 'rgba(255,255,255,0.8)',
    margin: 0
  },

  // Card styles
  card: {
    background: colors.card,
    borderRadius: '16px',
    padding: '32px',
    border: `1px solid ${colors.border}`,
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
  },

  // Button styles
  buttonPrimary: {
    padding: '14px 28px',
    background: colors.primary,
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: `0 4px 12px rgba(26, 54, 93, 0.3)`
  },

  buttonSecondary: {
    padding: '14px 28px',
    background: 'transparent',
    color: colors.primary,
    border: `2px solid ${colors.border}`,
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },

  // Input styles
  input: {
    width: '100%',
    padding: '14px 18px',
    border: `2px solid ${colors.border}`,
    borderRadius: '10px',
    fontSize: '15px',
    outline: 'none',
    transition: 'all 0.2s ease',
    background: '#fff'
  },

  // Footer
  footer: {
    background: colors.primary,
    padding: '24px',
    textAlign: 'center'
  },

  footerText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: '14px',
    margin: 0
  }
};

// CSS-in-JS helper for hover states
export const getHoverStyles = (element) => ({
  onMouseEnter: (e) => {
    if (element === 'primaryButton') {
      e.currentTarget.style.background = colors.primaryLight;
      e.currentTarget.style.transform = 'translateY(-2px)';
    }
  },
  onMouseLeave: (e) => {
    if (element === 'primaryButton') {
      e.currentTarget.style.background = colors.primary;
      e.currentTarget.style.transform = 'translateY(0)';
    }
  }
});
