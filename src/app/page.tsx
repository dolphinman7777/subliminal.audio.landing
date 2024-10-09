"use client"

import HomePage from './home-page';
import { Button } from "@/components/ui/button";
import { useEffect, useState } from 'react';

export default function Page() {
  const [isChatbotLoaded, setIsChatbotLoaded] = useState(false);

  useEffect(() => {
    // Check if the chatbot script is already loaded
    const existingScript = document.getElementById('chatbotkit-widget');
    if (existingScript) {
      setIsChatbotLoaded(true);
    }
  }, []);

  const loadChatbot = () => {
    if (!isChatbotLoaded) {
      const script = document.createElement('script');
      script.id = 'chatbotkit-widget';
      script.src = 'https://static.chatbotkit.com/integrations/widget/v2.js';
      script.setAttribute('data-widget', 'cm229l9ly4rui13c5gpvurplt');
      document.head.appendChild(script);
      setIsChatbotLoaded(true);
    }
  };

  return (
    <>
      <HomePage />
      <Button
        onClick={loadChatbot}
        className="fixed bottom-8 right-8 z-50 bg-blue-500 hover:bg-blue-600 text-white"
      >
        Open Chatbot
      </Button>
    </>
  );
}