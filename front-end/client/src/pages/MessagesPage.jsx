import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Send, User, MessageCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/lib/auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format, formatDistanceToNow } from "date-fns";

function MessagesPage() {
  const { user } = useAuth();
  const [location, setLocation] = useLocation();
  const [selectedPartnerId, setSelectedPartnerId] = useState(null);
  const [messageInput, setMessageInput] = useState("");
  const messagesEndRef = useRef(null);

  // Check URL params for user to message
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('user');
    if (userId) {
      setSelectedPartnerId(userId);
      // Clear the URL parameter using wouter
      setTimeout(() => setLocation('/messages'), 0);
    }
  }, [setLocation]);

  const { data: conversations = [], isLoading: conversationsLoading } = useQuery({
    queryKey: ["/api/conversations"],
  });

  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: [`/api/messages/conversation/${selectedPartnerId}`],
    enabled: !!selectedPartnerId,
  });

  // Fetch user info if starting a new conversation (not in conversations list)
  const { data: selectedUserInfo } = useQuery({
    queryKey: [`/api/users/${selectedPartnerId}`],
    enabled: !!selectedPartnerId && !conversations.find((c) => c.partner.id === selectedPartnerId),
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (data) => {
      return await apiRequest("POST", "/api/messages", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/messages/conversation/${selectedPartnerId}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
      setMessageInput("");
    },
  });

  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedPartnerId) return;
    
    sendMessageMutation.mutate({
      receiverId: selectedPartnerId,
      content: messageInput.trim(),
    });
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const selectedConversation = Array.isArray(conversations) ? conversations.find((c) => c.partner.id === selectedPartnerId) : null;
  const selectedPartner = selectedConversation?.partner || selectedUserInfo;

  return (
    <div className="h-full flex flex-col md:flex-row overflow-hidden">
      <div className="w-full md:w-80 border-r md:border-b-0 border-b flex flex-col max-h-48 md:max-h-full">
        <div className="p-4 border-b">
          <h2 className="text-lg md:text-xl font-bold">Messages</h2>
        </div>

        <ScrollArea className="flex-1">
          {conversationsLoading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-md">
                  <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted animate-pulse rounded" />
                    <div className="h-3 bg-muted animate-pulse rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : conversations.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No conversations yet</p>
            </div>
          ) : (
            <div className="p-2">
              {conversations.map((conv) => (
                <div
                  key={conv.partner.id}
                  onClick={() => setSelectedPartnerId(conv.partner.id)}
                  className={`flex items-center gap-3 p-3 rounded-md cursor-pointer hover-elevate ${
                    selectedPartnerId === conv.partner.id ? "bg-accent" : ""
                  }`}
                  data-testid={`conversation-${conv.partner.id}`}
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={conv.partner.avatarUrl} />
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-sm truncate">
                        {conv.partner.fullName || conv.partner.username}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(conv.lastMessage.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground truncate">
                        {conv.lastMessage.content}
                      </p>
                      {conv.unreadCount > 0 && (
                        <Badge variant="default" className="ml-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
                          {conv.unreadCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      <div className="flex-1 flex flex-col">
        {selectedPartnerId && selectedPartner ? (
          <>
            <div className="p-4 border-b flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={selectedPartner.avatarUrl} />
                <AvatarFallback>
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold" data-testid="text-conversation-partner">
                  {selectedPartner.fullName || selectedPartner.username}
                </h3>
                <p className="text-xs text-muted-foreground">@{selectedPartner.username}</p>
              </div>
            </div>

            <ScrollArea className="flex-1 p-4">
              {messagesLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-2">
                      <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted animate-pulse rounded w-1/3" />
                        <div className="h-12 bg-muted animate-pulse rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : messages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No messages yet</p>
                    <p className="text-sm mt-2">Send a message to start the conversation</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((msg) => {
                    const isMine = msg.senderId === user?.id;
                    return (
                      <div
                        key={msg.id}
                        className={`flex gap-3 ${isMine ? "flex-row-reverse" : ""}`}
                        data-testid={`message-${msg.id}`}
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={msg.sender?.avatarUrl} />
                          <AvatarFallback>
                            <User className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                        <div className={`flex flex-col ${isMine ? "items-end" : ""}`}>
                          <div
                            className={`px-4 py-2 rounded-md max-w-md ${
                              isMine ? "bg-primary text-primary-foreground" : "bg-muted"
                            }`}
                          >
                            <p className="text-sm">{msg.content}</p>
                          </div>
                          <span className="text-xs text-muted-foreground mt-1">
                            {format(new Date(msg.createdAt), "h:mm a")}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </ScrollArea>

            <Separator />
            <div className="p-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Type a message..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  disabled={sendMessageMutation.isPending}
                  data-testid="input-message"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim() || sendMessageMutation.isPending}
                  size="icon"
                  data-testid="button-send"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-semibold mb-2">Your Messages</p>
              <p className="text-sm">Select a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MessagesPage;
