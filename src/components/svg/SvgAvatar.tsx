import React from 'react';

interface SvgAvatarProps {
  x: number;
  y: number;
  r: number;
  avatarUrl?: string | null;
  monogram?: string;
  bgColor?: string;
  clipId: string;
}

export const SvgAvatar: React.FC<SvgAvatarProps> = ({
  x,
  y,
  r,
  avatarUrl,
  monogram = "S",
  bgColor = "#6A7B69", // elegant sage green matching the reference image
  clipId,
}) => {
  return (
    <g>
      <defs>
        <clipPath id={clipId}>
          <circle cx={x} cy={y} r={r} />
        </clipPath>
      </defs>

      {avatarUrl ? (
        <g clipPath={`url(#${clipId})`}>
          <circle cx={x} cy={y} r={r} fill="#E5E7EB" />
          <image
            href={avatarUrl}
            x={x - r}
            y={y - r}
            width={r * 2}
            height={r * 2}
            preserveAspectRatio="xMidYMid slice"
          />
        </g>
      ) : (
        <g>
          <circle cx={x} cy={y} r={r} fill={bgColor} />
          {/* Subtle inner highlight */}
          <circle cx={x} cy={y} r={r - 0.5} fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth={1} />
          <text
            x={x}
            y={y + r * 0.36}
            textAnchor="middle"
            fill="#FFFFFF"
            fontFamily="'Playfair Display', Georgia, 'Times New Roman', serif"
            fontSize={r * 1.15}
            fontWeight="600"
            fontStyle="italic"
            letterSpacing="-0.5px"
          >
            {monogram}
          </text>
        </g>
      )}
    </g>
  );
};
