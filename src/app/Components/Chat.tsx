"use client";

import { useState, useRef, useEffect } from "react";
import OpenAI from "openai";
import ReactMarkdown from "react-markdown";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ChatProps {
  locationsData: any[];
  supabaseUrl: string;
  supabaseKey: string | undefined;
  isOpen: boolean;
  onToggle: () => void;
}

export default function Chat({
  locationsData,
  supabaseUrl,
  supabaseKey,
  isOpen,
  onToggle,
}: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showTemplates, setShowTemplates] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const messageTemplates = [
    "Plan my day in Kowloon",
    "Best restaurants in Central",
    "Tourist attractions in Tsim Sha Tsui",
    "Shopping areas in Causeway Bay",
    "Local hidden gems",
    "Business districts overview",
    "Entertainment spots in Wan Chai",
    "Traditional markets to visit",
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize with welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: "1",
          role: "assistant",
          content:
            "Hello! I'm your HKTAP AI assistant. I can help you find information about locations in Hong Kong based on our database. How can I assist you today?",
          timestamp: new Date(),
        },
      ]);
    }
  }, [messages.length]);

  // Hide templates after user sends first message
  useEffect(() => {
    const userMessages = messages.filter((msg) => msg.role === "user");
    if (userMessages.length > 0) {
      setShowTemplates(false);
    }
  }, [messages]);

  const handleTemplateClick = (template: string) => {
    setInputMessage(template);
    setShowTemplates(false);
  };

  const generateSystemPrompt = () => {
    const locationsInfo = locationsData
      .map(
        (location, index) =>
          `${index + 1}. ${location.title || "Untitled Location"}: ${
            location.description || "No description"
          }`
      )
      .join("\n");

    return `You are HKTAP AI, an intelligent assistant for Hong Kong location discovery. You have access to a database of ${
      locationsData.length
    } locations in Hong Kong.

Available Locations:
${locationsInfo || "No locations available in the database."}

Your role:
- Help users find and learn about locations in Hong Kong
- Provide information about specific places from the database
- Suggest locations based on user preferences (dining, entertainment, business, etc.)
- Answer questions about Hong Kong tourism and local spots
- Be friendly, helpful, and knowledgeable about Hong Kong

Always base your recommendations on the locations in the database above. If a user asks about a location not in the database, let them know it's not available but suggest similar alternatives from the database.

Current database contains ${locationsData.length} location${
      locationsData.length !== 1 ? "s" : ""
    }.`;
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      // Check for OpenRouter API key
      const apiKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;
      if (!apiKey) {
        throw new Error(
          "OpenRouter API key not configured. Please add NEXT_PUBLIC_OPENROUTER_API_KEY to your .env file."
        );
      }

      const openai = new OpenAI({
        baseURL: "https://openrouter.ai/api/v1",
        apiKey: apiKey,
        dangerouslyAllowBrowser: true,
        defaultHeaders: {
          "HTTP-Referer": window.location.origin,
          "X-Title": "HKTAP - Hong Kong Location Assistant",
        },
      });

      const completion = await openai.chat.completions.create({
        model: "x-ai/grok-4-fast:free",
        messages: [
          {
            role: "system",
            content: generateSystemPrompt(),
          },
          ...messages.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
          {
            role: "user",
            content: inputMessage,
          },
        ],
        max_tokens: 1000,
        temperature: 0.7,
      });

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          completion.choices[0].message.content ||
          "Sorry, I couldn't generate a response.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error calling OpenAI:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `Sorry, I encountered an error: ${
          error instanceof Error ? error.message : "Unknown error"
        }. Please make sure your OpenRouter API key is configured correctly.`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="flex justify-center w-full h-full">
      <div className="h-full w-full lg:h-[70%] lg:w-[25em] fixed bottom-0 lg:bottom-30 bg-white border-gray-300 lg:rounded-xl shadow-xl z-50 flex flex-col">
        {/* Chat Header */}
        <div className="bg-black text-white px-5 p-3 lg:rounded-t-xl flex justify-between items-center">
          <h3 className="font-semibold">HKTAP AI Assistant</h3>
          <button onClick={onToggle} className="text-white hover:text-gray-200">
            ✕
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] p-2 rounded-xl text-sm ${
                  message.role === "user"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                <div className="prose prose-sm max-w-none">
                  <ReactMarkdown
                    components={{
                      // Custom styling for markdown elements
                      p: ({ children }) => (
                        <p className="mb-2 last:mb-0">{children}</p>
                      ),
                      h1: ({ children }) => (
                        <h1 className="text-lg font-bold mb-2">{children}</h1>
                      ),
                      h2: ({ children }) => (
                        <h2 className="text-base font-bold mb-2">{children}</h2>
                      ),
                      h3: ({ children }) => (
                        <h3 className="text-sm font-bold mb-1">{children}</h3>
                      ),
                      ul: ({ children }) => (
                        <ul className="list-disc pl-4 mb-2">{children}</ul>
                      ),
                      ol: ({ children }) => (
                        <ol className="list-decimal pl-4 mb-2">{children}</ol>
                      ),
                      li: ({ children }) => (
                        <li className="mb-1">{children}</li>
                      ),
                      blockquote: ({ children }) => (
                        <blockquote
                          className={`border-l-2 pl-3 italic mb-2 ${
                            message.role === "user"
                              ? "border-blue-200"
                              : "border-gray-300"
                          }`}
                        >
                          {children}
                        </blockquote>
                      ),
                      code: ({ children }) => (
                        <code
                          className={`px-1 py-0.5 rounded text-xs font-mono ${
                            message.role === "user"
                              ? "bg-blue-600 bg-opacity-50"
                              : "bg-gray-200"
                          }`}
                        >
                          {children}
                        </code>
                      ),
                      pre: ({ children }) => (
                        <pre
                          className={`p-2 rounded text-xs font-mono overflow-x-auto mb-2 ${
                            message.role === "user"
                              ? "bg-blue-600 bg-opacity-50"
                              : "bg-gray-200"
                          }`}
                        >
                          {children}
                        </pre>
                      ),
                      strong: ({ children }) => (
                        <strong className="font-bold">{children}</strong>
                      ),
                      em: ({ children }) => (
                        <em className="italic">{children}</em>
                      ),
                      a: ({ href, children }) => (
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 underline"
                        >
                          {children}
                        </a>
                      ),
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                </div>
                <p className="text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 text-gray-800 p-2 rounded-xl text-sm">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                  <span>Thinking...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Templates */}
        {showTemplates && (
          <div className="px-3 pb-2 border-t border-gray-200">
            <p className="text-xs text-gray-500 mb-2">Try asking about:</p>
            <div className="flex flex-wrap gap-1">
              {messageTemplates.map((template, index) => (
                <button
                  key={index}
                  onClick={() => handleTemplateClick(template)}
                  className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors border border-gray-200"
                  disabled={isLoading}
                >
                  {template}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-3 border-t border-gray-300">
          <div className="flex space-x-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about Hong Kong locations..."
              className="flex-1 p-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-blue-500"
              disabled={isLoading}
            />
            <button
              onClick={sendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white px-3 py-2 rounded-xl text-sm transition-colors"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
