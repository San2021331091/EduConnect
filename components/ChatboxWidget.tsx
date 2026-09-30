"use client";

import { useEffect } from "react";

const ChatBotWidget = () => {
  useEffect(() => {
    const widgetUrl = process.env.NEXT_PUBLIC_CXGENIE_WIDGET_URL;
    const dataAid = process.env.NEXT_PUBLIC_CXGENIE_DATA_AID;

    if (!widgetUrl || !dataAid) return;

    const script = document.createElement("script");
    script.src = widgetUrl;
    script.setAttribute("data-aid", dataAid);
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
