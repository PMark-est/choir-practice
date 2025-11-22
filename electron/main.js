const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');

let mainWindow;
let javaProcess;

function getJavaPath() {
    // In development, use system Java
    if (!app.isPackaged) {
        return 'java';
    }

    // In production, use bundled JRE
    const jrePath = path.join(process.resourcesPath, 'jre');

    if (process.platform === 'win32') {
        return path.join(jrePath, 'bin', 'java.exe');
    } else if (process.platform === 'darwin') {
        // macOS JRE structure
        const contentsHome = path.join(jrePath, 'Contents', 'Home', 'bin', 'java');
        if (fs.existsSync(contentsHome)) {
            return contentsHome;
        }
        // Alternative structure
        return path.join(jrePath, 'bin', 'java');
    } else {
        // Linux
        return path.join(jrePath, 'bin', 'java');
    }
}

function getBackendJarPath() {
    // In development
    if (!app.isPackaged) {
        return path.join(__dirname, '../java-backend/build/libs/backend-1.0.jar');
    }

    // In production (packaged app)
    return path.join(process.resourcesPath, 'backend.jar');
}

function startJavaBackend() {
    const jarPath = getBackendJarPath();
    const javaPath = getJavaPath();

    console.log(`Java path: ${javaPath}`);
    console.log(`JAR path: ${jarPath}`);

    // Only validate Java path if it's an actual path, not a PATH command
    const isAbsolute = javaPath.includes(path.sep);

    if (isAbsolute && !fs.existsSync(javaPath)) {
        console.error(`Java executable not found at: ${javaPath}`);
        return Promise.reject(new Error('Java executable not found'));
    }

    if (!fs.existsSync(jarPath)) {
        console.error(`Backend JAR not found at: ${jarPath}`);
        return Promise.reject(new Error('Backend JAR not found'));
    }

    javaProcess = spawn(javaPath, ['-jar', jarPath]);

    javaProcess.stdout.on('data', (data) => {
        console.log(`Java Backend: ${data}`);
    });

    javaProcess.stderr.on('data', (data) => {
        console.error(`Java Backend Error: ${data}`);
    });

    javaProcess.on('close', (code) => {
        console.log(`Java Backend exited with code ${code}`);
    });

    javaProcess.on('error', (err) => {
        console.error('Failed to start Java backend:', err);
    });

    // Wait for backend to start
    return new Promise((resolve) => setTimeout(resolve, 5000));
}

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1000,
        height: 700,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        }
    });

    mainWindow.loadFile('index.html');

    if (process.argv.includes('--dev') || !app.isPackaged) {
        mainWindow.webContents.openDevTools();
    }

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

app.whenReady().then(async () => {
    try {
        await startJavaBackend();
        createWindow();
    } catch (error) {
        console.error('Failed to start application:', error);
        app.quit();
    }

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('quit', () => {
    if (javaProcess) {
        javaProcess.kill();
    }
});

app.on('before-quit', () => {
    if (javaProcess) {
        javaProcess.kill();
    }
});
