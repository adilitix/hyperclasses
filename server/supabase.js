const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const SUPABASE_URL = 'https://yhaldrwdpkfduwvkwvwq.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InloYWxkcndkcGtmZHV3dmt3dndxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjkxNDM1MSwiZXhwIjoyMDgyNDkwMzUxfQ.u9rnp3OBNsT_XVpMm7K0-I87k3ib803H-xr70BFzHP0';

class SupabaseService {
    constructor() {
        this.client = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
        this.bucketName = 'workshop-files';
        this.isReady = false;
        this.checkConnection();
    }

    async checkConnection() {
        try {
            const { data, error } = await this.client.storage.getBucket(this.bucketName);
            if (error) {
                console.error(`Supabase Connection Check: Bucket "${this.bucketName}" not found or inaccessible. Error: ${error.message}`);
                this.isReady = false;
            } else {
                // console.log('Supabase Cloud Connection: Active');
                this.isReady = true;
            }
        } catch (e) {
            console.error('Supabase Connection Check: Failed to connect.', e.message);
            this.isReady = false;
        }
    }

    async healthCheck() {
        await this.checkConnection();
        return this.isReady;
    }

    async uploadFile(fileName, filePath, mimeType) {
        const fileContent = fs.readFileSync(filePath);
        const { data, error } = await this.client.storage
            .from(this.bucketName)
            .upload(fileName, fileContent, {
                contentType: mimeType,
                upsert: true
            });

        if (error) throw error;

        // Get public URL
        const { data: { publicUrl } } = this.client.storage
            .from(this.bucketName)
            .getPublicUrl(fileName);

        return {
            id: data.path,
            url: publicUrl
        };
    }

    // Mirror JSON data to a simple key-value table
    async syncToCloud(key, value) {
        try {
            await this.client.storage
                .from(this.bucketName)
                .upload(`_data/${key}.json`, JSON.stringify(value, null, 2), {
                    contentType: 'application/json',
                    upsert: true
                });
        } catch (e) {
            console.error(`Supabase Sync failed for ${key}:`, e.message);
        }
    }

    async getFromCloud(key) {
        try {
            const { data, error } = await this.client.storage
                .from(this.bucketName)
                .download(`_data/${key}.json`);

            if (error) return null;
            const text = await data.text();
            return JSON.parse(text);
        } catch (e) {
            console.error(`Supabase Pull failed for ${key}:`, e.message);
            return null;
        }
    }

    async listData(prefix) {
        try {
            const { data, error } = await this.client.storage
                .from(this.bucketName)
                .list('_data', { search: prefix });

            if (error) throw error;
            return data;
        } catch (e) {
            console.error('Supabase List failed:', e.message);
            return [];
        }
    }

    async removeFromCloud(key) {
        try {
            await this.client.storage
                .from(this.bucketName)
                .remove([`_data/${key}.json`]);
            console.log(`Cloud data removed for: ${key}`);
        } catch (e) {
            console.error(`Supabase Remove failed for ${key}:`, e.message);
        }
    }
}

module.exports = new SupabaseService();
