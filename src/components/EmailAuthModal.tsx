import { useState } from 'react';
import { Mail, KeyRound, ArrowRight, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { supabase } from '../lib/supabase';

interface EmailAuthModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function EmailAuthModal({ open, onClose, onSuccess }: EmailAuthModalProps) {
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSendCode = async () => {
    if (!email || !email.includes('@')) {
      setError('Bitte gib eine gültige E-Mail-Adresse ein');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email,
        options: {
          shouldCreateUser: true,
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;

      setStep('code');
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Fehler beim Senden des Codes');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!code || code.length !== 6) {
      setError('Bitte gib den 6-stelligen Code ein');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.verifyOtp({
        email: email,
        token: code,
        type: 'email',
      });

      if (error) throw error;

      // Success!
      setSuccess(true);
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Ungültiger Code. Bitte versuche es erneut.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setCode('');
    setError('');
    await handleSendCode();
  };

  const handleBack = () => {
    setStep('email');
    setCode('');
    setError('');
    setSuccess(false);
  };

  const handleClose = () => {
    setStep('email');
    setEmail('');
    setCode('');
    setError('');
    setSuccess(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        {step === 'email' ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">
                <Mail className="w-6 h-6 inline-block mr-2 text-purple-600" />
                Mit E-Mail anmelden
              </DialogTitle>
              <DialogDescription className="text-base">
                Wir senden dir einen 6-stelligen Code und einen Magic Link per E-Mail.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 pt-4">
              {/* Email Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium">E-Mail-Adresse</label>
                <Input
                  type="email"
                  placeholder="deine@email.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                  }}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendCode()}
                  className="h-12 text-base"
                  autoFocus
                />
              </div>

              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-sm text-red-700 dark:text-red-400">
                  {error}
                </div>
              )}

              {/* Info Box */}
              <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-2 flex items-center gap-2">
                  <KeyRound className="w-4 h-4" />
                  Zwei Optionen zum Anmelden:
                </h4>
                <ul className="space-y-1 text-sm text-purple-700 dark:text-purple-300">
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600 font-bold">1.</span>
                    <span>Klicke auf den <strong>Magic Link</strong> in der E-Mail</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600 font-bold">2.</span>
                    <span>Gib den <strong>6-stelligen Code</strong> hier ein</span>
                  </li>
                </ul>
              </div>

              <Button
                onClick={handleSendCode}
                disabled={loading || !email}
                className="w-full h-12 bg-purple-600 hover:bg-purple-700 text-white font-medium"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Wird gesendet...
                  </>
                ) : (
                  <>
                    Code senden
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                Kein Passwort erforderlich! Du erhältst einen einmaligen Code.
              </p>
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">
                <KeyRound className="w-6 h-6 inline-block mr-2 text-purple-600" />
                Code eingeben
              </DialogTitle>
              <DialogDescription className="text-base">
                Wir haben einen 6-stelligen Code an <strong className="text-foreground">{email}</strong> gesendet.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 pt-4">
              {success && step === 'code' && !error && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 text-sm text-green-700 dark:text-green-400 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  E-Mail wurde gesendet! Prüfe deinen Posteingang.
                </div>
              )}

              {/* Code Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium">6-stelliger Code</label>
                <Input
                  type="text"
                  placeholder="123456"
                  value={code}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setCode(value);
                    setError('');
                  }}
                  onKeyPress={(e) => e.key === 'Enter' && code.length === 6 && handleVerifyCode()}
                  className="h-16 text-center text-3xl font-bold tracking-widest"
                  maxLength={6}
                  autoFocus
                />
                <p className="text-xs text-muted-foreground text-center">
                  Gib den Code aus der E-Mail ein
                </p>
              </div>

              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-sm text-red-700 dark:text-red-400">
                  {error}
                </div>
              )}

              {/* Info Box */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  💡 Tipp: Zwei Wege zum Anmelden
                </h4>
                <ul className="space-y-1 text-sm text-blue-700 dark:text-blue-300">
                  <li>• <strong>Option 1:</strong> Klicke den Magic Link in der E-Mail</li>
                  <li>• <strong>Option 2:</strong> Gib den Code hier ein (schneller!)</li>
                </ul>
              </div>

              <Button
                onClick={handleVerifyCode}
                disabled={loading || code.length !== 6}
                className="w-full h-12 bg-purple-600 hover:bg-purple-700 text-white font-medium"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Wird überprüft...
                  </>
                ) : success && !error ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Erfolgreich angemeldet!
                  </>
                ) : (
                  <>
                    Anmelden
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>

              <div className="flex items-center justify-between text-sm">
                <Button
                  variant="link"
                  onClick={handleBack}
                  className="text-muted-foreground hover:text-foreground p-0 h-auto"
                >
                  ← Andere E-Mail verwenden
                </Button>
                <Button
                  variant="link"
                  onClick={handleResendCode}
                  disabled={loading}
                  className="text-purple-600 hover:text-purple-700 p-0 h-auto"
                >
                  Code erneut senden
                </Button>
              </div>

              <p className="text-xs text-center text-muted-foreground">
                Der Code ist 60 Minuten gültig
              </p>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
