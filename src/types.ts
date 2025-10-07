// Event type definition matching the frontend expectations

export interface Event {
  id: string;
  title: string;
  description?: string;
  date: string;
  time?: string;
  location: string;
  exactAddress?: string;
  venue?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  price?: string;
  category: string;
  image?: string;
  image_url?: string;
  ticket_link?: string;
  ticketLink?: string;
  source?: string;
  organizer?: string;
  capacity?: string;
  specialFeature?: string;
  special_feature?: string;
  tags?: string[];
  tickets?: {
    type: string;
    value?: string;
    label?: string;
  };
}
