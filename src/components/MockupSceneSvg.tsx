import React, { useRef, useState } from 'react';
import { SceneConfig, WidgetTransform } from '../types';
import { PhoneSvg } from './svg/PhoneSvg';
import { PostCardSvg } from './svg/PostCardSvg';

interface MockupSceneSvgProps {
  sceneConfig: SceneConfig;
  onUpdateTransform: (slotId: string, transform: WidgetTransform) => void;
  onSelectSlot: (slotId: string) => void;
  onDragEnd?: () => void;
  selectedSlotId: string | null;
  phoneImage: string | null;
  svgRef?: React.RefObject<SVGSVGElement | null>;
}

export const MockupSceneSvg: React.FC<MockupSceneSvgProps> = ({
  sceneConfig,
  onUpdateTransform,
  onSelectSlot,
  onDragEnd,
  selectedSlotId,
  phoneImage,
  svgRef: externalSvgRef,
}) => {
  const internalSvgRef = useRef<SVGSVGElement | null>(null);
  const svgRef = externalSvgRef || internalSvgRef;

  const [draggingSlot, setDraggingSlot] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState<{ mouseX: number; mouseY: number; initialX: number; initialY: number } | null>(null);

  const {
    width,
    height,
    backgroundType,
    backgroundColor,
    backgroundColor2,
    gradientAngle,
    shadowEnabled,
    lightAngle,
    shadowDistance,
    shadowIntensity,
    shadowSoftness,
    phoneTransform,
    cards,
    profile,
  } = sceneConfig;

  // Background style
  const renderBackground = () => {
    if (backgroundType === 'linear-gradient') {
      return (
        <rect
          x="0"
          y="0"
          width={width}
          height={height}
          fill="url(#scene-linear-gradient)"
        />
      );
    }
    if (backgroundType === 'radial-gradient') {
      return (
        <rect
          x="0"
          y="0"
          width={width}
          height={height}
          fill="url(#scene-radial-gradient)"
        />
      );
    }
    return (
      <rect
        x="0"
        y="0"
        width={width}
        height={height}
        fill={backgroundColor}
      />
    );
  };

  // Convert client coordinate to SVG viewBox coordinate
  const getSvgCoordinates = (clientX: number, clientY: number) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const svg = svgRef.current;
    const pt = svg.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    const ctm = svg.getScreenCTM();
    if (ctm) {
      const transformed = pt.matrixTransform(ctm.inverse());
      return { x: transformed.x, y: transformed.y };
    }
    return { x: clientX, y: clientY };
  };

  const handlePointerDown = (slotId: string, e: React.PointerEvent) => {
    e.stopPropagation();
    onSelectSlot(slotId);

    const coords = getSvgCoordinates(e.clientX, e.clientY);
    let initialX = 0;
    let initialY = 0;

    if (slotId === 'phone') {
      initialX = phoneTransform.x;
      initialY = phoneTransform.y;
    } else {
      const card = cards.find(c => c.id === slotId);
      if (card) {
        initialX = card.transform.x;
        initialY = card.transform.y;
      }
    }

    setDraggingSlot(slotId);
    setDragStart({
      mouseX: coords.x,
      mouseY: coords.y,
      initialX,
      initialY,
    });
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!draggingSlot || !dragStart) return;
    const coords = getSvgCoordinates(e.clientX, e.clientY);
    const dx = coords.x - dragStart.mouseX;
    const dy = coords.y - dragStart.mouseY;

    if (draggingSlot === 'phone') {
      onUpdateTransform('phone', {
        ...phoneTransform,
        x: Math.round(dragStart.initialX + dx),
        y: Math.round(dragStart.initialY + dy),
      });
    } else {
      const card = cards.find(c => c.id === draggingSlot);
      if (card) {
        onUpdateTransform(draggingSlot, {
          ...card.transform,
          x: Math.round(dragStart.initialX + dx),
          y: Math.round(dragStart.initialY + dy),
        });
      }
    }
  };

  const handlePointerUp = () => {
    if (draggingSlot) {
      onDragEnd?.();
    }
    setDraggingSlot(null);
    setDragStart(null);
  };

  const handleBackgroundClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onSelectSlot('');
    }
  };

  // Directional Light & Shadow Calculation (360° Sun Angle)
  // Light angle theta: 0 = top, 90 = right, 180 = bottom, 270 = left, 315 = top-left
  const rad = (lightAngle * Math.PI) / 180;
  // Opposite vector for cast shadow
  const shadowDirX = -Math.sin(rad);
  const shadowDirY = Math.cos(rad);

  const D = shadowDistance;
  const dxFar = (shadowDirX * D * 1.1).toFixed(1);
  const dyFar = (shadowDirY * D * 1.1).toFixed(1);

  const dxMid = (shadowDirX * D * 0.55).toFixed(1);
  const dyMid = (shadowDirY * D * 0.55).toFixed(1);

  const dxClose = (shadowDirX * D * 0.2).toFixed(1);
  const dyClose = (shadowDirY * D * 0.2).toFixed(1);

  const blurPrimary = Math.round(shadowSoftness * 0.95);
  const blurSecondary = Math.round(shadowSoftness * 0.45);
  const blurContact = Math.round(shadowSoftness * 0.15);

  const shadowMult = shadowEnabled ? shadowIntensity : 0;
  const phoneShadowOpacity1 = (0.17 * shadowMult).toFixed(3);
  const phoneShadowOpacity2 = (0.12 * shadowMult).toFixed(3);
  const phoneShadowOpacity3 = (0.07 * shadowMult).toFixed(3);

  const cardShadowOpacity1 = (0.16 * shadowMult).toFixed(3);
  const cardShadowOpacity2 = (0.10 * shadowMult).toFixed(3);

  const phoneFilterId = shadowEnabled ? "phone-drop-shadow" : undefined;
  const cardFilterId = shadowEnabled ? "card-drop-shadow" : undefined;

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="xMidYMid meet"
      className="w-full h-full block drop-shadow-2xl select-none"
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onClick={handleBackgroundClick}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Gradients */}
        <linearGradient
          id="scene-linear-gradient"
          x1="0%"
          y1="0%"
          x2={`${Math.cos((gradientAngle * Math.PI) / 180) * 100}%`}
          y2={`${Math.sin((gradientAngle * Math.PI) / 180) * 100}%`}
        >
          <stop offset="0%" stopColor={backgroundColor} />
          <stop offset="100%" stopColor={backgroundColor2} />
        </linearGradient>

        <radialGradient id="scene-radial-gradient" cx="50%" cy="40%" r="65%">
          <stop offset="0%" stopColor={backgroundColor} />
          <stop offset="100%" stopColor={backgroundColor2} />
        </radialGradient>

        {/* Dynamic 360-degree Directional Studio Drop Shadows */}
        <filter id="phone-drop-shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx={dxFar} dy={dyFar} stdDeviation={blurPrimary} floodColor="#000000" floodOpacity={phoneShadowOpacity1} />
          <feDropShadow dx={dxMid} dy={dyMid} stdDeviation={blurSecondary} floodColor="#000000" floodOpacity={phoneShadowOpacity2} />
          <feDropShadow dx={dxClose} dy={dyClose} stdDeviation={blurContact} floodColor="#000000" floodOpacity={phoneShadowOpacity3} />
        </filter>

        <filter id="card-drop-shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx={dxFar} dy={dyFar} stdDeviation={blurPrimary} floodColor="#000000" floodOpacity={cardShadowOpacity1} />
          <feDropShadow dx={dxMid} dy={dyMid} stdDeviation={blurSecondary} floodColor="#000000" floodOpacity={cardShadowOpacity2} />
        </filter>
      </defs>

      {/* 1. Canvas Background */}
      {renderBackground()}

      {/* 2. Dynamic Layer-Ordered Widgets (rendered from back to front) */}
      {(sceneConfig.layerOrder && sceneConfig.layerOrder.length === 5
        ? sceneConfig.layerOrder
        : ['card-1', 'card-2', 'card-3', 'card-4', 'phone']
      ).map((slotId) => {
        if (slotId === 'phone') {
          return (
            <g
              key="phone"
              onPointerDown={(e) => handlePointerDown('phone', e)}
              className="transition-opacity"
            >
              <PhoneSvg
                transform={phoneTransform}
                profile={profile}
                imageUrl={phoneImage}
                onSelectSlot={() => onSelectSlot('phone')}
                filterId={phoneFilterId}
                isInteractive={true}
                isSelected={selectedSlotId === 'phone'}
              />
            </g>
          );
        }

        const cardIdx = cards.findIndex((c) => c.id === slotId);
        const card = cards[cardIdx];
        if (!card) return null;

        return (
          <g
            key={card.id}
            onPointerDown={(e) => handlePointerDown(card.id, e)}
            className="transition-opacity"
          >
            <PostCardSvg
              id={card.id}
              cardIndex={cardIdx + 1}
              transform={card.transform}
              profile={profile}
              imageUrl={card.imageUrl}
              placeholderText={card.placeholderText}
              widgetType={card.widgetType}
              customText={card.customText}
              customAuthor={card.customAuthor}
              onSelectSlot={() => onSelectSlot(card.id)}
              filterId={cardFilterId}
              isSelected={selectedSlotId === card.id}
            />
          </g>
        );
      })}
    </svg>
  );
};
