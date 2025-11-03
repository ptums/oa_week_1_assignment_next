"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { PlayerRecord } from "@/types";

export default function HighScoresPage() {
  const router = useRouter();
  const [scores, setScores] = useState<PlayerRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadScores() {
      try {
        const response = await fetch("/api/scores", { cache: "no-store" });

        if (!response.ok) {
          throw new Error("Failed to fetch scores");
        }

        const data = await response.json();
        setScores(Array.isArray(data) ? data : []);
      } catch (e) {
        setError("Error loading scores");
        console.error(e);
      } finally {
        setLoading(false);
      }
    }

    loadScores();
  }, []);

  function handlePlay() {
    router.push("/game");
  }

  function handleHome() {
    router.push("/");
  }

  return (
    <main className="min-h-screen flex flex-col items-center p-4 max-w-4xl mx-auto">
      <h1 className="font-['Press_Start_2P'] text-2xl md:text-3xl text-[#00fff0] mb-4 mt-8 text-center">
        High Scores
      </h1>

      {loading ? (
        <div className="text-center text-gray-400">Loading scores...</div>
      ) : error ? (
        <div className="text-center text-red-400 mb-6">{error}</div>
      ) : scores.length === 0 ? (
        <div className="text-center text-gray-400 mb-6">
          No scores yet. Be the first to play!
        </div>
      ) : (
        <div className="w-full overflow-x-auto mb-8">
          <table className="w-full border-2 border-white/10 rounded-lg overflow-hidden">
            <thead className="bg-[#0b0c1a]">
              <tr>
                <th className="px-4 py-3 text-left font-['Press_Start_2P'] text-xs text-[#ffc107]">
                  Rank
                </th>
                <th className="px-4 py-3 text-left font-['Press_Start_2P'] text-xs text-[#00fff0]">
                  Player
                </th>
                <th className="px-4 py-3 text-center font-['Press_Start_2P'] text-xs text-[#ff2d95]">
                  Times Played
                </th>
                <th className="px-4 py-3 text-right font-['Press_Start_2P'] text-xs text-[#00ff7f]">
                  High Score
                </th>
              </tr>
            </thead>
            <tbody>
              {scores.map((player, i) => (
                <tr
                  key={i}
                  className="border-t border-white/10 hover:bg-white/5"
                >
                  <td className="px-4 py-3 font-['Press_Start_2P'] text-sm text-[#ffc107]">
                    {i + 1}
                  </td>
                  <td className="px-4 py-3 text-sm">{player.username}</td>
                  <td className="px-4 py-3 text-center text-sm">
                    {player.times_played}
                  </td>
                  <td className="px-4 py-3 text-right font-['Press_Start_2P'] text-sm text-[#00ff7f]">
                    {player.highest_score}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex gap-4">
        <button
          onClick={handlePlay}
          className="px-6 py-3 border-2 border-[#00fff0] text-[#00fff0] rounded hover:bg-[#00fff0] hover:text-black shadow-[0_0_8px_rgba(0,255,240,0.6),_0_0_16px_rgba(255,45,149,0.4)] font-['Press_Start_2P'] text-sm transition-colors"
        >
          Play
        </button>
        <button
          onClick={handleHome}
          className="px-6 py-3 border-2 border-[#ff2d95] text-[#ff2d95] rounded hover:bg-[#ff2d95] hover:text-black shadow-[0_0_8px_rgba(0,255,240,0.6),_0_0_16px_rgba(255,45,149,0.4)] font-['Press_Start_2P'] text-sm transition-colors"
        >
          Home
        </button>
      </div>
    </main>
  );
}
