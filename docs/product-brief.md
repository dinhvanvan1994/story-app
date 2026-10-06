# Product Brief — Story Pointing App

## Overview
A lightweight web app for Scrum teams to estimate stories together with planning poker.
A facilitator creates a room and shares a link; the team votes privately on Fibonacci
cards, and all votes are revealed at once so nobody anchors on someone else's number.
No signup. Works across tabs, browsers and devices.

## Target users
- **Facilitator** (Scrum Master): creates the room, starts a story, reveals votes, moves on.
- **Participant** (developer, tester): joins with a display name and votes.

## Success criteria (each checkable in the live demo)
1. Two different browsers (e.g. Chrome and Firefox) in the same room see each other within 2 seconds.
2. Before reveal, other participants only see "Voted" / "Not voted", never the value.
3. After reveal, everyone sees the same votes, the average ("?" excluded) and a consensus indicator.
4. A full round (create, join, vote, reveal, next story) works without a page reload.
5. The app is live on a public URL and the automated end-to-end test passes against it.

## MVP features (exactly 3)
1. **Create & Join Room**: create a room with a short code and shareable link; join with code and name; live participant list.
2. **Vote on Stories**: the facilitator starts a story; participants pick a Fibonacci card (0, 1, 2, 3, 5, 8, 13, 21, ?); votes stay hidden.
3. **View Results**: the facilitator reveals votes; show each vote, average, most common, highest, lowest and a consensus indicator; "Next Story" resets the round.

## Out of scope
- Accounts and login (anyone with the room code can join)
- History of past sessions (rooms are ephemeral)
- Database (state is synced in real time, not stored)
- Custom point scales, voting timer, story descriptions
- Jira or other tool integrations
- Host migration (the room ends if the host closes the tab)

## Constraints and assumptions
- Built and demoed within one working day, mob working on one shared computer.
- Free tiers only for hosting and realtime.
- No custom backend server.
- Modern desktop browsers; basic responsive layout only.

## Tech stack
React 19, TypeScript, Vite · Tailwind CSS · Supabase Realtime (Broadcast, no tables) ·
Vitest (unit) and Playwright (E2E) · Vercel (hosting)
