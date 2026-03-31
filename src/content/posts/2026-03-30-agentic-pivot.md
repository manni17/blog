---
title: "From Microservices to Fat Controllers for Agent-First Development"
slug: "microservices-to-fat-controllers-agentic-pivot"
date: "2026-03-30"
excerpt: "Why we pivoted Steller from distributed services to a context-dense monolith that AI agents can operate reliably."
tags: ["architecture", "agentic", "case-study"]
cover: "/images/blog/agentic-pivot-cover.jpg"
---

Steller started as a textbook microservices platform: separate services for orders, wallets, catalog, and webhooks, with RabbitMQ stitching everything together.

It looked clean on diagrams. It was painful in agent sessions.

## The core problem

AI agents could not hold the full order flow in one context window:

- wallet debit lived in one service
- vendor call in another
- reconciliation and retries somewhere else

Each debugging session began with orientation instead of execution.

## The pivot

We moved the golden flow into a visible, traceable path:

1. Request arrives in one controller path
2. Wallet debit is explicit
3. Fulfillment job is explicit (`PlaceBambooOrderJob`)
4. Rollback path is explicit on failure

Hangfire replaced message-bus choreography for this path, reducing hidden dependencies.

## What changed operationally

- **Faster orientation:** the agent can open one file and reason top-to-bottom.
- **Lower error rate:** fewer cross-service blind spots.
- **Cheaper sessions:** less context-loading overhead means lower token and time cost.

## Practical rule

For agent-operated systems, architecture should be optimized for **context density** and **traceability**, not only service purity.

Microservices are not wrong by default; they are just expensive when a solo operator depends on AI agents for most implementation and maintenance work.

## Publishing

Posts in this repo build into a static site. Deploy the `steller-blog` Docker service on the Steller VPS (see `docs/MUHANAD_BLOG_PUBLISHING_RUNBOOK.md` in the main Steller monorepo).
