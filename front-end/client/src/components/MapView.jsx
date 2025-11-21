import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";



// Fix for default marker icons in Leaflet
delete (L.Icon.Default.prototype)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

export function MapView({ latitude, longitude, markerLabel, className = "", zoom = 13  }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Initialize map
    const map = L.map(mapRef.current).setView([latitude, longitude], zoom);

    // Add OpenStreetMap tiles
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    // Add marker
    const marker = L.marker([latitude, longitude]).addTo(map);
    
    if (markerLabel) {
      marker.bindPopup(markerLabel).openPopup();
    }

    mapInstanceRef.current = map;

    // Cleanup
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update map view when coordinates change
  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([latitude, longitude], zoom);
      
      // Clear existing markers
      mapInstanceRef.current.eachLayer((layer) => {
        if (layer instanceof L.Marker) {
          mapInstanceRef.current?.removeLayer(layer);
        }
      });

      // Add new marker
      const marker = L.marker([latitude, longitude]).addTo(mapInstanceRef.current);
      if (markerLabel) {
        marker.bindPopup(markerLabel).openPopup();
      }
    }
  }, [latitude, longitude, markerLabel, zoom]);

  return <div ref={mapRef} className={`w-full h-full ${className}`} data-testid="map-view" />;
}
