import React, { useState } from 'react';
import { WidgetTransform, MockupProfile } from '../../types';
import { SvgAvatar } from './SvgAvatar';
import {
  SvgHeart,
  SvgComment,
  SvgShare,
  SvgBookmark,
  SvgMoreVertical,
  SvgHome,
  SvgSearch,
  SvgPlusSquare,
  SvgReels,
} from './SvgIcons';

interface PhoneSvgProps {
  id?: string;
  transform: WidgetTransform;
  profile: MockupProfile;
  imageUrl: string | null;
  isLiked?: boolean;
  onToggleLike?: () => void;
  onSelectSlot?: () => void;
  onDropImage?: (file: File) => void;
  onDropAvatar?: (file: File) => void;
  filterId?: string;
  isInteractive?: boolean;
  isSelected?: boolean;
}

export const PHONE_BASE_WIDTH = 334;
export const PHONE_BASE_HEIGHT = 686;

export const PhoneSvg: React.FC<PhoneSvgProps> = ({
  id = 'main',
  transform,
  profile,
  imageUrl,
  isLiked = true,
  onToggleLike,
  onSelectSlot,
  onDropImage,
  onDropAvatar,
  filterId = "phone-drop-shadow",
  isInteractive = true,
  isSelected = false,
}) => {
  const [isPhotoDragOver, setIsPhotoDragOver] = useState(false);
  const [isAvatarDragOver, setIsAvatarDragOver] = useState(false);

  const { x, y, scale, rotation } = transform;
  const centerX = PHONE_BASE_WIDTH / 2;
  const centerY = PHONE_BASE_HEIGHT / 2;
  const screenClipId = `phone-screen-clip-${id}`;
  const photoClipId = `phone-photo-clip-${id}`;

  return (
    <g
      transform={`translate(${x}, ${y}) rotate(${rotation}, ${centerX}, ${centerY}) scale(${scale})`}
      style={{ cursor: isInteractive ? 'pointer' : 'default' }}
      className="group select-none"
    >
      <defs>
        <clipPath id={screenClipId}>
          <rect x="7" y="7" width="320" height="672" rx="42" />
        </clipPath>
        <clipPath id={photoClipId}>
          <rect x="18" y="118" width="298" height="414" rx="4" />
        </clipPath>
      </defs>

      {/* Realistic Shadow container */}
      <g filter={filterId ? `url(#${filterId})` : undefined}>
        {/* Outer Phone Aluminum Frame */}
        <rect
          x="0"
          y="0"
          width={PHONE_BASE_WIDTH}
          height={PHONE_BASE_HEIGHT}
          rx="48"
          fill="#E5E7EB"
          stroke="#D1D5DB"
          strokeWidth="1.5"
        />
        {/* Phone Side Buttons representation */}
        {/* Volume up / down */}
        <rect x="-2.5" y="125" width="2.5" height="38" rx="1.25" fill="#9CA3AF" />
        <rect x="-2.5" y="175" width="2.5" height="38" rx="1.25" fill="#9CA3AF" />
        {/* Power button */}
        <rect x={PHONE_BASE_WIDTH} y="150" width="2.5" height="56" rx="1.25" fill="#9CA3AF" />
      </g>

      {/* Selected Focus Outline */}
      {isSelected && (
        <rect
          data-selection-outline="true"
          className="widget-selection-outline"
          x="-3"
          y="-3"
          width={PHONE_BASE_WIDTH + 6}
          height={PHONE_BASE_HEIGHT + 6}
          rx="51"
          fill="none"
          stroke="#6366F1"
          strokeWidth="3"
        />
      )}

      {/* Inner Black Bezel */}
      <rect
        x="4"
        y="4"
        width={PHONE_BASE_WIDTH - 8}
        height={PHONE_BASE_HEIGHT - 8}
        rx="45"
        fill="#050505"
      />

      {/* Phone Screen Canvas */}
      <g clipPath={`url(#${screenClipId})`}>
        {/* Screen Background */}
        <rect x="7" y="7" width="320" height="672" fill="#FFFFFF" />

        {/* 1. iOS Status Bar */}
        <g>
          {/* Time */}
          <text
            x="38"
            y="32"
            fill="#111827"
            fontFamily="-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, sans-serif"
            fontSize="12.5"
            fontWeight="600"
            letterSpacing="-0.2px"
          >
            9:41
          </text>

          {/* Right Status Icons (Cellular, Wifi, Battery) */}
          <g transform="translate(254, 21)" fill="#111827">
            {/* Cellular signal bars */}
            <rect x="0" y="7.5" width="2.5" height="3.5" rx="0.6" />
            <rect x="3.8" y="5.5" width="2.5" height="5.5" rx="0.6" />
            <rect x="7.6" y="3" width="2.5" height="8" rx="0.6" />
            <rect x="11.4" y="0.5" width="2.5" height="10.5" rx="0.6" />

            {/* Wifi */}
            <g transform="translate(18, -1)">
              <path
                d="M1 3.5C3.8 0.8 8.2 0.8 11 3.5M3 5.8C4.8 4 7.2 4 9 5.8M5 8.2C5.6 7.6 6.4 7.6 7 8.2"
                fill="none"
                stroke="#111827"
                strokeWidth="1.3"
                strokeLinecap="round"
              />
              <circle cx="6" cy="10" r="0.9" fill="#111827" />
            </g>

            {/* Battery */}
            <g transform="translate(35, 0.5)">
              <rect x="0" y="0" width="18" height="9.5" rx="2.5" fill="none" stroke="#111827" strokeWidth="1.1" />
              <rect x="1.8" y="1.8" width="11" height="5.9" rx="1.4" fill="#111827" />
              <path d="M19 3v3.5" stroke="#111827" strokeWidth="1.1" strokeLinecap="round" />
            </g>
          </g>
        </g>

        {/* 2. Instagram Top App Header */}
        <g>
          {profile.headerTitle && profile.headerTitle.trim().length > 0 && (() => {
            const trimmed = profile.headerTitle.trim();
            // Estimate text width in Playfair Display 16.5px font:
            const textWidth = Math.round(trimmed.length * 7.6);
            // Center the combined block (text + 5px gap + 7px chevron) at horizontal center (167)
            const totalWidth = textWidth + 5 + 7;
            const startX = 167 - totalWidth / 2;
            const textCenter = startX + textWidth / 2;
            const chevronX = startX + textWidth + 5;

            return (
              <g>
                <text
                  x={textCenter}
                  y="65"
                  textAnchor="middle"
                  fill="#111827"
                  fontFamily="'Playfair Display', Georgia, 'Times New Roman', serif"
                  fontSize="16.5"
                  fontWeight="600"
                  fontStyle="italic"
                  letterSpacing="-0.3px"
                >
                  {trimmed}
                </text>
                {/* Chevron pointing downwards right after centered header title */}
                <path
                  d={`m${chevronX} 60.5 3.5 3.5 3.5-3.5`}
                  fill="none"
                  stroke="#111827"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
            );
          })()}

          {/* Activity Heart Icon (messenger arrow icon removed) */}
          <g transform="translate(284, 50)" className="text-neutral-800">
            <SvgHeart size={18} stroke="#111827" strokeWidth={1.8} />
          </g>
        </g>

        {/* 3. Instagram Post Header Row */}
        <g>
          {/* Interactive Drag & Drop Avatar Area */}
          <g
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
              e.dataTransfer.dropEffect = 'copy';
              setIsAvatarDragOver(true);
            }}
            onDragEnter={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsAvatarDragOver(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsAvatarDragOver(false);
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsAvatarDragOver(false);
              const files = e.dataTransfer.files;
              if (files && files[0] && files[0].type.startsWith('image/')) {
                onDropAvatar?.(files[0]);
              }
            }}
            className="cursor-pointer"
          >
            <SvgAvatar
              x={34}
              y={97}
              r={13}
              avatarUrl={profile.avatarUrl}
              monogram={profile.avatarMonogram}
              bgColor={profile.avatarBgColor}
              clipId="phone-post-avatar-clip"
            />
            {isAvatarDragOver && (
              <g>
                <circle
                  cx={34}
                  cy={97}
                  r={16}
                  fill="#4F46E5"
                  fillOpacity="0.4"
                  stroke="#6366F1"
                  strokeWidth="2.5"
                  strokeDasharray="4 3"
                />
                <g transform="translate(34, 126)">
                  <rect x="-35" y="-9" width="70" height="18" rx="9" fill="#0F172A" stroke="#818CF8" strokeWidth="1" />
                  <text x="0" y="4" textAnchor="middle" fill="#FFFFFF" fontSize="9" fontWeight="600">
                    + Лого
                  </text>
                </g>
              </g>
            )}
          </g>
          {/* Username */}
          <text
            x="54"
            y="101"
            fill="#1F2937"
            fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
            fontSize="12.5"
            fontWeight="600"
          >
            {profile.username}
          </text>
          {/* 3 dots */}
          <g transform="translate(295, 87)" fill="#4B5563">
            <SvgMoreVertical size={18} fill="#4B5563" />
          </g>
        </g>

        {/* 4. Portrait 9:16 Photo Content Area */}
        <g
          onClick={onSelectSlot}
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
            e.dataTransfer.dropEffect = 'copy';
            setIsPhotoDragOver(true);
          }}
          onDragEnter={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsPhotoDragOver(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsPhotoDragOver(false);
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsPhotoDragOver(false);
            const files = e.dataTransfer.files;
            if (files && files[0] && files[0].type.startsWith('image/')) {
              onDropImage?.(files[0]);
            }
          }}
          className="cursor-pointer transition-opacity hover:opacity-95"
        >
          {imageUrl ? (
            <g clipPath={`url(#${photoClipId})`}>
              <image
                href={imageUrl}
                x="18"
                y="118"
                width="298"
                height="414"
                preserveAspectRatio="xMidYMid slice"
              />
            </g>
          ) : (
            <g clipPath={`url(#${photoClipId})`}>
              <rect x="18" y="118" width="298" height="414" fill="#C2C6CA" />
              {/* Sharp Vector Typography Placeholder */}
              <text
                x="167"
                y="278"
                textAnchor="middle"
                fill="#FFFFFF"
                fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
                fontSize="23"
                fontWeight="700"
                letterSpacing="0.6px"
              >
                PLACE YOUR
              </text>
              <text
                x="167"
                y="310"
                textAnchor="middle"
                fill="#FFFFFF"
                fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
                fontSize="23"
                fontWeight="700"
                letterSpacing="0.6px"
              >
                PORTRAIT
              </text>
              <text
                x="167"
                y="342"
                textAnchor="middle"
                fill="#FFFFFF"
                fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
                fontSize="23"
                fontWeight="700"
                letterSpacing="0.6px"
              >
                PHOTO HERE
              </text>
              <text
                x="167"
                y="376"
                textAnchor="middle"
                fill="#FFFFFF"
                fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
                fontSize="20"
                fontWeight="600"
                letterSpacing="0.8px"
                opacity="0.95"
              >
                (9:16)
              </text>
            </g>
          )}

          {/* Interactive slot border hint */}
          <rect
            x="18"
            y="118"
            width="298"
            height="414"
            rx="4"
            fill="none"
            stroke="rgba(0,0,0,0.06)"
            strokeWidth="1"
          />

          {/* Drag & Drop Visual Overlay Indicator */}
          {isPhotoDragOver && (
            <g>
              <rect
                x="18"
                y="118"
                width="298"
                height="414"
                rx="6"
                fill="#4F46E5"
                fillOpacity="0.32"
                stroke="#6366F1"
                strokeWidth="3.5"
                strokeDasharray="8 6"
              />
              <g transform="translate(167, 325)">
                <rect x="-85" y="-20" width="170" height="40" rx="20" fill="#0F172A" stroke="#818CF8" strokeWidth="1.5" />
                <text x="0" y="5" textAnchor="middle" fill="#FFFFFF" fontSize="13" fontWeight="600">
                  + Відпустіть фото
                </text>
              </g>
            </g>
          )}
        </g>

        {/* 5. Post Action Row (Heart, Comment, Share, Bookmark) */}
        <g transform="translate(19, 542)">
          {/* Heart icon - red filled when isLiked, outline otherwise */}
          <g
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              onToggleLike?.();
            }}
            className="cursor-pointer transition-transform hover:scale-115 active:scale-90"
            style={{ cursor: 'pointer' }}
          >
            <SvgHeart
              size={19}
              fill={isLiked ? "#ED4956" : "none"}
              stroke={isLiked ? "#ED4956" : "#262626"}
              strokeWidth={isLiked ? 1 : 1.8}
            />
          </g>
          <g transform="translate(28, 0)">
            <SvgComment size={19} stroke="#262626" strokeWidth={1.8} />
          </g>
          <g transform="translate(56, 0)">
            <SvgShare size={19} stroke="#262626" strokeWidth={1.8} />
          </g>
          <g transform="translate(276, 0)">
            <SvgBookmark size={19} stroke="#262626" strokeWidth={1.8} />
          </g>
        </g>

        {/* 6. Post Likes and Caption */}
        <g transform="translate(20, 574)">
          <text
            x="0"
            y="0"
            fill="#111827"
            fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
            fontSize="11.5"
            fontWeight="700"
          >
            {profile.likesCount || "726 likes"}
          </text>

          {/* Caption with bold username subtleflowco */}
          {(() => {
            const uname = profile.username.replace('@', '');
            const raw = (profile.caption || '').replace(/\blemockup\b/gi, uname);
            const startsWithUname = raw.toLowerCase().startsWith(uname.toLowerCase());
            const body = startsWithUname ? raw.slice(uname.length).trim() : raw;
            const line1 = body.length > 34 ? body.slice(0, 34) : body;
            const line2 = body.length > 34 ? body.slice(34, 76) : '';

            return (
              <>
                <text
                  x="0"
                  y="14"
                  fill="#262626"
                  fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
                  fontSize="10.5"
                >
                  <tspan fontWeight="700" fill="#111827">{uname} </tspan>
                  <tspan fontWeight="400">{line1}</tspan>
                </text>
                {line2 && (
                  <text
                    x="0"
                    y="26"
                    fill="#262626"
                    fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
                    fontSize="10.5"
                    fontWeight="400"
                  >
                    {line2}
                  </text>
                )}
                <text
                  x="0"
                  y={line2 ? 38 : 26}
                  fill="#8E8E93"
                  fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
                  fontSize="10"
                  fontWeight="400"
                >
                  ...more
                </text>
              </>
            );
          })()}
        </g>

        {/* 7. Bottom Navigation Bar */}
        <g transform="translate(0, 620)">
          {/* Subtle top border */}
          <line x1="0" y1="0" x2={PHONE_BASE_WIDTH} y2="0" stroke="#F0F0F0" strokeWidth="1" />

          {/* Icons spaced evenly */}
          <g transform="translate(24, 7)">
            <SvgHome size={20} stroke="#111827" strokeWidth={1.9} />
          </g>
          <g transform="translate(86, 7)">
            <SvgSearch size={20} stroke="#111827" strokeWidth={1.9} />
          </g>
          <g transform="translate(150, 7)">
            <SvgPlusSquare size={20} stroke="#111827" strokeWidth={1.9} />
          </g>
          <g transform="translate(214, 7)">
            <SvgReels size={20} stroke="#111827" strokeWidth={1.9} />
          </g>
          {/* Mini profile avatar */}
          <g
            transform="translate(286, 17)"
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
              e.dataTransfer.dropEffect = 'copy';
              setIsAvatarDragOver(true);
            }}
            onDragEnter={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsAvatarDragOver(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsAvatarDragOver(false);
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsAvatarDragOver(false);
              const files = e.dataTransfer.files;
              if (files && files[0] && files[0].type.startsWith('image/')) {
                onDropAvatar?.(files[0]);
              }
            }}
            className="cursor-pointer"
          >
            <SvgAvatar
              x={0}
              y={0}
              r={9.5}
              avatarUrl={profile.avatarUrl}
              monogram={profile.avatarMonogram}
              bgColor={profile.avatarBgColor}
              clipId="phone-bottom-avatar-clip"
            />
          </g>

          {/* iOS Home Indicator Bar */}
          <rect
            x="108"
            y="42"
            width="118"
            height="4"
            rx="2"
            fill="#111827"
          />
        </g>

        {/* Dynamic Island Pill (placed on top of everything inside screen) */}
        <g transform="translate(122, 12)">
          <rect x="0" y="0" width="90" height="25" rx="12.5" fill="#000000" />
          {/* Subtle front camera reflection lens */}
          <circle cx="73" cy="12.5" r="4.5" fill="#0E1219" />
          <circle cx="74" cy="11.5" r="1.5" fill="#202A3C" opacity="0.6" />
          {/* Sensor pill */}
          <circle cx="25" cy="12.5" r="2.8" fill="#07090C" />
        </g>
      </g>
    </g>
  );
};
