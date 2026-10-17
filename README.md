# Kirana Ledger (Store-Ledger)

> **Offline-first inventory management and credit (udhaar) ledger designed for Indian retail kirana stores.**  
> Built with React Native (Expo), TypeScript, SQLite, Node.js (Fastify), PostgreSQL, and a custom native Android Kotlin module.

[![CI](https://github.com/roshan/store-ledger/actions/workflows/ci.yml/badge.svg)](https://github.com/roshan/store-ledger/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/Platform-Android%20%7C%20Node.js-blue.svg)](<>)
[![Protocol](https://img.shields.io/badge/Protocol-X--Protocol--Version%3A%201-orange.svg)](<>)

---

## Table of Contents

- [1. Overview](#1-overview)
- [2. System Architecture](#2-system-architecture)
- [3. Core Data & Engineering Rules](#3-core-data--engineering-rules)
- [4. Monorepo Structure](#4-monorepo-structure)
- [5. Failure Matrix & Sync Resilience](#5-failure-matrix--sync-resilience)
- [6. Security Architecture](#6-security-architecture)
- [7. Kotlin Native Diagnostics Module](#7-kotlin-native-diagnostics-module)
- [8. Getting Started](#8-getting-started)
- [9. Testing Strategy](#9-testing-strategy)
- [10. Documentation Index](#10-documentation-index)

---

## 1. Overview

Kirana stores are the backbone of Indian retail, but operate in harsh digital environments: basement shops with 2G/3G signal dead zones, spotty Wi-Fi, and intermittent power. At the same time, counter checkouts must happen with sub-500ms latency.

**Kirana Ledger** solves this by adopting a strict **offline-first, append-only event-sourcing paradigm**:

- **0ms Checkout Latency:** All reads and writes hit local SQLite directly on the device.
- **Conflict-Free Multi-Device Convergence:** Stock and customer udhaar balances are computed dynamically via `SUM()` across immutable event streams (`stock_movement` and `ledger_entry`), allowing multiple devices to trade offline without losing data.
- **Custom Bidirectional Sync Protocol:** Features an atomic outbox queue, per-shop row-locked sequence allocation (`shop.last_seq`), op-complete pagination boundaries, and lease-coordinated execution across React Native foreground and background runtimes.
- **Android OS Deep Integration:** Includes an Expo Kotlin module querying Android Doze mode and App Standby Buckets (`UsageStatsManager`) to explain background synchronization timing.

---

## 2. System Architecture

```
                       +---------------------------------------+
                       |          PostgreSQL Database          |
                       |  - Composite FKs: (shop_id, id)       |
                       |  - Per-shop seq counter (FOR UPDATE)  |
                       |  - change_log & processed_op          |
                       +-------------------+-------------------+
                                           |
                                           | pg Pool (Parameterized)
                                           v
                       +---------------------------------------+
                       |         Node.js Fastify Server        |
                       |  - Argon2id with concurrency semaphore|
                       |  - Layered Rate Limits & Zod .strict  |
                       |  - Push (SAVEPOINT/op) & Pull (op-end)|
                       +-------------------+-------------------+
                                           ^
                     HTTPS / Protocol v1   |  JWT (15m) + Rotating Refresh (30d)
                                           v
    +-------------------------------------------------------------------------+
    |                         React Native / Expo Client                      |
    |                                                                         |
    |  [UI Layer]                                                             |
    |   - Expo Router (11 Screens + 5 Sheets)                                 |
    |   - FlashList (Memoized rows, stable keys, 60 FPS on low-end devices)   |
    |   - TanStack Query (Local SQLite reads with auto-invalidation)          |
    |   - Zustand (Session state & lightweight cart state)                    |
    |                                                                         |
    |  [Data & Repository Layer]                                              |
    |   - Hand-written SQL with PRAGMA journal_mode = WAL                     |
    |   - Exclusive transactions (Business rows + Outbox in one atomic write) |
    |   - Append-only stock_movement & ledger_entry (sums, not mutable counts)|
    |                                                                         |
    |  [Sync Core Engine]                                                     |
    |   - SQLite DB Lease Row Lock (coordinating foreground & background task)|
    |   - Exponential Backoff + Jitter (Reset on Network & Foreground)        |
    |   - Op Isolation (Batch -> Single dispatch on 5xx -> STUCK state)       |
    |   - Field-level Conflict Detection via baseSeq & Server field_meta      |
    |                                                                         |
    |  [Native Module Layer]                                                  |
    |   - Kotlin Expo Module: UsageStatsManager (App Standby Bucket),         |
    |     PowerManager (Doze/Idle), ConnectivityManager, Async DNS lookup     |
    +-------------------------------------------------------------------------+
```

---

## 3. Core Data & Engineering Rules

1. **Client-Generated UUIDv7:** All primary keys are generated on-device using time-ordered UUIDv7, allowing complete relational tree creation offline with optimal B-Tree index clustering.
2. **Discrete Numeric Modeling:**
   - **Money:** Integer **Paise** (₹1 = 100 paise).
   - **Quantity:** Integer **Milli-units** (1 kg = 1,000 milli-units, 0.250 kg = 250 milli-units).
   - _No floating-point numbers anywhere in calculation or storage._
3. **Rounding Rule:** $\text{line\_total} = \lfloor(\text{qty\_milli} \times \text{unit\_price\_paise} + 500) / 1000\rfloor$. Sale total is the exact mathematical sum of line totals.
4. **Append-Only Immutability:** Stock quantities and udhaar balances are `SUM()` over immutable movements. No `UPDATE` or `DELETE` on financial records; corrections are new compensating rows.
5. **Deterministic IST Time:** Timestamps are stored in UTC milliseconds. Indian Standard Time day boundaries are computed mathematically: $\text{day\_start} = \lfloor(ms + 19800000) / 86400000\rfloor \times 86400000 - 19800000$.
6. **Zero Trust Server Recomputation:** The server recalculates line totals, sale sums, and verifies 1:1 matching negative movements for all incoming sales.

---

## 4. Monorepo Structure

Built with `pnpm` workspaces for clear boundary separation:

```
store-ledger/
├── apps/
│   ├── mobile/                   # React Native / Expo application
│   │   ├── app/                  # Expo Router file-based screens
│   │   ├── modules/device-health/# Kotlin Expo Native Module
│   │   └── src/                  # db/, features/, hooks/, store/, sync/
│   │
│   └── server/                   # Fastify Node.js server
│       └── src/                  # config/, db/, middleware/, routes/, services/
│
├── packages/
│   ├── shared/                   # Single source of truth: Zod .strict() schemas,
│   │                             # protocol constants, math helpers & test fixtures
│   │
│   └── sync-core/                # Pure TypeScript sync engine (outbox, backoff,
│                                 # DB lease coordinator, conflict logic)
│
├── IMPLEMENTATION_PLAN.md        # Detailed 16-day roadmap & ticket matrix
├── IMPLEMENTATION_EXPLANATION.md # Comprehensive Why, What, How, Why Not guide
├── pnpm-workspace.yaml
└── tsconfig.base.json
```

---

## 5. Failure Matrix & Sync Resilience

| Failure Scenario                          | What Happens                              | Why System State Remains Safe                                                                      |
| ----------------------------------------- | ----------------------------------------- | -------------------------------------------------------------------------------------------------- |
| **Response Dropped After Server Commit**  | Client retransmits identical `opId` batch | Server finds `(shop_id, op_id)` in `processed_op`, returns cached `DUPLICATE`; zero duplicate rows |
| **App Killed Mid-Push**                   | Client outbox rows remain `PENDING`       | Retried on next launch; idempotently applied or returned as `DUPLICATE`                            |
| **App Killed Mid-Pull**                   | Old sync cursor retained in SQLite        | Rows and new cursor commit in **one exclusive SQLite transaction**; upserts are idempotent         |
| **Concurrent Offline Sales of Same Item** | Devices write independent `-1` rows       | Both rows survive; `SUM()` accurately reduces inventory by 2; stock may go negative with a warning |
| **Concurrent Edit to Different Fields**   | Both patches apply to PostgreSQL          | Per-field merge applies both column updates cleanly                                                |
| **Concurrent Edit to Same Field**         | Later arrival flagged as conflict         | Server retains winning field; loser is sent a conflict notice with server truth on next pull       |
| **Delete vs Edit Conflict**               | Row stays soft-deleted                    | Sticky tombstone (`deleted_at`); patches cannot resurrect deleted items                            |
| **Poison Op in Batch**                    | Op rolled back via nested `SAVEPOINT`     | Op marked `REJECTED: CONSTRAINT`; remaining valid ops in batch commit normally                     |
| **Infrastructure Error (5xx)**            | Request aborted, nothing recorded         | Client applies exponential backoff with jitter; falls back to single-op dispatch to isolate bad op |
| **Token Expired Mid-Sync**                | Single-flight refresh triggered           | Server 10s grace window protects against lost responses; local data and outbox never wiped         |
| **Overlapping Sync Triggers**             | SQLite table lease coordinates runtimes   | Only one worker acquires lease; second worker sets `rerun` flag for serialized execution           |

---

## 6. Security Architecture

- **BOLA / IDOR Defense:** Enforced at the PostgreSQL schema level via composite unique constraints `UNIQUE (shop_id, id)` and **composite foreign keys** `FOREIGN KEY (shop_id, product_id) REFERENCES product (shop_id, id) ON DELETE CASCADE`.
- **SQL Injection Defense:** Strict parameterization (`$1, $2`) across all queries. Dynamic `PATCH` keys are mapped through hardcoded dictionary allowlists. CI AST checks forbid string interpolation inside queries.
- **Brute Force & Rate Limiting:** Layered `@fastify/rate-limit` (login: 10/min IP, 5/min email; push: 60/min user). Argon2id hashing is guarded by a concurrency semaphore (cap: 4) to eliminate CPU/memory starvation attacks.
- **Device Security:** Auth tokens stored exclusively in `expo-secure-store` (Android Keystore backed). Android auto-backup is disabled (`android:allowBackup="false"`). Telemetry scrubs all PII and tokens before transmission.
- **Account Deletion (Play Compliance):** `DELETE /account` cascades across all tables, deleting user, shop, products, sales, change logs, and processed ops in one transaction.

---

## 7. Kotlin Native Diagnostics Module

Located at [`apps/mobile/modules/device-health`](apps/mobile/modules/device-health), this module bridges low-level Android operating system diagnostics into JavaScript:

- `getStandbyBucket()`: Queries `UsageStatsManager.getAppStandbyBucket()` (API 28+) to report whether Android has placed the app in `ACTIVE`, `WORKING_SET`, `FREQUENT`, `RARE`, or `RESTRICTED`.
- `isDeviceIdle()`: Queries `PowerManager.isDeviceIdleMode()` to detect active Android **Doze Mode**.
- `isIgnoringBatteryOptimizations()`: Inspects exemption status without requesting restricted permissions.
- `getDataSaverStatus()`: Detects background data restrictions from Android Data Saver.
- `resolveDns(host)`: Times native DNS resolution off the main thread using Kotlin coroutines (`Dispatchers.IO`).

_Diagnostic metrics are viewable by tapping the version number 5 times on the Settings screen._

---

## 8. Getting Started

### Prerequisites

- **Node.js:** `v20.x` or higher
- **Package Manager:** `pnpm` (`v9.x` or higher)
- **Database:** PostgreSQL `v15+`
- **Android Development:** Android Studio, JDK 17, Android SDK 34+

### Setup Instructions

1. **Clone and install dependencies:**

   ```bash
   git clone https://github.com/roshan/store-ledger.git
   cd store-ledger
   pnpm install
   ```

2. **Environment Configuration:**

   ```bash
   cp apps/server/.env.example apps/server/.env
   # Edit apps/server/.env with your DATABASE_URL and JWT_SECRET
   ```

3. **Run Database Migrations:**

   ```bash
   pnpm --filter @kirana/server db:migrate
   ```

4. **Start Backend Server:**

   ```bash
   pnpm --filter @kirana/server dev
   # Server runs at http://localhost:3000
   ```

5. **Start Mobile Development Build:**
   ```bash
   pnpm --filter @kirana/mobile start
   # Press 'a' to run on connected Android device/emulator
   ```

---

## 9. Testing Strategy

Run the complete test suite across contracts, server security, and client sync:

```bash
# Run all unit tests, typechecks, and linting
pnpm test
pnpm lint

# Run headless dual-device sync integration tests
pnpm --filter @kirana/sync-core test

# Run server security test suite (BOLA, SQLi, Rate Limiting, Grace Window)
pnpm --filter @kirana/server test:security
```

---

## 10. Documentation Index

- **[Engineering Documentation Directory (documentation/)](documentation/README.md):** Granular ticket-by-ticket and day-by-day technical documentation with _What_, _Why_, _Why Not_, _How_, and _Reference Points_.
  - [Day 1 · SH-01: Monorepo, Tooling & CI](documentation/phase-a-foundation/day-01-sh-01-monorepo-tooling-ci.md)
  - [Day 1 · SH-02: Shared Contract Package](documentation/phase-a-foundation/day-01-sh-02-shared-contract-package.md)
- **[Implementation Plan (IMPLEMENTATION_PLAN.md)](IMPLEMENTATION_PLAN.md):** 16-day roadmap, ticket breakdown (SH, BE, FE), pairing matrix, and Google Play milestones.
- **[Architectural Decisions (IMPLEMENTATION_EXPLANATION.md)](IMPLEMENTATION_EXPLANATION.md):** In-depth technical rationale covering _Why_, _What_, _How_, and _Why Not_ for all 16 major architectural choices.
- **[Feature Tickets (kirana-ledger-tickets-v2.md)](../kirana-ledger-tickets-v2.md):** Granular work tickets with acceptance criteria and dependencies.
- **[Build Specification v2 (kirana-ledger-spec-v2.md)](../kirana-ledger-spec-v2.md):** Comprehensive technical specification and security model.

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
