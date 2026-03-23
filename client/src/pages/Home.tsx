import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { Sliders, Sparkles, Loader2, Send, User, Bot, RefreshCw, BookOpen, MessageCircle } from "lucide-react";
import { useGetAdvice } from "@/hooks/use-advice";
import { useStory } from "@/hooks/use-story";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
}

type Tab = "chat" | "story";

const LANGUAGES = [
  { value: "ru", label: "Русский" },
  { value: "kk-cyrillic", label: "Казахский (кириллица)" },
  { value: "kk-latin", label: "Казахский (латиница)" },
  { value: "uz-latin", label: "Узбекский (латиница)" },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("chat");

  // Chat state
  const [messages, setMessages] = useState<Message[]>([]);
  const [problem, setProblem] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const { mutate, isPending } = useGetAdvice();

  // Story state
  const story = useStory();
  const storyScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isPending]);

  useEffect(() => {
    if (storyScrollRef.current) {
      storyScrollRef.current.scrollTop = storyScrollRef.current.scrollHeight;
    }
  }, [story.parts, story.isLoading]);

  const handleChatSubmit = () => {
    if (!problem.trim() || isPending) return;

    const userMessage = problem;
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setProblem("");

    mutate(
      { topic: "General", problem: userMessage },
      {
        onSuccess: (data) => {
          setMessages((prev) => [...prev, { role: "assistant", content: data.advice }]);
        },
        onError: () => {
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: "Произошла ошибка. Пожалуйста, попробуйте еще раз." },
          ]);
        },
      }
    );
  };

  return (
    <div className="h-screen w-full flex flex-col bg-background relative overflow-hidden">
      {/* Ambient glowing orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] pointer-events-none opacity-50" />

      {/* Header */}
      <header className="flex-none p-4 md:p-6 border-b border-white/5 bg-black/20 backdrop-blur-md z-20">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
              <Sliders className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black text-white leading-tight">
                MixMentor <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-fuchsia-400">AI</span>
              </h1>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">
                Professional Audio Mentor
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              if (activeTab === "chat") setMessages([]);
              else story.reset();
            }}
            className="p-2 hover:bg-white/5 rounded-full transition-colors text-muted-foreground hover:text-white"
            title="Сбросить"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="max-w-4xl mx-auto mt-4 flex gap-2">
          <button
            onClick={() => setActiveTab("chat")}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all",
              activeTab === "chat"
                ? "bg-primary/20 text-primary border border-primary/30"
                : "text-muted-foreground hover:text-white hover:bg-white/5"
            )}
          >
            <MessageCircle className="w-4 h-4" />
            Чат
          </button>
          <button
            onClick={() => setActiveTab("story")}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all",
              activeTab === "story"
                ? "bg-primary/20 text-primary border border-primary/30"
                : "text-muted-foreground hover:text-white hover:bg-white/5"
            )}
          >
            <BookOpen className="w-4 h-4" />
            История
          </button>
        </div>
      </header>

      {/* Chat Tab */}
      {activeTab === "chat" && (
        <>
          <main ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scroll-smooth z-10">
            <div className="max-w-4xl mx-auto flex flex-col gap-6">
              {messages.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-20 space-y-4"
                >
                  <div className="inline-flex p-4 rounded-full bg-primary/5 mb-4">
                    <Sparkles className="w-10 h-10 text-primary/40" />
                  </div>
                  <h2 className="text-3xl font-bold text-white/90">С чего начнем сведение сегодня?</h2>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Задавай любые вопросы: от основ компрессии до создания яркого вокала как у мировых звезд.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-8">
                    {[
                      "Как сделать вокал ярким как у Джастина Бибера?",
                      "Проблема с мутностью в нижней середине",
                      "Цепочка плагинов для жирных барабанов",
                      "Как правильно настроить лимитер",
                    ].map((hint) => (
                      <button
                        key={hint}
                        onClick={() => setProblem(hint)}
                        className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-primary/50 hover:bg-primary/5 text-left text-sm text-white/70 transition-all"
                      >
                        {hint}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              <AnimatePresence mode="popLayout">
                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: msg.role === "user" ? 20 : -20, y: 10 }}
                    animate={{ opacity: 1, x: 0, y: 0 }}
                    className={cn(
                      "flex gap-4 max-w-[85%]",
                      msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                    )}
                  >
                    <div
                      className={cn(
                        "flex-none w-10 h-10 rounded-2xl flex items-center justify-center border",
                        msg.role === "user" ? "bg-primary/20 border-primary/30" : "bg-white/5 border-white/10"
                      )}
                    >
                      {msg.role === "user" ? (
                        <User className="w-5 h-5 text-primary" />
                      ) : (
                        <Bot className="w-5 h-5 text-fuchsia-400" />
                      )}
                    </div>
                    <div
                      className={cn(
                        "p-5 rounded-3xl text-sm md:text-base leading-relaxed",
                        msg.role === "user"
                          ? "bg-primary text-white shadow-[0_4px_20px_rgba(168,85,247,0.2)]"
                          : "glass-panel text-white/90"
                      )}
                    >
                      {msg.role === "assistant" ? (
                        <div className="prose prose-invert max-w-none">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                      ) : (
                        msg.content
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {isPending && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4 mr-auto">
                  <div className="flex-none w-10 h-10 rounded-2xl flex items-center justify-center bg-white/5 border border-white/10">
                    <Bot className="w-5 h-5 text-fuchsia-400" />
                  </div>
                  <div className="p-5 rounded-3xl glass-panel flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    <span className="text-white/50 text-sm font-medium">Анализирую микс...</span>
                  </div>
                </motion.div>
              )}
            </div>
          </main>

          <footer className="flex-none p-4 md:p-6 bg-black/40 backdrop-blur-xl border-t border-white/5 z-20">
            <div className="max-w-4xl mx-auto relative group">
              <textarea
                value={problem}
                onChange={(e) => setProblem(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleChatSubmit();
                  }
                }}
                placeholder="Спроси что угодно о сведении..."
                className="w-full glass-input rounded-3xl p-5 pr-16 text-white placeholder:text-white/30 resize-none min-h-[60px] max-h-[200px] outline-none shadow-2xl"
                rows={1}
              />
              <button
                onClick={handleChatSubmit}
                disabled={!problem.trim() || isPending}
                className={cn(
                  "absolute right-3 bottom-3 p-3 rounded-2xl transition-all duration-300",
                  !problem.trim() || isPending
                    ? "text-white/20 cursor-not-allowed"
                    : "bg-primary text-white hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:scale-105 active:scale-95"
                )}
              >
                {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </button>
            </div>
            <p className="text-[10px] text-center text-white/20 mt-3 uppercase tracking-[0.2em] font-bold">
              Powered by MixMentor Intelligence
            </p>
          </footer>
        </>
      )}

      {/* Story Tab */}
      {activeTab === "story" && (
        <div className="flex-1 flex flex-col overflow-hidden z-10">
          {!story.isStarted ? (
            <div className="flex-1 overflow-y-auto p-4 md:p-6">
              <div className="max-w-2xl mx-auto py-8 space-y-6">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-3 mb-8">
                  <div className="inline-flex p-4 rounded-full bg-primary/5 mb-2">
                    <BookOpen className="w-10 h-10 text-primary/40" />
                  </div>
                  <h2 className="text-2xl font-bold text-white/90">Генератор вирусных историй</h2>
                  <p className="text-muted-foreground text-sm">
                    Создавай драматические YouTube-истории с клиффхэнгерами
                  </p>
                </motion.div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/70">Тема истории</label>
                    <textarea
                      value={story.topic}
                      onChange={(e) => story.setTopic(e.target.value)}
                      placeholder="Например: Как я узнал, что мой сосед живёт двойной жизнью..."
                      className="w-full glass-input rounded-2xl p-4 text-white placeholder:text-white/30 resize-none min-h-[100px] outline-none"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white/70">Язык</label>
                      <select
                        value={story.language}
                        onChange={(e) => story.setLanguage(e.target.value)}
                        className="w-full glass-input rounded-2xl p-3 text-white outline-none bg-black/40 cursor-pointer"
                      >
                        {LANGUAGES.map((lang) => (
                          <option key={lang.value} value={lang.value} className="bg-gray-900">
                            {lang.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white/70">
                        Частей: {story.totalParts}
                      </label>
                      <input
                        type="range"
                        min={1}
                        max={10}
                        value={story.totalParts}
                        onChange={(e) => story.setTotalParts(Number(e.target.value))}
                        className="w-full mt-3 accent-primary cursor-pointer"
                      />
                    </div>
                  </div>

                  {story.error && (
                    <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                      {story.error}
                    </div>
                  )}

                  <button
                    onClick={story.startStory}
                    disabled={!story.topic.trim() || story.isLoading}
                    className={cn(
                      "w-full py-4 rounded-2xl font-semibold text-base transition-all duration-300",
                      !story.topic.trim() || story.isLoading
                        ? "bg-white/5 text-white/30 cursor-not-allowed"
                        : "bg-primary text-white hover:shadow-[0_0_30px_rgba(168,85,247,0.4)] hover:scale-[1.02] active:scale-[0.98]"
                    )}
                  >
                    {story.isLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Генерирую историю...
                      </span>
                    ) : (
                      "Сгенерировать первую часть"
                    )}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div ref={storyScrollRef} className="flex-1 overflow-y-auto p-4 md:p-6">
              <div className="max-w-2xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-white/80 truncate max-w-[70%]">{story.topic}</h2>
                  <span className="text-xs text-muted-foreground">
                    {story.currentPart} / {story.totalParts}
                  </span>
                </div>

                {story.parts.map((part, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-panel rounded-3xl p-6 space-y-2"
                  >
                    <div className="text-xs text-primary/60 font-semibold uppercase tracking-widest mb-3">
                      Часть {i + 1}
                    </div>
                    <div className="text-white/85 leading-relaxed text-sm md:text-base whitespace-pre-wrap">
                      {part}
                    </div>
                  </motion.div>
                ))}

                {story.isLoading && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-panel rounded-3xl p-6 flex items-center gap-3">
                    <Loader2 className="w-5 h-5 animate-spin text-primary flex-shrink-0" />
                    <span className="text-white/50 text-sm">Генерирую часть {story.currentPart + 1}...</span>
                  </motion.div>
                )}

                {story.error && (
                  <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                    {story.error}
                  </div>
                )}

                {!story.isLoading && story.hasMoreParts && (
                  <button
                    onClick={story.nextPart}
                    className="w-full py-4 rounded-2xl font-semibold text-base bg-primary/20 text-primary border border-primary/30 hover:bg-primary hover:text-white transition-all duration-300 hover:shadow-[0_0_20px_rgba(168,85,247,0.3)]"
                  >
                    Следующая часть ({story.currentPart + 1} / {story.totalParts})
                  </button>
                )}

                {!story.isLoading && !story.hasMoreParts && story.currentPart === story.totalParts && (
                  <div className="text-center py-6 space-y-3">
                    <p className="text-white/40 text-sm">История завершена</p>
                    <button
                      onClick={story.reset}
                      className="px-6 py-3 rounded-2xl text-sm font-medium bg-white/5 text-white/60 hover:bg-white/10 hover:text-white transition-all"
                    >
                      Создать новую историю
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
