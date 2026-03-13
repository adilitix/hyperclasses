const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');

const CREDENTIALS_PATH = path.join(__dirname, 'credentials.json');
const FOLDER_ID = '1Br8LydoROQ6wX4WJjyn65wUnFyeSXNS7';

class GoogleDriveService {
    constructor() {
        this.drive = null;
        this.auth = null;
    }

    async init() {
        if (!fs.existsSync(CREDENTIALS_PATH)) {
            console.error('Google Drive Credentials not found at:', CREDENTIALS_PATH);
            return false;
        }

        try {
            this.auth = new google.auth.GoogleAuth({
                keyFile: CREDENTIALS_PATH,
                scopes: ['https://www.googleapis.com/auth/drive.file', 'https://www.googleapis.com/auth/drive.metadata.readonly'],
            });
            this.drive = google.drive({ version: 'v3', auth: this.auth });
            console.log('Google Drive Service Initialized');
            return true;
        } catch (err) {
            console.error('Failed to initialize Google Drive:', err);
            return false;
        }
    }

    async uploadFile(fileName, filePath, mimeType) {
        if (!this.drive) await this.init();
        if (!this.drive) throw new Error('Drive API not initialized');

        const fileMetadata = {
            name: fileName,
            parents: [FOLDER_ID],
        };
        const media = {
            mimeType: mimeType,
            body: fs.createReadStream(filePath),
        };

        try {
            const file = await this.drive.files.create({
                resource: fileMetadata,
                media: media,
                fields: 'id, webViewLink, webContentLink',
            });

            // Make file public if needed, or just return the view links
            await this.drive.permissions.create({
                fileId: file.data.id,
                resource: {
                    role: 'reader',
                    type: 'anyone',
                },
            });

            return file.data;
        } catch (err) {
            console.error('Upload to Drive failed:', err);
            throw err;
        }
    }

    async downloadFile(fileId, destPath) {
        if (!this.drive) await this.init();
        const dest = fs.createWriteStream(destPath);
        const res = await this.drive.files.get(
            { fileId: fileId, alt: 'media' },
            { responseType: 'stream' }
        );
        return new Promise((resolve, reject) => {
            res.data
                .on('end', () => resolve())
                .on('error', err => reject(err))
                .pipe(dest);
        });
    }

    // Sync database files to Drive
    async syncToDrive(fileName, localPath) {
        if (!this.drive) await this.init();
        if (!this.drive) return;

        // Replace slashes with dashes for Drive flat structure visibility
        const driveName = fileName.replace(/\//g, '-');

        try {
            const res = await this.drive.files.list({
                q: `name = '${driveName}' and '${FOLDER_ID}' in parents and trashed = false`,
                fields: 'files(id, name)',
                spaces: 'drive',
            });

            const existingFile = res.data.files[0];
            const media = {
                mimeType: 'application/json',
                body: fs.createReadStream(localPath),
            };

            if (existingFile) {
                // Update
                await this.drive.files.update({
                    fileId: existingFile.id,
                    media: media,
                });
                // console.log(`Synced update: ${fileName}`);
            } else {
                // Create (nested structure handles)
                const fileMetadata = {
                    name: fileName,
                    parents: [FOLDER_ID],
                };
                await this.drive.files.create({
                    resource: fileMetadata,
                    media: media,
                    fields: 'id',
                });
                // console.log(`Synced new: ${fileName}`);
            }
        } catch (err) {
            console.error(`Sync to Drive failed for ${fileName}:`, err.message);
        }
    }
}

module.exports = new GoogleDriveService();
