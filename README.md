# Minty - Ethereum Wallet Manager

Minty is a powerful Ethereum wallet manager built with Electron, React, and TypeScript. It allows users to efficiently manage Ethereum wallets, perform various transactions, automate tasks, and analyze the profit/loss of NFT projects using stored wallets.

## Features

- **Wallet Management:**
  - Create new wallets.
  - Delete existing wallets.
  - Consolidate funds.
  - Disperse funds among wallets.

- **Automated Tasks:**
  - Create tasks that interact with contracts.
  - Assign tasks to specific wallets.
  - Specify hex function data for task execution.

- **Stats Section:**
  - Analyze profit/loss of NFT projects.
  - Utilizes data from all stored wallets in the wallet manager.

- **RPC Provider Configuration:**
  - Users can set the RPC provider to communicate with the Ethereum network.

- **Webhook Integration:**
  - Optional webhook configuration to receive and store notifications from the application.

## Getting Started

To get started with Minty, follow these steps:

1. **Clone the Repository:**
   ```bash
    git clone https://github.com/captinturtle1/minty-desktop
2. **Install Dependencies:**
    ```bash
    cd minty-desktop
    npm install
2. **Run the Application:**
    ```bash
    npm start
3. **Set Up RPC Provider:**

    In the application settings, configure the RPC provider to connect to the Ethereum network.

**Optional Webhook Configuration:**
  Set up a webhook to receive notifications from Minty.

## Usage

1. **Creating a Wallet:**

      Use the application interface to create a new wallet.

2. **Managing Wallets:**

      Delete wallets, consolidate funds, and disperse funds among wallets.

3. **Automating Tasks:**

      Create and assign tasks to wallets with specific hex function data.

4. **Stat Section:**

      Analyze the profit/loss of NFT projects using stored wallet data.

## Configuration
**RPC Provider**

To set the RPC provider, follow these steps:
  1. Open Minty.
  2. Navigate to Settings.
  3. Enter the RPC endpoint in the designated field.
  4. Click "Set" to confirm settings.

**Webhook Integration**

To set up a webhook, follow these steps:

  1. Open Minty.
  2. Navigate to Settings.
  3. Enter the webhook URL in the designated field.
  4. Click "Set" to confirm settings.
