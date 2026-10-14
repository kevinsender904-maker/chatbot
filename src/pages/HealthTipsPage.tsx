import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";
import { recordTipView, toggleTipBookmark, fetchUserTipsHistory } from "../services/tipsStorage";
import { HealthTipHistory } from "../types";
import {
  Leaf,
  Apple,
  Brain,
  Activity,
  Droplets,
  Moon,
  Bookmark,
  BookmarkCheck,
  History,
  Clock,
  ShieldCheck,
  Sun,
  Smile,
  Search,
  CheckCircle2,
  X,
  Sparkles,
} from "lucide-react";

interface TipItem {
  id: string;
  icon: any;
  title: string;
  category: "Wellness" | "Preventive Care" | "Lifestyle";
  summary: string;
  description: string;
  practicalSteps: string[];
  evidenceBenefit: string;
  color: string;
  bg: string;
  border: string;
}

const HEALTH_TIPS: TipItem[] = [
  // 1. WELLNESS
  {
    id: "wellness-sleep",
    icon: Moon,
    title: "Restorative Sleep Hygiene",
    category: "Wellness",
    summary: "Target 7–9 hours of deep, consistent sleep to restore neurological balance and immune defense.",
    description:
      "Deep slow-wave sleep and REM cycles facilitate cellular autophagy, memory consolidation, and cytokine synthesis. Poor sleep disrupts glucose metabolism and elevates cortisol.",
    practicalSteps: [
      "Keep a consistent sleep-wake schedule 7 days a week.",
      "Avoid blue light screens and heavy meals 90 minutes before bed.",
      "Maintain a cool, dark sleeping environment (ideally 65–68°F / 18–20°C).",
    ],
    evidenceBenefit: "Decreases systemic inflammation and reduces risk of cardiovascular events by up to 25%.",
    color: "text-indigo-600",
    bg: "bg-indigo-50",
    border: "border-indigo-100",
  },
  {
    id: "wellness-hydration",
    icon: Droplets,
    title: "Cellular Hydration & Electrolytes",
    category: "Wellness",
    summary: "Drink 2–3 liters of clean water daily, adjusting for climate, exercise, and metabolism.",
    description:
      "Adequate hydration preserves renal clearance, lubricates joint cartilage, and maintains optimal blood viscosity and cognitive focus.",
    practicalSteps: [
      "Drink a large glass of water immediately upon waking.",
      "Include electrolyte-rich whole foods like cucumbers, celery, and citrus.",
      "Monitor urine color: aim for pale straw-colored clarity.",
    ],
    evidenceBenefit: "Optimizes cognitive processing speed, prevents tension headaches, and supports kidney filtration.",
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-100",
  },
  {
    id: "wellness-mindfulness",
    icon: Brain,
    title: "Stress Regulation & Breathwork",
    category: "Wellness",
    summary: "Practice intentional vagal nerve stimulation using slow paced diaphragmatic breathing.",
    description:
      "Chronic sympathetic hyperactivity elevates blood pressure and exhausts adrenal regulation. Paced breathing activates the parasympathetic 'rest-and-digest' state.",
    practicalSteps: [
      "Practice 5 minutes of 4-7-8 breathing when stress levels rise.",
      "Take 10-minute quiet walking breaks without digital stimulation.",
      "Incorporate progressive muscle relaxation before bed.",
    ],
    evidenceBenefit: "Clinically reduces resting heart rate and lowers salivary cortisol biomarkers.",
    color: "text-purple-600",
    bg: "bg-purple-50",
    border: "border-purple-100",
  },

  // 2. PREVENTIVE CARE
  {
    id: "preventive-screenings",
    icon: ShieldCheck,
    title: "Routine Health Screenings",
    category: "Preventive Care",
    summary: "Undergo age- and risk-appropriate clinical evaluations and blood panels every 12 months.",
    description:
      "Early detection of asymptomatic hypertension, hyperlipidemia, and prediabetes allows non-invasive lifestyle interventions before chronic damage develops.",
    practicalSteps: [
      "Track blood pressure at least twice a year (target < 120/80 mmHg).",
      "Check fasting lipid panel and HbA1c annually if over age 30 or indicated.",
      "Stay current with evidence-backed cancer screenings (colon, breast, cervical, skin).",
    ],
    evidenceBenefit: "Early detection accounts for significant reductions in long-term morbidity across chronic metabolic conditions.",
    color: "text-teal-600",
    bg: "bg-teal-50",
    border: "border-teal-100",
  },
  {
    id: "preventive-immunization",
    icon: Leaf,
    title: "Immunization & Immune Preparedness",
    category: "Preventive Care",
    summary: "Keep recommended annual immunizations up to date according to national public health guidance.",
    description:
      "Vaccinations bolster neutralizing antibodies and T-cell memory, protecting both the individual and vulnerable community members against severe respiratory illness.",
    practicalSteps: [
      "Receive annual influenza and updated seasonal booster vaccines.",
      "Verify tetanus (Tdap) booster every 10 years.",
      "Consult your physician regarding pneumonia and shingles vaccines if over age 50.",
    ],
    evidenceBenefit: "Drastically lowers hospitalization and complication rates from seasonal infectious diseases.",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-100",
  },
  {
    id: "preventive-dental",
    icon: Smile,
    title: "Oral & Periodontal Health",
    category: "Preventive Care",
    summary: "Maintain daily flossing and bi-annual dental prophylaxis to protect cardiovascular health.",
    description:
      "Periodontal bacteremia triggers systemic low-grade arterial inflammation and is directly correlated with atherosclerosis and heart disease.",
    practicalSteps: [
      "Brush twice daily with fluoride or hydroxyapatite toothpaste for 2 full minutes.",
      "Floss daily to remove interdental pathogenic biofilm.",
      "Schedule professional cleanings every 6 months.",
    ],
    evidenceBenefit: "Significantly decreases systemic C-reactive protein (CRP) and reduces bacterial endocarditis risks.",
    color: "text-cyan-600",
    bg: "bg-cyan-50",
    border: "border-cyan-100",
  },

  // 3. LIFESTYLE
  {
    id: "lifestyle-movement",
    icon: Activity,
    title: "Cardiorespiratory & Resistance Training",
    category: "Lifestyle",
    summary: "Aim for 150 minutes of moderate aerobic exercise and 2 resistance training sessions weekly.",
    description:
      "Aerobic conditioning preserves vascular elasticity, while lean muscle mass acts as a metabolic glucose sink and protects joint integrity into older age.",
    practicalSteps: [
      "Brisk walk or cycle for 30 minutes 5 days per week.",
      "Engage major muscle groups with bodyweight or resistance twice a week.",
      "Break up prolonged sedentary desk time every 45 minutes.",
    ],
    evidenceBenefit: "Associated with a 30% reduction in all-cause mortality and improved insulin sensitivity.",
    color: "text-rose-600",
    bg: "bg-rose-50",
    border: "border-rose-100",
  },
  {
    id: "lifestyle-nutrition",
    icon: Apple,
    title: "Whole-Food Mediterranean Diet",
    category: "Lifestyle",
    summary: "Base dietary intake on colorful vegetables, extra virgin olive oil, legumes, and lean proteins.",
    description:
      "Diets rich in polyphenols and dietary soluble fiber cultivate an anti-inflammatory gut microbiome and stabilize blood glucose curves.",
    practicalSteps: [
      "Aim for 30+ grams of dietary fiber daily from diverse plant sources.",
      "Substitute saturated fats and processed seed oils with extra virgin olive oil.",
      "Limit ultra-processed snacks and added sugars to under 25g daily.",
    ],
    evidenceBenefit: "Proven to lower LDL cholesterol, reduce stroke risk, and enhance gut microbiome diversity.",
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-100",
  },
  {
    id: "lifestyle-sunlight",
    icon: Sun,
    title: "Circadian Sunlight & Ergonomics",
    category: "Lifestyle",
    summary: "Get 15–20 minutes of morning daylight and optimize your daily physical posture.",
    description:
      "Morning photons trigger retinal ganglion cells to set your central circadian master clock (SCN) and stimulate endogenous Vitamin D synthesis.",
    practicalSteps: [
      "Step outside into natural morning light within 1 hour of waking.",
      "Position workstation monitors at eye level to prevent cervical spine strain.",
      "Take micro-stretch breaks for shoulders, hamstrings, and lower back.",
    ],
    evidenceBenefit: "Regulates nocturnal melatonin onset and reduces chronic postural musculo-skeletal pain.",
    color: "text-orange-600",
    bg: "bg-orange-50",
    border: "border-orange-100",
  },
];

