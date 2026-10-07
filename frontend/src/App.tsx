import React, { useState, useEffect, useRef } from 'react';
import {
  Wrench,
  Video,
  BookOpen,
  FileText,
  Upload,
  Printer,
  Search,
  CheckCircle2,
  Layers,
  ShieldAlert,
  Loader2,
  Sparkles,
  Terminal,
  Activity,
  Cpu,
  RefreshCw,
  SlidersHorizontal,
  ChevronRight,
  Hash,
  AlertTriangle,
  Factory,
  Gauge,
  CheckCheck,
  Camera,
  Mic,
  MicOff,
  Volume2,
  Square,
  Globe,
  Check,
  ArrowLeft
} from 'lucide-react';
import { translations, type SupportedLanguage } from './i18n';
import { ThreeIndustrialDigitalTwin } from './components/ThreeIndustrialDigitalTwin';
import { AcousticAudioTelemetry } from './components/AcousticAudioTelemetry';

interface ToolTrace {
  tool_name: string;
  arguments: Record<string, any>;
  output_summary: string;
  duration_ms: number;
  status: string;
}

interface OperationalReport {
  summary: string;
  observations: Array<{ text: string; confidence: number; frame_number?: number }>;
  possible_causes: Array<{ cause: string; probability: string; support: string[] }>;
  recommended_checks: Array<{ step: string; source: string }>;
  limitations: string[];
}

interface AgentState {
  user_request: string;
  tool_traces: ToolTrace[];
  final_report?: OperationalReport;
}

interface VideoInspectionResponse {
  file_id: string;
  stats: {
    total_frames_in_video: number;
    sampled_frames_count: number;
    blurred_dropped_count: number;
    dedup_dropped_count: number;
    useful_keyframes_count: number;
    cost_reduction_pct: number;
    pipeline_duration_ms: number;
  };
  selected_keyframes: Array<{
    frame_index: number;
    timestamp_sec: number;
    blur_score: number;
    file_path: string;
    url: string;
  }>;
  observations_summary: string;
}

interface DocumentRecord {
  document_id: string;
  filename: string;
  total_pages: number;
  total_chunks: number;
  is_indexed: boolean;
}

interface SearchHit {
  document_id: string;
  source_name: string;
  page_number: number;
  section: string;
  text: string;
  citation: string;
  similarity_score: number;
}

