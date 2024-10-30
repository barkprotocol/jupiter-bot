# Jupiter BOT

**A Solana Trading Bot Using Jupiter API V6**

The **Customized Jupiter Arbitrage Bot** is designed to facilitate Solana-based token swaps with the best prices, leveraging the Jupiter API. This bot enables users to execute arbitrage trades and provides a comprehensive set of endpoints for interacting with the Solana blockchain efficiently.

## Table of Contents

- [Overview](#overview)
- [API Endpoints](#api-endpoints)
- [Enhanced APIs](#enhanced-apis)
- [Usage](#usage)
- [Installation](#installation)
- [Configuration](#configuration)
- [Endpoint](#endpoint)

---

## Overview

This bot uses the Jupiter API client to handle arbitrage trading, automating the retrieval of the best swap prices, generating transactions, and managing Solana token swaps. The bot supports real-time quotes, swap instructions, and can interface with program IDs for additional token information.


## Structure

**Explanation:**

  - **bot.ts**: This file encapsulates the main bot logic with methods to get quotes, generate swap instructions, and execute swaps using the Jupiter API.
  - **index.ts**: Acts as the entry point to initialize and run the bot.

## API Endpoints

Here's a quick overview of each API endpoint, along with the corresponding JavaScript methods in the Jupiter API client:

| Endpoint                  | JS Method Name(s)               | Type | Description                                                                                       |
|---------------------------|---------------------------------|------|---------------------------------------------------------------------------------------------------|
| `/quote`                  | `quoteGet`, `quoteGetRaw`       | GET  | Retrieves the best-priced quote for a swap between two tokens for a specified amount.             |
| `/swap`                   | `swapPost`, `swapPostRaw`       | POST | Generates a Solana swap transaction based on a quote.                                             |
| `/swap-instructions`      | `swapInstructionsPost`, `swapInstructionsPostRaw` | POST | Provides swap instructions derived from a quote.                                      |
| `/program-id-to-label`    | `programIdToLabelGet`, `programIdToLabelGetRaw` | GET  | Returns a mapping of names or labels for various program IDs.                                     |
| `/indexed-route-map`      | `indexedRouteMapGet`, `indexedRouteMapGetRaw`   | GET  | Returns a hash map where the input mint is a key, with an array of valid output mints as values.  |

* Requests can be made with the following format: `{server}/{endpoint}?{query/body}`.

## Enhanced APIs

Additional APIs provide extended functionality:

- `/price`: Retrieve real-time price data for tokens.
- `/markets`: Get data on available trading markets.
- `/new-pools`: Fetches information on newly added liquidity pools.
- **Quote Websockets**: Real-time quotes for token swaps.
- **Swap Websockets**: Live swap execution notifications.

## Usage

1. **Retrieve a Quote**: Use the `/quote` endpoint to get the best price for a swap between two tokens.
2. **Generate a Swap**: Once you have a quote, use the `/swap` endpoint to create a swap transaction.
3. **Execute Swap Instructions**: Use `/swap-instructions` to obtain specific instructions for executing the swap.

## Installation

To set up the bot locally:

```bash
git clone https://github.com/bark-protocol/jupiter-bot.git
cd jupiter-bot
pnpm install
```

## Configuration

Create an `.env` file in the project root and specify your environment variables, including your Solana RPC URL and any Jupiter API keys if applicable.

Example `.env`:

```bash
SOLANA_RPC_URL=https://api.devnet.solana.com
JUPITER_API_KEY=your_api_key_here
OUTPUT_MINT=<output_token_mint_address>
SWAP_AMOUNT=1000000
```

## Endpoint

Base URL for API calls:

```text
https://jupiter-swap-api.[domain_address]/endpoint_here
```

Replace `[domain_address]` with your actual Jupiter API domain.

## Resources

- [Jupiter API V6]:(https://station.jup.ag/docs/apis/swap-api)