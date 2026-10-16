import React, { useEffect, useMemo, useState } from "react";
import {
  Shield,
  Search,
  Users,
  Radar,
  Target,
  X,
  MapPin,
  Plus,
  Trash2,
  Activity,
  Menu,
} from "lucide-react";
import HeroCard from "./components/HeroCard.jsx";
import WeatherWidget from "./components/WeatherWidget.jsx";
import HeroMap from "./components/HeroMap.jsx";
import { getHeroes } from "./services/api.js";

import { cleanHeroData } from "./characterOverrides.js";

import WireframeGlobe from "./components/WireFrameGlobe.jsx";

const readStorage = (key, fallback) => {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
};
const initialTracked = () => readStorage("herowatch-tracked", []);
const initialMissions = () => readStorage("herowatch-missions", []);
const stats = [
  "intelligence",
  "strength",
  "speed",
  "durability",
  "power",
  "combat",
];
const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);
function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="stat-card">
      <div className="stat-icon">
        <Icon size={20} />
      </div>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </div>
  );
}
function HeroDetails({ hero, tracked, onClose, onToggleTrack }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="dossier"
        role="dialog"
        aria-modal="true"
        aria-label={`${hero.name} dossier`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="modal-close"
          onClick={onClose}
          aria-label="Close dossier"
        >
          <X />
        </button>
        <div className="dossier-layout">
          <img
            className="dossier-image"
            src={hero.images?.lg || hero.images?.md}
            alt={hero.name}
          />
          <div className="dossier-info">
            <span className="eyebrow">CLASSIFIED HERO DOSSIER</span>
            <h2>{hero.name}</h2>
            <p className="muted">
              {hero.biography?.fullName || "Identity unknown"} ·{" "}
              {hero.biography?.publisher || "Independent"}
            </p>
            <div className="dossier-tags">
              <span>{hero.biography?.alignment || "unknown"} alignment</span>
              <span>{hero.work?.occupation || "Occupation unknown"}</span>
            </div>
            <h3>Power analysis</h3>
            {stats.map((stat) => (
              <div className="power-row" key={stat}>
                <div>
                  <span>{capitalize(stat)}</span>
                  <strong>{hero.powerstats?.[stat] ?? 0}</strong>
                </div>
                <div className="power-track">
                  <div
                    style={{
                      width: `${Math.min(100, Math.max(0, Number(hero.powerstats?.[stat]) || 0))}%`,
                    }}
                  />
                </div>
              </div>
            ))}
            <button
              className="btn btn-primary wide"
              onClick={() => onToggleTrack(hero.id)}
            >
              {tracked ? "Remove from tracking" : "Add to tracked heroes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
export default function App() {
  const [heroes, setHeroes] = useState([]),
    [loading, setLoading] = useState(true),
    [error, setError] = useState("");
  const [search, setSearch] = useState(""),
    [universe, setUniverse] = useState("All"),
    [page, setPage] = useState("database"),
    [selected, setSelected] = useState(null);
  const [heroPage, setHeroPage] = useState(1);
  const [powerStat, setPowerStat] = useState("all");
  const [minPower, setMinPower] = useState(0);

  const HEROES_PER_PAGE = 36;
  const [tracked, setTracked] = useState(initialTracked),
    [missions, setMissions] = useState(initialMissions);
  const [missionHero, setMissionHero] = useState(""),
    [city, setCity] = useState("New York"),
    [missionName, setMissionName] = useState("Neighborhood patrol"),
    [formError, setFormError] = useState("");

  const [weatherCity, setWeatherCity] = useState(""),
    [mobileNav, setMobileNav] = useState(false);
  const [focusedMission, setFocusedMission] = useState(null);

  useEffect(() => {
    getHeroes()
      .then((data) => {
        const cleanedHeroes = cleanHeroData(data);
        setHeroes(cleanedHeroes);
      })
      .catch((error) => setError(error.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    localStorage.setItem("herowatch-tracked", JSON.stringify(tracked));
  }, [tracked]);
  useEffect(() => {
    localStorage.setItem("herowatch-missions", JSON.stringify(missions));
  }, [missions]);
  const trackedSet = useMemo(() => new Set(tracked), [tracked]);

  const filteredHeroes = useMemo(() => {
    return heroes.filter((hero) => {
      const matchesUniverse =
        universe === "All" || hero.biography?.publisher === universe;

      const matchesSearch = hero.name
        .toLowerCase()
        .includes(search.trim().toLowerCase());

      const matchesPower =
        powerStat === "all" ||
        Number(hero.powerstats?.[powerStat] ?? 0) >= minPower;

      return matchesUniverse && matchesSearch && matchesPower;
    });
  }, [heroes, universe, search, powerStat, minPower]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredHeroes.length / HEROES_PER_PAGE),
  );

  const filtered = useMemo(() => {
    const start = (heroPage - 1) * HEROES_PER_PAGE;
    return filteredHeroes.slice(start, start + HEROES_PER_PAGE);
  }, [filteredHeroes, heroPage]);

  useEffect(() => {
    setHeroPage(1);
  }, [search, universe, powerStat, minPower]);
  const trackedHeroes = useMemo(
    () => heroes.filter((h) => trackedSet.has(h.id)),
    [heroes, trackedSet],
  );
  const toggleTrack = (id) =>
    setTracked((old) =>
      old.includes(id) ? old.filter((x) => x !== id) : [...old, id],
    );
  const createMission = (e) => {
    e.preventDefault();
    if (!missionHero || !city.trim() || !missionName.trim()) {
      setFormError("Choose a hero, mission name, and city.");
      return;
    }
    const mission = {
      id: globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`,
      heroId: Number(missionHero),
      city: city.trim(),
      name: missionName.trim(),
      createdAt: new Date().toISOString(),
    };
    setMissions((old) => [mission, ...old]);
    setWeatherCity(mission.city);
    setFocusedMission(mission.id);
    setFormError("");
    setMissionName("Neighborhood patrol");
  };
  const nav = [
    ["database", "Hero Database", Search],
    ["tracked", "Tracked Heroes", Users],
    ["missions", "Mission Control", Target],
  ];
  const changePage = (next) => {
    setPage(next);
    setMobileNav(false);
  };
  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileNav ? "open" : ""}`}>
        <div className="brand">
          <div className="brand-mark">
            <Shield size={24} />
          </div>
          <div>
            <strong>HEROWATCH</strong>
            <span>INTELLIGENCE NETWORK</span>
          </div>
        </div>
        <p className="nav-label">OPERATIONS</p>
        <nav aria-label="Main navigation">
          {nav.map(([key, label, Icon]) => (
            <button
              key={key}
              className={`nav-link ${page === key ? "selected" : ""}`}
              onClick={() => changePage(key)}
            >
              <Icon size={18} />
              {label}
              {key === "tracked" && (
                <span className="nav-count">{tracked.length}</span>
              )}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="online-dot" /> SYSTEM OPERATIONAL{" "}
          <p>HeroWatch v1.0 · Intelligence console</p>
        </div>
      </aside>
      <div className="main-area">
        <header className="topbar">
          <button
            className="mobile-menu ghost-icon"
            onClick={() => setMobileNav((v) => !v)}
            aria-label="Toggle menu"
          >
            <Menu />
          </button>
          <div>
            <span className="eyebrow">HERO INTELLIGENCE NETWORK</span>
            <h1>
              {page === "database"
                ? "Command Center"
                : page === "tracked"
                  ? "Tracked Heroes"
                  : "Mission Control"}
            </h1>
          </div>
          <span className="status-pill">
            <span className="online-dot" /> SIMULATED TRACKING ONLINE
          </span>
        </header>
        <main className="content">
          <section className="welcome">
            <div>
              <span className="eyebrow">OPERATIONS DASHBOARD / LIVE</span>
              <h2>
                Welcome to <em>HeroWatch.</em>
              </h2>
              <p>
                Explore Marvel and DC characters. Assemble your roster.
                Coordinate missions.
              </p>
            </div>
            <div className="welcome-shield">
              <WireframeGlobe />
            </div>
          </section>
          <div className="stats-grid">
            <StatCard
              icon={Users}
              label="DATABASE HEROES"
              value={loading ? "—" : heroes.length}
            />
            <StatCard
              icon={Radar}
              label="TRACKED HEROES"
              value={tracked.length}
            />
            <StatCard
              icon={Target}
              label="ACTIVE MISSIONS"
              value={missions.length}
            />
          </div>
          {page === "database" && (
            <section className="panel">
              <div className="section-head">
                <div>
                  <span className="eyebrow">INTELLIGENCE ARCHIVE</span>
                  <h2>Hero Database</h2>
                </div>
                <span className="count-label">
                  {filteredHeroes.length} matches · Page {heroPage} of{" "}
                  {totalPages}
                </span>
              </div>
              <div
                className="universe-tabs"
                role="group"
                aria-label="Filter comic universe"
              >
                {[
                  ["All", "All Heroes"],
                  ["Marvel Comics", "Marvel"],
                  ["DC Comics", "DC"],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    className={`universe-tab ${universe === value ? "active" : ""}`}
                    aria-pressed={universe === value}
                    onClick={() => setUniverse(value)}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <label className="search-box">
                <Search size={19} />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search heroes by name..."
                  aria-label="Search heroes"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    aria-label="Clear search"
                  >
                    <X size={17} />
                  </button>
                )}
              </label>

              <div className="power-filters">
                <label>
                  Power Stat
                  <select
                    value={powerStat}
                    onChange={(e) => {
                      setPowerStat(e.target.value);
                      setHeroPage(1);
                    }}
                  >
                    <option value="all">All Power Stats</option>

                    {stats.map((stat) => (
                      <option key={stat} value={stat}>
                        {capitalize(stat)}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Minimum Score
                  <select
                    value={minPower}
                    disabled={powerStat === "all"}
                    onChange={(e) => {
                      setMinPower(Number(e.target.value));
                      setHeroPage(1);
                    }}
                  >
                    <option value={0}>Any Score</option>
                    <option value={50}>50+</option>
                    <option value={75}>75+</option>
                    <option value={90}>90+</option>
                    <option value={100}>100 Only</option>
                  </select>
                </label>
              </div>

              {loading ? (
                <div className="empty-state">
                  <Activity className="spin" /> Loading hero intelligence...
                </div>
              ) : error ? (
                <div className="empty-state error">
                  {error}
                  <button
                    className="btn btn-secondary"
                    onClick={() => window.location.reload()}
                  >
                    Retry
                  </button>
                </div>
              ) : filtered.length ? (
                <>
                  <div className="hero-grid">
                    {filtered.map((hero) => (
                      <HeroCard
                        key={hero.id}
                        hero={hero}
                        tracked={trackedSet.has(hero.id)}
                        onSelect={setSelected}
                        onToggleTrack={toggleTrack}
                      />
                    ))}
                  </div>

                  <div className="hero-pagination">
                    <button
                      type="button"
                      disabled={heroPage === 1}
                      onClick={() => setHeroPage((p) => Math.max(1, p - 1))}
                    >
                      ← Previous
                    </button>

                    <span>
                      Page {heroPage} of {totalPages}
                    </span>

                    <button
                      type="button"
                      disabled={heroPage >= totalPages}
                      onClick={() =>
                        setHeroPage((p) => Math.min(totalPages, p + 1))
                      }
                    >
                      Next →
                    </button>
                  </div>
                </>
              ) : (
                <div className="empty-state">
                  No characters match your search or power filters.
                </div>
              )}
            </section>
          )}
          {page === "tracked" && (
            <section className="panel">
              <div className="section-head">
                <div>
                  <span className="eyebrow">YOUR PERSONAL ROSTER</span>
                  <h2>Tracked Heroes</h2>
                </div>
                <span className="count-label">
                  {trackedHeroes.length} agents
                </span>
              </div>
              {trackedHeroes.length ? (
                <div className="hero-grid">
                  {trackedHeroes.map((hero) => (
                    <HeroCard
                      key={hero.id}
                      hero={hero}
                      tracked
                      onSelect={setSelected}
                      onToggleTrack={toggleTrack}
                    />
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <Users size={34} />
                  <h3>No heroes tracked yet</h3>
                  <p>
                    Find a hero in the database and click + to add them to your
                    roster.
                  </p>
                  <button
                    className="btn btn-primary"
                    onClick={() => changePage("database")}
                  >
                    Explore heroes
                  </button>
                </div>
              )}
            </section>
          )}
          {page === "missions" && (
            <>
              <HeroMap
                missions={missions}
                heroes={heroes}
                selectedId={focusedMission}
                onSelectMission={(m) => {
                  setFocusedMission(m.id);
                  setWeatherCity(m.city);
                }}
              />
              <div className="mission-layout">
                <section className="panel">
                  <div className="section-head">
                    <div>
                      <span className="eyebrow">FIELD OPERATIONS</span>
                      <h2>Deploy a Mission</h2>
                    </div>
                  </div>
                  <form className="mission-form" onSubmit={createMission}>
                    <label>
                      Assigned hero
                      <select
                        value={missionHero}
                        onChange={(e) => setMissionHero(e.target.value)}
                      >
                        <option value="">Select tracked hero</option>
                        {trackedHeroes.map((h) => (
                          <option value={h.id} key={h.id}>
                            {h.name}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Mission name
                      <input
                        value={missionName}
                        onChange={(e) => setMissionName(e.target.value)}
                        maxLength={80}
                        placeholder="Mission name"
                      />
                    </label>
                    <label>
                      Patrol city
                      <input
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        maxLength={80}
                        placeholder="e.g. Boston"
                      />
                    </label>
                    {formError && <p className="error">{formError}</p>}
                    <button className="btn btn-primary wide" type="submit">
                      <Plus size={17} /> Create mission
                    </button>
                    {!trackedHeroes.length && (
                      <p className="muted small">
                        Track at least one hero before assigning a mission.
                      </p>
                    )}
                  </form>
                </section>
                <section className="panel weather-panel">
                  <WeatherWidget city={weatherCity} />
                </section>
                <section className="panel mission-list-panel">
                  <div className="section-head">
                    <div>
                      <span className="eyebrow">MISSION LOG</span>
                      <h2>Active Missions</h2>
                    </div>
                    <span className="count-label">
                      {missions.length} deployed
                    </span>
                  </div>
                  {missions.length ? (
                    missions.map((m) => {
                      const hero = heroes.find((h) => h.id === m.heroId);
                      return (
                        <div className="mission-item" key={m.id}>
                          <div className="mission-avatar">
                            {hero?.images?.xs ? (
                              <img src={hero.images.xs} alt="" />
                            ) : (
                              <Shield size={20} />
                            )}
                          </div>
                          <div className="mission-details">
                            <strong>{m.name}</strong>
                            <span>
                              {hero?.name || `Hero #${m.heroId}`} ·{" "}
                              <MapPin size={12} />
                              {m.city}
                            </span>
                          </div>
                          <button
                            className="ghost-icon"
                            onClick={() => {
                              setWeatherCity(m.city);
                              setFocusedMission(m.id);
                            }}
                            title="View city weather"
                            aria-label={`View weather for ${m.city}`}
                          >
                            <Activity size={17} />
                          </button>
                          <button
                            className="ghost-icon danger"
                            onClick={() =>
                              setMissions((old) =>
                                old.filter((x) => x.id !== m.id),
                              )
                            }
                            title="Complete mission"
                            aria-label={`Complete mission ${m.name}`}
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      );
                    })
                  ) : (
                    <div className="empty-state">
                      <Target size={32} />
                      <p>No active missions. Deploy your first patrol above.</p>
                    </div>
                  )}
                </section>
              </div>
            </>
          )}
        </main>
        <footer className="footer">
          HEROWATCH © {new Date().getFullYear()} · Hero data: Akabab · Map:
          OpenStreetMap · Geocoding/weather: Open-Meteo · All hero locations are
          fictional assignments.
        </footer>
      </div>
      {selected && (
        <HeroDetails
          hero={selected}
          tracked={trackedSet.has(selected.id)}
          onClose={() => setSelected(null)}
          onToggleTrack={toggleTrack}
        />
      )}
    </div>
  );
}
