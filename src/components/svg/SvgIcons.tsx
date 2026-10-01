import React from 'react';

// Pure SVG vector icon paths for authentic Instagram UI
export const SvgHeart: React.FC<{ size?: number; fill?: string; stroke?: string; strokeWidth?: number }> = ({
  size = 18,
  fill = "none",
  stroke = "currentColor",
  strokeWidth = 2,
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
  </svg>
);

export const SvgComment: React.FC<{ size?: number; fill?: string; stroke?: string; strokeWidth?: number }> = ({
  size = 18,
  fill = "none",
  stroke = "currentColor",
  strokeWidth = 2,
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
  </svg>
);

export const SvgShare: React.FC<{ size?: number; fill?: string; stroke?: string; strokeWidth?: number }> = ({
  size = 18,
  fill = "none",
  stroke = "currentColor",
  strokeWidth = 2,
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="m22 2-7 20-4-9-9-4Z" />
    <path d="M22 2 11 13" />
  </svg>
);

export const SvgBookmark: React.FC<{ size?: number; fill?: string; stroke?: string; strokeWidth?: number }> = ({
  size = 18,
  fill = "none",
  stroke = "currentColor",
  strokeWidth = 2,
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
  </svg>
);

export const SvgMoreHorizontal: React.FC<{ size?: number; fill?: string }> = ({
  size = 18,
  fill = "currentColor",
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill}>
    <circle cx="12" cy="12" r="1.75" />
    <circle cx="19" cy="12" r="1.75" />
    <circle cx="5" cy="12" r="1.75" />
  </svg>
);

export const SvgMoreVertical: React.FC<{ size?: number; fill?: string }> = ({
  size = 18,
  fill = "currentColor",
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill}>
    <circle cx="12" cy="5" r="1.75" />
    <circle cx="12" cy="12" r="1.75" />
    <circle cx="12" cy="19" r="1.75" />
  </svg>
);

export const SvgHome: React.FC<{ size?: number; fill?: string; stroke?: string; strokeWidth?: number }> = ({
  size = 20,
  fill = "none",
  stroke = "currentColor",
  strokeWidth = 2,
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

export const SvgSearch: React.FC<{ size?: number; fill?: string; stroke?: string; strokeWidth?: number }> = ({
  size = 20,
  fill = "none",
  stroke = "currentColor",
  strokeWidth = 2.2,
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);

export const SvgPlusSquare: React.FC<{ size?: number; stroke?: string; strokeWidth?: number }> = ({
  size = 20,
  stroke = "currentColor",
  strokeWidth = 2,
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="18" x="3" y="3" rx="4" />
    <line x1="12" x2="12" y1="8" y2="16" />
    <line x1="8" x2="16" y1="12" y2="12" />
  </svg>
);

export const SvgReels: React.FC<{ size?: number; fill?: string; stroke?: string; strokeWidth?: number }> = ({
  size = 20,
  fill = "none",
  stroke = "currentColor",
  strokeWidth = 2,
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="4" />
    <path d="M10 8l6 4-6 4V8z" fill="currentColor" stroke="none" />
  </svg>
);

export const SvgMessenger: React.FC<{ size?: number; fill?: string; stroke?: string; strokeWidth?: number }> = ({
  size = 19,
  fill = "none",
  stroke = "currentColor",
  strokeWidth = 2,
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    <path d="m9 13 2.5-3 2.5 3 3-4" />
  </svg>
);
