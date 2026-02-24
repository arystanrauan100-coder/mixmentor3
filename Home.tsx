import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { Sliders, Sparkles, Loader2, Send, User, Bot, RefreshCw } from "lucide-react";
import { useGetAdvice } from "@/hooks/use-advice";
import { cn } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [problem, setProblem] = useState("");
  const [chatId] = useState(() => Math.random().toString(36).substring(7));
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const { mutate, isPending, error } = useGetAdvice();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isPending]);

  const handleSubmit = async () => {
    if (!problem.trim() || isPending) return;

    const userMessage = problem;
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setProblem("");

    mutate(
      { topic: "General", problem: userMessage },
      {
        onSuccess: (data) => {
          setMessages(prev => [...prev, { role: "assistant", content: data.advice }]);
        },
        onError: () => {
          setMessages(prev => [...prev, { role: "assistant", content: "Произошла ошибка. Пожалуйста, попробуйте еще раз." }]);
        }
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
            onClick={() => setMessages([])}
            className="p-2 hover:bg-white/5 rounded-full transition-colors text-muted-foreground hover:text-white"
            title="Новый чат"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Chat Messages */}
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
                  "Как правильно настроить лимитер"
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
                <div className={cn(
                  "flex-none w-10 h-10 rounded-2xl flex items-center justify-center border",
                  msg.role === "user" ? "bg-primary/20 border-primary/30" : "bg-white/5 border-white/10"
                )}>
                  {msg.role === "user" ? <User className="w-5 h-5 text-primary" /> : <Bot className="w-5 h-5 text-fuchsia-400" />}
                </div>
                <div className={cn(
                  "p-5 rounded-3xl text-sm md:text-base leading-relaxed",
                  msg.role === "user" 
                    ? "bg-primary text-white shadow-[0_4px_20px_rgba(168,85,247,0.2)]" 
                    : "glass-panel text-white/90"
                )}>
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
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-4 mr-auto"
            >
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

      {/* Input Area */}
      <footer className="flex-none p-4 md:p-6 bg-black/40 backdrop-blur-xl border-t border-white/5 z-20">
        <div className="max-w-4xl mx-auto relative group">
          <textarea
            value={problem}
            onChange={(e) => setProblem(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            placeholder="Спроси что угодно о сведении..."
            className="w-full glass-input rounded-3xl p-5 pr-16 text-white placeholder:text-white/30 resize-none min-h-[60px] max-h-[200px] outline-none shadow-2xl"
            rows={1}
          />
          <button
            onClick={handleSubmit}
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
    </div>
  );
}
