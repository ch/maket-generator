import React from 'react';
import { WidgetTransform, MockupProfile, WidgetType } from '../../types';
import { SvgAvatar } from './SvgAvatar';
import {
  SvgHeart,
  SvgComment,
  SvgShare,
  SvgBookmark,
  SvgMoreVertical,
} from './SvgIcons';

interface PostCardSvgProps {
  id: string;
  cardIndex: number;
  transform: WidgetTransform;
  profile: MockupProfile;
  imageUrl: string | null;
  placeholderText?: string;
  widgetType?: WidgetType;
  customText?: string;
  customAuthor?: string;
  isLiked?: boolean;
  onToggleLike?: () => void;
  onSelectSlot?: () => void;
  filterId?: string;
  isSelected?: boolean;
}

export const CARD_BASE_WIDTH = 270;
export const CARD_BASE_HEIGHT = 396;

export const getWidgetBaseDimensions = (type?: WidgetType): { width: number; height: number } => {
  switch (type) {
    case 'phone':
      return { width: 334, height: 686 };
    case 'story':
      return { width: 250, height: 444 };
    case 'quote':
      return { width: 280, height: 340 };
    case 'square':
      return { width: 280, height: 280 };
    case 'post':
    default:
      return { width: 270, height: 396 };
  }
};