export default function HealthTipsPage() {
  const { user } = useAuth();
  const activeUserId = user?.id || "guest-user";

  const [bookmarkedTips, setBookmarkedTips] = useState<Record<string, boolean>>({});
  const [history, setHistory] = useState<HealthTipHistory[]>([]);
  const [activeTab, setActiveTab] = useState<"all" | "saved" | "history">("all");
  const [selectedCategory, setSelectedCategory] = useState<"All" | "Wellness" | "Preventive Care" | "Lifestyle">("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTip, setSelectedTip] = useState<TipItem | null>(null);

  useEffect(() => {
    async function loadHistory() {
      const hist = await fetchUserTipsHistory(activeUserId);
      setHistory(hist);
      const bookmarks: Record<string, boolean> = {};
      hist.forEach((h) => {
        if (h.bookmarked) bookmarks[h.tip_id] = true;
      });
      setBookmarkedTips(bookmarks);
    }
    loadHistory();
  }, [activeUserId]);

  const handleOpenTip = async (tip: TipItem) => {
    setSelectedTip(tip);
    await recordTipView(activeUserId, tip.id, tip.title, tip.category);
    const updatedHist = await fetchUserTipsHistory(activeUserId);
    setHistory(updatedHist);
  };

  const handleToggleBookmark = async (e: React.MouseEvent, tip: TipItem) => {
    e.stopPropagation();
    const current = !!bookmarkedTips[tip.id];
    const newStatus = !current;
    setBookmarkedTips((prev) => ({ ...prev, [tip.id]: newStatus }));
    await toggleTipBookmark(activeUserId, tip.id, tip.title, tip.category);
    const updatedHist = await fetchUserTipsHistory(activeUserId);
    setHistory(updatedHist);
  };

  const filteredTips = HEALTH_TIPS.filter((tip) => {
    if (selectedCategory !== "All" && tip.category !== selectedCategory) return false;
    if (activeTab === "saved" && !bookmarkedTips[tip.id]) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        tip.title.toLowerCase().includes(q) ||
        tip.summary.toLowerCase().includes(q) ||
        tip.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <Layout>
      <div className="flex-1 overflow-y-auto px-4 py-8 md:p-12 bg-[#F1F5F9]">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-widest mb-1.5">
                <Sparkles className="w-4 h-4" />
                Evidence-Based Guidance
              </div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Health & Wellness Tips</h1>
              <p className="text-slate-500 mt-2 text-sm max-w-2xl">
                Explore actionable medical and lifestyle guidance across <strong>Wellness</strong>, <strong>Preventive Care</strong>, and <strong>Lifestyle</strong>. Track reads and bookmarks in Supabase.
              </p>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200 shadow-xs self-start md:self-auto">
              <button
                onClick={() => setActiveTab("all")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  activeTab === "all" ? "bg-slate-900 text-white" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Browse All ({HEALTH_TIPS.length})
              </button>
              <button
                onClick={() => setActiveTab("saved")}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  activeTab === "saved" ? "bg-slate-900 text-white" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Bookmark className="w-3.5 h-3.5" />
                Saved ({Object.values(bookmarkedTips).filter(Boolean).length})
              </button>
              <button
                onClick={() => setActiveTab("history")}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  activeTab === "history" ? "bg-slate-900 text-white" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <History className="w-3.5 h-3.5" />
                History ({history.length})
              </button>
            </div>
          </div>

          {activeTab !== "history" ? (
            <>
              {/* Pillar Category Filter & Search Bar */}
              <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white p-3 md:p-4 rounded-2xl border border-slate-200 shadow-xs">
                {/* 3 Explicit Pillars Requested: Wellness, Preventive Care, Lifestyle */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-2 shrink-0">
                    Category:
                  </span>
                  {(["All", "Wellness", "Preventive Care", "Lifestyle"] as const).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-colors ${
                        selectedCategory === cat
                          ? "bg-blue-600 text-white shadow-xs"
                          : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <div className="relative min-w-[240px]">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search tips..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Tips Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTips.map((tip) => {
                  const Icon = tip.icon;
                  const isBookmarked = !!bookmarkedTips[tip.id];

                  return (
                    <div
                      key={tip.id}
                      onClick={() => handleOpenTip(tip)}
                      className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group cursor-pointer relative overflow-hidden"
                    >
                      <div>
                        <div className="flex items-start justify-between mb-4">
                          <div
                            className={`w-12 h-12 rounded-xl flex items-center justify-center ${tip.bg} ${tip.border} border`}
                          >
                            <Icon className={`w-6 h-6 ${tip.color}`} />
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                tip.category === "Wellness"
                                  ? "bg-purple-100 text-purple-700"
                                  : tip.category === "Preventive Care"
                                  ? "bg-teal-100 text-teal-700"
                                  : "bg-amber-100 text-amber-700"
                              }`}
                            >
                              {tip.category}
                            </span>
                            <button
                              onClick={(e) => handleToggleBookmark(e, tip)}
                              className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-50 transition-colors"
                              title={isBookmarked ? "Remove Bookmark" : "Save Tip"}
                            >
                              {isBookmarked ? (
                                <BookmarkCheck className="w-4 h-4 text-blue-600" />
                              ) : (
                                <Bookmark className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </div>

                        <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors text-base mb-2">
                          {tip.title}
                        </h3>
                        <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                          {tip.summary}
                        </p>
                      </div>

                      <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-blue-600 group-hover:translate-x-0.5 transition-transform">
                        <span>Read clinical details →</span>
                        <span className="text-[10px] text-slate-400 font-normal">Click to expand</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {filteredTips.length === 0 && (
                <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
                  <p className="text-slate-500 text-sm">No tips match your active filters.</p>
                  <button
                    onClick={() => {
                      setSelectedCategory("All");
                      setActiveTab("all");
                      setSearchQuery("");
                    }}
                    className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold"
                  >
                    Reset Filters
                  </button>
                </div>
              )}
            </>
          ) : (
            /* History View */
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Your Health Tips History</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Persisted in Supabase <code className="font-mono">health_tips_history</code> table for user {activeUserId}.
                  </p>
                </div>
              </div>

              <div className="divide-y divide-slate-100">
                {history.map((h) => (
                  <div key={h.id} className="p-4 md:px-6 flex items-center justify-between hover:bg-slate-50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                        <Clock className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">{h.tip_title}</p>
                        <p className="text-[10px] text-slate-400">
                          Viewed {new Date(h.viewed_at).toLocaleString()} • Category: {h.category || "General"}
                        </p>
                      </div>
                    </div>
                    {h.bookmarked && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                        <BookmarkCheck className="w-3 h-3" /> Bookmarked
                      </span>
                    )}
                  </div>
                ))}
                {history.length === 0 && (
                  <div className="p-8 text-center text-xs text-slate-400">
                    You haven't viewed any health tips yet. Browse above to start building your health library!
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Modal / Expanded Details */}
          {selectedTip && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
              <div className="bg-white rounded-3xl max-w-xl w-full p-6 md:p-8 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
                <button
                  onClick={() => setSelectedTip(null)}
                  className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${selectedTip.bg}`}>
                    <selectedTip.icon className={`w-6 h-6 ${selectedTip.color}`} />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {selectedTip.category} Pillar
                    </span>
                    <h2 className="text-xl font-bold text-slate-900">{selectedTip.title}</h2>
                  </div>
                </div>

                <div className="space-y-4 text-xs text-slate-700 mt-6">
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="font-semibold text-slate-900 leading-relaxed">{selectedTip.description}</p>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-2">
                      Practical Implementation:
                    </h4>
                    <div className="space-y-2">
                      {selectedTip.practicalSteps.map((step, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span className="leading-relaxed">{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900">
                    <span className="font-bold">Clinical Benefit: </span>
                    {selectedTip.evidenceBenefit}
                  </div>
                </div>

                <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={(e) => handleToggleBookmark(e, selectedTip)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 hover:bg-slate-50 transition-colors"
                  >
                    {bookmarkedTips[selectedTip.id] ? (
                      <>
                        <BookmarkCheck className="w-4 h-4 text-blue-600" />
                        Bookmarked
                      </>
                    ) : (
                      <>
                        <Bookmark className="w-4 h-4 text-slate-500" />
                        Save to Bookmarks
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => setSelectedTip(null)}
                    className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
