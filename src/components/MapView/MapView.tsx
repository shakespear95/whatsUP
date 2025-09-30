import React, { useEffect, useRef } from 'react';
import { Event } from '../../types';
import './MapView.css';

interface MapViewProps {
  events: Event[];
  loading?: boolean;
}

const MapView: React.FC<MapViewProps> = ({ events, loading }) => {
  const mapRef = useRef<HTMLDivElement>(null);

  // Mock coordinates for demonstration
  const eventMarkers = events.map((event, index) => ({
    ...event,
    lat: 47.3769 + (Math.random() - 0.5) * 0.1, // Zurich area
    lng: 8.5417 + (Math.random() - 0.5) * 0.1,
    id: event.id || index
  }));

  useEffect(() => {
    // This would normally initialize a real map (Leaflet, Google Maps, etc.)
    // For now, we'll create a mock map visualization
    console.log('Map would be initialized here with events:', eventMarkers);
  }, [eventMarkers]);

  if (loading) {
    return (
      <div className="map-view-loading">
        <div className="spinner"></div>
        <p>Lade Karte...</p>
      </div>
    );
  }

  return (
    <div className="map-view">
      <div className="map-container" ref={mapRef}>
        {/* Mock map background */}
        <div className="mock-map">
          <div className="map-controls">
            <button className="map-control zoom-in">+</button>
            <button className="map-control zoom-out">−</button>
          </div>

          <div className="events-count">
            📍 {events.length} Events
          </div>

          {/* Mock event markers */}
          {eventMarkers.slice(0, 6).map((event, index) => (
            <div
              key={event.id}
              className="event-marker"
              style={{
                left: `${20 + (index * 15) % 60}%`,
                top: `${30 + (index * 10) % 40}%`
              }}
              title={event.title}
            >
              <div className="marker-pin">📍</div>
              <div className="marker-tooltip">
                <div className="tooltip-title">{event.title}</div>
                <div className="tooltip-price">{event.price}</div>
              </div>
            </div>
          ))}

          {/* Mock map background pattern */}
          <svg className="map-background" viewBox="0 0 400 300">
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e5e7eb" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />

            {/* Mock streets */}
            <path d="M0,150 Q100,140 200,150 T400,150" stroke="#d1d5db" strokeWidth="2" fill="none"/>
            <path d="M150,0 Q160,100 150,200 T150,300" stroke="#d1d5db" strokeWidth="2" fill="none"/>
            <path d="M0,100 Q200,90 400,100" stroke="#d1d5db" strokeWidth="1.5" fill="none"/>
            <path d="M100,0 Q110,150 100,300" stroke="#d1d5db" strokeWidth="1.5" fill="none"/>

            {/* Mock areas */}
            <circle cx="200" cy="150" r="30" fill="#f0fdf4" stroke="#22c55e" strokeWidth="1" opacity="0.3"/>
            <rect x="50" y="50" width="80" height="60" fill="#fef3c7" stroke="#f59e0b" strokeWidth="1" opacity="0.3"/>
            <polygon points="300,80 350,120 320,160 270,140" fill="#ddd6fe" stroke="#8b5cf6" strokeWidth="1" opacity="0.3"/>
          </svg>
        </div>
      </div>

      {/* Map Legend */}
      <div className="map-legend">
        <div className="legend-item">
          <span className="legend-marker concert">🎵</span>
          <span>Konzerte</span>
        </div>
        <div className="legend-item">
          <span className="legend-marker exhibition">🎨</span>
          <span>Ausstellungen</span>
        </div>
        <div className="legend-item">
          <span className="legend-marker theater">🎭</span>
          <span>Theater</span>
        </div>
        <div className="legend-item">
          <span className="legend-marker festival">🎪</span>
          <span>Festivals</span>
        </div>
      </div>
    </div>
  );
};

export default MapView;