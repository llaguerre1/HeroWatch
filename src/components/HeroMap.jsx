import React, { useEffect, useMemo, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  ZoomControl,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Crosshair, Globe2, Radio, MapPin, AlertTriangle } from "lucide-react";
import { geocodeCity } from "../services/api.js";
import DayNightOverlay from "./DayNightOverlay";

const cache = new Map();
function missionIcon(hero) {
  const marvel = hero?.biography?.publisher === "Marvel Comics";
  const color = marvel ? "#f35e70" : "#66baff";
  return L.divIcon({
    className: "hero-map-icon",
    html: `<span style="--pin:${color}"><span class="pin-dot"></span></span>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
  });
}
function Camera({ point }) {
  const map = useMap();
  useEffect(() => {
    if (point)
      map.flyTo([point.lat, point.lng], Math.max(map.getZoom(), 6), {
        duration: 1.1,
      });
  }, [map, point]);
  return null;
}
export default function HeroMap({
  missions,
  heroes,
  selectedId,
  onSelectMission,
}) {
  const [locations, setLocations] = useState({});
  const [errors, setErrors] = useState({});
  const [activeId, setActiveId] = useState(null);

  const [showDayNight, setShowDayNight] = useState(true);

  const active = selectedId ?? activeId;
  const cities = useMemo(
    () => [...new Set(missions.map((m) => m.city.trim().toLowerCase()))],
    [missions],
  );
  useEffect(() => {
    let cancelled = false;
    cities.forEach(async (key) => {
      if (cache.has(key)) {
        if (!cancelled) setLocations((p) => ({ ...p, [key]: cache.get(key) }));
        return;
      }
      try {
        const location = await geocodeCity(key);
        cache.set(key, location);
        if (!cancelled) setLocations((p) => ({ ...p, [key]: location }));
      } catch (e) {
        if (!cancelled) setErrors((p) => ({ ...p, [key]: e.message }));
      }
    });
    return () => {
      cancelled = true;
    };
  }, [cities]);
  const plotted = missions
    .map((m) => ({
      ...m,
      hero: heroes.find((h) => h.id === m.heroId),
      point: locations[m.city.trim().toLowerCase()],
    }))
    .filter((m) => m.point);
  const selected = plotted.find((m) => m.id === active);
  return (
    <section className="map-panel" aria-label="Fictional superhero mission map">
      <div className="map-topline">
        <div>
          <span className="eyebrow">
            TACTICAL GEO-SURVEILLANCE / SIMULATION
          </span>
          <h2>
            <Globe2 size={22} /> Global Hero Tracker
          </h2>
        </div>
        <span className="map-live">
          <Radio size={14} /> MISSION FEED
        </span>
      </div>
      <div className="sunlight-controls">
        <button
          type="button"
          className="sunlight-toggle"
          onClick={() => setShowDayNight((prev) => !prev)}
          aria-pressed={showDayNight}
        >
          {showDayNight
            ? "☀️ Sunlight Overlay: ON"
            : "🌙 Sunlight Overlay: OFF"}
        </button>
      </div>
      <div className="map-stage">
        <MapContainer
          center={[35, -20]}
          zoom={2}
          minZoom={2}
          zoomControl={false}
          className="hero-map"
          scrollWheelZoom={true}
        >
          <TileLayer
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />

          <DayNightOverlay visible={showDayNight} />
          <ZoomControl position="bottomright" />

          <Camera point={selected?.point} />
          {plotted.map((m) => (
            <Marker
              key={m.id}
              position={[m.point.lat, m.point.lng]}
              icon={missionIcon(m.hero)}
              eventHandlers={{
                click: () => {
                  setActiveId(m.id);
                  onSelectMission(m);
                },
              }}
            >
              <Popup>
                <div className="hero-popup">
                  <strong>{m.hero?.name || `Hero #${m.heroId}`}</strong>
                  <div>{m.name}</div>
                  <small>{m.point.label}</small>
                  <p>Fictional assigned patrol location</p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
        <div className="hud-corner hud-tl" />
        <div className="hud-corner hud-tr" />
        <div className="hud-corner hud-bl" />
        <div className="hud-corner hud-br" />
        <div className="map-overlay map-overlay-top">
          <Crosshair size={15} /> GRID ACTIVE <span className="map-pulse" />{" "}
          <span>{plotted.length} LOCATIONS PLOTTED</span>
        </div>
        <div className="map-overlay map-overlay-bottom">
          <span>SIMULATION ONLY</span>
          <span>
            ● MARVEL <i className="dc-dot" /> DC
          </span>
        </div>
        {!missions.length && (
          <div className="map-empty">
            <MapPin size={30} />
            <strong>No heroes deployed</strong>
            <span>Create a mission below to place a hero on the map.</span>
          </div>
        )}
      </div>
      <div className="map-hud-bottom">
        <div className="map-roster">
          <span className="eyebrow">FIELD SIGNALS</span>
          <div className="map-signal-list">
            {missions.length ? (
              missions.map((m) => {
                const h = heroes.find((x) => x.id === m.heroId);
                const plottedMission = plotted.find((x) => x.id === m.id);
                return (
                  <button
                    key={m.id}
                    type="button"
                    className={`map-signal ${active === m.id ? "active" : ""}`}
                    onClick={() => {
                      setActiveId(m.id);
                      onSelectMission(m);
                    }}
                  >
                    <span
                      className={`signal-indicator ${h?.biography?.publisher === "Marvel Comics" ? "marvel" : "dc"}`}
                    />
                    <span>
                      <strong>{h?.name || `Hero #${m.heroId}`}</strong>
                      <small>
                        {m.city} · {m.name}
                      </small>
                    </span>
                    <span className="signal-state">
                      {plottedMission
                        ? "LOCATED"
                        : errors[m.city.trim().toLowerCase()]
                          ? "NOT FOUND"
                          : "LOCATING"}
                    </span>
                  </button>
                );
              })
            ) : (
              <p className="muted">
                No active field signals. Deploy a hero to begin.
              </p>
            )}
          </div>
        </div>
        <div className="map-intel">
          <span className="eyebrow">TARGET INTELLIGENCE</span>
          {selected ? (
            <>
              <h3>{selected.hero?.name || "Unknown hero"}</h3>
              <p>
                <MapPin size={14} />
                {selected.point.label}
              </p>
              <strong>{selected.name}</strong>
              <small>
                Assignment coordinates: {selected.point.lat.toFixed(3)},{" "}
                {selected.point.lng.toFixed(3)}
              </small>
            </>
          ) : (
            <>
              <h3>Awaiting selection</h3>
              <p>Choose a signal or map marker to inspect a mission.</p>
            </>
          )}
          <div className="map-disclaimer">
            <AlertTriangle size={14} /> Locations are user-assigned, not
            real-time hero sightings.
          </div>
        </div>
      </div>
    </section>
  );
}
