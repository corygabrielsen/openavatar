# OpenAvatar

OpenAvatar is no longer under active development.

## Overview

The goal of OpenAvatar is to provide an open source, onchain, interoperable protocol standard for Avatars. Each avatar
has a unique set of attributes and no two avatars are completely identical. All avatars are stored directly on the
Ethereum blockchain, including raw image data and image encoders.

This repository contains the Ethereum contracts used to manage the Avatars, a web app to mint and manage avatars, a
types library, raw image data for avatar sprites, and image encoders.

## What is an Avatar?

An avatar is a digital representation of a user or character in an online environment. It can take many forms, such as
a profile picture, a virtual character in a game, or a personalized icon on a social media platform. OpenAvatar allows
users to create and customize their own avatars, which are stored on the Ethereum blockchain as NFTs.

## Features

OpenAvatar offers the following features:

- Create and customize your own unique avatar, with a wide range of attributes and customization options
- Store your avatar on the Ethereum blockchain as an NFT
- Interoperability with other platforms and applications that support NFTs

## Usage

To use the OpenAvatar app, you will need to install the necessary dependencies and set up your environment.

### Installation

To install the OpenAvatar app, you will need to have the following prerequisites:

- Node.js v18.x
- Yarn package manager
- Hardhat or another Ethereum development blockchain

Once you have the prerequisites installed, clone the repository, navigate to the root directory of the repository and
install the dependencies:

```bash
git clone https://github.com/stoooops/openavatar.git
cd openavatar
yarn install
```

### Running the App

1. Build the app including the contract, web app, sprites, and type library:

```bash
yarn build
```

#### Docker Compose

To run everything in development mode, run:

```bash
$ docker-compose up
```

#### Local

2. Start a local blockchain:

```bash
yarn start:ethereum
```

3. Deploy the contracts and upload the assets to the local blockchain:

```bash
yarn launch
```

4. Run the app:

```bash
yarn start
```

The app should now be running at http://localhost:3000.

### Development

To run the app in development mode, run:

```bash
yarn dev
```

To format the code and lint it, run:

```bash
yarn format
```

To lint the code, run:

```bash
yarn lint
```

To run the unit tests, run:

```bash
yarn test
```

For a code coverage report, run:

```bash
yarn coverage
```

## Repository Structure

The repository structure for the OpenAvatar app consists of the following files and directories:

- `assets`: Assets and scripts for generating and exporting the avatar assets.
- `contracts`: Ethereum smart contracts for managing the avatars and scripts for deploying and interacting on chain. It
  also includes libraries for image encoding.
- `types`: Source code and configuration files for defining OpenAvatar type system.
- `web`: Web app, including configuration files, source code, assets, and scripts.

## Run

You can run the app via

```bash
docker compose up
```

and then visit http://localhost:3000
