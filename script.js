/**
 * Komal Creations Training Center (KCTC) - Core JavaScript State Engine
 * SPDX-License-Identifier: Apache-2.0
 */

// --- SUPABASE CONFIGURATION (auto-switches between dev & production) ---
// Local testing (file://, localhost) → Dev database
// Deployed (GitHub Pages, custom domain) → Production database
const SUPABASE_CONFIG = {
  dev: {
    url: 'https://ixlpwptcyunnradsdyfn.supabase.co',
    key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4bHB3cHRjeXVubnJhZHNkeWZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI4MDU2OTMsImV4cCI6MjA5ODM4MTY5M30.MebT_StSZb486NlN1HqLPS2y3e7GWC9e_Vx9olvSKZ4'
  },
  production: {
    url: 'https://anofihrwtqmuikwmfido.supabase.co',
    key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFub2ZpaHJ3dHFtdWlrd21maWRvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIzNDgwMjYsImV4cCI6MjA5NzkyNDAyNn0.ahgj33d_rV1VVbl2hfbLGPvUVJHNSWUb41PYFQNUYPQ'
  }
};

function detectEnvironment() {
  var host = window.location.hostname;
  if (!host || host === 'localhost' || host === '127.0.0.1' || host === '') return 'dev';
  return 'production';
}

var ENV = detectEnvironment();
var DEFAULT_SUPABASE_URL = SUPABASE_CONFIG[ENV].url;
var DEFAULT_SUPABASE_KEY = SUPABASE_CONFIG[ENV].key;
console.log('KCTC Environment: ' + ENV.toUpperCase() + ' — Supabase: ' + DEFAULT_SUPABASE_URL);

