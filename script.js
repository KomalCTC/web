/**
 * Komal Creations Training Center (KCTC) - Core JavaScript State Engine
 * SPDX-License-Identifier: Apache-2.0
 */

// --- DEFAULT SUPABASE CONFIGURATION (override via Admin Panel → Database Config) ---
const DEFAULT_SUPABASE_URL = 'https://gwepnwrdoyfgjvdwuypa.supabase.co';
const DEFAULT_SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3ZXBud3Jkb3lmZ2p2ZHd1eXBhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc5NjM5MDcsImV4cCI6MjA2MzUzOTkwN30.phqJIn3NwRq_VHp2g47jB6AWH3mRq9Bx4V2r3d6rHC4';

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

// --- CORE SYSTEM INITIALIZER ---
window.addEventListener('DOMContentLoaded', async () => {
  // Load cached database files
  loadStateFromLocalStorage();

  // Initialize elements
  renderPortfolioCreations('all');
  renderCoursesList('');
  initializeEstimatorUI();
  updateEstimatorCost();
  setupTestimonialTicker();

  // Initialize custom Supabase if saved
  initSupabaseClient();
  updateDatabaseStatusIndicators();

  // Sync background remote tables if active
  if (state.supabaseClient) {
    await syncWithRemoteDatabase();
    // Clean sample data from Supabase if it synced down
    try {
      var sampleEmails = ['priya@gmail.com', 'komal@gmail.com'];
      for (var i = 0; i < sampleEmails.length; i++) {
        state.supabaseClient.from('admin_students').delete().eq('email', sampleEmails[i]).then(function() {});
      }
    } catch(e) {}
  }

  // Populate course dropdowns in admin forms
  populateCourseDropdowns();

  // Bind Scroll listener for Header active classes
  window.addEventListener('scroll', handleWindowScrollActiveStates);

  // Initialize Lucide Icons
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  // Boot-time diagnostics in DevTools console
  console.log("=== KCTC DIAGNOSTICS ===");
  console.log("supabase (window):", typeof window.supabase !== 'undefined' ? "LOADED" : "MISSING — check CDN URL in index.html");
  console.log("state.supabaseClient:", state.supabaseClient ? "ACTIVE" : "NULL");
  console.log("state.supabaseUrl:", state.supabaseUrl);
  console.log("Courses in state:", state.courses.length);
  console.log("Students in state:", state.students.length);
  console.log("LocalStorage KCTC_STUDENTS:", (JSON.parse(localStorage.getItem('KCTC_STUDENTS') || '[]')).length, "items");
  console.log("Open Admin Panel → Supabase Config → Test Connection to verify tables exist.");
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

  // Remove any leftover sample data that may persist from earlier versions
  const sampleEmails = ['priya@gmail.com', 'komal@gmail.com'];
  state.students = state.students.filter(s => !sampleEmails.includes(s.email.toLowerCase()));
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
  if (!state.supabaseClient) return;

  try {
    // 2. Fetch remote records
    const { data: dbStudents } = await state.supabaseClient.from('admin_students').select('*');
    const { data: dbInquiries } = await state.supabaseClient.from('inquiries').select('*');
    const { data: dbCertificates } = await state.supabaseClient.from('certificates').select('*');
    const { data: dbCourses } = await state.supabaseClient.from('courses').select('*');

    // 3. Merging lists — always try upsert even if SELECT returns null
    if (dbStudents) {
      state.students = mergeLists(state.students, dbStudents);
    }
    try {
      await uploadDiffToSupabase('admin_students', state.students);
    } catch (e) {
      console.warn("Students upsert skipped (table may not exist yet):", e);
    }

    if (dbInquiries) {
      state.inquiries = mergeLists(state.inquiries, dbInquiries);
    }
    try {
      await uploadDiffToSupabase('inquiries', state.inquiries);
    } catch (e) {
      console.warn("Inquiries upsert skipped:", e);
    }

    if (dbCertificates) {
      state.certificates = mergeLists(state.certificates, dbCertificates);
    }
    try {
      await uploadDiffToSupabase('certificates', state.certificates);
    } catch (e) {
      console.warn("Certificates upsert skipped:", e);
    }
    // Courses: always attempt upsert regardless of remote state
    try {
      const { data: dbCourses } = await state.supabaseClient.from('courses').select('*');
      if (dbCourses) {
        state.courses = mergeLists(state.courses, dbCourses);
      }
      await uploadDiffToSupabase('courses', state.courses);
    } catch (e) {
      console.warn("Courses sync skipped (table may not exist yet):", e);
    }

    saveStateToLocalStorage();
    
    // Reconcile portal active student details
    if (state.currentSession) {
      const live = state.students.find(s => s.id === state.currentSession.id || s.email.toLowerCase() === state.currentSession.email.toLowerCase());
      if (live) {
        state.currentSession = { ...state.currentSession, ...live };
        saveStateToLocalStorage();
      }
    }

  } catch (error) {
    console.error("Hybrid database synchronization failed:", error);
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

// --- NAVIGATION & DOM VIEW TOGGLERS ---
function scrollToSection(id) {
  const publicView = document.getElementById('public-site');
  const adminView = document.getElementById('admin-panel');
  if (publicView && adminView) {
    publicView.classList.remove('hidden');
    adminView.classList.add('hidden');
    const footerSite = document.getElementById('footer-site');
    if (footerSite) footerSite.classList.remove('hidden');
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
    document.getElementById('cert-view-name').innerText = cert.student_name;
    document.getElementById('cert-view-father').innerText = cert.father_name;
    document.getElementById('cert-view-course').innerText = cert.course_name;
    document.getElementById('cert-view-roll').innerText = cert.roll_number;
    document.getElementById('cert-view-grade').innerText = cert.grade;
    document.getElementById('cert-view-year').innerText = cert.passing_year;
    document.getElementById('cert-view-code').innerText = cert.verification_code;

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

    document.getElementById('portal-fees-amount').innerText = `₹${feesAmount}`;
    
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

    document.getElementById('student-portal-modal').classList.remove('hidden');
  } else {
    // Open auth login modal
    document.getElementById('student-auth-modal').classList.remove('hidden');
    switchAuthTab('login');
  }
}

function closeStudentPortal() {
  document.getElementById('student-portal-modal').classList.add('hidden');
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

function handleStudentLogin(e) {
  e.preventDefault();
  const email = document.getElementById('login-email').value.trim().toLowerCase();
  const pass = document.getElementById('login-password').value.trim();
  const errMsg = document.getElementById('auth-error-msg');

  if (!errMsg) return;
  errMsg.classList.add('hidden');

  // Verify credentials against student array
  const student = state.students.find(s => s.email.toLowerCase() === email && (s.password === pass || s.phone.includes(pass)));

  if (student) {
    state.currentSession = {
      id: student.id,
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
  } else {
    errMsg.innerText = "Incorrect email address or portal password roll number. Try 'password123' as default.";
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

  // Check unique email
  if (state.students.some(s => s.email.toLowerCase() === email)) {
    errMsg.innerText = "Email address is already registered. Please proceed to Login.";
    errMsg.classList.remove('hidden');
    return;
  }

  const newStd = {
    id: generateUUID(),
    full_name: name,
    father_name: father,
    dob: dob,
    gender: gender,
    qualification: qual,
    residence: residence,
    phone: phone,
    email: email,
    password: pass,
    enrolled_course: document.getElementById('reg-course').value,
    fees_paid: false,
    fees_amount: 4500,
    email_verified: false,
    enrollment_status: 'pending',
    documents: {},
    admin_remarks: '',
    created_at: new Date().toISOString()
  };

  // Add locally
  state.students.push(newStd);
  saveStateToLocalStorage();

  // Push to Supabase if active
  if (state.supabaseClient) {
    const { error: insertErr } = await state.supabaseClient.from('admin_students').insert([newStd]);
    if (insertErr) {
      console.error("Failed to register in remote database:", insertErr);
      var errDetail = typeof insertErr === 'object' && insertErr !== null ? (insertErr.message || JSON.stringify(insertErr)) : String(insertErr);
      if (errDetail.toLowerCase().includes('does not exist') || errDetail.toLowerCase().includes('relation')) {
        errMsg.innerText = "REGISTRATION SAVED LOCALLY. Supabase table 'admin_students' is missing. Please run supabase-schema.sql in your Supabase SQL Editor.";
      } else {
        errMsg.innerText = "Registration saved locally but failed to sync to cloud: " + errDetail;
      }
      errMsg.classList.remove('hidden');
    }
  } else {
    errMsg.innerText = "REGISTRATION SAVED LOCALLY. No Supabase connection — data won't appear in cloud database until you configure credentials in Supabase Config tab.";
    errMsg.classList.remove('hidden');
  }

  sxcMsg.innerText = "Registration requested successfully! An administrator will audit your details shortly. Try logging in now.";
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
}

function logoutStudentPortal() {
  state.currentSession = null;
  saveStateToLocalStorage();
  closeStudentPortal();
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

  if (file.size > 5 * 1024 * 1024) {
    msg.className = 'text-xs font-bold mt-1 text-red-600';
    msg.innerText = 'File too large (max 5MB).';
    msg.classList.remove('hidden');
    setTimeout(() => msg.classList.add('hidden'), 3000);
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
    const filePath = student.id + '/' + docType + '-' + Date.now() + '.' + ext;
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
  const win = window.open('', '_blank');
  win.document.write('<html><head><title>' + doc.name + '</title></head><body style="margin:0;display:flex;align-items:center;justify-content:center;background:#f5f5f5;"><embed src="' + src + '" style="width:100%;height:100vh;" type="' + (doc.type || 'application/pdf') + '"></embed></body></html>');
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
  const publicView = document.getElementById('public-site');
  const footerSite = document.getElementById('footer-site');
  const adminView = document.getElementById('admin-panel');
  const gate = document.getElementById('admin-pass-gate');

  if (!publicView || !adminView || !gate) return;

  if (show) {
    if (state.isAdminLoggedIn) {
      publicView.classList.add('hidden');
      if (footerSite) footerSite.classList.add('hidden');
      adminView.classList.remove('hidden');
      setAdminTab(state.activeAdminTab);
    } else {
      gate.classList.remove('hidden');
    }
  } else {
    state.isAdminLoggedIn = false;
    adminView.classList.add('hidden');
    gate.classList.add('hidden');
    publicView.classList.remove('hidden');
    if (footerSite) footerSite.classList.remove('hidden');
    window.scrollTo(0, 0);
  }
}

function handleAdminGatewayLogin(e) {
  e.preventDefault();
  const email = document.getElementById('admin-email').value.trim().toLowerCase();
  const pass = document.getElementById('admin-password').value.trim();
  const errorEl = document.getElementById('admin-gate-error');

  if (!errorEl) return;
  errorEl.classList.add('hidden');

  // Auth check — update these credentials or configure via env variable
  const validEmails = ['Komalpreet1625@gmail.com'.toLowerCase(), 'admin@komalcreations.com'.toLowerCase()];
  const validPass = 'universal';

  if (validEmails.includes(email) && pass === validPass) {
    state.isAdminLoggedIn = true;
    document.getElementById('admin-pass-gate').classList.add('hidden');
    toggleAdminPanel(true);
    // Reset inputs
    document.getElementById('admin-email').value = '';
    document.getElementById('admin-password').value = '';
  } else {
    errorEl.innerText = "Incorrect Administrator security credentials.";
    errorEl.classList.remove('hidden');
  }
}

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
  }

  if (typeof lucide !== 'undefined') { lucide.createIcons(); }
}

// --- TAB SUB-VIEWS RENDERING ---

function updateAnalyticsDashboard() {
  const total = state.students.length;
  const active = state.students.filter(s => s.enrollment_status === 'accepted').length;
  const revenue = state.students.reduce((acc, s) => acc + (s.fees_paid ? s.fees_amount : 0), 0);
  const unpaidCount = state.students.filter(s => !s.fees_paid).length;

  document.getElementById('stat-total-students').innerText = total;
  document.getElementById('stat-active-students').innerText = active;
  document.getElementById('stat-revenue').innerText = `₹${revenue}`;
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

  const search = document.getElementById('student-filter-search').value.trim().toLowerCase();
  const filterCourse = document.getElementById('student-filter-course').value;
  const filterStatus = document.getElementById('student-filter-status').value;

  const filtered = state.students.filter(s => {
    const matchSearch = s.full_name.toLowerCase().includes(search) || s.phone.includes(search) || s.email.toLowerCase().includes(search);
    const matchCourse = filterCourse ? s.enrolled_course === filterCourse : true;
    const matchStatus = filterStatus ? s.enrollment_status === filterStatus : true;
    return matchSearch && matchCourse && matchStatus;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="p-8 text-center text-slate-500 font-bold">No registered students found matching filter parameters.</td></tr>`;
    return;
  }

  filtered.forEach(s => {
    const statusClass = s.enrollment_status === 'accepted' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                        s.enrollment_status === 'declined' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 
                        'bg-amber-500/10 text-amber-400 border border-amber-500/20';

    const feesClass = s.fees_paid ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400';

    const docCount = s.documents ? Object.keys(s.documents).filter(k => k !== 'selfDeclaration' && s.documents[k] && s.documents[k].dataUrl).length : 0;

    const tr = document.createElement('tr');
    tr.className = "border-b border-slate-800 hover:bg-slate-950/40 transition-all";
    tr.innerHTML = `
      <td class="p-3.5">
        <strong class="block text-white font-serif text-sm">${s.full_name}</strong>
        <span class="text-[10px] text-slate-500 font-bold uppercase mt-1 block">Father: ${s.father_name}</span>
      </td>
      <td class="p-3.5">
        <span class="block font-medium text-slate-300">${s.phone}</span>
        <span class="text-slate-500 text-[10px] mt-0.5 block truncate max-w-[150px]">${s.email}</span>
      </td>
      <td class="p-3.5 text-slate-400 font-semibold max-w-[160px] break-words">
        ${s.enrolled_course.replace(" Course", "")}
      </td>
      <td class="p-3.5">
        <div class="flex items-center gap-2">
          <span class="px-2.5 py-0.5 rounded-full text-[9px] font-bold tracking-wider ${statusClass}">${s.enrollment_status.toUpperCase()}</span>
          <span class="px-2.5 py-0.5 rounded-full text-[9px] font-bold tracking-wider ${feesClass}">₹${s.fees_amount} ${s.fees_paid ? 'PAID' : 'UNPAID'}</span>
        </div>
        <span class="font-mono text-[10px] text-[#c5a059] mt-1.5 block">Pass: ${s.password || 'password123'}</span>
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
    tbody.appendChild(tr);
  });
  if (typeof lucide !== 'undefined') { lucide.createIcons(); }
}

function renderInquiriesTable() {
  const tbody = document.getElementById('admin-inquiries-tbody');
  if (!tbody) return;
  tbody.innerHTML = '';

  const search = document.getElementById('inquiry-filter-search').value.trim().toLowerCase();

  const filtered = state.inquiries.filter(i => {
    return i.full_name.toLowerCase().includes(search) || i.phone_number.includes(search) || (i.course_interested && i.course_interested.toLowerCase().includes(search));
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="p-8 text-center text-slate-500 font-bold">No inquiry leads logged.</td></tr>`;
    return;
  }

  filtered.forEach(inq => {
    const dateStr = new Date(inq.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    
    const statusClass = inq.status === 'enrolled' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                        inq.status === 'contacted' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                        inq.status === 'cancelled' ? 'bg-slate-500/10 text-slate-400 border border-slate-800' :
                        'bg-amber-500/10 text-amber-400 border border-amber-500/20';

    const tr = document.createElement('tr');
    tr.className = "border-b border-slate-800 hover:bg-slate-950/40 transition-all";
    tr.innerHTML = `
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
  const win = window.open('', '_blank');
  win.document.write('<html><head><title>' + doc.name + '</title></head><body style="margin:0;display:flex;align-items:center;justify-content:center;background:#f5f5f5;"><embed src="' + src + '" style="width:100%;height:100vh;" type="' + (doc.type || 'application/pdf') + '"></embed></body></html>');
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
    email_verified: false,
    enrollment_status: status,
    documents: {},
    admin_remarks: '',
    created_at: new Date().toISOString()
  };

  state.students.push(newStd);

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

  const search = document.getElementById('cert-filter-search').value.trim().toLowerCase();

  const filtered = state.certificates.filter(c => {
    return c.student_name.toLowerCase().includes(search) || c.roll_number.toLowerCase().includes(search) || c.verification_code.toLowerCase().includes(search);
  });

  if (filtered.length === 0) {
    container.innerHTML = `<p class="p-8 text-center text-slate-500 font-bold text-xs">No issued designer certificates match criteria.</p>`;
    return;
  }

  // Set randomized code for next issues
  const codes = "KCTC-" + Math.floor(10000 + Math.random() * 90000).toString(16).toUpperCase();
  const inputCode = document.getElementById('cert-verify-code');
  if (inputCode) inputCode.value = codes;

  filtered.forEach(c => {
    const card = document.createElement('div');
    card.className = "bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between";
    card.innerHTML = `
      <div>
        <h4 class="font-serif font-bold text-white text-sm">${c.student_name}</h4>
        <p class="text-[10px] text-slate-500 mt-0.5 font-bold">Roll: ${c.roll_number} | Year: ${c.passing_year} | Grade: ${c.grade}</p>
        <span class="text-[10px] text-[#c5a059] font-mono block mt-1">Verification PIN: ${c.verification_code}</span>
      </div>
      <div class="flex gap-2">
        <button onclick="previewCertificateInline('${c.roll_number}')" class="p-1.5 bg-slate-950 text-slate-300 hover:text-white rounded-lg border border-slate-800 flex items-center gap-1.5 text-[10px] font-bold" title="Open digital credential">
          <i data-lucide="eye" class="w-3.5 h-3.5"></i>
          <span>Verify View</span>
        </button>
        <button onclick="handleAdminRevokeCertificate('${c.id}')" class="p-1.5 bg-slate-950 text-slate-500 hover:text-red-400 rounded-lg border border-slate-800 hover:border-red-900" title="Revoke Certificate">
          <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
        </button>
      </div>
    `;
    container.appendChild(card);
  });
  if (typeof lucide !== 'undefined') { lucide.createIcons(); }
}

function previewCertificateInline(rollNumber) {
  const cert = state.certificates.find(c => c.roll_number === rollNumber);
  if (cert) {
    document.getElementById('cert-view-name').innerText = cert.student_name;
    document.getElementById('cert-view-father').innerText = cert.father_name;
    document.getElementById('cert-view-course').innerText = cert.course_name;
    document.getElementById('cert-view-roll').innerText = cert.roll_number;
    document.getElementById('cert-view-grade').innerText = cert.grade;
    document.getElementById('cert-view-year').innerText = cert.passing_year;
    document.getElementById('cert-view-code').innerText = cert.verification_code;

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
  const year = parseInt(document.getElementById('cert-passing-year').value) || 2026;

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
  document.getElementById('cert-passing-year').value = '2026';

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

  const search = document.getElementById('courses-filter-search').value.trim().toLowerCase();

  const filtered = state.courses.filter(c => c.name.toLowerCase().includes(search) || c.description.toLowerCase().includes(search));

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="p-8 text-center text-slate-500 font-bold">No courses found. Add one to get started.</td></tr>`;
    return;
  }

  filtered.forEach(c => {
    const tr = document.createElement('tr');
    tr.className = "border-b border-slate-800 hover:bg-slate-950/40 transition-all";
    tr.innerHTML = `
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

  alert("Supabase active configuration saved! Live synchronized cloud database is running.");
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
