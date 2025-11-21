import type { CapacitorConfig } from '@capacitor/cli';

const config: {
  server: { androidScheme: string };
  webDir: string;
  appName: string;
  plugins: {
    Keyboard: { resize: string; style: string };
    SplashScreen: {
      launchAutoHide: boolean;
      backgroundColor: string;
      androidSplashResourceName: string;
      launchShowDuration: number;
      showSpinner: boolean;
      spinnerColor: string
    };
    Haptics: { selectionStart: boolean; selectionChanged: boolean; selectionEnd: boolean };
    StatusBar: { backgroundColor: string; style: string }
  };
  appId: string
} = {
  appId: 'com.mutsumi.chat',
  appName: 'ChatWithMuZiMi',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000,
      launchAutoHide: true,
      backgroundColor: "#202624",
      androidSplashResourceName: "splash",
      showSpinner: true,
      spinnerColor: "#6b9c8a",
    },
    StatusBar: {
      style: "dark",
      backgroundColor: "#202624",
    },
    Keyboard: {
      style: "dark",
      resize: "body",
    },
    Haptics: {
      selectionStart: true,
      selectionChanged: true,
      selectionEnd: true,
    },
  },
};

export default config;
