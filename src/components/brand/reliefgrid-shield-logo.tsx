"use client";

import { useId } from "react";

/**
 * Split-shield mark: crisis / warning (left) + food security (right).
 * Brand blues (#4978bc family) replace forest green on the shield.
 */
export function ReliefGridShieldLogo({ className }: { className?: string }) {
  const rid = useId().replace(/:/g, "");

  return (
    <svg
      className={className}
      viewBox="0 0 100 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <defs>
        <clipPath id={`${rid}-l`}>
          <rect x="0" y="0" width="50" height="120" />
        </clipPath>
        <clipPath id={`${rid}-r`}>
          <rect x="50" y="0" width="50" height="120" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${rid}-l)`}>
        <path
          d="M50 6C24 6 6 24 6 46L6 70C6 94 28 116 50 118C72 116 94 94 94 70L94 46C94 24 76 6 50 6Z"
          fill="#c25a35"
        />
        <path
          d="M26 20 L32 20 L29 32 L33 32 L24 48 L27 34 L22 34 Z"
          fill="#e8b84b"
          stroke="#2d2d2d"
          strokeWidth="0.35"
          strokeLinejoin="round"
        />
        <path d="M20 54 L40 54 L30 70 Z" fill="#e8b84b" stroke="#2d2d2d" strokeWidth="1" />
        <path
          d="M30 58 L30 65"
          stroke="#2d2d2d"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </g>
      <g clipPath={`url(#${rid}-r)`}>
        <path
          d="M50 6C24 6 6 24 6 46L6 70C6 94 28 116 50 118C72 116 94 94 94 70L94 46C94 24 76 6 50 6Z"
          fill="#2c4570"
        />
        <ellipse cx="70" cy="60" rx="14" ry="9" fill="#9ec5ef" stroke="#6b93c9" strokeWidth="0.8" />
        <path
          d="M64 54 Q66 46 68 42 M70 52 Q72 44 74 40"
          stroke="#d4e8fc"
          strokeWidth="1.1"
          strokeLinecap="round"
        />
        <path
          d="M80 48 L86 36 L86 72 L83 72 L83 44 L80 50"
          fill="#8eb4e8"
          stroke="#4978bc"
          strokeWidth="0.7"
          strokeLinejoin="round"
        />
      </g>
      <path
        d="M50 6C24 6 6 24 6 46L6 70C6 94 28 116 50 118C72 116 94 94 94 70L94 46C94 24 76 6 50 6Z"
        fill="none"
        stroke="rgba(45,45,45,0.4)"
        strokeWidth="1.1"
      />
      <line
        x1="50"
        y1="7"
        x2="50"
        y2="117"
        stroke="rgba(255,255,255,0.22)"
        strokeWidth="0.6"
      />
    </svg>
  );
}
