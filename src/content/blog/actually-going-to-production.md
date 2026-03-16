---
title: Actually Going to Production
short: Draft notes on making agent workflows hold up in real projects.
date: 2026-03-16
draft: true
---

- first, make it agnostic. state of the art models change too often, agent harnesses change too often, you need your agnostic, repository first setup
- extensive testing at multiple levels, unit, component, integration and end to end testing, preferably using real data fixtures
- automated docs generation and tying it to agents.md
- git hooks
- extensive PRDs and technical specifications done together with the agent, with the user asking clarifying questions to the agent and the agent asking clarifying questions to the user
