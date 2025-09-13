"use client";

import { useState, useRef, useEffect } from "react";
import OpenAI from "openai";

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
}

export default function Chat({ locationsData, supabaseUrl, supabaseKey }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
          content: "Hello! I'm your HKTAP AI assistant. I can help you find information about locations in Hong Kong based on our database. How can I assist you today?",
          timestamp: new Date(),
        },
      ]);
    }
  }, [messages.length]);

  const generateSystemPrompt = () => {
    const locationsInfo = locationsData
      .map((location, index) => 
        `${index + 1}. ${location.title || 'Untitled Location'}: ${location.description || 'No description'}`
      )
      .join('\n');

    return `You are HKTAP AI, an intelligent assistant for Hong Kong location discovery. You have access to a database of ${locationsData.length} locations in Hong Kong.

Available Locations:
${locationsInfo || 'No locations available in the database.'}

Your role:
- Help users find and learn about locations in Hong Kong
- Provide information about specific places from the database
- Suggest locations based on user preferences (dining, entertainment, business, etc.)
- Answer questions about Hong Kong tourism and local spots
- Be friendly, helpful, and knowledgeable about Hong Kong

Always base your recommendations on the locations in the database above. If a user asks about a location not in the database, let them know it's not available but suggest similar alternatives from the database.

Current database contains ${locationsData.length} location${locationsData.length !== 1 ? 's' : ''}.`;
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      // Check for OpenRouter API key
      const apiKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;
      if (!apiKey) {
        throw new Error("OpenRouter API key not configured. Please add NEXT_PUBLIC_OPENROUTER_API_KEY to your .env file.");
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
        model: "openrouter/sonoma-sky-alpha",
        messages: [
          {
            role: "system",
            content: generateSystemPrompt(),
          },
          ...messages.map(msg => ({
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
        content: completion.choices[0].message.content || "Sorry, I couldn't generate a response.",
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error calling OpenAI:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}. Please make sure your OpenRouter API key is configured correctly.`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
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

  return (
    <>
      {/* Chat Toggle Button */}
      <div className="fixed bottom-20 right-6 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-4 shadow-lg transition-colors"
        >
          {isOpen ? "✕" : "🤖"}
        </button>
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-96 bg-white border border-gray-300 rounded-lg shadow-xl z-50 flex flex-col">
          {/* Chat Header */}
          <div className="bg-blue-500 text-white p-3 rounded-t-lg flex justify-between items-center">
            <h3 className="font-semibold">HKTAP AI Assistant</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-gray-200"
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] p-2 rounded-lg text-sm ${
                    message.role === "user"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-800 p-2 rounded-lg text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                    <span>Thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-gray-300">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about Hong Kong locations..."
                className="flex-1 p-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500"
                disabled={isLoading}
              />
              <button
                onClick={sendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white px-3 py-2 rounded text-sm transition-colors"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
