import React, { useState, useEffect, useRef } from 'react';
import { Volume2, Activity, Radio, AlertTriangle, Square, Gauge } from 'lucide-react';
import { type SupportedLanguage } from '../i18n';

interface AcousticAudioTelemetryProps {
  currentLang: SupportedLanguage;
}

export const AcousticAudioTelemetry: React.FC<AcousticAudioTelemetryProps> = ({ currentLang }) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [selectedSound, setSelectedSound] = useState<'normal' | 'bearing' | 'belt' | 'valve'>('bearing');

  // Interactive Sensor Simulator State
  const [simRpm, setSimRpm] = useState<number>(1480);
  const [simLoad, setSimLoad] = useState<number>(85);

  // Derived telemetry calculations
  const simTemp = Math.round(55 + (simRpm / 2200) * 35 + (simLoad / 100) * 15);
  const simVibration = Number((1.8 + (simRpm / 2200) * 4.5 + (simLoad / 100) * 2.2).toFixed(1));
  const isAlarm = simTemp > 85 || simVibration > 4.5;

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  // Sound Synthesis using Web Audio API
  const startSound = (type: 'normal' | 'bearing' | 'belt' | 'valve') => {
    stopSound();

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      audioContextRef.current = ctx;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      if (type === 'normal') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(120, ctx.currentTime); // 120Hz smooth motor hum
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
      } else if (type === 'bearing') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(340, ctx.currentTime); // harsh grinding harmonic
        gain.gain.setValueAtTime(0.18, ctx.currentTime);
      } else if (type === 'belt') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(680, ctx.currentTime); // high pitch squeal
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
      } else {
        // valve hissing (white noise simulation)
        osc.type = 'square';
        osc.frequency.setValueAtTime(850, ctx.currentTime);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
      }

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();

      oscillatorRef.current = osc;
      gainNodeRef.current = gain;
      setIsPlayingAudio(true);
    } catch (e) {
      console.warn('Web Audio synthesis error:', e);
    }
  };

  const stopSound = () => {
    if (oscillatorRef.current) {
      try {
        oscillatorRef.current.stop();
        oscillatorRef.current.disconnect();
      } catch (e) {}
      oscillatorRef.current = null;
    }
    if (audioContextRef.current) {
      try {
        audioContextRef.current.close();
      } catch (e) {}
      audioContextRef.current = null;
    }
    setIsPlayingAudio(false);
  };

  useEffect(() => {
    return () => {
      stopSound();
    };
  }, []);

  // Real-time Waveform Canvas Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let phase = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const w = canvas.width;
      const h = canvas.height;

      // Draw background frequency grid
      ctx.strokeStyle = 'rgba(226, 232, 240, 0.08)';
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 30) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }

      // Draw Waveform (Silver Platinum / Crimson Alarm)
      ctx.lineWidth = 2;
      ctx.strokeStyle = isAlarm ? '#f43f5e' : '#f1f5f9';
      ctx.beginPath();

      const baseFreq = isPlayingAudio ? (selectedSound === 'bearing' ? 8 : 4) : 2;
      const amp = isPlayingAudio ? (selectedSound === 'bearing' ? 32 : 22) : 10;

      for (let x = 0; x < w; x++) {
        const nx = x / w;
        const y =
          h / 2 +
          Math.sin(nx * Math.PI * baseFreq + phase) * amp +
          Math.sin(nx * Math.PI * 16 + phase * 2) * (isPlayingAudio ? 8 : 2);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Draw Bouncing Spectrogram Bars
      const barCount = 28;
      const barW = (w / barCount) - 3;
      for (let b = 0; b < barCount; b++) {
        const barH = isPlayingAudio
          ? Math.abs(Math.sin(phase * 1.5 + b * 0.4)) * (h * 0.7) + 8
          : 6 + Math.sin(phase + b) * 4;
        const bx = b * (barW + 3);
        const by = h - barH;

        const grad = ctx.createLinearGradient(bx, by, bx, h);
        grad.addColorStop(0, isAlarm ? '#f43f5e' : '#e2e8f0');
        grad.addColorStop(1, 'rgba(148, 163, 184, 0.12)');

        ctx.fillStyle = grad;
        ctx.fillRect(bx, by, barW, barH);
      }

      phase += isPlayingAudio ? 0.08 : 0.02;
      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [isPlayingAudio, selectedSound, isAlarm]);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.25rem', marginTop: '1.25rem' }}>
      {/* 1. Acoustic Frequency Spectrogram Panel */}
      <div className="modern-card">
        <div className="modern-card-header">
          <div className="card-heading-title">
            <Radio size={16} style={{ color: 'var(--primary-cyan)' }} />
            {currentLang === 'ml'
              ? 'മെഷീൻ സൗണ്ട് അനലൈസർ (Acoustic Spectrum)'
              : currentLang === 'ar'
              ? 'محلل الصوت والترددات الميكانيكية'
              : currentLang === 'ja'
              ? '音響スペクトログラム・周波数解析'
              : 'Acoustic Sound & Frequency Spectrogram'}
          </div>
          <span className="badge-confidence">FFT REAL-TIME</span>
        </div>

        <div className="modern-card-body">
          {/* Sound Sample Buttons */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.85rem' }}>
            <button
              className={`voice-rec-btn ${selectedSound === 'normal' ? 'recording' : ''}`}
              onClick={() => {
                setSelectedSound('normal');
                startSound('normal');
              }}
            >
              <Volume2 size={13} /> {currentLang === 'ml' ? 'നോർമൽ മോട്ടോർ ഹം' : 'Normal Motor (120Hz)'}
            </button>
            <button
              className={`voice-rec-btn ${selectedSound === 'bearing' ? 'recording' : ''}`}
              onClick={() => {
                setSelectedSound('bearing');
                startSound('bearing');
              }}
            >
              <AlertTriangle size={13} /> {currentLang === 'ml' ? 'ബെയറിങ് ഗ്രൈൻഡിങ് ശബ്ദം' : 'Bearing Fault (340Hz)'}
            </button>
            <button
              className={`voice-rec-btn ${selectedSound === 'belt' ? 'recording' : ''}`}
              onClick={() => {
                setSelectedSound('belt');
                startSound('belt');
              }}
            >
              <Activity size={13} /> {currentLang === 'ml' ? 'ബെൽറ്റ് ഫ്ലട്ടർ ശബ്ദം' : 'Belt Squeal (680Hz)'}
            </button>
            {isPlayingAudio && (
              <button
                className="btn-neutral-secondary"
                style={{ padding: '0.3rem 0.75rem', fontSize: '0.74rem' }}
                onClick={stopSound}
              >
                <Square size={12} /> {currentLang === 'ml' ? 'ഓഡിയോ നിർത്തുക' : 'Stop Audio'}
              </button>
            )}
          </div>

          {/* Canvas Waveform */}
          <canvas
            ref={canvasRef}
            width={480}
            height={130}
            style={{
              width: '100%',
              height: '130px',
              background: '#090a0f',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-card)'
            }}
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.6rem', fontSize: '0.74rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
            <span>SPECTRAL DOMAIN: 20 Hz - 2.4 kHz</span>
            <span style={{ color: isAlarm ? '#f43f5e' : 'var(--primary-cyan)', fontWeight: 700 }}>
              AI STATUS: {selectedSound === 'bearing' ? '⚠️ ANOMALOUS HARMONIC PEAK DETECTED' : 'NORMAL HARMONIC'}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Interactive Sensor & Telemetry Simulator */}
      <div className="modern-card">
        <div className="modern-card-header">
          <div className="card-heading-title">
            <Gauge size={16} style={{ color: 'var(--primary-cyan)' }} />
            {currentLang === 'ml'
              ? 'തത്സമയ സെൻസർ സിമുലേറ്റർ (Live Sensor Telemetry)'
              : currentLang === 'ar'
              ? 'محاكي الحساسات والبيانات الحية'
              : currentLang === 'ja'
              ? 'リアルタイムセンサーシミュレーター'
              : 'Live Sensor Telemetry Simulator'}
          </div>
          {isAlarm && (
            <span className="badge-confidence" style={{ background: 'rgba(244, 63, 94, 0.2)', color: '#fecdd3', border: '1px solid #f43f5e' }}>
              CRITICAL ALARM
            </span>
          )}
        </div>

        <div className="modern-card-body">
          {/* Sliders */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div className="field-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600 }}>
                <span>{currentLang === 'ml' ? 'മെഷീൻ ആർ.പി.എം (Operating RPM)' : 'Operating RPM'}:</span>
                <strong style={{ color: 'var(--primary-cyan)', fontFamily: 'var(--font-mono)' }}>{simRpm} RPM</strong>
              </div>
              <input
                type="range"
                min="800"
                max="2200"
                step="50"
                value={simRpm}
                onChange={(e) => setSimRpm(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--primary-cyan)', cursor: 'pointer' }}
              />
            </div>

            <div className="field-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600 }}>
                <span>{currentLang === 'ml' ? 'പ്ലാന്റ് ലോഡ് (Plant Load)' : 'Load Percentage'}:</span>
                <strong style={{ color: 'var(--primary-cyan)', fontFamily: 'var(--font-mono)' }}>{simLoad}%</strong>
              </div>
              <input
                type="range"
                min="40"
                max="125"
                step="5"
                value={simLoad}
                onChange={(e) => setSimLoad(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--primary-cyan)', cursor: 'pointer' }}
              />
            </div>
          </div>

          {/* Dynamic Calculated Gauges */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.65rem', marginTop: '0.85rem' }}>
            <div style={{ background: '#090a0f', padding: '0.65rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-card)', textAlign: 'center' }}>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Bearing Temp</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: simTemp > 85 ? '#f43f5e' : '#34d399', fontFamily: 'var(--font-mono)' }}>
                {simTemp}°C
              </div>
            </div>

            <div style={{ background: '#090a0f', padding: '0.65rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-card)', textAlign: 'center' }}>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Vibration</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: simVibration > 4.5 ? '#f59e0b' : '#34d399', fontFamily: 'var(--font-mono)' }}>
                {simVibration} mm/s
              </div>
            </div>

            <div style={{ background: '#090a0f', padding: '0.65rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-card)', textAlign: 'center' }}>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Power Draw</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f1f5f9', fontFamily: 'var(--font-mono)' }}>
                {Math.round(45 + (simLoad / 100) * 105)} kW
              </div>
            </div>
          </div>

          {/* ISO-10816 Machine Vibration Severity Band */}
          <div style={{ marginTop: '0.85rem', padding: '0.65rem 0.85rem', background: '#090a0f', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-card)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem', fontSize: '0.74rem' }}>
              <span style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>ISO 10816-3 SEVERITY STATUS:</span>
              <span style={{
                fontWeight: 800,
                color: simVibration <= 2.8 ? '#34d399' : simVibration <= 4.5 ? '#cbd5e1' : simVibration <= 7.1 ? '#fbbf24' : '#f43f5e'
              }}>
                {simVibration <= 2.8 ? 'ZONE A (GOOD)' : simVibration <= 4.5 ? 'ZONE B (ACCEPTABLE)' : simVibration <= 7.1 ? 'ZONE C (ALERT / CHECK REQUIRED)' : 'ZONE D (DANGER / SHUTDOWN)'}
              </span>
            </div>
            {/* Visual Risk Bar */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px', height: '6px', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ background: '#10b981', opacity: simVibration <= 2.8 ? 1 : 0.35 }} />
              <div style={{ background: '#94a3b8', opacity: simVibration > 2.8 && simVibration <= 4.5 ? 1 : 0.35 }} />
              <div style={{ background: '#f59e0b', opacity: simVibration > 4.5 && simVibration <= 7.1 ? 1 : 0.35 }} />
              <div style={{ background: '#f43f5e', opacity: simVibration > 7.1 ? 1 : 0.35 }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
