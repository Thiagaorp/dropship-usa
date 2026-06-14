"use client";

import { useState } from "react";
import { Send, CheckCircle } from "lucide-react";

export default function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error ?? "Something went wrong.");
        setStatus("error");
        return;
      }
      setMessage(data.alreadySubscribed ? "You're already subscribed!" : "Thanks for subscribing!");
      setStatus("done");
      setEmail("");
    } catch {
      setMessage("Network error. Please try again.");
      setStatus("error");
    }
  }

  return (
    <div>
      <h4 className="text-white font-semibold mb-3">Get 10% Off Your First Order</h4>
      <p className="text-sm text-gray-400 mb-4">
        Subscribe for exclusive deals and new arrivals straight to your inbox.
      </p>

      {status === "done" ? (
        <div className="flex items-center gap-2 text-green-400 text-sm bg-green-400/10 rounded-xl px-4 py-3">
          <CheckCircle className="w-4 h-4 shrink-0" /> {message}
        </div>
      ) : (
        <form onSubmit={submit} className="flex rounded-xl overflow-hidden bg-gray-800 border border-gray-700 focus-within:border-blue-500 transition-colors">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="flex-1 bg-transparent px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none min-w-0"
          />
          <button
            type="submit"
            disabled={status === "sending"}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 flex items-center justify-center transition-colors disabled:opacity-60"
            aria-label="Subscribe"
          >
            {status === "sending" ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </form>
      )}
      {status === "error" && <p className="text-red-400 text-xs mt-2">{message}</p>}
    </div>
  );
}
