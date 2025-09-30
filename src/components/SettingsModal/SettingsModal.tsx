import React from 'react';
import {
  ArrowLeft,
  User,
  Heart,
  Bell,
  Globe,
  Palette,
  MapPin,
  Archive,
  MessageCircle,
  HelpCircle,
  Info,
  ChevronRight
} from 'lucide-react';
import './SettingsModal.css';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const accountSettings = [
    { icon: User, label: 'Mein Profil', hasArrow: true },
    { icon: Heart, label: 'Gespeicherte Events', hasArrow: true },
    { icon: Bell, label: 'Benachrichtigungen', hasArrow: true },
  ];

  const appSettings = [
    { icon: Globe, label: 'Sprache & Region', hasArrow: true },
    { icon: Palette, label: 'Darstellung', hasArrow: true },
    { icon: MapPin, label: 'Standort-Einstellungen', hasArrow: true },
    { icon: Archive, label: 'Cache & Daten', hasArrow: true },
  ];

  const supportSettings = [
    { icon: MessageCircle, label: 'Feedback senden', hasArrow: true },
    { icon: HelpCircle, label: 'Hilfe & FAQ', hasArrow: true },
    { icon: Info, label: 'Über WhatsUP', hasArrow: true },
  ];

  const renderSettingsGroup = (title: string, items: any[]) => (
    <div className="settings-group">
      <h3 className="settings-group-title">{title}</h3>
      <div className="settings-list">
        {items.map((item, index) => (
          <button key={index} className="settings-item">
            <div className="settings-item-content">
              <div className="settings-item-icon">
                <item.icon size={20} />
              </div>
              <span className="settings-item-label">{item.label}</span>
            </div>
            {item.hasArrow && (
              <ChevronRight size={16} className="settings-item-arrow" />
            )}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="settings-modal-overlay">
      <div className="settings-modal">
        <div className="settings-header">
          <button className="back-button" onClick={onClose}>
            <ArrowLeft size={20} />
          </button>
          <h2 className="settings-title">Einstellungen</h2>
        </div>

        <div className="settings-content">
          {renderSettingsGroup('ACCOUNT', accountSettings)}
          {renderSettingsGroup('APP-EINSTELLUNGEN', appSettings)}
          {renderSettingsGroup('SUPPORT', supportSettings)}
        </div>

        <div className="settings-footer">
          <p className="app-version">WhatsUP Version 1.0.0</p>
          <p className="app-copyright">© 2025 WhatsUP. Alle Rechte vorbehalten.</p>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;