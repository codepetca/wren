import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Clean up expired games every hour
crons.interval(
  "cleanup expired games",
  { hours: 1 },
  internal.games.cleanupExpired
);

export default crons;
