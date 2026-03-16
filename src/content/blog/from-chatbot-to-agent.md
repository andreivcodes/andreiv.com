---
title: From Chatbot to Agent
short: Draft notes on the shift from chat interfaces to repository-native agent workflows.
date: 2026-03-16
draft: true
---

- chatbot = ask, answer, copy result back into the real workflow
- early mental model got stuck on ai as a conversation tab
- system prompt was already the first hidden instruction layer above the visible chat
- local models made it obvious that the product was already model + framing + boundaries + task definition
- thinking models added extra inference-time deliberation before replying, much better for planning, diagnosis, sequencing, tradeoffs
- once tools arrived, the model stopped deciding only what to say and started deciding what to do next
- tool use changes the system from answer generation to action selection inside a loop
- harness/environment executes the action, returns results, applies constraints, permissions, and feedback
- plain chatbot answers from prior knowledge + prompt, tool-using system can acquire fresh evidence, transform it, and continue reasoning
- next shift was relocation: model comes to the machine instead of user going to the model
- agent can inspect repo, edit files, run commands, inspect failures, stay in the loop until task is actually resolved
- programming is especially suited because shell, git, linters, tests, logs, browsers, CI are already explicit tool interfaces
- machine-side agent is still the same core idea as the system prompt, but expanded into a runtime environment
- instruction layer is now runtime level too: tool definitions, permission rules, project instructions, step-specific reminders
- model is running inside a live instruction loop: user request + current task state + tools + permission model + runtime rules
- chatbot stops being the right frame once the system works inside repo/terminal/browser instead of outside it
- better frame = agent operating inside an environment with tools, permissions, context, feedback loops, project instructions
- broader question is how to shape that environment so the agent can do a good job on the project
- practical levers: commands, scripts, repo structure, persistent instructions, safe automation boundaries
