import axios from 'axios';
import FormData from 'form-data';
import { createReadStream } from 'node:fs';
import inquirer from 'inquirer';
import fs from 'fs';
import path from 'path';

const CREDENTIALS_PATH = path.join('.vscode/credentials.json');

type Credentials = { email: string; password: string };

const saveCredentials = (credentials: Credentials) => {
    fs.writeFileSync(CREDENTIALS_PATH, JSON.stringify(credentials, null, 2));
};

const loadCredentials = (): Credentials | null => {
    if (fs.existsSync(CREDENTIALS_PATH)) {
        return JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf-8'));
    }
    return null;
};

const login = async (): Promise<string | null> => {
    let credentials = loadCredentials();
    while (true) {
        if (!credentials) {
            credentials = await inquirer.prompt([
                { type: 'input', name: 'email', message: 'Enter your Acode email:' },
                { type: 'password', name: 'password', message: 'Enter your Acode password:', mask: '*' }
            ]);
        }
        
        try {
            console.log('Logging in...');
            const response = await axios.post('https://acode.app/api/login', {
                email: credentials.email,
                password: credentials.password
            });
            
            const token = response?.headers['set-cookie']?.[0]?.split(';')[0]?.split('=')[1];
            if (token) {
                console.log('Login successful!');
                saveCredentials(credentials);
                return token;
            } else {
                console.error('Failed to retrieve token');
            }
        } catch (error: any) {
            console.error('Login failed:', error.response?.data || error.message);
            credentials = null;
        }
        
        const retry = await inquirer.prompt([
            { type: 'confirm', name: 'retry', message: 'Login failed. Do you want to try again?', default: true }
        ]);

        if (!retry.retry) {
            console.log('Login process aborted.');
            return null;
        }
    }
};

const upload = async (token: string): Promise<void> => {
    try {
        console.log('Uploading plugin...');
        const form = new FormData();
        form.append('plugin', createReadStream('Plugin.zip'));

        const response = await axios.put('https://acode.app/api/plugin', form, {
            headers: {
                ...form.getHeaders(),
                'Cookie': `token=${token}`,
            },
        });

        console.log('Upload successful:', response.data);
    } catch (error: any) {
        console.error('Upload failed:', error.response?.data || error.message);
    }
};

const publish = async (): Promise<void> => {
    console.log('Starting publish process...');
    
    const token = await login();
    if (!token) {
        console.error('Publish process failed due to login issues.');
        return;
    }
    
    const confirm = await inquirer.prompt([
        { type: 'confirm', name: 'proceed', message: 'Do you want to publish the plugin?', default: false }
    ]);

    if (!confirm.proceed) {
        console.log('Publish process cancelled.');
        return;
    }

    await upload(token);
};

publish();