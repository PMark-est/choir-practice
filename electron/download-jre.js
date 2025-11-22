const https = require('https');
const fs = require('fs');
const path = require('path');
const { pipeline } = require('stream/promises');
const extract = require('extract-zip');
const tar = require('tar');

const JRE_VERSION = '17.0.9+9';
const ADOPTIUM_BASE = 'https://api.adoptium.net/v3/binary/latest/17/ga';

const PLATFORM_CONFIGS = {
    win32: {
        url: `${ADOPTIUM_BASE}/windows/x64/jre/hotspot/normal/eclipse`,
        extension: '.zip',
        extract: extractZip
    },
    darwin: {
        url: `${ADOPTIUM_BASE}/mac/x64/jre/hotspot/normal/eclipse`,
        extension: '.tar.gz',
        extract: extractTarGz
    },
    linux: {
        url: `${ADOPTIUM_BASE}/linux/x64/jre/hotspot/normal/eclipse`,
        extension: '.tar.gz',
        extract: extractTarGz
    }
};

async function downloadFile(url, dest, retries = 3) {
    console.log(`Downloading JRE from ${url}...`);

    return new Promise((resolve, reject) => {
        https.get(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (X11; Linux x86_64)",
                "Accept": "application/octet-stream"
            }
        }, (response) => {

            // Follow redirects
            if ([301, 302, 307].includes(response.statusCode)) {
                return downloadFile(response.headers.location, dest, retries)
                    .then(resolve)
                    .catch(reject);
            }

            // Retry on 503
            if (response.statusCode === 503 && retries > 0) {
                console.log(`503 received, retrying (${retries} left)...`);
                return setTimeout(() => {
                    downloadFile(url, dest, retries - 1)
                        .then(resolve)
                        .catch(reject);
                }, 2000);
            }

            if (response.statusCode !== 200) {
                reject(new Error(`Failed to download: ${response.statusCode}`));
                return;
            }

            // Stream to file
            const file = fs.createWriteStream(dest);
            const total = parseInt(response.headers["content-length"] || "0", 10);
            let downloaded = 0;

            response.on("data", (chunk) => {
                downloaded += chunk.length;
                if (total > 0) {
                    const percent = ((downloaded / total) * 100).toFixed(2);
                    process.stdout.write(`\rDownloading: ${percent}%`);
                }
            });

            response.pipe(file);

            file.on("finish", () => {
                file.close();
                console.log("\nDownload complete!");
                resolve();
            });

        }).on("error", reject);
    });
}


async function extractZip(archivePath, destPath) {
    console.log('Extracting ZIP archive...');
    await extract(archivePath, { dir: path.resolve(destPath) });

    // Find the JRE directory (it's usually in a subdirectory)
    const extractedItems = fs.readdirSync(destPath);
    const jreDir = extractedItems.find(item =>
        item.startsWith('jdk') || item.startsWith('jre')
    );

    if (jreDir) {
        const sourcePath = path.join(destPath, jreDir);
        const items = fs.readdirSync(sourcePath);

        // Move contents up one level
        for (const item of items) {
            fs.renameSync(
                path.join(sourcePath, item),
                path.join(destPath, item)
            );
        }

        fs.rmdirSync(sourcePath);
    }
}

async function extractTarGz(archivePath, destPath) {
    console.log('Extracting TAR.GZ archive...');
    await tar.x({
        file: archivePath,
        cwd: destPath,
        strip: 1 // Remove the top-level directory
    });
}

async function downloadAndExtractJRE() {
    const platform = process.platform;
    const config = PLATFORM_CONFIGS[platform];

    if (!config) {
        throw new Error(`Unsupported platform: ${platform}`);
    }

    const jreDir = path.join(__dirname, 'jre');
    const downloadDir = path.join(__dirname, 'jre-download');

    // Check if JRE already exists
    if (fs.existsSync(jreDir)) {
        console.log('JRE already exists, skipping download.');
        return;
    }

    // Create directories
    fs.mkdirSync(downloadDir, { recursive: true });
    fs.mkdirSync(jreDir, { recursive: true });

    const archivePath = path.join(downloadDir, `jre${config.extension}`);

    try {
        // Download
        await downloadFile(config.url, archivePath);

        // Extract
        await config.extract(archivePath, jreDir);

        console.log('JRE setup complete!');

        // Cleanup
        fs.rmSync(downloadDir, { recursive: true, force: true });

    } catch (error) {
        console.error('Error downloading/extracting JRE:', error);
        // Cleanup on error
        if (fs.existsSync(jreDir)) {
            fs.rmSync(jreDir, { recursive: true, force: true });
        }
        if (fs.existsSync(downloadDir)) {
            fs.rmSync(downloadDir, { recursive: true, force: true });
        }
        throw error;
    }
}

// Run if executed directly
if (require.main === module) {
    downloadAndExtractJRE()
        .then(() => {
            console.log('JRE download completed successfully');
            process.exit(0);
        })
        .catch((error) => {
            console.error('Failed to download JRE:', error);
            process.exit(1);
        });
}

module.exports = { downloadAndExtractJRE };