// --- STATIC DATA ---
const CREATIONS = [
  { id: 'cr1', name: "Ethnic Heavy Anarkali Gown", category: "ethnic", image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=400" },
  { id: 'cr2', name: "Designer Bridal Saree Blouse", category: "ethnic", image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=400" },
  { id: 'cr3', name: "Princess Cut Western Evening Gown", category: "western", image: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&q=80&w=400" },
  { id: 'cr4', name: "Traditional Punjabi Salwar Suit", category: "ethnic", image: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=80&w=400" },
  { id: 'cr5', name: "Heavy Zardozi Golden Threadwork", category: "embroidery", image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=400" },
  { id: 'cr6', name: "Aari Work Kurti Floral Neckline", category: "embroidery", image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=400" },
  { id: 'cr7', name: "Satin Silk Pleated Ball Gown", category: "western", image: "https://images.unsplash.com/photo-1550639525-c97d455acf70?auto=format&fit=crop&q=80&w=400" },
  { id: 'cr8', name: "Luxury Velvet Kaftan Dress", category: "western", image: "https://images.unsplash.com/photo-1596783074918-c84cb06531ca?auto=format&fit=crop&q=80&w=400" }
];

const TESTIMONIALS = [
  { quote: "Enrolling in the 6-Month Advanced Fashion Designing course was the turning point of my life. Professional pattern cutting and collars taught are outstanding!", name: "Snehal Deshmukh", role: "Alumna, Batch of 2024" },
  { quote: "KCTC's custom stitching for my bridal lehenga was flawless. The designer sleeve work and delicate lace fittings surpassed my expectations.", name: "Priya Sharma", role: "Boutique Customer, Nabha" },
  { quote: "Superb certification program! The verified online ledger certificate helped me secure a tailoring trainer position at a corporate vocational NGO.", name: "Jasprit Kaur", role: "Graduate, Batch of 2025" }
];

const UDYAM_NUMBER = 'UDYAM-PB-17-0108616';

// Courses are now dynamic — managed via Admin Panel → Courses Manager

// --- PRICING TABLES ---
const BASE_PRICES = { kurti: 450, suit: 750, lehenga: 1800, blouse: 400, gown: 1500 };
const FABRIC_MULTIPLIER = { cotton: 1.0, silk: 1.5, georgette: 1.3, velvet: 1.8, crepe: 1.2 };
const SLEEVE_PRICES = { sleeveless: 0, half: 50, full: 100, designer: 180 };
const UPGRADE_PRICES = { lace: 450, aari: 1200, tassels: 150, lining: 250 };

// --- STATE MANAGEMENT ---
let state = {
  students: [],
  inquiries: [],
  certificates: [],
  courses: [],
  currentSession: null,
  
  // Estimator Selection State
  selectedApparel: 'kurti',
  selectedFabric: 'cotton',
  selectedSleeve: 'half',
  upgrades: { lace: false, aari: false, tassels: false, lining: false },
  quantity: 1,
  estimatedTotal: 500,

  // Local configurations
  supabaseUrl: '',
  supabaseKey: '',
  supabaseClient: null,
  activeAdminTab: 'analytics',
  testimonialIndex: 0
};

// --- UUID HELPER ---
function generateUUID() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function parseRollKey(roll) {
  const match = /^KCTC-(\d{4})-(\d+)$/.exec(String(roll || '').trim().toUpperCase());
  if (!match) return null;
  return { year: parseInt(match[1], 10), seq: parseInt(match[2], 10) };
}

function rollSortKey(roll) {
  const parsed = parseRollKey(roll);
  if (!parsed) return Number.MAX_SAFE_INTEGER;
  return parsed.year * 100000 + parsed.seq;
}

function generateRollNumber() {
  const year = new Date().getFullYear();
  const prefix = 'KCTC-' + year + '-';

  // Derive the next number from the actual student registry (synced from
  // Supabase) so the series stays continuous across browsers and devices.
  let maxSeq = 0;
  state.students.forEach(s => {
    const parsed = parseRollKey(s.roll_number);
    if (parsed && parsed.year === year && parsed.seq > maxSeq) {
      maxSeq = parsed.seq;
    }
  });

  // Guard against collisions with any non-standard roll numbers already used.
  const taken = new Set(state.students.map(s => String(s.roll_number || '').trim().toUpperCase()));
  let next = maxSeq + 1;
  let candidate = prefix + String(next).padStart(3, '0');
  while (taken.has(candidate)) {
    next++;
    candidate = prefix + String(next).padStart(3, '0');
  }
  return candidate;
}

// Allocates the next roll number, checking the live database first so
// concurrent registrations from different devices don't reuse the same number.
async function reserveRollNumber() {
  if (state.supabaseClient) {
    try {
      const { data, error: rollErr } = await state.supabaseClient
        .from('admin_students')
        .select('roll_number');
      if (!rollErr && data) {
        const known = new Set(state.students.map(s => String(s.roll_number || '').trim().toUpperCase()));
        data.forEach(row => {
          const roll = String(row.roll_number || '').trim().toUpperCase();
          if (roll && !known.has(roll)) {
            // Track remote-only rolls so the generator skips them.
            state.students.push({ roll_number: roll, __rollPlaceholder: true });
          }
        });
      }
    } catch (err) {
      console.error('Could not read live roll numbers, falling back to local:', err);
    }
  }

  const roll = generateRollNumber();
  // Drop the temporary placeholders used only for collision checking.
  state.students = state.students.filter(s => !s.__rollPlaceholder);
  return roll;
}

function sortStudentsByRoll() {
  state.students.sort((a, b) => {
    const diff = rollSortKey(a.roll_number) - rollSortKey(b.roll_number);
    if (diff !== 0) return diff;
    return new Date(a.created_at || 0) - new Date(b.created_at || 0);
  });
}

// Assign roll numbers to legacy records saved before the series existed.
//
// SAFETY: this MUST NOT run automatically. It writes to the live database, and
// on production that would silently rewrite real student records the first time
// any visitor opened the site. It is now an explicit admin action only, guarded
// by a confirmation, and it always takes a backup snapshot first.
async function backfillMissingRollNumbers(options) {
  const opts = options || {};
  if (!opts.confirmedByAdmin) {
    console.warn('backfillMissingRollNumbers() skipped: requires an explicit admin action.');
    return { skipped: true };
  }

  const missing = state.students.filter(s => !parseRollKey(s.roll_number));
  if (missing.length === 0) return { updated: 0 };

  missing
    .sort((a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0))
    .forEach(s => { s.roll_number = generateRollNumber(); });

  sortStudentsByRoll();
  saveStateToLocalStorage();

  if (state.supabaseClient) {
    const { error: backfillErr } = await state.supabaseClient.from('admin_students').upsert(missing);
    if (backfillErr) {
      console.error('Roll number backfill failed to sync:', backfillErr);
      return { updated: missing.length, error: backfillErr };
    }
  }
  console.log('Backfilled roll numbers for ' + missing.length + ' student(s).');
  return { updated: missing.length };
}

// Admin-triggered wrapper: warns, forces a backup, then backfills.
async function adminRunRollNumberBackfill() {
  const missing = state.students.filter(s => !parseRollKey(s.roll_number));
  if (missing.length === 0) {
    alert('All students already have a valid roll number. Nothing to do.');
    return;
  }
  const msg = 'This will assign NEW roll numbers to ' + missing.length + ' student(s) that currently have none, and write the change to the live database.\n\n' +
              'A backup file will be downloaded first.\n\nContinue?';
  if (!confirm(msg)) return;

  downloadFullBackup('before-rollnumber-backfill');

  const res = await backfillMissingRollNumbers({ confirmedByAdmin: true });
  renderStudentsTable();
  updateAnalyticsDashboard();
  alert(res && res.error
    ? 'Assigned locally but cloud sync failed: ' + (res.error.message || res.error)
    : 'Assigned roll numbers to ' + (res ? res.updated : 0) + ' student(s).');
}

async function batchLinkUnlinkedStudents() {
  const unlinked = state.students.filter(s => !s.auth_id);
  if (unlinked.length === 0) {
    alert('All students are already linked to Supabase Auth. Nothing to do.');
    return;
  }

  const msg = 'This will create Supabase Auth accounts for ' + unlinked.length + ' student(s) so they can login to the student portal.\n\n' +
              'Default password for all: TempPass123!\n\n' +
              'Students should change their password after first login.\n\nContinue?';
  if (!confirm(msg)) return;

  if (!state.supabaseClient) {
    alert('Supabase not configured.');
    return;
  }

  try {
    const { data, error } = await state.supabaseClient.rpc('batch_link_unlinked_students');
    if (error) {
      alert('Failed: ' + error.message);
      return;
    }
    await syncWithRemoteDatabase();
    renderStudentsTable();
    updateAnalyticsDashboard();
    alert('Successfully linked ' + (data || 0) + ' student(s) to Supabase Auth.\n\nDefault password: TempPass123!');
  } catch (err) {
    alert('Error: ' + err.message);
  }
}

function toggleSelectAllStudents(masterCheckbox) {
  const checkboxes = document.querySelectorAll('.student-checkbox');
  checkboxes.forEach(cb => {
    const row = cb.closest('tr');
    // Only toggle visible (non-filtered-out) checkboxes
    if (row && row.offsetParent !== null) {
      cb.checked = masterCheckbox.checked;
    }
  });
}

function getSelectedStudentIds() {
  const checked = document.querySelectorAll('.student-checkbox:checked');
  return Array.from(checked).map(cb => cb.getAttribute('data-student-id'));
}

async function linkSelectedStudents() {
  const ids = getSelectedStudentIds();
  if (ids.length === 0) {
    alert('No students selected. Use the checkboxes on the left to select students.');
    return;
  }

  const selected = state.students.filter(s => ids.includes(s.id));
  const unlinked = selected.filter(s => !s.auth_id);

  if (unlinked.length === 0) {
    alert('All selected students are already linked to Supabase Auth.');
    return;
  }

  const linked = selected.filter(s => s.auth_id);
  let msg = unlinked.length + ' student(s) will be linked to Supabase Auth.\n';
  if (linked.length > 0) {
    msg += '\n' + linked.length + ' already linked (will be skipped).\n';
  }
  msg += '\nDefault password: TempPass123!\n\nContinue?';
  if (!confirm(msg)) return;

  if (!state.supabaseClient) {
    alert('Supabase not configured.');
    return;
  }

  try {
    const { data, error } = await state.supabaseClient.rpc('batch_link_students_by_ids', {
      p_student_ids: unlinked.map(s => s.id)
    });
    if (error) {
      alert('Failed: ' + error.message);
      return;
    }
    await syncWithRemoteDatabase();
    renderStudentsTable();
    updateAnalyticsDashboard();
    alert('Successfully linked ' + (data || 0) + ' student(s) to Supabase Auth.\n\nDefault password: TempPass123!');
  } catch (err) {
    alert('Error: ' + err.message);
  }
}

// --- CORE SYSTEM INITIALIZER ---
window.addEventListener('DOMContentLoaded', async () => {
  // 1. Set default credentials and initialize Supabase client
  state.supabaseUrl = localStorage.getItem('KCTC_SUPABASE_URL') || DEFAULT_SUPABASE_URL;
  state.supabaseKey = localStorage.getItem('KCTC_SUPABASE_KEY') || DEFAULT_SUPABASE_KEY;
  const supabaseActive = localStorage.getItem('KCTC_SUPABASE_ACTIVE');
  if (supabaseActive === '0') {
    state.supabaseClient = null;
  } else {
    if (!supabaseActive) localStorage.setItem('KCTC_SUPABASE_ACTIVE', '1');
    initSupabaseClient();
  }
  updateDatabaseStatusIndicators();

  // 1a. Restore sidebar compact/full state from localStorage
  restoreSidebarState();

  // 1b. Restore Supabase Auth session
  if (state.supabaseClient) {
    const { data: { session } } = await state.supabaseClient.auth.getSession();
    if (session) {
      state.supabaseClient.auth.setSession(session);

      // Check if this user is an admin — if so, skip student portal session restore
      const { data: adminCheck } = await state.supabaseClient
        .from('admin_users')
        .select('email')
        .eq('email', session.user.email)
        .maybeSingle();

      if (!adminCheck) {
        // Not an admin — fetch student profile
        const { data: student } = await state.supabaseClient
          .from('admin_students')
          .select('*')
          .eq('auth_id', session.user.id)
          .single();
        if (student) {
          state.currentSession = {
            id: student.id,
            auth_id: session.user.id,
            email: student.email,
            full_name: student.full_name,
            father_name: student.father_name,
            dob: student.dob,
            phone: student.phone,
            enrolled_course: student.enrolled_course
          };
          saveStateToLocalStorage();
        }
      } else {
        // Admin user on admin page — restore admin session so sync has auth
        if (isAdminPage()) {
          sessionStorage.setItem('KCTC_ADMIN_SESSION', '1');
        } else {
          // Admin on public page — clear student/admin session but keep Supabase Auth alive
          // so admin can navigate back to admin.html without re-login
          sessionStorage.removeItem('KCTC_ADMIN_SESSION');
          localStorage.removeItem('KCTC_STUDENT_SESSION');
          state.currentSession = null;
        }
      }
    }
  }

  // 1c. Restore the portal session BEFORE syncing (fallback for localStorage)
  if (!state.currentSession) {
    state.currentSession = JSON.parse(localStorage.getItem('KCTC_STUDENT_SESSION') || 'null');
  }

  // For admin page: restore admin session FIRST so sync runs with admin auth
  let isAdminLoggedIn = false;
  if (isAdminPage()) {
    isAdminLoggedIn = sessionStorage.getItem('KCTC_ADMIN_SESSION') === '1';
    if (state.supabaseClient && isAdminLoggedIn) {
      const { data: { session } } = await state.supabaseClient.auth.getSession();
      if (session) {
        state.supabaseClient.auth.setSession(session);

        // Auto-create admin_users record if missing (prevents is_admin() RLS failure)
        const { data: adminCheck } = await state.supabaseClient
          .from('admin_users')
          .select('email')
          .eq('email', session.user.email)
          .maybeSingle();
        if (!adminCheck) {
          await state.supabaseClient
            .from('admin_users')
            .insert({ email: session.user.email, auth_id: session.user.id });
        } else if (!adminCheck.auth_id) {
          await state.supabaseClient
            .from('admin_users')
            .update({ auth_id: session.user.id })
            .eq('email', session.user.email);
        }

        state.currentSession = {
          auth_id: session.user.id,
          email: session.user.email,
          full_name: session.user.user_metadata?.full_name || 'Admin User',
          isAdmin: true
        };
        saveStateToLocalStorage();
      }
    }
  }

  // 2. Try to sync live data from Supabase (now runs with proper auth)
  const syncOk = state.supabaseClient ? await syncWithRemoteDatabase() : false;

  // 3. Only if sync failed or returned empty, load from localStorage / defaults
  if (!syncOk) {
    loadStateFromLocalStorage();
  }

  // 3b. Keep the registry in roll-number order. Backfilling missing roll
  //     numbers is deliberately NOT automatic — it writes to the live database
  //     and must be triggered by an admin (Student Registry → Fix Roll Numbers).
  sortStudentsByRoll();

  // 4. Initialize only the UI that exists on this page
  populateCourseDropdowns();

  if (isAdminPage()) {
    // admin.html - restore gate state, then show the panel or the login gate.
    state.isAdminLoggedIn = isAdminLoggedIn;
    toggleAdminPanel(true);
    syncAdminSidebarToViewport();
    window.addEventListener('resize', syncAdminSidebarToViewport);
    renderDbToggle();
  } else {
    // index.html — public site widgets.
    renderPortfolioCreations('all');
    renderCoursesList('');
    initializeEstimatorUI();
    updateEstimatorCost();
    setupTestimonialTicker();
    window.addEventListener('scroll', handleWindowScrollActiveStates);

    // Honour deep links like index.html#courses coming from the admin page.
    if (window.location.hash) {
      const target = window.location.hash.slice(1);
      if (target === 'open-student-portal') {
        // Arrived from the admin header's Student Portal button.
        history.replaceState(null, '', window.location.pathname);
        setTimeout(() => openStudentPortal(), 60);
      } else if (document.getElementById(target)) {
        setTimeout(() => scrollToSection(target), 50);
      }
    }
  }

  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  // 5. Console diagnostics (simplified)
  console.log("=== KCTC DIAGNOSTICS ===");
  console.log("Environment:", ENV.toUpperCase());
  console.log("supabaseClient:", state.supabaseClient ? "ACTIVE" : "NULL");
  console.log("Courses:", state.courses.length);
  console.log("Students:", state.students.length);
  console.log("Inquiries:", state.inquiries.length);
  console.log("Certificates:", state.certificates.length);
  console.log("=========================");
});

// --- LOCAL STORAGE ENGINES ---
function loadStateFromLocalStorage() {
  state.students = JSON.parse(localStorage.getItem('KCTC_STUDENTS') || '[]');
  state.inquiries = JSON.parse(localStorage.getItem('KCTC_INQUIRIES') || '[]');
  state.certificates = JSON.parse(localStorage.getItem('KCTC_CERTIFICATES') || '[]');
  state.courses = JSON.parse(localStorage.getItem('KCTC_COURSES') || '[]');
  if (state.courses.length === 0) {
    state.courses = DEFAULT_COURSES.map(c => ({ ...c, id: generateUUID(), created_at: new Date().toISOString() }));
  }
  state.currentSession = JSON.parse(localStorage.getItem('KCTC_STUDENT_SESSION') || 'null');
  state.supabaseUrl = localStorage.getItem('KCTC_SUPABASE_URL') || DEFAULT_SUPABASE_URL;
  state.supabaseKey = localStorage.getItem('KCTC_SUPABASE_KEY') || DEFAULT_SUPABASE_KEY;

  // NOTE: an earlier version silently dropped students whose email matched a
  // hardcoded sample list. That was removed — on production those could be real
  // people, and hiding them from the registry is worse than showing demo rows.
  sortStudentsByRoll();
  saveStateToLocalStorage();
}

// --- SUPABASE CLIENT SETUP ---
function initSupabaseClient() {
  if (state.supabaseUrl && state.supabaseKey) {
    try {
      if (typeof window.supabase === 'undefined' || !window.supabase.createClient) {
        console.error("Supabase CDN not loaded — window.supabase is undefined. Check the CDN URL in index.html.");
        state.supabaseClient = null;
        return;
      }
      state.supabaseClient = window.supabase.createClient(state.supabaseUrl, state.supabaseKey);
      console.log("Supabase client initialized successfully.");
    } catch (e) {
      console.error("Failed to construct Supabase Client:", e);
      state.supabaseClient = null;
    }
  } else {
    state.supabaseClient = null;
  }
}

function updateDatabaseStatusIndicators() {
  const dot = document.getElementById('db-status-dot');
  const txt = document.getElementById('db-status-text');
  
  if (state.supabaseClient) {
    if (dot) { dot.className = "w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-md animate-pulse"; }
    if (txt) { txt.innerText = "SUPABASE CONNECTED"; txt.className = "text-emerald-400 font-bold uppercase tracking-wider"; }
  } else {
    if (dot) { dot.className = "w-2.5 h-2.5 rounded-full bg-slate-600"; }
    if (txt) { txt.innerText = "LOCAL STORAGE FALLBACK"; txt.className = "text-slate-400 font-bold uppercase tracking-wider"; }
  }
}

// --- DUAL DATA SYNCHRONIZATION HYBRID ---
async function syncWithRemoteDatabase() {
  if (!state.supabaseClient) return false;

  try {
    // Fetch all four tables concurrently
    const results = await Promise.all([
      state.supabaseClient.from('admin_students').select('*'),
      state.supabaseClient.from('inquiries').select('*'),
      state.supabaseClient.from('certificates').select('*'),
      state.supabaseClient.from('courses').select('*')
    ]);

    const [studentsRes, inquiriesRes, certsRes, coursesRes] = results;

    // Replace local state directly with live data (no merge to prevent stale overrides)
    if (studentsRes.data) {
      state.students = studentsRes.data;
      sortStudentsByRoll();
    }
    if (inquiriesRes.data) {
      state.inquiries = inquiriesRes.data;
    }
    if (certsRes.data) {
      state.certificates = certsRes.data;
    }
    if (coursesRes.data && coursesRes.data.length > 0) {
      state.courses = coursesRes.data;
    }

    // Cache fetched data to localStorage
    saveStateToLocalStorage();

    // Reconcile portal session with live data
    if (state.currentSession) {
      const live = state.students.find(s => s.id === state.currentSession.id || s.email.toLowerCase() === state.currentSession.email.toLowerCase());
      if (live) {
        state.currentSession = { ...state.currentSession, ...live };
        saveStateToLocalStorage();
      }
    }

    console.log("Sync complete — students:", state.students.length, "inquiries:", state.inquiries.length, "certificates:", state.certificates.length, "courses:", state.courses.length);
    return true;
  } catch (error) {
    console.error("Supabase sync failed:", error);
    return false;
  }
}

function mergeLists(localList, remoteList) {
  const map = new Map();
  // Fill remote first
  remoteList.forEach(item => {
    map.set(item.id, item);
  });
  // Local overwrites if created_at is newer
  localList.forEach(item => {
    if (!map.has(item.id)) {
      map.set(item.id, item);
    } else {
      const remote = map.get(item.id);
      const remoteDate = new Date(remote.created_at || 0).getTime();
      const localDate = new Date(item.created_at || 0).getTime();
      if (localDate > remoteDate) {
        map.set(item.id, item);
      }
    }
  });
  return Array.from(map.values());
}

async function uploadDiffToSupabase(table, list) {
  if (!state.supabaseClient || list.length === 0) return;
  const { error: upsertErr } = await state.supabaseClient.from(table).upsert(list);
  if (upsertErr) throw upsertErr;
}

async function triggerDynamicSync() {
  if (!state.supabaseClient) {
    alert("Please configure dynamic Supabase credentials in the 'Supabase Config' tab first!");
    return;
  }
  await syncWithRemoteDatabase();
  renderStudentsTable();
  renderInquiriesTable();
  renderCertificatesLedger();
  renderCoursesTable();
  updateAnalyticsDashboard();
  populateCourseDropdowns();
  alert("Live cloud tables synchronized successfully!");
}

// --- PAGE DETECTION ---
// The site is split into two pages that share this script:
//   index.html -> public site      (#public-site present)
//   admin.html -> admin dashboard  (#admin-panel present)
function isAdminPage() {
  return !!document.getElementById('admin-panel');
}

// --- NAVIGATION & DOM VIEW TOGGLERS ---
function navigateTo(section) {
  if (isAdminPage()) {
    window.location.href = 'index.html' + (section && section !== 'home' ? '#' + section : '');
    return;
  }
  scrollToSection(section || 'home');
}

function scrollToSection(id) {
  // On the admin page there are no public sections — jump to the public page.
  if (isAdminPage()) {
    window.location.href = 'index.html#' + id;
    return;
  }
  const el = document.getElementById(id);
  if (el) {
    const headerHeight = 80;
    const elementPosition = el.getBoundingClientRect().top + window.pageYOffset - headerHeight;
    const currentPosition = window.pageYOffset;
    const behavior = Math.abs(elementPosition - currentPosition) < 100 ? 'auto' : 'smooth';
    window.scrollTo({
      top: elementPosition,
      behavior: behavior
    });
  }
  updateActiveNavLink(id);
}

function updateActiveNavLink(id) {
  const links = document.querySelectorAll('.nav-link');
  links.forEach(l => {
    const onclickStr = l.getAttribute('onclick') || '';
    if (onclickStr.includes(id)) {
      l.classList.add('active');
    } else {
      l.classList.remove('active');
    }
  });
}

function handleWindowScrollActiveStates() {
  const sections = ['home', 'courses', 'estimator', 'verify', 'contact'];
  let currentActive = 'home';
  sections.forEach(secId => {
    const el = document.getElementById(secId);
    if (el) {
      const rect = el.getBoundingClientRect();
      if (rect.top <= 150 && rect.bottom >= 150) {
        currentActive = secId;
      }
    }
  });
  updateActiveNavLink(currentActive);
}

function toggleMobileMenu() {
  const menu = document.getElementById('mobile-menu');
  if (menu) {
    menu.classList.toggle('hidden');
  }
}

// --- PORTFOLIO & COURSES RENDERING ---
function renderPortfolioCreations(category) {
  const grid = document.getElementById('creations-grid');
  if (!grid) return;
  grid.innerHTML = '';

  const items = category === 'all' ? CREATIONS : CREATIONS.filter(c => c.category === category);
  
  items.forEach(c => {
    const card = document.createElement('div');
    card.className = "group relative rounded-2xl overflow-hidden border border-gray-100 shadow-md h-64 hover:shadow-xl transition-all duration-300";
    card.innerHTML = `
      <img src="${c.image}" alt="${c.name}" class="w-full h-full object-cover group-hover:scale-105 transition-all duration-500">
      <div class="absolute inset-0 bg-gradient-to-t from-[#501537]/80 via-[#501537]/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-5">
        <span class="text-[9px] font-bold text-[#c5a059] uppercase tracking-widest">${c.category} masterpiece</span>
        <strong class="font-serif text-sm text-white mt-1 leading-tight">${c.name}</strong>
      </div>
    `;
    grid.appendChild(card);
  });
}

function filterCreations(category) {
  const buttons = ['all', 'ethnic', 'western', 'embroidery'];
  buttons.forEach(btn => {
    const el = document.getElementById(`filter-${btn}`);
    if (el) {
      if (btn === category) {
        el.classList.add('active');
      } else {
        el.classList.remove('active');
      }
    }
  });
  renderPortfolioCreations(category);
}

function renderCoursesList(filterText) {
  const grid = document.getElementById('courses-grid');
  if (!grid) return;
  grid.innerHTML = '';

  const list = state.courses.filter(c => c.name.toLowerCase().includes(filterText.toLowerCase()) || c.description.toLowerCase().includes(filterText.toLowerCase()));

  if (list.length === 0) {
    grid.innerHTML = `<p class="col-span-full text-center text-sm text-slate-400 py-12">No courses available yet. Check back soon.</p>`;
    return;
  }

  list.forEach(c => {
    const card = document.createElement('div');
    card.className = "p-6 bg-[#fdfbf7] rounded-2xl border border-[#501537]/10 flex flex-col justify-between hover:border-[#c5a059] hover:shadow-xl transition-all duration-300";
    card.innerHTML = `
      <div>
        <div class="w-12 h-12 rounded-xl bg-[#c5a059]/10 text-[#c5a059] flex items-center justify-center font-bold text-xl mb-4">
          ${c.icon || '📐'}
        </div>
        <h3 class="font-serif font-bold text-xl text-[#501537] mb-2">${c.name}</h3>
        <p class="text-xs text-[#5a4b53] leading-relaxed mb-6">${c.description}</p>
      </div>
      <div>
        <div class="flex gap-4 border-t border-[#501537]/5 pt-4 mb-4 text-xs text-[#5a4b53]">
          <span>Duration: <strong>${c.duration}</strong></span>
          <span>Level: <strong>${c.level}</strong></span>
        </div>
        <button onclick="handleDirectEnrollClick('${c.name}')" class="w-full py-2.5 bg-white border border-[#c5a059] hover:bg-[#c5a059] hover:text-white rounded-xl text-xs font-semibold text-[#501537] transition-all">
          Quick Enroll Now
        </button>
      </div>
    `;
    grid.appendChild(card);
  });
}

function handleCourseSearch(val) {
  renderCoursesList(val);
}

const DEFAULT_COURSES = [
  { name: 'Boutique Tailoring & Stitching Course', duration: '3 Mos', level: 'Beginner', description: 'Comprehensive tailoring and stitching foundation course.' },
  { name: 'Advanced Fashion Designing Course', duration: '6 Mos', level: 'Advanced', description: 'Professional fashion design and pattern cutting.' },
  { name: 'Hand Embroidery & Zardozi Course', duration: '2 Mos', level: 'All Levels', description: 'Traditional hand embroidery and zardozi work.' }
];

function populateCourseDropdowns() {
  const selects = ['add-student-course', 'edit-student-course', 'cert-course-name', 'reg-course'];
  const source = state.courses.length > 0 ? state.courses : DEFAULT_COURSES;
  selects.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    const currentVal = el.value;
    el.innerHTML = '';
    source.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.name;
      opt.textContent = c.name + ' (' + c.duration + ')';
      el.appendChild(opt);
    });
    if (currentVal) el.value = currentVal;
  });
}

function handleDirectEnrollClick(courseName) {
  const interestField = document.getElementById('inquiry-interests');
  if (interestField) {
    interestField.value = `I want to enroll in the "${courseName}". Please provide starting schedules and total vocational fee payment options.`;
  }
  scrollToSection('contact');
}

// --- TESTIMONIAL TICKER ---
function setupTestimonialTicker() {
  setInterval(() => {
    nextTestimonial();
  }, 6000);
}

function updateTestimonialDOM() {
  const quoteEl = document.getElementById('testimonial-quote');
  const nameEl = document.getElementById('testimonial-name');
  const roleEl = document.getElementById('testimonial-role');
  
  if (quoteEl && nameEl && roleEl) {
    const t = TESTIMONIALS[state.testimonialIndex];
    quoteEl.innerText = `"${t.quote}"`;
    nameEl.innerText = t.name;
    roleEl.innerText = t.role;
  }
}

function nextTestimonial() {
  state.testimonialIndex = (state.testimonialIndex + 1) % TESTIMONIALS.length;
  updateTestimonialDOM();
}

function prevTestimonial() {
  state.testimonialIndex = (state.testimonialIndex - 1 + TESTIMONIALS.length) % TESTIMONIALS.length;
  updateTestimonialDOM();
}

// --- STITCHING COST ESTIMATOR ---
function initializeEstimatorUI() {
  // Apparel choices
  const apparelGrid = document.getElementById('estimator-apparel-grid');
  if (apparelGrid) {
    apparelGrid.innerHTML = '';
    const apparels = [
      { id: 'kurti', label: 'Kurti', icon: '👗', base: 450 },
      { id: 'suit', label: 'Suit', icon: '👘', base: 750 },
      { id: 'lehenga', label: 'Lehenga', icon: '💃', base: 1800 },
      { id: 'blouse', label: 'Blouse', icon: '👚', base: 400 },
      { id: 'gown', label: 'Gown', icon: '👗', base: 1500 }
    ];
    apparels.forEach(a => {
      const btn = document.createElement('button');
      btn.id = `est-apparel-${a.id}`;
      btn.className = `estimator-btn ${state.selectedApparel === a.id ? 'active' : ''}`;
      btn.onclick = () => selectEstimatorApparel(a.id);
      btn.innerHTML = `
        <span class="text-xl mb-1">${a.icon}</span>
        <span class="text-xs font-bold text-[#501537]">${a.label}</span>
        <span class="text-[10px] text-gray-400 mt-1">₹${a.base} base</span>
      `;
      apparelGrid.appendChild(btn);
    });
  }

  // Fabric choices
  const fabricList = document.getElementById('estimator-fabric-list');
  if (fabricList) {
    fabricList.innerHTML = '';
    const fabrics = [
      { id: 'cotton', label: 'Cotton (1.0x)' },
      { id: 'silk', label: 'Silk (1.5x)' },
      { id: 'georgette', label: 'Georgette (1.3x)' },
      { id: 'velvet', label: 'Velvet (1.8x)' },
      { id: 'crepe', label: 'Crepe (1.2x)' }
    ];
    fabrics.forEach(f => {
      const btn = document.createElement('button');
      btn.id = `est-fabric-${f.id}`;
      btn.className = `estimator-pill ${state.selectedFabric === f.id ? 'active' : ''}`;
      btn.onclick = () => selectEstimatorFabric(f.id);
      btn.innerText = f.label;
      fabricList.appendChild(btn);
    });
  }

  // Sleeve choices
  const sleeveList = document.getElementById('estimator-sleeve-list');
  if (sleeveList) {
    sleeveList.innerHTML = '';
    const sleeves = [
      { id: 'sleeveless', label: 'Sleeveless (+₹0)' },
      { id: 'half', label: 'Half Sleeves (+₹50)' },
      { id: 'full', label: 'Full Sleeves (+₹100)' },
      { id: 'designer', label: 'Designer Sleeves (+₹180)' }
    ];
    sleeves.forEach(s => {
      const btn = document.createElement('button');
      btn.id = `est-sleeve-${s.id}`;
      btn.className = `estimator-pill ${state.selectedSleeve === s.id ? 'active' : ''}`;
      btn.onclick = () => selectEstimatorSleeve(s.id);
      btn.innerText = s.label;
      sleeveList.appendChild(btn);
    });
  }

  // Addons grid
  const addonsGrid = document.getElementById('estimator-addons-grid');
  if (addonsGrid) {
    addonsGrid.innerHTML = '';
    const addons = [
      { id: 'lace', label: 'Premium Lace border (+₹450)' },
      { id: 'aari', label: 'Aari threadwork embroidery (+₹1200)' },
      { id: 'tassels', label: 'Fancy hanging tassels (+₹150)' },
      { id: 'lining', label: 'Inner lining layer (+₹250)' }
    ];
    addons.forEach(ad => {
      const btn = document.createElement('button');
      btn.id = `est-addon-${ad.id}`;
      btn.className = `estimator-addon-card ${state.upgrades[ad.id] ? 'active' : ''}`;
      btn.onclick = () => toggleEstimatorAddon(ad.id);
      btn.innerHTML = `
        <input type="checkbox" id="chk-addon-${ad.id}" class="accent-[#501537] w-3.5 h-3.5" ${state.upgrades[ad.id] ? 'checked' : ''} readonly>
        <span class="text-xs text-[#501537] font-semibold">${ad.label}</span>
      `;
      addonsGrid.appendChild(btn);
    });
  }
}

function selectEstimatorApparel(id) {
  const prev = document.getElementById(`est-apparel-${state.selectedApparel}`);
  if (prev) prev.classList.remove('active');
  state.selectedApparel = id;
  const curr = document.getElementById(`est-apparel-${id}`);
  if (curr) curr.classList.add('active');
  updateEstimatorCost();
}

function selectEstimatorFabric(id) {
  const prev = document.getElementById(`est-fabric-${state.selectedFabric}`);
  if (prev) prev.classList.remove('active');
  state.selectedFabric = id;
  const curr = document.getElementById(`est-fabric-${id}`);
  if (curr) curr.classList.add('active');
  updateEstimatorCost();
}

// Helper to save state
function saveStateToLocalStorage() {
  localStorage.setItem('KCTC_STUDENTS', JSON.stringify(state.students));
  localStorage.setItem('KCTC_INQUIRIES', JSON.stringify(state.inquiries));
  localStorage.setItem('KCTC_CERTIFICATES', JSON.stringify(state.certificates));
  localStorage.setItem('KCTC_COURSES', JSON.stringify(state.courses));
  if (state.currentSession) {
    localStorage.setItem('KCTC_STUDENT_SESSION', JSON.stringify(state.currentSession));
  } else {
    localStorage.removeItem('KCTC_STUDENT_SESSION');
  }
}

function selectEstimatorSleeve(id) {
  const prev = document.getElementById(`est-sleeve-${state.selectedSleeve}`);
  if (prev) prev.classList.remove('active');
  state.selectedSleeve = id;
  const curr = document.getElementById(`est-sleeve-${id}`);
  if (curr) curr.classList.add('active');
  updateEstimatorCost();
}

function toggleEstimatorAddon(id) {
  state.upgrades[id] = !state.upgrades[id];
  const card = document.getElementById(`est-addon-${id}`);
  const chk = document.getElementById(`chk-addon-${id}`);
  if (card && chk) {
    if (state.upgrades[id]) {
      card.classList.add('active');
      chk.checked = true;
    } else {
      card.classList.remove('active');
      chk.checked = false;
    }
  }
  updateEstimatorCost();
}

function updateEstimatorQuantity(val) {
  state.quantity = parseInt(val);
  const badge = document.getElementById('estimator-quantity-badge');
  if (badge) badge.innerText = `${val} Pcs`;
  updateEstimatorCost();
}

function updateEstimatorCost() {
  const base = BASE_PRICES[state.selectedApparel];
  const mult = FABRIC_MULTIPLIER[state.selectedFabric];
  let subtotal = base * mult;
  subtotal += SLEEVE_PRICES[state.selectedSleeve];

  Object.keys(state.upgrades).forEach(key => {
    if (state.upgrades[key]) {
      subtotal += UPGRADE_PRICES[key];
    }
  });

  state.estimatedTotal = Math.round(subtotal * state.quantity);

  // Render summaries
  const sumApparel = document.getElementById('summary-apparel');
  const sumFabric = document.getElementById('summary-fabric');
  const sumSleeve = document.getElementById('summary-sleeve');
  const sumQuantity = document.getElementById('summary-quantity');
  const sumTotal = document.getElementById('summary-total');

  if (sumApparel) sumApparel.innerText = state.selectedApparel;
  if (sumFabric) sumFabric.innerText = state.selectedFabric;
  if (sumSleeve) sumSleeve.innerText = state.selectedSleeve;
  if (sumQuantity) sumQuantity.innerText = `${state.quantity} unit(s)`;
  if (sumTotal) sumTotal.innerText = `₹${state.estimatedTotal}`;
}

function applyEstimateToInquiryForm() {
  const interestField = document.getElementById('inquiry-interests');
  if (interestField) {
    let addonsStr = Object.keys(state.upgrades).filter(key => state.upgrades[key]).join(', ');
    if (!addonsStr) addonsStr = "None";
    interestField.value = `STITCHING QUOTE INTEREST:
Apparel: ${state.selectedApparel.toUpperCase()}
Fabric: ${state.selectedFabric.toUpperCase()}
Sleeves: ${state.selectedSleeve.toUpperCase()}
Addons: ${addonsStr}
Quantity: ${state.quantity} Pcs
Estimated Total: ₹${state.estimatedTotal}.
Please verify scheduling measurements and delivery timelines.`;
  }
  scrollToSection('contact');
}

// --- CERTIFICATE DATE HELPERS ---
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Converts a "YYYY-MM" value from <input type="month"> into "Mon YYYY".
function formatMonthYear(value) {
  if (!value) return '';
  const parts = String(value).split('-');
  if (parts.length < 2) return String(value);
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  if (isNaN(year) || isNaN(month) || month < 1 || month > 12) return String(value);
  return MONTH_NAMES[month - 1] + ' ' + year;
}

// Fills the shared certificate viewer modal from a certificate record.
function populateCertificateViewer(cert) {
  document.getElementById('cert-view-name').innerText = cert.student_name;
  document.getElementById('cert-view-father').innerText = cert.father_name;
  document.getElementById('cert-view-course').innerText = cert.course_name;
  document.getElementById('cert-view-roll').innerText = cert.roll_number;
  document.getElementById('cert-view-grade').innerText = cert.grade;
  document.getElementById('cert-view-year').innerText = cert.passing_year;
  document.getElementById('cert-view-code').innerText = cert.verification_code;

  // Month range is optional — older certificates only have a passing year.
  const wrap = document.getElementById('cert-view-duration-wrap');
  const fromEl = document.getElementById('cert-view-from');
  const toEl = document.getElementById('cert-view-to');
  if (wrap && fromEl && toEl) {
    if (cert.from_month && cert.to_month) {
      fromEl.innerText = formatMonthYear(cert.from_month);
      toEl.innerText = formatMonthYear(cert.to_month);
      wrap.classList.remove('hidden');
    } else {
      wrap.classList.add('hidden');
    }
  }
}

// --- SECURE CERTIFICATE VERIFICATION ---
function handleCertificateVerification(e) {
  e.preventDefault();
  const input = document.getElementById('verify-code-input');
  const errMsg = document.getElementById('verify-error-msg');
  if (!input || !errMsg) return;

  const code = input.value.trim().toUpperCase();
  errMsg.classList.add('hidden');

  const cert = state.certificates.find(c => c.roll_number.toUpperCase() === code || c.verification_code.toUpperCase() === code);

  if (cert) {
    // Populate and trigger display modal
    populateCertificateViewer(cert);

    const modal = document.getElementById('certificate-viewer-modal');
    if (modal) modal.classList.remove('hidden');
  } else {
    errMsg.innerText = `Invalid roll number or verification pin "${code}". Please contact administration for credential ledger additions.`;
    errMsg.classList.remove('hidden');
  }
}

function closeCertificateViewerModal() {
  const modal = document.getElementById('certificate-viewer-modal');
  if (modal) modal.classList.add('hidden');
}

// --- INQUIRY FORM SUBMISSIONS ---
async function handleInquirySubmission(e) {
  e.preventDefault();
  const alertBox = document.getElementById('inquiry-alert');
  const alertIcon = document.getElementById('inquiry-alert-icon');
  const alertTxt = document.getElementById('inquiry-alert-text');

  if (!alertBox || !alertTxt) return;

  alertBox.classList.add('hidden');

  // Spam-protection honeypot Check
  const honey = document.getElementById('spam-honeypot').value;
  if (honey) {
    alertBox.className = "mt-4 p-4 rounded-xl border bg-emerald-50 border-emerald-100 flex items-start gap-3";
    alertTxt.innerText = "Inquiry registered successfully! (Spam filter triggered)";
    alertBox.classList.remove('hidden');
    return;
  }

  const name = document.getElementById('inquiry-name').value.trim();
  const phone = document.getElementById('inquiry-phone').value.trim();
  const ageVal = document.getElementById('inquiry-age').value.trim();
  const interests = document.getElementById('inquiry-interests').value.trim();

  const newInq = {
    id: generateUUID(),
    full_name: name,
    phone_number: phone,
    age: ageVal ? parseInt(ageVal) : null,
    course_interested: interests,
    status: 'new',
    created_at: new Date().toISOString()
  };

  // Add to local state
  state.inquiries.push(newInq);
  saveStateToLocalStorage();

  // Push to Supabase if active
  if (state.supabaseClient) {
    try {
      await state.supabaseClient.from('inquiries').insert([newInq]);
    } catch (err) {
      console.error("Failed to push inquiry to remote tables:", err);
    }
  }

  // Show success alert
  alertBox.className = "mt-4 p-4 rounded-xl border bg-emerald-50 border-emerald-100 text-[#2b704e] flex items-start gap-3";
  if (alertIcon) alertIcon.innerHTML = `<i data-lucide="check-circle-2" class="w-5 h-5 text-emerald-600"></i>`;
  alertTxt.innerText = "Thank you! Your custom stitch estimate and inquiry have been logged into our vocational database. An administrator will call you shortly on WhatsApp.";
  alertBox.classList.remove('hidden');

  // Reset form
  document.getElementById('inquiry-name').value = '';
  document.getElementById('inquiry-phone').value = '';
  document.getElementById('inquiry-age').value = '';
  document.getElementById('inquiry-interests').value = '';

  if (typeof lucide !== 'undefined') { lucide.createIcons(); }
}

// --- STUDENT PORTAL / AUTH ---
function openStudentPortal() {
  const session = state.currentSession;
  if (session) {
    // Already logged in - update dashboard fields and open dashboard
    document.getElementById('portal-welcome-name').innerText = `Welcome Back, ${session.full_name}!`;
    document.getElementById('portal-father').innerText = session.father_name;
    document.getElementById('portal-dob').innerText = session.dob || 'Not provided';
    document.getElementById('portal-phone').innerText = session.phone;
    document.getElementById('portal-email').innerText = session.email;
    document.getElementById('portal-course').innerText = session.enrolled_course;

    const student = state.students.find(s => s.id === session.id || s.email.toLowerCase() === session.email.toLowerCase());
    
    const feesPaid = student ? student.fees_paid : false;
    const feesAmount = student ? student.fees_amount : 4500;
    const status = student ? student.enrollment_status : 'pending';

    // Fee breakdown: total, paid so far, and what is still outstanding.
    const paymentList = (student && student.payments) ? student.payments : [];
    const totalPaid = paymentList.reduce((sum, p) => sum + (p.amount || 0), 0);
    const pending = Math.max(0, feesAmount - totalPaid);

    document.getElementById('portal-fees-amount').innerText = `₹${feesAmount}`;
    document.getElementById('portal-fees-paid').innerText = `₹${totalPaid}`;

    const pendingEl = document.getElementById('portal-fees-pending');
    pendingEl.innerText = `₹${pending}`;
    pendingEl.className = pending > 0
      ? 'text-sm font-extrabold text-red-600'
      : 'text-sm font-extrabold text-emerald-600';

    // Due date, highlighted red when overdue and money is still owed.
    const dueEl = document.getElementById('portal-fees-due-date');
    const dueRaw = student ? student.due_date : null;
    if (dueRaw) {
      const dueDate = new Date(dueRaw);
      const overdue = pending > 0 && dueDate < new Date();
      dueEl.innerText = dueDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) + (overdue ? ' (OVERDUE)' : '');
      dueEl.className = overdue ? 'text-xs font-bold text-red-600' : 'text-xs font-bold text-[#501537]';
    } else {
      dueEl.innerText = 'Not set';
      dueEl.className = 'text-xs font-bold text-gray-400';
    }

    // Individual payment receipts, newest first.
    const payBox = document.getElementById('portal-payments-box');
    const payList = document.getElementById('portal-payments-list');
    if (paymentList.length > 0) {
      payList.innerHTML = '';
      paymentList
        .slice()
        .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
        .forEach(p => {
          const when = p.date
            ? new Date(p.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
            : '—';
          const row = document.createElement('div');
          row.className = 'flex justify-between items-center bg-white border border-gray-200 rounded-lg px-2.5 py-1.5';
          row.innerHTML =
            '<div class="flex flex-col"><span class="text-[11px] font-bold text-emerald-700">₹' + (p.amount || 0) + '</span>' +
            (p.note ? '<span class="text-[9px] text-gray-400">' + p.note + '</span>' : '') +
            '</div><div class="text-right"><span class="text-[10px] text-gray-500 block">' + when + '</span>' +
            '<span class="text-[9px] font-bold text-gray-400 uppercase">' + (p.method || 'Cash') + '</span></div>';
          payList.appendChild(row);
        });
      payBox.classList.remove('hidden');
    } else {
      payList.innerHTML = '';
      payBox.classList.add('hidden');
    }
    
    const statusDot = document.getElementById('portal-status-dot');
    const statusTxt = document.getElementById('portal-status-text');
    const feesBadge = document.getElementById('portal-fees-status-badge');

    if (status === 'accepted') {
      if (statusDot) statusDot.className = "w-3 h-3 rounded-full bg-emerald-500 shrink-0";
      if (statusTxt) statusTxt.innerText = "ACTIVE ENROLLMENT";
    } else if (status === 'declined') {
      if (statusDot) statusDot.className = "w-3 h-3 rounded-full bg-red-600 shrink-0";
      if (statusTxt) statusTxt.innerText = "REGISTRATION DECLINED";
    } else {
      if (statusDot) statusDot.className = "w-3 h-3 rounded-full bg-amber-400 shrink-0";
      if (statusTxt) statusTxt.innerText = "PENDING AUDIT";
    }

    if (feesPaid) {
      if (feesBadge) {
        feesBadge.className = "px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800";
        feesBadge.innerText = "PAID";
      }
    } else {
      if (feesBadge) {
        feesBadge.className = "px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-amber-100 text-amber-700";
        feesBadge.innerText = "UNPAID";
      }
    }

    // Show admin remarks if present
    const remarksBox = document.getElementById('portal-remarks-box');
    const remarksText = document.getElementById('portal-remarks-text');
    if (student && student.admin_remarks) {
      if (remarksText) remarksText.innerText = student.admin_remarks;
      if (remarksBox) remarksBox.classList.remove('hidden');
    } else {
      if (remarksBox) remarksBox.classList.add('hidden');
    }

    // Render uploaded documents
    renderTypedDocs(student);

    const portalModal = document.getElementById('student-portal-modal');
    portalModal.classList.remove('hidden');

    // Animate the dialog in and replay the coming-soon card stagger.
    const portalCard = portalModal.querySelector('.bg-white');
    if (portalCard) {
      portalCard.classList.remove('animate-portal-pop');
      void portalCard.offsetWidth;
      portalCard.classList.add('animate-portal-pop');
    }
    replayComingSoonAnimation();

    // Hide any leftover toast from a previous session.
    const soonToast = document.getElementById('portal-soon-toast');
    if (soonToast) soonToast.classList.add('hidden');

    if (typeof lucide !== 'undefined') { lucide.createIcons(); }
  } else {
    // Open auth login modal
    document.getElementById('student-auth-modal').classList.remove('hidden');
    switchAuthTab('login');
  }
}

function closeStudentPortal() {
  document.getElementById('student-portal-modal').classList.add('hidden');
}

// The portal markup only exists on index.html. From the admin page we navigate
// across and ask the public page to open the portal on arrival.
function goToStudentPortal() {
  if (isAdminPage()) {
    window.location.href = 'index.html#open-student-portal';
    return;
  }
  openStudentPortal();
}

// --- COMING SOON FEATURE PLACEHOLDERS ---
let soonToastTimer = null;

function showComingSoon(featureName) {
  const toast = document.getElementById('portal-soon-toast');
  const text = document.getElementById('portal-soon-toast-text');
  if (!toast || !text) return;

  text.innerText = '"' + featureName + '" is coming soon. We will notify you here once it is available.';

  // Restart the entry animation on repeat clicks.
  toast.classList.remove('hidden', 'animate-toast-in');
  void toast.offsetWidth;
  toast.classList.add('animate-toast-in');

  if (typeof lucide !== 'undefined') { lucide.createIcons(); }

  if (soonToastTimer) clearTimeout(soonToastTimer);
  soonToastTimer = setTimeout(() => {
    toast.classList.add('hidden');
  }, 3600);
}

// Replays the staggered card entrance each time the portal is opened.
function replayComingSoonAnimation() {
  const cards = document.querySelectorAll('#portal-soon-grid .soon-card');
  cards.forEach(card => {
    card.style.animation = 'none';
    void card.offsetWidth;
    card.style.animation = '';
  });
}

function closeStudentAuthModal() {
  document.getElementById('student-auth-modal').classList.add('hidden');
}

function switchAuthTab(tab) {
  const logTab = document.getElementById('auth-tab-login');
  const regTab = document.getElementById('auth-tab-register');
  const logForm = document.getElementById('auth-form-login');
  const regForm = document.getElementById('auth-form-register');
  const errMsg = document.getElementById('auth-error-msg');
  const sxcMsg = document.getElementById('auth-success-msg');

  if (!logTab || !regTab || !logForm || !regForm || !errMsg || !sxcMsg) return;

  errMsg.classList.add('hidden');
  sxcMsg.classList.add('hidden');

  if (tab === 'login') {
    logTab.className = "py-4 text-xs font-bold uppercase tracking-widest text-[#501537] border-b-2 border-[#501537]";
    regTab.className = "py-4 text-xs font-bold uppercase tracking-widest text-gray-400 border-b-2 border-transparent";
    logForm.classList.remove('hidden');
    regForm.classList.add('hidden');
  } else {
    regTab.className = "py-4 text-xs font-bold uppercase tracking-widest text-[#501537] border-b-2 border-[#501537]";
    logTab.className = "py-4 text-xs font-bold uppercase tracking-widest text-gray-400 border-b-2 border-transparent";
    regForm.classList.remove('hidden');
    logForm.classList.add('hidden');
  }
}

async function handleStudentLogin(e) {
  e.preventDefault();
  const email = document.getElementById('login-email').value.trim().toLowerCase();
  const pass = document.getElementById('login-password').value.trim();
  const errMsg = document.getElementById('auth-error-msg');
  const sxcMsg = document.getElementById('auth-success-msg');

  if (!errMsg || !sxcMsg) return;
  errMsg.classList.add('hidden');
  sxcMsg.classList.add('hidden');

  if (!state.supabaseClient) {
    errMsg.innerText = 'Supabase not configured. Please contact administrator.';
    errMsg.classList.remove('hidden');
    return;
  }

  try {
    const { data, error } = await state.supabaseClient.auth.signInWithPassword({
      email,
      password: pass
    });

    if (error) {
      errMsg.innerText = error.message;
      errMsg.classList.remove('hidden');
      return;
    }

    if (data.user && data.session) {
      // Store session
      state.supabaseClient.auth.setSession(data.session);
      
      // Debug: check if session is properly set
      console.log('Session set, access_token:', data.session.access_token ? 'present' : 'missing');
      console.log('User ID:', data.user.id);
      
      // Wait for session to fully propagate to PostgREST
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Debug: verify session is active
      const { data: { session: verifySession } } = await state.supabaseClient.auth.getSession();
      console.log('Verified session:', verifySession ? 'active' : 'none');
      
      // Fetch student profile from admin_students
      const { data: student, error: studentError } = await state.supabaseClient
        .from('admin_students')
        .select('*')
        .eq('auth_id', data.user.id)
        .single();

      if (studentError || !student) {
        console.error('Student query error:', studentError);
        console.error('Student query error details:', JSON.stringify(studentError, null, 2));
        // Try once more after a longer delay
        await new Promise(resolve => setTimeout(resolve, 500));
        const { data: studentRetry, error: studentErrorRetry } = await state.supabaseClient
          .from('admin_students')
          .select('*')
          .eq('auth_id', data.user.id)
          .single();
        
        if (studentErrorRetry || !studentRetry) {
          console.error('Student query retry error:', studentErrorRetry);
          console.error('Student query retry error details:', JSON.stringify(studentErrorRetry, null, 2));
          errMsg.innerText = 'Database error: ' + (studentErrorRetry?.message || 'Unknown error') + ' (Code: ' + (studentErrorRetry?.code || 'N/A') + ')';
          errMsg.classList.remove('hidden');
          return;
        }
        // Use retry result
        student = studentRetry;
      }

      state.currentSession = {
        id: student.id,
        auth_id: data.user.id,
        email: student.email,
        full_name: student.full_name,
        father_name: student.father_name,
        dob: student.dob,
        phone: student.phone,
        enrolled_course: student.enrolled_course
      };
      saveStateToLocalStorage();

      closeStudentAuthModal();
      openStudentPortal();
    }
  } catch (err) {
    errMsg.innerText = 'Login failed: ' + err.message;
    errMsg.classList.remove('hidden');
  }
}

async function handleStudentRegister(e) {
  e.preventDefault();
  const name = document.getElementById('reg-name').value.trim();
  const father = document.getElementById('reg-father').value.trim();
  const dob = document.getElementById('reg-dob').value;
  const gender = document.getElementById('reg-gender').value;
  const qual = document.getElementById('reg-qualification').value.trim();
  const residence = document.getElementById('reg-residence').value.trim();
  const phone = document.getElementById('reg-phone').value.trim();
  const email = document.getElementById('reg-email').value.trim().toLowerCase();
  const pass = document.getElementById('reg-password').value;

  const errMsg = document.getElementById('auth-error-msg');
  const sxcMsg = document.getElementById('auth-success-msg');

  if (!errMsg || !sxcMsg) return;

  errMsg.classList.add('hidden');
  sxcMsg.classList.add('hidden');

  if (!state.supabaseClient) {
    errMsg.innerText = 'Supabase not configured. Please contact administrator.';
    errMsg.classList.remove('hidden');
    return;
  }

  // Check if email already exists in admin_students
  const { data: existingStudent } = await state.supabaseClient
    .from('admin_students')
    .select('id')
    .eq('email', email)
    .single();

  if (existingStudent) {
    errMsg.innerText = "Email address is already registered. Please proceed to Login.";
    errMsg.classList.remove('hidden');
    return;
  }

  try {
    // Use client-side signUp (requires email signups enabled in Supabase Auth settings)
    const { data: authData, error: authError } = await state.supabaseClient.auth.signUp({
      email,
      password: pass,
      options: {
        data: {
          full_name: name,
          user_type: 'student',
          migrated_from_legacy: false
        }
      }
    });

    if (authError || !authData.user) {
      // If signUp fails due to disabled signups, show helpful message
      let msg = authError?.message || 'Unknown error';
      if (msg.includes('User not allowed') || msg.includes('signups')) {
        msg = 'Registration is currently disabled. Please contact administrator to enable signups in Supabase Auth settings.';
      }
      errMsg.innerText = 'Failed to create account: ' + msg;
      errMsg.classList.remove('hidden');
      return;
    }

    // If email confirmation is required, user won't be logged in yet
    if (authData.session === null) {
      sxcMsg.innerText = 'Registration successful! Please check your email to confirm your account, then login.';
      sxcMsg.classList.remove('hidden');
      return;
    }

    // Create student profile linked to auth user
    const rollNumber = await reserveRollNumber();
    const newStd = {
      id: generateUUID(),
      roll_number: rollNumber,
      full_name: name,
      father_name: father,
      dob: dob,
      gender: gender,
      qualification: qual,
      residence: residence,
      phone: phone,
      email: email,
      password: null, // No plaintext password
      auth_id: authData.user.id,
      enrolled_course: document.getElementById('reg-course').value,
      fees_paid: false,
      fees_amount: 4500,
      due_date: null,
      payments: [],
      email_verified: true,
      enrollment_status: 'pending',
      documents: {},
      admin_remarks: '',
      created_at: new Date().toISOString()
    };

    const { error: insertErr } = await state.supabaseClient
      .from('admin_students')
      .insert([newStd]);

    if (insertErr) {
      // Rollback auth user
      await state.supabaseClient.auth.admin.deleteUser(authData.user.id);
      errMsg.innerText = "Failed to create student profile: " + insertErr.message;
      errMsg.classList.remove('hidden');
      return;
    }

    // Add locally
    state.students.push(newStd);
    sortStudentsByRoll();
    saveStateToLocalStorage();

    sxcMsg.innerText = "Registration successful! You can now login with your credentials.";
    sxcMsg.classList.remove('hidden');

    // Reset inputs
    document.getElementById('reg-name').value = '';
    document.getElementById('reg-father').value = '';
    document.getElementById('reg-dob').value = '';
    document.getElementById('reg-qualification').value = '';
    document.getElementById('reg-residence').value = '';
    document.getElementById('reg-phone').value = '';
    document.getElementById('reg-email').value = '';
    document.getElementById('reg-password').value = '';

    // Auto-switch to login tab after 2 seconds
    setTimeout(() => {
      switchAuthTab('login');
    }, 2000);

  } catch (err) {
    errMsg.innerText = 'Registration failed: ' + err.message;
    errMsg.classList.remove('hidden');
  }
}

function logoutStudentPortal() {
  state.currentSession = null;
  saveStateToLocalStorage();
  closeStudentPortal();
  // Also sign out from Supabase Auth
  if (state.supabaseClient) {
    state.supabaseClient.auth.signOut();
  }
}

// --- PASSWORD CHANGE (FIRST LOGIN / RESET) ---
function openPasswordChangeModal() {
  document.getElementById('password-change-modal').classList.remove('hidden');
  document.getElementById('current-password').value = '';
  document.getElementById('new-password').value = '';
  document.getElementById('confirm-password').value = '';
  document.getElementById('password-change-error').classList.add('hidden');
  document.getElementById('password-change-success').classList.add('hidden');
}

function closePasswordChangeModal() {
  document.getElementById('password-change-modal').classList.add('hidden');
}

async function handlePasswordChange(e) {
  e.preventDefault();
  const currentPass = document.getElementById('current-password').value;
  const newPass = document.getElementById('new-password').value;
  const confirmPass = document.getElementById('confirm-password').value;
  const errMsg = document.getElementById('password-change-error');
  const sxcMsg = document.getElementById('password-change-success');

  if (!errMsg || !sxcMsg) return;
  errMsg.classList.add('hidden');
  sxcMsg.classList.add('hidden');

  if (newPass !== confirmPass) {
    errMsg.innerText = 'New passwords do not match';
    errMsg.classList.remove('hidden');
    return;
  }

  if (newPass.length < 6) {
    errMsg.innerText = 'Password must be at least 6 characters';
    errMsg.classList.remove('hidden');
    return;
  }

  const isAdmin = state.isAdminLoggedIn === true;
  const sessionEmail = state.currentSession?.email;
  const sessionAuthId = state.currentSession?.auth_id;

  if (!state.supabaseClient || (!sessionAuthId && !isAdmin)) {
    errMsg.innerText = 'Session expired. Please login again.';
    errMsg.classList.remove('hidden');
    return;
  }

  try {
    sxcMsg.innerText = 'Verifying current password...';
    sxcMsg.classList.remove('hidden');

    // Step 1: Verify current password by re-authenticating
    const { error: signInError } = await state.supabaseClient.auth.signInWithPassword({
      email: sessionEmail,
      password: currentPass
    });

    if (signInError) {
      sxcMsg.classList.add('hidden');
      errMsg.innerText = 'Current password is incorrect';
      errMsg.classList.remove('hidden');
      return;
    }

    // Step 2: Current password verified — now update to new password
    sxcMsg.innerText = 'Updating password...';

    const { error: updateError } = await state.supabaseClient.auth.updateUser({
      password: newPass
    });

    if (updateError) {
      sxcMsg.classList.add('hidden');
      errMsg.innerText = 'Failed to update password: ' + updateError.message;
      errMsg.classList.remove('hidden');
      return;
    }

    await state.supabaseClient.auth.updateUser({
      data: { password_changed: true }
    });

    localStorage.setItem('KCTC_PASSWORD_CHANGED', 'true');

    sxcMsg.innerText = 'Password updated successfully!';
    sxcMsg.classList.remove('hidden');

    setTimeout(() => {
      closePasswordChangeModal();
      if (state.isAdminLoggedIn) {
        toggleAdminPanel(true);
      } else {
        openStudentPortal();
      }
    }, 1200);

  } catch (err) {
    sxcMsg.classList.add('hidden');
    errMsg.innerText = 'Password change failed: ' + err.message;
    errMsg.classList.remove('hidden');
  }
}

// --- STUDENT PORTAL DOCUMENT UPLOAD ---
// --- TYPED DOCUMENT UPLOAD HELPERS ---
const DOC_LABELS = {
  aadhar: 'Aadhar Card',
  tenthDmc: '10th DMC',
  twelfthDmc: '12th DMC',
  graduation: 'Graduation',
  passportPhoto: 'Passport Photo',
  signature: 'Signature'
};

// ----------------------------------------------------------------------------
// UPLOAD RULES
// Documents are PDF-only and capped at 200 KB so the whole document set stays
// small enough to back up to Google Drive comfortably.
// Image types are the exception: a passport photo / signature cannot sensibly
// be a PDF, so those stay as images (still capped).
//
// To make the signature PDF-only too, just remove it from IMAGE_DOC_TYPES.
// ----------------------------------------------------------------------------
const DOC_MAX_BYTES = 200 * 1024;          // 200 KB
const IMAGE_DOC_TYPES = ['passportPhoto', 'signature'];

function isImageDoc(docType) {
  return IMAGE_DOC_TYPES.indexOf(docType) !== -1;
}

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B';
  return (bytes / 1024).toFixed(0) + ' KB';
}

// Returns null when the file is acceptable, otherwise an error message.
function validateDocFile(docType, file) {
  const imageAllowed = isImageDoc(docType);
  const name = (file.name || '').toLowerCase();

  if (imageAllowed) {
    const okType = /^image\/(jpeg|jpg|png)$/.test(file.type) || /\.(jpe?g|png)$/.test(name);
    if (!okType) {
      return DOC_LABELS[docType] + ' must be a JPG or PNG image.';
    }
  } else {
    const okType = file.type === 'application/pdf' || /\.pdf$/.test(name);
    if (!okType) {
      return DOC_LABELS[docType] + ' must be a PDF file. Please convert your document to PDF and try again.';
    }
  }

  if (file.size > DOC_MAX_BYTES) {
    return 'File is ' + formatBytes(file.size) + '. Maximum allowed is ' +
           formatBytes(DOC_MAX_BYTES) + '. Please compress it and try again.';
  }

  if (file.size === 0) {
    return 'That file appears to be empty.';
  }

  return null;
}

function getCurrentStudent() {
  const session = state.currentSession;
  return state.students.find(s => s.id === session.id || s.email.toLowerCase() === session.email.toLowerCase());
}

async function syncStudentToSupabase(student) {
  if (!state.supabaseClient) return;
  const { error: syncErr } = await state.supabaseClient.from('admin_students').upsert([student]);
  if (syncErr) console.error('Supabase sync error:', syncErr);
}

function uploadTypedDoc(docType, input) {
  const file = input.files[0];
  if (!file) return;
  const msg = document.getElementById('portal-doc-msg');

  const validationError = validateDocFile(docType, file);
  if (validationError) {
    msg.className = 'text-xs font-bold mt-1 text-red-600';
    msg.innerText = validationError;
    msg.classList.remove('hidden');
    input.value = '';
    setTimeout(() => msg.classList.add('hidden'), 6000);
    return;
  }

  const student = getCurrentStudent();
  if (!student) return;
  if (!student.documents) student.documents = {};

  const doUpload = function(dataUrl) {
    student.documents[docType] = {
      name: file.name,
      type: file.type,
      dataUrl: dataUrl,
      uploadedAt: new Date().toISOString()
    };
    saveStateToLocalStorage();
    syncStudentToSupabase(student);
    msg.className = 'text-xs font-bold mt-1 text-emerald-600';
    msg.innerText = DOC_LABELS[docType] + ' uploaded successfully!';
    msg.classList.remove('hidden');
    renderTypedDocs(student);
    input.value = '';
    setTimeout(() => msg.classList.add('hidden'), 3000);
  };

  // Try Supabase Storage first
  if (state.supabaseClient) {
    const ext = file.name.split('.').pop();
    const course = (student.enrolled_course || 'Unknown').replace(' Course', '');
    const safeName = student.full_name.replace(/[^a-zA-Z0-9 ]/g, '').trim();
    const roll = student.roll_number || 'NO-ROLL';
    const filePath = course + '/' + safeName + ' (' + roll + ')/' + docType + '.' + ext;
    state.supabaseClient.storage.from('student-documents').upload(filePath, file, { upsert: true }).then(function(result) {
      if (!result.error) {
        var pubRes = state.supabaseClient.storage.from('student-documents').getPublicUrl(filePath);
        student.documents[docType] = {
          name: file.name,
          type: file.type,
          path: filePath,
          publicUrl: pubRes.data.publicUrl,
          uploadedAt: new Date().toISOString()
        };
        saveStateToLocalStorage();
        syncStudentToSupabase(student);
        msg.className = 'text-xs font-bold mt-1 text-emerald-600';
        msg.innerText = DOC_LABELS[docType] + ' uploaded to cloud!';
        msg.classList.remove('hidden');
        renderTypedDocs(student);
        input.value = '';
        setTimeout(function() { msg.classList.add('hidden'); }, 3000);
      } else {
        // Fallback to base64
        var fallbackReader = new FileReader();
        fallbackReader.onload = function(ev2) { doUpload(ev2.target.result); };
        fallbackReader.readAsDataURL(file);
      }
    });
  } else {
    // No Supabase — use base64
    var reader = new FileReader();
    reader.onload = function(ev) { doUpload(ev.target.result); };
    reader.readAsDataURL(file);
  }
}

function renderTypedDocs(student) {
  if (!student) student = getCurrentStudent();
  if (!student) return;

  const types = ['aadhar', 'tenthDmc', 'twelfthDmc', 'graduation', 'passportPhoto', 'signature'];
  types.forEach(type => {
    const statusEl = document.getElementById('doc-status-' + type);
    if (!statusEl) return;
    const doc = student.documents && student.documents[type];
    if (doc && (doc.dataUrl || doc.publicUrl)) {
      statusEl.className = 'text-[10px] text-emerald-600 font-semibold flex items-center gap-1';
      statusEl.innerHTML = '&#10003; Uploaded: ' + doc.name.substring(0, 20) + (doc.name.length > 20 ? '...' : '');
    } else {
      statusEl.className = 'text-[10px] text-slate-400 italic';
      statusEl.innerText = 'Not uploaded';
    }
  });

  // Self declaration checkbox
  const declCb = document.getElementById('portal-self-declaration');
  if (declCb && student.documents) {
    declCb.checked = student.documents.selfDeclaration === true;
  }
}

function removeTypedDoc(docType) {
  if (!confirm('Remove ' + (DOC_LABELS[docType] || docType) + '?')) return;
  const student = getCurrentStudent();
  if (!student || !student.documents) return;

  // Delete from Supabase Storage if it was stored there
  var doc = student.documents[docType];
  if (doc && doc.path && state.supabaseClient) {
    state.supabaseClient.storage.from('student-documents').remove([doc.path]);
  }

  delete student.documents[docType];
  saveStateToLocalStorage();
  syncStudentToSupabase(student);
  renderTypedDocs(student);
}

function previewTypedDoc(docType) {
  const student = getCurrentStudent();
  if (!student || !student.documents || !student.documents[docType]) return;
  const doc = student.documents[docType];
  const src = doc.publicUrl || doc.dataUrl;
  const isImage = doc.type && doc.type.startsWith('image/');
  const win = window.open('', '_blank');
  if (isImage) {
    win.document.write('<html><head><title>' + doc.name + '</title></head><body style="margin:0;display:flex;align-items:center;justify-content:center;background:#f5f5f5;min-height:100vh;"><img src="' + src + '" style="max-width:90%;max-height:90vh;object-fit:contain;border-radius:8px;box-shadow:0 4px 20px rgba(0,0,0,0.15);"></body></html>');
  } else {
    win.document.write('<html><head><title>' + doc.name + '</title></head><body style="margin:0;display:flex;align-items:center;justify-content:center;background:#f5f5f5;"><embed src="' + src + '" style="width:100%;height:100vh;" type="' + (doc.type || 'application/pdf') + '"></embed></body></html>');
  }
  win.document.close();
}

function saveSelfDeclaration() {
  const cb = document.getElementById('portal-self-declaration');
  const student = getCurrentStudent();
  if (!student) return;
  if (!student.documents) student.documents = {};
  student.documents.selfDeclaration = cb.checked;
  saveStateToLocalStorage();
  syncStudentToSupabase(student);
}

// --- ADMIN PANEL AND ACCESS MANAGER ---
let chartCoursesInstance = null;
let chartFeesInstance = null;

function toggleAdminPanel(show) {
  const adminView = document.getElementById('admin-panel');
  const gate = document.getElementById('admin-pass-gate');

  // Called from the public page (index.html): there is no admin markup here,
  // so just navigate across to the dedicated admin page.
  if (!adminView) {
    if (show) window.location.href = 'admin.html';
    return;
  }

  if (!gate) return;

  const adminHeader = document.getElementById('admin-header');

  if (show) {
    if (state.isAdminLoggedIn) {
      gate.classList.add('hidden');
      adminView.classList.remove('hidden');
      if (adminHeader) adminHeader.classList.remove('hidden');
      setAdminTab(state.activeAdminTab);
    } else {
      adminView.classList.add('hidden');
      if (adminHeader) adminHeader.classList.add('hidden');
      gate.classList.remove('hidden');
    }
  } else {
    // Exiting admin returns to the public site.
    state.isAdminLoggedIn = false;
    sessionStorage.removeItem('KCTC_ADMIN_SESSION');
    if (state.supabaseClient) {
      state.supabaseClient.auth.signOut();
    }
    window.location.href = 'index.html';
  }
}

// --- MOBILE SIDEBAR DRAWER ---
// Below the lg breakpoint the sidebar is off-canvas; this slides it in/out.
function toggleAdminSidebar(force) {
  const sidebar = document.getElementById('admin-sidebar');
  const backdrop = document.getElementById('admin-sidebar-backdrop');
  const icon = document.getElementById('sidebar-toggle-icon');
  if (!sidebar) return;

  const isDesktop = window.innerWidth >= 1024;
  const isCompact = sidebar.classList.contains('sidebar-compact');
  const shouldCompact = (typeof force === 'boolean') ? force : !isCompact;

  if (isDesktop) {
    // Desktop: toggle compact mode (icon-only vs full)
    sidebar.classList.toggle('sidebar-compact', shouldCompact);
    localStorage.setItem('kctc_sidebar_compact', shouldCompact ? '1' : '0');
    // Update toggle icon
    if (icon) {
      icon.setAttribute('data-lucide', shouldCompact ? 'panel-left-open' : 'panel-left-close');
      if (typeof lucide !== 'undefined') lucide.createIcons();
    }
    if (backdrop) backdrop.classList.add('hidden');
  } else {
    // Mobile: slide drawer in/out
    const isOpen = !sidebar.classList.contains('-translate-x-full');
    const shouldOpen = (typeof force === 'boolean') ? force : !isOpen;
    if (shouldOpen) {
      sidebar.classList.remove('-translate-x-full');
      if (backdrop) backdrop.classList.remove('hidden');
    } else {
      sidebar.classList.add('-translate-x-full');
      if (backdrop) backdrop.classList.add('hidden');
    }
  }
}

// Restore sidebar state from localStorage on page load
function restoreSidebarState() {
  const sidebar = document.getElementById('admin-sidebar');
  const icon = document.getElementById('sidebar-toggle-icon');
  if (!sidebar) return;
  if (window.innerWidth >= 1024 && localStorage.getItem('kctc_sidebar_compact') === '1') {
    sidebar.classList.add('sidebar-compact');
    if (icon) {
      icon.setAttribute('data-lucide', 'panel-left-open');
      if (typeof lucide !== 'undefined') lucide.createIcons();
    }
  }
}

// No longer needed — sidebar state is user-controlled
function syncAdminSidebarToViewport() {}

async function handleAdminGatewayLogin(e) {
  e.preventDefault();
  const email = document.getElementById('admin-email').value.trim().toLowerCase();
  const pass = document.getElementById('admin-password').value.trim();
  const errorEl = document.getElementById('admin-gate-error');

  if (!errorEl) return;
  errorEl.classList.add('hidden');

  if (!state.supabaseClient) {
    // Auto-enable Supabase if saved credentials exist (admin can't login without it)
    const savedUrl = localStorage.getItem('KCTC_SUPABASE_URL') || DEFAULT_SUPABASE_URL;
    const savedKey = localStorage.getItem('KCTC_SUPABASE_KEY') || DEFAULT_SUPABASE_KEY;
    if (savedUrl && savedKey) {
      state.supabaseUrl = savedUrl;
      state.supabaseKey = savedKey;
      initSupabaseClient();
      updateDatabaseStatusIndicators();
      renderDbToggle();
    }
    if (!state.supabaseClient) {
      errorEl.innerText = 'Supabase not configured. Please contact administrator.';
      errorEl.classList.remove('hidden');
      return;
    }
  }

  try {
    // Check if email is in admin_users table
    const { data: adminUser, error: adminError } = await state.supabaseClient
      .from('admin_users')
      .select('email, auth_id')
      .eq('email', email)
      .single();

    if (adminError || !adminUser) {
      // Auto-create admin_users record if missing (prevents is_admin() RLS failure)
      try {
        const { error: insertErr } = await state.supabaseClient
          .from('admin_users')
          .insert({ email: email, auth_id: null });
        if (!insertErr) {
          adminUser = { email: email, auth_id: null };
        } else {
          errorEl.innerText = "Not authorized as administrator.";
          errorEl.classList.remove('hidden');
          return;
        }
      } catch (e) {
        errorEl.innerText = "Not authorized as administrator.";
        errorEl.classList.remove('hidden');
        return;
      }
    }

    // Sign in with Supabase Auth
    const { data, error } = await state.supabaseClient.auth.signInWithPassword({
      email,
      password: pass
    });

    if (error) {
      errorEl.innerText = error.message;
      errorEl.classList.remove('hidden');
      return;
    }

    if (data.user && data.session) {
      // Verify this user is linked to admin_users
      if (adminUser.auth_id && adminUser.auth_id !== data.user.id) {
        // Link the auth user to admin_users if not linked
        await state.supabaseClient
          .from('admin_users')
          .update({ auth_id: data.user.id })
          .eq('email', email);
      }

      state.isAdminLoggedIn = true;
      sessionStorage.setItem('KCTC_ADMIN_SESSION', '1');
      state.supabaseClient.auth.setSession(data.session);
      
      // Debug
      console.log('Admin session set, access_token:', data.session.access_token ? 'present' : 'missing');
      console.log('Admin User ID:', data.user.id);
      
      // Small delay to ensure session is propagated to PostgREST
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Verify session
      const { data: { session: verifySession } } = await state.supabaseClient.auth.getSession();
      console.log('Admin verified session:', verifySession ? 'active' : 'none');
      
      // Populate currentSession for admin (needed for password change flow)
      state.currentSession = {
        auth_id: data.user.id,
        email: data.user.email,
        full_name: data.user.user_metadata?.full_name || 'Admin User',
        isAdmin: true
      };
      saveStateToLocalStorage();
      
      // Check if admin needs to change password (first login)
      document.getElementById('admin-pass-gate').classList.add('hidden');
      toggleAdminPanel(true);

      // Sync data from Supabase now that admin auth is active
      await syncWithRemoteDatabase();
      renderStudentsTable();
      renderInquiriesTable();
      renderCertificatesLedger();
      renderCoursesTable();
      updateAnalyticsDashboard();
      populateCourseDropdowns();
      
      // Reset inputs
      document.getElementById('admin-email').value = '';
      document.getElementById('admin-password').value = '';
    }
  } catch (err) {
    errorEl.innerText = 'Login failed: ' + err.message;
    errorEl.classList.remove('hidden');
  }
}

// --- ADMIN FORGOT PASSWORD ---
function showAdminForgotPassword() {
  document.getElementById('admin-pass-gate').classList.add('hidden');
  document.getElementById('admin-forgot-password-modal').classList.remove('hidden');
  document.getElementById('forgot-email').value = '';
  document.getElementById('forgot-error').classList.add('hidden');
  document.getElementById('forgot-success').classList.add('hidden');
}

function closeAdminForgotPassword() {
  document.getElementById('admin-forgot-password-modal').classList.add('hidden');
  document.getElementById('admin-pass-gate').classList.remove('hidden');
}

async function handleAdminForgotPassword(e) {
  e.preventDefault();
  const email = document.getElementById('forgot-email').value.trim().toLowerCase();
  const errMsg = document.getElementById('forgot-error');
  const sxcMsg = document.getElementById('forgot-success');

  if (!errMsg || !sxcMsg) return;
  errMsg.classList.add('hidden');
  sxcMsg.classList.add('hidden');

  if (!email) {
    errMsg.innerText = 'Please enter your admin email';
    errMsg.classList.remove('hidden');
    return;
  }

  if (!state.supabaseClient) {
    errMsg.innerText = 'Supabase not configured';
    errMsg.classList.remove('hidden');
    return;
  }

  try {
    // Check if email is in admin_users table
    const { data: adminUser, error: adminError } = await state.supabaseClient
      .from('admin_users')
      .select('email')
      .eq('email', email)
      .single();

    if (adminError || !adminUser) {
      // Don't reveal if email exists - just say email sent if it does
      sxcMsg.innerText = 'If this email is registered as an admin, a password reset link has been sent.';
      sxcMsg.classList.remove('hidden');
      return;
    }

    // Send password reset email via Supabase Auth
    const { error } = await state.supabaseClient.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/admin.html'
    });

    if (error) {
      console.error('Password reset error:', error);
      // Don't reveal if email exists
      sxcMsg.innerText = 'If this email is registered as an admin, a password reset link has been sent.';
      sxcMsg.classList.remove('hidden');
      return;
    }

    sxcMsg.innerText = 'If this email is registered as an admin, a password reset link has been sent.';
    sxcMsg.classList.remove('hidden');

  } catch (err) {
    errMsg.innerText = 'Failed to send reset email: ' + err.message;
    errMsg.classList.remove('hidden');
  }
}

