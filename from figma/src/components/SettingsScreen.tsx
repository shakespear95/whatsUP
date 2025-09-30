import { ArrowLeft, ChevronRight, User, Heart, Bell, Globe, Palette, MapPin, HardDrive, MessageCircle, HelpCircle, Info, Mail, LogOut } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Separator } from "./ui/separator";

interface SettingsScreenProps {
  onClose: () => void;
}

export function SettingsScreen({ onClose }: SettingsScreenProps) {
  const handleLogout = () => {
    // In einer echten App würde hier eine Logout-Logik implementiert
    if (confirm("Möchten Sie sich wirklich ausloggen?")) {
      console.log("Benutzer ausgeloggt");
      // Hier würde die App zur Login-Seite navigieren
    }
  };

  const settingsGroups = [
    {
      title: "ACCOUNT",
      items: [
        {
          icon: User,
          label: "Mein Profil",
          onClick: () => console.log("Profil öffnen")
        },
        {
          icon: Heart,
          label: "Gespeicherte Events",
          onClick: () => console.log("Gespeicherte Events öffnen")
        },
        {
          icon: Bell,
          label: "Benachrichtigungen",
          onClick: () => console.log("Benachrichtigungen öffnen")
        }
      ]
    },
    {
      title: "APP-EINSTELLUNGEN",
      items: [
        {
          icon: Globe,
          label: "Sprache & Region",
          onClick: () => console.log("Sprache & Region öffnen")
        },
        {
          icon: Palette,
          label: "Darstellung",
          onClick: () => console.log("Darstellung öffnen")
        },
        {
          icon: MapPin,
          label: "Standort-Einstellungen",
          onClick: () => console.log("Standort-Einstellungen öffnen")
        },
        {
          icon: HardDrive,
          label: "Cache & Daten",
          onClick: () => console.log("Cache & Daten öffnen")
        }
      ]
    },
    {
      title: "SUPPORT",
      items: [
        {
          icon: MessageCircle,
          label: "Feedback senden",
          onClick: () => console.log("Feedback senden")
        },
        {
          icon: HelpCircle,
          label: "Hilfe & FAQ",
          onClick: () => console.log("Hilfe & FAQ öffnen")
        },
        {
          icon: Info,
          label: "Über WhatsUP",
          onClick: () => console.log("Über WhatsUP öffnen")
        },
        {
          icon: Mail,
          label: "Kontakt",
          onClick: () => console.log("Kontakt öffnen")
        }
      ]
    }
  ];

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
            <h1 className="text-lg font-medium">Einstellungen</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6 max-w-md">
        <div className="space-y-6">
          {settingsGroups.map((group, groupIndex) => (
            <div key={groupIndex} className="space-y-3">
              <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {group.title}
              </h2>
              
              <Card className="divide-y">
                {group.items.map((item, itemIndex) => {
                  const IconComponent = item.icon;
                  return (
                    <Button
                      key={itemIndex}
                      variant="ghost"
                      className="w-full justify-between h-auto py-4 px-4 rounded-none hover:bg-accent/50"
                      onClick={item.onClick}
                    >
                      <div className="flex items-center gap-3">
                        <IconComponent className="w-5 h-5 text-muted-foreground" />
                        <span className="text-sm font-normal">{item.label}</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </Button>
                  );
                })}
              </Card>
            </div>
          ))}

          {/* App Version */}
          <div className="pt-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">
              APP VERSION 1.0.0
            </p>
          </div>

          {/* Logout Button */}
          <div className="pt-2">
            <Button
              variant="destructive"
              onClick={handleLogout}
              className="w-full"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Ausloggen
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}