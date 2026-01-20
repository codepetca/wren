"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useVisitorId } from "@/hooks/useVisitorId";

export default function CreateGamePage() {
  const router = useRouter();
  const { visitorId } = useVisitorId();
  const races = useQuery(api.races.getFirst);
  const createGame = useMutation(api.games.create);

  const [mode, setMode] = useState<"collaborative" | "competitive">("collaborative");
  const [teamCount, setTeamCount] = useState(2);
  const [teamNames, setTeamNames] = useState(["Team 1", "Team 2", "Team 3", "Team 4", "Team 5"]);
  const [timeLimit, setTimeLimit] = useState<number | undefined>(undefined);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    if (!visitorId || !races) return;

    setIsCreating(true);
    try {
      const teams = mode === "collaborative"
        ? ["Everyone"]
        : teamNames.slice(0, teamCount);

      const result = await createGame({
        raceId: races._id,
        hostId: visitorId,
        mode,
        teamNames: teams,
        timeLimit,
      });

      // Navigate to lobby
      router.push(`/game/${result.code}`);
    } catch (error) {
      console.error("Failed to create game:", error);
      alert("Failed to create game");
    } finally {
      setIsCreating(false);
    }
  };

  if (!races || !visitorId) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-green-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Create Game</h1>

        {/* Race info */}
        <div className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <h2 className="font-semibold text-gray-900">{races.name}</h2>
          <p className="text-sm text-gray-600">{races.description}</p>
        </div>

        {/* Game mode */}
        <div className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <h3 className="font-medium text-gray-900 mb-3">Game Mode</h3>
          <div className="flex gap-2">
            <button
              onClick={() => setMode("collaborative")}
              className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-colors ${
                mode === "collaborative"
                  ? "bg-green-500 text-white"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              Collaborative
            </button>
            <button
              onClick={() => setMode("competitive")}
              className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-colors ${
                mode === "competitive"
                  ? "bg-green-500 text-white"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              Competitive
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {mode === "collaborative"
              ? "Everyone works together as one team"
              : "Teams compete to finish first"}
          </p>
        </div>

        {/* Team setup (competitive only) */}
        {mode === "competitive" && (
          <div className="bg-white rounded-xl p-4 mb-4 shadow-sm">
            <h3 className="font-medium text-gray-900 mb-3">Teams</h3>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-sm text-gray-600">Number of teams:</span>
              <select
                value={teamCount}
                onChange={(e) => setTeamCount(Number(e.target.value))}
                className="border rounded-lg px-3 py-2 text-sm"
              >
                {[2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              {teamNames.slice(0, teamCount).map((name, i) => (
                <input
                  key={i}
                  type="text"
                  value={name}
                  onChange={(e) => {
                    const newNames = [...teamNames];
                    newNames[i] = e.target.value;
                    setTeamNames(newNames);
                  }}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  placeholder={`Team ${i + 1} name`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Time limit (optional) */}
        <div className="bg-white rounded-xl p-4 mb-6 shadow-sm">
          <h3 className="font-medium text-gray-900 mb-3">Time Limit (optional)</h3>
          <select
            value={timeLimit || ""}
            onChange={(e) => setTimeLimit(e.target.value ? Number(e.target.value) : undefined)}
            className="w-full border rounded-lg px-3 py-2 text-sm"
          >
            <option value="">No limit</option>
            <option value="15">15 minutes</option>
            <option value="30">30 minutes</option>
            <option value="45">45 minutes</option>
            <option value="60">1 hour</option>
            <option value="90">1.5 hours</option>
            <option value="120">2 hours</option>
          </select>
        </div>

        {/* Create button */}
        <button
          onClick={handleCreate}
          disabled={isCreating}
          className="w-full py-4 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white text-lg font-semibold rounded-xl transition-colors"
        >
          {isCreating ? "Creating..." : "Create Game"}
        </button>
      </div>
    </div>
  );
}
