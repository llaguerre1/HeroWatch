
import React from "react";

export default function WireframeGlobe() {
  const meridians = Array.from({ length: 12 }, (_, i) => i * 15);
  const latitudes = [-60, -30, 0, 30, 60];

  return (
    <div className="hud-globe" aria-hidden="true">
      <div className="globe-sphere">
        <div className="globe-grid">
          {meridians.map(angle => (
            <div
              key={angle}
              className="globe-meridian"
              style={{ transform: `rotateY(${angle}deg)` }}
            />
          ))}

          {latitudes.map(latitude => (
            <div
              key={latitude}
              className="globe-latitude"
              style={{
                top: `${50 - Math.sin(latitude * Math.PI / 180) * 50}%`,
                width: `${Math.cos(latitude * Math.PI / 180) * 100}%`,
                height: `${Math.cos(latitude * Math.PI / 180) * 100}%`,
                transform: "translate(-50%, -50%) rotateX(90deg)"
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
