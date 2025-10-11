import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

const knowledgeBase = {
  // Service Info
  services: {
    keywords: ["service", "wash", "dry", "clean", "iron", "press", "fold", "price", "cost", "fee"],
    response: "Mr Bubbles Express offers professional laundry services including washing, drying, ironing, and folding. We charge by weight (per kg) or per item. Our services include: standard wash & fold (€3/kg), express service (€5/kg), dry cleaning, and ironing (€2/item). All prices include 23% VAT."
  },
  // Franchise Info
  franchise: {
    keywords: ["franchise", "partner", "join", "tier", "silver", "gold", "subscription", "fee", "percentage"],
    response: "We offer 3 franchise tiers:\n\n🆓 **Free Tier**: Limited access, 25% fee to Mr Bubbles\n\n🥈 **Silver (€99/month or €750/year)**: All training, equipment & clothing, 15% fee\n\n🥇 **Gold (€299/month or €2500/year)**: Ultimate access, premium training, all equipment, 5% fee\n\nReady to join? Sign up as a franchise partner to get started!"
  },
  // Order Process
  ordering: {
    keywords: ["order", "book", "pickup", "delivery", "schedule", "time", "when", "how long"],
    response: "Booking is easy! 📦\n\n1. Select your pickup time (we offer morning/afternoon/evening slots)\n2. We collect your laundry from your door\n3. Items are washed, dried & folded professionally\n4. We deliver back to you within 24-48 hours\n\nYou can track your order in real-time through the app!"
  },
  // Location
  location: {
    keywords: ["area", "location", "drogheda", "where", "coverage", "deliver", "pilot"],
    response: "We're currently operating in **Drogheda, Louth** as our pilot area! 🚐 Our headquarters is on Bubbles Road. We're expanding soon to other areas in Ireland. Want to bring Mr Bubbles to your area? Contact us about franchise opportunities!"
  },
  // Payment
  payment: {
    keywords: ["pay", "payment", "card", "cash", "stripe", "cost", "charge"],
    response: "We accept multiple payment methods:\n• Credit/Debit cards (via Stripe)\n• Cash on delivery\n• Account billing for businesses\n\nAll prices include 23% Irish VAT. Payment is processed after delivery for your peace of mind."
  },
  // Driver Info
  driver: {
    keywords: ["driver", "job", "work", "earn", "requirements", "apply"],
    response: "Join our driver team! 🚗\n\nDrivers earn competitive rates plus tips. Requirements:\n• Valid driver's license\n• Own vehicle\n• Smartphone for app\n• Clean driving record\n\nSign up as a driver to get started. We provide training, branded gear, and flexible hours!"
  },
  // Tracking
  tracking: {
    keywords: ["track", "status", "where", "gps", "location", "follow"],
    response: "Track your order in real-time! 📍\n\nYou can see:\n• Driver's live GPS location\n• Order status updates (collected → washing → drying → delivering)\n• Estimated delivery time\n• QR code scanning confirmations\n\nJust open your order in the customer app to see live tracking!"
  },
  // QR Scanning
  scanning: {
    keywords: ["qr", "scan", "code", "bag", "label", "tag"],
    response: "We use QR codes for complete tracking! Each bag gets a unique QR code that tracks:\n• Pickup confirmation with photo\n• Shop intake scan\n• Quality control checks\n• Delivery handoff with signature\n\nThis ensures complete transparency and prevents mix-ups!"
  },
  // Training
  training: {
    keywords: ["training", "learn", "course", "education", "video", "guide"],
    response: "We provide comprehensive training! 📚\n\n**For Drivers**: Pickup/delivery procedures, customer service, QR scanning, safety protocols\n\n**For Franchises**: Business setup, equipment operation, quality standards, marketing\n\nAll training materials include videos, guides, and hands-on support. Silver & Gold tier franchises get full access!"
  },
  // Contact/Support
  support: {
    keywords: ["help", "support", "contact", "issue", "problem", "question", "phone", "email"],
    response: "I'm here to help! 💙\n\nFor immediate support:\n• Chat with me anytime\n• Call: +353 XX XXX XXXX\n• Email: support@mrbubbles.ie\n\n**For Franchises**: Gold tier gets 24/7 premium support, Silver gets priority support, Free tier gets standard email support."
  },
  // General greeting
  greeting: {
    keywords: ["hello", "hi", "hey", "good", "morning", "afternoon", "evening"],
    response: "Hello! I'm Mister Bubble, your friendly laundry assistant! 🫧 How can I help you today? I can tell you about our services, franchise opportunities, order tracking, or anything else about Mr Bubbles Express!"
  },
  // Thanks
  thanks: {
    keywords: ["thank", "thanks", "appreciate"],
    response: "You're very welcome! Happy to help! 😊 Is there anything else you'd like to know about Mr Bubbles Express?"
  }
};

function findBestResponse(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  // Check each knowledge category
  for (const [key, data] of Object.entries(knowledgeBase)) {
    if (data.keywords.some(keyword => lowerMessage.includes(keyword))) {
      return data.response;
    }
  }
  
  // Default response
  return "I'd be happy to help you with that! I can answer questions about:\n\n• Our laundry services & pricing\n• Franchise opportunities (Free/Silver/Gold tiers)\n• How to place an order\n• Order tracking & delivery\n• Payment methods\n• Driver opportunities\n• QR code scanning\n• Training programs\n\nWhat would you like to know?";
}

export default function MisterBubbleChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      text: "Hi! I'm Mister Bubble 🫧 Your AI assistant for Mr Bubbles Express. How can I help you today?",
      sender: "bot",
      timestamp: new Date(),
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    // Simulate AI thinking time
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: findBestResponse(inputValue),
        sender: "bot",
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 800 + Math.random() * 1200); // Random delay between 0.8-2s
  };

  return (
    <>
      {/* Floating Chat Bubble */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <Button
              size="icon"
              className="h-14 w-14 rounded-full shadow-lg bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
              onClick={() => setIsOpen(true)}
              data-testid="button-open-chatbot"
            >
              <MessageCircle className="h-6 w-6" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-3rem)]"
          >
            <Card className="shadow-2xl">
              <CardHeader className="pb-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-t-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border-2 border-white">
                      <AvatarFallback className="bg-blue-700 text-white font-bold">
                        MB
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-white">Mister Bubble</CardTitle>
                      <CardDescription className="text-blue-100">
                        AI Assistant • Online
                      </CardDescription>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsOpen(false)}
                    className="text-white hover:bg-blue-700"
                    data-testid="button-close-chatbot"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="p-0">
                <ScrollArea className="h-96 p-4">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg p-3 ${
                            message.sender === "user"
                              ? "bg-blue-600 text-white"
                              : "bg-muted"
                          }`}
                          data-testid={`message-${message.sender}`}
                        >
                          <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                          <p className={`text-xs mt-1 ${message.sender === "user" ? "text-blue-100" : "text-muted-foreground"}`}>
                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    ))}
                    {isTyping && (
                      <div className="flex justify-start">
                        <div className="bg-muted rounded-lg p-3 flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="text-sm text-muted-foreground">Mister Bubble is typing...</span>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                <div className="border-t p-4">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendMessage();
                    }}
                    className="flex gap-2"
                  >
                    <Input
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="Ask me anything..."
                      className="flex-1"
                      disabled={isTyping}
                      data-testid="input-chatbot-message"
                    />
                    <Button
                      type="submit"
                      size="icon"
                      disabled={!inputValue.trim() || isTyping}
                      data-testid="button-send-message"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
