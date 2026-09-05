import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import { getSocket } from "../services/socket";
import {
  MessageSquare,
  Send,
  User,
  Paperclip,
  CheckCheck,
  Circle
} from "lucide-react";

export default function MessagesPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeUser, setActiveUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Setup conversations based on current user role
  useEffect(() => {
    if (user?.role === "candidate") {
      // Chat with Sarah Jenkins (Recruiter)
      setActiveUser({
        _id: "user_rec_1",
        name: "Sarah Jenkins",
        headline: "Head of Talent @ TechCorp Global",
        avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80"
      });
      setConversations([
        {
          _id: "user_rec_1",
          name: "Sarah Jenkins",
          headline: "Head of Talent @ TechCorp Global",
          avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
          lastMessage: "Looking forward to our scheduled interview!",
          time: "10:12 AM",
          online: true
        }
      ]);
    } else {
      // Recruiter view: chat with candidate Alex Rivera
      setActiveUser({
        _id: "user_cand_1",
        name: "Alex Rivera",
        headline: "Senior Full-Stack Developer",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
      });
      setConversations([
        {
          _id: "user_cand_1",
          name: "Alex Rivera",
          headline: "Senior Full-Stack Developer",
          avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
          lastMessage: "I've prepared a brief overview of the scalable architectures.",
          time: "10:12 AM",
          online: true
        }
      ]);
    }
  }, [user]);

  // Load message history
  useEffect(() => {
    if (activeUser) {
      loadMessages(activeUser._id);
      setupSocket(activeUser._id);
    }
  }, [activeUser]);

  const loadMessages = async (otherId) => {
    try {
      const res = await api.getMessages(otherId);
      if (res.success) {
        setMessages(res.messages);
        scrollToBottom();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const setupSocket = (otherId) => {
    try {
      const socket = getSocket();
      socket.emit("join_conversation", { user1Id: user._id, user2Id: otherId });

      socket.on("receive_message", (msg) => {
        setMessages((prev) => [...prev, msg]);
        scrollToBottom();
      });

      socket.on("user_typing", ({ isTyping: typingStatus }) => {
        setIsTyping(typingStatus);
      });
    } catch (e) {}
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || !activeUser) return;

    const payload = {
      receiverId: activeUser._id,
      content: inputMessage.trim()
    };

    const socket = getSocket();
    try {
      // Emit socket event for real-time delivery
      socket.emit("send_message", {
        senderId: user._id,
        receiverId: activeUser._id,
        content: inputMessage.trim()
      });

      // Also persist to API
      const res = await api.sendMessage(payload);
      if (res.success) {
        setMessages((prev) => {
          // avoid duplicate if socket echoed
          if (prev.some((m) => m._id === res.message._id)) return prev;
          return [...prev, res.message];
        });
      }
      setInputMessage("");
      scrollToBottom();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden h-[750px] flex">
          {/* Conversation Sidebar */}
          <div className="w-80 border-r border-slate-200 flex flex-col bg-slate-50/50">
            <div className="p-4 border-b border-slate-200">
              <h2 className="font-extrabold text-slate-900 text-lg">Direct Messages</h2>
              <p className="text-xs text-slate-500">Real-time candidate-recruiter chat</p>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
              {conversations.map((conv) => (
                <div
                  key={conv._id}
                  onClick={() => setActiveUser(conv)}
                  className={`p-4 hover:bg-slate-100/60 cursor-pointer transition flex items-center gap-3 ${
                    activeUser?._id === conv._id ? "bg-blue-50/60 border-l-4 border-blue-600" : ""
                  }`}
                >
                  <div className="relative">
                    <img src={conv.avatar} alt={conv.name} className="w-11 h-11 rounded-xl object-cover" />
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-900 truncate">{conv.name}</h4>
                      <span className="text-[10px] text-slate-400">{conv.time}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">{conv.lastMessage}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Chat Area */}
          <div className="flex-1 flex flex-col bg-white">
            {/* Chat Header */}
            {activeUser && (
              <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-white">
                <div className="flex items-center gap-3">
                  <img src={activeUser.avatar} alt={activeUser.name} className="w-10 h-10 rounded-xl object-cover" />
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{activeUser.name}</h3>
                    <p className="text-[11px] text-slate-500 flex items-center gap-1">
                      <Circle className="w-2 h-2 text-emerald-500 fill-emerald-500" />
                      <span>Online • Active now</span>
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Messages List */}
            <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/30">
              {messages.map((msg) => {
                const isMe = msg.senderId === user?._id;
                return (
                  <div
                    key={msg._id}
                    className={`flex items-end gap-2 ${isMe ? "justify-end" : "justify-start"}`}
                  >
                    {!isMe && (
                      <img
                        src={activeUser?.avatar}
                        alt="User"
                        className="w-7 h-7 rounded-lg object-cover mb-1 shrink-0"
                      />
                    )}
                    <div
                      className={`max-w-md p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                        isMe
                          ? "bg-blue-600 text-white rounded-br-xs shadow-xs"
                          : "bg-white text-slate-800 border border-slate-200 rounded-bl-xs shadow-xs"
                      }`}
                    >
                      <p>{msg.content}</p>
                      <span
                        className={`text-[10px] mt-1 block text-right ${
                          isMe ? "text-blue-100" : "text-slate-400"
                        }`}
                      >
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  </div>
                );
              })}

              {isTyping && (
                <div className="flex items-center gap-2 text-xs text-slate-400 italic">
                  <span>{activeUser?.name} is typing...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-200 bg-white flex items-center gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
              />
              <button
                type="submit"
                className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs transition"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
