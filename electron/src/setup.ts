import type { CapacitorElectronConfig } from '@capacitor-community/electron';
import {
  CapElectronEventEmitter,
  CapacitorSplashScreen,
  setupCapacitorElectronPlugins,
} from '@capacitor-community/electron';
import chokidar from 'chokidar';
import type { MenuItemConstructorOptions } from 'electron';
import { app, BrowserWindow, Menu, MenuItem, nativeImage, Tray, session } from 'electron';
import electronIsDev from 'electron-is-dev';
import electronServe from 'electron-serve';
import windowStateKeeper from 'electron-window-state';
import { join } from 'path';
import { URL } from 'node:url';
import { existsSync, readFileSync } from 'fs';
import { ChildProcess, spawn } from 'child_process';

// Define components for a watcher to detect when the webapp is changed so we can reload in Dev mode.
const reloadWatcher = {
  debouncer: null,
  ready: false,
  watcher: null,
};
export function setupReloadWatcher(electronCapacitorApp: ElectronCapacitorApp): void {
  reloadWatcher.watcher = chokidar
    .watch(join(app.getAppPath(), 'app'), {
      ignored: /[/\\]\./,
      persistent: true,
    })
    .on('ready', () => {
      reloadWatcher.ready = true;
    })
    .on('all', (_event, _path) => {
      if (reloadWatcher.ready) {
        clearTimeout(reloadWatcher.debouncer);
        reloadWatcher.debouncer = setTimeout(async () => {
          electronCapacitorApp.getMainWindow().webContents.reload();
          reloadWatcher.ready = false;
          clearTimeout(reloadWatcher.debouncer);
          reloadWatcher.debouncer = null;
          reloadWatcher.watcher = null;
          setupReloadWatcher(electronCapacitorApp);
        }, 1500);
      }
    });
}

// Define our class to manage our app.
export class ElectronCapacitorApp {
  private MainWindow: BrowserWindow | null = null;
  private SplashScreen: CapacitorSplashScreen | null = null;
  private TrayIcon: Tray | null = null;
  private CapacitorFileConfig: CapacitorElectronConfig;
  private TrayMenuTemplate: (MenuItem | MenuItemConstructorOptions)[] = [
    new MenuItem({ label: 'Quit App', role: 'quit' }),
  ];
  private AppMenuBarMenuTemplate: (MenuItem | MenuItemConstructorOptions)[] = [
    { role: process.platform === 'darwin' ? 'appMenu' : 'fileMenu' },
    { role: 'viewMenu' },
  ];
  private mainWindowState;
  private loadLocalWebApp;
  private customScheme: string;
  private localServerUrl: string | null = null;
  private localServerPort: number = parseInt(process.env.MIRROR_APP_PORT ?? '4173', 10);
  private nextServerProcess: ChildProcess | null = null;
  private envFromFile: Record<string, string> = {};
  private requiredEnvKeys = ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY', 'OPENAI_API_KEY'];

  constructor(
    capacitorFileConfig: CapacitorElectronConfig,
    trayMenuTemplate?: (MenuItemConstructorOptions | MenuItem)[],
    appMenuBarMenuTemplate?: (MenuItemConstructorOptions | MenuItem)[]
  ) {
    this.CapacitorFileConfig = capacitorFileConfig;

    this.customScheme = this.CapacitorFileConfig.electron?.customUrlScheme ?? 'capacitor-electron';

    if (trayMenuTemplate) {
      this.TrayMenuTemplate = trayMenuTemplate;
    }

    if (appMenuBarMenuTemplate) {
      this.AppMenuBarMenuTemplate = appMenuBarMenuTemplate;
    }

    // Setup our web app loader, this lets us load apps like react, vue, and angular without changing their build chains.
    this.loadLocalWebApp = electronServe({
      directory: join(app.getAppPath(), 'app'),
      scheme: this.customScheme,
    });

    const appPath = app.getAppPath();
    this.envFromFile = this.loadEnvFromFiles([
      join(appPath, '.env.production'),
      join(appPath, '.env.local'),
    ]);
  }

