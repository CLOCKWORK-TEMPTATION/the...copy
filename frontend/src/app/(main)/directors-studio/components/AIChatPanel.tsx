"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles, Send, User, Bot } from "lucide-react";
import { useChatWithAI } from "@/hooks/useAI";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export default function AIChatPanel() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "مرحباً! أنا مساعدك الذكي للإخراج السينمائي. كيف يمكنني مساعدتك اليوم؟",
      timestamp: "الآن",
    },
  ]);
  const [input, setInput] = useState("");
  const chatMutation = useChatWithAI();

  const suggestions = [
    "اقترح زوايا تصوير للمشهد الأول",
    "كيف أحسن الإضاءة في مشهد ليلي؟",
    "ما هي أفضل طريقة لتصوير مشهد مطاردة؟",
  ];

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: "الآن",
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput("");

    // Create a placeholder message for streaming
    const streamingMessageId = (Date.now() + 1).toString();
    const streamingMessage: Message = {
      id: streamingMessageId,
      role: "assistant",
      content: "",
      timestamp: "الآن",
    };
    setMessages((prev) => [...prev, streamingMessage]);

    try {
      const history = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      // Use the mutation
      await chatMutation.mutateAsync({
        message: currentInput,
        history,
      });
    } catch (error) {
      console.error("Chat error:", error);
      // Update the streaming message with error
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === streamingMessageId
            ? { ...msg, content: "عذراً، حدث خطأ. الرجاء المحاولة مرة أخرى." }
            : msg
        )
      );
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
  };

  return (
    <Card className="h-[600px] flex flex-col" data-testid="card-ai-chat">
      <CardHeader className="border-b">
        <CardTitle className="flex items-center justify-end gap-2">
          <span>المساعد الذكي</span>
          <Sparkles className="w-5 h-5 text-primary" />
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 p-6">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.role === "user" ? "justify-start flex-row-reverse" : "justify-end"}`}
                data-testid={`message-${message.id}`}
              >
                <div
                  className={`flex items-start gap-3 max-w-[80%] ${message.role === "user" ? "flex-row-reverse" : ""}`}
                >
                  <div
                    className={`p-2 rounded-full ${message.role === "user" ? "bg-primary" : "bg-muted"}`}
                  >
                    {message.role === "user" ? (
                      <User className="w-4 h-4 text-primary-foreground" />
                    ) : (
                      <Bot className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>

                  <div
                    className={`flex flex-col gap-1 ${message.role === "user" ? "items-end" : "items-start"}`}
                  >
                    <div
                      className={`p-4 rounded-md ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <p className="text-sm leading-relaxed">
                        {message.content}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground px-2">
                      {message.timestamp}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {chatMutation.isPending && (
              <div className="flex gap-3 justify-end">
                <div className="flex items-start gap-3 max-w-[80%]">
                  <div className="p-2 rounded-full bg-muted">
                    <Bot className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="p-4 rounded-md bg-muted">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-100" />
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-200" />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {messages.length === 1 && (
          <div className="px-6 pb-4">
            <p className="text-sm text-muted-foreground mb-3 text-right">
              اقتراحات:
            </p>
            <div className="flex flex-wrap gap-2 justify-end">
              {suggestions.map((suggestion, idx) => (
                <Badge
                  key={idx}
                  variant="secondary"
                  className="cursor-pointer hover-elevate active-elevate-2"
                  onClick={() => handleSuggestionClick(suggestion)}
                  data-testid={`suggestion-${idx}`}
                >
                  {suggestion}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="p-6 border-t">
          <div className="flex gap-2">
            <Button
              size="icon"
              onClick={handleSend}
              disabled={!input.trim()}
              data-testid="button-send-message"
            >
              <Send className="w-4 h-4" />
            </Button>
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="اكتب سؤالك هنا..."
              className="text-right"
              data-testid="input-chat-message"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
