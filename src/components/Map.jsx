import React, { useEffect, useRef } from 'react';

const Map = ({ 
  pickup = null, 
  dropoff = null, 
  center = [-1.984, 134.189], // Nabire, Papua default
  zoom = 13,
  height = '100%',
  onLocationSelect = null
}) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const scriptLoadedRef = useRef(false);

  useEffect(() => {
    if (!mapRef.current || scriptLoadedRef.current) return;

    // Load Leaflet CSS
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css';
      document.head.appendChild(link);
    }

    // Load Leaflet JS
    if (!window.L) {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js';
      script.onload = () => {
        // Fix marker icons
        delete window.L.Icon.Default.prototype._getIconUrl;
        window.L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        });

        // Initialize map
        if (mapRef.current && !mapInstanceRef.current) {
          mapInstanceRef.current = window.L.map(mapRef.current).setView(center, zoom);

          // Add tile layer
          window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19,
            maxNativeZoom: 18,
          }).addTo(mapInstanceRef.current);

          // Add click event to map
          mapInstanceRef.current.on('click', (e) => {
            if (onLocationSelect) {
              onLocationSelect({
                lat: e.latlng.lat,
                lng: e.latlng.lng,
              });
            }
          });

          scriptLoadedRef.current = true;
          updateMarkers();
        }
      };
      document.head.appendChild(script);
    } else {
      // Leaflet already loaded
      if (mapRef.current && !mapInstanceRef.current) {
        mapInstanceRef.current = window.L.map(mapRef.current).setView(center, zoom);

        window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19,
          maxNativeZoom: 18,
        }).addTo(mapInstanceRef.current);

        mapInstanceRef.current.on('click', (e) => {
          if (onLocationSelect) {
            onLocationSelect({
              lat: e.latlng.lat,
              lng: e.latlng.lng,
            });
          }
        });

        scriptLoadedRef.current = true;
        updateMarkers();
      }
    }

    const updateMarkers = () => {
      if (!mapInstanceRef.current || !window.L) return;

      // Remove old markers
      mapInstanceRef.current.eachLayer((layer) => {
        if (layer instanceof window.L.Marker) {
          layer.remove();
        }
      });

      const getCoords = (location) => {
        if (typeof location === 'string') {
          if (location.includes('Oyehe') || location.includes('Nabire')) {
            return [-1.984, 134.189];
          }
          if (location.includes('Kartini')) {
            return [-1.982, 134.190];
          }
          if (location.includes('Mal')) {
            return [-1.985, 134.188];
          }
          return [-1.984, 134.189];
        }
        return location;
      };

      // Add pickup marker (blue)
      if (pickup) {
        const coords = getCoords(pickup);
        const blueIcon = window.L.icon({
          iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDQwIDQwIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIxOCIgZmlsbD0iIzIyYzU1ZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIyIi8+PC9zdmc+',
          iconSize: [40, 40],
          iconAnchor: [20, 40],
        });
        window.L.marker(coords, { icon: blueIcon })
          .bindPopup('<div style="text-align: center;"><b>Jemput</b><br>' + (typeof pickup === 'string' ? pickup : 'Lokasi jemput') + '</div>')
          .addTo(mapInstanceRef.current);
      }

      // Add dropoff marker (red)
      if (dropoff) {
        const coords = getCoords(dropoff);
        const redIcon = window.L.icon({
          iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDQwIDQwIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIxOCIgZmlsbD0iI2VmNDQ0NCIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIyIi8+PC9zdmc+',
          iconSize: [40, 40],
          iconAnchor: [20, 40],
        });
        window.L.marker(coords, { icon: redIcon })
          .bindPopup('<div style="text-align: center;"><b>Tujuan</b><br>' + (typeof dropoff === 'string' ? dropoff : 'Lokasi tujuan') + '</div>')
          .addTo(mapInstanceRef.current);
      }

      // Fit bounds if both markers exist
      if (pickup && dropoff && mapInstanceRef.current) {
        setTimeout(() => {
          const markers = [];
          mapInstanceRef.current.eachLayer((layer) => {
            if (layer instanceof window.L.Marker) {
              markers.push(layer);
            }
          });
          if (markers.length >= 2) {
            const group = window.L.featureGroup(markers);
            mapInstanceRef.current.fitBounds(group.getBounds(), { padding: [50, 50] });
          }
        }, 100);
      }
    };
  }, [pickup, dropoff, onLocationSelect, center, zoom]);

  return (
    <div 
      ref={mapRef} 
      style={{ 
        height: height,
        width: '100%',
        zIndex: 0 
      }}
      className="bg-gray-200"
    />
  );
};

export default Map;
