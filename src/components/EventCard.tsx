import { Calendar, MapPin, Info, Clock, Palette, Music, Users, UtensilsCrossed, TreePine, Trophy, Theater, PartyPopper, Building2, ShoppingBag, ExternalLink, Phone, Globe, Heart, ArrowRight } from "lucide-react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { useState } from "react";
import { EventDetailModal } from "./EventDetailModal";

interface EventCardProps {
  id: string;
  title: string;
  location: string;
  exactAddress?: string;
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

const getCategoryIcon = (category: string) => {
  const categoryLower = category.toLowerCase();
  
  if (categoryLower.includes('ausstellung')) return Palette;
  if (categoryLower.includes('konzert') || categoryLower.includes('musik')) return Music;
  if (categoryLower.includes('workshop')) return Users;
  if (categoryLower.includes('festival') || categoryLower.includes('food')) return UtensilsCrossed;
  if (categoryLower.includes('outdoor')) return TreePine;
  if (categoryLower.includes('sport')) return Trophy;
  if (categoryLower.includes('theater')) return Theater;
  if (categoryLower.includes('club')) return PartyPopper;
  if (categoryLower.includes('markt')) return ShoppingBag;
  
  return Building2; // default icon
};

export function EventCard({ 
  id,
  title, 
  location, 
  exactAddress,
  date, 
  time,
  image,
  category, 
  description,
  price,
  specialFeature,
  source,
  tickets,
  isFavorite = false,
  onToggleFavorite
}: EventCardProps) {
  const [showDetailModal, setShowDetailModal] = useState(false);
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleDateString('de-DE', { month: 'short' });
    return { day: day.toString(), month };
  };

  const { day, month } = formatDate(date);
  const CategoryIcon = getCategoryIcon(category);

  const renderTicketInfo = () => {
    if (!tickets) return null;
    
    switch (tickets.type) {
      case 'free':
        return (
          <Badge variant="outline" className="text-green-600 border-green-600 bg-green-50 dark:bg-green-950">
            <span className="mr-1">🆓</span>
            Gratis
          </Badge>
        );
      case 'link':
        return (
          <Button
            variant="default"
            size="sm"
            className="h-8 px-3 bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm"
            onClick={(e) => {
              e.stopPropagation();
              if (tickets.value) window.open(tickets.value, '_blank');
            }}
          >
            <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
            {tickets.label || 'Tickets'}
          </Button>
        );
      case 'website':
        return (
          <Button 
            variant="link" 
            size="sm" 
            className="h-auto p-0 text-blue-600 hover:text-blue-800 font-medium"
            onClick={(e) => {
              e.stopPropagation();
              if (tickets.value) window.open(tickets.value, '_blank');
            }}
          >
            <Globe className="w-3 h-3 mr-1" />
            {tickets.label || 'Website'}
          </Button>
        );
      case 'phone':
        return (
          <Button 
            variant="link" 
            size="sm" 
            className="h-auto p-0 text-blue-600 hover:text-blue-800 font-medium"
            onClick={(e) => {
              e.stopPropagation();
              if (tickets.value) window.location.href = `tel:${tickets.value}`;
            }}
          >
            <Phone className="w-3 h-3 mr-1" />
            {tickets.value}
          </Button>
        );
    }
  };

  const eventData = {
    id,
    title,
    location,
    exactAddress,
    date,
    time,
    image,
    category,
    description,
    price,
    specialFeature,
    source,
    tickets
  };

