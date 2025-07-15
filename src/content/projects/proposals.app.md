---
name: proposals.app
shortDescription: Your governance companion for web3 proposals.
date: Now
featuredImage: "/projects/proposals.app/featured.png"
stackPrimary: ["nextjs", "rust", "postgres"]
stackSecondary: ["consul", "nomad", "patroni", "redis", "typescript", "alloy", "tailwind"]
url: https://proposals.app
repository: https://github.com/proposals-app/proposalsapp
index: 10
---

"DAO delegates want to understand proposals efficiently, but proposal information is scattered all over the place." That's how we pitched proposals.app at GovHack Brussels - and won. Together with Paulo Fonseca, we built something that would solve our own frustrations with DAO governance.

## The Problem We Solved

Following governance proposals across Discord, Twitter, Discourse forums, Snapshot, and on-chain voting platforms is exhausting. Delegates were missing important votes or showing up unprepared because they couldn't track everything. We needed a single place to see the entire lifecycle of a proposal - from initial discussion to final on-chain execution.

## The Architecture

We built proposals.app as a monorepo with five specialized services:

**rindexer** (Rust) - Our blockchain indexer that watches governance contracts across Arbitrum, Ethereum, Optimism, and others. It captures every ProposalCreated, VoteCast, and DelegateVotesChanged event in real-time.

**discourse** (Rust) - Syncs with Discourse forums to track proposal discussions, edits, and community sentiment. Runs full refreshes every 6 hours and catches updates every minute.

**mapper** (Rust) - The brain that groups related content. Uses LLM embeddings to link forum discussions with their corresponding on-chain proposals and Snapshot polls. Also responsible of mapping voter wallets to Discourse users using KarmaHQ API.

**web** (Next.js 15) - The frontend that brings it all together. Subdomain routing gives each DAO their own space (arbitrum.proposals.app, uniswap.proposals.app). Built with React 19, Tailwind v4, and wallet integration via RainbowKit.

**email-service** (Node.js) - Sends notifications for new discussions, new proposals and ending votes. Respects user preferences per DAO with a 24-hour cooldown to prevent spam.

## Self-Hosted Infrastructure

We run everything on bare metal across three datacenters - two in Romania and one in Germany. No cloud providers, just three physical servers we control:

- **Proxmox** virtualization with LXC containers
- **Consul** for service discovery with WAN federation
- **Nomad** for container orchestration across all three sites
- **Tailscale** VPN connecting everything securely
- **Cloudflared** Zero Trust tunnel for anything that needs to be exposed publicly, like the frontend.

The database layer uses PostgreSQL 17 with Patroni for automatic failover. If the primary database in Romania fails, Germany takes over in about 30 seconds. Each datacenter has its own read replica for local-first performance.

Redis with Sentinel handles our caching layer. pgpool-II does the smart routing - reads go to your local datacenter, writes go to the primary. Everything stays fast even with datacenters 1000km apart.

## High Availability Features

- **Geographic redundancy** - Any datacenter can fail and the others keep running
- **Automatic failover** - Patroni + etcd for PostgreSQL, Sentinel for Redis
- **Local-first reads** - Each region reads from its local database replica
- **Zero-downtime deployments** - Nomad handles rolling updates
- **Self-healing** - Consul health checks restart failed services automatically

## The Impact

Since launching, we've indexed millions of votes and thousands of proposals. Delegates use us for:

- **Unified proposal tracking** - See forum discussion, Snapshot poll, and on-chain vote in one place
- **Email notifications** - Never miss important proposals
- **Delegate insights** - Track voting power and participation

We're also building Discourse plugins to bring governance data directly into forums - showing live votes, delegate voting power, and notification signups right where discussions happen.

## Open Source Everything

Every line of code is open source. The infrastructure playbooks, the indexers, the web app - it's all there. DAOs can self-host their own instance or use our hosted version. We believe governance infrastructure should be as decentralized as the DAOs it serves.

Running on bare metal might seem old school, but it gives us complete control over our stack. No vendor lock-in, no surprise bills, just reliable infrastructure we can touch and fix ourselves. When you're building tools for decentralized organizations, that philosophy matters.
