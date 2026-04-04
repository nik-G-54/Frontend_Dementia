/**
 * Static demo data for the Cognitive Health Dashboard.
 * Used when mode === "demo" (no API calls needed).
 */

export const demoUser = {
  name: "Demo User",
  userId: "demo-001",
  age: 65,
};

export const demoData = {
  today: {
    cognitiveScore: 84,
    reactionTime: 342,
    memoryAccuracy: 92,
    progress: 84,
  },
  weekly: [
    { day: "Mon", score: 60 },
    { day: "Tue", score: 65 },
    { day: "Wed", score: 70 },
    { day: "Thu", score: 68 },
    { day: "Fri", score: 75 },
    { day: "Sat", score: 80 },
    { day: "Sun", score: 72 },
  ],
  monthly: [
    { label: "01 May", score: 62 },
    { label: "07 May", score: 68 },
    { label: "14 May", score: 74 },
    { label: "21 May", score: 78 },
    { label: "28 May", score: 84 },
  ],
  distribution: {
    focus: 42,
    memory: 38,
    logic: 20,
  },
  risk: {
    level: "Low",
    value: 25,
    label: "Optimum",
  },
  aiSummary:
    "Your focus levels were exceptionally high during the Pattern Recognition round, but slight fatigue was noted in the final 2 minutes. Memory accuracy remains stable at 92%.",
  streak: 8,
  activeDays: [1, 2, 4, 6, 7, 9, 10], // days of month that were active (demo)
  trends: {
    cognitiveScoreTrend: "+2%",
    reactionTimeTrend: "-12ms",
    memoryTrend: "stable",
  },
  challenge: {
    name: "14-Day Zen Focus",
    currentDay: 8,
    totalDays: 14,
  },
};

/**
 * Empty data structure for brand-new real users who have no test history.
 */
export const emptyUserData = {
  today: {
    cognitiveScore: 0,
    reactionTime: 0,
    memoryAccuracy: 0,
    progress: 0,
  },
  weekly: [
    { day: "Mon", score: 0 },
    { day: "Tue", score: 0 },
    { day: "Wed", score: 0 },
    { day: "Thu", score: 0 },
    { day: "Fri", score: 0 },
    { day: "Sat", score: 0 },
    { day: "Sun", score: 0 },
  ],
  monthly: [],
  distribution: {
    focus: 0,
    memory: 0,
    logic: 0,
  },
  risk: {
    level: "N/A",
    value: 0,
    label: "No data",
  },
  aiSummary: "",
  streak: 0,
  activeDays: [],
  trends: {
    cognitiveScoreTrend: "--",
    reactionTimeTrend: "--",
    memoryTrend: "--",
  },
  challenge: null,
};
