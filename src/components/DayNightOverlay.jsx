
import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import Terminator from "@joergdietrich/leaflet.terminator";

export default function DayNightOverlay({ visible = true }) {
  const map = useMap();

  useEffect(() => {
    if (!visible) return;

    const terminator = new Terminator({
      fillColor: "#090d23",
      fillOpacity: 0.48,
      color: "#818cf8",
      weight: 1,
      interactive: false,
    });

    terminator.addTo(map);

    const interval = setInterval(() => {
      terminator.setTime(new Date());
    }, 60000);

    return () => {
      clearInterval(interval);
      map.removeLayer(terminator);
    };
  }, [map, visible]);

  return null;
}
