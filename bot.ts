import {
    Connection,
    PublicKey,
    Transaction,
    TransactionInstruction,
    Keypair,
    LAMPORTS_PER_SOL,
} from '@solana/web3.js';
import { QuoteResponse, Jupiter } from '@jup-ag/api';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

interface ArbBotConfig {
    solanaRpcUrl: string;
    heliusApiUrl: string;
    heliusApiKey: string;
    jupiterApiUrl: string;
    inputMint: string;
    outputMint: string;
    targetGainPercentage: number;
    priceWatchInterval: number;
    slippageTolerance: number;
    tradeThrottle: number; // New parameter for trade throttling
}

class ArbBot {
    private connection: Connection;
    private jupiter: Jupiter;
    private heliusApiUrl: string;
    private heliusApiKey: string;
    private keypair: Keypair;
    private inputMint: string;
    private outputMint: string;
    private targetGainPercentage: number;
    private slippageTolerance: number;
    private tradeThrottle: number; // Trade throttle duration
    private lastTradeTimestamp: number = 0; // Timestamp of the last trade
    private priceWatchIntervalId: NodeJS.Timeout | null = null;
    private apiCallCount: number = 0;
    private rateLimit: number = 5; // Max API calls in a minute

    constructor(config: ArbBotConfig, secretKey: number[]) {
        this.connection = new Connection(config.solanaRpcUrl);
        this.jupiter = new Jupiter({ connection: this.connection, cluster: 'devnet' });
        this.heliusApiUrl = config.heliusApiUrl;
        this.heliusApiKey = config.heliusApiKey;
        this.keypair = Keypair.fromSecretKey(new Uint8Array(secretKey));
        this.inputMint = config.inputMint;
        this.outputMint = config.outputMint;
        this.targetGainPercentage = config.targetGainPercentage;
        this.slippageTolerance = config.slippageTolerance;
        this.tradeThrottle = config.tradeThrottle; // Initialize throttle
    }

    public async init(): Promise<void> {
        await this.startMonitoring();
    }

    private async startMonitoring(): Promise<void> {
        await this.refreshBalances();
        this.startWatchingPrices();
    }

    private startWatchingPrices(): void {
        this.priceWatchIntervalId = setInterval(async () => {
            try {
                if (this.apiCallCount >= this.rateLimit) {
                    console.log('Rate limit reached, skipping API call...');
                    return;
                }
                const quote = await this.getQuote();
                if (quote) {
                    await this.checkAndExecuteTrade(quote);
                    this.apiCallCount++;
                }
            } catch (error) {
                console.error('Error in price watch interval:', error);
            }
        }, this.priceWatchInterval);
    }

    private async getQuote(): Promise<QuoteResponse | null> {
        try {
            const quote = await this.jupiter.getQuote({
                inputMint: this.inputMint,
                outputMint: this.outputMint,
                amount: '1000000', // Example amount (in smallest units)
            });
            return quote;
        } catch (error) {
            console.error('Error fetching quote:', error);
            return null;
        }
    }

    private async checkAndExecuteTrade(quote: QuoteResponse): Promise<void> {
        const inAmount = parseFloat(quote.inAmount);
        const outAmount = parseFloat(quote.outAmount);
        const targetOutAmount = inAmount * (1 + this.targetGainPercentage / 100);
        const slippageAmount = targetOutAmount * (this.slippageTolerance / 100);
        const currentTime = Date.now();

        // Throttle trading to prevent excessive transactions
        if (currentTime - this.lastTradeTimestamp < this.tradeThrottle) {
            console.log(`Throttle active. Waiting for ${this.tradeThrottle} milliseconds before next trade.`);
            return;
        }

        if (outAmount >= targetOutAmount - slippageAmount) {
            console.log(`Executing trade: ${inAmount} ${this.inputMint} for ${outAmount} ${this.outputMint}`);
            await this.executeTrade(quote);
            this.lastTradeTimestamp = currentTime; // Update last trade timestamp
        } else {
            console.log(`Trade not executed due to slippage. Expected at least ${targetOutAmount - slippageAmount}, got ${outAmount}.`);
        }
    }

    private async executeTrade(quote: QuoteResponse): Promise<void> {
        try {
            const transaction = this.createTransaction(quote);
            const txId = await this.sendTransactionWithRetry(transaction);
            await this.postTransactionProcessing(quote, txId);
        } catch (error) {
            console.error('Error executing trade:', error);
        }
    }

    private createTransaction(quote: QuoteResponse): Transaction {
        const transaction = new Transaction();
        const instructions = quote.instructions.map(this.instructionDataToTransactionInstruction);
        transaction.add(...instructions);
        return transaction;
    }

    private async sendTransactionWithRetry(transaction: Transaction, retries: number = 3): Promise<string> {
        for (let attempt = 1; attempt <= retries; attempt++) {
            try {
                const response = await this.connection.sendTransaction(transaction, [this.keypair]);
                return response; // Return transaction signature
            } catch (error) {
                console.error(`Attempt ${attempt} to send transaction failed:`, error);
                if (attempt === retries) {
                    throw new Error('Max retries reached. Transaction failed.');
                }
            }
        }
        throw new Error('Transaction not sent.');
    }

    private async refreshBalances(): Promise<void> {
        try {
            const publicKey = this.keypair.publicKey;
            const response = await axios.get(`${this.heliusApiUrl}/accounts/${publicKey.toBase58()}/balances`, {
                headers: {
                    'Authorization': `Bearer ${this.heliusApiKey}`,
                },
            });

            const balances = response.data;
            console.log(`Balances: ${JSON.stringify(balances, null, 2)}`);
        } catch (error) {
            console.error('Error refreshing balances:', error);
        }
    }

    private async logSwap(logEntry: any): Promise<void> {
        try {
            const filePath = path.resolve(__dirname, 'trades.json');
            if (!fs.existsSync(filePath)) {
                fs.writeFileSync(filePath, JSON.stringify([]));
            }
            const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
            data.push(logEntry);
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        } catch (error) {
            console.error('Error logging trade:', error);
        }
    }

    private async postTransactionProcessing(quote: QuoteResponse, txId: string): Promise<void> {
        const timestamp = new Date().toISOString();
        const inputToken = quote.inputMint;
        const inAmount = quote.inAmount;
        const outputToken = quote.outputMint;
        const outAmount = quote.outAmount;

        await this.logSwap({ inputToken, inAmount, outputToken, outAmount, txId, timestamp });
        console.log(`🔄 Swap completed! TX ID: ${txId}`);
    }

    private instructionDataToTransactionInstruction(instruction: TransactionInstruction): TransactionInstruction {
        return new TransactionInstruction({
            keys: instruction.keys,
            programId: instruction.programId,
            data: instruction.data,
        });
    }

    public terminateSession(reason: string): void {
        console.error(`🛑 Terminating session: ${reason}`);
        if (this.priceWatchIntervalId) {
            clearInterval(this.priceWatchIntervalId);
        }
    }

    // Health Check
    public async healthCheck(): Promise<boolean> {
        try {
            const balance = await this.connection.getBalance(this.keypair.publicKey);
            console.log(`Health Check: Current balance is ${balance / LAMPORTS_PER_SOL} SOL.`);
            return balance > 0;
        } catch (error) {
            console.error('Health check failed:', error);
            return false;
        }
    }
}

export default ArbBot;