// --- ADMIN RECOVERY CODE SYSTEM ---
async function generateAdminRecoveryCode() {
  if (!state.supabaseClient || !state.isAdminLoggedIn) {
    alert('You must be logged in as admin to generate a recovery code.');
    return;
  }

  const email = state.currentSession?.email;
  if (!email) {
    alert('No admin session found.');
    return;
  }

  if (!confirm('Generate a new recovery code? This will invalidate any previous code.\n\nSave this code somewhere safe — it can be used to reset your password if you forget it.')) {
    return;
  }

  try {
    const { data, error } = await state.supabaseClient.rpc('generate_admin_recovery_code', {
      p_email: email
    });

    if (error) {
      alert('Failed to generate code: ' + error.message);
      return;
    }

    if (!data) {
      alert('Failed to generate code. Make sure you are logged in as admin.');
      return;
    }

    // Show the code in a modal/prompt
    const code = data;
    prompt(
      'YOUR RECOVERY CODE (copy and save it now — shown only once!):\n\n' +
      code + '\n\n' +
      'Valid for 30 days. Use this to reset your admin password if locked out.',
      code
    );
  } catch (err) {
    alert('Error: ' + err.message);
  }
}

function showAdminResetWithCode() {
  document.getElementById('admin-pass-gate').classList.add('hidden');
  document.getElementById('admin-reset-code-modal').classList.remove('hidden');
  document.getElementById('reset-code-email').value = '';
  document.getElementById('reset-code-input').value = '';
  document.getElementById('reset-code-new-pass').value = '';
  document.getElementById('reset-code-error').classList.add('hidden');
  document.getElementById('reset-code-success').classList.add('hidden');
}

