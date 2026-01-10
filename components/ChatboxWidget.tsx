"use client";

import { useEffect } from "react";

const ChatBotWidget = () => {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://widget.cxgenie.ai/widget.js";
    script.setAttribute("data-aid", "14e301b4-fce7-4652-8d92-ee178d2865e9"); 
    script.setAttribute("data-lang", "en");
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return null;
};

export default ChatBotWidget;
