---
name: nicepfp.art
shortDescription: AI-powered profile picture NFT generator using ML5 SketchRNN.
date: Jun 2023
featuredImage: "/projects/nicepfp.art/featured.png"
stackPrimary: ["nextjs", "typescript", "polygon"]
stackSecondary: ["ml5", "p5.js", "ipfs", "wagmi", "tailwind"]
url: https://nicepfp.art
repository: https://github.com/andreivcodes/nicepfp.art
index: 60
---

"I needed a nice profile picture for my Twitter, so I made this." That's the simple origin story behind nicepfp.art - a web3 project that combines AI-generated art with blockchain technology to create unique, ownable profile pictures.

## The Concept

nicepfp.art uses Google's SketchRNN model through ML5.js to generate hand-drawn style faces. Each generation is unique, created by an AI that learned from millions of human sketches. Users can mint their favorite creations as NFTs on Polygon, turning ephemeral AI art into permanent blockchain assets.

## How It Works

The magic happens in real-time in your browser:

1. **AI Generation** - The SketchRNN model generates face sketches stroke by stroke, mimicking human drawing patterns
2. **Interactive Canvas** - Users can regenerate endlessly until they find their perfect profile picture
3. **IPFS Storage** - Selected images are uploaded to IPFS for permanent, decentralized storage
4. **NFT Minting** - One-click minting on Polygon with cryptographic signatures ensuring authenticity

## The Tech Stack

Built with Next.js and TypeScript, the app uses ML5.js to run Google's SketchRNN model directly in the browser. P5.js handles the drawing canvas where AI-generated sketches come to life stroke by stroke.

For Web3 integration, Wagmi connects wallets while smart contracts on Polygon handle the minting. Each generated image is stored on IPFS, ensuring permanent decentralized storage. The backend validates and signs each mint request to maintain integrity.

## The Architecture

The project is organized as a monorepo with three main services: the Next.js web app, an image processing service for IPFS uploads, and a minting service that interacts with the blockchain. All AI generation happens client-side in the browser, keeping the backend focused on Web3 operations.

## Security & Trust

Every mint requires a cryptographic signature from the backend, ensuring only images generated through the platform can be minted. The smart contract validates these signatures, creating a trustless minting process where users don't need to trust the frontend - the blockchain enforces the rules.

## The User Experience

Visit nicepfp.art and you're immediately greeted with an AI actively drawing. Click the brush button and watch a new face emerge stroke by stroke. The AI never draws the same face twice - each generation is as unique as a human sketch.

When you find one you love, connect your wallet and mint it. The entire process takes under a minute, and your new profile picture is yours forever on the blockchain.

## The Collection

The project has generated hundreds of unique AI-drawn faces, each minted as an individual NFT on Polygon. The collection showcases the diverse range of styles and expressions that emerge from the SketchRNN model - from minimalist line drawings to more detailed portraits. You can browse the full collection on OpenSea to see the variety of algorithmic art that's been created.

Simple. Free. Unlimited. Forever. Sometimes the best projects start with the simplest needs.