export type SupportedLanguage = 'en' | 'ml' | 'ar' | 'ja';
export type AppTheme = 'silver' | 'cyber' | 'hazard' | 'emerald' | 'light';

export interface Translations {
  // Navigation & Header
  appTitle: string;
  appSubtitle: string;
  homeNav: string;
  tabInspect: string;
  tabVideo: string;
  tabDocs: string;
  tabSystem: string;
  apiOnline: string;
  apiConnecting: string;
  telemetryLive: string;
  telemetryStandby: string;
  unitName: string;
  facilityStatus: string;
  reset: string;
  printReport: string;
  themeLabel: string;
  backToHome: string;
  activeModuleLabel: string;

  // Workflow Stepper
  step1_title: string;
  step2_title: string;
  step3_title: string;
  step4_title: string;
  nextStep: string;
  prevStep: string;

  // Home Central Hub (4 Feature Boxes)
  homeTitle: string;
  homeSubtitle: string;
  modulesHeader: string;
  modulesKicker: string;
  box1_title: string;
  box1_desc: string;
  box1_badge: string;
  box1_action: string;

  box2_title: string;
  box2_desc: string;
  box2_badge: string;
  box2_action: string;

  box3_title: string;
  box3_desc: string;
  box3_badge: string;
  box3_action: string;

  box4_title: string;
  box4_desc: string;
  box4_badge: string;
  box4_action: string;

  // Equipment Fleet
  fleetTitle: string;
  fleetSub: string;
  clickToInspect: string;

  // Pre-configured Equipment
  PMP_name: string;
  PMP_specs: string;
  PMP_status: string;
  PMP_notes: string;
  PMP_query: string;

  MTR_name: string;
  MTR_specs: string;
  MTR_status: string;
  MTR_notes: string;
  MTR_query: string;

  CMP_name: string;
  CMP_specs: string;
  CMP_status: string;
  CMP_notes: string;
  CMP_query: string;

  // Setup Console
  setupTitle: string;
  machineTag: string;
  urgency: string;
  urgencyCritical: string;
  urgencyWarning: string;
  urgencyStandard: string;
  photoTitle: string;
  photoDrop: string;
  photoDropSub: string;
  activeEvidence: string;
  notesTitle: string;
  notesPlaceholder: string;
  recordVoice: string;
  stopRecord: string;
  recordingActive: string;
  voiceNotSupported: string;
  manualSelect: string;
  allManuals: string;
  startInspection: string;
  runningInspection: string;

  // Report & Audio
  tabReport: string;
  tabSteps: string;
  tabRaw: string;
  awaitingTitle: string;
  awaitingSub: string;
  runNow: string;
  verifiedAnomaly: string;
  summaryTitle: string;
  findingsTitle: string;
  causesTitle: string;
  checklistTitle: string;
  safetyTitle: string;
  listenReport: string;
  stopAudio: string;
  audioPlaying: string;
  checksVerified: string;
  standardLabel: string;
  evidenceLabel: string;

  // Video Tab
  videoTitle: string;
  videoUpload: string;
  videoNotes: string;
  videoStart: string;
  videoAnalyzing: string;
  videoNoActive: string;
  videoSaved: string;
  videoFrames: string;
  videoTotal: string;
  videoSummary: string;

  // Manuals Tab
  docCatalog: string;
  docUpload: string;
  docSearch: string;
  docSearchPlaceholder: string;
  indexedBadge: string;
  indexButton: string;

  // System Tab
  systemTitle: string;
  sysLatency: string;
  sysAccuracy: string;
  sysAiModel: string;
}

