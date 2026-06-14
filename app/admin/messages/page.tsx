"use client";

import { useEffect, useState } from "react";
import { Mail, MailOpen } from "lucide-react";

interface Message {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Message | null>(null);

  useEffect(() => { load(); }, []);

  async function load() {
    const res = await fetch("/api/contact");
    const data = await res.json();
    setMessages(data.messages ?? []);
    setLoading(false);
  }

  const unread = messages.filter((m) => !m.read).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          Messages ({messages.length})
        </h1>
        {unread > 0 && (
          <span className="bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
            {unread} unread
          </span>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading...</div>
        ) : messages.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Mail className="w-10 h-10 mx-auto mb-3 opacity-40" />
            No messages yet
          </div>
        ) : (
          <ul className="divide-y divide-gray-50">
            {messages.map((m) => (
              <li key={m.id}>
                <button
                  onClick={() => setSelected(m)}
                  className="w-full text-left px-5 py-4 hover:bg-gray-50 transition-colors flex items-start gap-3"
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${m.read ? "bg-gray-100 text-gray-400" : "bg-blue-50 text-blue-600"}`}>
                    {m.read ? <MailOpen className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className={`truncate ${m.read ? "text-gray-700" : "font-semibold text-gray-900"}`}>
                        {m.name} <span className="text-gray-400 font-normal">· {m.email}</span>
                      </p>
                      <span className="text-xs text-gray-400 shrink-0">
                        {new Date(m.createdAt).toLocaleDateString("en-US")}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 truncate">{m.subject}</p>
                    <p className="text-xs text-gray-400 truncate mt-0.5">{m.message}</p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl w-full max-w-lg p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">{selected.subject}</h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  From <span className="font-medium text-gray-700">{selected.name}</span> · {selected.email}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {new Date(selected.createdAt).toLocaleString("en-US")}
                </p>
              </div>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 whitespace-pre-wrap mb-4">
              {selected.message}
            </div>
            <a
              href={`mailto:${selected.email}?subject=Re: ${encodeURIComponent(selected.subject)}`}
              className="inline-flex items-center gap-2 bg-blue-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-colors"
            >
              <Mail className="w-4 h-4" /> Reply by Email
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
