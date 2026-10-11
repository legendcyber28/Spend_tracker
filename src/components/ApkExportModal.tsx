import React, { useState } from 'react';
import {
  X,
  Package,
  Download,
  Terminal,
  Smartphone,
  CheckCircle2,
  Copy,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { usePWAInstall } from '../utils/usePWAInstall';
import { downloadFile } from '../utils/formatters';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const ApkExportModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  const handleDownloadCapacitorConfig = () => {
    const config = JSON.stringify(
      {
        appId: 'com.expensetracker.app',
        appName: 'Expense Tracker',
        webDir: 'dist',
        bundledWebRuntime: false,
        android: {
          allowMixedContent: false,
          captureInput: true,
          webContentsDebuggingEnabled: false,
        },
      },
      null,
      2
    );
    downloadFile(config, 'capacitor.config.json', 'application/json');
  };

  const handleDownloadManifestXml = () => {
    const xml = `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.expensetracker.app">

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/AppTheme">

        <activity
            android:configChanges="orientation|keyboardHidden|keyboard|screenSize|locale|smallestScreenSize|screenLayout|uiMode"
            android:name=".MainActivity"
            android:label="@string/title_activity_main"
            android:theme="@style/AppTheme.NoActionBarLaunch"
            android:launchMode="singleTask"
            android:exported="true">

            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>`;
    downloadFile(xml, 'AndroidManifest.xml', 'application/xml');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto no-scrollbar space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Android APK Export & Install
              </h3>
              <p className="text-[11px] text-slate-400">Install directly or build native APK</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Method 1: Instant WebAPK Install (Recommended for Android phones) */}
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Method 1: Direct Android Phone Install (WebAPK)
            </span>
            <span className="text-[10px] uppercase font-mono font-bold bg-emerald-200 dark:bg-emerald-800 text-emerald-900 dark:text-emerald-100 px-2 py-0.5 rounded-full">
              Recommended
            </span>
          </div>

          <p className="text-xs text-emerald-800 dark:text-emerald-300 leading-relaxed">
            Installs directly onto your Android device as a full standalone app with app drawer icon, offline caching, and hardware back-button support without needing Android Studio.
          </p>

          {isInstalled ? (
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-300 pt-1">
              <CheckCircle2 className="w-4 h-4" /> App is already installed in Standalone Mode!
            </div>
          ) : (
            <button
              onClick={async () => {
                const res = await install();
                if (!res) {
                  alert(
                    'To install on your Android device: open Chrome / Samsung Internet options (⋮) and tap "Install app" or "Add to Home screen".'
                  );
                }
              }}
              className="w-full mt-2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md active-press transition"
            >
              <Download className="w-4 h-4" />
              Install on Android Device Now
            </button>
          )}
        </div>

        {/* Method 2: Native APK Compilation via Capacitor / Gradle */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Terminal className="w-4 h-4 text-blue-500" />
              Method 2: Compile Native Android APK (.apk)
            </span>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            To build a signed release or debug <code className="font-mono text-emerald-600 font-bold">.apk</code> file for sideloading or Google Play Store distribution:
          </p>

          {/* Steps */}
          <div className="space-y-2 text-xs">
            {/* Step 1 */}
            <div className="bg-slate-900 text-slate-200 p-3 rounded-xl font-mono text-[11px] relative group">
              <div className="text-slate-400 text-[10px] mb-1 font-sans font-bold">
                1. Build web bundle & initialize Capacitor Android:
              </div>
              <code>npm run build && npx cap add android</code>
              <button
                onClick={() =>
                  copyToClipboard('npm run build && npx cap add android', 'step1')
                }
                className="absolute right-2 top-2 p-1 text-slate-400 hover:text-white"
              >
                {copiedCmd === 'step1' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Step 2 */}
            <div className="bg-slate-900 text-slate-200 p-3 rounded-xl font-mono text-[11px] relative group">
              <div className="text-slate-400 text-[10px] mb-1 font-sans font-bold">
                2. Sync assets to Android Studio project:
              </div>
              <code>npx cap sync android</code>
              <button
                onClick={() => copyToClipboard('npx cap sync android', 'step2')}
                className="absolute right-2 top-2 p-1 text-slate-400 hover:text-white"
              >
                {copiedCmd === 'step2' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Step 3 */}
            <div className="bg-slate-900 text-slate-200 p-3 rounded-xl font-mono text-[11px] relative group">
              <div className="text-slate-400 text-[10px] mb-1 font-sans font-bold">
                3. Compile release APK with Gradle:
              </div>
              <code>cd android && ./gradlew assembleRelease</code>
              <button
                onClick={() => copyToClipboard('cd android && ./gradlew assembleRelease', 'step3')}
                className="absolute right-2 top-2 p-1 text-slate-400 hover:text-white"
              >
                {copiedCmd === 'step3' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Quick Config Download Buttons */}
          <div className="pt-2 flex items-center gap-2">
            <button
              onClick={handleDownloadCapacitorConfig}
              className="flex-1 py-2 px-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 flex items-center justify-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" /> capacitor.config.json
            </button>
            <button
              onClick={handleDownloadManifestXml}
              className="flex-1 py-2 px-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 flex items-center justify-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" /> AndroidManifest.xml
            </button>
          </div>
        </div>

        {/* Security / Verification Badge */}
        <div className="flex items-center gap-2 text-[11px] text-slate-500 justify-center">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Zero third-party telemetry • 100% Offline-capable Android App</span>
        </div>
      </div>
    </div>
  );
};