  private async startLocalNextServer(): Promise<void> {
    // Prefer local Next.js server (standalone output) so API routes & backend logic berjalan di desktop.
    const appPath = app.getAppPath();
    const serverPath = join(appPath, '.next', 'standalone', 'server.js');
    if (!existsSync(serverPath)) {
      return;
    }
    if (!this.hasRequiredEnv()) {
      return;
    }
    if (this.nextServerProcess) {
      return;
    }
    const port = this.localServerPort;
    const env = {
      ...process.env,
      ...this.envFromFile,
      PORT: String(port),
      HOSTNAME: '127.0.0.1',
      NODE_ENV: 'production',
      ELECTRON_RUN_AS_NODE: '1',
    };
    try {
      this.nextServerProcess = spawn(process.execPath, [serverPath], {
        env,
        cwd: join(appPath, '.next', 'standalone'),
        stdio: 'inherit',
      });
      this.localServerUrl = `http://127.0.0.1:${port}`;
      this.nextServerProcess.on('exit', () => {
        this.nextServerProcess = null;
      });
      await this.waitForServer(this.localServerUrl);
    } catch (error) {
      console.error('Gagal menyalakan Next standalone server', error);
      this.localServerUrl = null;
    }
  }

  private stopLocalNextServer(): void {
    if (this.nextServerProcess) {
      try {
        this.nextServerProcess.kill();
      } catch (error) {
        console.warn('Gagal mematikan server lokal', error);
      } finally {
        this.nextServerProcess = null;
      }
    }
  }

  private async waitForServer(url: string, timeoutMs = 12000): Promise<void> {
    const started = Date.now();
    while (Date.now() - started < timeoutMs) {
      try {
        const res = await fetch(url, { method: 'HEAD' });
        if (res.ok) {
          return;
        }
      } catch {
        // ignore until timeout
      }
      await new Promise((resolve) => setTimeout(resolve, 300));
    }
  }

  private loadEnvFromFiles(paths: string[]): Record<string, string> {
    const result: Record<string, string> = {};
    paths.forEach((p) => {
      if (!existsSync(p)) return;
      try {
        const content = readFileSync(p, 'utf8');
        content
          .split('\n')
          .map((line) => line.trim())
          .filter((line) => line && !line.startsWith('#'))
          .forEach((line) => {
            const eqIdx = line.indexOf('=');
            if (eqIdx === -1) return;
            const key = line.slice(0, eqIdx).trim();
            let val = line.slice(eqIdx + 1).trim();
            if (
              (val.startsWith('"') && val.endsWith('"')) ||
              (val.startsWith("'") && val.endsWith("'"))
            ) {
              val = val.slice(1, -1);
            }
            if (key) {
              result[key] = val;
            }
          });
      } catch (error) {
        console.warn(`Gagal membaca env file ${p}`, error);
      }
    });
    return result;
  }

  private hasRequiredEnv(): boolean {
    const env = { ...process.env, ...this.envFromFile };
    return this.requiredEnvKeys.every((key) => !!env[key]);
  }

  // Helper function to load in the app.
  private async loadMainWindow(thisRef: any) {
    const remoteUrl = thisRef.getRemoteUrl();
    if (remoteUrl) {
      await thisRef.MainWindow.loadURL(remoteUrl);
      return;
    }
    await thisRef.loadLocalWebApp(thisRef.MainWindow);
  }

  // Expose the mainWindow ref for use outside of the class.
  getMainWindow(): BrowserWindow {
    return this.MainWindow;
  }

  getCustomURLScheme(): string {
    return this.customScheme;
  }

  getRemoteUrl(): string | null {
    if (this.localServerUrl) {
      return this.localServerUrl;
    }
    return process.env.MIRROR_APP_URL ?? this.CapacitorFileConfig.server?.url ?? null;
  }

  async init(): Promise<void> {
    const icon = nativeImage.createFromPath(
      join(app.getAppPath(), 'assets', process.platform === 'win32' ? 'appIcon.ico' : 'appIcon.png')
    );
    this.mainWindowState = windowStateKeeper({
      defaultWidth: 1000,
      defaultHeight: 800,
    });
    await this.startLocalNextServer();
    // Setup preload script path and construct our main window.
    const preloadPath = join(app.getAppPath(), 'build', 'src', 'preload.js');
    this.MainWindow = new BrowserWindow({
      icon,
      show: false,
      x: this.mainWindowState.x,
      y: this.mainWindowState.y,
      width: this.mainWindowState.width,
      height: this.mainWindowState.height,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: true,
        autoplayPolicy: 'no-user-gesture-required',
        // Use preload to inject the electron varriant overrides for capacitor plugins.
        // preload: join(app.getAppPath(), "node_modules", "@capacitor-community", "electron", "dist", "runtime", "electron-rt.js"),
        preload: preloadPath,
      },
    });
    this.mainWindowState.manage(this.MainWindow);

