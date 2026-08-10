// client/src/lib/mockData.ts

// 1. Table: Issues
export const MOCK_ISSUES = [
  {
    id: 101,
    title: "Main Street Pothole & Road Repair",
    description: "Deep pothole near 5th Avenue causing major traffic delays and tire damage.",
    category: "Infrastructure",
    priority: "critical",
    status: "in_progress",
    votes: 42,
    createdAt: new Date().toISOString(),
    author: "Jane Doe",
  },
  {
    id: 102,
    title: "Community Solar Panel Grant Proposal",
    description: "Proposal to install community solar panels on public school roofs.",
    category: "Environment",
    priority: "medium",
    status: "open",
    votes: 28,
    createdAt: new Date().toISOString(),
    author: "Alex Smith",
  },
];

// 2. Table: Comments
export const MOCK_COMMENTS = [
  {
    id: 1,
    issueId: 101,
    author: "Mark R.",
    content: "This pothole damaged my rim yesterday. Highly urgent!",
    createdAt: new Date().toISOString(),
  },
];

// 3. Table: Mini Games / Leaderboard
export const MOCK_GAME_SCORES = [
  { id: 1, username: "EcoWarrior99", xp: 1450, rank: 1 },
  { id: 2, username: "CivicLeader", xp: 1200, rank: 2 },
];
