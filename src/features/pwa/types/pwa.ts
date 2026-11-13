export interface DeferredInstallPrompt extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export interface PwaContextValue {
  isOnline: boolean;
  isInstalled: boolean;
  isIOS: boolean;
  canPromptInstall: boolean;
  installationSupported: boolean;
  promptInstall: () => Promise<void>;
  updateAvailable: boolean;
  updateDismissed: boolean;
  updating: boolean;
  updateError: boolean;
  reloadAvailable: boolean;
  serviceWorkerError: boolean;
  applyUpdate: () => void;
  dismissUpdate: () => void;
}
