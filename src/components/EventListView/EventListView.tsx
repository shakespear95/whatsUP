import React from 'react';
import { Heart, MapPin, Clock } from 'lucide-react';
import { Event } from '../../types';
import './EventListView.css';

interface EventListViewProps {
  events: Event[];
  loading?: boolean;
}

const EventListView: React.FC<EventListViewProps> = ({ events, loading }) => {
  if (loading) {
    return (
      <div className="event-list-loading">
        <div className="spinner"></div>
        <p>Lade Events...</p>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="event-list-empty">
        <p>Keine Events gefunden.</p>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString('de-DE', { month: 'short' }).toUpperCase();
    return { day, month };
  };

  const getEventTypeIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'ausstellung':
      case 'exhibition':
        return '🎨';
      case 'konzert':
      case 'music':
        return '🎵';
      case 'theater':
        return '🎭';
      case 'festival':
        return '🎪';
      case 'workshop':
        return '🔧';
      default:
        return '🎯';
    }
  };

  return (
    <div className="event-list-view">
      {events.map((event, index) => {
        const { day, month } = formatDate(event.date);

        return (
          <div key={event.id || index} className="event-list-item">
            <div className="event-date">
              <div className="date-day">{day}</div>
              <div className="date-month">{month}</div>
            </div>

            <div className="event-image">
              <img
                src={`https://picsum.photos/80/80?random=${index}`}
                alt={event.title}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIGZpbGw9IiNmM2Y0ZjYiIHZpZXdCb3g9IjAgMCAyNCAyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTIgMkM2LjQ4IDIgMiA2LjQ4IDIgMTJzNC40OCAxMCAxMCAxMCAxMC00LjQ4IDEwLTEwUzE3LjUyIDIgMTIgMnptMCAxOGMtNC40MSAwLTgtMy41OS04LThzMy41OS04IDgtOCA4IDMuNTkgOCA4LTMuNTkgOC04IDh6Ii8+PC9zdmc+';
                }}
              />
            </div>

            <div className="event-content">
              <div className="event-header">
                <span className="event-type">
                  {getEventTypeIcon(event.category)} {event.category}
                </span>
                <button className="favorite-button">
                  <Heart size={16} />
                </button>
              </div>

              <h3 className="event-title">{event.title}</h3>

              <div className="event-details">
                <div className="event-location">
                  <MapPin size={14} />
                  {event.venue || event.location}
                </div>
                <div className="event-time">
                  <Clock size={14} />
                  {new Date(event.date).toLocaleTimeString('de-DE', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })} Uhr
                </div>
              </div>

              <div className="event-footer">
                <div className="event-price">
                  {event.price.includes('Free') ? 'Gratis' : event.price}
                </div>
                {event.description && (
                  <div className="event-highlight">
                    ⭐ {event.description.substring(0, 30)}...
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default EventListView;