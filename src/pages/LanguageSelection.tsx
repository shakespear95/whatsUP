import { ArrowLeft, Check, Globe } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { useLanguage } from "../contexts/LanguageContext";

interface LanguageSelectionProps {
  onClose: () => void;
}

type LanguageOption = {
  code: 'en' | 'de' | 'fr' | 'es';
  name: string;
  nativeName: string;
  flag: string;
};

const languages: LanguageOption[] = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇬🇧',
  },
  {
    code: 'de',
    name: 'German',
    nativeName: 'Deutsch',
    flag: '🇩🇪',
  },
  {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    flag: '🇫🇷',
  },
  {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    flag: '🇪🇸',
  },
];

export function LanguageSelection({ onClose }: LanguageSelectionProps) {
  const { language, setLanguage, t } = useLanguage();

  const handleLanguageChange = (langCode: 'en' | 'de' | 'fr' | 'es') => {
    setLanguage(langCode);
    // Optional: Show confirmation
    setTimeout(() => {
      alert(t('language.currentLanguage') + ': ' + languages.find(l => l.code === langCode)?.nativeName);
    }, 100);
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
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              <h1 className="text-lg font-medium">{t('language.title')}</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6 max-w-md">
        <div className="space-y-6">
          {/* Current Language Info */}
          <Card className="p-4 bg-primary/5 border-primary/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase">
                  {t('language.currentLanguage')}
                </p>
                <p className="text-sm font-semibold mt-1">
                  {languages.find(l => l.code === language)?.nativeName}
                </p>
              </div>
              <span className="text-3xl">
                {languages.find(l => l.code === language)?.flag}
              </span>
            </div>
          </Card>

          {/* Language List */}
          <div className="space-y-3">
            <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {t('language.selectLanguage')}
            </h2>

            <Card className="divide-y">
              {languages.map((lang) => {
                const isActive = language === lang.code;

                return (
                  <Button
                    key={lang.code}
                    variant="ghost"
                    className={`w-full justify-between h-auto py-4 px-4 rounded-none hover:bg-accent/50 ${
                      isActive ? 'bg-primary/5' : ''
                    }`}
                    onClick={() => handleLanguageChange(lang.code)}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{lang.flag}</span>
                      <div className="text-left">
                        <p className="text-sm font-medium">{lang.nativeName}</p>
                        <p className="text-xs text-muted-foreground">
                          {t(`language.${lang.name.toLowerCase()}`)}
                        </p>
                      </div>
                    </div>

                    {isActive && (
                      <Check className="w-5 h-5 text-primary" />
                    )}
                  </Button>
                );
              })}
            </Card>
          </div>

          {/* Info Card */}
          <Card className="p-4 bg-muted/50">
            <div className="flex gap-3">
              <Globe className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
              <div className="text-sm text-muted-foreground">
                <p className="mb-2">
                  {language === 'en' && 'The app interface will change immediately after selecting a language. Your settings and data will remain unchanged.'}
                  {language === 'de' && 'Die App-Oberfläche ändert sich sofort nach der Sprachauswahl. Ihre Einstellungen und Daten bleiben unverändert.'}
                  {language === 'fr' && 'L\'interface de l\'application changera immédiatement après la sélection d\'une langue. Vos paramètres et données resteront inchangés.'}
                  {language === 'es' && 'La interfaz de la aplicación cambiará inmediatamente después de seleccionar un idioma. Tu configuración y datos permanecerán sin cambios.'}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
