const fs = require("fs");
const path = require("path");

// Locate the results directory (handles both workspace root and relative paths)
const findResultsDir = () => {
  const possiblePaths = [
    path.resolve(__dirname, "../../../results"),
    path.resolve(__dirname, "../../results"),
    path.resolve(process.cwd(), "results"),
    path.resolve(process.cwd(), "../results"),
  ];

  for (const dir of possiblePaths) {
    if (fs.existsSync(dir) && fs.existsSync(path.join(dir, "processed_startups.csv"))) {
      return dir;
    }
  }

  return possiblePaths[0];
};

const RESULTS_DIR = findResultsDir();

// RFC 4180 compliant CSV parser
function parseCSV(content) {
  if (!content || typeof content !== "string") return [];

  const lines = [];
  let row = [];
  let insideQuotes = false;
  let entry = "";

  for (let i = 0; i < content.length; i++) {
    const c = content[i];
    const next = content[i + 1];

    if (c === '"' && insideQuotes && next === '"') {
      entry += '"';
      i++;
    } else if (c === '"') {
      insideQuotes = !insideQuotes;
    } else if (c === "," && !insideQuotes) {
      row.push(entry.trim());
      entry = "";
    } else if ((c === "\r" || c === "\n") && !insideQuotes) {
      if (c === "\r" && next === "\n") i++;
      row.push(entry.trim());
      if (row.length > 1 || (row.length === 1 && row[0] !== "")) {
        lines.push(row);
      }
      row = [];
      entry = "";
    } else {
      entry += c;
    }
  }

  if (entry.length > 0 || row.length > 0) {
    row.push(entry.trim());
    lines.push(row);
  }

  if (lines.length === 0) return [];

  const headers = lines[0].map((h) => h.replace(/^["']|["']$/g, "").trim());
  const rows = [];

  for (let r = 1; r < lines.length; r++) {
    const values = lines[r];
    if (values.length === 0 || (values.length === 1 && !values[0])) continue;
    const item = {};
    headers.forEach((header, idx) => {
      let val = values[idx] ?? "";
      if (val.startsWith('"') && val.endsWith('"')) {
        val = val.slice(1, -1);
      }
      item[header] = val;
    });
    rows.push(item);
  }

  return rows;
}

// In-memory cache for fast read operations
const datasetCache = {
  startups: null,
  investors: null,
  mentors: null,
  students: null,
  founders: null,
  lastLoaded: 0,
};

const parseListField = (val) => {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  const str = String(val).trim();
  if (!str || str.toLowerCase() === "unknown" || str.toLowerCase() === "none") return [];
  if (str.startsWith("[") && str.endsWith("]")) {
    try {
      const parsed = JSON.parse(str.replace(/'/g, '"'));
      if (Array.isArray(parsed)) return parsed.map((x) => String(x).trim()).filter(Boolean);
    } catch {
      // Fallback to comma splitting
    }
  }
  return str.split(/[;,]/).map((s) => s.trim()).filter(Boolean);
};

const formatAmountUSD = (val) => {
  if (!val) return "Undisclosed";
  const num = Number(val);
  if (!Number.isFinite(num) || num === 0) return String(val);
  if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
  if (num >= 1e3) return `$${(num / 1e3).toFixed(0)}K`;
  return `$${num.toLocaleString()}`;
};

function loadDatasets(force = false) {
  const ONE_HOUR = 60 * 60 * 1000;
  if (!force && datasetCache.lastLoaded && Date.now() - datasetCache.lastLoaded < ONE_HOUR) {
    return datasetCache;
  }

  try {
    // 1. Processed Startups (650 records)
    const startupsPath = path.join(RESULTS_DIR, "processed_startups.csv");
    if (fs.existsSync(startupsPath)) {
      const raw = fs.readFileSync(startupsPath, "utf8");
      datasetCache.startups = parseCSV(raw).map((s, index) => {
        const id = s.id || `SS-${String(index + 1).padStart(4, "0")}`;
        const tags = parseListField(s.tags);
        const skills = parseListField(s.required_skills);
        const roles = parseListField(s.recommended_roles);
        const investorsList = parseListField(s.investors);
        const fundingStage = s.funding_stage || "seed";

        return {
          id,
          aiDatasetId: id,
          datasetId: id,
          startupId: id,
          name: s.name || `Startup ${index + 1}`,
          startupName: s.name || `Startup ${index + 1}`,
          industry: s.industry || "General Technology",
          domain: s.industry || "Technology",
          location: s.location || "Global",
          fundingStage,
          startupStage: fundingStage,
          fundingAmount: s.funding_amount || "0",
          fundingDisplay: formatAmountUSD(s.funding_amount),
          investors: investorsList,
          requiredSkills: skills,
          recommendedRoles: roles,
          tags,
          description: s.description || `${s.name} is an innovative venture in ${s.industry}. Currently at ${fundingStage} stage.`,
          isDataset: true,
          isRegistered: false,
          source: "StartupSync AI Ecosystem Dataset",
          canConnect: false,
        };
      });
    }

    // 2. Processed Investors (253 records)
    const investorsPath = path.join(RESULTS_DIR, "processed_investors.csv");
    if (fs.existsSync(investorsPath)) {
      const raw = fs.readFileSync(investorsPath, "utf8");
      datasetCache.investors = parseCSV(raw).map((inv, index) => {
        const id = inv.id || String(index + 1);
        const industries = [
          inv.primary_domain,
          ...parseListField(inv.secondary_domains),
          ...parseListField(inv.tags),
        ].filter(Boolean);

        const stages = parseListField(inv.investment_stages);
        const pastInv = parseListField(inv.past_investments);
        const notable = parseListField(inv.notable_investments);

        return {
          id,
          aiDatasetId: id,
          datasetId: id,
          name: inv.name || inv.firm_name || `Investor ${index + 1}`,
          firmName: inv.firm_name || inv.name || "Venture Firm",
          type: inv.investor_type || "Venture Capital",
          investorType: inv.investor_type || "venture_capital",
          location: inv.location || "Global",
          industries: [...new Set(industries)],
          investmentIndustries: [...new Set(industries)],
          stages: stages.length ? stages : ["Seed", "Series A"],
          preferredStartupStages: stages,
          pastInvestments: pastInv,
          notableInvestments: notable,
          active: String(inv.active).toLowerCase() === "true" || inv.active === "1" || inv.active === true,
          bio: inv.bio || `Active investor specializing in ${inv.primary_domain || "technology"} ventures.`,
          investmentThesis: inv.investmentThesis || inv.investment_thesis || "Backing mission-driven founders building high-growth scalable solutions.",
          isDataset: true,
          isRegistered: false,
          source: "StartupSync AI Ecosystem Dataset",
          canConnect: false,
        };
      });
    }

    // 3. Processed Mentors (250 records)
    const mentorsPath = path.join(RESULTS_DIR, "processed_mentors.csv");
    if (fs.existsSync(mentorsPath)) {
      const raw = fs.readFileSync(mentorsPath, "utf8");
      datasetCache.mentors = parseCSV(raw).map((m, index) => {
        const id = m.id || `M${String(index + 1).padStart(3, "0")}`;
        const skills = parseListField(m.skills);
        const interests = parseListField(m.interests);

        return {
          id,
          aiDatasetId: id,
          datasetId: id,
          name: m.name || `Mentor ${index + 1}`,
          expertise: m.expertise || "Startup Strategy & Growth",
          skills: skills.length ? skills : ["Leadership", "Product Strategy"],
          industry: m.industry || "Technology",
          domain: m.domain || m.industry || "General",
          experienceYears: Number(m.experience_years) || 8,
          location: m.location || "Global",
          interests,
          bio: `${m.name || "Mentor"} is an experienced mentor in ${m.industry} with ${m.experience_years || 8}+ years of operational leadership.`,
          availability: "Available for Monthly Sessions",
          isDataset: true,
          isRegistered: false,
          source: "StartupSync AI Ecosystem Dataset",
          canConnect: false,
        };
      });
    }

    // 4. Processed Students (2000 records)
    const studentsPath = path.join(RESULTS_DIR, "processed_students.csv");
    if (fs.existsSync(studentsPath)) {
      const raw = fs.readFileSync(studentsPath, "utf8");
      datasetCache.students = parseCSV(raw).map((st, index) => {
        const id = st.id || `ST-${String(index + 1).padStart(5, "0")}`;
        const skills = parseListField(st.skills);
        const clubs = parseListField(st.clubs);

        return {
          id,
          aiDatasetId: id,
          datasetId: id,
          name: st.name || `Student ${index + 1}`,
          branch: st.branch || "Computer Science",
          gpa: Number(st.gpa) || 8.0,
          technicalSkills: skills,
          skills,
          clubs,
          internshipDone: String(st.internship_done).toLowerCase() === "true" || st.internship_done === "1",
          internshipDomain: st.internship_domain || "",
          placementDomain: st.placement_domain || "",
          alumniPath: st.alumni_path || "",
          location: "Campus",
          isDataset: true,
          isRegistered: false,
          source: "StartupSync AI Ecosystem Dataset",
          canConnect: false,
        };
      });
    }

    // 5. Processed Founders (500 records)
    const foundersPath = path.join(RESULTS_DIR, "processed_founders.csv");
    if (fs.existsSync(foundersPath)) {
      const raw = fs.readFileSync(foundersPath, "utf8");
      datasetCache.founders = parseCSV(raw).map((f, index) => {
        const id = f.id || String(index + 781);
        return {
          id,
          aiDatasetId: id,
          datasetId: id,
          name: f.company || f.name || `Startup ${id}`,
          founderName: f.name || "Founder",
          startupName: f.company || f.name || `Startup ${id}`,
          company: f.company || "",
          domain: f.domain || "Technology",
          industry: f.domain || "Technology",
          fundingStage: f.funding_stage || "seed",
          startupStage: f.funding_stage || "seed",
          fundingRound: f.funding_round || "",
          fundingAmount: f.funding_amount || "0",
          valuation: f.valuation || "",
          competitors: parseListField(f.competitors),
          umbrellaCompanies: parseListField(f.umbrella_companies),
          location: "India",
          isDataset: true,
          isRegistered: false,
          source: "StartupSync AI Ecosystem Dataset",
          canConnect: false,
        };
      });
    }

    datasetCache.lastLoaded = Date.now();
  } catch (err) {
    console.error("Error loading datasets in datasetService:", err.message);
  }

  return datasetCache;
}

// Initial eager load
loadDatasets();

const datasetService = {
  getStats: () => {
    loadDatasets();
    return {
      resultsDir: RESULTS_DIR,
      startupsCount: datasetCache.startups ? datasetCache.startups.length : 0,
      investorsCount: datasetCache.investors ? datasetCache.investors.length : 0,
      mentorsCount: datasetCache.mentors ? datasetCache.mentors.length : 0,
      studentsCount: datasetCache.students ? datasetCache.students.length : 0,
      foundersCount: datasetCache.founders ? datasetCache.founders.length : 0,
      lastLoaded: datasetCache.lastLoaded ? new Date(datasetCache.lastLoaded).toISOString() : null,
      datasetVersion: "2026.1",
      preprocessingVersion: "1.2.0",
      modelVersion: "2.1.0-hybrid",
    };
  },

  getAllStartups: (options = {}) => {
    loadDatasets();
    return filterAndPaginate(datasetCache.startups || [], options, ["name", "industry", "location", "tags", "requiredSkills"]);
  },

  getAllInvestors: (options = {}) => {
    loadDatasets();
    return filterAndPaginate(datasetCache.investors || [], options, ["name", "firmName", "type", "location", "industries"]);
  },

  getAllMentors: (options = {}) => {
    loadDatasets();
    return filterAndPaginate(datasetCache.mentors || [], options, ["name", "expertise", "industry", "domain", "skills", "location"]);
  },

  getAllStudents: (options = {}) => {
    loadDatasets();
    return filterAndPaginate(datasetCache.students || [], options, ["name", "branch", "technicalSkills", "skills", "internshipDomain"]);
  },

  getAllFounders: (options = {}) => {
    loadDatasets();
    return filterAndPaginate(datasetCache.founders || [], options, ["name", "company", "domain"]);
  },

  getEntityById: (role, id) => {
    loadDatasets();
    const cleanId = String(id).trim().toLowerCase();
    let collection = [];
    if (role === "startup" || role === "startups") collection = datasetCache.startups || [];
    else if (role === "investor" || role === "investors") collection = datasetCache.investors || [];
    else if (role === "mentor" || role === "mentors") collection = datasetCache.mentors || [];
    else if (role === "student" || role === "students") collection = datasetCache.students || [];
    else if (role === "founder" || role === "founders") collection = datasetCache.founders || [];

    return collection.find((item) => String(item.id).trim().toLowerCase() === cleanId) || null;
  },

  reloadDatasets: () => {
    return loadDatasets(true);
  },
};

function filterAndPaginate(items, options = {}, searchFields = ["name"]) {
  const {
    search = "",
    industry = "All",
    stage = "All",
    type = "All",
    location = "All",
    sortBy = "name",
    page = 1,
    limit = 20,
  } = options;

  let results = [...items];

  // Search
  if (search && search.trim()) {
    const q = search.trim().toLowerCase();
    results = results.filter((item) => {
      return searchFields.some((field) => {
        const val = item[field];
        if (Array.isArray(val)) {
          return val.some((v) => String(v).toLowerCase().includes(q));
        }
        return String(val || "").toLowerCase().includes(q);
      });
    });
  }

  // Industry filter
  if (industry && industry !== "All" && industry !== "All Industries") {
    const indNorm = industry.toLowerCase();
    results = results.filter((item) => {
      const itemInd = String(item.industry || item.domain || "").toLowerCase();
      const industriesArr = Array.isArray(item.industries) ? item.industries.map((x) => String(x).toLowerCase()) : [];
      return itemInd.includes(indNorm) || industriesArr.some((x) => x.includes(indNorm));
    });
  }

  // Stage filter
  if (stage && stage !== "All" && stage !== "All Stages") {
    const stageNorm = stage.toLowerCase().replace(/[^a-z0-9]/g, "");
    results = results.filter((item) => {
      const itemStage = String(item.fundingStage || item.startupStage || "").toLowerCase().replace(/[^a-z0-9]/g, "");
      const stagesArr = Array.isArray(item.stages) ? item.stages.map((x) => String(x).toLowerCase().replace(/[^a-z0-9]/g, "")) : [];
      return itemStage.includes(stageNorm) || stagesArr.some((x) => x.includes(stageNorm));
    });
  }

  // Type filter
  if (type && type !== "All" && type !== "All Types") {
    const typeNorm = type.toLowerCase().replace(/[^a-z0-9]/g, "");
    results = results.filter((item) => {
      const itemType = String(item.type || item.investorType || "").toLowerCase().replace(/[^a-z0-9]/g, "");
      return itemType.includes(typeNorm);
    });
  }

  // Location filter
  if (location && location !== "All" && location !== "All Locations") {
    const locNorm = location.toLowerCase();
    results = results.filter((item) => {
      return String(item.location || "").toLowerCase().includes(locNorm);
    });
  }

  // Sorting
  results.sort((a, b) => {
    if (sortBy === "name") {
      return String(a.name || "").localeCompare(String(b.name || ""));
    }
    if (sortBy === "funding" || sortBy === "amount") {
      const numA = Number(a.fundingAmount || 0);
      const numB = Number(b.fundingAmount || 0);
      return numB - numA;
    }
    return 0;
  });

  const total = results.length;
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const pageSize = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
  const totalPages = Math.ceil(total / pageSize) || 1;
  const startIndex = (pageNum - 1) * pageSize;
  const paginated = results.slice(startIndex, startIndex + pageSize);

  return {
    items: paginated,
    total,
    page: pageNum,
    limit: pageSize,
    totalPages,
    hasMore: pageNum < totalPages,
  };
}

module.exports = datasetService;