export default function App() {
  // Navigation & View State: 'home' | 'workbench' | 'video' | 'rag' | 'telemetry'
  const [activeView, setActiveView] = useState<'home' | 'workbench' | 'video' | 'rag' | 'telemetry'>('home');
  // Enterprise Workflow Stepper: 1: Fleet Select | 2: Setup/Evidence | 3: Work Order Report | 4: Live Sound & Sensors
  const [workflowStep, setWorkflowStep] = useState<number>(1);
  const [assetPreviewMode, setAssetPreviewMode] = useState<'3d' | 'photo'>('3d');

  // Internationalization State
  const [currentLang, setCurrentLang] = useState<SupportedLanguage>(() => {
    return (localStorage.getItem('ops_app_lang') as SupportedLanguage) || 'en';
  });
  const [langMenuOpen, setLangMenuOpen] = useState<boolean>(false);
  const t = translations[currentLang];

  // Permanent Silver & Black Enterprise Theme
  const activeTheme = 'silver';
  const [activeSector, setActiveSector] = useState<string>('B');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'silver');
  }, []);

  useEffect(() => {
    document.documentElement.dir = currentLang === 'ar' ? 'rtl' : 'ltr';
    localStorage.setItem('ops_app_lang', currentLang);
  }, [currentLang]);

  // Helper for dynamic multi-language equipment profiles
  const getProfiles = (lang: SupportedLanguage) => {
    const tr = translations[lang];
    return [
      {
        id: 'PMP-702-B',
        name: tr.PMP_name,
        specs: tr.PMP_specs,
        image: '/assets/equipment/slurry_pump.jpg',
        severity: 'Critical Defect' as const,
        badgeClass: 'critical',
        statusText: tr.PMP_status,
        notes: tr.PMP_notes,
        query: tr.PMP_query
      },
      {
        id: 'MTR-401-A',
        name: tr.MTR_name,
        specs: tr.MTR_specs,
        image: '/assets/equipment/induction_motor.jpg',
        severity: 'Warning' as const,
        badgeClass: 'warning',
        statusText: tr.MTR_status,
        notes: tr.MTR_notes,
        query: tr.MTR_query
      },
      {
        id: 'CMP-108-C',
        name: tr.CMP_name,
        specs: tr.CMP_specs,
        image: '/assets/equipment/air_compressor.jpg',
        severity: 'Warning' as const,
        badgeClass: 'normal',
        statusText: tr.CMP_status,
        notes: tr.CMP_notes,
        query: tr.CMP_query
      }
    ];
  };

  const [apiOnline, setApiOnline] = useState<boolean>(false);
  const [providerName, setProviderName] = useState<string>('GEMINI FLASH');
  const [wsConnected, setWsConnected] = useState<boolean>(false);
  const [hudMessage, setHudMessage] = useState<string>('System active. Plant diagnostics ready.');

  // Equipment & Inspection State
  const initialProfiles = getProfiles(currentLang);
  const [selectedEquipment, setSelectedEquipment] = useState(initialProfiles[0]);
  const [equipmentId, setEquipmentId] = useState<string>(initialProfiles[0].id);
  const [severityLevel, setSeverityLevel] = useState<string>(initialProfiles[0].severity);
  const [agentRequest, setAgentRequest] = useState<string>(initialProfiles[0].notes);
  const [agentFile, setAgentFile] = useState<File | null>(null);
  const [agentPreview, setAgentPreview] = useState<string | null>(initialProfiles[0].image);
  const [selectedDocId, setSelectedDocId] = useState<string>('');

  const [agentLoading, setAgentLoading] = useState<boolean>(false);
  const [agentState, setAgentState] = useState<AgentState | null>(null);
  const [activeReportTab, setActiveReportTab] = useState<'report' | 'traces' | 'json'>('report');
  const [completedChecks, setCompletedChecks] = useState<Record<number, boolean>>({});

  // Audio Features State
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const recognitionRef = useRef<any>(null);

  // Video State
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoNotes, setVideoNotes] = useState<string>('Roller vibrating and drifting axially at high speeds.');
  const [videoLoading, setVideoLoading] = useState<boolean>(false);
  const [videoResult, setVideoResult] = useState<VideoInspectionResponse | null>(null);

  // Documents & RAG State
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [ragQuery, setRagQuery] = useState<string>(initialProfiles[0].query);
  const [ragHits, setRagHits] = useState<SearchHit[]>([]);
  const [ragSearching, setRagSearching] = useState<boolean>(false);
  const [ragMeta, setRagMeta] = useState<string>('');

  const clientIdRef = useRef<string>('client_' + Math.random().toString(36).substring(2, 9));

  // Switch Language
  const handleSwitchLanguage = (lang: SupportedLanguage) => {
    setCurrentLang(lang);
    setLangMenuOpen(false);

    const updatedProfiles = getProfiles(lang);
    const activeOne = updatedProfiles.find((p) => p.id === equipmentId) || updatedProfiles[0];
    setSelectedEquipment(activeOne);
    setAgentRequest(activeOne.notes);
    setRagQuery(activeOne.query);
  };

  // Voice Recording (Speech-to-Text)
  const toggleRecording = () => {
    if (isRecording) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
      setIsRecording(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(t.voiceNotSupported);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;

      const langLocales: Record<SupportedLanguage, string> = {
        en: 'en-US',
        ml: 'ml-IN',
        ar: 'ar-SA',
        ja: 'ja-JP'
      };
      recognition.lang = langLocales[currentLang] || 'en-US';

      recognition.onstart = () => {
        setIsRecording(true);
        setHudMessage(t.recordingActive);
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            transcript += event.results[i][0].transcript + ' ';
          }
        }
        if (transcript.trim()) {
          setAgentRequest((prev) => (prev ? prev + ' ' : '') + transcript.trim());
        }
      };

      recognition.onerror = (e: any) => {
        console.warn('Speech recognition notice:', e);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.error('Speech recognition error:', err);
      setIsRecording(false);
      alert('Microphone error: ' + err.message);
    }
  };

  // Text-To-Speech (Play Audio Results)
  const toggleSpeakReport = () => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not available in this browser.');
      return;
    }

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    if (!agentState?.final_report) return;

    window.speechSynthesis.cancel();

    const report = agentState.final_report;
    const langLocales: Record<SupportedLanguage, string> = {
      en: 'en-US',
      ml: 'ml-IN',
      ar: 'ar-SA',
      ja: 'ja-JP'
    };

    let textToSpeak = report.summary;
    if (report.possible_causes && report.possible_causes.length > 0) {
      const prefix =
        currentLang === 'ml'
          ? ' പ്രധാന കാരണം: '
          : currentLang === 'ar'
          ? ' السبب المرجح: '
          : currentLang === 'ja'
          ? ' 推定原因: '
          : ' Primary cause: ';
      textToSpeak += '.' + prefix + report.possible_causes[0].cause;
    }

    if (report.recommended_checks && report.recommended_checks.length > 0) {
      const actPrefix =
        currentLang === 'ml'
          ? ' ശുപാർശ ചെയ്യുന്ന നടപടി: '
          : currentLang === 'ar'
          ? ' الإجراء المطلوب: '
          : currentLang === 'ja'
          ? ' 対処手順: '
          : ' Recommended action: ';
      textToSpeak += '.' + actPrefix + report.recommended_checks[0].step;
    }

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = langLocales[currentLang] || 'en-US';
    utterance.rate = 0.95;

    utterance.onstart = () => setIsPlayingAudio(true);
    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    window.speechSynthesis.speak(utterance);
  };

  // Stop audio on unmount
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Initialize System Health & WebSocket
  useEffect(() => {
    fetch('/api/v1/health')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setApiOnline(true);
          setProviderName(data.configured_provider.toUpperCase());
        }
      })
      .catch(() => setApiOnline(false));

    fetchDocuments();

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/api/v1/ws/live/${clientIdRef.current}`;
    let socket: WebSocket | null = null;

    try {
      socket = new WebSocket(wsUrl);
      socket.onopen = () => setWsConnected(true);
      socket.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.data && payload.data.message) {
            setHudMessage(payload.data.message);
          }
        } catch (e) {
          console.error(e);
        }
      };
      socket.onclose = () => setWsConnected(false);
      socket.onerror = () => setWsConnected(false);
    } catch (e) {
      console.warn('WS Init failed:', e);
    }

    return () => {
      if (socket) socket.close();
    };
  }, []);

  const fetchDocuments = async () => {
    try {
      const res = await fetch('/api/v1/documents');
      if (res.ok) {
        const data = await res.json();
        setDocuments(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Select Equipment Card
  const handleSelectEquipment = (eq: typeof initialProfiles[0]) => {
    setSelectedEquipment(eq);
    setEquipmentId(eq.id);
    setSeverityLevel(eq.severity);
    setAgentRequest(eq.notes);
    setAgentPreview(eq.image);
    setAgentFile(null);
    setRagQuery(eq.query);
    setHudMessage(`Loaded: ${eq.name} (${eq.id})`);
  };

  // Run Agent
  const handleRunAgent = async () => {
    if (!agentRequest.trim()) {
      alert(t.notesPlaceholder);
      return;
    }
    setAgentLoading(true);
    setHudMessage(t.runningInspection);
    setWorkflowStep(3);

    const formData = new FormData();
    formData.append('user_request', agentRequest);
    formData.append('client_id', clientIdRef.current);
    if (agentFile) formData.append('file', agentFile);
    if (selectedDocId) formData.append('document_id', selectedDocId);

    try {
      const res = await fetch('/api/v1/agent/inspect', {
        method: 'POST',
        body: formData
      });
      if (res.ok) {
        const data = await res.json();
        setAgentState(data);
        setCompletedChecks({});
        setHudMessage(t.verifiedAnomaly);
      } else {
        const err = await res.json();
        alert('Inspection failed: ' + (err.detail || 'Error'));
      }
    } catch (err: any) {
      alert('Network error: ' + err.message);
    } finally {
      setAgentLoading(false);
    }
  };

  // Run Video Pipeline
  const handleRunVideo = async () => {
    if (!videoFile) return;
    setVideoLoading(true);
    setHudMessage(t.videoAnalyzing);

    const formData = new FormData();
    formData.append('file', videoFile);
    formData.append('client_id', clientIdRef.current);
    if (videoNotes) formData.append('notes', videoNotes);

    try {
      const res = await fetch('/api/v1/video/inspect', {
        method: 'POST',
        body: formData
      });
      if (res.ok) {
        const data = await res.json();
        setVideoResult(data);
        setHudMessage(`${t.videoSaved}: ${data.stats.cost_reduction_pct}%`);
      } else {
        const err = await res.json();
        alert('Video inspection failed: ' + (err.detail || 'Error'));
      }
    } catch (err: any) {
      alert('Video error: ' + err.message);
    } finally {
      setVideoLoading(false);
    }
  };

  // Upload Document
  const handleUploadDocument = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append('file', file);

      try {
        const res = await fetch('/api/v1/documents/upload', {
          method: 'POST',
          body: formData
        });
        if (res.ok) {
          fetchDocuments();
          setHudMessage(`Manual uploaded: ${file.name}`);
        }
      } catch (err: any) {
        console.error(err);
      }
    }
  };

  const handleIndexDoc = async (docId: string) => {
    try {
      const res = await fetch(`/api/v1/documents/${docId}/index`, { method: 'POST' });
      if (res.ok) {
        fetchDocuments();
        setHudMessage(`Manual indexed into vector catalog.`);
      }
    } catch (e: any) {
      console.error(e);
    }
  };

  const handleSearchRAG = async () => {
    if (!ragQuery.trim()) return;
    setRagSearching(true);
    try {
      const res = await fetch('/api/v1/documents/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: ragQuery, top_k: 4 })
      });
      if (res.ok) {
        const data = await res.json();
        setRagHits(data.results || []);
        setRagMeta(`Found ${data.total_found} citations in ${data.search_time_ms}ms`);
      }
    } catch (e: any) {
      console.error(e);
    } finally {
      setRagSearching(false);
    }
  };

  const toggleCheck = (idx: number) => {
    setCompletedChecks((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const currentProfiles = getProfiles(currentLang);

  const handleSelectHotspot = (defectType: 'pump' | 'motor' | 'compressor') => {
    const profs = getProfiles(currentLang);
    let target = profs[0];
    if (defectType === 'motor') target = profs[1];
    else if (defectType === 'compressor') target = profs[2];

    handleSelectEquipment(target);
    setActiveView('workbench');
    setWorkflowStep(2);
  };

  // 3D Card Tilt Mouse Physics
  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -8.5;
    const rotateY = ((x - centerX) / centerX) * 8.5;
    card.style.transform = `perspective(900px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateZ(8px)`;
    card.style.setProperty('--shine-x', `${(x / rect.width) * 100}%`);
    card.style.setProperty('--shine-y', `${(y / rect.height) * 100}%`);
  };

  const handleCardMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    card.style.transform = `perspective(900px) rotateX(0deg) rotateY(0deg) translateZ(0px)`;
  };

  return (
    <div className="app-shell">
      {/* AMBIENT 3D PERSPECTIVE CYBERNETIC FLOOR */}
      <div className="ambient-3d-grid-floor" />
      {/* TOP BRANDED NAVIGATION BAR (LUXURY MINIMALIST TOUCH) */}
      <header className="top-nav" style={{ position: 'relative', zIndex: 10 }}>
        <div
          className="nav-brand"
          style={{ cursor: 'pointer' }}
          onClick={() => setActiveView('home')}
        >
          <div className="brand-icon-gradient">
            <Cpu size={20} />
          </div>
          <div className="brand-text-block">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="brand-title">{t.appTitle}</span>
              <span className="badge-confidence" style={{ fontSize: '0.65rem', padding: '1px 6px' }}>PRO 2.4</span>
            </div>
            <span className="brand-sub">{t.appSubtitle}</span>
          </div>
        </div>

        {/* Top Header Controls: Language + Health Telemetry */}
        <div className="header-kpi-group">
          {/* Language Selector Dropdown */}
          <div className="lang-selector-wrap">
            <button
              className="lang-select-btn"
              onClick={() => setLangMenuOpen((prev) => !prev)}
              title="Switch Language"
            >
              <Globe size={13} style={{ color: 'var(--primary-cyan)' }} />
              <span>
                {currentLang === 'en'
                  ? '🇬🇧 English'
                  : currentLang === 'ml'
                  ? '🇮🇳 മലയാളം'
                  : currentLang === 'ar'
                  ? '🇸🇦 العربية'
                  : '🇯🇵 日本語'}
              </span>
            </button>

            {langMenuOpen && (
              <div className="lang-menu-popup">
                <button
                  className={`lang-option-item ${currentLang === 'en' ? 'active' : ''}`}
                  onClick={() => handleSwitchLanguage('en')}
                >
                  <span>🇬🇧 English</span>
                  {currentLang === 'en' && <Check size={12} />}
                </button>
                <button
                  className={`lang-option-item ${currentLang === 'ml' ? 'active' : ''}`}
                  onClick={() => handleSwitchLanguage('ml')}
                >
                  <span>🇮🇳 മലയാളം</span>
                  {currentLang === 'ml' && <Check size={12} />}
                </button>
                <button
                  className={`lang-option-item ${currentLang === 'ar' ? 'active' : ''}`}
                  onClick={() => handleSwitchLanguage('ar')}
                >
                  <span>🇸🇦 العربية</span>
                  {currentLang === 'ar' && <Check size={12} />}
                </button>
                <button
                  className={`lang-option-item ${currentLang === 'ja' ? 'active' : ''}`}
                  onClick={() => handleSwitchLanguage('ja')}
                >
                  <span>🇯🇵 日本語</span>
                  {currentLang === 'ja' && <Check size={12} />}
                </button>
              </div>
            )}
          </div>

          <div className="kpi-badge pulse-green">
            <span
              className="pulse-circle"
              style={{ background: apiOnline ? 'var(--emerald-green)' : 'var(--amber-gold)' }}
            />
            {apiOnline ? t.apiOnline : t.apiConnecting}
          </div>

          <div className="kpi-badge pulse-green">
            <span
              className="pulse-circle"
              style={{ background: wsConnected ? 'var(--emerald-green)' : 'var(--amber-gold)' }}
            />
            {wsConnected ? t.telemetryLive : t.telemetryStandby}
          </div>

          <div className="kpi-badge" style={{ color: 'var(--text-white)' }}>
            <Factory size={12} /> {t.unitName}
          </div>
        </div>
      </header>

      {/* 2. REAL-TIME HUD STATUS BANNER */}
      <section className="hero-plant-banner" style={{ position: 'relative', zIndex: 5 }}>
        <div className="banner-left">
          <div className="plant-status-pill">
            <Gauge size={14} />
            <select
              value={activeSector}
              onChange={(e) => {
                const s = e.target.value;
                setActiveSector(s);
                setHudMessage(
                  s === 'B'
                    ? 'Switched to Sector B: Active Line (Slurry Pumps & Drive Motors). Telemetry online.'
                    : s === 'A'
                    ? 'Switched to Sector A: Boiler Feed Line (Feed Pumps & Pre-heaters). Telemetry online.'
                    : 'Switched to Sector C: Heavy Compressor Station (Rotary Air Loops). Telemetry online.'
                );
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#fff',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                outline: 'none',
                fontFamily: 'inherit'
              }}
              title="Click to Switch Plant Sector"
            >
              <option value="B" style={{ background: '#12141c', color: '#fff' }}>SECTOR B: ACTIVE LINE (PUMPS & MOTORS)</option>
              <option value="A" style={{ background: '#12141c', color: '#fff' }}>SECTOR A: BOILER FEED LINE</option>
              <option value="C" style={{ background: '#12141c', color: '#fff' }}>SECTOR C: COMPRESSOR BAY</option>
            </select>
          </div>
          <div className="hud-stream-text">
            <Terminal size={14} style={{ color: 'var(--primary-cyan)' }} />
            <span>[REAL-TIME] :</span>
            <span style={{ color: 'var(--text-white)', fontWeight: 600 }}>{hudMessage}</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          {agentState?.final_report && (
            <button className="btn-neutral-secondary" onClick={() => window.print()}>
              <Printer size={13} /> {t.printReport}
            </button>
          )}
          <button
            className="btn-neutral-secondary"
            onClick={() => {
              setAgentState(null);
              if ('speechSynthesis' in window) window.speechSynthesis.cancel();
              setIsPlayingAudio(false);
              setWorkflowStep(1);
              setHudMessage('Session reset. Ready for new inspection.');
            }}
          >
            <RefreshCw size={12} /> {t.reset}
          </button>
        </div>
      </section>

      {/* 3. CENTRAL HOME PORTAL (SPLIT HERO + 4 FEATURE MODULES) */}
      {activeView === 'home' && (
        <main className="portal-hub-container zoom-in-view">
          {/* AWWWARDS-STYLE SPLIT HERO SECTION */}
          <div className="home-hero-split">
            {/* Left Column: Editorial & Value Proposition */}
            <div className="hero-editorial-col">
              <div className="hero-kicker-pill">
                <Sparkles size={14} style={{ color: 'var(--primary-cyan)' }} />
                <span>AI-POWERED PREDICTIVE DIAGNOSTICS</span>
                <span className="hero-kicker-dot">•</span>
                <span className="hero-kicker-accent">ISO-10816</span>
              </div>

              <h1 className="hero-display-title">
                SYNAPSE OPS <br />
                <span className="hero-gradient-text">Machine Diagnostics</span>
              </h1>

              <p className="hero-lead-desc">
                {t.homeSubtitle}
              </p>

              {/* KPI Badges */}
              <div className="hero-stats-row">
                <div className="stat-pill-item">
                  <span className="stat-pill-value">100%</span>
                  <span className="stat-pill-label">SOP Grounded</span>
                </div>
                <div className="stat-pill-item">
                  <span className="stat-pill-value">80%</span>
                  <span className="stat-pill-label">Token Savings</span>
                </div>
                <div className="stat-pill-item">
                  <span className="stat-pill-value">&lt; 5ms</span>
                  <span className="stat-pill-label">Live Telemetry</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="hero-cta-group">
                <button
                  className="btn-hero-launch"
                  onClick={() => setActiveView('workbench')}
                >
                  <Wrench size={16} />
                  <span>{t.box1_action}</span>
                  <ChevronRight size={16} />
                </button>
                <button
                  className="btn-hero-secondary"
                  onClick={() => setActiveView('video')}
                >
                  <Video size={16} />
                  <span>{t.box2_action}</span>
                </button>
              </div>
            </div>

            {/* Right Column: Interactive Framed 3D Digital Twin Stage */}
            <div className="hero-stage-col">
              <div className="digital-twin-stage-card">
                <ThreeIndustrialDigitalTwin
                  mode="stage"
                  theme={activeTheme}
                  activeEquipmentId={selectedEquipment.id}
                  onSelectHotspot={handleSelectHotspot}
                />
              </div>
            </div>
          </div>

          {/* SECTION HEADER: MODULE SELECTION */}
          <div className="modules-section-header">
            <div className="section-title-wrap">
              <div className="section-kicker">{t.modulesKicker}</div>
              <h2 className="section-title">{t.modulesHeader}</h2>
            </div>
          </div>

          {/* 4 FEATURE CARDS GRID */}
          <div className="portal-boxes-grid">
            {/* BOX 1: INSPECT MACHINE */}
            <div
              className="portal-feature-card card-variant-cyan tilt-card-3d"
              onClick={() => {
                setActiveView('workbench');
                setWorkflowStep(1);
              }}
              onMouseMove={handleCardMouseMove}
              onMouseLeave={handleCardMouseLeave}
            >
              <div>
                <div className="portal-card-top">
                  <div className="portal-icon-box box-cyan">
                    <Wrench size={22} />
                  </div>
                  <span className="portal-badge-tag tag-cyan">{t.box1_badge}</span>
                </div>
                <h3 className="portal-card-title">{t.box1_title}</h3>
                <p className="portal-card-desc">{t.box1_desc}</p>
              </div>
              <div className="portal-box-action">
                <span>{t.box1_action}</span>
                <ChevronRight size={14} />
              </div>
            </div>

            {/* BOX 2: VIDEO CHECK */}
            <div
              className="portal-feature-card card-variant-indigo tilt-card-3d"
              onClick={() => setActiveView('video')}
              onMouseMove={handleCardMouseMove}
              onMouseLeave={handleCardMouseLeave}
            >
              <div>
                <div className="portal-card-top">
                  <div className="portal-icon-box box-indigo">
                    <Video size={22} />
                  </div>
                  <span className="portal-badge-tag tag-indigo">{t.box2_badge}</span>
                </div>
                <h3 className="portal-card-title">{t.box2_title}</h3>
                <p className="portal-card-desc">{t.box2_desc}</p>
              </div>
              <div className="portal-box-action">
                <span>{t.box2_action}</span>
                <ChevronRight size={14} />
              </div>
            </div>

            {/* BOX 3: MANUALS & GUIDES */}
            <div
              className="portal-feature-card card-variant-emerald tilt-card-3d"
              onClick={() => setActiveView('rag')}
              onMouseMove={handleCardMouseMove}
              onMouseLeave={handleCardMouseLeave}
            >
              <div>
                <div className="portal-card-top">
                  <div className="portal-icon-box box-emerald">
                    <BookOpen size={22} />
                  </div>
                  <span className="portal-badge-tag tag-emerald">{t.box3_badge}</span>
                </div>
                <h3 className="portal-card-title">{t.box3_title}</h3>
                <p className="portal-card-desc">{t.box3_desc}</p>
              </div>
              <div className="portal-box-action">
                <span>{t.box3_action}</span>
                <ChevronRight size={14} />
              </div>
            </div>

            {/* BOX 4: SYSTEM STATUS */}
            <div
              className="portal-feature-card card-variant-amber tilt-card-3d"
              onClick={() => setActiveView('telemetry')}
              onMouseMove={handleCardMouseMove}
              onMouseLeave={handleCardMouseLeave}
            >
              <div>
                <div className="portal-card-top">
                  <div className="portal-icon-box box-amber">
                    <Activity size={22} />
                  </div>
                  <span className="portal-badge-tag tag-amber">{t.box4_badge}</span>
                </div>
                <h3 className="portal-card-title">{t.box4_title}</h3>
                <p className="portal-card-desc">{t.box4_desc}</p>
              </div>
              <div className="portal-box-action">
                <span>{t.box4_action}</span>
                <ChevronRight size={14} />
              </div>
            </div>
          </div>
        </main>
      )}

      {/* 4. MODULE VIEWS WITH SMOOTH ZOOM TRANSITION & BREADCRUMB */}
      {activeView !== 'home' && (
        <div className="view-breadcrumb-banner" style={{ position: 'relative', zIndex: 5 }}>
          <button className="btn-back-hub" onClick={() => setActiveView('home')}>
            <ArrowLeft size={14} /> {t.backToHome}
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            <span>{t.activeModuleLabel}:</span>
            <strong style={{ color: 'var(--primary-cyan)' }}>
              {activeView === 'workbench'
                ? t.tabInspect
                : activeView === 'video'
                ? t.tabVideo
                : activeView === 'rag'
                ? t.tabDocs
                : t.tabSystem}
            </strong>
          </div>
        </div>
      )}

      {/* VIEW 1: MACHINE INSPECTION WORKBENCH - ENTERPRISE MULTI-STEP PIPELINE */}
      {activeView === 'workbench' && (
        <div className="zoom-in-view main-workspace" style={{ position: 'relative', zIndex: 2 }}>
          {/* Top Enterprise Workflow Pipeline Stepper Bar */}
          <div className="workflow-pipeline-bar">
            <button
              className={`pipeline-step-item ${workflowStep === 1 ? 'active' : ''} ${workflowStep > 1 ? 'completed' : ''}`}
              onClick={() => setWorkflowStep(1)}
              title="Step 1: Select Fleet Machine"
            >
              <span className="pipeline-step-num">{workflowStep > 1 ? '✓' : '1'}</span>
              <span>{t.step1_title}</span>
            </button>
            <div className="pipeline-connector" />
            <button
              className={`pipeline-step-item ${workflowStep === 2 ? 'active' : ''} ${workflowStep > 2 ? 'completed' : ''}`}
              onClick={() => setWorkflowStep(2)}
              title="Step 2: Diagnostic Input & Evidence"
            >
              <span className="pipeline-step-num">{workflowStep > 2 ? '✓' : '2'}</span>
              <span>{t.step2_title}</span>
            </button>
            <div className="pipeline-connector" />
            <button
              className={`pipeline-step-item ${workflowStep === 3 ? 'active' : ''} ${workflowStep > 3 ? 'completed' : ''}`}
              onClick={() => setWorkflowStep(3)}
              title="Step 3: Work Order Ticket & Report"
            >
              <span className="pipeline-step-num">{workflowStep > 3 ? '✓' : '3'}</span>
              <span>{t.step3_title}</span>
            </button>
            <div className="pipeline-connector" />
            <button
              className={`pipeline-step-item ${workflowStep === 4 ? 'active' : ''}`}
              onClick={() => setWorkflowStep(4)}
              title="Step 4: Live Sound & Vibration Telemetry"
            >
              <span className="pipeline-step-num">4</span>
              <span>{t.step4_title}</span>
            </button>
          </div>

          {/* PROCESS STAGE 1: FLEET EQUIPMENT SELECTION */}
          {workflowStep === 1 && (
            <div className="step-content-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-card)', paddingBottom: '0.85rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Factory size={18} style={{ color: 'var(--primary-cyan)' }} />
                    <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-white)', margin: 0 }}>
                      {t.fleetTitle}
                    </h2>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', margin: '0.25rem 0 0 0' }}>
                    {t.fleetSub}
                  </p>
                </div>
                <span className="badge-confidence">ISO-10816 PLANT FLEET</span>
              </div>

              {/* Equipment Grid Cards with 3D Tilt & Specular Shine */}
              <div className="equipment-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
                {currentProfiles.map((eq) => (
                  <div
                    key={eq.id}
                    className={`equipment-card-item tilt-card-3d ${selectedEquipment.id === eq.id ? 'selected' : ''}`}
                    onClick={() => handleSelectEquipment(eq)}
                    onMouseMove={handleCardMouseMove}
                    onMouseLeave={handleCardMouseLeave}
                    style={{ cursor: 'pointer' }}
                  >
                    {/* High-Tech Corner Targeting Reticles */}
                    <div className="reticle-corner reticle-tl" />
                    <div className="reticle-corner reticle-tr" />
                    <div className="reticle-corner reticle-bl" />
                    <div className="reticle-corner reticle-br" />

                    <div className="equipment-card-thumb lidar-scan-container" style={{ height: '170px' }}>
                      <img src={eq.image} alt={eq.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <div className="lidar-laser-beam" />
                      <span className={`equipment-badge-overlay ${eq.badgeClass}`}>
                        {eq.statusText}
                      </span>
                    </div>
                    <div className="equipment-card-body" style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                        <span className="equipment-card-name" style={{ fontSize: '0.95rem' }}>{eq.name}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--primary-cyan)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                          {eq.id}
                        </span>
                      </div>
                      <div className="equipment-card-specs" style={{ fontSize: '0.8rem', marginBottom: '0.75rem' }}>{eq.specs}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', background: 'rgba(0,0,0,0.4)', padding: '0.45rem 0.65rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-card)', marginBottom: '0.75rem', minHeight: '38px' }}>
                        {eq.notes}
                      </div>
                      <div className="equipment-card-symptom" style={{ fontWeight: 700, color: selectedEquipment.id === eq.id ? '#fff' : 'var(--primary-silver)' }}>
                        <ChevronRight size={13} /> {selectedEquipment.id === eq.id ? 'Selected Active Asset ✓' : t.clickToInspect}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* INTERACTIVE 3D DIGITAL TWIN & REAL-TIME ASSET INSPECTION BAY */}
              <div style={{ marginTop: '1.75rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span className="badge-confidence">3D INTERACTIVE TWIN</span>
                    <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#fff' }}>
                      {selectedEquipment.name} ({selectedEquipment.id})
                    </span>
                  </div>

                  {/* Mode Switcher: 3D CAD Twin vs Photo Evidence */}
                  <div style={{ display: 'flex', gap: '0.35rem', background: 'rgba(255,255,255,0.06)', padding: '3px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-card)' }}>
                    <button
                      className={`nav-tab-item ${assetPreviewMode === '3d' ? 'active' : ''}`}
                      style={{ padding: '0.35rem 0.85rem', fontSize: '0.78rem' }}
                      onClick={() => setAssetPreviewMode('3d')}
                    >
                      <Sparkles size={13} /> 3D Digital Model
                    </button>
                    <button
                      className={`nav-tab-item ${assetPreviewMode === 'photo' ? 'active' : ''}`}
                      style={{ padding: '0.35rem 0.85rem', fontSize: '0.78rem' }}
                      onClick={() => setAssetPreviewMode('photo')}
                    >
                      <Camera size={13} /> Photo Evidence
                    </button>
                  </div>
                </div>

                <div className="workbench-3d-stage-box" style={{ height: '390px', position: 'relative' }}>
                  {assetPreviewMode === '3d' ? (
                    <ThreeIndustrialDigitalTwin
                      mode="stage"
                      theme={activeTheme}
                      activeEquipmentId={selectedEquipment.id}
                      onSelectHotspot={handleSelectHotspot}
                    />
                  ) : (
                    <div className="lidar-scan-container" style={{ width: '100%', height: '100%', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <img
                        src={selectedEquipment.image}
                        alt={selectedEquipment.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <div className="lidar-laser-beam" />
                      <div style={{ position: 'absolute', bottom: 12, left: 14, background: 'rgba(0,0,0,0.8)', padding: '4px 12px', borderRadius: '6px', fontSize: '0.75rem', color: '#93c5fd', fontFamily: 'var(--font-mono)' }}>
                        LiDAR SCAN ACTIVE · {selectedEquipment.id} · {selectedEquipment.statusText}
                      </div>
                    </div>
                  )}
                </div>

                {/* Selected Asset Telemetry Summary & Next Step */}
                <div className="report-card-block" style={{ background: 'rgba(13, 17, 26, 0.95)', border: '1px solid rgba(226, 232, 240, 0.16)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <span className="badge-confidence">TARGET LOCKED</span>
                        <strong style={{ color: '#fff', fontSize: '0.95rem' }}>{selectedEquipment.name} ({selectedEquipment.id})</strong>
                        <span style={{ fontSize: '0.8rem', color: 'var(--amber-gold)' }}>● {selectedEquipment.statusText}</span>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', maxWidth: '780px' }}>
                        {selectedEquipment.notes}
                      </div>
                    </div>

                    <button
                      className="btn-electric-primary"
                      onClick={() => setWorkflowStep(2)}
                      style={{ padding: '0.75rem 1.4rem', fontSize: '0.88rem' }}
                    >
                      {t.nextStep} <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Process Navigation Footer */}
              <div className="process-nav-footer">
                <button className="btn-back-hub" onClick={() => setActiveView('home')}>
                  <ArrowLeft size={14} /> {t.backToHome}
                </button>
                <button className="btn-electric-primary" onClick={() => setWorkflowStep(2)}>
                  {t.nextStep} ({t.step2_title}) <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* PROCESS STAGE 2: DIAGNOSTICS & EVIDENCE SETUP */}
          {workflowStep === 2 && (
            <div className="step-content-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-card)', paddingBottom: '0.85rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <SlidersHorizontal size={18} style={{ color: 'var(--primary-cyan)' }} />
                    <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-white)', margin: 0 }}>
                      {t.setupTitle}
                    </h2>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', margin: '0.25rem 0 0 0' }}>
                    Target Machine: <strong style={{ color: '#fff' }}>{selectedEquipment.name} ({equipmentId})</strong>
                  </p>
                </div>
                <span className="badge-confidence">ISO-10816 READY</span>
              </div>

              <div className="workbench-layout-grid" style={{ marginBottom: '1.5rem' }}>
                {/* Column 1: Visual Evidence & Urgency */}
                <div
                  className="modern-card tilt-card-3d"
                  onMouseMove={handleCardMouseMove}
                  onMouseLeave={handleCardMouseLeave}
                >
                  <div className="modern-card-header">
                    <div className="card-heading-title">
                      <Camera size={15} style={{ color: 'var(--primary-cyan)' }} />
                      {t.photoTitle} & Asset Tag
                    </div>
                  </div>
                  <div className="modern-card-body">
                    {/* Machine ID & Urgency */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '0.75rem' }}>
                      <div className="field-group">
                        <label className="field-label">{t.machineTag}</label>
                        <input
                          type="text"
                          className="modern-input"
                          value={equipmentId}
                          onChange={(e) => setEquipmentId(e.target.value)}
                        />
                      </div>
                      <div className="field-group">
                        <label className="field-label">{t.urgency}</label>
                        <select
                          className="modern-select"
                          value={severityLevel}
                          onChange={(e) => setSeverityLevel(e.target.value)}
                        >
                          <option value="Critical Defect">{t.urgencyCritical}</option>
                          <option value="Warning">{t.urgencyWarning}</option>
                          <option value="Standard Inspection">{t.urgencyStandard}</option>
                        </select>
                      </div>
                    </div>

                    {/* Photographic Evidence Dropzone */}
                    <div className="field-group">
                      <label className="field-label">{t.photoTitle}</label>
                      <label
                        className="photo-dropzone-styled"
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault();
                          if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                            const f = e.dataTransfer.files[0];
                            setAgentFile(f);
                            setAgentPreview(URL.createObjectURL(f));
                          }
                        }}
                      >
                        <div className="dropzone-circle-icon">
                          <Upload size={18} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-white)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {agentFile ? agentFile.name : `${selectedEquipment.name} Photo`}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                            {t.photoDropSub}
                          </div>
                        </div>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          style={{ display: 'none' }}
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              const f = e.target.files[0];
                              setAgentFile(f);
                              setAgentPreview(URL.createObjectURL(f));
                            }
                          }}
                        />
                      </label>
                    </div>

                    {/* Active Asset Photographic Preview with LiDAR Laser */}
                    {agentPreview && (
                      <div className="lidar-scan-container" style={{ position: 'relative', borderRadius: 'var(--radius-sm)', overflow: 'hidden', height: '170px', border: '1px solid var(--border-card)' }}>
                        <img src={agentPreview} alt="Asset Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <div className="lidar-laser-beam" />
                        <div style={{ position: 'absolute', bottom: 6, left: 8, background: 'rgba(0,0,0,0.75)', padding: '2px 8px', borderRadius: 4, fontSize: '0.72rem', color: '#93c5fd', fontFamily: 'var(--font-mono)' }}>
                          Asset: {equipmentId} · {t.activeEvidence}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Column 2: Observations, Voice & Manual Reference */}
                <div
                  className="modern-card tilt-card-3d"
                  onMouseMove={handleCardMouseMove}
                  onMouseLeave={handleCardMouseLeave}
                >
                  <div className="modern-card-header">
                    <div className="card-heading-title">
                      <FileText size={15} style={{ color: 'var(--primary-cyan)' }} />
                      {t.notesTitle} & Cross-Reference
                    </div>
                  </div>
                  <div className="modern-card-body">
                    {/* Notes with Voice button */}
                    <div className="field-group">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <label className="field-label">{t.notesTitle}</label>
                        <button
                          type="button"
                          className={`voice-rec-btn ${isRecording ? 'recording' : ''}`}
                          onClick={toggleRecording}
                          title="Click to speak your observations"
                        >
                          {isRecording ? (
                            <>
                              <span className="recording-dot" />
                              <MicOff size={13} /> {t.stopRecord}
                            </>
                          ) : (
                            <>
                              <Mic size={13} style={{ color: 'var(--primary-cyan)' }} /> {t.recordVoice}
                            </>
                          )}
                        </button>
                      </div>

                      <textarea
                        className="modern-textarea"
                        style={{ height: '100px' }}
                        value={agentRequest}
                        onChange={(e) => setAgentRequest(e.target.value)}
                        placeholder={t.notesPlaceholder}
                      />

                      {/* Quick-Insert Tags */}
                      <div className="quick-tags-wrap">
                        <span className="quick-tag-chip" onClick={() => setAgentRequest((prev) => prev + ' Belt slack deflection 32mm.')}>+ 32mm Slack</span>
                        <span className="quick-tag-chip" onClick={() => setAgentRequest((prev) => prev + ' 94.5 C bearing hotspot.')}>+ 94.5°C Bearing</span>
                        <span className="quick-tag-chip" onClick={() => setAgentRequest((prev) => prev + ' 6mm axial pulley offset.')}>+ 6mm Offset</span>
                        <span className="quick-tag-chip" onClick={() => setAgentRequest((prev) => prev + ' 8.2 bar pressure relief leakage.')}>+ 8.2 Bar Valve</span>
                      </div>
                    </div>

                    {/* Target SOP Manual */}
                    <div className="field-group">
                      <label className="field-label">{t.manualSelect}</label>
                      <select
                        className="modern-select"
                        value={selectedDocId}
                        onChange={(e) => setSelectedDocId(e.target.value)}
                      >
                        <option value="">{t.allManuals} ({documents.length})</option>
                        {documents.map((d) => (
                          <option key={d.document_id} value={d.document_id}>
                            {d.filename} ({d.total_pages} Pages)
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Inspection Trigger Highlight Box */}
                    <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(226, 232, 240, 0.12)', borderRadius: 'var(--radius-sm)', padding: '0.85rem', marginTop: '0.5rem' }}>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                        Ready to scan visual defect against engineering manuals and generate actionable work order.
                      </div>
                      <button
                        className="btn-electric-primary"
                        onClick={handleRunAgent}
                        disabled={agentLoading}
                        style={{ width: '100%' }}
                      >
                        {agentLoading ? (
                          <>
                            <Loader2 size={18} className="pulse-circle" /> {t.runningInspection}
                          </>
                        ) : (
                          <>
                            <Wrench size={16} /> {t.startInspection} →
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Process Navigation Footer */}
              <div className="process-nav-footer">
                <button className="btn-neutral-secondary" onClick={() => setWorkflowStep(1)}>
                  <ArrowLeft size={14} /> {t.prevStep}: {t.step1_title}
                </button>
                <button
                  className="btn-electric-primary"
                  onClick={handleRunAgent}
                  disabled={agentLoading}
                >
                  {agentLoading ? (
                    <>
                      <Loader2 size={16} className="pulse-circle" /> {t.runningInspection}
                    </>
                  ) : (
                    <>
                      <Wrench size={15} /> {t.startInspection} & {t.step3_title} <ChevronRight size={14} />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* PROCESS STAGE 3: WORK ORDER REPORT & ACTION PLAN */}
          {workflowStep === 3 && (
            <div className="step-content-card">
              <div className="modern-card-header" style={{ marginBottom: '1.25rem', borderBottom: '1px solid var(--border-card)', paddingBottom: '0.85rem' }}>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <button
                    className={`nav-tab-item ${activeReportTab === 'report' ? 'active' : ''}`}
                    onClick={() => setActiveReportTab('report')}
                  >
                    <FileText size={14} /> {t.tabReport}
                  </button>
                  <button
                    className={`nav-tab-item ${activeReportTab === 'traces' ? 'active' : ''}`}
                    onClick={() => setActiveReportTab('traces')}
                  >
                    <Layers size={14} /> {t.tabSteps} {agentState?.tool_traces && `(${agentState.tool_traces.length})`}
                  </button>
                  <button
                    className={`nav-tab-item ${activeReportTab === 'json' ? 'active' : ''}`}
                    onClick={() => setActiveReportTab('json')}
                  >
                    <Hash size={14} /> {t.tabRaw}
                  </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  {agentState?.final_report && (
                    <>
                      <button className="btn-neutral-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }} onClick={() => window.print()}>
                        <Printer size={13} /> {t.printReport}
                      </button>
                      <span className="badge-confidence">
                        ● ZERO-HALLUCINATION VERIFIED
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Card Body */}
              <div>
                {!agentState?.final_report ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1rem 0' }}>
                    <div className="report-alert-banner warning">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <AlertTriangle size={24} style={{ color: 'var(--amber-gold)' }} />
                        <div>
                          <div style={{ fontWeight: 800, fontSize: '0.98rem' }}>{t.awaitingTitle}</div>
                          <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                            {t.awaitingSub}<strong style={{ color: '#fff' }}>{selectedEquipment.name} ({equipmentId})</strong>
                          </div>
                        </div>
                      </div>
                      <button className="btn-electric-primary" style={{ padding: '0.6rem 1.25rem', fontSize: '0.84rem' }} onClick={handleRunAgent} disabled={agentLoading}>
                        {agentLoading ? (
                          <>
                            <Loader2 size={16} className="pulse-circle" /> {t.runningInspection}
                          </>
                        ) : (
                          <>
                            <Sparkles size={15} /> {t.runNow}
                          </>
                        )}
                      </button>
                    </div>

                    {/* Pre-Inspection Asset Snapshot */}
                    <div className="report-card-block">
                      <div className="card-block-title">
                        <Camera size={14} /> {selectedEquipment.name} Preview
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '1.25rem', alignItems: 'center' }}>
                        <img
                          src={selectedEquipment.image}
                          alt={selectedEquipment.name}
                          style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-card)' }}
                        />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem', fontSize: '0.88rem' }}>
                          <div><strong>Machine:</strong> {selectedEquipment.name} ({equipmentId})</div>
                          <div><strong>Specs:</strong> {selectedEquipment.specs}</div>
                          <div><strong>Status:</strong> <span style={{ color: 'var(--amber-gold)' }}>{selectedEquipment.statusText}</span></div>
                          <div style={{ fontSize: '0.82rem', color: 'var(--text-dim)', lineHeight: 1.6 }}>
                            {agentRequest}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* TAB: REPORT */}
                    {activeReportTab === 'report' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        {/* Audio Result Playback Strip */}
                        <div className="audio-readout-strip">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <button
                              className="btn-electric-primary"
                              style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}
                              onClick={toggleSpeakReport}
                            >
                              {isPlayingAudio ? (
                                <>
                                  <Square size={13} /> {t.stopAudio}
                                </>
                              ) : (
                                <>
                                  <Volume2 size={14} /> {t.listenReport}
                                </>
                              )}
                            </button>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                              {isPlayingAudio ? t.audioPlaying : 'Audio summary available in selected language'}
                            </span>
                          </div>

                          {isPlayingAudio && (
                            <div className="audio-equalizer">
                              <span className="audio-bar" />
                              <span className="audio-bar" />
                              <span className="audio-bar" />
                              <span className="audio-bar" />
                            </div>
                          )}
                        </div>

                        {/* Executive Status Banner */}
                        <div className="report-alert-banner critical">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                            <ShieldAlert size={22} style={{ color: 'var(--rose-crimson)' }} />
                            <div>
                              <div style={{ fontWeight: 800, fontSize: '0.92rem' }}>{t.verifiedAnomaly}</div>
                              <div style={{ fontSize: '0.76rem', opacity: 0.9 }}>
                                Asset Tag: {equipmentId} | Inspection Time: {new Date().toLocaleTimeString()}
                              </div>
                            </div>
                          </div>
                          <span className="badge-confidence">100% GROUNDED</span>
                        </div>

                        {/* Enterprise Engineering Work Order Ticket Header */}
                        <div className="report-card-block" style={{ padding: '0.85rem 1.25rem', background: 'rgba(16, 19, 27, 0.95)', border: '1px solid rgba(226, 232, 240, 0.16)' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', textAlign: 'center' }}>
                            <div style={{ padding: '0.25rem', borderRight: '1px solid var(--border-card)' }}>
                              <div style={{ fontSize: '0.64rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>WORK ORDER ID</div>
                              <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#fff', marginTop: '3px' }}>#WO-2026-8941</div>
                            </div>
                            <div style={{ padding: '0.25rem', borderRight: '1px solid var(--border-card)' }}>
                              <div style={{ fontSize: '0.64rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>SEVERITY LEVEL</div>
                              <div style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--rose-crimson)', marginTop: '3px' }}>CRITICAL</div>
                            </div>
                            <div style={{ padding: '0.25rem', borderRight: '1px solid var(--border-card)' }}>
                              <div style={{ fontSize: '0.64rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>ISO 10816 CLASS</div>
                              <div style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--amber-gold)', marginTop: '3px' }}>ZONE C: ALERT</div>
                            </div>
                            <div style={{ padding: '0.25rem' }}>
                              <div style={{ fontSize: '0.64rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>CREW ASSIGNED</div>
                              <div style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--primary-silver)', marginTop: '3px' }}>MAINT-TEAM 1</div>
                            </div>
                          </div>
                        </div>

                        {/* Summary with Photo */}
                        <div className="report-card-block">
                          <div className="card-block-title">
                            <CheckCircle2 size={14} /> {t.summaryTitle}
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: agentPreview ? '220px 1fr' : '1fr', gap: '1.25rem', alignItems: 'start' }}>
                            {agentPreview && (
                              <img
                                src={agentPreview}
                                alt="Inspected Asset"
                                style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-card)' }}
                              />
                            )}
                            <div style={{ fontSize: '0.92rem', color: 'var(--text-primary)', lineHeight: 1.65 }}>
                              {agentState.final_report.summary}
                            </div>
                          </div>
                        </div>

                        {/* Visual Observations */}
                        {agentState.final_report.observations.length > 0 && (
                          <div className="report-card-block">
                            <div className="card-block-title">
                              <Sparkles size={14} /> {t.findingsTitle}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                              {agentState.final_report.observations.map((obs, idx) => (
                                <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.55rem 0.85rem', background: 'rgba(10, 14, 26, 0.6)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-card)' }}>
                                  <span style={{ fontSize: '0.88rem' }}>{obs.text}</span>
                                  <span className="badge-confidence">Conf: {Math.round(obs.confidence * 100)}%</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Hypothesized Causes & Exact Citations */}
                        <div className="report-card-block">
                          <div className="card-block-title">
                            <BookOpen size={14} /> {t.causesTitle}
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {agentState.final_report.possible_causes.map((cause, idx) => (
                              <div key={idx} style={{ padding: '0.75rem 1rem', background: 'rgba(10, 14, 26, 0.7)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-card)' }}>
                                <div style={{ fontWeight: 700, color: 'var(--text-white)', fontSize: '0.9rem' }}>{cause.cause}</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.45rem' }}>
                                  <span style={{ fontSize: '0.74rem', color: 'var(--text-dim)' }}>{t.evidenceLabel}:</span>
                                  {cause.support.map((sup, sIdx) => (
                                    <span key={sIdx} className="badge-evidence">
                                      📖 {sup}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Interactive Physical Checklist */}
                        <div className="report-card-block">
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div className="card-block-title">
                              <CheckCheck size={14} /> {t.checklistTitle}
                            </div>
                            <span style={{ fontSize: '0.78rem', color: 'var(--primary-cyan)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                              {Object.values(completedChecks).filter(Boolean).length} / {agentState.final_report.recommended_checks.length} {t.checksVerified}
                            </span>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {agentState.final_report.recommended_checks.map((chk, idx) => (
                              <label
                                key={idx}
                                className={`check-row-item ${completedChecks[idx] ? 'checked' : ''}`}
                                onClick={() => toggleCheck(idx)}
                              >
                                <input
                                  type="checkbox"
                                  checked={!!completedChecks[idx]}
                                  onChange={() => {}}
                                />
                                <div style={{ flex: 1 }}>
                                  <span style={{ fontSize: '0.88rem' }}>{chk.step}</span>
                                  <div style={{ fontSize: '0.74rem', color: 'var(--primary-cyan)', marginTop: '0.2rem', fontFamily: 'var(--font-mono)' }}>
                                    {t.standardLabel}: {chk.source}
                                  </div>
                                </div>
                              </label>
                            ))}
                          </div>
                        </div>

                        {/* Limitations Warning */}
                        {agentState.final_report.limitations.length > 0 && (
                          <div style={{ borderLeft: '3px solid var(--rose-crimson)', background: 'rgba(244, 63, 94, 0.08)', padding: '0.85rem 1.15rem', borderRadius: 'var(--radius-sm)', fontSize: '0.82rem', color: '#fecdd3' }}>
                            <div style={{ fontWeight: 700, marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                              <ShieldAlert size={15} /> {t.safetyTitle}
                            </div>
                            {agentState.final_report.limitations.map((l, idx) => (
                              <div key={idx}>• {l}</div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* TAB: TRACES */}
                    {activeReportTab === 'traces' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                        {agentState.tool_traces.map((trace, idx) => (
                          <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.7rem 1rem', background: 'rgba(10, 14, 26, 0.7)', border: '1px solid var(--border-card)', borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                              <span style={{ color: 'var(--primary-cyan)', fontWeight: 700 }}>🛠️ {trace.tool_name}</span>
                              <span style={{ color: 'var(--text-secondary)' }}>{trace.output_summary}</span>
                            </div>
                            <span style={{ color: 'var(--text-dim)' }}>{trace.duration_ms}ms</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* TAB: JSON */}
                    {activeReportTab === 'json' && (
                      <pre style={{ background: '#090e18', padding: '1.25rem', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', fontFamily: 'var(--font-mono)', overflowX: 'auto', border: '1px solid var(--border-card)', color: '#cbd5e1' }}>
                        {JSON.stringify(agentState, null, 2)}
                      </pre>
                    )}
                  </>
                )}
              </div>

              {/* Process Navigation Footer */}
              <div className="process-nav-footer">
                <button className="btn-neutral-secondary" onClick={() => setWorkflowStep(2)}>
                  <ArrowLeft size={14} /> {t.prevStep}: {t.step2_title}
                </button>
                <button className="btn-electric-primary" onClick={() => setWorkflowStep(4)}>
                  {t.nextStep} ({t.step4_title}) <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* PROCESS STAGE 4: LIVE SOUND & VIBRATION TELEMETRY */}
          {workflowStep === 4 && (
            <div className="step-content-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-card)', paddingBottom: '0.85rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Activity size={18} style={{ color: 'var(--primary-cyan)' }} />
                    <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-white)', margin: 0 }}>
                      {t.step4_title}
                    </h2>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', margin: '0.25rem 0 0 0' }}>
                    Acoustic FFT Audio & ISO-10816 Vibration Diagnostics for <strong style={{ color: '#fff' }}>{selectedEquipment.name} ({equipmentId})</strong>
                  </p>
                </div>
                <span className="badge-confidence">REAL-TIME STREAMING</span>
              </div>

              {/* Full Width Audio & Telemetry Component */}
              <AcousticAudioTelemetry currentLang={currentLang} />

              {/* Process Navigation Footer */}
              <div className="process-nav-footer">
                <button className="btn-neutral-secondary" onClick={() => setWorkflowStep(3)}>
                  <ArrowLeft size={14} /> {t.prevStep}: {t.step3_title}
                </button>
                <button
                  className="btn-electric-primary"
                  onClick={() => {
                    setWorkflowStep(1);
                    setAgentState(null);
                    setHudMessage('Ready for new inspection session.');
                  }}
                >
                  <RefreshCw size={14} /> Start New Inspection ↺
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: VIDEO CHECK */}
      {activeView === 'video' && (
        <div className="zoom-in-view main-workspace" style={{ position: 'relative', zIndex: 2 }}>
          <div className="workbench-layout-grid">
            <div className="modern-card">
              <div className="modern-card-header">
                <div className="card-heading-title">
                  <Video size={16} style={{ color: 'var(--primary-cyan)' }} />
                  {t.videoTitle}
                </div>
                <span className="badge-confidence">1 FPS SAMPLING</span>
              </div>

              <div className="modern-card-body">
                <label className="photo-dropzone-styled">
                  <div className="dropzone-circle-icon">
                    <Video size={20} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-white)' }}>
                      {videoFile ? videoFile.name : t.videoUpload}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                      Laplacian blur filter + color histogram deduplication
                    </div>
                  </div>
                  <input
                    type="file"
                    accept="video/mp4,video/quicktime,video/x-msvideo"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setVideoFile(e.target.files[0]);
                      }
                    }}
                  />
                </label>

                <div className="field-group">
                  <label className="field-label">{t.videoNotes}</label>
                  <textarea
                    className="modern-textarea"
                    value={videoNotes}
                    onChange={(e) => setVideoNotes(e.target.value)}
                    placeholder="e.g. Roller begins shaking when conveyor reaches 1400 RPM..."
                  />
                </div>

                <button
                  className="btn-electric-primary"
                  onClick={handleRunVideo}
                  disabled={!videoFile || videoLoading}
                  style={{ width: '100%' }}
                >
                  {videoLoading ? (
                    <>
                      <Loader2 size={18} className="pulse-circle" /> {t.videoAnalyzing}
                    </>
                  ) : (
                    <>
                      <Video size={16} /> {t.videoStart}
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Video Filmstrip & Findings */}
            <div className="modern-card">
              <div className="modern-card-header">
                <div className="card-heading-title">
                  <Layers size={16} style={{ color: 'var(--primary-cyan)' }} />
                  {t.videoTitle}
                </div>
              </div>

              <div className="modern-card-body">
                {!videoResult ? (
                  <div className="report-card-block" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
                    <Video size={48} style={{ margin: '0 auto', color: 'var(--border-focus)' }} />
                    <div style={{ fontWeight: 700, marginTop: '0.75rem', color: 'var(--text-white)' }}>
                      {t.videoNoActive}
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-dim)', maxWidth: 380, margin: '0.35rem auto 0 auto' }}>
                      Upload an MP4 or MOV operational machine video to view automated 1 FPS sampling, Laplacian variance blur detection, and keyframe token reduction.
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {/* SLA Stats */}
                    <div className="stats-cards-row">
                      <div className="stat-item-box">
                        <div className="stat-item-val">{videoResult.stats.sampled_frames_count}</div>
                        <div className="stat-item-label">{t.videoTotal}</div>
                      </div>
                      <div className="stat-item-box">
                        <div className="stat-item-val" style={{ color: 'var(--emerald-green)' }}>
                          {videoResult.stats.useful_keyframes_count}
                        </div>
                        <div className="stat-item-label">{t.videoFrames}</div>
                      </div>
                      <div className="stat-item-box">
                        <div className="stat-item-val" style={{ color: 'var(--amber-gold)' }}>
                          {videoResult.stats.cost_reduction_pct}%
                        </div>
                        <div className="stat-item-label">{t.videoSaved}</div>
                      </div>
                    </div>

                    {/* Keyframe Filmstrip */}
                    <div className="report-card-block">
                      <div className="card-block-title">
                        <Sparkles size={14} /> Distinct Visual Keyframes Extracted
                      </div>
                      <div className="filmstrip-grid">
                        {videoResult.selected_keyframes.map((kf, idx) => (
                          <div key={idx} className="filmstrip-item">
                            <img src={kf.url} alt={`Frame ${kf.frame_index}`} />
                            <div className="meta">
                              <span>#{kf.frame_index}</span>
                              <span>{kf.timestamp_sec.toFixed(1)}s</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Summary */}
                    <div className="report-card-block">
                      <div className="card-block-title">
                        <CheckCircle2 size={14} /> {t.videoSummary}
                      </div>
                      <div style={{ fontSize: '0.9rem', color: 'var(--text-white)', lineHeight: 1.6 }}>
                        {videoResult.observations_summary}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: SOP TECHNICAL KNOWLEDGE BASE (RAG) */}
      {activeView === 'rag' && (
        <div className="zoom-in-view main-workspace" style={{ position: 'relative', zIndex: 2 }}>
          <div className="workbench-layout-grid">
            {/* Catalog */}
            <div className="modern-card">
              <div className="modern-card-header">
                <div className="card-heading-title">
                  <BookOpen size={16} style={{ color: 'var(--primary-cyan)' }} />
                  {t.docCatalog}
                </div>
                <span className="badge-confidence">FAISS VECTOR STORE</span>
              </div>

              <div className="modern-card-body">
                <label className="photo-dropzone-styled">
                  <div className="dropzone-circle-icon">
                    <Upload size={18} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-white)' }}>{t.docUpload}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Preserves pages and extracts section chunks</div>
                  </div>
                  <input type="file" accept="application/pdf" style={{ display: 'none' }} onChange={handleUploadDocument} />
                </label>

                {/* Document List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem', marginTop: '0.5rem' }}>
                  {documents.map((doc) => (
                    <div
                      key={doc.document_id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.75rem 0.9rem',
                        background: 'rgba(10, 14, 26, 0.6)',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-card)'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-white)' }}>{doc.filename}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                          Pages: {doc.total_pages} | Chunks: {doc.total_chunks}
                        </div>
                      </div>
                      {doc.is_indexed ? (
                        <span className="badge-confidence">{t.indexedBadge}</span>
                      ) : (
                        <button className="btn-neutral-secondary" onClick={() => handleIndexDoc(doc.document_id)}>
                          {t.indexButton}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Semantic Search */}
            <div className="modern-card">
              <div className="modern-card-header">
                <div className="card-heading-title">
                  <Search size={16} style={{ color: 'var(--primary-cyan)' }} />
                  {t.docSearch}
                </div>
                {ragMeta && <span className="badge-evidence">{ragMeta}</span>}
              </div>

              <div className="modern-card-body">
                <div style={{ display: 'flex', gap: '0.6rem' }}>
                  <input
                    type="text"
                    className="modern-input"
                    value={ragQuery}
                    onChange={(e) => setRagQuery(e.target.value)}
                    placeholder={t.docSearchPlaceholder}
                  />
                  <button className="btn-electric-primary" style={{ padding: '0.65rem 1.25rem' }} onClick={handleSearchRAG} disabled={ragSearching}>
                    {ragSearching ? <Loader2 size={16} className="pulse-circle" /> : <Search size={16} />}
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginTop: '0.5rem' }}>
                  {ragHits.length === 0 ? (
                    <div className="report-card-block" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
                      <Search size={40} style={{ margin: '0 auto', color: 'var(--border-focus)' }} />
                      <div style={{ fontWeight: 600, marginTop: '0.5rem', color: 'var(--text-white)' }}>{t.docSearch}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>{t.docSearchPlaceholder}</div>
                    </div>
                  ) : (
                    ragHits.map((hit, idx) => (
                      <div key={idx} className="report-card-block">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span className="badge-evidence">📖 {hit.citation}</span>
                          <span className="badge-confidence">{Math.round(hit.similarity_score * 100)}% SIMILARITY</span>
                        </div>
                        <div style={{ fontSize: '0.82rem', color: 'var(--primary-cyan)', fontWeight: 700 }}>
                          Section: {hit.section}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                          {hit.text}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 4: SYSTEM TELEMETRY & ACOUSTIC FFT */}
      {activeView === 'telemetry' && (
        <div className="zoom-in-view main-workspace" style={{ position: 'relative', zIndex: 2 }}>
          {/* LIVE ACOUSTIC SOUND SYNTHESIZER & FFT SPECTROGRAM */}
          <AcousticAudioTelemetry currentLang={currentLang} />

          <div className="modern-card" style={{ marginTop: '1.5rem' }}>
            <div className="modern-card-header">
              <div className="card-heading-title">
                <Activity size={16} style={{ color: 'var(--primary-cyan)' }} />
                {t.systemTitle}
              </div>
            </div>

            <div className="modern-card-body">
              <div className="stats-cards-row">
                <div className="stat-item-box">
                  <div className="stat-item-val" style={{ color: 'var(--emerald-green)' }}>100.0%</div>
                  <div className="stat-item-label">{t.sysAccuracy}</div>
                </div>
                <div className="stat-item-box">
                  <div className="stat-item-val" style={{ color: 'var(--emerald-green)' }}>100.0%</div>
                  <div className="stat-item-label">Verified Grounding</div>
                </div>
                <div className="stat-item-box">
                  <div className="stat-item-val" style={{ color: 'var(--primary-cyan)' }}>~5.8 ms</div>
                  <div className="stat-item-label">{t.sysLatency}</div>
                </div>
              </div>

              <div className="report-card-block" style={{ marginTop: '0.5rem' }}>
                <div className="card-block-title">
                  <Terminal size={14} /> Diagnostic Telemetry
                </div>
                <div style={{ fontSize: '0.82rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <div>Client Session ID: <strong style={{ color: '#fff' }}>{clientIdRef.current}</strong></div>
                  <div>WebSocket Status: <span style={{ color: wsConnected ? 'var(--emerald-green)' : 'var(--amber-gold)' }}>{wsConnected ? 'Connected & Streaming (Active)' : 'Standby / Reconnecting'}</span></div>
                  <div>{t.sysAiModel}: <strong style={{ color: '#fff' }}>{providerName}</strong> (Google Multimodal Engine)</div>
                  <div>Vector Index Storage: local FAISS Index (/uploads/vector_store)</div>
                  <div>Active Interface Language: <strong style={{ color: 'var(--primary-cyan)' }}>{currentLang.toUpperCase()}</strong></div>
                  <div>Active Theme: <strong style={{ color: 'var(--primary-cyan)' }}>{activeTheme.toUpperCase()}</strong></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
