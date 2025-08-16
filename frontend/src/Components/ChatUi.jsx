import React, { useState, useRef, useEffect } from "react";
import {
  QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { userAPI } from "../Apis/userAPI";
import { chatAPI } from "../Apis/chatAPI";
import { useSocket } from "../SocketClient/SocketContext/SocketContext";
import { useSelector } from "react-redux";
import { authApi } from "../Apis/authApis";
import { useNavigate } from "react-router-dom";
import bgImage from '../assets/background-cool.webp';

export default function ChatApp() {
  const [activeUser, setActiveUser] = useState(0);
  const [selectedUser, setselectedUser] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [showChat, setShowChat] = useState(false);
  const socket = useSocket();
  const [searchQuery, setSearchQuery] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const me = useSelector((state) => state.user.user?.id);
  const queryClient = useQueryClient();

  const messagesEndRef = useRef(null);
  const [messages, setMessages] = useState([]);

  // Users api
  const { data, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: userAPI.getAllUsers,
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 30, // 30 minutes
  });

  // Modified click handler to toggle chat on mobile
  const handleUserClick = (index) => {
    const selected = filteredUsers[index];
    if (selected) {
      // Find the actual index in the original data array
      const actualIndex = data?.users?.findIndex(user => user._id === selected._id) || 0;
      setActiveUser(actualIndex);
      setselectedUser(selected._id);
      setShowChat(true);
      
      // Clear messages when switching users to avoid showing old messages
      setMessages([]);
    }
  };

  // Messaging Api
  const {
    data: convo,
    isLoading: convoLoading,
    isError,
  } = useQuery({
    queryKey: ["messages", selectedUser],
    queryFn: () => chatAPI.getConversation(selectedUser),
    enabled: !!selectedUser,
    staleTime: 1000 * 60 * 5,
  });

  const conversation = convo;

  // Add this filtered users function before the return statement
  const filteredUsers = data?.users?.filter(user => 
    user.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.fullName?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];
  
  // Enhanced normalizeMessage function with better timestamp handling
  const normalizeMessage = (message, source = "api") => {
    // Enhanced time helper function
    const formatMessageTime = (timestamp) => {
      // Handle different timestamp formats
      let date;
      
      if (!timestamp) {
        date = new Date();
      } else if (typeof timestamp === 'string') {
        date = new Date(timestamp);
      } else if (typeof timestamp === 'number') {
        // Handle Unix timestamps (both seconds and milliseconds)
        date = timestamp.toString().length === 10 
          ? new Date(timestamp * 1000) 
          : new Date(timestamp);
      } else {
        date = new Date(timestamp);
      }
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.warn('Invalid timestamp received:', timestamp);
        date = new Date(); // Fallback to current time
      }
      
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    };

    // Try multiple timestamp properties based on source
    let timestamp;
    if (source === "socket") {
      // Socket messages might have different property names
      timestamp = message.timestamp || message.createdAt || message.time || message.sentAt;
    } else {
      // API messages
      timestamp = message.createdAt || message.timestamp || message.time;
    }

    return {
      _id: message._id || message.id || `temp-${Date.now()}-${Math.random()}`,
      text: message.text || message.message || message.content,
      sender: message.senderId === me ? "me" : "other",
      senderId: message.senderId,
      receiverId: message.receiverId,
      time: formatMessageTime(timestamp),
      status: message.status || "delivered",
      source: source,
      // Keep original timestamp for debugging
      originalTimestamp: timestamp,
    };
  };

  // Function to scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Auto-scroll when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load messages from API when conversation changes
  useEffect(() => {
    if (conversation?.data && Array.isArray(conversation.data)) {
      console.log('Loading messages from API:', conversation.data);
      const normalizedMessages = conversation.data
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
        .map((msg) => normalizeMessage(msg, "api"));
      setMessages(normalizedMessages);
    } else if (selectedUser) {
      setMessages([]);
    }
  }, [conversation, selectedUser, me]);

  const {
    mutate: sendMessage,
    isLoading: messageLoading,
    isError: messageError,
  } = useMutation({
    mutationFn: chatAPI.sendMessage,
    onSuccess: (data) => {
      console.log("Message sent successfully", data);
    },
    onError: (error) => {
      console.log("Message send error", error);
      // Remove the optimistic message on error
      setMessages((prev) => prev.filter((msg) => !msg.isOptimistic));
    },
  });

  const userString = sessionStorage.getItem("user"); 
  const user = userString ? JSON.parse(userString) : null;
  const loggedInUser = user?.userName;
  
  const { mutate: logout, isLoading: LoggingOut } = useMutation({
    mutationFn: authApi.logout,
  });

  const navigate = useNavigate();

  // Updated handleSendMessage with proper timestamp
  const handleSendMessage = (e) => {
    if (e) e.preventDefault();
    if (newMessage.trim() && selectedUser) {
      const tempId = `temp-${Date.now()}-${Math.random()}`;
      const now = new Date();
      const currentTime = now.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

      // Create optimistic message for immediate UI update
      const optimisticMessage = {
        _id: tempId,
        text: newMessage,
        sender: "me",
        senderId: me,
        receiverId: selectedUser,
        time: currentTime,
        status: "sending",
        isOptimistic: true,
        source: "input",
      };

      // Add optimistic message to state
      setMessages((prev) => [...prev, optimisticMessage]);

      // Prepare message payload
      const messagePayload = {
        receiverId: selectedUser,
        message: newMessage,
      };

      // Emit to socket with ISO timestamp
      socket.emit("sendMessage", {
        ...messagePayload,
        senderId: me,
        timestamp: now.toISOString(), // Send ISO timestamp
        tempId: tempId,
      });

      // Clear input
      setNewMessage("");

      // Send to backend
      sendMessage(messagePayload);
    }
  };

  // Updated socket message handling
  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (message) => {
      console.log('Raw socket message:', message); // Debug log
      
      const normalizedMessage = normalizeMessage(message, "socket");
      console.log('Normalized socket message:', normalizedMessage); // Debug log

      setMessages((prev) => {
        // Check if this is a confirmation of our sent message
        if (message.tempId) {
          return prev.map((msg) =>
            msg.isOptimistic && msg._id === message.tempId
              ? { ...normalizedMessage, status: "delivered" }
              : msg
          );
        }

        // Enhanced duplicate check
        const isDuplicate = prev.some((msg) => {
          // Check by ID first
          if (msg._id === normalizedMessage._id) return true;
          
          // Check by content and sender (for messages without proper IDs)
          if (msg.text === normalizedMessage.text && 
              msg.senderId === normalizedMessage.senderId) {
            // Only consider it duplicate if timestamps are close (within 5 seconds)
            const timeDiff = Math.abs(
              new Date(`1970-01-01 ${msg.time}`) - 
              new Date(`1970-01-01 ${normalizedMessage.time}`)
            );
            return timeDiff < 5000; // 5 seconds tolerance
          }
          
          return false;
        });

        if (isDuplicate) {
          console.log('Duplicate message detected, skipping');
          return prev;
        }

        return [...prev, normalizedMessage];
      });
    };

    const handleMessageStatus = (data) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === data.messageId ? { ...msg, status: data.status } : msg
        )
      );
    };

    socket.on("receiveMessage", handleReceiveMessage);
    socket.on("messageStatus", handleMessageStatus);

    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
      socket.off("messageStatus", handleMessageStatus);
    };
  }, [socket, selectedUser, me]);

  // Join socket room
  useEffect(() => {
    if (me && socket) {
      socket.emit("join", me);
    }
  }, [me, socket]);

  // Function to go back to user list on mobile
  const handleBackToUsers = () => {
    setShowChat(false);
  };

  // Emoji picker data
  const emojiCategories = {
    "Smileys": ["😀", "😃", "😄", "😁", "😆", "😅", "🤣", "😂", "🙂", "🙃", "😉", "😊", "😇", "🥰", "😍", "🤩", "😘", "😗", "😚", "😙", "😋", "😛", "😜", "🤪", "😝", "🤑", "🤗", "🤭", "🤫", "🤔", "🤐", "🤨", "😐", "😑", "😶", "😏", "😒", "🙄", "😬", "🤥", "😔", "😪", "🤤", "😴", "😷", "🤒", "🤕", "🤢", "🤮", "🤧", "🥵", "🥶", "🥴", "😵", "🤯", "🤠", "🥳", "😎", "🤓", "🧐"],
    "Hearts": ["❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔", "❣️", "💕", "💞", "💓", "💗", "💖", "💘", "💝"],
    "Gestures": ["👍", "👎", "👌", "🤌", "🤏", "✌️", "🤞", "🤟", "🤘", "🤙", "👈", "👉", "👆", "🖕", "👇", "☝️", "👏", "🙌", "👐", "🤲", "🤝", "🙏"],
    "Objects": ["🎉", "🎊", "🎈", "🎁", "🎀", "🔥", "💯", "✨", "🌟", "⭐", "🌈", "☀️", "🌙", "⚡", "💥", "💢", "💨", "💤", "💦", "💧"]
  };

  // Handle emoji selection
  const handleEmojiSelect = (emoji) => {
    setNewMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showEmojiPicker && !event.target.closest('.emoji-picker-container')) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showEmojiPicker]);

  // Loading state for messages
  const isMessagesLoading = convoLoading && selectedUser;

  return (
    <div
      className="h-screen bg-base-300 flex overflow-hidden"
      data-theme="dark"
    >
      {/* Left Sidebar - Users List */}
      <div
        className={`sm:w-80 w-full bg-base-200 border-r border-base-300 flex flex-col h-full overflow-hidden ${
          showChat ? "hidden md:block" : "block"
        }`}
      >
        {/* Header */}
        <div className="p-4 border-b border-base-300 flex">
          <div
            className="flex items-center gap-3"
            onClick={() => navigate("/profile")}
          >
            {/* Avatar */}
            <div className="avatar">
              <div className="w-10 rounded-full">
                <img
                  src={user?.profilePhoto}
                  alt="My Avatar"
                />
              </div>
            </div>

            {/* Username and status */}
            <div>
              <h2 className="text-lg font-semibold text-base-content cursor-pointer">
                {loggedInUser?.toUpperCase()}
              </h2>
              <p className="text-sm text-base-content/60">Online 🟢</p>
            </div>
          </div>
          <button
            onClick={() => {
              logout();
              sessionStorage.clear();
              window.location.href = "/";
              navigate("/");
            }}
            className="btn btn-warning  btn-sm ml-auto"
            title="Logout"
          >
            Logout
          </button>
        </div>

        {/* Search */}
        <div className="p-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversations..."
            className="input input-sm w-full bg-base-300 border-base-300 outline-none focus:outline-none"
          />
        </div>

        {/* Users List */}
        <div className="flex-1 overflow-y-auto pb-4">
          {isLoading
            ? Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="p-4 border-b border-base-300">
                  <div className="flex items-center gap-3">
                    <div className="skeleton w-12 h-12 rounded-full"></div>
                    <div className="flex-1">
                      <div className="skeleton h-4 w-3/4 mb-2"></div>
                      <div className="skeleton h-3 w-1/2"></div>
                    </div>
                  </div>
                </div>
              ))
            : filteredUsers.length > 0 ? (
                filteredUsers.map((user, index) => (
                  <div
                    key={index}
                    className={`p-4 border-b border-base-300 cursor-pointer transition-all duration-200 hover:bg-base-300 ${
                      activeUser === index
                        ? "bg-base-300 border-l-4 border-l-primary"
                        : ""
                    }`}
                    onClick={() => handleUserClick(index)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="avatar">
                        <div className="w-12 rounded-full relative">
                          <img src={user?.profilePhoto} alt={user.fullName} />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center">
                          <h3 className="font-medium text-base-content truncate">
                            {user.userName}
                          </h3>
                          <span className="text-xs text-base-content/60">
                            04:26
                          </span>
                        </div>
                        <div className="flex justify-between items-center mt-1">
                          <p className="text-sm text-base-content/60 truncate">
                            {user.lastMessage}
                          </p>
                          {user.unread > 0 && (
                            <div className="badge badge-primary badge-sm">
                              {user.unread}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-base-content/60">
                  <p>No users found matching "{searchQuery}"</p>
                </div>
              )
          }
        </div>
      </div>

      {/* Right Side - Chat Interface */}
      <div
        className={`flex-1 flex flex-col h-full overflow-hidden ${
          showChat ? "flex" : "hidden md:flex"
        }`}
      >
        {/* Chat Header */}
        <div className="flex-shrink-0 p-4 border-b border-base-300 bg-base-200">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBackToUsers}
              className="btn btn-ghost btn-sm btn-circle md:hidden"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            <div className="avatar">
              <div className="w-10 rounded-full relative">
                <img
                  src={data?.users?.[activeUser]?.profilePhoto}
                  alt={data?.users?.[activeUser]?.fullName}
                />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-base-content">
                {data?.users?.[activeUser]?.userName}
              </h3>
            </div>
            <div className="flex gap-2">
              <button className="btn btn-ghost btn-sm btn-circle">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
              </button>
              <button className="btn btn-ghost btn-sm btn-circle">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto px-2 py-4 space-y-3" style={{ backgroundImage: `url(${bgImage})` }}>
          {isMessagesLoading ? (
            // Show loading skeleton for messages
            Array.from({ length: 5 }).map((_, index) => (
              <div key={`skeleton-${index}`} className={`flex ${index % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                <div className="skeleton h-12 w-64 rounded-2xl"></div>
              </div>
            ))
          ) : messages.length === 0 && selectedUser ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-base-content/60">No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((message, index) => (
              <div
                key={message._id || `message-${index}`}
                className={`flex ${message.sender === "me" ? "justify-end" : "justify-start"} px-2`}
              >
                <div className={`flex flex-col ${message.sender === "me" ? "items-end" : "items-start"} max-w-[75%]`}>
                  {/* Time header */}
                  <div className="mb-1">
                    <span className="text-xs text-base-content/60 px-2">
                      {message.time}
                    </span>
                  </div>
                  
                  {/* Message bubble */}
                  <div
                    className={`px-4 py-3 rounded-2xl text-sm leading-relaxed break-words ${
                      message.sender === "me"
                        ? "bg-primary text-primary-content rounded-br-md"
                        : "bg-base-100 text-base-content rounded-bl-md"
                    } ${message.isOptimistic ? "opacity-70" : ""} shadow-sm`}
                  >
                    {message.text}
                  </div>
                  
                  {/* Message status for sent messages */}
                  {message.sender === "me" && !message.isOptimistic && (
                    <div className="flex items-center gap-1 mt-1 px-2">
                      {message.status === "delivered" ? (
                        <svg
                          className="w-3 h-3 text-base-content/60"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ) : (
                        <div className="flex">
                          <svg
                            className="w-3 h-3 text-primary"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <svg
                            className="w-3 h-3 text-primary -ml-1"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      )}
                      <span className="text-xs text-base-content/60">
                        {message.status === "delivered" ? "Delivered" : "Seen"}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="flex-shrink-0 p-4 border-t border-base-300 bg-base-200 relative">
          {/* Emoji Picker */}
          {showEmojiPicker && (
            <div className="emoji-picker-container absolute bottom-full right-4 mb-2 bg-base-100 border border-base-300 rounded-lg shadow-lg p-4 w-80 max-h-64 overflow-y-auto z-50">
              <div className="space-y-3">
                {Object.entries(emojiCategories).map(([category, emojis]) => (
                  <div key={category}>
                    <h3 className="text-sm font-medium text-base-content/70 mb-2">{category}</h3>
                    <div className="grid grid-cols-8 gap-2">
                      {emojis.map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => handleEmojiSelect(emoji)}
                          className="text-xl hover:bg-base-200 rounded p-1 transition-colors"
                          type="button"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <button type="button" className="btn btn-ghost btn-circle btn-sm">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                />
              </svg>
            </button>
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage(e)}
              placeholder="Type a message..."
              className="input input-bordered flex-1 bg-base-300 border-base-300 focus:border-primary"
            />
            <button 
              type="button" 
              className="btn btn-ghost btn-circle btn-sm"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.01M15 10h1.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </button>
            <button
              onClick={handleSendMessage}
              className="btn btn-primary btn-circle btn-sm"
              disabled={!newMessage.trim() || messageLoading}
            >
              {messageLoading ? (
                <span className="loading loading-spinner loading-xs"></span>
              ) : (
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}