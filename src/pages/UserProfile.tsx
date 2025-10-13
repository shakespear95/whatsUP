import { ArrowLeft, User, Mail, Phone, Calendar, MapPin, Edit2, Save, X } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { useAuth } from "../hooks/useAuth";
import { getUserProfile, createUserProfile } from "../lib/supabase";

interface UserProfileProps {
  onClose: () => void;
}

export function UserProfile({ onClose }: UserProfileProps) {
  const { user } = useAuth();

  // Profile state
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  // Form state
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [location, setLocation] = useState('');

  // Load profile on mount
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const profileData = await getUserProfile();
      setProfile(profileData);

      if (profileData) {
        setFullName(profileData.full_name || '');
        setPhoneNumber(profileData.phone_number || '');
        setDateOfBirth(profileData.date_of_birth || '');
        setLocation(profileData.location || '');
      } else if (user) {
        // Fallback to user metadata
        setFullName(user.user_metadata?.full_name || '');
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const handleSave = async () => {
    if (!fullName || fullName.trim().length < 2) {
      alert('Bitte geben Sie Ihren Namen ein.');
      return;
    }

    setIsSaving(true);
    try {
      await createUserProfile({
        full_name: fullName.trim(),
        phone_number: phoneNumber.trim() || undefined,
        date_of_birth: dateOfBirth || undefined,
        location: location.trim() || undefined,
      });

      // Reload profile
      await loadProfile();
      setIsEditing(false);
      alert('Profil erfolgreich gespeichert!');
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Fehler beim Speichern. Bitte versuchen Sie es erneut.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset to original values
    if (profile) {
      setFullName(profile.full_name || '');
      setPhoneNumber(profile.phone_number || '');
      setDateOfBirth(profile.date_of_birth || '');
      setLocation(profile.location || '');
    }
    setIsEditing(false);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Nicht angegeben';
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 bg-background border-b z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-9 w-9"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h1 className="text-lg font-medium">Mein Profil</h1>
            </div>

            {!isEditing ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                <Edit2 className="w-4 h-4 mr-2" />
                Bearbeiten
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancel}
                  disabled={isSaving}
                >
                  <X className="w-4 h-4 mr-2" />
                  Abbrechen
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={isSaving || !fullName.trim()}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isSaving ? 'Wird gespeichert...' : 'Speichern'}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6 max-w-md">
        <div className="space-y-6">
          {/* Profile Picture */}
          <Card className="p-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                {user?.user_metadata?.avatar_url ? (
                  <img
                    src={user.user_metadata.avatar_url}
                    alt={fullName}
                    className="w-24 h-24 rounded-full object-cover"
                  />
                ) : (
                  <User className="w-12 h-12 text-primary" />
                )}
              </div>
              <div className="text-center">
                <h2 className="text-xl font-semibold">{fullName || 'Benutzer'}</h2>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
            </div>
          </Card>

          {/* Profile Information */}
          <Card className="p-6">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
              Persönliche Informationen
            </h3>

            <div className="space-y-4">
              {/* Full Name */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Vollständiger Name *
                </label>
                {isEditing ? (
                  <Input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Max Mustermann"
                    disabled={isSaving}
                  />
                ) : (
                  <p className="text-sm py-2">{fullName || 'Nicht angegeben'}</p>
                )}
              </div>

              {/* Email (read-only) */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  E-Mail
                </label>
                <p className="text-sm py-2 text-muted-foreground">{user?.email}</p>
              </div>

              {/* Phone Number */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Telefonnummer
                </label>
                {isEditing ? (
                  <Input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+41 79 123 45 67"
                    disabled={isSaving}
                  />
                ) : (
                  <p className="text-sm py-2">{phoneNumber || 'Nicht angegeben'}</p>
                )}
              </div>

              {/* Date of Birth */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Geburtsdatum
                </label>
                {isEditing ? (
                  <Input
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    disabled={isSaving}
                  />
                ) : (
                  <p className="text-sm py-2">{formatDate(dateOfBirth)}</p>
                )}
              </div>

              {/* Location */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Standort
                </label>
                {isEditing ? (
                  <Input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Zürich, Schweiz"
                    disabled={isSaving}
                  />
                ) : (
                  <p className="text-sm py-2">{location || 'Nicht angegeben'}</p>
                )}
              </div>
            </div>
          </Card>

          {/* Account Info */}
          <Card className="p-6">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
              Konto-Informationen
            </h3>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Konto erstellt</span>
                <span>{new Date(user?.created_at || '').toLocaleDateString('de-DE')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Letzte Anmeldung</span>
                <span>{new Date(user?.last_sign_in_at || '').toLocaleDateString('de-DE')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">E-Mail verifiziert</span>
                <span>{user?.email_confirmed_at ? '✅ Ja' : '❌ Nein'}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
