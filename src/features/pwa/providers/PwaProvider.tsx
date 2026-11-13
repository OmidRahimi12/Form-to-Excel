import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { DeferredInstallPrompt, PwaContextValue } from '../types/pwa';

const PwaContext = createContext<PwaContextValue | null>(null);

function isStandalone(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;
}

function isIosDevice(): boolean {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

export function PwaProvider({ children }: { children: ReactNode }) {
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);
  const [isInstalled, setIsInstalled] = useState(isStandalone);
  const [isIOS] = useState(isIosDevice);
  const [installPrompt, setInstallPrompt] = useState<DeferredInstallPrompt | null>(null);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [updateDismissed, setUpdateDismissed] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState(false);
  const [reloadAvailable, setReloadAvailable] = useState(false);
  const [registrationError, setRegistrationError] = useState(false);
  const registration = useRef<ServiceWorkerRegistration | null>(null);
  const updateRequested = useRef(false);
  const updateTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    const onInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as DeferredInstallPrompt);
    };
    const onInstalled = () => {
      setInstallPrompt(null);
      setIsInstalled(true);
    };
    const displayMode = window.matchMedia('(display-mode: standalone)');
    const onDisplayModeChange = () => setIsInstalled(isStandalone());

    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    window.addEventListener('beforeinstallprompt', onInstallPrompt);
    window.addEventListener('appinstalled', onInstalled);
    displayMode.addEventListener('change', onDisplayModeChange);

    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
      window.removeEventListener('beforeinstallprompt', onInstallPrompt);
      window.removeEventListener('appinstalled', onInstalled);
      displayMode.removeEventListener('change', onDisplayModeChange);
    };
  }, []);

  useEffect(() => {
    if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return;

    let disposed = false;
    const serviceWorkerContainer = navigator.serviceWorker;
    let hadController = Boolean(serviceWorkerContainer.controller);
    const onControllerChange = () => {
      window.clearTimeout(updateTimer.current);
      if (!hadController) { hadController = true; return; }
      if (updateRequested.current) {
        updateRequested.current = false;
        setUpdating(false);
        setReloadAvailable(true);
      } else {
        setReloadAvailable(true);
        setUpdateAvailable(true);
        setUpdateDismissed(false);
      }
    };
    const onWorkerMessage = (event: MessageEvent) => {
      if (event.data?.type === 'APP_UPDATE_ACTIVATED') {
        setReloadAvailable(true);
        setUpdateAvailable(true);
        setUpdateDismissed(false);
      }
    };
    const observeInstallingWorker = (activeRegistration: ServiceWorkerRegistration) => {
      const worker = activeRegistration.installing;
      if (!worker) return;
      worker.addEventListener('statechange', () => {
        if (worker.state === 'installed' && serviceWorkerContainer.controller && !disposed) {
          setUpdateAvailable(true);
          setUpdateDismissed(false);
          setUpdateError(false);
        }
      });
    };

    serviceWorkerContainer.addEventListener('controllerchange', onControllerChange);
    serviceWorkerContainer.addEventListener('message', onWorkerMessage);
    void serviceWorkerContainer.register(`${import.meta.env.BASE_URL}sw.js`, { scope: import.meta.env.BASE_URL })
      .then((activeRegistration) => {
        if (disposed) return;
        registration.current = activeRegistration;
        if (activeRegistration.waiting && serviceWorkerContainer.controller) setUpdateAvailable(true);
        activeRegistration.addEventListener('updatefound', () => observeInstallingWorker(activeRegistration));
        return activeRegistration.update();
      })
      .catch(() => { if (!disposed) setRegistrationError(true); });

    return () => {
      disposed = true;
      serviceWorkerContainer.removeEventListener('controllerchange', onControllerChange);
      serviceWorkerContainer.removeEventListener('message', onWorkerMessage);
      window.clearTimeout(updateTimer.current);
    };
  }, []);

  const promptInstall = useCallback(async () => {
    if (!installPrompt || isInstalled) return;
    const prompt = installPrompt;
    setInstallPrompt(null);
    try {
      await prompt.prompt();
      await prompt.userChoice;
    } catch {
      setInstallPrompt(null);
    }
  }, [installPrompt, isInstalled]);

  const applyUpdate = useCallback(() => {
    if (reloadAvailable) {
      setUpdating(true);
      window.location.reload();
      updateTimer.current = window.setTimeout(() => setUpdating(false), 12_000);
      return;
    }
    const waitingWorker = registration.current?.waiting;
    if (!waitingWorker) {
      setUpdateError(true);
      return;
    }
    updateRequested.current = true;
    setUpdating(true);
    setUpdateError(false);
    waitingWorker.postMessage({ type: 'SKIP_WAITING' });
    updateTimer.current = window.setTimeout(() => {
      if (!updateRequested.current) return;
      updateRequested.current = false;
      setUpdating(false);
      setUpdateError(true);
    }, 12_000);
  }, [reloadAvailable]);

  const dismissUpdate = useCallback(() => {
    setUpdateDismissed(true);
    setUpdateError(false);
  }, []);

  const value = useMemo<PwaContextValue>(() => ({
    isOnline,
    isInstalled,
    isIOS,
    canPromptInstall: Boolean(installPrompt),
    installationSupported: Boolean(installPrompt) || isIOS,
    promptInstall,
    updateAvailable,
    updateDismissed,
    updating,
    updateError,
    reloadAvailable,
    serviceWorkerError: registrationError,
    applyUpdate,
    dismissUpdate,
  }), [isOnline, isInstalled, isIOS, installPrompt, promptInstall, updateAvailable, updateDismissed, updating, updateError, reloadAvailable, registrationError, applyUpdate, dismissUpdate]);

  return <PwaContext.Provider value={value}>{children}</PwaContext.Provider>;
}

export function usePwa(): PwaContextValue {
  const context = useContext(PwaContext);
  if (!context) throw new Error('usePwa must be used within PwaProvider');
  return context;
}
