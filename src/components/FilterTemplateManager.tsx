import { useState, useEffect } from 'react';
import { Save, FolderOpen, Trash2, Plus, Edit3 } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { SearchFilters, FilterTemplate } from './AdvancedSearchDropdown';

interface FilterTemplateManagerProps {
  currentFilters: SearchFilters;
  onLoadTemplate: (filters: SearchFilters) => void;
}

const templateIcons = ['📍', '🎵', '🎭', '🎨', '⚽', '🍽️', '👨‍👩‍👧‍👦', '📚', '🎪', '🌟', '🔥', '💎', '🎲', '🌙'];

export function FilterTemplateManager({ currentFilters, onLoadTemplate }: FilterTemplateManagerProps) {
  const [templates, setTemplates] = useState<FilterTemplate[]>([]);
  const [showLoadDialog, setShowLoadDialog] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('📍');

  // Load templates from localStorage on mount
  useEffect(() => {
    try {
      const savedTemplates = localStorage.getItem('whatsup-filter-templates');
      if (savedTemplates) {
        const parsed = JSON.parse(savedTemplates);
        setTemplates(parsed.map((t: any) => ({
          ...t,
          createdAt: new Date(t.createdAt)
        })));
      }
    } catch (error) {
      console.error('Error loading filter templates:', error);
      // Clear corrupted data
      localStorage.removeItem('whatsup-filter-templates');
    }
  }, []);

  // Save templates to localStorage
  const saveTemplates = (newTemplates: FilterTemplate[]) => {
    try {
      localStorage.setItem('whatsup-filter-templates', JSON.stringify(newTemplates));
      setTemplates(newTemplates);
    } catch (error) {
      console.error('Error saving filter templates:', error);
    }
  };

  const saveCurrentTemplate = () => {
    if (!templateName.trim()) return;

    const newTemplate: FilterTemplate = {
      id: Date.now().toString(),
      name: templateName.trim(),
      icon: selectedIcon,
      filters: { ...currentFilters },
      createdAt: new Date()
    };

    const newTemplates = [...templates, newTemplate];
    saveTemplates(newTemplates);
    
    setTemplateName('');
    setSelectedIcon('📍');
    setShowSaveDialog(false);
  };

  const deleteTemplate = (templateId: string) => {
    const newTemplates = templates.filter(t => t.id !== templateId);
    saveTemplates(newTemplates);
  };

  const loadTemplate = (template: FilterTemplate) => {
    onLoadTemplate(template.filters);
    setShowLoadDialog(false);
  };

  const getFilterSummary = (filters: SearchFilters): string => {
    const parts = [];
    if (filters.location) parts.push(filters.location);
    if (filters.radius !== 25) parts.push(`${filters.radius}km`);
    if (filters.categories.length > 0) parts.push(`${filters.categories.length} Kategorien`);
    if (filters.timeRange && filters.timeRange !== 'all') parts.push('Zeitraum');
    if (filters.budget.onlyFree) parts.push('Gratis');
    else if (filters.budget.max !== 200) parts.push(`bis CHF ${filters.budget.max}`);
    if (filters.quickFilters.length > 0) parts.push(`${filters.quickFilters.length} Filter`);
    return parts.join(' • ') || 'Alle Events';
  };

  const hasActiveFilters = () => {
    return !!(
      currentFilters.location ||
      currentFilters.categories.length > 0 ||
      currentFilters.keywords ||
      currentFilters.quickFilters.length > 0 ||
      currentFilters.specialTags.length > 0 ||
      currentFilters.budget.onlyFree ||
      currentFilters.budget.max !== 200 ||
      currentFilters.radius !== 25 ||
      (currentFilters.timeRange && currentFilters.timeRange !== 'all')
    );
  };

  return (
    <div className="flex gap-2">
      {/* Load Template Button */}
      <Dialog open={showLoadDialog} onOpenChange={setShowLoadDialog}>
        <DialogTrigger asChild>
          <Button variant="outline" className="flex-1">
            <FolderOpen className="w-4 h-4 mr-2" />
            Laden
            <span className="ml-auto">▼</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md max-h-[70vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Meine Filter-Vorlagen</DialogTitle>
            <DialogDescription>
              Gespeicherte Sucheinstellungen laden
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-3">
            {templates.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FolderOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Noch keine Vorlagen gespeichert</p>
                <p className="text-sm">Save your favorite search filters for quick access</p>
              </div>
            ) : (
              templates.map((template) => (
                <div key={template.id} className="border rounded-lg p-3">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{template.icon}</span>
                      <div>
                        <h4 className="font-medium">{template.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {getFilterSummary(template.filters)}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteTemplate(template.id)}
                      className="h-6 w-6 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                  <Button
                    onClick={() => loadTemplate(template)}
                    size="sm"
                    className="w-full"
                  >
                    Laden
                  </Button>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Save Template Button */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogTrigger asChild>
          <Button 
            variant="outline" 
            disabled={!hasActiveFilters()}
            title={hasActiveFilters() ? "Aktuelle Filter speichern" : "Keine Filter zum Speichern"}
          >
            <Save className="w-4 h-4 mr-2" />
            Speichern
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Filter-Vorlage speichern</DialogTitle>
            <DialogDescription>
              Speichere deine aktuellen Sucheinstellungen für späteren Gebrauch
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Name der Vorlage:</label>
              <Input
                placeholder="z.B. 'Wochenend-Aktivitäten'"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                maxLength={30}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Choose icon:</label>
              <div className="flex flex-wrap gap-2">
                {templateIcons.map((icon) => (
                  <Button
                    key={icon}
                    variant={selectedIcon === icon ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedIcon(icon)}
                    className="text-lg p-2 h-auto"
                  >
                    {icon}
                  </Button>
                ))}
              </div>
            </div>

            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-sm font-medium mb-2">Gespeichert werden:</p>
              <div className="space-y-1 text-sm text-muted-foreground">
                {currentFilters.location && <p>• Standort: {currentFilters.location}</p>}
                {currentFilters.radius !== 25 && <p>• Radius: {currentFilters.radius}km</p>}
                {currentFilters.categories.length > 0 && <p>• Kategorien: {currentFilters.categories.length} ausgewählt</p>}
                {currentFilters.timeRange && currentFilters.timeRange !== 'all' && <p>• Zeitraum: {currentFilters.timeRange}</p>}
                {(currentFilters.budget.onlyFree || currentFilters.budget.max !== 200) && (
                  <p>• Budget: {currentFilters.budget.onlyFree ? 'Gratis' : `bis CHF ${currentFilters.budget.max}`}</p>
                )}
                {currentFilters.quickFilters.length > 0 && <p>• {currentFilters.quickFilters.length} Spezial-Filter</p>}
                {currentFilters.specialTags.length > 0 && <p>• {currentFilters.specialTags.length} Event-Tags</p>}
                {currentFilters.keywords && <p>• Keywords: {currentFilters.keywords}</p>}
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="ghost" onClick={() => setShowSaveDialog(false)}>
                Abbrechen
              </Button>
              <Button 
                onClick={saveCurrentTemplate}
                disabled={!templateName.trim()}
              >
                Speichern
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}