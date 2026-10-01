import React from 'react';
import { WidgetTransform, MockupProfile } from '../../types';
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
  onSelectSlot?: () => void;
  filterId?: string;
  isSelected?: boolean;
}

export const CARD_BASE_WIDTH = 270;
export const CARD_BASE_HEIGHT = 396;

export const PostCardSvg: React.FC<PostCardSvgProps> = ({
  id,
  cardIndex,
  transform,
  profile,
  imageUrl,
  placeholderText,
  onSelectSlot,
  filterId = "card-drop-shadow",
  isSelected = false,
}) => {
  const { x, y, scale, rotation } = transform;
  const centerX = CARD_BASE_WIDTH / 2;
  const centerY = CARD_BASE_HEIGHT / 2;

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
          <rect x="12" y="44" width="246" height="308" rx="4" />
        </clipPath>
      </defs>

      {/* Realistic Multi-Tier Drop Shadow */}
      {filterId && (
        <rect
          x="0"
          y="0"
          width={CARD_BASE_WIDTH}
          height={CARD_BASE_HEIGHT}
          rx="14"
          fill="#FFFFFF"
          filter={`url(#${filterId})`}
        />
      )}

      {/* Card Border / Selection Highlight */}
      <rect
        x="0"
        y="0"
        width={CARD_BASE_WIDTH}
        height={CARD_BASE_HEIGHT}
        rx="14"
        fill="#FFFFFF"
        stroke={isSelected ? "#4F46E5" : "rgba(0,0,0,0.06)"}
        strokeWidth={isSelected ? 2.5 : 1}
      />

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
        <g>
          <SvgHeart size={18} stroke="#262626" strokeWidth={1.8} />
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
  );
};
