/**
 * 通用本地存储工具类
 * 支持Web和移动端的本地存储
 */

export interface StorageInterface {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
  clear(): void;
}

// Web端存储实现
class WebStorage implements StorageInterface {
  private storage: Storage;

  constructor(storage: Storage) {
    this.storage = storage;
  }

  getItem(key: string): string | null {
    try {
      return this.storage.getItem(key);
    } catch (error) {
      console.error(`Error getting item ${key}:`, error);
      return null;
    }
  }

  setItem(key: string, value: string): void {
    try {
      this.storage.setItem(key, value);
    } catch (error) {
      console.error(`Error setting item ${key}:`, error);
    }
  }

  removeItem(key: string): void {
    try {
      this.storage.removeItem(key);
    } catch (error) {
      console.error(`Error removing item ${key}:`, error);
    }
  }

  clear(): void {
    try {
      this.storage.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  }
}

// 移动端存储实现（React Native等）
class MobileStorage implements StorageInterface {
  private memoryStore: Map<string, string> = new Map();

  getItem(key: string): string | null {
    return this.memoryStore.get(key) || null;
  }

  setItem(key: string, value: string): void {
    this.memoryStore.set(key, value);
  }

  removeItem(key: string): void {
    this.memoryStore.delete(key);
  }

  clear(): void {
    this.memoryStore.clear();
  }
}

// 存储工厂
export class StorageFactory {
  private static instance: StorageInterface | null = null;

  static getStorage(): StorageInterface {
    if (this.instance) {
      return this.instance;
    }

    // 检测环境
    if (typeof window !== 'undefined') {
      // Web环境
      if (window.localStorage) {
        this.instance = new WebStorage(window.localStorage);
      } else if (window.sessionStorage) {
        this.instance = new WebStorage(window.sessionStorage);
      } else {
        // 降级到内存存储
        this.instance = new MobileStorage();
      }
    } else {
      // 移动端或Node.js环境
      this.instance = new MobileStorage();
    }

    return this.instance!;
  }

  // 强制使用特定存储类型
  static getLocalStorage(): StorageInterface {
    if (typeof window !== 'undefined' && window.localStorage) {
      return new WebStorage(window.localStorage);
    }
    return new MobileStorage();
  }

  static getSessionStorage(): StorageInterface {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      return new WebStorage(window.sessionStorage);
    }
    return new MobileStorage();
  }
}

// 便捷方法
export const storage = StorageFactory.getStorage();

// 特定用途的存储实例
export const localStorage = StorageFactory.getLocalStorage();
export const sessionStorage = StorageFactory.getSessionStorage();

// 存储键名常量
export const STORAGE_KEYS = {
  GEMINI_API_KEY: 'mutsumi_gemini_api_key',
  USER_PREFERENCES: 'mutsumi_user_preferences',
  CHAT_SESSIONS: 'mutsumi_chat_sessions',
  USER_AVATAR: 'mutsumi_user_avatar',
  CHARACTER_AVATAR: 'mutsumi_character_avatar',
  APP_SETTINGS: 'mutsumi_app_settings'
} as const;

// 存储工具函数
export const storageUtils = {
  // 设置API密钥
  setApiKey: (apiKey: string): void => {
    storage.setItem(STORAGE_KEYS.GEMINI_API_KEY, apiKey);
  },

  // 获取API密钥
  getApiKey: (): string | null => {
    return storage.getItem(STORAGE_KEYS.GEMINI_API_KEY);
  },

  // 移除API密钥
  removeApiKey: (): void => {
    storage.removeItem(STORAGE_KEYS.GEMINI_API_KEY);
  },

  // 检查是否有API密钥
  hasApiKey: (): boolean => {
    return storageUtils.getApiKey() !== null;
  },

  // 设置用户偏好
  setUserPreferences: (preferences: Record<string, any>): void => {
    storage.setItem(STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(preferences));
  },

  // 获取用户偏好
  getUserPreferences: (): Record<string, any> => {
    const data = storage.getItem(STORAGE_KEYS.USER_PREFERENCES);
    return data ? JSON.parse(data) : {};
  },

  // 设置应用设置
  setAppSettings: (settings: Record<string, any>): void => {
    storage.setItem(STORAGE_KEYS.APP_SETTINGS, JSON.stringify(settings));
  },

  // 获取应用设置
  getAppSettings: (): Record<string, any> => {
    const data = storage.getItem(STORAGE_KEYS.APP_SETTINGS);
    return data ? JSON.parse(data) : {};
  },

  // 清除所有应用数据
  clearAllData: (): void => {
    Object.values(STORAGE_KEYS).forEach(key => {
      storage.removeItem(key);
    });
  }
};