import { ArrowLeft, Heart, Calendar, MapPin, ExternalLink } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { useAuth } from "../hooks/useAuth";
import { getMyEventsDirect } from "../lib/supabase";

interface SavedEventsProps {
  onClose: () => void;
}

export function SavedEvents({ onClose }: SavedEventsProps) {
  const { user } = useAuth();
  const [savedEvents, setSavedEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSavedEvents();
  }, []);

  const loadSavedEvents = async () => {
    try {
      setIsLoading(true);
      const events = await getMyEventsDirect();
      setSavedEvents(events || []);
    } catch (error) {
      console.error('Error loading saved events:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 bg-background border-b z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-9 w-9"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-lg font-medium">Gespeicherte Events</h1>
              <p className="text-xs text-muted-foreground">
                {savedEvents.length} {savedEvents.length === 1 ? 'Event' : 'Events'} gespeichert
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-3">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="text-sm text-muted-foreground">Lade gespeicherte Events...</p>
            </div>
          </div>
        ) : savedEvents.length === 0 ? (
          <Card className="p-12">
            <div className="text-center space-y-4">
              <Heart className="w-16 h-16 mx-auto text-muted-foreground" />
              <div>
                <h2 className="text-xl font-semibold mb-2">Keine gespeicherten Events</h2>
                <p className="text-muted-foreground">
                  Speichern Sie Events, um sie später wiederzufinden!
                </p>
              </div>
              <Button onClick={onClose}>
                Events entdecken
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {savedEvents.map((savedEvent) => {
              const event = savedEvent.events;

              return (
                <Card key={savedEvent.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  {/* Event Image */}
                  {event.image_url && (
                    <div className="aspect-video bg-muted relative overflow-hidden">
                      <img
                        src={event.image_url}
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* Event Info */}
                  <div className="p-4 space-y-3">
                    <div>
                      <h3 className="font-semibold line-clamp-2 mb-1">{event.title}</h3>
                      {event.category && (
                        <span className="inline-block text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                          {event.category}
                        </span>
                      )}
                    </div>

                    {event.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {event.description}
                      </p>
                    )}

                    <div className="space-y-2 text-sm">
                      {event.date && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(event.date).toLocaleDateString('de-DE')}</span>
                        </div>
                      )}

                      {event.location && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="w-4 h-4" />
                          <span className="line-clamp-1">{event.location}</span>
                        </div>
                      )}
                    </div>

                    {event.price && (
                      <div className="text-sm font-medium text-primary">
                        {event.price}
                      </div>
                    )}

                    {savedEvent.notes && (
                      <div className="text-xs bg-muted p-2 rounded">
                        <span className="text-muted-foreground">Notiz: </span>
                        {savedEvent.notes}
                      </div>
                    )}

                    {event.ticket_link && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        asChild
                      >
                        <a
                          href={event.ticket_link}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Tickets ansehen
                        </a>
                      </Button>
                    )}

                    <div className="text-xs text-muted-foreground">
                      Gespeichert: {new Date(savedEvent.saved_at).toLocaleDateString('de-DE')}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
