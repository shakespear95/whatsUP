import { useState, useEffect, useRef } from 'react';
import { MapPin, Calendar, Clock, ExternalLink, Phone, Globe, Heart, X } from "lucide-react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { EventDetailModal } from "./EventDetailModal";

// Event interface erweitert für alle benötigten Felder
interface Event {
  id: string;
  title: string;
  location: string;
  exactAddress?: string;
  latitude: number;
  longitude: number;
  date: string;
  time?: string;
  image: string;
  category: string;
  description?: string;
  price?: string;
  specialFeature?: string;
  source?: string;
  tickets?: {
    type: 'free' | 'link' | 'website' | 'phone';
    value?: string;
    label?: string;
  };
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}

interface MapViewProps {
  events: Event[];
}

// Schweizer Städte-Koordinaten für realistische Darstellung
const swissCities = {
  zurich: { lat: 47.3769, lng: 8.5417, name: 'Zürich' },
  basel: { lat: 47.5596, lng: 7.5886, name: 'Basel' },
  bern: { lat: 46.9481, lng: 7.4474, name: 'Bern' },
  stgallen: { lat: 47.4245, lng: 9.3767, name: 'St. Gallen' },
  geneva: { lat: 46.2044, lng: 6.1432, name: 'Genf' },
  lausanne: { lat: 46.5197, lng: 6.6323, name: 'Lausanne' }
};

