import React from 'react';

const Header = () => {
  return (
    <header className="header">
      <div className="header-content">
        <div className="header-brand">
          <div className="neu-logo">
            <img 
              src="/images/northeastern-logo.png" 
              alt="Northeastern University" 
              className="neu-logo-img"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.parentNode.innerHTML = '<div class="logo-fallback">🎓</div>';
              }}
            />
          </div>
          
          <div className="header-title">
            <h1>Northeastern University Innovation Report</h1>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;