    if (this.CapacitorFileConfig.backgroundColor) {
      this.MainWindow.setBackgroundColor(this.CapacitorFileConfig.electron.backgroundColor);
    }

    // If we close the main window with the splashscreen enabled we need to destory the ref.
    this.MainWindow.on('closed', () => {
      if (this.SplashScreen?.getSplashWindow() && !this.SplashScreen.getSplashWindow().isDestroyed()) {
        this.SplashScreen.getSplashWindow().close();
      }
    });

    // When the tray icon is enabled, setup the options.
    if (this.CapacitorFileConfig.electron?.trayIconAndMenuEnabled) {
      this.TrayIcon = new Tray(icon);
      this.TrayIcon.on('double-click', () => {
        if (this.MainWindow) {
          if (this.MainWindow.isVisible()) {
            this.MainWindow.hide();
          } else {
            this.MainWindow.show();
            this.MainWindow.focus();
          }
        }
      });
      this.TrayIcon.on('click', () => {
        if (this.MainWindow) {
          if (this.MainWindow.isVisible()) {
            this.MainWindow.hide();
          } else {
            this.MainWindow.show();
            this.MainWindow.focus();
          }
        }
      });
      this.TrayIcon.setToolTip(app.getName());
      this.TrayIcon.setContextMenu(Menu.buildFromTemplate(this.TrayMenuTemplate));
    }

    // Setup the main manu bar at the top of our window.
    Menu.setApplicationMenu(Menu.buildFromTemplate(this.AppMenuBarMenuTemplate));

    // If the splashscreen is enabled, show it first while the main window loads then switch it out for the main window, or just load the main window from the start.
    if (this.CapacitorFileConfig.electron?.splashScreenEnabled) {
      this.SplashScreen = new CapacitorSplashScreen({
        imageFilePath: join(
          app.getAppPath(),
          'assets',
          this.CapacitorFileConfig.electron?.splashScreenImageName ?? 'splash.png'
        ),
        windowWidth: 400,
        windowHeight: 400,
      });
      this.SplashScreen.init(this.loadMainWindow, this);
    } else {
      this.loadMainWindow(this);
    }

    // Security
    this.MainWindow.webContents.setWindowOpenHandler((details) => {
      if (!details.url.includes(this.customScheme)) {
        return { action: 'deny' };
      } else {
        return { action: 'allow' };
      }
    });
    this.MainWindow.webContents.on('will-navigate', (event, _newURL) => {
      if (!this.MainWindow.webContents.getURL().includes(this.customScheme)) {
        event.preventDefault();
      }
    });

    // Link electron plugins into the system.
    setupCapacitorElectronPlugins();

    // When the web app is loaded we hide the splashscreen if needed and show the mainwindow.
    this.MainWindow.webContents.on('dom-ready', () => {
      if (this.CapacitorFileConfig.electron?.splashScreenEnabled) {
        this.SplashScreen.getSplashWindow().hide();
      }
      if (!this.CapacitorFileConfig.electron?.hideMainWindowOnLaunch) {
        this.MainWindow.show();
      }
      setTimeout(() => {
        if (electronIsDev) {
          this.MainWindow.webContents.openDevTools();
        }
        CapElectronEventEmitter.emit('CAPELECTRON_DeeplinkListenerInitialized', '');
      }, 400);
    });

    app.on('before-quit', () => {
      this.stopLocalNextServer();
    });
  }
}

// Set a CSP up for our application based on the custom scheme
export function setupContentSecurityPolicy(customScheme: string, remoteUrl?: string): void {
  const remoteOrigin = (() => {
    if (!remoteUrl) return null;
    try {
      return new URL(remoteUrl).origin;
    } catch {
      return null;
    }
  })();

  const allowedSources = [
    `${customScheme}://*`,
    remoteOrigin,
    'https://*.vercel.app',
    'https://*.supabase.co',
    'https://*.supabase.in',
    'https://cdn.jsdelivr.net',
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com',
    'https://api.openai.com',
    'blob:',
    'data:',
    'mediastream:',
  ].filter(Boolean) as string[];

  const basePolicy = `${allowedSources.join(' ')} 'unsafe-inline'${electronIsDev ? " 'unsafe-eval' devtools://*" : " 'unsafe-eval'"
    }`;

  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [`default-src ${basePolicy}`],
      },
    });
  });
}
