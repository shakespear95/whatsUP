import { useState, useMemo, useEffect } from 'react';
import { SimpleNavigationHeader, SimpleSearchSession, SearchHistoryEntry, SavedSearchTemplate, QuickFilterState } from './components/SimpleNavigationHeader';
import { AdvancedSearchDropdown } from './components/AdvancedSearchDropdown';
import { EventCard } from './components/EventCard';
import { MapView } from './components/MapView';
import { AdvancedStartScreen } from './components/AdvancedStartScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { SearchFilters } from './components/AdvancedSearchDropdown';
import { Button } from './components/ui/button';

// ERWEITERTE Mock-Daten mit breiter Filter-Abdeckung für Tests
const mockEvents = [
  // **ORIGINAL EVENTS** 
  {
    id: '1',
    title: 'Moderne Kunstausstellung - Zeitgenössische Werke',
    location: 'Kunstmuseum Zürich',
    exactAddress: 'Heimplatz 1, 8001 Zürich',
    date: '2024-09-28',
    time: '10:00',
    latitude: 47.3769,
    longitude: 8.5417,
    image: 'https://images.unsplash.com/photo-1719396922900-bd10836d581d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcnQlMjBleGhpYml0aW9uJTIwZ2FsbGVyeXxlbnwxfHx8fDE3NTg2OTIzNzR8MA&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Ausstellung',
    description: 'Eine faszinierende Sammlung zeitgenössischer Kunstwerke von lokalen und internationalen Künstlern.',
    price: 'CHF 15.-',
    specialFeature: 'Führung um 14:00 Uhr',
    source: 'Eventbrite',
    tickets: { type: 'link', value: 'https://tickets.ch', label: 'Tickets kaufen' }
  },
  {
    id: '2',
    title: 'Jazz Night - Live Performance',
    location: 'Moods Zürich',
    exactAddress: 'Schiffbaustrasse 6, 8005 Zürich',
    date: '2024-09-25',
    time: '20:30',
    latitude: 47.3697,
    longitude: 8.5292,
    image: 'https://images.unsplash.com/photo-1738667181188-a63ec751a646?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXNpYyUyMGNvbmNlcnQlMjBzdGFnZXxlbnwxfHx8fDE3NTg2OTEyNTZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Konzert',
    description: 'Ein unvergesslicher Abend mit erstklassigen Jazz-Musikern aus der ganzen Welt.',
    price: 'CHF 35.-',
    source: 'Moods',
    tickets: { type: 'website', value: 'https://moods.ch', label: 'Zur Website' }
  },
  {
    id: '3',
    title: 'Shakespeare im Park - Romeo und Julia',
    location: 'Stadtpark Basel',
    exactAddress: 'Kannenfeldpark, 4056 Basel',
    date: '2024-09-30',
    time: '19:00',
    latitude: 47.5596,
    longitude: 7.5886,
    image: 'https://images.unsplash.com/photo-1503095396549-807759245b35?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0aGVhdGVyJTIwcGVyZm9ybWFuY2V8ZW58MXx8fHwxNzU4NzA2OTYwfDA&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Theater',
    description: 'Klassisches Shakespear-Drama unter freiem Himmel in einer einzigartigen Parkkulisse.',
    price: 'CHF 25.-',
    specialFeature: 'Open Air bei gutem Wetter',
    source: 'Stadt Basel',
    tickets: { type: 'phone', value: '061 123 45 67', label: 'Reservierung' }
  },
  {
    id: '4',
    title: 'Kulinarisches Festival - Street Food Market',
    location: 'Helvetiaplatz Bern',
    exactAddress: 'Helvetiaplatz, 3005 Bern',
    date: '2024-10-05',
    time: '11:00',
    latitude: 46.9481,
    longitude: 7.4474,
    image: 'https://images.unsplash.com/photo-1675674683873-1232862e3c64?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmb29kJTIwZmVzdGl2YWwlMjBtYXJrZXR8ZW58MXx8fHwxNzU4NzAzNDMzfDA&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Festival',
    description: 'Entdecken Sie die Vielfalt der internationalen Küche bei unserem großen Street Food Festival.',
    specialFeature: '30+ Food Trucks',
    source: 'Bern Tourismus',
    tickets: { type: 'free' }
  },
  {
    id: '5',
    title: 'Digital Marketing Workshop',
    location: 'Business Center St. Gallen',
    exactAddress: 'Vadianstrasse 59, 9001 St. Gallen',
    date: '2024-10-08',
    time: '09:00',
    latitude: 47.4245,
    longitude: 9.3767,
    image: 'https://images.unsplash.com/photo-1728933102332-a4f1a281a621?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b3Jrc2hvcCUyMHNlbWluYXJ8ZW58MXx8fHwxNzU4NzcyMjYzfDA&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Workshop',
    description: 'Lernen Sie die neuesten Trends und Strategien im digitalen Marketing von Experten.',
    price: 'CHF 150.-',
    specialFeature: 'Inklusive Mittagessen',
    source: 'Marketing Club',
    tickets: { type: 'link', value: 'https://workshop.ch', label: 'Anmelden' }
  },
  {
    id: '6',
    title: 'FC Zürich vs. Basel',
    location: 'Letzigrund Stadion',
    exactAddress: 'Badenerstrasse 500, 8048 Zürich',
    date: '2024-10-12',
    time: '16:30',
    latitude: 47.3825,
    longitude: 8.5005,
    image: 'https://images.unsplash.com/photo-1686947079063-f1e7a7dfc6a9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcG9ydHMlMjBldmVudCUyMHN0YWRpdW18ZW58MXx8fHwxNzU4NjkyMzc3fDA&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Sport',
    description: 'Das große Derby zwischen den beiden Schweizer Fußball-Rivalen im ausverkauften Stadion.',
    price: 'ab CHF 25.-',
    specialFeature: 'Swiss Super League Derby',
    source: 'FC Zürich',
    tickets: { type: 'website', value: 'https://fcz.ch', label: 'Tickets' }
  },
  {
    id: '7',
    title: 'Techno Club Night - Electronic Dreams',
    location: 'Rohstofflager Zürich',
    exactAddress: 'Überlandstrasse 11, 8953 Dietikon',
    date: '2024-10-15',
    time: '23:00',
    latitude: 47.3833,
    longitude: 8.5167,
    image: 'https://images.unsplash.com/photo-1738667181188-a63ec751a646?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXNpYyUyMGNvbmNlcnQlMjBzdGFnZXxlbnwxfHx8fDE3NTg2OTEyNTZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Club',
    description: 'Die heißeste Techno-Party der Stadt mit internationalen DJs und pulsierenden Beats.',
    price: 'CHF 20.-',
    specialFeature: 'Bis 6:00 Uhr morgens',
    source: 'Partyflock',
    tickets: { type: 'link', value: 'https://resident.ch', label: 'Tickets' }
  },
  {
    id: '8',
    title: 'Vintage Design Markt',
    location: 'Alte Markthalle Basel',
    exactAddress: 'Steinenvorstadt 20, 4051 Basel',
    date: '2024-10-18',
    time: '10:00',
    latitude: 47.5584,
    longitude: 7.5733,
    image: 'https://images.unsplash.com/photo-1719396922900-bd10836d581d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcnQlMjBleGhpYml0aW9uJTIwZ2FsbGVyeXxlbnwxfHx8fDE3NTg2OTIzNzR8MA&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Markt',
    description: 'Einzigartige Vintage-Möbel, Kunst und Design-Objekte von lokalen Sammlern und Antiquitätenhändlern.',
    specialFeature: '50+ Vintage Händler',
    source: 'Basel Events',
    tickets: { type: 'free' }
  },

  // **NEUE EVENTS FÜR BREITE FILTER-ABDECKUNG**

  // UNIQUE & UNDERGROUND EVENTS
  {
    id: '9',
    title: 'Secret Location Pop-up - Geheimlocation wird bekannt gegeben',
    location: 'Geheim, Zürich',
    exactAddress: 'Location wird per SMS mitgeteilt',
    date: '2024-09-27',
    time: '22:00',
    latitude: 47.3769,
    longitude: 8.5417,
    image: 'https://images.unsplash.com/photo-1738667181188-a63ec751a646?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXNpYyUyMGNvbmNlcnQlMjBzdGFnZXxlbnwxfHx8fDE3NTg2OTEyNTZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Pop-up Underground Alternative',
    description: 'Exklusives Underground-Event an geheimer Location. Nur für Insider!',
    price: 'CHF 40.-',
    specialFeature: 'Geheim bis 1h vor Event',
    source: 'Underground Scene',
    tickets: { type: 'link', value: 'https://secret.ch', label: 'Secret Code' }
  },
  {
    id: '10',
    title: 'Guerilla Art Flash Mob - Spontane Straßenkunst',
    location: 'Bahnhofstrasse Zürich',
    exactAddress: 'Treffpunkt: Paradeplatz',
    date: '2024-09-26',
    time: '18:00',
    latitude: 47.3697,
    longitude: 8.5401,
    image: 'https://images.unsplash.com/photo-1719396922900-bd10836d581d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcnQlMjBleGhpYml0aW9uJTIwZ2FsbGVyeXxlbnwxfHx8fDE3NTg2OTIzNzR8MA&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Guerilla Flash Mob Alternative',
    description: 'Spontane Kunst-Aktion mitten in der Stadt. Werde Teil der Bewegung!',
    specialFeature: 'Spontan & Outdoor',
    source: 'Art Collective',
    tickets: { type: 'free' }
  },
  {
    id: '11',
    title: 'Immersive VR Experience - Virtuelle Welten',
    location: 'Lab21 Basel',
    exactAddress: 'Klybeckstrasse 141, 4057 Basel',
    date: '2024-10-01',
    time: '19:30',
    latitude: 47.5596,
    longitude: 7.5886,
    image: 'https://images.unsplash.com/photo-1728933102332-a4f1a281a621?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b3Jrc2hvcCUyMHNlbWluYXJ8ZW58MXx8fHwxNzU4NzcyMjYzfDA&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Immersive Experience Experimental',
    description: 'Tauche ein in experimentelle Virtual Reality Kunstwelten.',
    price: 'CHF 28.-',
    specialFeature: 'VR-Brille inklusive',
    source: 'Experimental Arts',
    tickets: { type: 'link', value: 'https://lab21.ch', label: 'Buchen' }
  },

  // COMMUNITY & SPONTAN EVENTS
  {
    id: '12',
    title: 'Nachbarschafts-Brunch - Meet Your Neighbors',
    location: 'Gemeinschaftszentrum Bern',
    exactAddress: 'Reitschule, Neubrückstrasse 8, 3012 Bern',
    date: '2024-09-29',
    time: '10:00',
    latitude: 46.9481,
    longitude: 7.4474,
    image: 'https://images.unsplash.com/photo-1675674683873-1232862e3c64?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmb29kJTIwZmVzdGl2YWwlMjBtYXJrZXR8ZW58MXx8fHwxNzU4NzAzNDMzfDA&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Community Nachbarschaft Spontan',
    description: 'Lerne deine Nachbarn bei einem gemütlichen Brunch kennen.',
    specialFeature: 'Bring a dish to share',
    source: 'Nachbarschaft+',
    tickets: { type: 'free' }
  },
  {
    id: '13',
    title: 'Skill-Sharing Circle - Talents teilen',
    location: 'Kulturzentrum St. Gallen',
    exactAddress: 'Gallusstrasse 11, 9000 St. Gallen',
    date: '2024-10-03',
    time: '19:00',
    latitude: 47.4245,
    longitude: 9.3767,
    image: 'https://images.unsplash.com/photo-1728933102332-a4f1a281a621?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b3Jrc2hvcCUyMHNlbWluYXJ8ZW58MXx8fHwxNzU4NzcyMjYzfDA&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Skill Sharing Community Workshop',
    description: 'Teile deine Fähigkeiten und lerne neue von der Community.',
    price: 'CHF 10.-',
    specialFeature: 'Bring your skills',
    source: 'Community Hub',
    tickets: { type: 'link', value: 'https://skills.ch', label: 'Anmelden' }
  },
  {
    id: '14',
    title: 'Repair Café - Reparieren statt wegwerfen',
    location: 'Offener Garten Zürich',
    exactAddress: 'Josefstrasse 106, 8005 Zürich',
    date: '2024-10-06',
    time: '14:00',
    latitude: 47.3838,
    longitude: 8.5292,
    image: 'https://images.unsplash.com/photo-1728933102332-a4f1a281a621?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b3Jrc2hvcCUyMHNlbWluYXJ8ZW58MXx8fHwxNzU4NzcyMjYzfDA&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Repair Community Nachhaltig',
    description: 'Bring kaputte Gegenstände mit und repariere sie mit Hilfe von Experten.',
    specialFeature: 'Nachhaltig & gemeinsam',
    source: 'Repair Network',
    tickets: { type: 'free' }
  },

  // RANDOM & WEIRD EVENTS
  {
    id: '15',
    title: 'Weltrekordversuch - Größtes Käsefondue',
    location: 'Sechseläutenplatz Zürich',
    exactAddress: 'Sechseläutenplatz, 8001 Zürich',
    date: '2024-10-10',
    time: '12:00',
    latitude: 47.3655,
    longitude: 8.5480,
    image: 'https://images.unsplash.com/photo-1675674683873-1232862e3c64?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmb29kJTIwZmVzdGl2YWwlMjBtYXJrZXR8ZW58MXx8fHwxNzU4NzAzNDMzfDA&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Weltrekord Kurios Random',
    description: 'Sei dabei beim Versuch, das größte Käsefondue der Welt zu machen!',
    price: 'CHF 8.-',
    specialFeature: 'Weltrekord-Versuch',
    source: 'Cheese Society',
    tickets: { type: 'link', value: 'https://fondue-record.ch', label: 'Mitmachen' }
  },
  {
    id: '16',
    title: 'Silent Disco im Museum - Stille Tanzparty',
    location: 'Naturhistorisches Museum Basel',
    exactAddress: 'Augustinergasse 2, 4051 Basel',
    date: '2024-10-11',
    time: '20:00',
    latitude: 47.5584,
    longitude: 7.5906,
    image: 'https://images.unsplash.com/photo-1738667181188-a63ec751a646?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXNpYyUyMGNvbmNlcnQlMjBzdGFnZXxlbnwxfHx8fDE3NTg2OTEyNTZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Silent Disco Weird Museum',
    description: 'Tanzparty mit Kopfhörern zwischen Dinosauriern und Mineralien.',
    price: 'CHF 22.-',
    specialFeature: 'Kopfhörer inklusive',
    source: 'Museums After Dark',
    tickets: { type: 'link', value: 'https://silent-museum.ch', label: 'Tickets' }
  },
  {
    id: '17',
    title: 'Cosplay Meetup - Anime & Gaming',
    location: 'Comic Corner Bern',
    exactAddress: 'Kornhausplatz 18, 3011 Bern',
    date: '2024-10-13',
    time: '15:00',
    latitude: 46.9481,
    longitude: 7.4474,
    image: 'https://images.unsplash.com/photo-1719396922900-bd10836d581d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcnQlMjBleGhpYml0aW9uJTIwZ2FsbGVyeXxlbnwxfHx8fDE3NTg2OTIzNzR8MA&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Cosplay Gaming Anime Weird',
    description: 'Treffen für alle Cosplay-Fans. Zeige dein Kostüm und tausche dich aus!',
    price: 'CHF 5.-',
    specialFeature: 'Kostüm-Contest',
    source: 'Anime Society',
    tickets: { type: 'link', value: 'https://cosplay.ch', label: 'Anmelden' }
  },

  // FAMILIE & KINDER EVENTS
  {
    id: '18',
    title: 'Kindertheater - Die kleine Hexe',
    location: 'Theater Rigiblick Zürich',
    exactAddress: 'Germaniastrasse 99, 8006 Zürich',
    date: '2024-09-28',
    time: '14:30',
    latitude: 47.3769,
    longitude: 8.5500,
    image: 'https://images.unsplash.com/photo-1503095396549-807759245b35?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0aGVhdGVyJTIwcGVyZm9ybWFuY2V8ZW58MXx8fHwxNzU4NzA2OTYwfDA&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Kinder Theater Familie',
    description: 'Märchenhaftes Theater für Kinder ab 4 Jahren.',
    price: 'CHF 12.-',
    specialFeature: 'Kinder ab 4 Jahren',
    source: 'Kindertheater ZH',
    tickets: { type: 'phone', value: '044 251 11 06', label: 'Reservierung' }
  },
  {
    id: '19',
    title: 'Bastel-Workshop für Familien',
    location: 'Familienzentrum Basel',
    exactAddress: 'Elsässerstrasse 12, 4056 Basel',
    date: '2024-10-05',
    time: '10:00',
    latitude: 47.5596,
    longitude: 7.5700,
    image: 'https://images.unsplash.com/photo-1728933102332-a4f1a281a621?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b3Jrc2hvcCUyMHNlbWluYXJ8ZW58MXx8fHwxNzU4NzcyMjYzfDA&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Bastel Kreativ Familie Kinder',
    description: 'Gemeinsam basteln und kreativ werden. Für Eltern und Kinder.',
    price: 'CHF 15.- pro Familie',
    specialFeature: 'Materialien inklusive',
    source: 'Familienzentrum',
    tickets: { type: 'free' }
  },

  // SPORT & FITNESS EVENTS
  {
    id: '20',
    title: 'Outdoor Yoga Session - Morgenerwachen',
    location: 'Rheinufer Basel',
    exactAddress: 'Kleinbasler Rheinufer, 4057 Basel',
    date: '2024-09-29',
    time: '07:00',
    latitude: 47.5650,
    longitude: 7.5950,
    image: 'https://images.unsplash.com/photo-1728933102332-a4f1a281a621?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b3Jrc2hvcCUyMHNlbWluYXJ8ZW58MXx8fHwxNzU4NzcyMjYzfDA&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Yoga Fitness Outdoor Sport',
    description: 'Starte den Tag mit entspannendem Yoga am Rhein.',
    price: 'CHF 18.-',
    specialFeature: 'Matte mitbringen',
    source: 'Basel Yoga',
    tickets: { type: 'link', value: 'https://yoga-basel.ch', label: 'Buchen' }
  },
  {
    id: '21',
    title: 'E-Sport Turnier - FIFA Championship',
    location: 'Gaming Center Zürich',
    exactAddress: 'Langstrasse 92, 8004 Zürich',
    date: '2024-10-12',
    time: '18:00',
    latitude: 47.3769,
    longitude: 8.5300,
    image: 'https://images.unsplash.com/photo-1686947079063-f1e7a7dfc6a9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcG9ydHMlMjBldmVudCUyMHN0YWRpdW18ZW58MXx8fHwxNzU4NjkyMzc3fDA&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'E-Sport Gaming Tournament',
    description: 'Zeige deine FIFA-Skills beim großen Turnier.',
    price: 'CHF 25.-',
    specialFeature: 'Preise bis CHF 500.-',
    source: 'E-Sport League',
    tickets: { type: 'link', value: 'https://gaming-zh.ch', label: 'Anmelden' }
  },

  // KULINARIK & FOOD EVENTS  
  {
    id: '22',
    title: 'Veganer Kochkurs - Plant-Based Deluxe',
    location: 'Kochschule Bern',
    exactAddress: 'Effingerstrasse 1, 3011 Bern',
    date: '2024-10-07',
    time: '18:30',
    latitude: 46.9481,
    longitude: 7.4440,
    image: 'https://images.unsplash.com/photo-1675674683873-1232862e3c64?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmb29kJTIwZmVzdGl2YWwlMjBtYXJrZXR8ZW58MXx8fHwxNzU4NzAzNDMzfDA&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Kochkurs Vegan Kulinarik',
    description: 'Lerne köstliche vegane Gerichte zuzubereiten.',
    price: 'CHF 85.-',
    specialFeature: 'Rezepte inklusive',
    source: 'Vegan Society',
    tickets: { type: 'link', value: 'https://vegan-cooking.ch', label: 'Buchen' }
  },
  {
    id: '23',
    title: 'Craft Beer Tasting - Schweizer Biere',
    location: 'Brauerei St. Gallen',
    exactAddress: 'Brauereiweg 10, 9016 St. Gallen',
    date: '2024-10-09',
    time: '19:00',
    latitude: 47.4245,
    longitude: 9.3800,
    image: 'https://images.unsplash.com/photo-1675674683873-1232862e3c64?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmb29kJTIwZmVzdGl2YWwlMjBtYXJrZXR8ZW58MXx8fHwxNzU4NzAzNDMzfDA&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Bier Craftbeer Kulinarik',
    description: 'Entdecke die Vielfalt Schweizer Craft-Biere.',
    price: 'CHF 35.-',
    specialFeature: '6 Biere + Snacks',
    source: 'Craft Beer Club',
    tickets: { type: 'link', value: 'https://craftbeer.ch', label: 'Tickets' }
  },

  // GRATIS EVENTS für Budget-Filter
  {
    id: '24',
    title: 'Open Air Konzert - Stadtmusik Zürich',
    location: 'Bürkliplatz Zürich',
    exactAddress: 'Bürkliplatz, 8001 Zürich',
    date: '2024-09-28',
    time: '18:00',
    latitude: 47.3664,
    longitude: 8.5410,
    image: 'https://images.unsplash.com/photo-1738667181188-a63ec751a646?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXNpYyUyMGNvbmNlcnQlMjBzdGFnZXxlbnwxfHx8fDE3NTg2OTEyNTZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Konzert Open Air Gratis',
    description: 'Kostenloses Konzert der Stadtmusik am Zürichsee.',
    specialFeature: 'Gratis & Outdoor',
    source: 'Stadt Zürich',
    tickets: { type: 'free' }
  },
  {
    id: '25',
    title: 'Flohmarkt Helvetiaplatz - Schnäppchen & Vintage',
    location: 'Helvetiaplatz Bern',
    exactAddress: 'Helvetiaplatz, 3005 Bern',
    date: '2024-10-05',
    time: '08:00',
    latitude: 46.9481,
    longitude: 7.4474,
    image: 'https://images.unsplash.com/photo-1719396922900-bd10836d581d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcnQlMjBleGhpYml0aW9uJTIwZ2FsbGVyeXxlbnwxfHx8fDE3NTg2OTIzNzR8MA&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Flohmarkt Vintage Gratis',
    description: 'Großer Flohmarkt mit Vintage-Schätzen und Schnäppchen.',
    specialFeature: 'Eintritt frei',
    source: 'Markt Bern',
    tickets: { type: 'free' }
  },

  // PREMIUM/TEURE EVENTS für Budget-Filter
  {
    id: '26',
    title: 'Gourmet Dinner - 5-Gang Menü',
    location: 'Restaurant Kronenhalle Zürich',
    exactAddress: 'Rämistrasse 4, 8001 Zürich',
    date: '2024-10-15',
    time: '19:30',
    latitude: 47.3769,
    longitude: 8.5450,
    image: 'https://images.unsplash.com/photo-1675674683873-1232862e3c64?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmb29kJTIwZmVzdGl2YWwlMjBtYXJrZXR8ZW58MXx8fHwxNzU4NzAzNDMzfDA&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Gourmet Fine Dining Premium',
    description: 'Exquisites 5-Gang Menü mit Weinbegleitung in historischem Ambiente.',
    price: 'CHF 180.-',
    specialFeature: 'Michelin-empfohlen',
    source: 'Kronenhalle',
    tickets: { type: 'phone', value: '044 262 99 00', label: 'Reservierung' }
  },
  {
    id: '27',
    title: 'Business Leadership Seminar - Executive Training',
    location: 'Hotel Bellevue Palace Bern',
    exactAddress: 'Kochergasse 3-5, 3011 Bern',
    date: '2024-10-14',
    time: '09:00',
    latitude: 46.9481,
    longitude: 7.4500,
    image: 'https://images.unsplash.com/photo-1728933102332-a4f1a281a621?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b3Jrc2hvcCUyMHNlbWluYXJ8ZW58MXx8fHwxNzU4NzcyMjYzfDA&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Business Seminar Leadership Premium',
    description: 'Intensives Leadership-Training für Führungskräfte.',
    price: 'CHF 450.-',
    specialFeature: 'Zertifikat inklusive',
    source: 'Executive Academy',
    tickets: { type: 'link', value: 'https://leadership.ch', label: 'Anmelden' }
  },

  // ZUSÄTZLICHE EVENTS FÜR BESSERE ABDECKUNG
  {
    id: '28',
    title: 'Morning Run Club - Lauf-Community',
    location: 'Zürichsee Uferpromenade',
    exactAddress: 'Mythenquai, 8002 Zürich',
    date: '2024-09-27',
    time: '06:30',
    latitude: 47.3600,
    longitude: 8.5300,
    image: 'https://images.unsplash.com/photo-1728933102332-a4f1a281a621?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b3Jrc2hvcCUyMHNlbWluYXJ8ZW58MXx8fHwxNzU4NzcyMjYzfDA&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Laufsport Community Früh',
    description: 'Starte den Tag mit unserem freundlichen Lauf-Community am schönen Zürichsee.',
    specialFeature: 'Jeden Freitag',
    source: 'Run Zürich',
    tickets: { type: 'free' }
  },
  {
    id: '29',
    title: 'Techno Afterparty - Late Night Vibes',
    location: 'Club Hive Zürich',
    exactAddress: 'Geroldstrasse 5, 8005 Zürich',
    date: '2024-09-28',
    time: '01:00',
    latitude: 47.3847,
    longitude: 8.5200,
    image: 'https://images.unsplash.com/photo-1738667181188-a63ec751a646?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXNpYyUyMGNvbmNlcnQlMjBzdGFnZXxlbnwxfHx8fDE3NTg2OTEyNTZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Techno Club Nachtleben',
    description: 'Non-stop Techno bis zum Sonnenaufgang mit internationalen DJs.',
    price: 'CHF 30.-',
    specialFeature: 'Bis 08:00 Uhr',
    source: 'Club Scene',
    tickets: { type: 'link', value: 'https://clubhive.ch', label: 'Tickets' }
  },
  {
    id: '30',
    title: 'Puppy Yoga - Yoga mit Hundewelpen',
    location: 'Yoga Studio Basel',
    exactAddress: 'Spalenring 145, 4055 Basel',
    date: '2024-10-01',
    time: '17:00',
    latitude: 47.5596,
    longitude: 7.5800,
    image: 'https://images.unsplash.com/photo-1728933102332-a4f1a281a621?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b3Jrc2hvcCUyMHNlbWluYXJ8ZW58MXx8fHwxNzU4NzcyMjYzfDA&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Yoga Hunde Unusual Wellness',
    description: 'Entspanne bei Yoga während süße Hundewelpen um dich herumtollen.',
    price: 'CHF 45.-',
    specialFeature: 'Mit echten Welpen',
    source: 'Wellness Basel',
    tickets: { type: 'link', value: 'https://puppyyoga.ch', label: 'Buchen' }
  }
];

