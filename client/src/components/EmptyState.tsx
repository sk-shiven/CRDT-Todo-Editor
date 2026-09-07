import React from 'react';

export const EmptyState: React.FC = () => {
  return (
    <div className="empty-state-wrapper animate-fade-in">
      <div className="empty-illustration-container">
        <svg
          width="130"
          height="100"
          viewBox="0 0 130 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Soft shadow ellipse */}
          <ellipse cx="65" cy="88" rx="46" ry="6" fill="#18191a" opacity="0.6" />

          {/* Top Left Pink / Coral Circular Badge */}
          <circle cx="48" cy="28" r="9" fill="#f28b82" />
          <path
            d="M45 28L47.5 30.5L51.5 26"
            stroke="#1e1f20"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Top Right Mint Green Pill Indicator */}
          <rect x="62" y="24" width="26" height="9" rx="4.5" fill="#81c995" />
          <line x1="67" y1="28.5" x2="81" y2="28.5" stroke="#1e1f20" strokeWidth="1.6" strokeLinecap="round" />

          {/* Yellow Head / Sun Circle */}
          <circle cx="51" cy="46" r="6" fill="#fdd663" />

          {/* Blue Body / Tasks Clipboard stylized shapes */}
          {/* Main blue silhouette */}
          <path
            d="M46 54C46 51 49 48 54 48H76C81 48 84 51 84 54V76C84 78 82 80 80 80H50C48 80 46 78 46 76V54Z"
            fill="#4285f4"
          />

          {/* Folded paper sheets & overlapping shapes */}
          <path
            d="M50 56C50 54 52 52 54 52H76C78 52 80 54 80 56V76C80 78 78 80 76 80H54C52 80 50 78 50 76V56Z"
            fill="#8ab4f8"
          />

          {/* Darker blue folded accent */}
          <path
            d="M56 60H74V63H56V60Z"
            fill="#1967d2"
            rx="1.5"
          />
          <path
            d="M56 67H70V70H56V67Z"
            fill="#1967d2"
            rx="1.5"
          />

          {/* Left angled arms/sheets in deep navy */}
          <path
            d="M44 60L49 55L53 78L45 74C43 73 42 70 44 60Z"
            fill="#174ea6"
          />

          {/* Right angled sheet */}
          <path
            d="M82 58L86 63C88 66 87 70 85 73L77 78L80 58H82Z"
            fill="#174ea6"
          />

          {/* Small checkmarks / list marks */}
          <circle cx="58" cy="74" r="1.5" fill="#ffffff" />
          <line x1="62" y1="74" x2="68" y2="74" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      </div>
      <h2 className="empty-state-title">No tasks yet</h2>
      <p className="empty-state-subtitle">
        Add your to-dos even when offline and keep track of them
      </p>
    </div>
  );
};
