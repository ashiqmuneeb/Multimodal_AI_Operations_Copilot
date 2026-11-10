import React from 'react';

interface SynapseLogoProps {
  size?: number;
  className?: string;
  glow?: boolean;
}

export const SynapseLogo: React.FC<SynapseLogoProps> = ({
  size = 28,
  className = '',
  glow = true
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}
      aria-label="SYNAPSE OPS Logo"
    >
      <defs>
        {/* Jet Black Core Hull Gradient */}
        <linearGradient id="synapse-comp-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#14171d" />
          <stop offset="50%" stopColor="#0A0A0A" />
          <stop offset="100%" stopColor="#050608" />
        </linearGradient>

        {/* Cerulean Blue to Red Metallic Rim */}
        <linearGradient id="synapse-comp-rim" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#007BA7" />
          <stop offset="45%" stopColor="#00a2db" />
          <stop offset="80%" stopColor="#EF4444" />
          <stop offset="100%" stopColor="#007BA7" />
        </linearGradient>

        {/* Diagnostic Waveform: Cerulean Blue surging into Red */}
        <linearGradient id="synapse-comp-pulse" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#007BA7" />
          <stop offset="35%" stopColor="#00a2db" />
          <stop offset="70%" stopColor="#EF4444" />
          <stop offset="100%" stopColor="#EF4444" />
        </linearGradient>

        {/* Ambient Radial Core Glow */}
        <radialGradient id="synapse-comp-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#007BA7" stopOpacity="0.45" />
          <stop offset="65%" stopColor="#EF4444" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#0A0A0A" stopOpacity="0" />
        </radialGradient>

        {/* Red / Cerulean Glow Filter */}
        {glow && (
          <filter id="synapse-comp-neon" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="1.6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        )}
      </defs>

      {/* Ambient Lighting */}
      <circle cx="32" cy="32" r="28" fill="url(#synapse-comp-glow)" />

      {/* Industrial Hexagonal Shield Outer Hull */}
      <path
        d="M32 5 L55 18 V46 L32 59 L9 46 V18 Z"
        fill="url(#synapse-comp-bg)"
        stroke="url(#synapse-comp-rim)"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />

      {/* Industrial Circuit Guidelines */}
      <path
        d="M32 9 V22 M16 43 L26 35 M48 43 L38 35"
        stroke="#161c24"
        strokeWidth="1.75"
        strokeLinecap="round"
      />

      {/* Synapse Connection Lattice (Dashed) */}
      <line x1="32" y1="16" x2="32" y2="32" stroke="#007BA7" strokeWidth="1.2" strokeDasharray="2 2" opacity="0.75" />
      <line x1="20" y1="45" x2="32" y2="32" stroke="#007BA7" strokeWidth="1.2" strokeDasharray="2 2" opacity="0.75" />
      <line x1="44" y1="45" x2="32" y2="32" stroke="#EF4444" strokeWidth="1.2" strokeDasharray="2 2" opacity="0.75" />

      {/* Real-time Telemetry / Vibration Diagnostics Waveform */}
      {/* Waveform Neon Glow Underlay */}
      <path
        d="M13 32 H22 L26 21 L32 43 L37 24 L42 32 H51"
        stroke="#EF4444"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.35"
        filter={glow ? 'url(#synapse-comp-neon)' : undefined}
      />
      {/* Crisp Foreground Waveform */}
      <path
        d="M13 32 H22 L26 21 L32 43 L37 24 L42 32 H51"
        stroke="url(#synapse-comp-pulse)"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Synaptic Orbital Nodes */}
      {/* Top Node (Cerulean Blue) */}
      <circle cx="32" cy="16" r="3.2" fill="#007BA7" filter={glow ? 'url(#synapse-comp-neon)' : undefined} />
      <circle cx="32" cy="16" r="5.5" stroke="#00a2db" strokeWidth="1" opacity="0.6" />

      {/* Bottom Left Node (Cerulean Blue) */}
      <circle cx="20" cy="45" r="2.8" fill="#007BA7" />
      <circle cx="20" cy="45" r="5" stroke="#00a2db" strokeWidth="1" opacity="0.5" />

      {/* Bottom Right Node (Red) */}
      <circle cx="44" cy="45" r="2.8" fill="#EF4444" filter={glow ? 'url(#synapse-comp-neon)' : undefined} />
      <circle cx="44" cy="45" r="5" stroke="#EF4444" strokeWidth="1" opacity="0.5" />

      {/* Central Diagnostic Energy Pulse (Spark Core) */}
      <circle cx="32" cy="32" r="2.4" fill="#ffffff" filter={glow ? 'url(#synapse-comp-neon)' : undefined} />
    </svg>
  );
};

export default SynapseLogo;
