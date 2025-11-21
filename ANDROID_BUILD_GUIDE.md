# ChatWithMuZiMi 安卓应用构建指南

## 📱 项目概述

您的 React 聊天应用已经成功配置为安卓应用，使用 **Capacitor** 框架实现。以下是完整的构建和发布指南。

## ✅ 已完成的配置

### 1. 核心依赖
- ✅ `@capacitor/core` - 核心框架
- ✅ `@capacitor/cli` - 命令行工具
- ✅ `@capacitor/android` - 安卓平台支持
- ✅ `@capacitor/camera` - 相机功能
- ✅ `@capacitor/status-bar` - 状态栏控制
- ✅ `@capacitor/keyboard` - 键盘管理
- ✅ `@capacitor/haptics` - 触觉反馈

### 2. 移动端优化
- ✅ 移动端工具函数 (`src/utils/mobile.ts`)
- ✅ 触觉反馈集成
- ✅ 相机和图片选择功能
- ✅ 状态栏和键盘配置
- ✅ 移动端优化的图片压缩

### 3. 安卓配置
- ✅ 应用包名: `com.mutsumi.chat`
- ✅ 应用名称: `ChatWithMuZiMi`
- ✅ 权限配置:
  - `INTERNET` - 网络访问
  - `CAMERA` - 相机功能
  - `READ_EXTERNAL_STORAGE` - 存储访问
  - `WRITE_EXTERNAL_STORAGE` - 存储写入
  - `ACCESS_NETWORK_STATE` - 网络状态
  - `VIBRATE` - 触觉反馈

### 4. 构建优化
- ✅ Vite 配置优化
- ✅ 代码分割和压缩
- ✅ 移动端 CORS 配置

## 🚀 构建步骤

### 环境要求
1. **Java 11 或更高版本** (当前环境为 Java 8，需要升级)
2. **Android Studio** 和 **Android SDK**
3. **Node.js** 18+ 和 **npm**

### 步骤 1: 升级 Java 环境
```bash
# 下载并安装 Java 11 或更高版本
# 设置 JAVA_HOME 环境变量
```

### 步骤 2: 构建 Web 应用
```bash
# 在项目根目录执行
npm run build
```

### 步骤 3: 同步到安卓项目
```bash
npx cap sync android
```

### 步骤 4: 构建 APK
```bash
# 进入安卓目录
cd android

# 构建调试版本
./gradlew assembleDebug

# 构建发布版本 (需要签名)
./gradlew assembleRelease
```

### 步骤 5: APK 位置
构建成功后，APK 文件位于:
- **调试版本**: `android/app/build/outputs/apk/debug/app-debug.apk`
- **发布版本**: `android/app/build/outputs/apk/release/app-release.apk`

## 📦 应用签名 (发布准备)

### 生成签名密钥
```bash
keytool -genkey -v -keystore chatwithmuzimi-release-key.keystore -alias chatwithmuzimi -keyalg RSA -keysize 2048 -validity 10000
```

### 配置签名 (在 `android/app/build.gradle` 中)
```gradle
android {
    signingConfigs {
        release {
            if (project.hasProperty('CHATWITHMUTSUMI_UPLOAD_STORE_FILE')) {
                storeFile file(CHATWITHMUTSUMI_UPLOAD_STORE_FILE)
                storePassword CHATWITHMUTSUMI_UPLOAD_STORE_PASSWORD
                keyAlias CHATWITHMUTSUMI_UPLOAD_KEY_ALIAS
                keyPassword CHATWITHMUTSUMI_UPLOAD_KEY_PASSWORD
            }
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
        }
    }
}
```

### 创建签名配置文件
在 `android/` 目录创建 `keystore.properties`:
```properties
storeFile=chatwithmuzimi-release-key.keystore
storePassword=your_store_password
keyAlias=chatwithmuzimi
keyPassword=your_key_password
```

## 🛠️ 开发命令

### 常用命令
```bash
# 开发模式 (Web)
npm run dev

# 构建 Web 应用
npm run build

# 同步到安卓
npx cap sync android

# 打开安卓项目 (在 Android Studio 中)
npx cap open android

# 在设备上运行
npx cap run android

# 实时同步开发
npx cap run android --livereload --external
```

### 调试命令
```bash
# 查看日志
npx cap logs android

# 清理构建
cd android && ./gradlew clean

# 重新构建
npm run build && npx cap sync android
```

## 📱 应用特性

### 核心功能
- ✅ AI 聊天对话 (Gemini 2.5 Flash)
- ✅ 图片上传和分析
- ✅ 角色互动系统
- ✅ 黄瓜种植小游戏
- ✅ 多会话管理
- ✅ 本地存储

### 移动端优化
- ✅ 触觉反馈
- ✅ 相机集成
- ✅ 移动端图片压缩
- ✅ 状态栏控制
- ✅ 键盘适配
- ✅ 手势支持

### 权限管理
- ✅ 网络访问
- ✅ 相机功能
- ✅ 存储访问
- ✅ 触觉反馈

## 🔧 故障排除

### 常见问题

1. **Java 版本错误**
   - 错误: "Dependency requires at least JVM runtime version 11"
   - 解决: 升级到 Java 11+ 并更新 JAVA_HOME

2. **构建失败**
   ```bash
   # 清理并重新构建
   cd android
   ./gradlew clean
   cd ..
   npm run build
   npx cap sync android
   ```

3. **权限问题**
   - 检查 `android/app/src/main/AndroidManifest.xml` 中的权限配置

4. **网络请求失败**
   - 确认 API 密钥配置正确
   - 检查 CORS 设置

### 日志查看
```bash
# 查看构建日志
./gradlew assembleDebug --stacktrace

# 查看运行时日志
adb logcat
```

## 📋 发布检查清单

### 发布前准备
- [ ] 升级 Java 环境到 11+
- [ ] 配置应用签名
- [ ] 测试所有功能
- [ ] 优化应用图标和启动画面
- [ ] 配置应用描述和截图

### Google Play Store 准备
- [ ] 创建开发者账户
- [ ] 准备应用截图 (至少 2 张)
- [ ] 编写应用描述
- [ ] 配置应用分类
- [ ] 设置目标受众
- [ ] 准备隐私政策

## 📞 技术支持

如需进一步帮助，请检查:
1. Capacitor 官方文档: https://capacitorjs.com/
2. Android 构建指南
3. 项目配置文件

---

**注意**: 当前项目已完全配置好安卓应用所需的所有文件和设置。一旦升级到 Java 11+ 环境，即可成功构建 APK 文件。