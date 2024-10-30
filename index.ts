import fs from 'fs';
import path from 'path';
import ArbBot from './bot';
import dotenv from 'dotenv';

dotenv.config();

// Load the configuration from the config.json file
const configPath = path.resolve(__dirname, 'config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

// Load the secret key from the bot-keypair.json file
const keypairPath = path.resolve(__dirname, 'env.bot-keypair.json');
const keypairData = JSON.parse(fs.readFileSync(keypairPath, 'utf-8'));
const secretKey = keypairData.secretKey;

// Initialize the bot
const arbBot = new ArbBot(config, secretKey);

// Handle graceful shutdown
const shutdownHandler = () => {
    arbBot.terminateSession('Received termination signal');
    process.exit(0);
};

// Listen for termination signals
process.on('SIGINT', shutdownHandler);
process.on('SIGTERM', shutdownHandler);

(async () => {
    try {
        await arbBot.init();
        console.log('ArbBot is now running...');
    } catch (error) {
        console.error('Failed to initialize ArbBot:', error);
        process.exit(1);
    }
})();
