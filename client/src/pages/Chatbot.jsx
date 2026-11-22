import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import Container from "../components/Container";
import Breadcrumbs from "../components/Breadcrumbs";
import { IoMdSend } from "react-icons/io";
import { BsRobot } from "react-icons/bs";
import { FaUser } from "react-icons/fa";
import toast from "react-hot-toast";
import { config } from "../../config.js";

const Chatbot = () => {
  const STORAGE_KEY = "chatbot_messages_v1";

  const initialBotMessage = {
    id: 1,
    text: "Hello!  I'm your shopping assistant. Ask me about any product to see today's price and details! How can I help you today?",
    sender: "bot",
    timestamp: new Date(),
  };

  const getInitialMessages = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch (e) {
      console.error("Failed to parse stored chatbot messages:", e);
    }
    return [initialBotMessage];
  };

  const [messages, setMessages] = useState(getInitialMessages);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Persist messages to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch (e) {
      console.error("Failed to save chatbot messages:", e);
    }
  }, [messages]);

  // ============ Format markdown-like text for display
  const formatMessage = (text) => {
    const lines = text.split("\n");
    return lines.map((line, index) => {
      // ========== Bold text
      const formattedLine = line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
      // =======Emojis are already in the text
      return (
        <span key={index}>
          <span dangerouslySetInnerHTML={{ __html: formattedLine }} />
          {index < lines.length - 1 && <br />}
        </span>
      );
    });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      text: inputMessage,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = inputMessage;
    setInputMessage("");
    setIsTyping(true);

    try {
      // ============ Call the API endpoint
      const response = await fetch(`${config.baseUrl}/api/chatbot/message`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: currentInput,
        }),
      });

      const data = await response.json();

      if (data.success) {
        const botResponse = {
          id: messages.length + 2,
          text: data.message,
          sender: "bot",
          timestamp: new Date(),
          product: data.product || null,
          type: data.type || "text",
        };
        setMessages((prev) => [...prev, botResponse]);
      } else {
        const errorResponse = {
          id: messages.length + 2,
          text: "Sorry, I encountered an error. Please try again or contact support.",
          sender: "bot",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorResponse]);
      }
    } catch (error) {
      console.error("Chatbot API error:", error);
      const errorResponse = {
        id: messages.length + 2,
        text: "Sorry, I'm having trouble connecting. Please check your internet connection and try again.",
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Container className="py-8">
        <Breadcrumbs title="Chatbot" prevLocation="" />

        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <BsRobot className="text-4xl text-gray-900" />
              <h1 className="text-4xl font-bold text-gray-900">
                Shopping Assistant
              </h1>
            </div>
            <div className="flex items-center justify-center gap-4">
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Ask me about any product to see today&apos;s price and details! I can
              also help with orders, shipping, returns, and general shopping
              questions.
              </p>
              <button
                onClick={() => {
                  setMessages([initialBotMessage]);
                  try {
                    localStorage.removeItem(STORAGE_KEY);
                  } catch (e) {
                    console.error("Failed to clear chatbot storage:", e);
                  }
                }}
                className="ml-2 text-sm text-gray-500 hover:text-gray-900"
                title="Clear chat history"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Chat Container */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col h-[600px]">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    message.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {message.sender === "bot" && (
                    <div className="flex-shrink-0 w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center">
                      <BsRobot className="text-white text-lg" />
                    </div>
                  )}
                  <div
                    className={`max-w-[75%] rounded-lg px-4 py-3 ${
                      message.sender === "user"
                        ? "bg-gray-900 text-white"
                        : "bg-white text-gray-900 border border-gray-200"
                    }`}
                  >
                    <div className="text-sm leading-relaxed whitespace-pre-line">
                      {formatMessage(message.text)}
                    </div>

                    {/* =========== Product Card Display =========*/}
                    {message.product && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 space-y-3">
                          {message.product.images &&
                            message.product.images.length > 0 && (
                              <div className="w-full h-48 rounded-lg overflow-hidden bg-gray-100">
                                <img
                                  src={message.product.images[0]}
                                  alt={message.product.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                          <div className="space-y-2">
                            <h3 className="font-bold text-lg text-gray-900">
                              {message.product.name}
                            </h3>
                            <div className="flex items-center gap-3">
                              <span className="text-2xl font-bold text-green-600">
                                ${message.product.discountedPrice.toFixed(2)}
                              </span>
                              {message.product.discountedPercentage > 0 && (
                                <>
                                  <span className="text-gray-400 line-through">
                                    ${message.product.price.toFixed(2)}
                                  </span>
                                  <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-xs font-semibold">
                                    {message.product.discountedPercentage}% OFF
                                  </span>
                                </>
                              )}
                            </div>
                            <div className="text-sm text-gray-600 space-y-1">
                              {message.product.brand && (
                                <p>
                                  <strong>Brand:</strong> {message.product.brand}
                                </p>
                              )}
                              {message.product.category && (
                                <p>
                                  <strong>Category:</strong>{" "}
                                  {message.product.category}
                                </p>
                              )}
                              <p>
                                <strong>Stock:</strong>{" "}
                                {message.product.stock > 0
                                  ? `${message.product.stock} available`
                                  : "Out of stock"}
                              </p>
                              <p>
                                <strong>Status:</strong>{" "}
                                {message.product.isAvailable ? (
                                  <span className="text-green-600">
                                     Available
                                  </span>
                                ) : (
                                  <span className="text-red-600">
                                     Unavailable
                                  </span>
                                )}
                              </p>
                            </div>
                            {message.product.description && (
                              <p className="text-sm text-gray-700 line-clamp-2">
                                {message.product.description}
                              </p>
                            )}
                            <div className="mt-2 grid grid-cols-2 gap-2">
                              <Link
                                to={`/product/${message.product._id}`}
                                className="block w-full bg-gray-900 text-white text-center py-2 rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
                              >
                                View Full Details
                              </Link>
                              <button
                                onClick={async () => {
                                  const token = localStorage.getItem("token");
                                  if (!token) {
                                    toast.error("Please login to add items to cart");
                                    return;
                                  }

                                  if (!message.product.isAvailable || message.product.stock <= 0) {
                                    toast.error("Product is out of stock");
                                    return;
                                  }

                                  try {
                                    const resp = await fetch(`${config.baseUrl}/api/user/cart/add`, {
                                      method: "POST",
                                      headers: {
                                        "Content-Type": "application/json",
                                        Authorization: `Bearer ${token}`,
                                      },
                                      body: JSON.stringify({
                                        productId: message.product._id,
                                        quantity: 1,
                                      }),
                                    });

                                    const result = await resp.json();
                                    if (result.success) {
                                      toast.success("Item added to cart");
                                    } else {
                                      toast.error(result.message || "Failed to add to cart");
                                    }
                                  } catch (err) {
                                    console.error("Add to cart error:", err);
                                    toast.error("Failed to add to cart");
                                  }
                                }}
                                className="block w-full bg-green-600 text-white text-center py-2 rounded-lg hover:bg-green-500 transition-colors text-sm font-medium"
                              >
                                Add to Cart
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <span
                      className={`text-xs mt-2 block ${
                        message.sender === "user"
                          ? "text-gray-300"
                          : "text-gray-500"
                      }`}
                    >
                      {formatTime(message.timestamp)}
                    </span>
                  </div>
                  {message.sender === "user" && (
                    <div className="flex-shrink-0 w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <FaUser className="text-gray-600 text-sm" />
                    </div>
                  )}
                </div>
              ))}

              {isTyping && (
                <div className="flex gap-3 justify-start">
                  <div className="flex-shrink-0 w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center">
                    <BsRobot className="text-white text-lg" />
                  </div>
                  <div className="bg-white text-gray-900 border border-gray-200 rounded-lg px-4 py-3">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                      <span
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></span>
                      <span
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.4s" }}
                      ></span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* ============ Input Area */}
            <div className="border-t border-gray-200 p-4 bg-white">
              <form onSubmit={handleSendMessage} className="flex gap-3">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Type your message here..."
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  disabled={isTyping}
                />
                <button
                  type="submit"
                  disabled={!inputMessage.trim() || isTyping}
                  className="bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <IoMdSend className="text-xl" />
                  <span className="hidden sm:inline">Send</span>
                </button>
              </form>
              <p className="text-xs text-gray-500 mt-2 text-center">
                Try: &quot;Tell me about iPhone&quot; or &quot;Price of headphones&quot; or &quot;What products do you have?&quot;
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              "What products do you have?",
              "Price of iPhone",
              "Shipping Info",
              "Return Policy",
            ].map((action) => (
              <button
                key={action}
                onClick={() => {
                  setInputMessage(action);
                  inputRef.current?.focus();
                }}
                className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors duration-200 text-sm"
              >
                {action}
              </button>
            ))}
          </div>
        </div>
      </Container>
    </div>
  );
};

export default Chatbot;

