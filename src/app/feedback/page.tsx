"use client";
import { useState } from "react";
import Navbar from "@/components/navbar";
import { supabase } from "@/lib/supabaseClient";

export default function Feedback() {
  const [name, setName] = useState("");
  const [problem, setProblem] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error } = await supabase.from("feedback").insert([
      {
        name: name || "Anonymous",
        feedback: problem,
      },
    ]);

    if (error) {
      console.error("🚨 Error submitting feedback:", error);
      alert("Uh-oh! Something went wrongski. Try again?");
    } else {
      console.log("✅ Feedback submitted successfully!");
      alert("Thanks for your feedback!!!");
      setName("");
      setProblem("");
    }
  };

  return (
    <main className="flex flex-col min-h-screen items-center justify-center bg-foreground">
      <Navbar />
      <div className="flex flex-col items-center justify-center p-8 w-full max-w-6xl gap-6 text-center">
        <h1 className="text-[70px] font-[800] text-secondary">Feedback</h1>

        <form
          onSubmit={handleSubmit}
          className="w-full max-w-xl bg-white/10 p-6 rounded-xl border border-white/20 text-left space-y-4"
        >
          <div>
            <label className="block text-white font-semibold mb-1">
              Name (optional):
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Anonymous"
              className="w-full p-2 rounded bg-white/20 border border-white/30 text-white placeholder-white/50"
            />
          </div>

          <div>
            <label className="block text-white font-semibold mb-1">
              Describe the problem / Suggest Improvements:
            </label>
            <textarea
              value={problem}
              onChange={(e) => setProblem(e.target.value)}
              placeholder="..."
              className="w-full p-2 rounded bg-white/20 border border-white/30 text-white placeholder-white/50 h-32 resize-none"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-secondary text-black font-bold py-2 px-4 rounded hover:bg-yellow-400 transition hover:cursor-pointer"
          >
            Submit Feedback
          </button>
        </form>
      </div>
    </main>
  );
}
