I want you to act as a Principal Software Engineer. I will provide some specific information about an app I am developing, and it will be your job to help me with tasks including:

- Write and maintain high-quality code
- Debug and fix issues in software
- Review and improve codebase for quality and efficiency
- Use modern frameworks and industry-standard best practices
- Define technical direction and architecture for software systems
- Maintain documentation
- Improve test coverage

Here is README for the app I am developing:
/begin README

# OpenAvatar

The goal of OpenAvatar is to provide an open source, onchain, interoperable protocol standard for Avatars. Each avatar has a unique set of attributes and no two avatars are completely identical. All avatars are stored directly on the Ethereum blockchain.

This repository contains the Ethereum contract used to manage the Avatars, images of all the avatar layer sprites, and unit test to verify the contract's functionality.

## What is an Avatar?

An avatar is a digital representation of a user or character in an online environment. It can take many forms, such as a profile picture, a virtual character in a game, or a personalized icon on a social media platform. OpenAvatar allows users to create and customize their own avatars, which are stored on the Ethereum blockchain as NFTs (non-fungible tokens).

## Features

OpenAvatar offers the following features:

- Create and customize your own unique avatar, with a wide range of attributes and customization options
- Store your avatar on the Ethereum blockchain as an NFT
- Interoperability with other platforms and applications that support NFTs

## Usage

To use the OpenAvatar app, you will need to install the necessary dependencies and set up your environment.

### Installation

Clone the repo

```bash
git clone https://github.com/stoooops/openavatar.git
```

Install dependencies

```bash
yarn install
```

## Repository Structure

The repository structure for the OpenAvatar app consists of the following files and directories:

- `assets`: This directory contains assets and scripts for generating and exporting the avatar layer sprites.
- `contracts`: This directory contains the Ethereum contracts for managing the avatars, as well as scripts for deploying and debugging the contract. It also includes libraries for image encoding.
- `types`: This directory contains source code and configuration files for defining the types used in the app. This library may include code written in various languages, such as TypeScript and Python.
- `web`: This directory contains files related to the web app, including configuration files, source code, assets and scripts. It is used to build and run the OpenAvatar web app.

## Attribution

OpenAvatar was founded and built by Cory Gabrielsen (cory.eth).
/end README

Here are some important files:

```json
// package.json
{
  "name": "openavatar",
  "version": "0.1.0",
  "private": true,
  "workspaces": ["types", "assets", "contracts", "web"],
  "scripts": {
    "build": "yarn workspaces run build",
    "coverage": "yarn workspaces run coverage",
    "deploy": "yarn workspace @openavatar/contracts deploy",
    "dev": "yarn workspace @openavatar/web dev",
    "down": "docker compose down",
    "format": "yarn workspaces run format",
    "lint": "yarn workspaces run lint",
    "mint": "yarn workspace @openavatar/contracts mint",
    "render": "yarn workspace @openavatar/contracts render",
    "start": "yarn workspace @openavatar/web start",
    "start:ethereum": "yarn workspace @openavatar/contracts start:ethereum",
    "start:hardhat": "yarn workspace @openavatar/contracts start:hardhat",
    "test": "yarn workspaces run test",
    "up": "docker compose up --force-recreate",
    "upload": "yarn workspace @openavatar/contracts upload"
  },
  "description": "OpenAvatar is an open source, onchain protocol for avatars",
  "repository": "git@github.com/stoooops/openavatar.git",
  "author": "Cory Gabrielsen (cory.eth)",
  "license": "GPL-3.0-or-later"
}
```

Before we begin, please say "ACK" in a code block. Always use code blocks when responding to a prompt.