export const translations: Record<SupportedLanguage, Translations> = {
  en: {
    appTitle: 'SYNAPSE OPS',
    appSubtitle: 'Smart Plant Diagnostics & Machine Health',
    homeNav: 'Home Portal',
    tabInspect: 'Inspect Machine',
    tabVideo: 'Video Check',
    tabDocs: 'Repair Guides',
    tabSystem: 'Live Sensors',
    apiOnline: 'SYSTEM ONLINE',
    apiConnecting: 'CONNECTING...',
    telemetryLive: 'LIVE STREAM ACTIVE',
    telemetryStandby: 'STANDBY',
    unitName: 'PLANT UNIT-4',
    facilityStatus: 'FACILITY SECTOR B: ACTIVE LINE',
    reset: 'Reset',
    printReport: 'Print Work Order',
    themeLabel: 'Theme',
    backToHome: '← Back to Home',
    activeModuleLabel: 'Active Module',

    step1_title: '01. Select Machine',
    step2_title: '02. Inspection Setup',
    step3_title: '03. Work Order Report',
    step4_title: '04. Live Sound & Sensors',
    nextStep: 'Proceed to Next Step →',
    prevStep: '← Previous Step',

    homeTitle: 'SYNAPSE OPS',
    homeSubtitle: 'Instant machine problem detection, repair guides, and live health monitoring',
    modulesHeader: 'Diagnostic Tools',
    modulesKicker: 'PLANT TOOLS',
    box1_title: 'Inspect Machine',
    box1_desc: 'Check machine photos for loose belts, overheating, and get quick step-by-step repair guides.',
    box1_badge: 'Vision AI · ISO-10816',
    box1_action: 'Inspect Machine →',

    box2_title: 'Video Check',
    box2_desc: 'Scan machinery videos to catch vibrations, clear keyframes, and abnormal motions.',
    box2_badge: 'Video Scanner · 80% Faster',
    box2_action: 'Scan Video →',

    box3_title: 'Repair Guides',
    box3_desc: 'Search official equipment repair manuals and exact safety tolerances instantly.',
    box3_badge: 'Technical Manuals Store',
    box3_action: 'Browse Repair Guides →',

    box4_title: 'Live Sensors',
    box4_desc: 'Track live temperature, vibration meters, sound spectrum, and real-time plant metrics.',
    box4_badge: 'Live Stream · ~5ms Speed',
    box4_action: 'Open Live Sensors →',

    fleetTitle: 'Select Equipment to Inspect',
    fleetSub: 'Click an equipment profile below to load its photo, specs, and problem notes:',
    clickToInspect: 'Click to test this machine',

    PMP_name: 'Centrifugal Slurry Pump',
    PMP_specs: '150 kW · 1480 RPM · V-Belt Drive',
    PMP_status: '⚠️ Loose Belt (32mm Slack)',
    PMP_notes: 'Drive belt is loose with 32mm slack deflection, edge fraying, and 6mm pulley axial offset. Normal limit is 15mm.',
    PMP_query: 'What is the maximum allowable drive belt slack and pulley alignment tolerance?',

    MTR_name: 'Electric Motor',
    MTR_specs: '400V · 55 kW · Heavy Duty Bearings',
    MTR_status: '🔴 Overheating (94.5°C)',
    MTR_notes: 'Drive-end bearing housing is overheating at 94.5°C with discolored grease smell. Safe limit is 75°C.',
    MTR_query: 'Permissible maximum temperature limit for motor bearing housing',

    CMP_name: 'Rotary Air Compressor',
    CMP_specs: '8.2 Bar Operating · Safety Port',
    CMP_status: '🟡 Air Leak Hissing (8.2 Bar)',
    CMP_notes: 'Air leak hissing sound and moisture around safety relief valve port at 8.2 bar operating pressure.',
    CMP_query: 'Air compressor safety valve premature lifting and pressure settings',

    setupTitle: 'Inspection Setup',
    machineTag: 'Machine Name / ID',
    urgency: 'Urgency Level',
    urgencyCritical: 'High (Immediate Action Required)',
    urgencyWarning: 'Medium (Warning / Drift)',
    urgencyStandard: 'Low (Routine Inspection)',
    photoTitle: 'Machine Photo',
    photoDrop: 'Upload Machine Photo',
    photoDropSub: 'Click or drag photo here (JPG, PNG max 25MB)',
    activeEvidence: 'Active Photographic Evidence',
    notesTitle: 'Problem Description & Notes',
    notesPlaceholder: 'Describe the abnormal sound, heating, vibration, or use voice recording...',
    recordVoice: 'Voice Input',
    stopRecord: 'Stop Voice',
    recordingActive: 'Listening... Speak now',
    voiceNotSupported: 'Microphone speech recognition is not supported in this browser.',
    manualSelect: 'Safety Manual to Cross-Check',
    allManuals: '-- Check All Indexed Safety Manuals --',
    startInspection: 'Start AI Inspection',
    runningInspection: 'Analyzing Photo & Checking Manuals...',

    tabReport: 'Inspection Report',
    tabSteps: 'AI Steps Taken',
    tabRaw: 'Raw Data',
    awaitingTitle: 'READY FOR INSPECTION',
    awaitingSub: 'Selected Asset: ',
    runNow: 'Run Inspection Now',
    verifiedAnomaly: 'MACHINE ISSUE CONFIRMED',
    summaryTitle: 'Problem Summary',
    findingsTitle: 'Photo Findings',
    causesTitle: 'Likely Causes from Manual',
    checklistTitle: 'Action Checklist to Fix Problem',
    safetyTitle: 'Important Safety Warnings',
    listenReport: 'Listen to Report',
    stopAudio: 'Stop Audio',
    audioPlaying: 'Reading Report Aloud...',
    checksVerified: 'CHECKS COMPLETED',
    standardLabel: 'Standard Reference',
    evidenceLabel: 'Manual Citation',

    videoTitle: 'Machine Video Inspection',
    videoUpload: 'Select Machine Video (MP4, MOV)',
    videoNotes: 'Video Notes & Observations',
    videoStart: 'Start Video Inspection',
    videoAnalyzing: 'Extracting Clear Frames & Checking Issues...',
    videoNoActive: 'No Video Analyzed Yet',
    videoSaved: 'Token Cost Saved',
    videoFrames: 'Clear Frames',
    videoTotal: 'Sampled Frames',
    videoSummary: 'Video Findings Summary',

    docCatalog: 'Safety Manuals Catalog',
    docUpload: 'Upload New PDF Manual',
    docSearch: 'Search in Manuals',
    docSearchPlaceholder: 'Search for tolerances, clearances, lubrication...',
    indexedBadge: 'INDEXED',
    indexButton: 'Index Manual',

    systemTitle: 'Live System Telemetry',
    sysLatency: 'Query Speed',
    sysAccuracy: 'Safety Accuracy',
    sysAiModel: 'Multimodal AI Engine'
  },

  ml: {
    appTitle: 'SYNAPSE OPS',
    appSubtitle: 'സ്മാർട്ട് മെഷീൻ പരിശോധന',
    homeNav: 'ഹോം',
    tabInspect: 'മെഷീൻ പരിശോധന',
    tabVideo: 'വീഡിയോ പരിശോധന',
    tabDocs: 'റിപ്പയർ പുസ്തകങ്ങൾ',
    tabSystem: 'ലൈവ് സെൻസറുകൾ',
    apiOnline: 'സിസ്റ്റം റെഡിയാണ്',
    apiConnecting: 'കണക്ട് ചെയ്യുന്നു...',
    telemetryLive: 'തത്സമയം പ്രവർത്തിക്കുന്നു',
    telemetryStandby: 'സ്റ്റാൻഡ്‌ബൈ',
    unitName: 'പ്ലാന്റ് യൂണിറ്റ്-4',
    facilityStatus: 'സെക്ടർ B: ലൈൻ 2 പ്രവർത്തിക്കുന്നു',
    reset: 'ക്ലിയർ ചെയ്യുക',
    printReport: 'വർക്ക് ഓർഡർ പ്രിന്റ് ചെയ്യുക',
    themeLabel: 'തീം',
    backToHome: '← ഹോമിലേക്ക് മടങ്ങുക',
    activeModuleLabel: 'നിലവിലെ ടൂൾ',

    step1_title: '01. മെഷീൻ തിരഞ്ഞെടുക്കുക',
    step2_title: '02. പരിശോധനാ വിവരങ്ങൾ',
    step3_title: '03. വർക്ക് ഓർഡർ റിപ്പോർട്ട്',
    step4_title: '04. ലൈവ് സൗണ്ടും സെൻസറുകളും',
    nextStep: 'അടുത്ത ഘട്ടത്തിലേക്ക് പോകുക →',
    prevStep: '← മുൻപത്തെ ഘട്ടം',

    homeTitle: 'SYNAPSE OPS',
    homeSubtitle: 'മെഷീനുകളിലെ തകരാറുകൾ വേഗത്തിൽ കണ്ടെത്താനും പരിഹരിക്കാനുമുള്ള സ്മാർട്ട് സിസ്റ്റം',
    modulesHeader: 'പ്രധാന പരിശോധനാ ടൂളുകൾ',
    modulesKicker: 'പ്ലാന്റ് ടൂളുകൾ',
    box1_title: 'മെഷീൻ പരിശോധന',
    box1_desc: 'ഫോട്ടോ നോക്കി മെഷീനിലെ ചൂട്, ലൂസായ ബെൽറ്റ് തുടങ്ങിയ തകരാറുകൾ കണ്ടെത്തി പരിഹാരങ്ങൾ നൽകുന്നു.',
    box1_badge: 'ഫോട്ടോ സ്കാൻ · ISO-10816',
    box1_action: 'മെഷീൻ പരിശോധിക്കുക →',

    box2_title: 'വീഡിയോ പരിശോധന',
    box2_desc: 'മെഷീൻ ഓടുന്ന വീഡിയോ കണ്ട് വൈബ്രേഷനുകളും അനക്കങ്ങളും വ്യക്തമായി കണ്ടെത്തുന്നു.',
    box2_badge: 'വീഡിയോ സ്കാനർ · 80% വേഗത',
    box2_action: 'വീഡിയോ കാണുക →',

    box3_title: 'റിപ്പയർ പുസ്തകങ്ങൾ',
    box3_desc: 'മെഷീൻ കമ്പനിയുടെ റിപ്പയർ പുസ്തകങ്ങളും ശരിയായ അളവുകളും പെട്ടെന്ന് തിരഞ്ഞു കണ്ടെത്തുന്നു.',
    box3_badge: 'മാനുവൽ ലൈബ്രറി',
    box3_action: 'പുസ്തകങ്ങൾ കാണുക →',

    box4_title: 'ലൈവ് സെൻസറുകൾ',
    box4_desc: 'മെഷീന്റെ ചൂട്, വിറയൽ, തത്സമയ ശബ്ദം എന്നിവ ലൈവായി സ്ക്രീനിൽ നിരീക്ഷിക്കുന്നു.',
    box4_badge: 'ലൈവ് മീറ്റർ · ~5ms',
    box4_action: 'സെൻസർ മീറ്റർ തുറക്കുക →',

    fleetTitle: 'പരിശോധിക്കേണ്ട മെഷീൻ തിരഞ്ഞെടുക്കുക',
    fleetSub: 'ഫോട്ടോയും വിവരങ്ങളും ലോഡ് ചെയ്യാൻ താഴെയുള്ള ഏതെങ്കിലും മെഷീനിൽ ക്ലിക്ക് ചെയ്യുക:',
    clickToInspect: 'ഈ മെഷീൻ പരിശോധിക്കാൻ ക്ലിക്ക് ചെയ്യുക',

    PMP_name: 'സ്ലറി പമ്പ് (Slurry Pump)',
    PMP_specs: '150 kW · 1480 RPM · ബെൽറ്റ് ഡ്രൈവ്',
    PMP_status: '⚠️ അയഞ്ഞ ബെൽറ്റ് (32mm ലൂസ്)',
    PMP_notes: 'ഡ്രൈവ് ബെൽറ്റ് 32mm അയഞ്ഞിരിക്കുന്നു, അരികുകൾ ചതഞ്ഞിട്ടുണ്ട്, 6mm അലൈൻമെന്റ് തെറ്റാണ്. സാധാരണ പരിധി 15mm ആണ്.',
    PMP_query: 'ബെൽറ്റ് അയവിന്റെ പരമാവധി അനുവദനീയ പരിധി എത്രയാണ്?',

    MTR_name: 'ഇലക്ട്രിക് മോട്ടോർ (Electric Motor)',
    MTR_specs: '400V · 55 kW · ബെയറിങ് ഡ്രൈവ്',
    MTR_status: '🔴 അമിത ചൂട് (94.5°C)',
    MTR_notes: 'മോട്ടോർ ബെയറിങ് 94.5°C ആയി അമിതമായി ചൂടാകുന്നു, ഗ്രീസ് ഉരുകിയ മണം വരുന്നു. സുരക്ഷിത പരിധി 75°C ആണ്.',
    MTR_query: 'മോട്ടോർ ബെയറിങ് പരമാവധി സുരക്ഷിത താപനില പരിധി എത്രയാണ്?',

    CMP_name: 'എയർ കംപ്രസ്സർ (Air Compressor)',
    CMP_specs: '8.2 ബാർ വർക്കിങ് പ്രഷർ · സേഫ്റ്റി വാൽവ്',
    CMP_status: '🟡 എയർ ലീക്ക് ശബ്ദം (8.2 ബാർ)',
    CMP_notes: '8.2 ബാർ പ്രഷറിൽ സേഫ്റ്റി വാൽവിൽ നിന്ന് കാറ്റ് പുറത്തേക്ക് ചീറ്റുന്ന ശബ്ദവും ഈർപ്പവും കാണുന്നു.',
    CMP_query: 'കംപ്രസ്സർ സേഫ്റ്റി വാൽവ് പ്രഷർ സെറ്റിംഗ്സ് വിവരങ്ങൾ',

    setupTitle: 'പരിശോധനാ വിവരങ്ങൾ നൽകുക',
    machineTag: 'മെഷീന്റെ പേര് / ഐഡി',
    urgency: 'തീവ്രത (അടിയന്തിരത)',
    urgencyCritical: 'ഉയർന്നത് (ഉടൻ പരിഹരിക്കണം)',
    urgencyWarning: 'മിതമായത് (മുന്നറിയിപ്പ്)',
    urgencyStandard: 'സാധാരണ പരിശോധന',
    photoTitle: 'മെഷീന്റെ ഫോട്ടോ',
    photoDrop: 'മെഷീന്റെ ഫോട്ടോ അപ്‌ലോഡ് ചെയ്യുക',
    photoDropSub: 'ഇവിടെ ക്ലിക്ക് ചെയ്യുകയോ ഫോട്ടോ ഡ്രോപ്പ് ചെയ്യുകയോ ചെയ്യുക (JPG, PNG)',
    activeEvidence: 'പരിശോധനയ്ക്കുള്ള ഫോട്ടോ',
    notesTitle: 'പ്രശ്ന വിവരണം (ശബ്ദം വഴിയോ എഴുതിയോ നൽകാം)',
    notesPlaceholder: 'മെഷീനിൽ കണ്ട ശബ്ദം, ചൂട്, വിറയൽ എന്നിവ ഇവിടെ എഴുതുക അല്ലെങ്കിൽ മൈക്ക് വഴി പറയുക...',
    recordVoice: 'ശബ്ദം നൽകുക (Mic)',
    stopRecord: 'നിർത്തുക',
    recordingActive: 'ശബ്ദം കേൾക്കുന്നു... സംസാരിക്കൂ',
    voiceNotSupported: 'ഈ ബ്രൗസറിൽ മൈക്രോഫോൺ സ്പീച്ച് റെക്കഗ്നിഷൻ ലഭ്യമല്ല.',
    manualSelect: 'പരിശോധിക്കേണ്ട സേഫ്റ്റി മാനുവൽ',
    allManuals: '-- എല്ലാ സേഫ്റ്റി മാനുവലുകളും ഒത്തുനോക്കുക --',
    startInspection: 'പരിശോധന തുടങ്ങുക',
    runningInspection: 'എഐ ഫോട്ടോയും മാനുവലുകളും ഒത്തുനോക്കുന്നു...',

    tabReport: 'പരിശോധനാ ഫലം',
    tabSteps: 'AI എടുത്ത നടപടികൾ',
    tabRaw: 'റോ ഡാറ്റ (JSON)',
    awaitingTitle: 'പരിശോധന തുടങ്ങാൻ തയാറാണ്',
    awaitingSub: 'തിരഞ്ഞെടുത്ത മെഷീൻ: ',
    runNow: 'ഇപ്പോൾ പരിശോധിക്കുക',
    verifiedAnomaly: 'മെഷീനിൽ തകരാറ് സ്ഥിരീകരിച്ചു',
    summaryTitle: 'പ്രശ്ന സംഗ്രഹം',
    findingsTitle: 'ഫോട്ടോയിൽ കണ്ടെത്തിയ കാര്യങ്ങൾ',
    causesTitle: 'മാനുവൽ പ്രകാരമുള്ള കാരണങ്ങൾ',
    checklistTitle: 'പരിഹരിക്കാൻ ചെയ്യേണ്ട കാര്യങ്ങൾ (Checklist)',
    safetyTitle: 'സുരക്ഷാ മുൻകരുതലുകൾ',
    listenReport: 'റിപ്പോർട്ട് കേൾക്കുക',
    stopAudio: 'ശബ്ദം നിർത്തുക',
    audioPlaying: 'റിപ്പോർട്ട് ശബ്ദത്തിൽ വായിക്കുന്നു...',
    checksVerified: 'കാര്യങ്ങൾ പരിശോധിച്ചു',
    standardLabel: 'റഫറൻസ് മാനുവൽ',
    evidenceLabel: 'മാനുവൽ പേജ്',

    videoTitle: 'മെഷീൻ വീഡിയോ പരിശോധന',
    videoUpload: 'മെഷീന്റെ വീഡിയോ തിരഞ്ഞെടുക്കുക (MP4, MOV)',
    videoNotes: 'വീഡിയോ വിവരണം',
    videoStart: 'വീഡിയോ പരിശോധിക്കുക',
    videoAnalyzing: 'വീഡിയോയിൽ നിന്ന് വ്യക്തമായ ഫ്രെയിമുകൾ എടുക്കുന്നു...',
    videoNoActive: 'വീഡിയോ ഇതുവരെ ചേർത്തിട്ടില്ല',
    videoSaved: 'ലാഭിച്ച പ്രോസസ്സിംഗ് ചെലവ്',
    videoFrames: 'വ്യക്തമായ ഫ്രെയിമുകൾ',
    videoTotal: 'എടുത്ത ആകെ ഫ്രെയിമുകൾ',
    videoSummary: 'വീഡിയോ പരിശോധനാ സംഗ്രഹം',

    docCatalog: 'സേഫ്റ്റി മാനുവലുകളുടെ ശേഖരം',
    docUpload: 'പുതിയ PDF മാനുവൽ ചേർക്കുക',
    docSearch: 'മാനുവലിൽ തിരയുക',
    docSearchPlaceholder: 'അളവുകൾ, ഓയിൽ മാറ്റേണ്ട സമയം, സുരക്ഷ എന്നിവ തിരയുക...',
    indexedBadge: 'സേവ് ചെയ്തു',
    indexButton: 'ഇൻഡക്സ് ചെയ്യുക',

    systemTitle: 'ലൈവ് സിസ്റ്റം അവസ്ഥ',
    sysLatency: 'തിരയൽ വേഗത',
    sysAccuracy: 'കൃത്യത നിരക്ക്',
    sysAiModel: 'എഐ എഞ്ചിൻ'
  },

  ar: {
    appTitle: 'SYNAPSE OPS',
    appSubtitle: 'تشخيص أعطال الآلات الصناعية بالذكاء الاصطناعي',
    homeNav: 'الرئيسية',
    tabInspect: 'فحص المعدة',
    tabVideo: 'فحص الفيديو',
    tabDocs: 'أدلة التشغيل',
    tabSystem: 'حالة النظام',
    apiOnline: 'النظام متصل',
    apiConnecting: 'جارٍ الاتصال...',
    telemetryLive: 'البث المباشر نشط',
    telemetryStandby: 'في وضع الاستعداد',
    unitName: 'وحدة المصنع 4',
    facilityStatus: 'القطاع ب: الخط 2 قيد التشغيل',
    reset: 'إعادة ضبط',
    printReport: 'طباعة التقرير',
    themeLabel: 'السمة',
    backToHome: '← العودة للبوابة الرئيسية',
    activeModuleLabel: 'الوحدة النشطة',

    step1_title: '01. اختيار المعدة',
    step2_title: '02. إعداد الفحص',
    step3_title: '03. تقرير أمر العمل',
    step4_title: '04. الحساسات والصوت المباشر',
    nextStep: 'الانتقال للخطوة التالية →',
    prevStep: '← الخطوة السابقة',

    homeTitle: 'SYNAPSE OPS',
    homeSubtitle: 'تشخيص فوري مدعوم بالرؤية الحاسوبية، مطابقة أدلة التشغيل، والبث المباشر للبيانات',
    modulesHeader: 'أجنحة الفحص والتشخيص الرئيسية',
    modulesKicker: 'وحدات الفحص الميداني',
    box1_title: 'فحص المعدات',
    box1_desc: 'تحليل صور المعدات، قياس انحراف السيور، رصد السخونة المفرطة، واستخراج خطوات الإصلاح.',
    box1_badge: 'ذكاء بصري · معايير ISO',
    box1_action: 'فتح فحص المعدات →',

    box2_title: 'فحص الفيديو',
    box2_desc: 'تحليل مقاطع الفيديو الحية، استخراج الإطارات الواضحة بدقة، وتوفير 80% من تكلفة المعالجة.',
    box2_badge: 'تصفية 1 FPS · توفير 80%',
    box2_action: 'فتح استوديو الفيديو →',

    box3_title: 'أدلة التشغيل',
    box3_desc: 'المطابقة الذكية مع أدلة التشغيل ومكتبة الكتيبات للوصول الفوري إلى معايير التفاوت المعتمدة.',
    box3_badge: 'مكتبة FAISS الذكية',
    box3_action: 'تصفح الأدلة الفنية →',

    box4_title: 'حالة النظام',
    box4_desc: 'متابعة البث المباشر لحالة الأجهزة، سرعة استجابة النموذج، وسجلات الأداء الحية والمطابقة.',
    box4_badge: 'بث مباشر · استجابة 5 مللي ثانية',
    box4_action: 'عرض سجل النظام →',

    fleetTitle: 'اختر المعدة للفحص',
    fleetSub: 'اضغط على أي جهاز أدناه لتحميل الصور والمواصفات والملاحظات:',
    clickToInspect: 'اضغط لفحص هذه المعدة',

    PMP_name: 'مضخة الطين المركزية',
    PMP_specs: '150 كيلوواط · 1480 دورة · محرك بالسيور',
    PMP_status: '⚠️ سير مرتخٍ (32 ملم ارتخاء)',
    PMP_notes: 'سير المحرك مرتخٍ بمقدار 32 ملم وتوجد تشققات على الأطراف وانحراف 6 ملم. الحد الطبيعي 15 ملم.',
    PMP_query: 'ما هو الحد الأقصى المسموح به لارتخاء سيور الحركة؟',

    MTR_name: 'محرك كهربائي صناعي',
    MTR_specs: '400 فولت · 55 كيلوواط · محامل متينة',
    MTR_status: '🔴 ارتفاع حرارة شديد (94.5 مئوية)',
    MTR_notes: 'ترتفع حرارة غطاء المحمل إلى 94.5 درجة مئوية مع تغير لون الشحم وظهور رائحة حرق. الحد الآمن 75 مئوية.',
    MTR_query: 'الحد الأقصى لدرجة حرارة تشغيل محامل المحركات الكهربائية',

    CMP_name: 'ضاغط هواء حلزوني',
    CMP_specs: 'ضغط تشغيل 8.2 بار · صمام أمان',
    CMP_status: '🟡 صوت تسرب هواء (8.2 بار)',
    CMP_notes: 'صوت هسهسة وتسرب هواء واضح ورطوبة عند صمام الأمان تحت ضغط تشغيل 8.2 بار.',
    CMP_query: 'إعدادات ضغط صمام الأمان لضاغط الهواء',

    setupTitle: 'إعدادات الفحص',
    machineTag: 'رقم أو اسم الجهاز',
    urgency: 'مستوى الأهمية',
    urgencyCritical: 'عالي (يتطلب تدخلاً فورياً)',
    urgencyWarning: 'متوسط (تحذير ومتابعة)',
    urgencyStandard: 'منخفض (فحص دوري عادي)',
    photoTitle: 'صورة المعدة',
    photoDrop: 'رفع صورة المعدة',
    photoDropSub: 'انقر أو اسحب الصورة هنا (JPG أو PNG بحد أقصى 25 ميجابايت)',
    activeEvidence: 'صورة الفحص المعتمدة',
    notesTitle: 'وصف المشكلة والملاحظات',
    notesPlaceholder: 'صف المشكلة أو الأصوات أو استخدم التسجيل الصوتي...',
    recordVoice: 'تسجيل صوتي',
    stopRecord: 'إيقاف التسجيل',
    recordingActive: 'جاري الاستماع... تحدث الآن',
    voiceNotSupported: 'التعرف على الصوت عبر الميكروفون غير مدعوم في هذا المتصفح.',
    manualSelect: 'دليل السلامة للمطابقة',
    allManuals: '-- مطابقة جميع أدلة السلامة الفنية --',
    startInspection: 'بدء الفحص الذكي',
    runningInspection: 'الذكاء الاصطناعي يحلل الصورة والكتيبات...',

    tabReport: 'تقرير الفحص',
    tabSteps: 'خطوات الذكاء الاصطناعي',
    tabRaw: 'بيانات JSON',
    awaitingTitle: 'جاهز لبدء الفحص',
    awaitingSub: 'المعدة المختارة: ',
    runNow: 'ابدأ الفحص الآن',
    verifiedAnomaly: 'تم تأكيد وجود عطل في الجهاز',
    summaryTitle: 'ملخص الحالة والتشخيص',
    findingsTitle: 'ملاحظات تحليل الصورة',
    causesTitle: 'الأسباب المرجحة من دليل التشغيل',
    checklistTitle: 'قائمة خطوات الإصلاح المعتمدة',
    safetyTitle: 'تعليمات السلامة والحماية',
    listenReport: 'استمع للتقرير',
    stopAudio: 'إيقاف الصوت',
    audioPlaying: 'جارٍ قراءة التقرير صوتياً...',
    checksVerified: 'خطوات تم فحصها',
    standardLabel: 'المعيار القياسي',
    evidenceLabel: 'المرجع من الدليل',

    videoTitle: 'فحص فيديو الآلات',
    videoUpload: 'اختر فيديو المعدة (MP4, MOV)',
    videoNotes: 'ملاحظات الفيديو',
    videoStart: 'بدء فحص الفيديو',
    videoAnalyzing: 'استخراج الإطارات الواضحة بدقة...',
    videoNoActive: 'لم يتم تحليل أي فيديو بعد',
    videoSaved: 'التكلفة الموفرة',
    videoFrames: 'إطارات واضحة',
    videoTotal: 'إجمالي الإطارات',
    videoSummary: 'ملخص فحص الفيديو',

    docCatalog: 'مكتبة أدلة التشغيل',
    docUpload: 'رفع دليل جديد (PDF)',
    docSearch: 'البحث في الأدلة',
    docSearchPlaceholder: 'ابحث عن حدود التفاوت، خلوص المحامل، التزييت...',
    indexedBadge: 'مفهرس',
    indexButton: 'فهرسة الدليل',

    systemTitle: 'حالة النظام المباشرة',
    sysLatency: 'سرعة الاستجابة',
    sysAccuracy: 'دقة المطابقة',
    sysAiModel: 'محرك الذكاء الاصطناعي'
  },

  ja: {
    appTitle: 'SYNAPSE OPS',
    appSubtitle: '工場設備・プラント機器のAI保全システム',
    homeNav: 'ポータルホーム',
    tabInspect: '機器の診断',
    tabVideo: '動画診断',
    tabDocs: '作業手順書',
    tabSystem: 'システム状態',
    apiOnline: 'システム正常稼働中',
    apiConnecting: '接続中...',
    telemetryLive: 'リアルタイム通信中',
    telemetryStandby: '待機中',
    unitName: '第4プラント',
    facilityStatus: 'B区画: 第2ライン稼働中',
    reset: 'リセット',
    printReport: 'レポート印刷',
    themeLabel: 'テーマ',
    backToHome: '← ポータルホームに戻る',
    activeModuleLabel: '選択中のモジュール',

    step1_title: '01. 機器の選択',
    step2_title: '02. 診断の準備',
    step3_title: '03. 作業指示書・診断結果',
    step4_title: '04. 音響・センサー監視',
    nextStep: '次の工程へ進む →',
    prevStep: '← 前の工程に戻る',

    homeTitle: 'SYNAPSE OPS',
    homeSubtitle: '画像認識、手順書RAG照合、リアルタイムテレメトリを統合したインテリジェント診断基盤',
    modulesHeader: 'コア診断スイート',
    modulesKicker: 'プラント検査モジュール',
    box1_title: '機器の診断',
    box1_desc: '機器の写真からVベルトのたわみや過熱を検出し、手順書に基づいた点検チェックリストを自動生成します。',
    box1_badge: '画像AI · ISO-10816準拠',
    box1_action: '機器診断を開始する →',

    box2_title: '動画診断',
    box2_desc: '設備の運転動画からブレのない重要コマを1FPSで自動抽出し、トークンコストを80%削減して振動を解析します。',
    box2_badge: '1FPS抽出 · 80%コスト削減',
    box2_action: '動画スタジオを開く →',

    box3_title: '作業手順書',
    box3_desc: '社内の技術資料やマニュアルをFAISSベクトル検索で瞬時に照合し、許容値や給油基準の根拠を提示します。',
    box3_badge: 'FAISSベクトルRAG',
    box3_action: '作業手順書を閲覧する →',

    box4_title: 'システム状態',
    box4_desc: 'リアルタイムのWebSocket通信状況、応答速度、AI推論ログ、稼働SLAを常時モニタリングします。',
    box4_badge: 'WebSocket通信中 · 応答約5ms',
    box4_action: 'システムテレメトリを確認 →',

    fleetTitle: '診断する設備を選択',
    fleetSub: '以下の機器をクリックすると、写真・スペック・問題情報が自動で読み込まれます:',
    clickToInspect: 'クリックして診断を開始',

    PMP_name: '遠心スラリーポンプ',
    PMP_specs: '150 kW · 1480 RPM · Vベルト駆動',
    PMP_status: '⚠️ ベルトの緩み (32mmたわみ)',
    PMP_notes: 'Vベルトのたわみが32mmあり、端部の摩耗および6mmの軸ズレが確認されました。正常許容値は15mmです。',
    PMP_query: 'ドライブベルトの最大許容たわみとプーリーのアライメント許容値は？',

    MTR_name: '三相誘導電動機 (モーター)',
    MTR_specs: '400V · 55 kW · ドライブ軸受',
    MTR_status: '🔴 異常過熱 (94.5°C)',
    MTR_notes: '負荷側軸受ハウジングが94.5°Cに達しており、グリースの変色と異臭が発生しています。安全基準上限は75°Cです。',
    MTR_query: 'モーターベアリングハウジングの許容最高運転温度基準',

    CMP_name: 'スクリューエアコンプレッサー',
    CMP_specs: '常用圧力 8.2 Bar · 安全弁',
    CMP_status: '🟡 空気漏れ異音 (8.2 Bar)',
    CMP_notes: '8.2 Bar運転時に安全逃がし弁周辺からシューという空気漏れ音と水分が確認されます。',
    CMP_query: 'エアコンプレッサー安全弁の吹き始め圧力設定基準',

    setupTitle: '診断設定・入力',
    machineTag: '機器名 / 管理番号',
    urgency: '緊急度レベル',
    urgencyCritical: '高（早急な対応が必要）',
    urgencyWarning: '中（警告・観察）',
    urgencyStandard: '低（定期点検）',
    photoTitle: '機器の写真',
    photoDrop: '機器の写真をアップロード',
    photoDropSub: '写真をクリックまたはドラッグ＆ドロップ (JPG, PNG 最大25MB)',
    activeEvidence: '診断対象の撮影画像',
    notesTitle: '症状の説明・測定メモ (音声入力可)',
    notesPlaceholder: '異音、発熱、振動などの状態を入力するか、マイクで話してください...',
    recordVoice: '音声入力',
    stopRecord: '停止',
    recordingActive: '聞き取り中... 話してください',
    voiceNotSupported: 'お使いのブラウザは音声認識機能に対応していません。',
    manualSelect: '参照する安全マニュアル',
    allManuals: '-- 登録済みの全マニュアルを照合 --',
    startInspection: 'AI診断を開始',
    runningInspection: '画像と手順書をAIが照合・解析中...',

    tabReport: '診断レポート',
    tabSteps: 'AI実行プロセス',
    tabRaw: 'RAWデータ (JSON)',
    awaitingTitle: '診断準備完了',
    awaitingSub: '選択中の機器: ',
    runNow: '今すぐ診断を実行',
    verifiedAnomaly: '機器の異常が確認されました',
    summaryTitle: '診断結果サマリー',
    findingsTitle: '画像から検出された所見',
    causesTitle: 'マニュアルに基づく推定原因',
    checklistTitle: '点検・対処チェックリスト',
    safetyTitle: '安全上の注意事項と警告',
    listenReport: 'レポートを音声で聴く',
    stopAudio: '音声を停止',
    audioPlaying: 'レポートを読み上げています...',
    checksVerified: '項目点検完了',
    standardLabel: '準拠規格',
    evidenceLabel: 'マニュアル引用',

    videoTitle: '機器の動画自動診断',
    videoUpload: '動画ファイルを選択 (MP4, MOV)',
    videoNotes: '動画の観察メモ',
    videoStart: '動画診断を実行',
    videoAnalyzing: '重要コマの抽出とブレ補正を実行中...',
    videoNoActive: '解析対象の動画はありません',
    videoSaved: 'トークン削減率',
    videoFrames: 'クリアな重要コマ',
    videoTotal: 'サンプリング数',
    videoSummary: '動画診断結果サマリー',

    docCatalog: '作業手順書 (SOP) カタログ',
    docUpload: '新規PDF手順書を登録',
    docSearch: '手順書内を検索',
    docSearchPlaceholder: '許容値、クリアランス、給油サイクルなどを検索...',
    indexedBadge: 'インデックス済',
    indexButton: '登録・索引化',

    systemTitle: 'システムリアルタイム情報',
    sysLatency: '検索応答速度',
    sysAccuracy: '引用整合率',
    sysAiModel: '搭載マルチモーダルAI'
  }
};
