const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');
const path = require('path');
const fs = require('fs');

const SPREADSHEET_ID = '1ydMS7fpnvWN1jzVe0Tww3uNQ9OiJx4tRfv-uf7zI5WE';
const CREDENTIALS_PATH = path.join(__dirname, 'credentials.json');

class GoogleSheetsService {
    constructor() {
        this.doc = null;
    }

    async init() {
        if (this.doc) return true;

        let credentials;
        if (fs.existsSync(CREDENTIALS_PATH)) {
            credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf8'));
        } else if (process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
            credentials = {
                client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
                private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
            };
        } else {
            console.warn('⚠️ Google Sheets Credentials not found. Registration sync disabled.');
            return false;
        }

        try {
            const auth = new JWT({
                email: credentials.client_email,
                key: credentials.private_key,
                scopes: ['https://www.googleapis.com/auth/spreadsheets'],
            });

            this.doc = new GoogleSpreadsheet(SPREADSHEET_ID, auth);
            await this.doc.loadInfo();
            console.log('✅ Google Sheets Service Initialized:', this.doc.title);
            return true;
        } catch (err) {
            console.error('❌ Failed to initialize Google Sheets:', err);
            return false;
        }
    }

    async appendRegistration(reg) {
        if (!await this.init()) return;

        try {
            // Find "Sheet1" or use the first sheet
            let sheet = this.doc.sheetsByTitle['Sheet1'] || this.doc.sheetsByIndex[0];

            // Load headers from Row 1
            try {
                await sheet.loadHeaderRow(1);
            } catch (e) {
                console.log('⚠️ No headers found or Row 1 is empty. Initializing headers...');
                await sheet.setHeaderRow([
                    'Date & Time',
                    'Name',
                    'Email',
                    'Ph No',
                    'Course of Study',
                    'Event',
                    'Approval',
                    'Status'
                ]);
            }

            // Map data to columns matching the spreadsheet headers
            const rowData = {
                'Date & Time': new Date(reg.timestamp).toLocaleString(),
                'Name': reg.name,
                'Email': reg.email,
                'Ph No': reg.phone,
                'Course of Study': reg.course,
                'Event': reg.eventName || reg.eventId || 'General',
                'Approval': (reg.status === 'approved' || reg.status === 'YES') ? 'YES' : 'PENDING',
                'Status': reg.status
            };

            await sheet.addRow(rowData);
            console.log('📝 Registration synced to Google Sheets:', reg.name);
        } catch (err) {
            console.error('❌ Error appending to Google Sheets:', err.message);
            console.log('💡 TIP: Check if your headers are on Row 2. If they are on Row 1, please delete any empty rows above them.');
        }
    }

    async updateRegistrationStatus(regId, newStatus) {
        if (!await this.init()) return;

        try {
            const sheet = this.doc.sheetsByIndex[0];
            const rows = await sheet.getRows();

            // We need a way to identify the row. Since we don't store row index, 
            // we'll search by Name and Email or a hidden ID column if we add one.
            // For now, let's assume Name + Email is unique enough or we add ID to sheet.

            // Better: Let's re-append or just skip updates for now if it's complex.
            // Actually, the user just asked for "fill the next free line".
        } catch (err) {
            console.error('❌ Error updating Google Sheets:', err);
        }
    }
}

module.exports = new GoogleSheetsService();
