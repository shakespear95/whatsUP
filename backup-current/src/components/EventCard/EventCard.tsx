import React from 'react';
import { Calendar, MapPin, DollarSign, ExternalLink } from 'lucide-react';
import { Event } from '../../types';
import './EventCard.css';

interface EventCardProps {
  event: Event;
}

const EventCard: React.FC<EventCardProps> = ({ event }) => {
  const getCategoryClass = (category: string) => {
    return `category-${category.toLowerCase()}`;
  };

  const formatPrice = (price: string) => {
    if (!price || price.toLowerCase().includes('free') || price.toLowerCase().includes('n/a')) {
      return 'Free';
    }
    return price;
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  return (
    <div className={`event-card ${getCategoryClass(event.category)}`}>
      <div className="event-card-content">
        <h4>{event.title}</h4>

        {event.description && (
          <div className="event-detail">
            <div className="event-detail-content">
              <div className="event-detail-text">{event.description}</div>
            </div>
          </div>
        )}

        <div className="event-detail">
          <div className="event-detail-icon">
            <Calendar size={16} />
          </div>
          <div className="event-detail-content">
            <strong>Date</strong>
            <div className="event-detail-text">{formatDate(event.date)}</div>
          </div>
        </div>

        <div className="event-detail">
          <div className="event-detail-icon">
            <MapPin size={16} />
          </div>
          <div className="event-detail-content">
            <strong>Location</strong>
            <div className="event-detail-text">
              {event.venue && <div>{event.venue}</div>}
              <div>{event.location}</div>
              {event.address && <div>{event.address}</div>}
            </div>
          </div>
        </div>

        <div className="event-detail">
          <div className="event-detail-icon">
            <DollarSign size={16} />
          </div>
          <div className="event-detail-content">
            <strong>Price</strong>
            <div className="event-price">{formatPrice(event.price)}</div>
          </div>
        </div>
      </div>

      <div className="event-card-footer">
        {event.ticketLink && (
          <a
            href={event.ticketLink}
            target="_blank"
            rel="noopener noreferrer"
            className="event-ticket-btn"
          >
            <ExternalLink size={14} />
            Get Tickets
          </a>
        )}
      </div>
    </div>
  );
};

export default EventCard;