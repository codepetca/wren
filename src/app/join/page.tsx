"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function JoinPage() {
  const router = useRouter();
  const [code, setCode] = useState("");

  const handleJoin = () => {
    if (code.length >= 4) {
      router.push(`/game/${code.toUpperCase()}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 flex items-center justify-center">
      <div className="max-w-md w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">Join Game</h1>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Enter game code
          </label>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="ABC123"
            className="w-full border rounded-lg px-4 py-3 text-2xl text-center tracking-widest uppercase"
            maxLength={6}
            autoFocus
          />

          <button
            onClick={handleJoin}
            disabled={code.length < 4}
            className="w-full mt-4 py-4 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white text-lg font-semibold rounded-xl transition-colors"
          >
            Join
          </button>
        </div>

        <p className="text-center text-sm text-gray-500 mt-4">
          Ask the host for the game code
        </p>
      </div>
    </div>
  );
}
