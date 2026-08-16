import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Sparkles } from 'lucide-react';

export const PWAInstallPrompt: React.FC = () => {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [showPrompt, setShowPrompt] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);

    useEffect(() => {
        // Check if already running in standalone PWA mode
        if (window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone) {
            setIsInstalled(true);
            return;
        }

        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e);
            // Show prompt banner after 3 seconds on mobile/desktop
            setTimeout(() => {
                setShowPrompt(true);
            }, 3000);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        window.addEventListener('appinstalled', () => {
            setIsInstalled(true);
            setShowPrompt(false);
            setDeferredPrompt(null);
        });

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            console.log('[PWA] User accepted the install prompt');
        }
        setDeferredPrompt(null);
        setShowPrompt(false);
    };

    const handleDismiss = () => {
        setShowPrompt(false);
        // Hide for current session
        sessionStorage.setItem('pwa_prompt_dismissed', 'true');
    };

    if (!showPrompt || isInstalled || sessionStorage.getItem('pwa_prompt_dismissed')) {
        return null;
    }

    return (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:w-96 bg-slate-950/95 backdrop-blur-xl border border-brand-cyan/40 rounded-2xl p-4 shadow-2xl shadow-cyan-500/20 z-[9999] animate-bounce-short">
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-brand-cyan to-blue-600 p-0.5 shadow-lg shadow-cyan-500/30 flex items-center justify-center shrink-0">
                        <Smartphone className="w-6 h-6 text-slate-950" />
                    </div>
                    <div>
                        <div className="flex items-center gap-1.5">
                            <h4 className="font-outfit font-bold text-white text-sm">Install Digi8 App</h4>
                            <Sparkles className="w-3.5 h-3.5 text-brand-cyan animate-pulse" />
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                            Install app on your phone for real-time alerts & quick access.
                        </p>
                    </div>
                </div>
                <button
                    onClick={handleDismiss}
                    className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
                    aria-label="Dismiss prompt"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>

            <div className="mt-3.5 flex items-center gap-2">
                <button
                    onClick={handleInstallClick}
                    className="flex-1 py-2 px-4 bg-gradient-to-r from-brand-cyan to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                >
                    <Download className="w-4 h-4" />
                    Install App Now
                </button>
                <button
                    onClick={handleDismiss}
                    className="py-2 px-3 bg-slate-800/80 hover:bg-slate-800 text-slate-300 font-medium text-xs rounded-xl transition-colors"
                >
                    Not Now
                </button>
            </div>
        </div>
    );
};