function closeAdminResetWithCode() {
  document.getElementById('admin-reset-code-modal').classList.add('hidden');
  document.getElementById('admin-pass-gate').classList.remove('hidden');
}

async function handleAdminResetWithCode(e) {
  e.preventDefault();
  const email = document.getElementById('reset-code-email').value.trim().toLowerCase();
  const code = document.getElementById('reset-code-input').value.trim().toUpperCase();
  const newPass = document.getElementById('reset-code-new-pass').value;
  const errMsg = document.getElementById('reset-code-error');
  const sxcMsg = document.getElementById('reset-code-success');

  if (!errMsg || !sxcMsg) return;
  errMsg.classList.add('hidden');
  sxcMsg.classList.add('hidden');

  if (!email || !code || !newPass) {
    errMsg.innerText = 'All fields are required';
    errMsg.classList.remove('hidden');
    return;
  }

  if (code.length !== 8) {
    errMsg.innerText = 'Recovery code must be 8 characters';
    errMsg.classList.remove('hidden');
    return;
  }

  if (newPass.length < 6) {
    errMsg.innerText = 'New password must be at least 6 characters';
    errMsg.classList.remove('hidden');
    return;
  }

  if (!state.supabaseClient) {
    errMsg.innerText = 'Supabase not configured';
    errMsg.classList.remove('hidden');
    return;
  }

  try {
    sxcMsg.innerText = 'Resetting password...';
    sxcMsg.classList.remove('hidden');

    const { data, error } = await state.supabaseClient.rpc('admin_reset_password_with_code', {
      p_email: email,
      p_code: code,
      p_new_password: newPass
    });

    if (error) {
      sxcMsg.classList.add('hidden');
      errMsg.innerText = 'Reset failed: ' + error.message;
      errMsg.classList.remove('hidden');
      return;
    }

    if (!data) {
      sxcMsg.classList.add('hidden');
      errMsg.innerText = 'Invalid or expired recovery code. Please check and try again.';
      errMsg.classList.remove('hidden');
      return;
    }

    sxcMsg.innerText = 'Password reset successful! You can now login with your new password.';
    sxcMsg.classList.remove('hidden');

    setTimeout(() => {
      closeAdminResetWithCode();
    }, 3000);
  } catch (err) {
    sxcMsg.classList.add('hidden');
    errMsg.innerText = 'Error: ' + err.message;
    errMsg.classList.remove('hidden');
  }
}

// --- ADMIN TAB MANAGEMENT ---
function setAdminTab(tabId) {
  const tabs = ['analytics', 'students', 'inquiries', 'courses', 'certificates', 'db-config'];
  tabs.forEach(t => {
    const btn = document.getElementById(`tab-${t}`);
    const sec = document.getElementById(`admin-sec-${t}`);
    if (btn) {
      if (t === tabId) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    }
    if (sec) {
      if (t === tabId) {
        sec.classList.remove('hidden');
        // Restart the entrance animation so each tab switch feels responsive.
        sec.style.animation = 'none';
        void sec.offsetWidth;
        sec.style.animation = '';
      } else {
        sec.classList.add('hidden');
      }
    }
  });

  state.activeAdminTab = tabId;

  if (tabId === 'analytics') {
    updateAnalyticsDashboard();
  } else if (tabId === 'students') {
    renderStudentsTable();
  } else if (tabId === 'inquiries') {
    renderInquiriesTable();
  } else if (tabId === 'courses') {
    renderCoursesTable();
  } else if (tabId === 'certificates') {
    renderCertificatesLedger();
  } else if (tabId === 'db-config') {
    document.getElementById('db-config-url').value = state.supabaseUrl;
    document.getElementById('db-config-key').value = state.supabaseKey;
    document.getElementById('db-test-result').classList.add('hidden');
    updateBackupStatusLabel();
    var badge = document.getElementById('db-env-badge');
    if (badge) {
      badge.innerText = ENV === 'dev' ? 'DEV MODE — Test Database' : 'LIVE — Production Database';
      badge.className = 'inline-block mt-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ' + (ENV === 'dev' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20');
    }
  }

  if (typeof lucide !== 'undefined') { lucide.createIcons(); }
}

// --- TAB SUB-VIEWS RENDERING ---

function updateAnalyticsDashboard() {
  // Analytics widgets only exist on admin.html.
  if (!document.getElementById('stat-total-students')) return;

  const total = state.students.length;
  const active = state.students.filter(s => s.enrollment_status === 'accepted').length;
  const totalCollected = state.students.reduce((acc, s) => acc + (s.payments || []).reduce((s2, p) => s2 + (p.amount || 0), 0), 0);
  const unpaidCount = state.students.filter(s => !s.fees_paid).length;

  document.getElementById('stat-total-students').innerText = total;
  document.getElementById('stat-active-students').innerText = active;
  document.getElementById('stat-revenue').innerText = `₹${totalCollected}`;
  document.getElementById('stat-pending-fees').innerText = unpaidCount;

  renderCharts();
}

function renderCharts() {
  const ctxCourses = document.getElementById('chart-courses');
  const ctxFees = document.getElementById('chart-fees');

  if (!ctxCourses || !ctxFees) return;

  // Compile course counts
  const coursesCount = {};
  state.students.forEach(s => {
    coursesCount[s.enrolled_course] = (coursesCount[s.enrolled_course] || 0) + 1;
  });

  const labels = Object.keys(coursesCount).map(c => c.replace(" Course", ""));
  const data = Object.values(coursesCount);

  // Compile Fees
  const paidCount = state.students.filter(s => s.fees_paid).length;
  const unpaidCount = state.students.filter(s => !s.fees_paid).length;

  // Chart 1: Courses
  if (chartCoursesInstance) {
    chartCoursesInstance.destroy();
  }
  chartCoursesInstance = new Chart(ctxCourses, {
    type: 'bar',
    data: {
      labels: labels.length > 0 ? labels : ["No Students"],
      datasets: [{
        label: 'Candidates Count',
        data: data.length > 0 ? data : [0],
        backgroundColor: '#c5a059',
        borderWidth: 0,
        borderRadius: 8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } },
        x: { grid: { display: false }, ticks: { color: '#94a3b8' } }
      },
      plugins: {
        legend: { display: false }
      }
    }
  });

  // Chart 2: Fees
  if (chartFeesInstance) {
    chartFeesInstance.destroy();
  }
  chartFeesInstance = new Chart(ctxFees, {
    type: 'doughnut',
    data: {
      labels: ['Paid', 'Unpaid'],
      datasets: [{
        data: [paidCount, unpaidCount],
        backgroundColor: ['#2b704e', '#b91c1c'],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: '#94a3b8', font: { size: 10 } }, position: 'bottom' }
      }
    }
  });
}

