# choir-practice

### 1. Build Java Backend
```bash
cd java-backend
./gradlew clean bootJar
# On Windows: gradlew.bat clean bootJar
```

### 2. Install Electron Dependencies
```bash
cd electron
npm install
```

### 3. Download JRE (Automatic)
The JRE will be automatically downloaded when you build:
```bash
npm run prebuild
```

This downloads the Adoptium (Eclipse Temurin) JRE 17 for your platform.

### 4. Run the Application (Development)
```bash
npm start
```

### 5. Build Standalone Executable

#### For Windows:
```bash
npm run build:win
```
Output: `electron/dist/ElectronJavaApp Setup 1.0.0.exe` (~180-220MB)

#### For macOS:
```bash
npm run build:mac
```
Output: `electron/dist/ElectronJavaApp-1.0.0.dmg` (~180-220MB)

#### For Linux:
```bash
npm run build:linux
```
Output: `electron/dist/ElectronJavaApp-1.0.0.AppImage` (~180-220MB)

#### Build for all platforms:
```bash
npm run build
```