export function MapView({ events }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const markersRef = useRef<any[]>([]);

  // Dynamischer Import von Leaflet
  useEffect(() => {
    let mapInstance: any = null;
    
    const initializeMap = async () => {
      if (typeof window === 'undefined') return;
      
      // Dynamischer Import von Leaflet
      const L = (await import('leaflet')).default;
      
      // Leaflet CSS importieren
      if (!document.querySelector('link[href*="leaflet.css"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      if (mapRef.current && !mapInstance) {
        // Standard-Zentrum auf die Schweiz
        const centerLat = 46.8182;
        const centerLng = 8.2275;
        
        mapInstance = L.map(mapRef.current, {
          center: [centerLat, centerLng],
          zoom: 8,
          zoomControl: false
        });

        // OpenStreetMap Tiles mit Schweizer Stil
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 18,
        }).addTo(mapInstance);

        // Custom Zoom Control
        L.control.zoom({
          position: 'bottomright'
        }).addTo(mapInstance);

        setMap(mapInstance);

        // Event Marker hinzufügen
        addEventMarkers(L, mapInstance);
      }
    };

    initializeMap();

    return () => {
      if (mapInstance) {
        mapInstance.remove();
      }
    };
  }, []);

  // Event Markers hinzufügen/aktualisieren
  useEffect(() => {
    if (map && events.length > 0) {
      addEventMarkers(null, map);
    }
  }, [map, events]);

  const addEventMarkers = async (L: any, mapInstance: any) => {
    if (!L) {
      L = (await import('leaflet')).default;
    }

    // Alte Marker entfernen
    markersRef.current.forEach(marker => {
      mapInstance.removeLayer(marker);
    });
    markersRef.current = [];

    // Neue Marker für Events hinzufügen (nur für Events mit Koordinaten)
    events.forEach(event => {
      // Skip events without coordinates
      if (!event.latitude || !event.longitude ||
          isNaN(event.latitude) || isNaN(event.longitude)) {
        console.warn('⚠️ Event missing coordinates:', event.title, event.location);
        return;
      }

      // Custom Icon für Event-Marker
      const customIcon = L.divIcon({
        html: `
          <div class="relative">
            <div class="w-8 h-8 bg-red-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center hover:bg-red-600 transition-colors cursor-pointer">
              <svg class="w-4 h-4 text-white fill-current" viewBox="0 0 24 24">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
            </div>
            <div class="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-red-500"></div>
          </div>
        `,
        iconSize: [32, 40],
        iconAnchor: [16, 40],
        className: 'custom-event-marker'
      });

      const marker = L.marker([event.latitude, event.longitude], { 
        icon: customIcon 
      }).addTo(mapInstance);

      // Click Event für Marker
      marker.on('click', () => {
        setSelectedEvent(event);
        // Karte auf Event zentrieren
        mapInstance.setView([event.latitude, event.longitude], Math.max(mapInstance.getZoom(), 12), {
          animate: true,
          duration: 0.5
        });
      });

      // Tooltip für Hover
      marker.bindTooltip(
        `<div class="font-medium">${event.title}</div><div class="text-sm text-gray-600">${event.location}</div>`,
        {
          direction: 'top',
          offset: [0, -10],
          className: 'custom-tooltip'
        }
      );

      markersRef.current.push(marker);
    });

    // Karte auf alle Events anpassen (nur wenn Marker vorhanden)
    if (markersRef.current.length > 0) {
      const group = new L.featureGroup(markersRef.current);
      mapInstance.fitBounds(group.getBounds().pad(0.1));
    } else if (events.length > 0) {
      // Wenn keine Marker vorhanden, aber Events existieren, zeige Warnung
      console.warn('⚠️ No events have valid coordinates for map display');
      // Zentrierung auf Schweiz beibehalten (bereits beim Init gesetzt)
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const weekday = date.toLocaleDateString('de-CH', { weekday: 'short' });
    return { day, month, weekday, fullDate: date.toLocaleDateString('de-CH', { 
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
    })};
  };

  const formatTime = (timeString?: string) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    return `${hours}:${minutes} Uhr`;
  };

  const handleCardClick = () => {
    if (selectedEvent) {
      setShowDetailModal(true);
    }
  };

  const handleCloseCard = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedEvent(null);
  };

  const handleTicketAction = (event: Event) => {
    if (!event.tickets) return;
    
    switch (event.tickets.type) {
      case 'link':
      case 'website':
        if (event.tickets.value) {
          window.open(event.tickets.value, '_blank');
        }
        break;
      case 'phone':
        if (event.tickets.value) {
          window.location.href = `tel:${event.tickets.value}`;
        }
        break;
    }
  };

  return (
    <div className="relative w-full h-[600px] sm:h-[700px] lg:h-[800px] bg-slate-100 rounded-lg overflow-hidden">
      {/* Map Container */}
      <div 
        ref={mapRef} 
        className="absolute inset-0 w-full h-full"
        style={{ zIndex: 1 }}
      />

      {/* Custom Map Controls Overlay */}
      <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
        <div className="bg-white rounded-lg p-2 shadow-sm">
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="w-4 h-4 text-red-500 fill-red-500" />
            <span className="font-medium">{events.length} Events</span>
          </div>
        </div>
      </div>

      {/* Event Info Card am unteren Rand */}
      {selectedEvent && (
        <div 
          className="absolute bottom-0 left-0 right-0 z-[1000] transform transition-transform duration-300 ease-out"
          style={{ transform: 'translateY(0)' }}
        >
          <Card 
            className="m-4 shadow-xl border-0 cursor-pointer hover:shadow-2xl transition-shadow bg-white/95 backdrop-blur-sm"
            onClick={handleCardClick}
          >
            <div className="p-4">
              {/* Close Button */}
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 h-8 w-8 p-0 hover:bg-gray-100"
                onClick={handleCloseCard}
              >
                <X className="w-4 h-4" />
              </Button>

              <div className="flex gap-4">
                {/* Event Image */}
                <div className="flex-shrink-0">
                  <img
                    src={selectedEvent.image}
                    alt={selectedEvent.title}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg object-cover"
                  />
                </div>

                {/* Event Info */}
                <div className="flex-1 min-w-0 pr-8">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-semibold text-lg line-clamp-2 leading-tight">
                      {selectedEvent.title}
                    </h3>
                  </div>

                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 flex-shrink-0" />
                      <span>
                        {formatDate(selectedEvent.date).fullDate}
                        {selectedEvent.time && ` • ${formatTime(selectedEvent.time)}`}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 flex-shrink-0" />
                      <span className="line-clamp-1">{selectedEvent.location}</span>
                    </div>
                  </div>

                  {/* Price & Category */}
                  <div className="flex items-center gap-2 mt-2">
                    {selectedEvent.price && (
                      <Badge variant="secondary" className="text-green-600 bg-green-50">
                        {selectedEvent.price}
                      </Badge>
                    )}
                    <Badge variant="outline">
                      {selectedEvent.category}
                    </Badge>
                  </div>

                  {/* Tickets Button */}
                  {selectedEvent.tickets && selectedEvent.tickets.type !== 'free' && (
                    <div className="mt-3">
                      <Button 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTicketAction(selectedEvent);
                        }}
                        className="w-full sm:w-auto"
                      >
                        {selectedEvent.tickets.type === 'link' && <ExternalLink className="w-4 h-4 mr-2" />}
                        {selectedEvent.tickets.type === 'website' && <Globe className="w-4 h-4 mr-2" />}
                        {selectedEvent.tickets.type === 'phone' && <Phone className="w-4 h-4 mr-2" />}
                        {selectedEvent.tickets.label || 'Tickets'}
                      </Button>
                    </div>
                  )}

                  {selectedEvent.tickets?.type === 'free' && (
                    <Badge variant="outline" className="text-green-600 border-green-600 mt-2">
                      Kostenloser Eintritt
                    </Badge>
                  )}
                </div>
              </div>

              {/* Click Hint */}
              <div className="text-center mt-3 pt-3 border-t border-gray-100">
                <p className="text-xs text-muted-foreground">
                  Klicken für Details
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Event Detail Modal */}
      {showDetailModal && selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          isFavorite={selectedEvent.isFavorite || false}
          onToggleFavorite={selectedEvent.onToggleFavorite}
        />
      )}

      {/* Custom Styles für Leaflet */}
      <style jsx global>{`
        .leaflet-control-attribution {
          background-color: rgba(255, 255, 255, 0.8) !important;
          font-size: 10px !important;
        }
        
        .leaflet-control-zoom {
          border: none !important;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1) !important;
        }
        
        .leaflet-control-zoom a {
          background-color: white !important;
          border: none !important;
          color: #374151 !important;
          font-weight: bold !important;
          border-radius: 6px !important;
          margin-bottom: 2px !important;
        }
        
        .leaflet-control-zoom a:hover {
          background-color: #f3f4f6 !important;
        }
        
        .custom-tooltip {
          background-color: white !important;
          border: 1px solid #e5e7eb !important;
          border-radius: 6px !important;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1) !important;
          font-size: 12px !important;
          padding: 8px !important;
        }
        
        .custom-tooltip::before {
          border-top-color: white !important;
        }
        
        .custom-event-marker {
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
        }
        
        .custom-event-marker:hover {
          filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
          transform: scale(1.1);
        }
      `}</style>
    </div>
  );
}