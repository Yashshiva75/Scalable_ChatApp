import React, { useState, useRef, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { userAPI } from "../Apis/userAPI";
import { chatAPI } from "../Apis/chatAPI";
import { useSocket } from "../SocketClient/SocketContext/SocketContext";
export default function ChatApp() {
  const [activeUser, setActiveUser] = useState(0);
  const [selectedUser,setselectedUser] = useState('')
  const [newMessage, setNewMessage] = useState("");
  const [showChat, setShowChat] = useState(false);
  const socket = useSocket()
  const messagesEndRef = useRef(null);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hey! How are you doing today?",
      sender: "other",
      time: "10:30 AM",
      status: "seen",
    },
    {
      id: 2,
      text: "I'm doing great! Just finished my morning workout. What about you?",
      sender: "me",
      time: "10:32 AM",
      status: "delivered",
    },
    {
      id: 3,
      text: "That's awesome! I'm planning to hit the gym later today too.",
      sender: "other",
      time: "10:35 AM",
      status: "seen",
    },
    {
      id: 4,
      text: "Nice! We should work out together sometime",
      sender: "me",
      time: "10:36 AM",
      status: "seen",
    },
  ]);


  //Users api
  const { data, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: userAPI.getAllUsers,
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 30, // 30 minutes
  });


  // Modified click handler to toggle chat on mobile
  const handleUserClick = (index) => {
    setActiveUser(index);
    const selected = data?.users?.[index];
    setselectedUser(selected?._id);
    setShowChat(true); // Show chat interface on mobile when user is clicked
  };

  //Messaging Api
  const {data:convo,isLoading:convoLoading,isError} =useQuery({
    queryKey:["messages"],
    queryFn:chatAPI.getConversation(selectedUser),
    enabled: !!selectedUser,
    staleTime:1000*60*5
  })

  const {mutate:sendMessage,isLoading:messageLoading,isError:messageError} = useMutation({
    mutationFn:chatAPI.sendMessage,
    onSuccess:(data)=>{
      console.log('Message sent',data)
    },
    onError:(error)=>{
      console.log('Message sent error',error)
    }
  })


  // Function to scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Auto-scroll when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, []]);

  console.log('receiverId',selectedUser)
  const handleSendMessage = (e) => {
    if (e) e.preventDefault();
    const messagePayload = {
      receiverId : selectedUser,
      content : newMessage
    }
    if (newMessage.trim()) {
      const newMsg = {
        id: messages.length + 1,
        text: newMessage,
        sender: "me",
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        status: "delivered",
      };
      setMessages([...messages, newMsg]);
      setNewMessage("");
      socket.emit("sendMessage",newMsg)
      sendMessage(messagePayload)
    }
  };

  

  // Function to go back to user list on mobile
  const handleBackToUsers = () => {
    setShowChat(false);
  };

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
        <div className="p-4 border-b border-base-300">
          <div className="flex items-center gap-3">
            <div className="avatar">
              <div className="w-10 rounded-full">
                <img
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=Me&backgroundColor=a8e6cf"
                  alt="My Avatar"
                />
              </div>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-base-content">
                ChatFlow
              </h2>
              <p className="text-sm text-base-content/60">Online</p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="p-4">
          <input
            type="text"
            placeholder="Search conversations..."
            className="input input-sm w-full bg-base-300 border-base-300 focus:border-primary"
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
            : data?.users.map((user, index) => (
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
                        {/* {user.online && (
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-success rounded-full border-2 border-base-200"></div>
                        )} */}
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
              ))}
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
            {/* Back button for mobile */}
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
              <div className="w-10 rounded-full relative ">
                <img
                  src={data?.users?.[activeUser]?.profilePhoto}
                  alt={data?.users?.[activeUser]?.fullName}
                />
                {/* {users[activeUser].online && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-success rounded-full border-2 border-base-200"></div>
                )} */}
              </div>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-base-content">
                {data?.users?.[activeUser]?.userName}
              </h3>
              {/* <p className="text-sm text-base-content/60">
                {users[activeUser].online ? "Online" : "Last seen 2 hours ago"}
              </p> */}
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
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`chat ${
                message.sender === "me" ? "chat-end" : "chat-start"
              }`}
            >
              <div className="chat-image avatar">
                <div className="w-6 rounded-full">
                  {/* <img
                    src={
                      message.sender === "me"
                        ? "https://api.dicebear.com/7.x/avataaars/svg?seed=Me&backgroundColor=a8e6cf"
                        : users[activeUser].profilePhoto
                    }
                    alt="Avatar"
                  /> */}
                </div>
              </div>
              <div className="chat-header">
                <span className="text-xs text-base-content/60">
                  {message.time}
                </span>
              </div>
              <div
                className={`chat-bubble text-sm max-w-xs ${
                  message.sender === "me"
                    ? "chat-bubble-primary"
                    : "chat-bubble-secondary"
                }`}
              >
                {message.text}
              </div>
              {message.sender === "me" && (
                <div className="chat-footer opacity-50 flex items-center gap-1">
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
          ))}
          {/* Invisible div to scroll to */}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="flex-shrink-0 p-4 border-t border-base-300 bg-base-200">
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
                  d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.01M15 10h1.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </button>
            <button
              onClick={handleSendMessage}
              className="btn btn-primary btn-circle btn-sm"
              disabled={!newMessage.trim()}
            >
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
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
