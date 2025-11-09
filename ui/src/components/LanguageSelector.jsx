export function LanguageSelector({ currentLang, onLanguageChange }) {
  return (
    <div style={{
      position: 'absolute',
      top: '20px',
      right: '20px',
      zIndex: 100, // Increased from 5 to 100
      background: 'white',
      padding: '8px 12px',
      borderRadius: '6px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
    }}>
      <select
        value={currentLang}
        onChange={(e) => onLanguageChange(e.target.value)}
        style={{
          border: 'none',
          background: 'transparent',
          fontSize: '14px',
          cursor: 'pointer',
          outline: 'none',
        }}
      >
        <option value="en">ðŸ‡¬ðŸ‡§ English</option>
        <option value="pl">ðŸ‡µðŸ‡± Polski</option>
      </select>
    </div>
  );
}
