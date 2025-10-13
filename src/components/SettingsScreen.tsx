import { ArrowLeft, ChevronRight, User, Heart, Bell, Globe, Palette, MapPin, HardDrive, MessageCircle, HelpCircle, Info, Mail, LogOut, LogIn } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Separator } from "./ui/separator";
import { useAuth } from "../hooks/useAuth";
import { sendEmailOTP, verifyEmailOTP, createUserProfile, getUserProfile } from "../lib/supabase";
import { UserProfile } from "../pages/UserProfile";
import { SavedEvents } from "../pages/SavedEvents";
import { LanguageSelection } from "../pages/LanguageSelection";
import { useLanguage } from "../contexts/LanguageContext";

interface SettingsScreenProps {
  onClose: () => void;
}

type ActivePage = 'settings' | 'profile' | 'saved-events' | 'language';

export function SettingsScreen({ onClose }: SettingsScreenProps) {
  const { user, loading, signOut } = useAuth();
  const { t } = useLanguage();

  // Navigation state
  const [activePage, setActivePage] = useState<ActivePage>('settings');

  // Authentication state
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');

  // Profile state
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [location, setLocation] = useState('');

  const [step, setStep] = useState<'email' | 'otp' | 'profile'>('email');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Show different pages based on activePage
  if (activePage === 'profile') {
    return <UserProfile onClose={() => setActivePage('settings')} />;
  }

  if (activePage === 'saved-events') {
    return <SavedEvents onClose={() => setActivePage('settings')} />;
  }

  if (activePage === 'language') {
    return <LanguageSelection onClose={() => setActivePage('settings')} />;
  }

  const handleLogout = async () => {
    if (confirm("Möchten Sie sich wirklich ausloggen?")) {
      try {
        await signOut();
        console.log("Benutzer ausgeloggt");
        // Reset form
        setStep('email');
        setEmail('');
        setOtpCode('');
        setFullName('');
      } catch (error) {
        console.error("Logout fehlgeschlagen:", error);
        alert("Logout fehlgeschlagen. Bitte versuchen Sie es erneut.");
      }
    }
  };

  const handleSendOTP = async () => {
    if (!email || !email.includes('@')) {
      alert('Bitte geben Sie eine gültige E-Mail-Adresse ein.');
      return;
    }

    setIsSubmitting(true);
    try {
      await sendEmailOTP(email);
      setStep('otp');
      alert('Ein 6-stelliger Code wurde an Ihre E-Mail gesendet!');
    } catch (error: any) {
      console.error('OTP senden fehlgeschlagen:', error);
      alert('Fehler beim Senden des Codes. Bitte versuchen Sie es erneut.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otpCode || otpCode.length !== 6) {
      alert('Bitte geben Sie den 6-stelligen Code ein.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await verifyEmailOTP(email, otpCode);

      // Check if user already has a name
      if (result.user?.user_metadata?.full_name) {
        // User already registered, just log in
        console.log('Benutzer angemeldet:', result.user);
      } else {
        // New user, collect profile info
        setStep('profile');
      }
    } catch (error: any) {
      console.error('OTP Verifizierung fehlgeschlagen:', error);
      alert('Ungültiger Code. Bitte überprüfen Sie Ihre E-Mail und versuchen Sie es erneut.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCompleteProfile = async () => {
    // Validate required fields
    if (!fullName || fullName.trim().length < 2) {
      alert('Bitte geben Sie Ihren Namen ein.');
      return;
    }

    // Validate phone number (optional but if provided, should be valid)
    if (phoneNumber && !/^[\d\s\+\-\(\)]+$/.test(phoneNumber)) {
      alert('Bitte geben Sie eine gültige Telefonnummer ein.');
      return;
    }

    // Validate date of birth (optional but if provided, should be valid)
    if (dateOfBirth) {
      const birthDate = new Date(dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();

      if (age < 13) {
        alert('Sie müssen mindestens 13 Jahre alt sein.');
        return;
      }

      if (age > 120) {
        alert('Bitte geben Sie ein gültiges Geburtsdatum ein.');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      await createUserProfile({
        full_name: fullName.trim(),
        phone_number: phoneNumber.trim() || undefined,
        date_of_birth: dateOfBirth || undefined,
        location: location.trim() || undefined,
      });

      console.log('Profil erstellt:', { fullName, phoneNumber, dateOfBirth, location });
      // User will be automatically updated via auth state change
    } catch (error: any) {
      console.error('Profil-Update fehlgeschlagen:', error);
      alert('Fehler beim Speichern Ihres Profils. Bitte versuchen Sie es erneut.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const settingsGroups = [
    {
      title: "ACCOUNT",
      items: [
        {
          icon: User,
          label: "Mein Profil",
          onClick: () => setActivePage('profile'),
          disabled: !user
        },
        {
          icon: Heart,
          label: "Gespeicherte Events",
          onClick: () => setActivePage('saved-events'),
          disabled: !user
        },
        {
          icon: Bell,
          label: "Benachrichtigungen",
          onClick: () => alert("Benachrichtigungen werden in einer zukünftigen Version verfügbar sein!"),
          disabled: !user
        }
      ]
    },
    {
      title: "APP-EINSTELLUNGEN",
      items: [
        {
          icon: Globe,
          label: "Sprache & Region",
          onClick: () => setActivePage('language')
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
          {/* User Profile Section */}
          {user ? (
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  {user.user_metadata?.avatar_url ? (
                    <img
                      src={user.user_metadata.avatar_url}
                      alt={user.user_metadata?.full_name || 'User'}
                      className="w-12 h-12 rounded-full"
                    />
                  ) : (
                    <User className="w-6 h-6 text-primary" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{user.user_metadata?.full_name || 'Benutzer'}</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="p-4">
              <div className="space-y-4">
                <div className="text-center space-y-2">
                  <User className="w-12 h-12 mx-auto text-muted-foreground" />
                  <div>
                    <p className="font-medium">Nicht angemeldet</p>
                    <p className="text-sm text-muted-foreground">
                      Melden Sie sich an, um Events zu speichern
                    </p>
                  </div>
                </div>

                {step === 'email' && (
                  <div className="space-y-3">
                    <Input
                      type="email"
                      placeholder="ihre.email@beispiel.de"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isSubmitting}
                      className="text-center"
                    />
                    <Button
                      onClick={handleSendOTP}
                      disabled={isSubmitting || !email}
                      className="w-full"
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      {isSubmitting ? 'Wird gesendet...' : 'Code an E-Mail senden'}
                    </Button>
                    <p className="text-xs text-center text-muted-foreground">
                      Sie erhalten einen 6-stelligen Code per E-Mail
                    </p>
                  </div>
                )}

                {step === 'otp' && (
                  <div className="space-y-3">
                    <div className="text-center">
                      <p className="text-sm font-medium">Code gesendet an:</p>
                      <p className="text-sm text-muted-foreground">{email}</p>
                    </div>
                    <Input
                      type="text"
                      placeholder="123456"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      disabled={isSubmitting}
                      maxLength={6}
                      className="text-center text-2xl tracking-widest"
                    />
                    <Button
                      onClick={handleVerifyOTP}
                      disabled={isSubmitting || otpCode.length !== 6}
                      className="w-full"
                    >
                      {isSubmitting ? 'Wird überprüft...' : 'Code bestätigen'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setStep('email')}
                      disabled={isSubmitting}
                      className="w-full"
                    >
                      E-Mail ändern
                    </Button>
                  </div>
                )}

                {step === 'profile' && (
                  <div className="space-y-3">
                    <div className="text-center space-y-1">
                      <p className="text-sm font-medium">Vervollständigen Sie Ihr Profil</p>
                      <p className="text-xs text-muted-foreground">
                        * Pflichtfelder
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-medium text-muted-foreground">
                        Vollständiger Name *
                      </label>
                      <Input
                        type="text"
                        placeholder="Max Mustermann"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        disabled={isSubmitting}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-medium text-muted-foreground">
                        Telefonnummer
                      </label>
                      <Input
                        type="tel"
                        placeholder="+41 79 123 45 67"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        disabled={isSubmitting}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-medium text-muted-foreground">
                        Geburtsdatum
                      </label>
                      <Input
                        type="date"
                        value={dateOfBirth}
                        onChange={(e) => setDateOfBirth(e.target.value)}
                        disabled={isSubmitting}
                        max={new Date().toISOString().split('T')[0]}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-medium text-muted-foreground">
                        Standort
                      </label>
                      <Input
                        type="text"
                        placeholder="Zürich, Schweiz"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        disabled={isSubmitting}
                      />
                    </div>

                    <Button
                      onClick={handleCompleteProfile}
                      disabled={isSubmitting || !fullName.trim()}
                      className="w-full"
                    >
                      {isSubmitting ? 'Wird gespeichert...' : 'Profil erstellen'}
                    </Button>

                    <p className="text-xs text-center text-muted-foreground">
                      Diese Informationen helfen uns, Ihre Erfahrung zu personalisieren
                    </p>
                  </div>
                )}
              </div>
            </Card>
          )}

          {settingsGroups.map((group, groupIndex) => (
            <div key={groupIndex} className="space-y-3">
              <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {group.title}
              </h2>
              
              <Card className="divide-y">
                {group.items.map((item, itemIndex) => {
                  const IconComponent = item.icon;
                  const isDisabled = item.disabled || false;

                  return (
                    <Button
                      key={itemIndex}
                      variant="ghost"
                      className="w-full justify-between h-auto py-4 px-4 rounded-none hover:bg-accent/50 disabled:opacity-50"
                      onClick={item.onClick}
                      disabled={isDisabled}
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

          {/* Logout Button - Only show if user is logged in */}
          {user && (
            <div className="pt-2">
              <Button
                variant="destructive"
                onClick={handleLogout}
                className="w-full"
                disabled={loading}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Ausloggen
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}