  return (
    <>
      <Card 
        className="overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer group border-0 shadow-sm hover:scale-[1.01] bg-card"
        onClick={() => setShowDetailModal(true)}
      >
        {/* Mobile Layout (< md) */}
        <div className="md:hidden">
          <div className="flex gap-3 p-3">
            {/* Image & Date */}
            <div className="relative w-20 h-24 flex-shrink-0 overflow-hidden rounded-lg">
              <img 
                src={image} 
                alt={title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute top-1 left-1 bg-white/95 backdrop-blur-sm rounded px-1.5 py-0.5 text-center shadow-sm">
                <div className="text-xs font-bold text-primary leading-none">{day}</div>
                <div className="text-xs text-muted-foreground uppercase leading-none">{month.slice(0, 3)}</div>
              </div>
            </div>
            
            {/* Content */}
            <div className="flex-1 min-w-0 space-y-1.5">
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <CategoryIcon className="w-3 h-3 text-primary flex-shrink-0" />
                  <Badge variant="secondary" className="text-xs px-1.5 py-0.5 h-auto">
                    {category}
                  </Badge>
                </div>
                {onToggleFavorite && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite();
                    }}
                    className="h-6 w-6 p-0 hover:bg-red-50 dark:hover:bg-red-950"
                  >
                    <Heart 
                      className={`w-3 h-3 transition-colors ${
                        isFavorite 
                          ? 'fill-red-500 text-red-500' 
                          : 'text-muted-foreground hover:text-red-500'
                      }`} 
                    />
                  </Button>
                )}
              </div>
              
              {/* Title */}
              <h3 className="font-semibold text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                {title}
              </h3>
              
              {/* Meta Info */}
              <div className="space-y-0.5">
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                  <span className="text-xs text-muted-foreground truncate">{location}</span>
                </div>
                {time && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                    <span className="text-xs text-muted-foreground">{time} Uhr</span>
                  </div>
                )}
              </div>
              
              {/* Price & Ticket Link */}
              <div className="flex items-center justify-between gap-2 flex-wrap">
                {price && (
                  <div className="text-sm font-semibold text-green-600">{price}</div>
                )}
                {renderTicketInfo()}
              </div>

              {/* Special Feature */}
              {specialFeature && (
                <div className="flex items-center gap-1">
                  <span className="text-orange-500 text-xs">✨</span>
                  <span className="text-xs text-orange-600 font-medium truncate">{specialFeature}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Desktop Layout (>= md) */}
        <div className="hidden md:flex gap-0">
          {/* Image Section */}
          <div className="relative w-32 h-36 flex-shrink-0 overflow-hidden">
            <img 
              src={image} 
              alt={title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/10" />
            
            {/* Date Overlay */}
            <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm rounded-lg px-2 py-1.5 text-center shadow-sm">
              <div className="text-sm font-bold text-primary leading-none">{day}</div>
              <div className="text-xs text-muted-foreground uppercase leading-none mt-0.5">{month.slice(0, 3)}</div>
            </div>
            
            {/* Price Badge */}
            {price && (
              <div className="absolute bottom-3 left-3 bg-green-600/90 backdrop-blur-sm text-white px-2 py-1 rounded-md text-xs font-medium shadow-sm">
                {price}
              </div>
            )}
          </div>
          
          {/* Content Section */}
          <div className="flex-1 p-5 min-w-0 flex flex-col">
            <div className="flex items-start justify-between gap-3 mb-3">
              {/* Category Icon & Badge */}
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <CategoryIcon className="w-4 h-4 text-primary" />
                </div>
                <Badge variant="secondary" className="text-xs px-2.5 py-1">
                  {category}
                </Badge>
              </div>
              
              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {source && (
                  <Badge variant="outline" className="text-xs px-2 py-0.5">
                    {source}
                  </Badge>
                )}
                {onToggleFavorite && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite();
                    }}
                    className="h-8 w-8 p-0 hover:bg-red-50 dark:hover:bg-red-950 opacity-70 group-hover:opacity-100 transition-opacity"
                  >
                    <Heart 
                      className={`w-4 h-4 transition-colors ${
                        isFavorite 
                          ? 'fill-red-500 text-red-500' 
                          : 'text-muted-foreground hover:text-red-500'
                      }`} 
                    />
                  </Button>
                )}
              </div>
            </div>
            
            {/* Title */}
            <h3 className="font-semibold text-lg leading-tight line-clamp-2 mb-3 group-hover:text-primary transition-colors">
              {title}
            </h3>
            
            {/* Location & Time */}
            <div className="space-y-2 mb-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <span className="text-sm text-muted-foreground truncate">{location}</span>
              </div>
              {time && (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">{time} Uhr</span>
                </div>
              )}
            </div>
            
            {/* Description */}
            {description && (
              <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed mb-3 flex-grow">
                {description}
              </p>
            )}
            
            {/* Special Feature */}
            {specialFeature && (
              <div className="flex items-center gap-2 mb-3">
                <span className="text-orange-500">✨</span>
                <span className="text-sm text-orange-600 font-medium">{specialFeature}</span>
              </div>
            )}
            
            {/* Bottom Row - Tickets & Action */}
            <div className="flex items-center justify-between mt-auto pt-3 border-t border-border/50">
              <div className="flex-1">
                {renderTicketInfo()}
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                className="h-8 px-3 text-sm opacity-0 group-hover:opacity-100 transition-opacity ml-3 hover:bg-primary/10"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDetailModal(true);
                }}
              >
                Details
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </Card>
      
      {/* Event Detail Modal */}
      <EventDetailModal
        event={eventData}
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        isFavorite={isFavorite}
        onToggleFavorite={onToggleFavorite}
      />
    </>
  );
}