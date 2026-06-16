"use client";

import React from "react";

interface FitnessLoaderProps {
  label?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function FitnessLoader({
  label = "Loading...",
  className = "",
  size = "md",
}: FitnessLoaderProps) {
  const sizeClasses = {
    sm: "w-16 h-16",
    md: "w-28 h-28",
    lg: "w-40 h-40",
  };

  return (
    <div className={`flex flex-col items-center justify-center p-6 text-center select-none ${className}`}>
      {/* Inline Styles for Stickman Animations */}
      <style jsx global>{`
        @keyframes pushup-body {
          0%, 100% {
            transform: rotate(0deg);
          }
          50% {
            transform: rotate(18deg);
          }
        }
        @keyframes pushup-arm {
          0%, 100% {
            d: path("M 70 80 L 70 65 L 70 50");
          }
          50% {
            d: path("M 70 80 L 60 76 L 76 69");
          }
        }
        @keyframes sweat-drop {
          0%, 45% {
            opacity: 0;
            transform: translate(75px, 47px) scale(0);
          }
          50% {
            opacity: 1;
            transform: translate(75px, 52px) scale(1);
          }
          65% {
            opacity: 0.8;
            transform: translate(76px, 72px) scale(0.8);
          }
          75%, 100% {
            opacity: 0;
            transform: translate(76px, 80px) scale(0);
          }
        }
        .stickman-body {
          animation: pushup-body 2s ease-in-out infinite;
        }
        .stickman-arm {
          animation: pushup-arm 2s ease-in-out infinite;
        }
        .stickman-sweat {
          animation: sweat-drop 2s ease-in-out infinite;
        }
      `}</style>

      {/* SVG Stickman */}
      <div className={`relative ${sizeClasses[size]}`}>
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full text-primary"
          fill="none"
          stroke="currentColor"
          strokeWidth="4.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Floor / Ground */}
          <line
            x1="10"
            y1="80"
            x2="90"
            y2="80"
            strokeWidth="3.5"
            className="text-muted-foreground/30"
          />

          {/* Bending Arms (handles pushup compression) */}
          <path
            d="M 70 80 L 70 65 L 70 50"
            className="stickman-arm text-primary"
          />

          {/* Rotating Torso & Head */}
          <g className="stickman-body" style={{ transformOrigin: "20px 80px" }}>
            {/* Main Body Line (from feet 20,80 to neck 70,50) */}
            <line x1="20" y1="80" x2="70" y2="50" />
            {/* Head */}
            <circle
              cx="75"
              cy="47"
              r="7.5"
              fill="currentColor"
              stroke="none"
            />
          </g>

          {/* Sweat Drop falling down from head */}
          <path
            d="M 0 0 C -1.5 2 -1.5 4 0 5 C 1.5 4 1.5 2 0 0 Z"
            fill="#3b82f6"
            stroke="none"
            className="stickman-sweat"
          />
        </svg>
      </div>

      {/* Pulsing Loading Label */}
      <p className="mt-4 text-sm font-semibold tracking-wide text-muted-foreground animate-pulse">
        {label}
      </p>
    </div>
  );
}