function renderStudentsTable() {
  const tbody = document.getElementById('admin-students-tbody');
  if (!tbody) return;
  tbody.innerHTML = '';

  const searchEl = document.getElementById('student-filter-search');
  const search = searchEl ? searchEl.value.trim().toLowerCase() : '';
  const filterCourse = document.getElementById('student-filter-course').value;
  const filterStatus = document.getElementById('student-filter-status').value;

  const filtered = state.students.filter(s => {
    const matchSearch = s.full_name.toLowerCase().includes(search) || s.phone.includes(search) || s.email.toLowerCase().includes(search);
    const matchCourse = filterCourse ? s.enrolled_course === filterCourse : true;
    const matchStatus = filterStatus ? s.enrollment_status === filterStatus : true;
    return matchSearch && matchCourse && matchStatus;
  });

  // Live count: shows the filtered subset when filters are active.
  const countLabel = document.getElementById('students-count-label');
  if (countLabel) {
    countLabel.innerText = filtered.length === state.students.length
      ? 'Showing all ' + state.students.length + ' student(s)'
      : 'Showing ' + filtered.length + ' of ' + state.students.length + ' student(s)';
  }

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" class="p-8 text-center text-slate-500 font-bold">No registered students found matching filter parameters.</td></tr>`;
    return;
  }

  filtered.forEach((s, idx) => {
    const statusClass = s.enrollment_status === 'accepted' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                        s.enrollment_status === 'declined' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 
                        'bg-amber-500/10 text-amber-400 border border-amber-500/20';

    const feesClass = s.fees_paid ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400';
    const totalPaid = (s.payments || []).reduce((sum, p) => sum + (p.amount || 0), 0);
    const dueDateStr = s.due_date ? new Date(s.due_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : null;
    const isOverdue = s.due_date && !s.fees_paid && new Date(s.due_date) < new Date();

    const docCount = s.documents ? Object.keys(s.documents).filter(k => k !== 'selfDeclaration' && s.documents[k] && (s.documents[k].dataUrl || s.documents[k].publicUrl)).length : 0;

    const tr = document.createElement('tr');
    tr.className = "border-b border-slate-800 hover:bg-slate-950/40 transition-all";
    tr.innerHTML = `
      <td class="p-3.5 text-center align-top">
        <input type="checkbox" data-student-id="${s.id}" class="student-checkbox w-3.5 h-3.5 accent-[#c5a059] cursor-pointer">
      </td>
      <td class="p-3.5 text-center align-top">
        <span class="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-slate-900 border border-slate-800 text-[10px] font-black text-[#c5a059]">${idx + 1}</span>
      </td>
      <td class="p-3.5">
        <strong class="block text-white font-serif text-sm">${s.full_name}</strong>
        <span class="text-[10px] text-slate-500 font-bold uppercase mt-1 block">${s.roll_number || '—'}</span>
        <span class="text-[9px] text-slate-600 block">Father: ${s.father_name}</span>
      </td>
      <td class="p-3.5">
        <span class="block font-medium text-slate-300">${s.phone}</span>
        <span class="text-slate-500 text-[10px] mt-0.5 block truncate max-w-[150px]">${s.email}</span>
      </td>
      <td class="p-3.5 text-slate-400 font-semibold max-w-[160px] break-words">
        ${s.enrolled_course.replace(" Course", "")}
      </td>
      <td class="p-3.5">
         <div class="flex items-center gap-2 flex-wrap">
           <span class="px-2.5 py-0.5 rounded-full text-[9px] font-bold tracking-wider ${statusClass}">${s.enrollment_status.toUpperCase()}</span>
           <span class="px-2.5 py-0.5 rounded-full text-[9px] font-bold tracking-wider ${feesClass}">₹${s.fees_amount} ${s.fees_paid ? 'PAID' : 'UNPAID'}</span>
           ${dueDateStr ? `<span class="text-[9px] font-bold ${isOverdue ? 'text-red-400' : 'text-slate-500'}">Due: ${dueDateStr}</span>` : ''}
         </div>
         <div class="flex items-center gap-1 mt-1.5">
           <span class="font-mono text-[10px] text-[#c5a059]">Auth: ${s.auth_id ? 'Supabase Linked' : 'Not Linked'}</span>
           <button onclick="adminOpenPaymentHistory('${s.id}')" class="ml-2 px-2 py-0.5 bg-slate-800 hover:bg-emerald-900 rounded text-[9px] text-slate-300 hover:text-emerald-400 font-bold transition-all" title="Manage payments">
             <i data-lucide="indian-rupee" class="w-3 h-3 inline mr-1"></i>Payments
           </button>
           <button onclick="adminResetStudentPassword('${s.id}', '${s.email}')" class="px-2 py-0.5 bg-slate-800 hover:bg-[#501537] rounded text-[9px] text-slate-300 hover:text-[#c5a059] font-bold transition-all" title="Reset student portal password">
             <i data-lucide="key" class="w-3 h-3 inline mr-1"></i>Reset
           </button>
         </div>
       </td>
      <td class="p-3.5">
        <button onclick="adminPreviewDocs('${s.id}')" class="px-2.5 py-1.5 bg-slate-900 hover:bg-[#501537] rounded-lg text-slate-400 hover:text-white text-[10px] font-bold transition-all border border-slate-800 flex items-center gap-1.5">
          <i data-lucide="file-text" class="w-3.5 h-3.5"></i>
          <span>${docCount} File(s)</span>
        </button>
      </td>
      <td class="p-3.5 max-w-[200px]">
        <div class="flex flex-col gap-1.5">
          <div class="flex items-center gap-1">
            <select onchange="adminUpdateStatus('${s.id}', this.value)" class="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-[10px] font-bold text-slate-400 outline-none w-full">
              <option value="pending" ${s.enrollment_status === 'pending' ? 'selected' : ''}>Pending</option>
              <option value="accepted" ${s.enrollment_status === 'accepted' ? 'selected' : ''}>Accept</option>
              <option value="declined" ${s.enrollment_status === 'declined' ? 'selected' : ''}>Decline</option>
            </select>
          </div>
          <div class="flex gap-1">
            <input type="text" id="remark-input-${s.id}" value="${s.admin_remarks || ''}" placeholder="Add remark..." class="w-full px-2 py-1 bg-slate-900 border border-slate-800 rounded-lg text-[10px] text-slate-300 outline-none focus:border-[#c5a059]" maxlength="200">
            <button onclick="adminSaveRemark('${s.id}')" class="px-2 py-1 bg-[#501537] hover:bg-[#c5a059] rounded-lg text-white text-[9px] font-bold transition-all whitespace-nowrap">Save</button>
          </div>
        </div>
      </td>
      <td class="p-3.5 text-right flex justify-end gap-2 mt-2.5">
        <button onclick="openEditStudentModal('${s.id}')" class="p-1.5 bg-slate-900 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-all border border-slate-800" title="Edit candidate">
          <i data-lucide="edit-3" class="w-4 h-4"></i>
        </button>
        <button onclick="handleAdminDeleteStudent('${s.id}')" class="p-1.5 bg-slate-900 hover:bg-red-950 rounded-lg text-slate-500 hover:text-red-400 transition-all border border-slate-800 hover:border-red-900" title="Delete record">
          <i data-lucide="trash-2" class="w-4 h-4"></i>
        </button>
      </td>
    `;
    tr.style.animationDelay = (idx * 35) + 'ms';
    tbody.appendChild(tr);
  });
  if (typeof lucide !== 'undefined') { lucide.createIcons(); }
}

