# =======================================
# 一键编译 React 并打包 Android APK
# =======================================

# 1️⃣ 编译 React 项目
Write-Host "Step 1: Building React project..."
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Error "React build failed. Exiting."
    exit 1
}

# 2️⃣ 更新 Android 项目资源
Write-Host "Step 2: Copying built files to Android project..."
npx cap copy android
if ($LASTEXITCODE -ne 0) {
    Write-Error "Capacitor copy failed. Exiting."
    exit 1
}

# 3️⃣ 构建 Android APK
Write-Host "Step 3: Building Android APK..."
cd android
.\gradlew assembleDebug
if ($LASTEXITCODE -ne 0) {
    Write-Error "Gradle build failed. Exiting."
    exit 1
}

# 4️⃣ 输出 APK 路径
$apkPath = "app\build\outputs\apk\debug\app-debug.apk"
if (Test-Path $apkPath) {
    Write-Host "`n✅ APK build succeeded!"
    Write-Host "APK path: $(Resolve-Path $apkPath)"
} else {
    Write-Error "APK not found. Build may have failed."
}
