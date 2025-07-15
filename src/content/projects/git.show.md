---
name: git.show
shortDescription: Automated GitHub contribution visualizer that updates your Twitter/X profile banner daily.
date: Mar 2024
featuredImage: "/projects/git.show/featured.png"
stackPrimary: ["nextjs", "typescript", "postgres"]
stackSecondary: ["puppeteer", "browserless", "docker", "shadcn/ui", "tailwind", "nextauth"]
url: https://git.show
repository: https://github.com/andreivcodes/gitshow
index: 96
---

## The Problem

Developers spend a lot of time building their GitHub contribution graphs, but these green squares stay hidden on GitHub. Meanwhile, we're all trying to build our personal brand on Twitter/X.

I found [github-contributions.vercel.app](https://github-contributions.vercel.app), which generates nice contribution graph images. Thanks to them open sourcing it, I got inspired to take it further - what if your Twitter banner could update automatically with your latest contributions?

## The Solution

git.show automatically updates your Twitter banner with your GitHub contributions. Building it meant solving two main technical challenges.

### Getting GitHub Contribution Data

GitHub doesn't have an API for contribution graphs, so I had to scrape them. Using Puppeteer:

- Navigate to GitHub profiles
- Extract data from the SVG elements
- Parse contribution counts and dates

The scraper needs to be resilient since GitHub can change their UI anytime.

### Linking GitHub and Twitter Accounts

This was the tricky part. Most OAuth setups create separate accounts for each provider, but I needed both GitHub and Twitter linked to one user.

The solution:
- Modified NextAuth.js to link accounts instead of creating new ones
- Database schema that supports multiple providers per user
- Encrypted token storage for API credentials

## Technical Stack

Built as a monorepo:

- **Web App**: Next.js 15 with App Router
- **Updater Service**: Express app for scheduled updates
- **Database**: PostgreSQL with Kysely
- **Scraping**: Puppeteer with Browserless
- **Images**: Sharp for SVG to JPEG conversion

## Results

Now developers can showcase their GitHub activity on Twitter without thinking about it. Pick a theme, set your update frequency, and your banner updates automatically. We all know you're proud of your contributions chart, so why not embrace it?