export default function App() {
  const [showStartScreen, setShowStartScreen] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showSearchMode, setShowSearchMode] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  // Demo mode removed - using AI-powered search
  
  // Favorites management
  const [favoriteEvents, setFavoriteEvents] = useState<Set<string>>(new Set());
  
  // Simplified session management
  const [sessions, setSessions] = useState<SimpleSearchSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>('');
  
  // Search History management
  const [searchHistory, setSearchHistory] = useState<SearchHistoryEntry[]>([]);
  const [savedTemplates, setSavedTemplates] = useState<SavedSearchTemplate[]>([
    {
      id: 'template-1',
      name: 'Weekend-Familie',
      location: 'Beliebiger Ort',
      filters: {
        categories: ['familie'],
        timeRange: 'thisWeekend',
        budget: { onlyFree: false, min: 0, max: 50 }
      }
    }
  ]);
  
  const [filters, setFilters] = useState<SearchFilters>({
    location: '',
    useCurrentLocation: false,
    radius: 25,
    categories: [],
    subcategories: [],
    timeRange: 'thisWeek',
    dateFrom: undefined,
    dateTo: undefined,
    budget: {
      min: 0,
      max: 200,
      onlyFree: false
    },
    keywords: '',
    quickFilters: [],
    specialTags: [],
    searchMode: 'standard',
    eventFrequency: [],
    advancedFilters: {
      accessibility: [],
      ageGroups: [],
      features: [],
      catering: []
    }
  });

  // Simple session creation
  const createSession = (location: string, resultsCount: number = 0) => {
    const sessionId = `session_${Date.now()}`;
    const newSession: SimpleSearchSession = {
      id: sessionId,
      location,
      resultsCount
    };
    
    setSessions(prev => [...prev, newSession]);
    setActiveSessionId(sessionId);
    return sessionId;
  };

  const handleStartSearch = (searchFilters: SearchFilters) => {
    setFilters(searchFilters);
    
    // Add to search history
    const historyEntry: SearchHistoryEntry = {
      id: `history_${Date.now()}`,
      location: searchFilters.location || 'Unbekannt',
      radius: searchFilters.radius || 25,
      filters: searchFilters.categories || [],
      timestamp: new Date(),
      resultsCount: 0 // Will be updated later
    };
    setSearchHistory(prev => [historyEntry, ...prev.slice(0, 9)]); // Keep last 10 searches
    
    createSession(searchFilters.location || 'Unbekannt');
    setShowStartScreen(false);
  };

  const handleSessionSwitch = (sessionId: string) => {
    setActiveSessionId(sessionId);
  };

  const handleNewSearch = () => {
    setShowStartScreen(true);
  };

  const handleQuickFilter = (quickFilters: Partial<SearchFilters>) => {
    // Deep merge filters to properly handle nested objects like budget
    const updatedFilters: SearchFilters = {
      ...filters,
      ...quickFilters,
      // Handle budget merge specially to avoid overwriting other budget properties
      budget: quickFilters.budget ? {
        ...filters.budget,
        ...quickFilters.budget
      } : filters.budget,
      // Handle advancedFilters merge specially
      advancedFilters: quickFilters.advancedFilters ? {
        ...filters.advancedFilters,
        ...quickFilters.advancedFilters
      } : filters.advancedFilters
    };
    setFilters(updatedFilters);
  };

  const handleAdvancedFilters = () => {
    setShowAdvancedFilters(true);
  };

  const handleSearchModeToggle = () => {
    setShowSearchMode(!showSearchMode);
  };

  const handleFiltersChange = (newFilters: SearchFilters) => {
    setFilters(newFilters);
    // Automatically close search mode when filters are applied
    setShowSearchMode(false);
  };

  // Search History handlers
  const handleLoadSearch = (searchId: string) => {
    const search = searchHistory.find(s => s.id === searchId);
    if (search) {
      const loadedFilters: SearchFilters = {
        ...filters,
        location: search.location,
        radius: search.radius,
        categories: search.filters || []
      };
      setFilters(loadedFilters);
      createSession(search.location, search.resultsCount);
    }
  };

  const handleDeleteSearch = (searchId: string) => {
    setSearchHistory(prev => prev.filter(s => s.id !== searchId));
  };

  const handleApplyTemplate = (template: SavedSearchTemplate) => {
    const templateFilters: SearchFilters = {
      ...filters,
      ...template.filters,
      location: template.location === 'Beliebiger Ort' ? filters.location : template.location
    };
    setFilters(templateFilters);
    if (template.location !== 'Beliebiger Ort') {
      createSession(template.location);
    }
  };

  const handleClearAllHistory = () => {
    setSearchHistory([]);
  };

  // Quick Filter handlers
  const handleQuickFilterChange = (quickFilters: QuickFilterState) => {
    // Store quick filter state for UI
    console.log('Quick filters updated:', quickFilters);
  };

  // Favorites handlers
  const toggleFavorite = (eventId: string) => {
    setFavoriteEvents(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(eventId)) {
        newFavorites.delete(eventId);
      } else {
        newFavorites.add(eventId);
      }
      return newFavorites;
    });
  };

  const isFavorite = (eventId: string) => {
    return favoriteEvents.has(eventId);
  };

  // Calculate distance between two coordinates (Haversine formula)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) + 
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Enhanced filtering with demo mode support
  const filteredEvents = useMemo(() => {
    let events = mockEvents.filter(event => {
      // Favorites-only filter (applied first)
      if (filters.showFavoritesOnly === true) {
        if (!favoriteEvents.has(event.id)) return false;
      }

      // Keywords filter
      if (filters.keywords && filters.keywords.trim()) {
        const keywords = filters.keywords.toLowerCase();
        const matchesKeywords = 
          event.title.toLowerCase().includes(keywords) ||
          event.location.toLowerCase().includes(keywords) ||
          event.category.toLowerCase().includes(keywords) ||
          (event.description && event.description.toLowerCase().includes(keywords));
        if (!matchesKeywords) return false;
      }

      // Category filter
      if (filters.categories.length > 0 || filters.subcategories.length > 0) {
        const categoryMapping: { [key: string]: string[] } = {
          'konzerte': ['konzert', 'club'],
          'buehne': ['theater'],
          'kunst': ['ausstellung'],
          'familie': ['kinder'],
          'sport': ['sport'],
          'messen': ['markt'],
          'kulinarik': ['festival'],
          'wissen': ['workshop'],
          'specials': ['special'],
          // New unique categories
          'unique-underground': ['underground', 'pop-up', 'secret', 'alternative'],
          'community-spontan': ['community', 'spontan', 'nachbarschaft'],
          'random-weird': ['weird', 'kurios', 'mystery', 'random']
        };
        
        let matchesCategory = false;
        
        // Check main categories
        if (filters.categories.length > 0) {
          for (const category of filters.categories) {
            const allowedCategories = categoryMapping[category] || [category];
            if (allowedCategories.some(cat => event.category.toLowerCase().includes(cat))) {
              matchesCategory = true;
              break;
            }
          }
        }
        
        // Check subcategories
        if (!matchesCategory && filters.subcategories.length > 0) {
          for (const subcategory of filters.subcategories) {
            if (event.category.toLowerCase().includes(subcategory.replace('-', ' ')) ||
                event.title.toLowerCase().includes(subcategory.replace('-', ' ')) ||
                (event.description && event.description.toLowerCase().includes(subcategory.replace('-', ' ')))) {
              matchesCategory = true;
              break;
            }
          }
        }
        
        if (!matchesCategory) return false;
      }

      // Time range filter (Quick Filter compatibility)
      const eventDate = new Date(event.date);
      const now = new Date();
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const thisWeekEnd = new Date(today);
      thisWeekEnd.setDate(thisWeekEnd.getDate() + (7 - today.getDay()));
      
      // Apply time range filters
      if (filters.timeRange) {
        switch (filters.timeRange) {
          case 'now':
            // Events happening within the next 3 hours
            const nowPlus3Hours = new Date(now.getTime() + 3 * 60 * 60 * 1000);
            if (eventDate < now || eventDate > nowPlus3Hours) return false;
            break;
          case 'today':
            const todayEnd = new Date(today);
            todayEnd.setHours(23, 59, 59, 999);
            if (eventDate < today || eventDate > todayEnd) return false;
            break;
          case 'tomorrow':
            const tomorrowEnd = new Date(tomorrow);
            tomorrowEnd.setHours(23, 59, 59, 999);
            if (eventDate < tomorrow || eventDate > tomorrowEnd) return false;
            break;
          case 'thisWeekend':
            const saturday = new Date(today);
            saturday.setDate(saturday.getDate() + (6 - today.getDay()));
            const sundayEnd = new Date(saturday);
            sundayEnd.setDate(sundayEnd.getDate() + 1);
            sundayEnd.setHours(23, 59, 59, 999);
            if (eventDate < saturday || eventDate > sundayEnd) return false;
            break;
          case 'thisWeek':
            // Default behavior - show events for this week
            if (eventDate < today || eventDate > thisWeekEnd) return false;
            break;
        }
      }
      
      // Custom date range filter (from advanced filters)
      if (filters.dateFrom) {
        const fromDate = new Date(filters.dateFrom);
        fromDate.setHours(0, 0, 0, 0);
        if (eventDate < fromDate) return false;
      }
      
      if (filters.dateTo) {
        const toDate = new Date(filters.dateTo);
        toDate.setHours(23, 59, 59, 999);
        if (eventDate > toDate) return false;
      }

      // Budget/Price filter
      if (filters.budget) {
        // Free events filter
        if (filters.budget.onlyFree) {
          if (event.price && !event.price.toLowerCase().includes('gratis') && !event.tickets?.type === 'free') {
            return false;
          }
        } else {
          // Price range filter
          if (event.price && filters.budget.max !== undefined) {
            const priceMatch = event.price.match(/(\d+)/);
            if (priceMatch) {
              const eventPrice = parseInt(priceMatch[1]);
              if (eventPrice > filters.budget.max) return false;
              if (filters.budget.min !== undefined && eventPrice < filters.budget.min) return false;
            }
          }
        }
      }

      // Special tags filter
      if (filters.specialTags && filters.specialTags.length > 0) {
        const hasSpecialTag = filters.specialTags.some(tag => {
          switch (tag) {
            case 'indoor':
              return !event.category.toLowerCase().includes('outdoor') && 
                     !event.description?.toLowerCase().includes('outdoor');
            case 'barrierefrei':
              return event.description?.toLowerCase().includes('barrierefrei') ||
                     event.description?.toLowerCase().includes('accessible');
            case 'familien':
              return event.category.toLowerCase().includes('familie') ||
                     event.category.toLowerCase().includes('kinder') ||
                     event.description?.toLowerCase().includes('familie') ||
                     event.description?.toLowerCase().includes('kinder');
            case 'tickets':
              return event.tickets?.type === 'link' || event.tickets?.type === 'website';
            default:
              return false;
          }
        });
        if (!hasSpecialTag) return false;
      }

      // Location and radius filter (simplified - in real app would use geocoding)
      if (filters.location && filters.location.trim()) {
        // For demo purposes, we'll just do a simple string match
        // In a real app, you'd geocode the location and calculate actual distances
        const locationMatch = event.location.toLowerCase().includes(filters.location.toLowerCase());
        if (!locationMatch) {
          // Simple distance simulation based on known Swiss cities
          const swissCities = {
            'zürich': { lat: 47.3769, lon: 8.5417 },
            'basel': { lat: 47.5596, lon: 7.5886 },
            'bern': { lat: 46.9481, lon: 7.4474 },
            'st. gallen': { lat: 47.4245, lon: 9.3767 }
          };
          
          const searchLocation = swissCities[filters.location.toLowerCase() as keyof typeof swissCities];
          if (searchLocation && filters.radius) {
            const distance = calculateDistance(
              searchLocation.lat, searchLocation.lon,
              event.latitude, event.longitude
            );
            if (distance > filters.radius) return false;
          }
        }
      }

      return true;
    });

    // Ensure we always have results
    if (events.length === 0) {
      // If no events match strict filters, apply relaxed filtering
      events = mockEvents.filter(event => {
        // Keep favorites filter and keywords as they are important
        if (filters.showFavoritesOnly === true && !favoriteEvents.has(event.id)) return false;
        
        if (filters.keywords && filters.keywords.trim()) {
          const keywords = filters.keywords.toLowerCase();
          const matchesKeywords = 
            event.title.toLowerCase().includes(keywords) ||
            event.location.toLowerCase().includes(keywords) ||
            event.category.toLowerCase().includes(keywords) ||
            (event.description && event.description.toLowerCase().includes(keywords));
          if (!matchesKeywords) return false;
        }
        
        // Relax category filter - if no exact match, show similar categories
        if (filters.categories.length > 0) {
          const categoryMapping: { [key: string]: string[] } = {
            'konzerte': ['konzert', 'club', 'musik', 'jazz', 'techno'],
            'buehne': ['theater', 'performance', 'show'],
            'kunst': ['ausstellung', 'museum', 'galerie', 'kunst', 'vintage'],
            'familie': ['kinder', 'familie', 'familie', 'bastel'],
            'sport': ['sport', 'fitness', 'yoga', 'e-sport'],
            'messen': ['markt', 'messe', 'floh'],
            'kulinarik': ['festival', 'food', 'kochkurs', 'beer', 'vegan', 'kulinar'],
            'wissen': ['workshop', 'seminar', 'kurs'],
            'unique-underground': ['underground', 'pop-up', 'secret', 'alternative', 'guerilla'],
            'community-spontan': ['community', 'spontan', 'nachbarschaft', 'repair', 'skill'],
            'random-weird': ['weird', 'kurios', 'mystery', 'random', 'weltrekord', 'silent', 'cosplay']
          };
          
          // More lenient category matching in demo mode
          let matchesCategory = false;
          for (const category of filters.categories) {
            const allowedCategories = categoryMapping[category] || [category];
            if (allowedCategories.some(cat => 
              event.category.toLowerCase().includes(cat) ||
              event.title.toLowerCase().includes(cat) ||
              event.description?.toLowerCase().includes(cat)
            )) {
              matchesCategory = true;
              break;
            }
          }
          if (!matchesCategory) return false;
        }
        
        // More lenient time filtering in demo mode
        if (filters.timeRange && filters.timeRange !== 'thisWeek') {
          const eventDate = new Date(event.date);
          const now = new Date();
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const nextWeek = new Date(today);
          nextWeek.setDate(nextWeek.getDate() + 14); // Extended to 2 weeks in demo mode
          
          if (eventDate < today || eventDate > nextWeek) return false;
        }
        
        return true;
      });
    }

    // Apply search mode logic
    if (filters.searchMode === 'discover') {
      // Prioritize unique/underground events
      events = events.sort((a, b) => {
        const aIsUnique = a.category.toLowerCase().includes('underground') || 
                          a.category.toLowerCase().includes('pop-up') ||
                          a.title.toLowerCase().includes('secret') ||
                          a.title.toLowerCase().includes('alternative');
        const bIsUnique = b.category.toLowerCase().includes('underground') || 
                          b.category.toLowerCase().includes('pop-up') ||
                          b.title.toLowerCase().includes('secret') ||
                          b.title.toLowerCase().includes('alternative');
        
        if (aIsUnique && !bIsUnique) return -1;
        if (!aIsUnique && bIsUnique) return 1;
        return 0;
      });
    }

    return events;
  }, [filters, favoriteEvents]);

  // Update active session with results count
  useEffect(() => {
    if (activeSessionId) {
      setSessions(prev => 
        prev.map(session => 
          session.id === activeSessionId 
            ? { ...session, resultsCount: filteredEvents.length }
            : session
        )
      );
    }
  }, [filteredEvents.length, activeSessionId]);

  // Show settings screen if settings are open
  if (showSettings) {
    return <SettingsScreen onClose={() => setShowSettings(false)} />;
  }

  // Show start screen if not started searching yet
  if (showStartScreen) {
    return <AdvancedStartScreen 
      onStartSearch={handleStartSearch} 
      onSettingsClick={() => setShowSettings(true)}
      onShowResults={() => {
        setShowStartScreen(false);
        setViewMode('list');
      }}
    />;
  }

  return (
    <div className="min-h-screen bg-background">
      <SimpleNavigationHeader
        sessions={sessions}
        activeSessionId={activeSessionId}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onSessionSwitch={handleSessionSwitch}
        onNewSearch={handleNewSearch}
        onSettingsClick={() => setShowSettings(true)}
        onQuickFilter={handleQuickFilter}
        onAdvancedFilters={handleAdvancedFilters}
        showSearchMode={showSearchMode}
        onSearchModeToggle={handleSearchModeToggle}
        searchHistory={searchHistory}
        savedTemplates={savedTemplates}
        onLoadSearch={handleLoadSearch}
        onDeleteSearch={handleDeleteSearch}
        onApplyTemplate={handleApplyTemplate}
        onClearAllHistory={handleClearAllHistory}
        currentFilters={filters}
        onQuickFilterChange={handleQuickFilterChange}
        favoriteEvents={favoriteEvents}
      />
      
      {/* Advanced Filters Modal */}
      {showAdvancedFilters && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-20">
          <div className="bg-background rounded-lg shadow-lg w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
            <AdvancedSearchDropdown
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onClose={() => setShowAdvancedFilters(false)}
            />
          </div>
        </div>
      )}

      {/* Search Mode Overlay */}
      {showSearchMode && (
        <div className="fixed inset-0 bg-background z-40 pt-32 md:pt-40">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto">
              <AdvancedSearchDropdown
                filters={filters}
                onFiltersChange={handleFiltersChange}
                onClose={() => setShowSearchMode(false)}
                fullscreen={true}
              />
            </div>
          </div>
        </div>
      )}
      
      <main className="container mx-auto px-4 py-6">
        {viewMode === 'list' ? (
          <div className="space-y-4">
            {filteredEvents.length > 0 ? (
              <>
                {false && (
                  <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-sm text-amber-800">
                      ⚠️ <strong>Demo-Modus deaktiviert</strong> - Zeigt nur exakte Treffer. 
                      <Button 
                        variant="link" 
                        size="sm" 
                        className="p-0 h-auto text-amber-800 underline ml-1"
                        onClick={() => setDemoMode(true)}
                      >
                        Demo-Modus aktivieren
                      </Button> für mehr Ergebnisse.
                    </p>
                  </div>
                )}
                {filteredEvents.length !== mockEvents.length && (
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      🎯 <strong>Demo-Modus aktiv</strong> - Zeigt {filteredEvents.length} passende Events. 
                      Manche Ergebnisse wurden durch erweiterte Suche gefunden.
                    </p>
                  </div>
                )}
                {filteredEvents.map(event => (
                  <EventCard
                    key={event.id}
                    id={event.id}
                    title={event.title}
                    location={event.location}
                    exactAddress={event.exactAddress}
                    date={event.date}
                    time={event.time}
                    image={event.image}
                    category={event.category}
                    description={event.description}
                    price={event.price}
                    specialFeature={event.specialFeature}
                    source={event.source}
                    tickets={event.tickets}
                    isFavorite={isFavorite(event.id)}
                    onToggleFavorite={() => toggleFavorite(event.id)}
                  />
                ))}
              </>
            ) : (
              <div className="text-center py-12 space-y-4">
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Keine Events gefunden 😔</h3>
                  <p className="text-muted-foreground">
                    Für die gewählten Filter wurden keine passenden Events gefunden.
                  </p>
                </div>
                
                <div className="space-y-3 max-w-md mx-auto">
                  <div className="text-sm space-y-2">
                    <p className="font-medium text-foreground">💡 Versuchen Sie:</p>
                    <ul className="text-left text-muted-foreground space-y-1">
                      <li>• Erweitern Sie den Suchradius</li>
                      <li>• Wählen Sie andere Kategorien</li>
                      <li>• Ändern Sie den Zeitraum</li>
                      <li>• Entfernen Sie spezielle Filter</li>
                    </ul>
                  </div>
                  
                  <div className="flex gap-2 justify-center pt-4">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setDemoMode(true)}
                      className="text-xs"
                    >
                      🎯 Demo-Modus aktivieren
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleNewSearch}
                      className="text-xs"
                    >
                      🔄 Neue Suche
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <MapView 
            events={filteredEvents.map(event => ({
              ...event,
              isFavorite: isFavorite(event.id),
              onToggleFavorite: () => toggleFavorite(event.id)
            }))} 
          />
        )}
      </main>
    </div>
  );
}