export const PostCardSvg: React.FC<PostCardSvgProps> = ({
  id,
  cardIndex,
  transform,
  profile,
  imageUrl,
  placeholderText,
  widgetType = 'post',
  customText,
  customAuthor,
  isLiked = false,
  onToggleLike,
  onSelectSlot,
  filterId = "card-drop-shadow",
  isSelected = false,
}) => {
  const { width: baseW, height: baseH } = getWidgetBaseDimensions(widgetType);
  const { x, y, scale, rotation } = transform;
  const centerX = baseW / 2;
  const centerY = baseH / 2;

  const clipId = `card-image-clip-${id}`;
  const avatarClipId = `card-avatar-clip-${id}`;

  return (
    <g
      transform={`translate(${x}, ${y}) rotate(${rotation}, ${centerX}, ${centerY}) scale(${scale})`}
      className="select-none cursor-pointer transition-transform duration-75"
      onClick={onSelectSlot}
    >
      <defs>
        <clipPath id={clipId}>
          <rect
            x={widgetType === 'story' ? 8 : 12}
            y={widgetType === 'square' ? 12 : 44}
            width={baseW - (widgetType === 'story' ? 16 : 24)}
            height={
              widgetType === 'story'
                ? 345
                : widgetType === 'square'
                ? baseW - 68
                : 308
            }
            rx={widgetType === 'story' ? 8 : 4}
          />
        </clipPath>

        <linearGradient id={`story-ring-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F59E0B" />
          <stop offset="50%" stopColor="#EC4899" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>
      </defs>

      {/* Realistic Multi-Tier Drop Shadow */}
      {filterId && (
        <rect
          x="0"
          y="0"
          width={baseW}
          height={baseH}
          rx={widgetType === 'story' ? 18 : 14}
          fill="#FFFFFF"
          filter={`url(#${filterId})`}
        />
      )}

      {/* Card Base Container / Selection Highlight */}
      <rect
        x="0"
        y="0"
        width={baseW}
        height={baseH}
        rx={widgetType === 'story' ? 18 : 14}
        fill="#FFFFFF"
        stroke={isSelected ? "#4F46E5" : "rgba(0,0,0,0.06)"}
        strokeWidth={isSelected ? 2.5 : 1}
      />

      {/* ================= TYPE: QUOTE / TESTIMONIAL ================= */}
      {widgetType === 'quote' && (
        <g>
          {/* 5 Gold Stars Rating */}
          <g transform="translate(24, 28)">
            {[0, 1, 2, 3, 4].map((starIdx) => (
              <path
                key={starIdx}
                transform={`translate(${starIdx * 20}, 0) scale(0.75)`}
                d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                fill="#F59E0B"
              />
            ))}
          </g>

          {/* Decorative Quote Mark */}
          <text
            x="24"
            y="95"
            fill="#E0E7FF"
            fontFamily="Georgia, serif"
            fontSize="54"
            fontWeight="bold"
          >
            “
          </text>

          {/* Quote Text */}
          <g transform="translate(24, 98)">
            <text
              x="0"
              y="16"
              fill="#1F2937"
              fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
              fontSize="14.5"
              fontWeight="500"
              fontStyle="italic"
              letterSpacing="-0.2px"
            >
              {customText ? customText.slice(0, 32) : '«Неймовірна чіткість SVG,'}
            </text>
            <text
              x="0"
              y="40"
              fill="#1F2937"
              fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
              fontSize="14.5"
              fontWeight="500"
              fontStyle="italic"
              letterSpacing="-0.2px"
            >
              {customText && customText.length > 32
                ? customText.slice(32, 64)
                : 'ідеальні студійні тіні та'}
            </text>
            <text
              x="0"
              y="64"
              fill="#1F2937"
              fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
              fontSize="14.5"
              fontWeight="500"
              fontStyle="italic"
              letterSpacing="-0.2px"
            >
              {customText && customText.length > 64
                ? customText.slice(64, 96)
                : 'зручне керування шарами!»'}
            </text>
          </g>

          {/* Divider */}
          <line x1="24" y1="230" x2={baseW - 24} y2="230" stroke="#F3F4F6" strokeWidth="1.5" />

          {/* Author Footer */}
          <g transform="translate(24, 252)">
            <SvgAvatar
              x={18}
              y={18}
              r={18}
              avatarUrl={imageUrl || profile.avatarUrl}
              monogram={profile.avatarMonogram}
              bgColor={profile.avatarBgColor}
              clipId={avatarClipId}
            />
            <g transform="translate(46, 12)">
              <text
                x="0"
                y="6"
                fill="#111827"
                fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
                fontSize="13"
                fontWeight="700"
              >
                {customAuthor || profile.username}
              </text>
              <text
                x="0"
                y="22"
                fill="#6B7280"
                fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
                fontSize="11"
              >
                Verified Reviewer
              </text>
            </g>
          </g>
        </g>
      )}

      {/* ================= TYPE: STORIES 9:16 ================= */}
      {widgetType === 'story' && (
        <g>
          {/* Header */}
          <g transform="translate(14, 14)">
            {/* Story Gradient Ring */}
            <circle
              cx="13"
              cy="13"
              r="13.5"
              fill="none"
              stroke={`url(#story-ring-${id})`}
              strokeWidth="2"
            />
            <SvgAvatar
              x={13}
              y={13}
              r={10.5}
              avatarUrl={profile.avatarUrl}
              monogram={profile.avatarMonogram}
              bgColor={profile.avatarBgColor}
              clipId={avatarClipId}
            />
            <text
              x="34"
              y="16"
              fill="#1F2937"
              fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
              fontSize="11.5"
              fontWeight="600"
            >
              {profile.username}
            </text>
            <text
              x="130"
              y="16"
              fill="#9CA3AF"
              fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
              fontSize="11"
            >
              • 3h
            </text>
          </g>

          {/* Story Photo */}
          <g clipPath={`url(#${clipId})`}>
            {imageUrl ? (
              <image
                href={imageUrl}
                x="8"
                y="44"
                width="234"
                height="345"
                preserveAspectRatio="xMidYMid slice"
              />
            ) : (
              <g>
                <rect x="8" y="44" width="234" height="345" fill="#4B5563" />
                <text
                  x="125"
                  y="200"
                  textAnchor="middle"
                  fill="#FFFFFF"
                  fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
                  fontSize="18"
                  fontWeight="700"
                >
                  STORIES 9:16
                </text>
                <text
                  x="125"
                  y="225"
                  textAnchor="middle"
                  fill="#E5E7EB"
                  fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
                  fontSize="12"
                >
                  INSERT PHOTO
                </text>
              </g>
            )}
          </g>

          {/* Bottom Message Bar Pill */}
          <g transform="translate(10, 400)">
            <rect x="0" y="0" width="186" height="32" rx="16" fill="#F3F4F6" />
            <text
              x="14"
              y="20"
              fill="#9CA3AF"
              fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
              fontSize="11"
            >
              Надіслати повідомлення...
            </text>
            <g
              transform="translate(198, 6)"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                onToggleLike?.();
              }}
              className="cursor-pointer transition-transform hover:scale-115 active:scale-90"
              style={{ cursor: 'pointer' }}
            >
              <SvgHeart
                size={18}
                fill={isLiked ? "#ED4956" : "none"}
                stroke={isLiked ? "#ED4956" : "#4B5563"}
                strokeWidth={isLiked ? 1 : 1.8}
              />
            </g>
          </g>
        </g>
      )}

      {/* ================= TYPE: SQUARE 1:1 ================= */}
      {widgetType === 'square' && (
        <g>
          {/* Square Photo Content */}
          <g clipPath={`url(#${clipId})`}>
            {imageUrl ? (
              <image
                href={imageUrl}
                x="12"
                y="12"
                width={baseW - 24}
                height={baseW - 68}
                preserveAspectRatio="xMidYMid slice"
              />
            ) : (
              <g>
                <rect x="12" y="12" width={baseW - 24} height={baseW - 68} fill="#C2C6CA" />
                <text
                  x={baseW / 2}
                  y={110}
                  textAnchor="middle"
                  fill="#FFFFFF"
                  fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
                  fontSize="16"
                  fontWeight="700"
                >
                  SQUARE 1:1
                </text>
                <text
                  x={baseW / 2}
                  y={134}
                  textAnchor="middle"
                  fill="#E5E7EB"
                  fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
                  fontSize="12"
                >
                  {placeholderText || 'INSERT PHOTO'}
                </text>
              </g>
            )}
          </g>

          {/* Square Bottom Meta Bar */}
          <g transform={`translate(16, ${baseH - 42})`}>
            <SvgAvatar
              x={13}
              y={13}
              r={11}
              avatarUrl={profile.avatarUrl}
              monogram={profile.avatarMonogram}
              bgColor={profile.avatarBgColor}
              clipId={avatarClipId}
            />
            <text
              x="32"
              y="17"
              fill="#1F2937"
              fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
              fontSize="12"
              fontWeight="600"
            >
              {profile.username}
            </text>
            <g
              transform={`translate(${baseW - 56}, 4)`}
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                onToggleLike?.();
              }}
              className="cursor-pointer transition-transform hover:scale-115 active:scale-90"
              style={{ cursor: 'pointer' }}
            >
              <SvgHeart
                size={18}
                fill={isLiked ? "#ED4956" : "none"}
                stroke={isLiked ? "#ED4956" : "#262626"}
                strokeWidth={isLiked ? 1 : 1.8}
              />
            </g>
          </g>
        </g>
      )}

      {/* ================= TYPE: STANDARD POST (DEFAULT) ================= */}
      {(!widgetType || widgetType === 'post') && (
        <g>
          {/* 1. Card Header */}
          <g>
            <SvgAvatar
              x={26}
              y={22}
              r={11.5}
              avatarUrl={profile.avatarUrl}
              monogram={profile.avatarMonogram}
              bgColor={profile.avatarBgColor}
              clipId={avatarClipId}
            />
            {/* Username */}
            <text
              x="44"
              y="26"
              fill="#1F2937"
              fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
              fontSize="11.5"
              fontWeight="600"
            >
              {profile.username}
            </text>
            {/* Three dots menu */}
            <g transform="translate(244, 12)" fill="#6B7280">
              <SvgMoreVertical size={18} fill="#6B7280" />
            </g>
          </g>

          {/* 2. Card Content Area (Image or Placeholder) */}
          <g>
            {imageUrl ? (
              <g clipPath={`url(#${clipId})`}>
                <image
                  href={imageUrl}
                  x="12"
                  y="44"
                  width="246"
                  height="308"
                  preserveAspectRatio="xMidYMid slice"
                />
              </g>
            ) : (
              <g clipPath={`url(#${clipId})`}>
                <rect x="12" y="44" width="246" height="308" fill="#C2C6CA" />
                {/* SVG Crisp Typography */}
                <text
                  x="135"
                  y="180"
                  textAnchor="middle"
                  fill="#FFFFFF"
                  fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
                  fontSize="20.5"
                  fontWeight="700"
                  letterSpacing="0.4px"
                >
                  PLACEHOLDER -
                </text>
                <text
                  x="135"
                  y="208"
                  textAnchor="middle"
                  fill="#FFFFFF"
                  fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
                  fontSize="20.5"
                  fontWeight="700"
                  letterSpacing="0.4px"
                >
                  INSERT YOUR
                </text>
                <text
                  x="135"
                  y="236"
                  textAnchor="middle"
                  fill="#FFFFFF"
                  fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
                  fontSize="20.5"
                  fontWeight="700"
                  letterSpacing="0.4px"
                >
                  DESIGN OR IMAGE
                </text>
              </g>
            )}

            {/* Inner subtle border */}
            <rect
              x="12"
              y="44"
              width="246"
              height="308"
              rx="4"
              fill="none"
              stroke="rgba(0,0,0,0.06)"
              strokeWidth="1"
            />
          </g>

          {/* 3. Card Footer Action Bar */}
          <g transform="translate(14, 363)">
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
                size={18}
                fill={isLiked ? "#ED4956" : "none"}
                stroke={isLiked ? "#ED4956" : "#262626"}
                strokeWidth={isLiked ? 1 : 1.8}
              />
            </g>
            <g transform="translate(24, 0)">
              <SvgComment size={18} stroke="#262626" strokeWidth={1.8} />
            </g>
            <g transform="translate(48, 0)">
              <SvgShare size={18} stroke="#262626" strokeWidth={1.8} />
            </g>
            <g transform="translate(226, 0)">
              <SvgBookmark size={18} stroke="#262626" strokeWidth={1.8} />
            </g>
          </g>
        </g>
      )}
    </g>
  );
};
