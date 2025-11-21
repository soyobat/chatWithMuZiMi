// 移动端工具函数
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Keyboard } from '@capacitor/keyboard';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

export const isMobile = () => {
  return Capacitor.isNativePlatform();
};

export const isAndroid = () => {
  return Capacitor.getPlatform() === 'android';
};

export const isIOS = () => {
  return Capacitor.getPlatform() === 'ios';
};

// 状态栏配置
export const configureStatusBar = async () => {
  if (!isMobile()) return;
  
  try {
    await StatusBar.setStyle({ style: Style.Dark });
    await StatusBar.setBackgroundColor({ color: '#202624' });
  } catch (error) {
    console.warn('StatusBar configuration failed:', error);
  }
};

// 键盘配置
export const configureKeyboard = async () => {
  if (!isMobile()) return;
  
  try {
    // 简化的键盘配置
    await Keyboard.setStyle({ style: 'dark' });
  } catch (error) {
    console.warn('Keyboard configuration failed:', error);
  }
};

// 触觉反馈
export const triggerHapticFeedback = async (style: ImpactStyle = ImpactStyle.Medium) => {
  if (!isMobile()) return;
  
  try {
    await Haptics.impact({ style });
  } catch (error) {
    console.warn('Haptic feedback failed:', error);
  }
};

// 相机功能
export const takePicture = async (): Promise<string | null> => {
  if (!isMobile()) {
    // 桌面端返回 null，提示用户使用文件上传
    return null;
  }
  
  try {
    const image = await Camera.getPhoto({
      quality: 70,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Camera,
      allowEditing: false,
    });
    
    return image.dataUrl;
  } catch (error) {
    console.warn('Camera capture failed:', error);
    return null;
  }
};

// 选择图片
export const selectImage = async (): Promise<string | null> => {
  if (!isMobile()) {
    return null;
  }
  
  try {
    const image = await Camera.getPhoto({
      quality: 70,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Photos,
      allowEditing: false,
    });
    
    return image.dataUrl;
  } catch (error) {
    console.warn('Image selection failed:', error);
    return null;
  }
};

// 移动端初始化
export const initializeMobileFeatures = async () => {
  if (!isMobile()) return;
  
  await configureStatusBar();
  await configureKeyboard();
  
  // 监听键盘事件
  window.addEventListener('keyboardWillShow', () => {
    document.body.classList.add('keyboard-open');
  });
  
  window.addEventListener('keyboardWillHide', () => {
    document.body.classList.remove('keyboard-open');
  });
};

// 移动端优化的图片压缩
export const compressImageForMobile = (file: File, maxWidth = 800, quality = 0.6): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // 移动端优化：更小的尺寸和更好的压缩
        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxWidth) {
            width = maxWidth / height;
            height = maxWidth;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        } else {
          reject(new Error("Canvas context failed"));
        }
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

// 移动端手势支持
export const addMobileGestures = () => {
  if (!isMobile()) return;
  
  // 防止双击缩放
  let lastTouchEnd = 0;
  document.addEventListener('touchend', (event) => {
    const now = (new Date()).getTime();
    if (now - lastTouchEnd <= 300) {
      event.preventDefault();
    }
    lastTouchEnd = now;
  }, { passive: false });
};