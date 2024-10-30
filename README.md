# Jupiter BOT

**A Solana Trading Bot Using Jupiter API V6**

The **Customized Jupiter Arbitrage Bot** is designed to facilitate Solana-based token swaps with optimal pricing, leveraging Jupiter API V6. This bot enables users to execute arbitrage trades and provides a comprehensive set of endpoints for efficient interaction with the Solana blockchain.

## Table of Contents

- [Overview](#overview)
- [Structure](#structure)
- [API Endpoints](#api-endpoints)
- [Enhanced APIs](#enhanced-apis)
- [Rate Limit](#rate-limit)
- [Usage](#usage)
- [Installation](#installation)
- [Configuration](#configuration)
- [Generate Keypairs](#generate-keypairs)
- [Endpoint](#endpoint)
- [Resources](#resources)

---

## Overview

This bot uses the Jupiter API client to handle arbitrage trading on Solana, automating price retrieval, transaction generation, and token swap management. It supports real-time quotes, swap instructions, and program ID interactions for additional token information.

## Structure

- **bot.ts**: Contains main bot logic, including methods for retrieving quotes, generating swap instructions, and executing swaps using the Jupiter API.
- **index.ts**: The entry point to initialize and run the bot.

## API Endpoints

An overview of the main API endpoints, with corresponding JavaScript methods in the Jupiter API client:

| Endpoint                  | JS Method Name(s)               | Type | Description                                                                                       |
|---------------------------|---------------------------------|------|---------------------------------------------------------------------------------------------------|
| `/quote`                  | `quoteGet`, `quoteGetRaw`       | GET  | Retrieves the best-priced quote for a swap between two tokens for a specified amount.             |
| `/swap`                   | `swapPost`, `swapPostRaw`       | POST | Generates a Solana swap transaction based on a quote.                                             |
| `/swap-instructions`      | `swapInstructionsPost`, `swapInstructionsPostRaw` | POST | Provides swap instructions derived from a quote.                                      |
| `/program-id-to-label`    | `programIdToLabelGet`, `programIdToLabelGetRaw` | GET  | Returns a mapping of names or labels for various program IDs.                                     |
| `/indexed-route-map`      | `indexedRouteMapGet`, `indexedRouteMapGetRaw`   | GET  | Returns a hash map where the input mint is a key, with an array of valid output mints as values.  |

Request format: `{server}/{endpoint}?{query/body}`.

## Enhanced APIs

Additional APIs provide extended functionality:

- `/price`: Retrieve real-time price data for tokens.
- `/markets`: Get data on available trading markets.
- `/new-pools`: Fetches information on newly added liquidity pools.
- **Quote Websockets**: Real-time quotes for token swaps.
- **Swap Websockets**: Live swap execution notifications.

## Rate Limit

API rate limits may vary based on server load. For higher rate limits, consider running a dedicated instance of the API.

## Usage

1. **Retrieve a Quote**: Use the `/quote` endpoint to get the best price for a swap between two tokens.
2. **Generate a Swap**: With a retrieved quote, use the `/swap` endpoint to create a swap transaction.
3. **Execute Swap Instructions**: Use `/swap-instructions` to obtain specific instructions for executing the swap.

## Installation

To set up the bot locally:

```bash
git clone https://github.com/bark-protocol/jupiter-bot.git
cd jupiter-bot
pnpm install
```

## Configuration

Create an `.env` file in the project root to specify environment variables, including the Solana RPC URL and Jupiter API key if applicable.

Example `.env`:

```bash
SECRET_KEY=your_secret_key_here  # Avoid sharing!
SOLANA_RPC_URL=https://api.devnet.solana.com
HELIUS_ENDPOINT=
JUPITER_API_KEY=your_api_key_here
INPUT_MINT=<input_token_mint_address>
OUTPUT_MINT=<output_token_mint_address>
SWAP_AMOUNT=1000000
```

## Generate Keypairs

To create a wallet file if you don’t already have one, run:

```bash
solana-keygen new --no-bip39-passphrase --silent --outfile ./my-keypair.json
```

## Endpoint

Base URL for API calls:

```plaintext
https://jupiter-swap-api.[domain_address]/endpoint_here
```

Replace `[domain_address]` with your actual Jupiter API domain.

## Resources

- [Jupiter API V6 Documentation](https://station.jup.ag/docs/apis/swap-api)
- [API Swagger Documentation](https://station.jup.ag/docs/apis/swagger)
