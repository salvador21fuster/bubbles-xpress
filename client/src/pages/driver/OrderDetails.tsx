import { useState } from 'react';
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { ArrowLeft, MapPin, MessageCircle, Send, User } from "lucide-react";
import { useRoute, useLocation } from "wouter";
import type { Order, Message, User as UserType } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function DriverOrderDetail() {
  const [, navigate] = useLocation();
  const [, params] = useRoute("/driver/orders/:id");
  const orderId = params?.id;
  const { toast } = useToast();
  const [messageText, setMessageText] = useState("");

  const { data: order } = useQuery<Order>({
    queryKey: ["/api/orders", orderId],
    enabled: !!orderId,
  });

  const { data: messages = [], refetch: refetchMessages } = useQuery<Message[]>({
    queryKey: ["/api/orders", orderId, "messages"],
    enabled: !!orderId,
    refetchInterval: 5000,
  });

  const { data: user } = useQuery<UserType>({
    queryKey: ["/api/auth/user"],
  });

  const { data: customer } = useQuery<UserType>({
    queryKey: ["/api/users", order?.customerId],
    enabled: !!order?.customerId,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      if (!orderId || !order?.customerId) throw new Error("Missing order or customer ID");
      return await apiRequest("POST", `/api/orders/${orderId}/messages`, {
        message,
        recipientId: order.customerId,
      });
    },
    onSuccess: () => {
      setMessageText("");
      refetchMessages();
      toast({
        title: "Message sent",
        description: "Customer has been notified",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Failed to send message",
        description: error.message || "Something went wrong",
      });
    },
  });

  const quickMessages = [
    "I'm on my way to pick up your laundry",
    "I'll arrive in 5 minutes",
    "I'm outside your location",
    "Laundry has been picked up successfully",
  ];

  if (!order) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading order...</p>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="border-b bg-background p-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/admin")}
            data-testid="button-back"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-bold">Order Details</h1>
            <p className="text-sm text-muted-foreground">
              {order.state === 'confirmed' ? 'Pickup' : 'Delivery'}
            </p>
          </div>
          <Badge variant={order.state === 'confirmed' ? 'default' : 'secondary'}>
            {order.state}
          </Badge>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Customer Info */}
        <Card>
          <div className="p-4">
            <div className="flex items-center gap-3 mb-4">
              <Avatar className="w-12 h-12">
                <AvatarFallback className="bg-muted">
                  <User className="h-6 w-6" />
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">{customer?.username || 'Customer'}</p>
                <p className="text-sm text-muted-foreground">{customer?.phone || customer?.email}</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">{order.addressLine1}</p>
                  {order.addressLine2 && <p className="text-sm">{order.addressLine2}</p>}
                  <p className="text-sm text-muted-foreground">{order.city}, {order.eircode}</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Messages Section */}
        <Card>
          <div className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <MessageCircle className="h-5 w-5 text-primary" />
              <h2 className="font-bold">Messages</h2>
            </div>

            {/* Messages List */}
            <div className="space-y-3 mb-4 max-h-[300px] overflow-y-auto">
              {messages.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No messages yet. Send a message to notify the customer.
                </p>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        msg.senderId === user?.id
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <p className="text-sm">{msg.message}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString() : ''}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Quick Messages */}
            <div className="mb-3">
              <p className="text-xs text-muted-foreground mb-2">Quick messages:</p>
              <div className="flex flex-wrap gap-2">
                {quickMessages.map((msg, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => sendMessageMutation.mutate(msg)}
                    disabled={sendMessageMutation.isPending}
                    data-testid={`button-quick-message-${index}`}
                  >
                    {msg}
                  </Button>
                ))}
              </div>
            </div>

            {/* Message Input */}
            <div className="flex gap-2">
              <Input
                placeholder="Type a message..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && messageText.trim()) {
                    sendMessageMutation.mutate(messageText);
                  }
                }}
                data-testid="input-message"
              />
              <Button
                size="icon"
                onClick={() => {
                  if (messageText.trim()) {
                    sendMessageMutation.mutate(messageText);
                  }
                }}
                disabled={!messageText.trim() || sendMessageMutation.isPending}
                data-testid="button-send-message"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
