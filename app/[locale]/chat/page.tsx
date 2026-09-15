"use client";

import { useTranslations } from "next-intl";
import { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/header";
import { ConversationList } from "@/components/chat/conversation-list";
import { MessageThread } from "@/components/chat/message-thread";
import { MessageInput } from "@/components/chat/message-input";
import {
  getConversations,
  getMessages,
  sendMessage,
  updateConversationStatus,
  markConversationRead,
  getUnreadCount,
} from "@/lib/actions";
import { Conversation, Message, ConversationStatus } from "@/lib/data";
import {
  MessageSquare,
  Filter,
  CheckCircle2,
  Clock,
  Search,
} from "lucide-react";

export default function ChatPage() {
  const t = useTranslations("pages.chat");
  const tCommon = useTranslations("common");
  const tStatus = useTranslations("status.conversation");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);

  const selectedConversation =
    conversations.find((c) => c.id === selectedId) || null;

  const loadConversations = useCallback(async () => {
    const convs = await getConversations({ status: statusFilter, search });
    setConversations(convs);
    const unread = await getUnreadCount();
    setUnreadCount(unread);
  }, [statusFilter, search]);

  const loadMessages = useCallback(
    async (convId: string) => {
      const msgs = await getMessages(convId);
      setMessages(msgs);
      await markConversationRead(convId);
      loadConversations();
    },
    [loadConversations],
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadConversations();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadConversations]);

  useEffect(() => {
    if (selectedId) {
      const timer = window.setTimeout(() => {
        void loadMessages(selectedId);
      }, 0);

      return () => window.clearTimeout(timer);
    }

    const timer = window.setTimeout(() => setMessages([]), 0);
    return () => window.clearTimeout(timer);
  }, [selectedId, loadMessages]);

  const handleSend = async (content: string) => {
    if (!selectedId) return;
    await sendMessage(selectedId, content, "AGENT");
    loadMessages(selectedId);
  };

  const handleStatusChange = async (status: ConversationStatus) => {
    if (!selectedId) return;
    await updateConversationStatus(selectedId, status);
    loadConversations();
  };

  const openCount = conversations.filter((c) => c.status === "OPEN").length;
  const pendingCount = conversations.filter(
    (c) => c.status === "PENDING",
  ).length;

  return (
    <div className="flex flex-col h-screen">
      <Header onSearchChange={(val) => setSearch(val)} placeholder={t("search")} />

      <div className="flex-1 flex flex-col min-h-0 p-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 shrink-0">
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-emerald-500" />
              {t("title")}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {t("subtitle")}
            </p>
          </div>

          {/* Stats pills */}
          <div className="flex items-center gap-2 text-xs">
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-semibold">
              <MessageSquare className="w-3.5 h-3.5" />
              {tStatus("OPEN")} {openCount}
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-semibold">
              <Clock className="w-3.5 h-3.5" />
              {tStatus("PENDING")} {pendingCount}
            </span>
            {unreadCount > 0 && (
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 font-semibold">
                {tCommon("unread")} {unreadCount}
              </span>
            )}
          </div>
        </div>

        {/* Chat Layout */}
        <div className="flex-1 flex min-h-0 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
          {/* Left Panel - Conversation List */}
          <div className="w-80 lg:w-96 border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0">
            {/* Filter bar */}
            <div className="p-3 border-b border-slate-200 dark:border-slate-800 space-y-2 shrink-0">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t("search")}
                  className="w-full pl-8 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>
              <div className="flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                {(["all", "OPEN", "PENDING", "RESOLVED"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all ${
                      statusFilter === s
                        ? "bg-blue-600 text-white shadow-sm"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                    }`}
                  >
                    {s === "all" ? tCommon("all") : tStatus(s)}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-hidden">
              <ConversationList
                conversations={conversations}
                selectedId={selectedId}
                onSelect={setSelectedId}
              />
            </div>
          </div>

          {/* Right Panel - Message Thread */}
          <div className="flex-1 flex flex-col min-w-0">
            <MessageThread
              conversation={selectedConversation}
              messages={messages}
            />

            {/* Status actions + input */}
            {selectedConversation && (
              <div className="shrink-0">
                <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                  <span className="text-[10px] text-slate-400 font-medium">
                    {tCommon("changeStatus")}
                  </span>
                  {(
                    ["OPEN", "PENDING", "RESOLVED"] as ConversationStatus[]
                  ).map((s) => (
                    <button
                      key={s}
                      onClick={() => handleStatusChange(s)}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all ${
                        selectedConversation.status === s
                          ? "bg-blue-600 text-white"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                      }`}
                    >
                      {s === "RESOLVED" && <CheckCircle2 className="w-3 h-3" />}
                      {tStatus(s)}
                    </button>
                  ))}
                </div>
                <MessageInput onSend={handleSend} />
              </div>
            )}

            {!selectedConversation && (
              <MessageInput onSend={handleSend} disabled />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
