import React, { useState } from 'react';
import axios from 'axios';

export default function ChatBot() {
  const [messages, setMessages] = useState([]); // Stores chat messages
  const [input, setInput] = useState(''); // Stores user input
  const [isLoading, setIsLoading] = useState(false); // Loading state for bot responses

  // Function to handle sending messages
  const sendMessage = async () => {
    if (!input.trim()) return; // Don't send empty messages

    // Add user message to the chat
    const userMessage = { sender: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput(''); // Clear input field

    try {
      setIsLoading(true);

      // Send the message to the API
      const response = await axios.post('https://chat.deepseek.com/api/v0/chat/completion', {
        chat_session_id: 'fbe42849-9a6e-4636-a06c-c949ba712936',
        parent_message_id: 8,
        prompt: input,
        ref_file_ids: [],
        thinking_enabled: false,
        search_enabled: false,
      }, { responseType: 'stream' });

      // Process the streaming response
      const reader = response.data.getReader();
      let botResponse = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data:') && line.trim() !== 'data: [DONE]') {
            try {
              const parsed = JSON.parse(line.slice(5));
              const content = parsed.choices[0]?.delta?.content;
              if (content) {
                botResponse += content;
                setMessages((prev) => [...prev.slice(0, -1), { sender: 'bot', text: botResponse }]);
              }
            } catch (error) {
              console.error('Error parsing chunk:', error);
            }
          }
        }
      }
    } catch (error) {
      // Handle API errors
      const errorMessage = { sender: 'bot', text: 'Oops! Something went wrong. Please try again.' };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-4 bg-white shadow-lg rounded-2xl">
        {/* Chat Window */}
        <div className="h-96 overflow-y-auto mb-4 border rounded-lg p-4 bg-gray-50">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`mb-2 flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`px-4 py-2 rounded-lg text-white ${
                  msg.sender === 'user' ? 'bg-blue-500' : 'bg-gray-500'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="px-4 py-2 rounded-lg text-white bg-gray-500 animate-pulse">
                Typing...
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          />
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            onClick={sendMessage}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