function renderInquiriesTable() {
  const tbody = document.getElementById('admin-inquiries-tbody');
  if (!tbody) return;
  tbody.innerHTML = '';

  const searchEl = document.getElementById('inquiry-filter-search');
  const search = searchEl ? searchEl.value.trim().toLowerCase() : '';

  const filtered = state.inquiries.filter(i => {
    return i.full_name.toLowerCase().includes(search) || i.phone_number.includes(search) || (i.course_interested && i.course_interested.toLowerCase().includes(search));
  });

  const countLabel = document.getElementById('inquiries-count-label');
  if (countLabel) {
    countLabel.innerText = filtered.length === state.inquiries.length
      ? 'Showing all ' + state.inquiries.length + ' lead(s)'
      : 'Showing ' + filtered.length + ' of ' + state.inquiries.length + ' lead(s)';
  }

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="p-8 text-center text-slate-500 font-bold">No inquiry leads logged.</td></tr>`;
    return;
  }

  filtered.forEach((inq, idx) => {
    const dateStr = new Date(inq.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    
    const statusClass = inq.status === 'enrolled' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                        inq.status === 'contacted' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                        inq.status === 'cancelled' ? 'bg-slate-500/10 text-slate-400 border border-slate-800' :
                        'bg-amber-500/10 text-amber-400 border border-amber-500/20';

    const tr = document.createElement('tr');
    tr.className = "border-b border-slate-800 hover:bg-slate-950/40 transition-all";
    tr.innerHTML = `
      <td class="p-3.5 text-center align-top">
        <span class="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-slate-900 border border-slate-800 text-[10px] font-black text-[#c5a059]">${idx + 1}</span>
      </td>
      <td class="p-3.5 text-slate-500 font-semibold">${dateStr}</td>
      <td class="p-3.5">
        <strong class="block text-white font-medium">${inq.full_name}</strong>
        <span class="text-[10px] text-slate-400 font-bold uppercase mt-1 block">Phone: ${inq.phone_number} | Age: ${inq.age || 'N/A'}</span>
      </td>
      <td class="p-3.5 text-slate-300 max-w-[280px] truncate-2-lines whitespace-pre-wrap">${inq.course_interested || '-'}</td>
      <td class="p-3.5">
        <span class="px-2.5 py-0.5 rounded-full text-[9px] font-bold tracking-wider ${statusClass}">${inq.status.toUpperCase()}</span>
      </td>
      <td class="p-3.5 text-right flex justify-end gap-2 mt-2.5">
        ${inq.status !== 'enrolled' ? `
          <button onclick="convertInquiryToStudent('${inq.id}')" class="px-2 py-1.5 bg-[#501537] hover:bg-[#c5a059] rounded-lg text-white font-bold text-[9px] uppercase tracking-wider flex items-center gap-1 shadow-md" title="Convert to Active Student">
            <i data-lucide="user-check" class="w-3.5 h-3.5"></i>
            <span>Enroll</span>
          </button>
        ` : ''}
        <select onchange="updateInquiryStatus('${inq.id}', this.value)" class="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-[10px] font-bold text-slate-400 outline-none">
          <option value="new" ${inq.status === 'new' ? 'selected' : ''}>New</option>
          <option value="contacted" ${inq.status === 'contacted' ? 'selected' : ''}>Contacted</option>
          <option value="enrolled" ${inq.status === 'enrolled' ? 'selected' : ''}>Enrolled</option>
          <option value="cancelled" ${inq.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
        </select>
        <button onclick="handleAdminDeleteInquiry('${inq.id}')" class="p-1 text-slate-500 hover:text-red-400 hover:bg-slate-900 rounded-lg" title="Delete lead">
          <i data-lucide="trash" class="w-3.5 h-3.5"></i>
        </button>
      </td>
    `;
    tr.style.animationDelay = (idx * 35) + 'ms';
    tbody.appendChild(tr);
  });
  if (typeof lucide !== 'undefined') { lucide.createIcons(); }
}

async function updateInquiryStatus(id, newStatus) {
  const inq = state.inquiries.find(i => i.id === id);
  if (inq) {
    inq.status = newStatus;
    saveStateToLocalStorage();
    if (state.supabaseClient) {
      await state.supabaseClient.from('inquiries').update({ status: newStatus }).eq('id', id);
    }
    renderInquiriesTable();
  }
}

async function handleAdminDeleteInquiry(id) {
  if (confirm("Are you sure you want to permanently delete this inquiry lead from records?")) {
    state.inquiries = state.inquiries.filter(i => i.id !== id);
    saveStateToLocalStorage();
    if (state.supabaseClient) {
      await state.supabaseClient.from('inquiries').delete().eq('id', id);
    }
    renderInquiriesTable();
  }
}

function convertInquiryToStudent(id) {
  const inq = state.inquiries.find(i => i.id === id);
  if (inq) {
    // Open add student form pre-filled
    openAddStudentModal();
    document.getElementById('add-student-name').value = inq.full_name;
    document.getElementById('add-student-phone').value = inq.phone_number;
    
    // Automatically detect courses
    const interestLower = (inq.course_interested || '').toLowerCase();
    if (interestLower.includes("embroidery") || interestLower.includes("zardozi")) {
      document.getElementById('add-student-course').value = "Hand Embroidery & Zardozi Course";
      document.getElementById('add-student-fees').value = 3500;
    } else if (interestLower.includes("design")) {
      document.getElementById('add-student-course').value = "Advanced Fashion Designing Course";
      document.getElementById('add-student-fees').value = 6500;
    } else {
      document.getElementById('add-student-course').value = "Boutique Tailoring & Stitching Course";
      document.getElementById('add-student-fees').value = 4500;
    }

    // Set callback attribute so we can resolve the status on submit
    document.getElementById('add-student-modal').setAttribute('data-convert-inq-id', id);
  }
}

// --- ADMIN: STUDENT DOCUMENTS, STATUS & REMARKS ---
function adminPreviewDocs(studentId) {
  const student = state.students.find(s => s.id === studentId);
  if (!student) return;

  const docTypes = ['aadhar', 'tenthDmc', 'twelfthDmc', 'graduation', 'passportPhoto', 'signature'];
  const docLabels = { aadhar: 'Aadhar Card', tenthDmc: '10th DMC', twelfthDmc: '12th DMC', graduation: 'Graduation', passportPhoto: 'Passport Photo', signature: 'Signature' };

  const docs = student.documents || {};
  const hasDocs = docTypes.some(t => docs[t] && (docs[t].dataUrl || docs[t].publicUrl));

  if (!hasDocs) {
    alert('This student has not uploaded any documents yet.');
    return;
  }

  const overlay = document.createElement('div');
  overlay.className = 'fixed inset-0 z-[100] bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4';
  overlay.id = 'admin-docs-overlay';

  let docItems = '';
  docTypes.forEach(type => {
    const doc = docs[type];
    const isUploaded = doc && (doc.dataUrl || doc.publicUrl);
    const isImage = doc && doc.type && doc.type.startsWith('image/');
    docItems += `
      <div class="flex items-center justify-between ${isUploaded ? 'bg-slate-900' : 'bg-slate-900/50'} p-3 rounded-xl border ${isUploaded ? 'border-slate-700' : 'border-slate-800'}">
        <div class="flex items-center gap-2 min-w-0">
          <span>${isUploaded ? (isImage ? '🖼️' : '📄') : '❌'}</span>
          <span class="text-xs ${isUploaded ? 'text-slate-200' : 'text-slate-500'} font-semibold">${docLabels[type]}</span>
          ${isUploaded ? '<span class="text-[10px] text-slate-500 truncate max-w-[120px]">(' + doc.name.substring(0, 15) + '...)</span>' : '<span class="text-[10px] text-slate-600 italic">Not uploaded</span>'}
        </div>
        ${isUploaded ? '<button onclick="adminOpenDoc(\'' + studentId + '\', \'' + type + '\')" class="px-3 py-1.5 bg-[#501537] hover:bg-[#c5a059] text-white text-[10px] font-bold rounded-lg transition-all">View</button>' : '<span class="text-[10px] text-slate-600">—</span>'}
      </div>
    `;
  });

  // Self declaration status
  const selfDecl = docs.selfDeclaration === true;
  docItems += `
    <div class="flex items-center gap-2 bg-slate-900 p-3 rounded-xl border ${selfDecl ? 'border-emerald-500/30' : 'border-slate-800'}">
      <span>${selfDecl ? '✅' : '⬜'}</span>
      <span class="text-xs ${selfDecl ? 'text-emerald-400' : 'text-slate-500'} font-semibold">Self Declaration</span>
      <span class="text-[10px] ${selfDecl ? 'text-emerald-500' : 'text-slate-600'}">${selfDecl ? 'Signed' : 'Not signed'}</span>
    </div>
  `;

  overlay.innerHTML = `
    <div class="bg-slate-950 rounded-3xl w-full max-w-lg border border-slate-800 shadow-2xl relative flex flex-col animate-fade-in">
      <button onclick="this.closest('#admin-docs-overlay').remove()" class="absolute right-4 top-4 text-slate-500 hover:text-slate-300 p-1">
        <i data-lucide="x" class="w-5 h-5"></i>
      </button>
      <div class="p-6 border-b border-slate-800">
        <h2 class="text-lg font-black text-white flex items-center gap-2">
          <i data-lucide="file-text" class="w-5 h-5 text-[#c5a059]"></i>
          <span>Documents — ${student.full_name}</span>
        </h2>
      </div>
      <div class="p-6 flex flex-col gap-3 max-h-[400px] overflow-y-auto">
        ${docItems}
      </div>
      <div class="p-4 border-t border-slate-800 text-center">
        <button onclick="this.closest('#admin-docs-overlay').remove()" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-all">Close</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

function adminOpenDoc(studentId, docType) {
  const student = state.students.find(s => s.id === studentId);
  if (!student || !student.documents || !student.documents[docType]) return;
  const doc = student.documents[docType];
  const src = doc.publicUrl || doc.dataUrl;
  const isImage = doc.type && doc.type.startsWith('image/');
  const win = window.open('', '_blank');
  if (isImage) {
    win.document.write('<html><head><title>' + doc.name + '</title></head><body style="margin:0;display:flex;align-items:center;justify-content:center;background:#f5f5f5;min-height:100vh;"><img src="' + src + '" style="max-width:90%;max-height:90vh;object-fit:contain;border-radius:8px;box-shadow:0 4px 20px rgba(0,0,0,0.15);"></body></html>');
  } else {
    win.document.write('<html><head><title>' + doc.name + '</title></head><body style="margin:0;display:flex;align-items:center;justify-content:center;background:#f5f5f5;"><embed src="' + src + '" style="width:100%;height:100vh;" type="' + (doc.type || 'application/pdf') + '"></embed></body></html>');
  }
  win.document.close();
}

async function adminUpdateStatus(studentId, newStatus) {
  const student = state.students.find(s => s.id === studentId);
  if (!student) return;
  student.enrollment_status = newStatus;
  saveStateToLocalStorage();
  if (state.supabaseClient) {
    const { error: upsertErr } = await state.supabaseClient.from('admin_students').upsert([student]);
    if (upsertErr) console.error('Failed to sync status update:', upsertErr);
  }
  renderStudentsTable();
  updateAnalyticsDashboard();
}

async function adminSaveRemark(studentId) {
  const input = document.getElementById('remark-input-' + studentId);
  if (!input) return;
  const student = state.students.find(s => s.id === studentId);
  if (!student) return;
  student.admin_remarks = input.value.trim();
  saveStateToLocalStorage();
  if (state.supabaseClient) {
    const { error: upsertErr } = await state.supabaseClient.from('admin_students').upsert([student]);
    if (upsertErr) console.error('Failed to sync remark:', upsertErr);
  }
  renderStudentsTable();
}

// --- ADMIN: RESET STUDENT PASSWORD ---
let adminResetTargetEmail = '';
let adminResetTargetAuthId = '';

function adminResetStudentPassword(studentId, studentEmail) {
  const student = state.students.find(s => s.id === studentId);
  adminResetTargetEmail = studentEmail;
  adminResetTargetAuthId = student ? (student.auth_id || '') : '';
  const modal = document.getElementById('admin-reset-password-modal');
  const emailEl = document.getElementById('reset-password-email');
  const newPassEl = document.getElementById('reset-password-new');
  const errEl = document.getElementById('reset-password-error');
  const sxcEl = document.getElementById('reset-password-success');
  if (emailEl) emailEl.value = studentEmail;
  if (newPassEl) newPassEl.value = '';
  if (errEl) errEl.classList.add('hidden');
  if (sxcEl) sxcEl.classList.add('hidden');
  if (modal) modal.classList.remove('hidden');
}

function closeAdminResetPasswordModal() {
  const modal = document.getElementById('admin-reset-password-modal');
  if (modal) modal.classList.add('hidden');
  adminResetTargetEmail = '';
  adminResetTargetAuthId = '';
}

async function handleAdminResetPassword(e) {
  e.preventDefault();
  const newPass = document.getElementById('reset-password-new').value;
  const confirmPass = document.getElementById('reset-password-confirm').value;
  const errEl = document.getElementById('reset-password-error');
  const sxcEl = document.getElementById('reset-password-success');

  if (!errEl || !sxcEl) return;
  errEl.classList.add('hidden');
  sxcEl.classList.add('hidden');

  if (!newPass || newPass.length < 6) {
    errEl.innerText = 'Password must be at least 6 characters';
    errEl.classList.remove('hidden');
    return;
  }
  if (newPass !== confirmPass) {
    errEl.innerText = 'Passwords do not match';
    errEl.classList.remove('hidden');
    return;
  }

  try {
    const email = adminResetTargetEmail;

    sxcEl.innerText = 'Resetting password...';
    sxcEl.classList.remove('hidden');

    const { data, error } = await state.supabaseClient
      .rpc('admin_reset_student_password', {
        p_email: email,
        p_new_password: newPass
      });

    if (error) {
      sxcEl.classList.add('hidden');
      errEl.innerText = 'Failed: ' + error.message;
      errEl.classList.remove('hidden');
      return;
    }

    if (data === false) {
      sxcEl.classList.add('hidden');
      errEl.innerText = 'Reset failed. Check that the student email exists in auth.users and you have admin access.';
      errEl.classList.remove('hidden');
      return;
    }

    sxcEl.innerText = 'Password reset successfully for ' + email;
    sxcEl.classList.remove('hidden');
    setTimeout(() => closeAdminResetPasswordModal(), 2000);

  } catch (err) {
    sxcEl.classList.add('hidden');
    errEl.innerText = 'Error: ' + err.message;
    errEl.classList.remove('hidden');
  }
}

async function adminSendPasswordResetEmail(studentEmail) {
  if (!state.supabaseClient) return alert('Supabase not configured');
  try {
    const { error } = await state.supabaseClient.auth.resetPasswordForEmail(studentEmail, {
      redirectTo: window.location.origin + '/index.html'
    });
    if (error) {
      alert('Failed to send reset email: ' + error.message);
    } else {
      alert('Password reset email sent to ' + studentEmail);
    }
  } catch (err) {
    alert('Error: ' + err.message);
  }
}

function adminOpenPaymentHistory(studentId) {
  const student = state.students.find(s => s.id === studentId);
  if (!student) return;
  const payments = student.payments || [];
  const totalPaid = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const due = student.fees_amount - totalPaid;

  const overlay = document.createElement('div');
  overlay.id = 'admin-payment-overlay';
  overlay.className = 'fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-start sm:items-center justify-center p-3 sm:p-4 overflow-y-auto';
  overlay.onclick = function(e) { if (e.target === overlay) overlay.remove(); };

  // Each row is an inline editable form so a wrong amount can be corrected.
  var rows = payments.length === 0 ? '<p class="text-slate-500 text-xs text-center py-4">No payments recorded yet.</p>' :
    payments.map(function(p, i) {
      var methods = ['Cash', 'UPI', 'Bank Transfer'];
      var opts = methods.map(function(m) {
        return '<option value="' + m + '"' + ((p.method || 'Cash') === m ? ' selected' : '') + '>' + m + '</option>';
      }).join('');
      var safeNote = String(p.note || '').replace(/"/g, '&quot;');
      return '' +
        '<div class="bg-slate-900 p-3 rounded-xl border border-slate-800 flex flex-col gap-2">' +
          '<div class="flex items-center gap-2">' +
            '<span class="text-[9px] font-bold text-slate-500 uppercase w-10 shrink-0">#' + (i + 1) + '</span>' +
            '<input type="number" id="edit-pay-amount-' + i + '" value="' + (p.amount || 0) + '" class="w-24 px-2 py-1 bg-slate-950 border border-slate-800 rounded-lg text-xs text-emerald-400 font-bold outline-none focus:border-emerald-500">' +
            '<input type="date" id="edit-pay-date-' + i + '" value="' + (p.date || '') + '" class="px-2 py-1 bg-slate-950 border border-slate-800 rounded-lg text-[11px] text-slate-200 outline-none focus:border-emerald-500">' +
            '<select id="edit-pay-method-' + i + '" class="px-2 py-1 bg-slate-950 border border-slate-800 rounded-lg text-[11px] text-slate-200 outline-none">' + opts + '</select>' +
          '</div>' +
          '<div class="flex items-center gap-2">' +
            '<input type="text" id="edit-pay-note-' + i + '" value="' + safeNote + '" placeholder="Note" class="flex-grow px-2 py-1 bg-slate-950 border border-slate-800 rounded-lg text-[11px] text-slate-300 outline-none focus:border-emerald-500">' +
            '<button onclick="adminUpdatePayment(\'' + studentId + '\', ' + i + ')" class="px-3 py-1 bg-[#501537] hover:bg-[#c5a059] text-white text-[10px] font-bold rounded-lg transition-all whitespace-nowrap">Save</button>' +
            '<button onclick="adminDeletePayment(\'' + studentId + '\', ' + i + ')" class="px-3 py-1 bg-slate-950 hover:bg-red-950 text-slate-500 hover:text-red-400 border border-slate-800 hover:border-red-900 text-[10px] font-bold rounded-lg transition-all">Delete</button>' +
          '</div>' +
        '</div>';
    }).join('');

  overlay.innerHTML = `
    <div class="bg-slate-950 rounded-3xl w-full max-w-lg border border-slate-800 shadow-2xl relative flex flex-col animate-fade-in" onclick="event.stopPropagation()">
      <button onclick="document.getElementById('admin-payment-overlay').remove()" class="absolute right-4 top-4 text-slate-500 hover:text-slate-300 p-1">
        <i data-lucide="x" class="w-5 h-5"></i>
      </button>
      <div class="p-6 border-b border-slate-800">
        <h2 class="text-lg font-black text-white flex items-center gap-2">
          <i data-lucide="indian-rupee" class="w-5 h-5 text-emerald-400"></i>
          <span>Payment History — ${student.full_name}</span>
        </h2>
        <p class="text-xs text-slate-400 mt-1">Roll: ${student.roll_number || '—'} | Paid: <strong class="text-emerald-400">₹${totalPaid}</strong> | Pending: <strong class="${due > 0 ? 'text-red-400' : 'text-emerald-400'}">₹${Math.max(0, due)}</strong></p>
        <div class="flex items-center gap-2 mt-3">
          <label class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Fee</label>
          <input type="number" id="edit-total-fee" value="${student.fees_amount}" class="w-28 px-2 py-1 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white outline-none focus:border-[#c5a059]">
          <label class="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-2">Due Date</label>
          <input type="date" id="edit-fee-due-date" value="${student.due_date || ''}" class="px-2 py-1 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white outline-none focus:border-[#c5a059]">
          <button onclick="adminUpdateFeeTerms('${studentId}')" class="px-3 py-1 bg-[#501537] hover:bg-[#c5a059] text-white text-[10px] font-bold rounded-lg transition-all">Update</button>
        </div>
      </div>
      <div class="p-6 flex flex-col gap-3 max-h-[350px] overflow-y-auto">${rows}</div>
      <div class="p-4 border-t border-slate-800 flex flex-wrap gap-2">
        <input type="number" id="payment-amount-input" placeholder="Amount" class="w-24 sm:w-28 px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-emerald-500">
        <input type="date" id="payment-date-input" class="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-emerald-500">
        <select id="payment-method-input" class="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 outline-none">
          <option value="Cash">Cash</option>
          <option value="UPI">UPI</option>
          <option value="Bank Transfer">Bank Transfer</option>
        </select>
        <input type="text" id="payment-note-input" placeholder="Note" class="flex-grow px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-emerald-500">
        <button onclick="adminAddPayment('${studentId}')" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all">Add</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

// Recomputes the paid flag from the payment ledger. Kept in one place so the
// add / edit / delete paths can never disagree with each other.
function recalcStudentFees(student) {
  if (!student.payments) student.payments = [];
  const totalPaid = student.payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  student.fees_paid = totalPaid >= (student.fees_amount || 0);
  return totalPaid;
}

async function persistStudent(student) {
  saveStateToLocalStorage();
  if (state.supabaseClient) {
    const { error: saveErr } = await state.supabaseClient.from('admin_students').upsert([student]);
    if (saveErr) {
      console.error('Failed to sync payment change:', saveErr);
      alert('Saved locally but failed to sync to cloud: ' + (saveErr.message || String(saveErr)));
    }
  }
}

async function adminUpdatePayment(studentId, index) {
  const student = state.students.find(s => s.id === studentId);
  if (!student || !student.payments || !student.payments[index]) return;

  const amountEl = document.getElementById('edit-pay-amount-' + index);
  const amount = parseInt(amountEl ? amountEl.value : '', 10);
  if (!amount || amount <= 0) { alert('Enter a valid amount greater than zero.'); return; }

  const dateEl = document.getElementById('edit-pay-date-' + index);
  const methodEl = document.getElementById('edit-pay-method-' + index);
  const noteEl = document.getElementById('edit-pay-note-' + index);

  student.payments[index] = {
    amount: amount,
    date: (dateEl && dateEl.value) ? dateEl.value : new Date().toISOString().split('T')[0],
    method: methodEl ? methodEl.value : 'Cash',
    note: noteEl ? noteEl.value.trim() : ''
  };

  recalcStudentFees(student);
  await persistStudent(student);
  renderStudentsTable();
  updateAnalyticsDashboard();
  adminOpenPaymentHistory(studentId);
}

async function adminDeletePayment(studentId, index) {
  const student = state.students.find(s => s.id === studentId);
  if (!student || !student.payments || !student.payments[index]) return;

  const entry = student.payments[index];
  if (!confirm('Delete this payment of ₹' + (entry.amount || 0) + '? This cannot be undone.')) return;

  student.payments.splice(index, 1);
  recalcStudentFees(student);
  await persistStudent(student);
  renderStudentsTable();
  updateAnalyticsDashboard();
  adminOpenPaymentHistory(studentId);
}

// Corrects the total course fee and/or the due date.
async function adminUpdateFeeTerms(studentId) {
  const student = state.students.find(s => s.id === studentId);
  if (!student) return;

  const feeEl = document.getElementById('edit-total-fee');
  const dueEl = document.getElementById('edit-fee-due-date');

  const fee = parseInt(feeEl ? feeEl.value : '', 10);
  if (isNaN(fee) || fee < 0) { alert('Enter a valid total fee.'); return; }

  student.fees_amount = fee;
  student.due_date = (dueEl && dueEl.value) ? dueEl.value : null;

  recalcStudentFees(student);
  await persistStudent(student);
  renderStudentsTable();
  updateAnalyticsDashboard();
  adminOpenPaymentHistory(studentId);
}

function adminAddPayment(studentId) {
  const student = state.students.find(s => s.id === studentId);
  if (!student) return;
  const amount = parseInt(document.getElementById('payment-amount-input').value);
  if (!amount || amount <= 0) { alert('Enter a valid amount.'); return; }
  const date = document.getElementById('payment-date-input').value || new Date().toISOString().split('T')[0];
  const method = document.getElementById('payment-method-input').value;
  const note = document.getElementById('payment-note-input').value.trim();
  if (!student.payments) student.payments = [];
  student.payments.push({ amount: amount, date: date, method: method, note: note });
  recalcStudentFees(student);
  persistStudent(student);
  renderStudentsTable();
  updateAnalyticsDashboard();
  adminOpenPaymentHistory(studentId);
}

// ============================================================================
// BACKUP & RESTORE
// Full JSON snapshot of every table. Use before any risky operation and on a
// regular schedule. Restore is additive-by-default so it cannot silently
// destroy records that exist in the cloud but not in the backup file.
// ============================================================================

function buildBackupObject() {
  return {
    kctc_backup_version: 1,
    exported_at: new Date().toISOString(),
    environment: ENV,
    supabase_url: state.supabaseUrl,
    counts: {
      students: state.students.length,
      inquiries: state.inquiries.length,
      certificates: state.certificates.length,
      courses: state.courses.length
    },
    students: state.students,
    inquiries: state.inquiries,
    certificates: state.certificates,
    courses: state.courses
  };
}

// ============================================================================
// GOOGLE DRIVE SYNC
//
// SECURITY NOTE — why this is admin-triggered and not automatic:
// This site is static, with no backend. Uploading to Drive automatically the
// moment a student picks a file would require credentials that every anonymous
// visitor could read from script.js. A service-account key in client-side code
// would hand anyone full control of the Drive.
//
// Instead the ADMIN connects their own Google account. The token lives only in
// this browser tab's memory, expires in ~1 hour, and uses the 'drive.file'
// scope, which grants access ONLY to files this app itself creates — it cannot
// read or touch anything else in the Drive.
//
// The OAuth Client ID is public by design; it is not a secret.
// Folder layout:  KCTC Student Documents / <Course> / <Student Name> / <file>
// ============================================================================

const DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.file';
const DRIVE_ROOT_FOLDER = 'KCTC Student Documents';

let driveTokenClient = null;
let driveAccessToken = null;
const driveFolderCache = {};

function getDriveClientId() {
  return localStorage.getItem('KCTC_DRIVE_CLIENT_ID') || '';
}

function saveDriveClientId() {
  const el = document.getElementById('drive-client-id');
  const id = el ? el.value.trim() : '';
  if (!id) { alert('Enter your Google OAuth Client ID first.'); return; }
  localStorage.setItem('KCTC_DRIVE_CLIENT_ID', id);
  driveTokenClient = null;
  updateDriveStatus('Client ID saved. Now click "Connect Google Drive".', 'ok');
}

function updateDriveStatus(text, kind) {
  const el = document.getElementById('drive-status');
  if (!el) return;
  const colour = kind === 'ok' ? 'text-emerald-400'
               : kind === 'warn' ? 'text-amber-400'
               : kind === 'err' ? 'text-red-400'
               : 'text-slate-400';
  el.className = 'text-[11px] font-bold mt-2 ' + colour;
  el.innerText = text;
}

// Opens Google's consent screen and stores the token in memory only.
function connectGoogleDrive() {
  const clientId = getDriveClientId();
  if (!clientId) { alert('Save your Google OAuth Client ID first.'); return; }

  if (typeof google === 'undefined' || !google.accounts || !google.accounts.oauth2) {
    updateDriveStatus('Google sign-in library did not load. Check your internet connection.', 'err');
    return;
  }

  if (!driveTokenClient) {
    driveTokenClient = google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: DRIVE_SCOPE,
      callback: function (resp) {
        if (resp && resp.access_token) {
          driveAccessToken = resp.access_token;
          updateDriveStatus('Connected to Google Drive. Token valid for about 1 hour.', 'ok');
        } else {
          updateDriveStatus('Could not obtain access token.', 'err');
        }
      },
      error_callback: function (err) {
        updateDriveStatus('Google sign-in failed: ' + (err && err.type ? err.type : 'unknown'), 'err');
      }
    });
  }
  driveTokenClient.requestAccessToken({ prompt: '' });
}

function driveHeaders() {
  return { Authorization: 'Bearer ' + driveAccessToken };
}

// Finds a folder by name under a parent, creating it if absent.
async function driveFindOrCreateFolder(name, parentId) {
  const cacheKey = (parentId || 'root') + '/' + name;
  if (driveFolderCache[cacheKey]) return driveFolderCache[cacheKey];

  const safeName = String(name).replace(/'/g, "\\'");
  let q = "mimeType='application/vnd.google-apps.folder' and trashed=false and name='" + safeName + "'";
  q += parentId ? " and '" + parentId + "' in parents" : " and 'root' in parents";

  const listUrl = 'https://www.googleapis.com/drive/v3/files?q=' +
                  encodeURIComponent(q) + '&fields=files(id,name)&pageSize=1';

  const listRes = await fetch(listUrl, { headers: driveHeaders() });
  if (!listRes.ok) throw new Error('Drive list failed (' + listRes.status + ')');
  const listData = await listRes.json();

  if (listData.files && listData.files.length > 0) {
    driveFolderCache[cacheKey] = listData.files[0].id;
    return listData.files[0].id;
  }

  const metadata = {
    name: name,
    mimeType: 'application/vnd.google-apps.folder',
    parents: parentId ? [parentId] : undefined
  };
  const createRes = await fetch('https://www.googleapis.com/drive/v3/files?fields=id', {
    method: 'POST',
    headers: Object.assign({ 'Content-Type': 'application/json' }, driveHeaders()),
    body: JSON.stringify(metadata)
  });
  if (!createRes.ok) throw new Error('Drive folder create failed (' + createRes.status + ')');
  const created = await createRes.json();
  driveFolderCache[cacheKey] = created.id;
  return created.id;
}

// Multipart upload of a Blob into a given folder.
async function driveUploadBlob(blob, fileName, folderId) {
  const boundary = '-------kctc' + Date.now();
  const metadata = { name: fileName, parents: [folderId] };

  const body = new Blob([
    '--' + boundary + '\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n',
    JSON.stringify(metadata),
    '\r\n--' + boundary + '\r\nContent-Type: ' + (blob.type || 'application/octet-stream') + '\r\n\r\n',
    blob,
    '\r\n--' + boundary + '--'
  ]);

  const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name', {
    method: 'POST',
    headers: Object.assign({ 'Content-Type': 'multipart/related; boundary=' + boundary }, driveHeaders()),
    body: body
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error('Upload failed (' + res.status + '): ' + txt.slice(0, 120));
  }
  return res.json();
}

// Turns a stored document record into a Blob, whether it lives in Supabase
// Storage (publicUrl) or inline as base64 (dataUrl).
async function documentToBlob(doc) {
  if (doc.publicUrl) {
    const res = await fetch(doc.publicUrl);
    if (!res.ok) throw new Error('Could not fetch from storage (' + res.status + ')');
    return res.blob();
  }
  if (doc.dataUrl) {
    const res = await fetch(doc.dataUrl);
    return res.blob();
  }
  throw new Error('No file content available');
}

// Builds Course / Student / file and uploads every document.
async function syncDocumentsToDrive() {
  if (!driveAccessToken) { alert('Connect Google Drive first.'); return; }

  const docs = collectStudentDocuments().filter(d => d.url || d.inlineOnly);
  if (docs.length === 0) { alert('No documents to sync.'); return; }

  if (!confirm('Upload ' + docs.length + ' document(s) to Google Drive?\n\n' +
               'Folder structure:\n' + DRIVE_ROOT_FOLDER + ' / Course / Student Name / file')) return;

  updateDriveStatus('Starting sync...', 'warn');

  let ok = 0, failed = 0;
  const errors = [];

  try {
    const rootId = await driveFindOrCreateFolder(DRIVE_ROOT_FOLDER, null);

    for (let i = 0; i < docs.length; i++) {
      const d = docs[i];
      updateDriveStatus('Uploading ' + (i + 1) + ' of ' + docs.length + ': ' + d.student + ' / ' + d.type, 'warn');

      try {
        const student = state.students.find(s => s.full_name === d.student && (s.roll_number || '') === d.roll);
        const course = (student && student.enrolled_course) ? student.enrolled_course : 'Unassigned Course';
        const studentFolderName = d.roll ? (d.student + ' (' + d.roll + ')') : d.student;

        const courseId = await driveFindOrCreateFolder(course, rootId);
        const studentId = await driveFindOrCreateFolder(studentFolderName, courseId);

        const raw = (student && student.documents) ? student.documents[d.type] : null;
        if (!raw) throw new Error('Document record missing');

        const blob = await documentToBlob(raw);
        const ext = (d.name.split('.').pop() || 'bin').toLowerCase();
        const fileName = d.type + '.' + ext;

        await driveUploadBlob(blob, fileName, studentId);
        ok++;
      } catch (err) {
        failed++;
        errors.push(d.student + ' / ' + d.type + ': ' + (err.message || err));
      }
    }
  } catch (err) {
    updateDriveStatus('Sync aborted: ' + (err.message || err), 'err');
    alert('Sync aborted: ' + (err.message || err));
    return;
  }

  updateDriveStatus('Sync finished — ' + ok + ' uploaded, ' + failed + ' failed.', failed ? 'warn' : 'ok');
  alert('Google Drive sync complete.\n\nUploaded: ' + ok + '\nFailed: ' + failed +
        (errors.length ? '\n\nFirst errors:\n' + errors.slice(0, 5).join('\n') : ''));
}

// ----------------------------------------------------------------------------
// DOCUMENT AUDIT + DOWNLOAD
// Uploaded files live in Supabase Storage; the JSON backup only stores their
// URLs. If the project is deleted those URLs die, so the actual files must be
// pulled down separately. This lists them and downloads them one by one.
// ----------------------------------------------------------------------------
function collectStudentDocuments() {
  const out = [];
  state.students.forEach(s => {
    const docs = s.documents || {};
    Object.keys(docs).forEach(type => {
      if (type === 'selfDeclaration') return;
      const d = docs[type];
      if (!d) return;
      out.push({
        student: s.full_name,
        roll: s.roll_number || '',
        type: type,
        name: d.name || (type + '.file'),
        url: d.publicUrl || '',
        inlineOnly: !d.publicUrl && !!d.dataUrl,
        path: d.path || ''
      });
    });
  });
  return out;
}

function auditStudentDocuments() {
  const docs = collectStudentDocuments();
  const box = document.getElementById('docs-audit-result');
  if (!box) return;

  if (docs.length === 0) {
    box.classList.remove('hidden');
    box.innerHTML = '<span class="text-slate-400 text-[11px]">No uploaded documents found.</span>';
    return;
  }

  const cloud = docs.filter(d => d.url).length;
  const inline = docs.filter(d => d.inlineOnly).length;

  box.classList.remove('hidden');
  box.innerHTML =
    '<div class="text-[11px] leading-relaxed">' +
    '<strong class="text-[#c5a059]">' + docs.length + ' document(s) found</strong><br>' +
    '<span class="text-amber-400">' + cloud + '</span> stored in Supabase Storage — <strong>NOT inside the JSON backup</strong><br>' +
    '<span class="text-emerald-400">' + inline + '</span> stored inline (base64) — these ARE inside the JSON backup<br><br>' +
    (cloud > 0
      ? '<span class="text-amber-400">The ' + cloud + ' cloud file(s) must be downloaded separately. ' +
        'If this Supabase project is deleted, those links stop working permanently.</span>'
      : '<span class="text-emerald-400">All documents are inside your JSON backup.</span>') +
    '</div>';
}

// Downloads a CSV manifest of every document plus its URL.
function exportDocumentManifest() {
  const docs = collectStudentDocuments();
  if (docs.length === 0) { alert('No documents to export.'); return; }
  const headers = ['Student', 'Roll Number', 'Doc Type', 'File Name', 'Storage Path', 'Public URL', 'Inline Only'];
  const rows = docs.map(d => [d.student, d.roll, d.type, d.name, d.path, d.url, d.inlineOnly ? 'YES' : 'no']);
  downloadCSV('KCTC_DOCUMENT_MANIFEST_' + new Date().toISOString().split('T')[0] + '.csv', headers, rows);
}

// Opens each cloud-stored document so the browser saves it locally.
async function downloadAllDocuments() {
  const docs = collectStudentDocuments().filter(d => d.url);
  if (docs.length === 0) { alert('No cloud-stored documents to download.'); return; }
  if (!confirm('Download ' + docs.length + ' file(s)?\n\nYour browser may ask permission to download multiple files. Allow it.')) return;

  let ok = 0;
  for (const d of docs) {
    try {
      const res = await fetch(d.url);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const blob = await res.blob();
      const safe = (d.roll || d.student).replace(/[^a-z0-9\-_]/gi, '_');
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = safe + '__' + d.type + '__' + d.name;
      link.click();
      URL.revokeObjectURL(link.href);
      ok++;
      await new Promise(r => setTimeout(r, 400));
    } catch (err) {
      console.error('Failed to download ' + d.name + ':', err);
    }
  }
  alert('Downloaded ' + ok + ' of ' + docs.length + ' file(s).' +
        (ok < docs.length ? '\n\nSome failed — check the browser console.' : ''));
}

function downloadFullBackup(reason) {
  const backup = buildBackupObject();
  const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const tag = reason ? '_' + reason : '';
  const name = 'KCTC_BACKUP_' + ENV.toUpperCase() + tag + '_' + stamp + '.json';

  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = name;
  link.click();
  URL.revokeObjectURL(link.href);

  try {
    localStorage.setItem('KCTC_LAST_BACKUP_AT', backup.exported_at);
  } catch (e) { /* storage full — not fatal */ }

  updateBackupStatusLabel();
  return name;
}

function updateBackupStatusLabel() {
  const el = document.getElementById('backup-status-label');
  if (!el) return;
  const last = localStorage.getItem('KCTC_LAST_BACKUP_AT');
  if (!last) {
    el.innerText = 'No backup taken from this browser yet.';
    el.className = 'text-[11px] font-bold text-amber-400 mt-1.5';
    return;
  }
  const when = new Date(last);
  const days = Math.floor((Date.now() - when.getTime()) / 86400000);
  el.innerText = 'Last backup: ' + when.toLocaleString('en-IN') + (days > 0 ? '  (' + days + ' day(s) ago)' : '  (today)');
  el.className = days >= 7
    ? 'text-[11px] font-bold text-amber-400 mt-1.5'
    : 'text-[11px] font-bold text-emerald-400 mt-1.5';
}

// Reads a backup file and reports what it contains, without changing anything.
function handleBackupFileSelected(input) {
  const file = input.files && input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function (ev) {
    try {
      const data = JSON.parse(ev.target.result);
      if (!data || !Array.isArray(data.students)) throw new Error('Not a KCTC backup file.');
      state.pendingRestore = data;

      const info = document.getElementById('restore-preview');
      if (info) {
        info.classList.remove('hidden');
        info.innerHTML =
          '<div class="text-[11px] leading-relaxed">' +
          '<strong class="text-[#c5a059]">' + file.name + '</strong><br>' +
          'Taken: ' + new Date(data.exported_at).toLocaleString('en-IN') + '<br>' +
          'From: <strong>' + (data.environment || 'unknown').toUpperCase() + '</strong> — ' + (data.supabase_url || 'n/a') + '<br><br>' +
          'Students: <strong>' + data.students.length + '</strong> &nbsp; ' +
          'Inquiries: <strong>' + (data.inquiries || []).length + '</strong><br>' +
          'Certificates: <strong>' + (data.certificates || []).length + '</strong> &nbsp; ' +
          'Courses: <strong>' + (data.courses || []).length + '</strong>' +
          ((data.environment && data.environment !== ENV)
            ? '<br><br><span class="text-amber-400">Warning: this backup came from the ' +
              String(data.environment).toUpperCase() + ' database but you are connected to ' +
              ENV.toUpperCase() + '.</span>'
            : '') +
          '</div>';
      }
    } catch (err) {
      alert('Could not read that file: ' + err.message);
      state.pendingRestore = null;
    }
  };
  reader.readAsText(file);
}

// Restores a backup. Only ADDS records whose id is missing from the cloud.
// Existing rows are left untouched, so this can never overwrite newer data.
async function restoreFromBackup() {
  const data = state.pendingRestore;
  if (!data) { alert('Choose a backup file first.'); return; }

  if (!state.supabaseClient) { alert('No database connection — cannot restore.'); return; }

  if (!confirm('Restore missing records from this backup into the ' + ENV.toUpperCase() + ' database?\n\n' +
               'Records that already exist will NOT be modified. Only rows missing from the database will be added.')) return;

  // Safety snapshot of the CURRENT state before touching anything.
  downloadFullBackup('before-restore');

  const tables = [
    { name: 'admin_students', rows: data.students || [], key: 'students' },
    { name: 'inquiries', rows: data.inquiries || [], key: 'inquiries' },
    { name: 'certificates', rows: data.certificates || [], key: 'certificates' },
    { name: 'courses', rows: data.courses || [], key: 'courses' }
  ];

  const summary = [];
  for (const t of tables) {
    if (t.rows.length === 0) { summary.push(t.name + ': nothing in backup'); continue; }
    try {
      const { data: existing, error: readErr } = await state.supabaseClient.from(t.name).select('id');
      if (readErr) { summary.push(t.name + ': READ FAILED — ' + readErr.message); continue; }

      const have = new Set((existing || []).map(r => r.id));
      const toAdd = t.rows.filter(r => r && r.id && !have.has(r.id));

      if (toAdd.length === 0) { summary.push(t.name + ': already up to date'); continue; }

      const { error: insErr } = await state.supabaseClient.from(t.name).insert(toAdd);
      summary.push(insErr
        ? t.name + ': FAILED — ' + insErr.message
        : t.name + ': restored ' + toAdd.length + ' record(s)');
    } catch (err) {
      summary.push(t.name + ': ERROR — ' + (err.message || String(err)));
    }
  }

  await syncWithRemoteDatabase();
  renderStudentsTable();
  renderInquiriesTable();
  renderCertificatesLedger();
  renderCoursesTable();
  updateAnalyticsDashboard();

  alert('Restore finished:\n\n' + summary.join('\n'));
}

function downloadCSV(filename, headers, rows) {
  var csv = headers.join(',') + '\n';
  rows.forEach(function(row) {
    var escaped = row.map(function(cell) {
      var str = String(cell != null ? cell : '');
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return '"' + str.replace(/"/g, '""') + '"';
      }
      return str;
    });
    csv += escaped.join(',') + '\n';
  });
  var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  var link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

function exportStudentsCSV() {
  var headers = ['S.No', 'Roll Number', 'Full Name', 'Father Name', 'Phone', 'Email', 'Course', 'Fees Amount', 'Fees Paid', 'Due Date', 'Total Paid', 'Enrollment Status', 'Created At'];
  var rows = state.students.map(function(s, idx) {
    var totalPaid = (s.payments || []).reduce(function(sum, p) { return sum + (p.amount || 0); }, 0);
    return [
      idx + 1, s.roll_number || '', s.full_name, s.father_name, s.phone, s.email,
      s.enrolled_course, s.fees_amount, s.fees_paid ? 'Yes' : 'No',
      s.due_date || '', totalPaid, s.enrollment_status, s.created_at
    ];
  });
  downloadCSV('KCTC_Students_' + new Date().toISOString().split('T')[0] + '.csv', headers, rows);
}

function exportCertificatesCSV() {
  var headers = ['Student Name', 'Father Name', 'Roll Number', 'Course', 'Grade', 'From (MM/YYYY)', 'To (MM/YYYY)', 'Passing Year', 'Verification Code', 'Created At'];
  var rows = state.certificates.map(function(c) {
    return [c.student_name, c.father_name || '', c.roll_number, c.course_name, c.grade,
            formatMonthYear(c.from_month), formatMonthYear(c.to_month),
            c.passing_year, c.verification_code, c.created_at];
  });
  downloadCSV('KCTC_Certificates_' + new Date().toISOString().split('T')[0] + '.csv', headers, rows);
}

function exportAnalyticsCSV() {
  var headers = ['Metric', 'Value'];
  var total = state.students.length;
  var active = state.students.filter(function(s) { return s.enrollment_status === 'accepted'; }).length;
  var revenue = state.students.reduce(function(acc, s) { return acc + (s.fees_paid ? s.fees_amount : 0); }, 0);
  var unpaidCount = state.students.filter(function(s) { return !s.fees_paid; }).length;
  var totalPaidAll = state.students.reduce(function(acc, s) { return acc + (s.payments || []).reduce(function(s2, p) { return s2 + (p.amount || 0); }, 0); }, 0);
  var rows = [
    ['Total Enrolled', total],
    ['Active Accounts', active],
    ['Tailor Fees Paid', '₹' + revenue],
    ['Total Collected (all payments)', '₹' + totalPaidAll],
    ['Pending Fees Count', unpaidCount],
    ['Pending Fees Value', '₹' + state.students.filter(function(s) { return !s.fees_paid; }).reduce(function(acc, s) { return acc + (s.fees_amount || 0) - ((s.payments || []).reduce(function(s2, p) { return s2 + (p.amount || 0); }, 0)); }, 0)]
  ];
  downloadCSV('KCTC_Analytics_' + new Date().toISOString().split('T')[0] + '.csv', headers, rows);
}

// --- ADD/EDIT STUDENTS FORM WORK ---
function openAddStudentModal() {
  document.getElementById('add-student-modal').classList.remove('hidden');
  // Set default values
  document.getElementById('add-student-name').value = '';
  document.getElementById('add-student-father').value = '';
  document.getElementById('add-student-dob').value = '';
  document.getElementById('add-student-qualification').value = '';
  document.getElementById('add-student-residence').value = '';
  document.getElementById('add-student-phone').value = '';
  document.getElementById('add-student-email').value = '';
  document.getElementById('add-student-password').value = '';
  document.getElementById('add-student-fees').value = 4500;
  document.getElementById('add-student-paid').checked = false;
  document.getElementById('add-student-status').value = 'accepted';
}

function closeAddStudentModal() {
  document.getElementById('add-student-modal').classList.add('hidden');
  document.getElementById('add-student-modal').removeAttribute('data-convert-inq-id');
}

async function handleAdminAddStudentSubmit(e) {
  e.preventDefault();
  const name = document.getElementById('add-student-name').value.trim();
  const father = document.getElementById('add-student-father').value.trim();
  const dob = document.getElementById('add-student-dob').value;
  const gender = document.getElementById('add-student-gender').value;
  const qual = document.getElementById('add-student-qualification').value.trim();
  const residence = document.getElementById('add-student-residence').value.trim();
  const phone = document.getElementById('add-student-phone').value.trim();
  const email = document.getElementById('add-student-email').value.trim().toLowerCase();
  const password = document.getElementById('add-student-password').value.trim() || 'password123';
  const fees = parseInt(document.getElementById('add-student-fees').value) || 4500;
  const status = document.getElementById('add-student-status').value;
  const paid = document.getElementById('add-student-paid').checked;

  if (state.students.some(s => s.email.toLowerCase() === email)) {
    alert("This email is already registered inside KCTC!");
    return;
  }

  const newStd = {
    id: generateUUID(),
    roll_number: await reserveRollNumber(),
    full_name: name,
    father_name: father,
    dob: dob || null,
    gender: gender,
    qualification: qual || null,
    residence: residence,
    phone: phone,
    email: email,
    password: password,
    enrolled_course: document.getElementById('add-student-course').value,
    fees_paid: paid,
    fees_amount: fees,
    due_date: document.getElementById('add-student-due-date').value || null,
    payments: [],
    email_verified: false,
    enrollment_status: status,
    documents: {},
    admin_remarks: '',
    created_at: new Date().toISOString()
  };

  state.students.push(newStd);
  sortStudentsByRoll();

  // If this was converted from an inquiry, mark the inquiry as enrolled
  const convertInqId = document.getElementById('add-student-modal').getAttribute('data-convert-inq-id');
  if (convertInqId) {
    const inq = state.inquiries.find(i => i.id === convertInqId);
    if (inq) {
      inq.status = 'enrolled';
      if (state.supabaseClient) {
        await state.supabaseClient.from('inquiries').update({ status: 'enrolled' }).eq('id', convertInqId);
      }
    }
  }

  saveStateToLocalStorage();

  // Push to Supabase if active
  if (state.supabaseClient) {
    const { error: insertErr } = await state.supabaseClient.from('admin_students').insert([newStd]);
    if (insertErr) {
      console.error(insertErr);
      alert("Student saved locally but failed to sync to Supabase: " + (insertErr.message || String(insertErr)));
    }
  } else {
    alert("Student saved locally. No Supabase connection — data won't appear in cloud database until you configure credentials in Supabase Config tab.");
  }

  closeAddStudentModal();
  renderStudentsTable();
  if (convertInqId) {
    setAdminTab('inquiries');
  }
}

function openEditStudentModal(id) {
  const s = state.students.find(student => student.id === id);
  if (!s) return;

  document.getElementById('edit-student-id').value = s.id;
  document.getElementById('edit-student-name').value = s.full_name;
  document.getElementById('edit-student-father').value = s.father_name;
  document.getElementById('edit-student-dob').value = s.dob || '';
  document.getElementById('edit-student-gender').value = s.gender || 'Female';
  document.getElementById('edit-student-qualification').value = s.qualification || '';
  document.getElementById('edit-student-residence').value = s.residence;
  document.getElementById('edit-student-phone').value = s.phone;
  document.getElementById('edit-student-email').value = s.email;
  document.getElementById('edit-student-password').value = s.password || 'password123';
  document.getElementById('edit-student-course').value = s.enrolled_course;
  document.getElementById('edit-student-fees').value = s.fees_amount;
  document.getElementById('edit-student-status').value = s.enrollment_status || 'accepted';
  document.getElementById('edit-student-paid').checked = s.fees_paid;
  document.getElementById('edit-student-due-date').value = s.due_date || '';

  document.getElementById('edit-student-modal').classList.remove('hidden');
}

function closeEditStudentModal() {
  document.getElementById('edit-student-modal').classList.add('hidden');
}

async function handleAdminEditStudentSubmit(e) {
  e.preventDefault();
  const id = document.getElementById('edit-student-id').value;
  const studentIndex = state.students.findIndex(s => s.id === id);

  if (studentIndex === -1) return;

  const updatedStd = {
    ...state.students[studentIndex],
    full_name: document.getElementById('edit-student-name').value.trim(),
    father_name: document.getElementById('edit-student-father').value.trim(),
    dob: document.getElementById('edit-student-dob').value || null,
    gender: document.getElementById('edit-student-gender').value,
    qualification: document.getElementById('edit-student-qualification').value.trim() || null,
    residence: document.getElementById('edit-student-residence').value.trim(),
    phone: document.getElementById('edit-student-phone').value.trim(),
    email: document.getElementById('edit-student-email').value.trim().toLowerCase(),
    password: document.getElementById('edit-student-password').value.trim() || 'password123',
    enrolled_course: document.getElementById('edit-student-course').value,
    fees_paid: document.getElementById('edit-student-paid').checked,
    fees_amount: parseInt(document.getElementById('edit-student-fees').value) || 4500,
    due_date: document.getElementById('edit-student-due-date').value || null,
    enrollment_status: document.getElementById('edit-student-status').value,
    created_at: new Date().toISOString()
  };

  state.students[studentIndex] = updatedStd;
  saveStateToLocalStorage();

  // Update Supabase remote if active
  if (state.supabaseClient) {
    const { error: upsertErr } = await state.supabaseClient.from('admin_students').upsert([updatedStd]);
    if (upsertErr) {
      console.error(upsertErr);
      alert("Student updated locally but failed to sync to Supabase: " + (upsertErr.message || String(upsertErr)));
    }
  } else {
    alert("Student updated locally. No Supabase connection — data won't appear in cloud database until you configure credentials in Supabase Config tab.");
  }

  closeEditStudentModal();
  renderStudentsTable();
}

async function handleAdminDeleteStudent(id) {
  if (confirm("Are you sure you want to permanently delete this student enrollment from academy registry?")) {
    state.students = state.students.filter(s => s.id !== id);
    saveStateToLocalStorage();
    if (state.supabaseClient) {
      const { error: deleteErr } = await state.supabaseClient.from('admin_students').delete().eq('id', id);
      if (deleteErr) console.error('Failed to delete from remote:', deleteErr);
    }
    renderStudentsTable();
  }
}

// --- CERTIFICATIONS ISSUE ENGINE ---
function renderCertificatesLedger() {
  const container = document.getElementById('issued-certificates-container');
  if (!container) return;
  container.innerHTML = '';

  const searchEl = document.getElementById('cert-filter-search');
  const search = searchEl ? searchEl.value.trim().toLowerCase() : '';

  const filtered = state.certificates.filter(c => {
    return c.student_name.toLowerCase().includes(search) || c.roll_number.toLowerCase().includes(search) || c.verification_code.toLowerCase().includes(search);
  });

  const countLabel = document.getElementById('certificates-count-label');
  if (countLabel) {
    countLabel.innerText = filtered.length === state.certificates.length
      ? 'Showing all ' + state.certificates.length + ' certificate(s)'
      : 'Showing ' + filtered.length + ' of ' + state.certificates.length + ' certificate(s)';
  }

  // Set randomized code for next issues. This must run before the empty-state
  // return, otherwise the very first certificate would have a blank code.
  const codes = "KCTC-" + Math.floor(10000 + Math.random() * 90000).toString(16).toUpperCase();
  const inputCode = document.getElementById('cert-verify-code');
  if (inputCode && !inputCode.value) inputCode.value = codes;

  if (filtered.length === 0) {
    container.innerHTML = `<p class="p-8 text-center text-slate-500 font-bold text-xs">No issued designer certificates match criteria.</p>`;
    return;
  }

  filtered.forEach((c, idx) => {
    const card = document.createElement('div');
    card.className = "bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between";
    card.innerHTML = `
      <div class="flex items-start gap-3">
        <span class="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-slate-950 border border-slate-800 text-[10px] font-black text-[#c5a059] shrink-0 mt-0.5">${idx + 1}</span>
        <div>
        <h4 class="font-serif font-bold text-white text-sm">${c.student_name}</h4>
        <p class="text-[10px] text-slate-500 mt-0.5 font-bold">Roll: ${c.roll_number} | ${(c.from_month && c.to_month) ? formatMonthYear(c.from_month) + ' &ndash; ' + formatMonthYear(c.to_month) : 'Year: ' + c.passing_year} | Grade: ${c.grade}</p>
        <span class="text-[10px] text-[#c5a059] font-mono block mt-1">Verification PIN: ${c.verification_code}</span>
        </div>
      </div>
      <div class="flex gap-2 shrink-0">
        <button onclick="previewCertificateInline('${c.roll_number}')" class="p-1.5 bg-slate-950 text-slate-300 hover:text-white rounded-lg border border-slate-800 flex items-center gap-1.5 text-[10px] font-bold" title="Open digital credential">
          <i data-lucide="eye" class="w-3.5 h-3.5"></i>
          <span>Verify View</span>
        </button>
        <button onclick="handleAdminRevokeCertificate('${c.id}')" class="p-1.5 bg-slate-950 text-slate-500 hover:text-red-400 rounded-lg border border-slate-800 hover:border-red-900" title="Revoke Certificate">
          <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
        </button>
      </div>
    `;
    card.style.animationDelay = (idx * 45) + 'ms';
    container.appendChild(card);
  });
  if (typeof lucide !== 'undefined') { lucide.createIcons(); }
}

function previewCertificateInline(rollNumber) {
  const cert = state.certificates.find(c => c.roll_number === rollNumber);
  if (cert) {
    populateCertificateViewer(cert);
    document.getElementById('certificate-viewer-modal').classList.remove('hidden');
  }
}

async function handleIssueCertificate(e) {
  e.preventDefault();
  const name = document.getElementById('cert-student-name').value.trim();
  const father = document.getElementById('cert-father-name').value.trim();
  const roll = document.getElementById('cert-roll-number').value.trim();
  const code = document.getElementById('cert-verify-code').value.trim();
  const course = document.getElementById('cert-course-name').value;
  const grade = document.getElementById('cert-grade').value;

  const fromMonth = document.getElementById('cert-from-month').value;
  const toMonth = document.getElementById('cert-to-month').value;

  if (!fromMonth || !toMonth) {
    alert('Please select both the "From" and "To" months for the course duration.');
    return;
  }
  if (fromMonth > toMonth) {
    alert('The "From" month cannot be later than the "To" month.');
    return;
  }

  // Passing year is derived from the end of the course.
  const year = parseInt(toMonth.split('-')[0], 10) || new Date().getFullYear();

  if (state.certificates.some(c => c.roll_number.toLowerCase() === roll.toLowerCase())) {
    alert("Roll number already has a certificate assigned!");
    return;
  }

  const newCert = {
    id: generateUUID(),
    student_name: name,
    father_name: father,
    roll_number: roll,
    course_name: course,
    passing_year: year,
    from_month: fromMonth,
    to_month: toMonth,
    grade: grade,
    verification_code: code,
    created_at: new Date().toISOString()
  };

  state.certificates.push(newCert);
  saveStateToLocalStorage();

  // Push to Supabase
  if (state.supabaseClient) {
    try {
      await state.supabaseClient.from('certificates').insert([newCert]);
    } catch (err) {
      console.error(err);
    }
  }

  // Reset inputs
  document.getElementById('cert-student-name').value = '';
  document.getElementById('cert-father-name').value = '';
  document.getElementById('cert-roll-number').value = '';
  document.getElementById('cert-from-month').value = '';
  document.getElementById('cert-to-month').value = '';

  renderCertificatesLedger();
  alert(`Certificate issued successfully to ${name}! Verified under unique PIN "${code}". (UDYAM: ${UDYAM_NUMBER})`);
}

async function handleAdminRevokeCertificate(id) {
  if (confirm("Are you sure you want to permanently revoke this diploma certificate from verified online archives?")) {
    state.certificates = state.certificates.filter(c => c.id !== id);
    saveStateToLocalStorage();
    if (state.supabaseClient) {
      await state.supabaseClient.from('certificates').delete().eq('id', id);
    }
    renderCertificatesLedger();
  }
}

// --- COURSES MANAGER (ADMIN CRUD) ---
function renderCoursesTable() {
  const tbody = document.getElementById('admin-courses-tbody');
  if (!tbody) return;
  tbody.innerHTML = '';

  const searchEl = document.getElementById('courses-filter-search');
  const search = searchEl ? searchEl.value.trim().toLowerCase() : '';

  const filtered = state.courses.filter(c => c.name.toLowerCase().includes(search) || c.description.toLowerCase().includes(search));

  const countLabel = document.getElementById('courses-count-label');
  if (countLabel) {
    countLabel.innerText = filtered.length === state.courses.length
      ? 'Showing all ' + state.courses.length + ' course(s)'
      : 'Showing ' + filtered.length + ' of ' + state.courses.length + ' course(s)';
  }

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="p-8 text-center text-slate-500 font-bold">No courses found. Add one to get started.</td></tr>`;
    return;
  }

  filtered.forEach((c, idx) => {
    const tr = document.createElement('tr');
    tr.className = "border-b border-slate-800 hover:bg-slate-950/40 transition-all";
    tr.innerHTML = `
      <td class="p-3.5 text-center align-top">
        <span class="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-slate-900 border border-slate-800 text-[10px] font-black text-[#c5a059]">${idx + 1}</span>
      </td>
      <td class="p-3.5 text-2xl text-center">${c.icon || '📐'}</td>
      <td class="p-3.5"><strong class="text-white font-serif text-sm">${c.name}</strong></td>
      <td class="p-3.5 text-slate-400 font-semibold">${c.duration}</td>
      <td class="p-3.5"><span class="px-2.5 py-0.5 rounded-full text-[9px] font-bold tracking-wider bg-[#c5a059]/10 text-[#c5a059] border border-[#c5a059]/20">${c.level}</span></td>
      <td class="p-3.5 text-slate-400 max-w-[220px] truncate">${c.description}</td>
      <td class="p-3.5 text-right flex justify-end gap-2 mt-2.5">
        <button onclick="openEditCourseModal('${c.id}')" class="p-1.5 bg-slate-900 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-all border border-slate-800" title="Edit course">
          <i data-lucide="edit-3" class="w-4 h-4"></i>
        </button>
        <button onclick="handleAdminDeleteCourse('${c.id}')" class="p-1.5 bg-slate-900 hover:bg-red-950 rounded-lg text-slate-500 hover:text-red-400 transition-all border border-slate-800 hover:border-red-900" title="Delete course">
          <i data-lucide="trash-2" class="w-4 h-4"></i>
        </button>
      </td>
    `;
    tr.style.animationDelay = (idx * 35) + 'ms';
    tbody.appendChild(tr);
  });
  if (typeof lucide !== 'undefined') { lucide.createIcons(); }
}

function openAddCourseModal() {
  document.getElementById('course-modal-title').innerText = 'Add New Course';
  document.getElementById('course-form-submit').innerText = 'Save Course';
  document.getElementById('course-form-id').value = '';
  document.getElementById('course-name').value = '';
  document.getElementById('course-duration').value = '';
  document.getElementById('course-level').value = 'Beginner';
  document.getElementById('course-icon').value = '📐';
  document.getElementById('course-description').value = '';
  document.getElementById('course-modal').classList.remove('hidden');
}

function openEditCourseModal(id) {
  const c = state.courses.find(course => course.id === id);
  if (!c) return;
  document.getElementById('course-modal-title').innerText = 'Edit Course';
  document.getElementById('course-form-submit').innerText = 'Update Course';
  document.getElementById('course-form-id').value = c.id;
  document.getElementById('course-name').value = c.name;
  document.getElementById('course-duration').value = c.duration;
  document.getElementById('course-level').value = c.level;
  document.getElementById('course-icon').value = c.icon || '📐';
  document.getElementById('course-description').value = c.description;
  document.getElementById('course-modal').classList.remove('hidden');
}

function closeCourseModal() {
  document.getElementById('course-modal').classList.add('hidden');
}

async function handleCourseFormSubmit(e) {
  e.preventDefault();
  const id = document.getElementById('course-form-id').value;
  const name = document.getElementById('course-name').value.trim();
  const duration = document.getElementById('course-duration').value.trim();
  const level = document.getElementById('course-level').value;
  const icon = document.getElementById('course-icon').value.trim() || '📐';
  const description = document.getElementById('course-description').value.trim();

  try {
    if (id) {
      const idx = state.courses.findIndex(c => c.id === id);
      if (idx === -1) return;
      state.courses[idx] = { ...state.courses[idx], name, duration, level, icon, description };
      if (state.supabaseClient) {
        await state.supabaseClient.from('courses').update(state.courses[idx]).eq('id', id);
      }
    } else {
      const newCourse = {
        id: generateUUID(),
        name, duration, level, icon, description,
        created_at: new Date().toISOString()
      };
      state.courses.push(newCourse);
      if (state.supabaseClient) {
        await state.supabaseClient.from('courses').insert([newCourse]);
      }
    }
  } catch (err) {
    console.error("Supabase course sync failed (data saved locally):", err);
  }

  saveStateToLocalStorage();
  closeCourseModal();
  renderCoursesTable();
  renderCoursesList(document.getElementById('course-search-input')?.value || '');
  populateCourseDropdowns();
}

async function handleAdminDeleteCourse(id) {
  if (!confirm("Are you sure you want to permanently delete this course from the catalog?")) return;
  state.courses = state.courses.filter(c => c.id !== id);
  saveStateToLocalStorage();
  try {
    if (state.supabaseClient) {
      await state.supabaseClient.from('courses').delete().eq('id', id);
    }
  } catch (err) {
    console.error("Supabase delete failed (removed locally):", err);
  }
  renderCoursesTable();
  renderCoursesList(document.getElementById('course-search-input')?.value || '');
  populateCourseDropdowns();
}

// --- DYNAMIC DATABASE CONFIGURATOR TAB ---
async function testSupabaseConnectionCredentials() {
  const url = document.getElementById('db-config-url').value.trim();
  const key = document.getElementById('db-config-key').value.trim();
  const resBox = document.getElementById('db-test-result');
  const resIcon = document.getElementById('db-test-icon');
  const resTitle = document.getElementById('db-test-title');
  const resDesc = document.getElementById('db-test-desc');

  if (!url || !key) {
    alert("Please provide both URL and Anon key credentials to test!");
    return;
  }

  resBox.classList.add('hidden');

  try {
    const testClient = window.supabase.createClient(url, key);
    
    // Check admin_students table
    const { error: studentErr } = await testClient.from('admin_students').select('id').limit(1);
    // Check certificates table
    const { error: certErr } = await testClient.from('certificates').select('id').limit(1);
    // Check inquiries table
    const { error: inqErr } = await testClient.from('inquiries').select('id').limit(1);
    // Check courses table
    const { error: courseErr } = await testClient.from('courses').select('id').limit(1);

    var missingTables = [];
    if (studentErr) missingTables.push('admin_students');
    if (certErr) missingTables.push('certificates');
    if (inqErr) missingTables.push('inquiries');
    if (courseErr) missingTables.push('courses');

    if (missingTables.length === 0) {
      resBox.className = "p-4 rounded-xl border bg-emerald-950/20 border-emerald-900 text-emerald-400 flex items-start gap-3";
      resIcon.innerHTML = `<i data-lucide="check-circle-2" class="w-5 h-5"></i>`;
      resTitle.innerText = "All Tables Verified";
      resDesc.innerText = "Connection successful! All required tables (admin_students, certificates, inquiries, courses) exist and are accessible.";
      resBox.classList.remove('hidden');
      if (typeof lucide !== 'undefined') { lucide.createIcons(); }
      return;
    }

    var errorMessages = [];
    if (studentErr) errorMessages.push('admin_students: ' + (studentErr.message || 'access denied'));
    if (certErr) errorMessages.push('certificates: ' + (certErr.message || 'access denied'));
    if (inqErr) errorMessages.push('inquiries: ' + (inqErr.message || 'access denied'));
    if (courseErr) errorMessages.push('courses: ' + (courseErr.message || 'access denied'));

    resBox.className = "p-4 rounded-xl border bg-red-950/20 border-red-900 text-red-400 flex items-start gap-3";
    resIcon.innerHTML = `<i data-lucide="alert-circle" class="w-5 h-5"></i>`;
    resTitle.innerText = "Missing Tables (" + missingTables.length + ")";
    resDesc.innerHTML = "The following tables are missing or inaccessible:<br><br>" + errorMessages.join('<br>') + '<br><br><strong>Solution:</strong> Copy the contents of <code>supabase-schema.sql</code> and run it in your Supabase SQL Editor.';
    resBox.classList.remove('hidden');
  } catch (err) {
    resBox.className = "p-4 rounded-xl border bg-red-950/20 border-red-900 text-red-400 flex items-start gap-3";
    resIcon.innerHTML = `<i data-lucide="alert-circle" class="w-5 h-5"></i>`;
    resTitle.innerText = "Construction Error";
    resDesc.innerText = "Invalid URL structures or key parameters: " + (err.message || String(err));
    resBox.classList.remove('hidden');
  }
  if (typeof lucide !== 'undefined') { lucide.createIcons(); }
}

async function saveSupabaseConfiguration() {
  const url = document.getElementById('db-config-url').value.trim();
  const key = document.getElementById('db-config-key').value.trim();

  if (!url || !key) {
    alert("Please enter both Supabase URL and Anon key!");
    return;
  }

  localStorage.setItem('KCTC_SUPABASE_URL', url);
  localStorage.setItem('KCTC_SUPABASE_KEY', key);
  state.supabaseUrl = url;
  state.supabaseKey = key;

  initSupabaseClient();
  updateDatabaseStatusIndicators();

  // Perform immediate dual sync
  await syncWithRemoteDatabase();
  renderStudentsTable();
  renderInquiriesTable();
  renderCertificatesLedger();
  renderCoursesTable();
  populateCourseDropdowns();
  updateAnalyticsDashboard();

  renderDbToggle();
}

function resetSupabaseToDefaults() {
  if (!confirm("Reset Supabase credentials to environment defaults? This clears your saved override.")) return;
  localStorage.removeItem('KCTC_SUPABASE_URL');
  localStorage.removeItem('KCTC_SUPABASE_KEY');
  state.supabaseUrl = DEFAULT_SUPABASE_URL;
  state.supabaseKey = DEFAULT_SUPABASE_KEY;
  initSupabaseClient();
  updateDatabaseStatusIndicators();
  document.getElementById('db-config-url').value = state.supabaseUrl;
  document.getElementById('db-config-key').value = state.supabaseKey;
  document.getElementById('db-test-result').classList.add('hidden');
  renderDbToggle();
}

// --- TOGGLE SWITCH UI ---
function toggleAdvancedSettings() {
  const panel = document.getElementById('db-advanced-settings');
  const arrow = document.getElementById('db-adv-arrow');
  if (!panel) return;
  const isOpen = !panel.classList.contains('hidden');
  if (isOpen) {
    panel.classList.add('hidden');
    if (arrow) arrow.style.transform = 'rotate(0deg)';
  } else {
    panel.classList.remove('hidden');
    if (arrow) arrow.style.transform = 'rotate(180deg)';
    document.getElementById('db-config-url').value = state.supabaseUrl || '';
    document.getElementById('db-config-key').value = state.supabaseKey || '';
  }
}

function renderDbToggle() {
  const isActive = localStorage.getItem('KCTC_SUPABASE_ACTIVE') === '1';
  const btn = document.getElementById('db-toggle-btn');
  const dot = document.getElementById('db-toggle-dot');
  const statusText = document.getElementById('db-toggle-status');
  const badge = document.getElementById('db-status-badge');
  const badgeIcon = document.getElementById('db-status-icon');
  const badgeMsg = document.getElementById('db-status-msg');

  if (!btn || !dot) return;

  if (isActive) {
    btn.className = 'relative w-14 h-7 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#c5a059]/50 bg-emerald-500';
    dot.className = 'absolute top-0.5 left-7 w-6 h-6 rounded-full bg-white shadow-md transition-all duration-300';
    if (statusText) statusText.innerText = 'Connected — live data syncing';
    if (badge) { badge.className = 'flex items-center gap-2 p-3 rounded-xl border bg-emerald-500/10 border-emerald-500/30'; }
    if (badgeIcon) { badgeIcon.className = 'w-2.5 h-2.5 rounded-full shrink-0 bg-emerald-500 animate-pulse'; }
    if (badgeMsg) { badgeMsg.innerText = 'Cloud sync active'; badgeMsg.className = 'text-[11px] font-bold uppercase tracking-wider text-emerald-400'; }
  } else {
    btn.className = 'relative w-14 h-7 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#c5a059]/50 bg-slate-700';
    dot.className = 'absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-all duration-300';
    if (statusText) statusText.innerText = 'Disconnected — offline mode';
    if (badge) { badge.className = 'flex items-center gap-2 p-3 rounded-xl border bg-slate-500/10 border-slate-500/30'; }
    if (badgeIcon) { badgeIcon.className = 'w-2.5 h-2.5 rounded-full shrink-0 bg-slate-500'; }
    if (badgeMsg) { badgeMsg.innerText = 'Offline fallback active'; badgeMsg.className = 'text-[11px] font-bold uppercase tracking-wider text-slate-400'; }
  }
}

async function toggleSupabaseConnection() {
  const isActive = localStorage.getItem('KCTC_SUPABASE_ACTIVE') === '1';

  if (isActive) {
    // TURN OFF
    localStorage.setItem('KCTC_SUPABASE_ACTIVE', '0');
    state.supabaseClient = null;
    updateDatabaseStatusIndicators();
    renderDbToggle();
    loadStateFromLocalStorage();
    renderStudentsTable();
    renderInquiriesTable();
    renderCertificatesLedger();
    renderCoursesTable();
    updateAnalyticsDashboard();
  } else {
    // TURN ON
    const url = state.supabaseUrl || localStorage.getItem('KCTC_SUPABASE_URL') || DEFAULT_SUPABASE_URL;
    const key = state.supabaseKey || localStorage.getItem('KCTC_SUPABASE_KEY') || DEFAULT_SUPABASE_KEY;

    if (!url || !key) {
      alert('Supabase URL and Key are required. Open Advanced Settings to configure.');
      return;
    }

    state.supabaseUrl = url;
    state.supabaseKey = key;
    localStorage.setItem('KCTC_SUPABASE_URL', url);
    localStorage.setItem('KCTC_SUPABASE_KEY', key);
    localStorage.setItem('KCTC_SUPABASE_ACTIVE', '1');

    initSupabaseClient();
    updateDatabaseStatusIndicators();

    if (state.supabaseClient) {
      const { error } = await state.supabaseClient.from('admin_students').select('id').limit(1);
      if (error) {
        localStorage.setItem('KCTC_SUPABASE_ACTIVE', '0');
        state.supabaseClient = null;
        updateDatabaseStatusIndicators();
        renderDbToggle();
        alert('Connection failed: ' + error.message);
        return;
      }

      await syncWithRemoteDatabase();
      renderStudentsTable();
      renderInquiriesTable();
      renderCertificatesLedger();
      renderCoursesTable();
      populateCourseDropdowns();
      updateAnalyticsDashboard();
    }

    renderDbToggle();
  }
}

function handleWipeAndResetAllData() {
  if (confirm("WARNING: This will permanently wipe all local cache datasets, remove custom Supabase connection configurations, and revert the applet back to offline defaults. Continue?")) {
    localStorage.removeItem('KCTC_SUPABASE_URL');
    localStorage.removeItem('KCTC_SUPABASE_KEY');
    localStorage.removeItem('KCTC_STUDENTS');
    localStorage.removeItem('KCTC_INQUIRIES');
    localStorage.removeItem('KCTC_CERTIFICATES');
    localStorage.removeItem('KCTC_COURSES');
    localStorage.removeItem('KCTC_STUDENT_SESSION');

    state.supabaseUrl = '';
    state.supabaseKey = '';
    state.supabaseClient = null;
    state.currentSession = null;

    loadStateFromLocalStorage();
    updateDatabaseStatusIndicators();
    toggleAdminPanel(false);
    
    alert("Wiped successfully! App returned to initial offline fallback state.");
  }
}

// ============================================================================
// STORAGE MIGRATION & ZIP DOWNLOAD
// ============================================================================

async function migrateStoragePaths() {
  if (!state.supabaseClient) { alert('Supabase not configured.'); return; }

  const docsToMigrate = [];
  state.students.forEach(s => {
    const docs = s.documents || {};
    Object.keys(docs).forEach(type => {
      if (type === 'selfDeclaration') return;
      const d = docs[type];
      if (!d || !d.path || !d.publicUrl) return;
      if (d.path.includes('/')) return;
      docsToMigrate.push({ student: s, docType: type, doc: d });
    });
  });

  if (docsToMigrate.length === 0) {
    alert('All documents are already using the new folder structure. Nothing to migrate.');
    return;
  }

  if (!confirm('This will reorganize ' + docsToMigrate.length + ' document(s) into course/student folders.\n\nOld files will be deleted after migration.\n\nContinue?')) return;

  let ok = 0, fail = 0;
  const bucket = state.supabaseClient.storage.from('student-documents');

  for (const item of docsToMigrate) {
    try {
      const { student, docType, doc } = item;
      const ext = doc.name ? doc.name.split('.').pop() : (docType === 'passportPhoto' || docType === 'signature') ? 'jpg' : 'pdf';
      const course = (student.enrolled_course || 'Unknown').replace(' Course', '');
      const safeName = student.full_name.replace(/[^a-zA-Z0-9 ]/g, '').trim();
      const roll = student.roll_number || 'NO-ROLL';
      const newPath = course + '/' + safeName + ' (' + roll + ')/' + docType + '.' + ext;

      const res = await fetch(doc.publicUrl);
      if (!res.ok) throw new Error('Fetch failed: ' + res.status);
      const blob = await res.blob();

      await bucket.upload(newPath, blob, { upsert: true });

      const pubRes = bucket.getPublicUrl(newPath);
      student.documents[docType] = {
        name: doc.name,
        type: doc.type,
        path: newPath,
        publicUrl: pubRes.data.publicUrl,
        uploadedAt: doc.uploadedAt
      };

      await bucket.remove([doc.path]);
      ok++;
    } catch (err) {
      console.error('Migration failed for:', item.docType, err);
      fail++;
    }
  }

  saveStateToLocalStorage();
  await syncWithRemoteDatabase();
  renderStudentsTable();
  alert('Migration complete!\n\nMigrated: ' + ok + '\nFailed: ' + fail);
}

function getStudentDocFolder(student) {
  const course = (student.enrolled_course || 'Unknown').replace(' Course', '');
  const safeName = student.full_name.replace(/[^a-zA-Z0-9 ]/g, '').trim();
  const roll = student.roll_number || 'NO-ROLL';
  return { course, folderName: safeName + ' (' + roll + ')' };
}

async function downloadDocsAsZip() {
  const docs = collectStudentDocuments().filter(d => d.url);
  if (docs.length === 0) { alert('No cloud-stored documents to download.'); return; }
  if (!confirm('Download all ' + docs.length + ' document(s) as a ZIP file with folder structure?\n\nThis may take a few minutes.')) return;

  const zip = new JSZip();
  const folderMap = {};

  state.students.forEach(s => {
    const { course, folderName } = getStudentDocFolder(s);
    const studentDocs = docs.filter(d => d.student === s.full_name);
    if (studentDocs.length === 0) return;
    if (!folderMap[s.id]) folderMap[s.id] = { course, folderName, docs: studentDocs };
  });

  const statusEl = document.getElementById('drive-status') || document.getElementById('db-status-text');
  let count = 0;
  const total = docs.length;

  for (const key of Object.keys(folderMap)) {
    const { course, folderName, docs: sDocs } = folderMap[key];
    for (const d of sDocs) {
      try {
        const res = await fetch(d.url);
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const blob = await res.blob();
        const ext = d.name ? d.name.split('.').pop() : d.type.split('/').pop();
        const fileName = d.type + '.' + ext;
        zip.file(course + '/' + folderName + '/' + fileName, blob);
        count++;
        if (statusEl) statusEl.innerText = 'Zipping: ' + count + '/' + total;
        await new Promise(r => setTimeout(r, 200));
      } catch (err) {
        console.error('ZIP fetch failed:', d.name, err);
      }
    }
  }

  const dateStr = new Date().toISOString().split('T')[0];
  const content = await zip.generateAsync({ type: 'blob' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(content);
  link.download = 'KCTC_Documents_' + dateStr + '.zip';
  link.click();
  URL.revokeObjectURL(link.href);
  if (statusEl) statusEl.innerText = 'SUPABASE CONNECTED';
  alert('ZIP downloaded with ' + count + ' document(s).');
}

async function downloadSelectedDocsAsZip() {
  const ids = getSelectedStudentIds();
  if (ids.length === 0) {
    alert('No students selected. Use the checkboxes on the left to select students.');
    return;
  }

  const selected = state.students.filter(s => ids.includes(s.id));
  const docs = collectStudentDocuments().filter(d => d.url && selected.some(s => s.full_name === d.student));

  if (docs.length === 0) {
    alert('No cloud-stored documents found for selected students.');
    return;
  }

  if (!confirm('Download ' + docs.length + ' document(s) from ' + selected.length + ' student(s) as ZIP?')) return;

  const zip = new JSZip();
  let count = 0;

  for (const s of selected) {
    const { course, folderName } = getStudentDocFolder(s);
    const sDocs = docs.filter(d => d.student === s.full_name);
    for (const d of sDocs) {
      try {
        const res = await fetch(d.url);
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const blob = await res.blob();
        const ext = d.name ? d.name.split('.').pop() : d.type.split('/').pop();
        const fileName = d.type + '.' + ext;
        zip.file(course + '/' + folderName + '/' + fileName, blob);
        count++;
        await new Promise(r => setTimeout(r, 200));
      } catch (err) {
        console.error('ZIP fetch failed:', d.name, err);
      }
    }
  }

  const dateStr = new Date().toISOString().split('T')[0];
  const content = await zip.generateAsync({ type: 'blob' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(content);
  link.download = 'KCTC_Selected_' + selected.length + 'Students_' + dateStr + '.zip';
  link.click();
  URL.revokeObjectURL(link.href);
  alert('ZIP downloaded with ' + count + ' document(s) from ' + selected.length + ' student(s).');
}
