
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Bot, MessageSquareMore, X, Send } from 'lucide-react';

export default function ChatbotPopup() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleChat = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Chat Trigger Button */}
      <Button
        variant="default"
        size="icon"
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50 bg-primary text-primary-foreground hover:bg-primary/90"
        onClick={toggleChat}
        aria-label={isOpen ? "Close Chatbot" : "Open Chatbot"}
      >
        {isOpen ? <X className="h-7 w-7" /> : <MessageSquareMore className="h-7 w-7" />}
      </Button>

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-24 right-6 w-80 sm:w-96 h-[450px] sm:h-[500px] shadow-xl z-50 flex flex-col rounded-lg border-primary/50 border-2">
          <CardHeader className="flex flex-row items-center justify-between p-3 sm:p-4 bg-primary text-primary-foreground rounded-t-md">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5 sm:h-6 sm:w-6" />
              <CardTitle className="text-md sm:text-lg font-headline">SaudiMart Assistant</CardTitle>
            </div>
            <Button variant="ghost" size="icon" onClick={toggleChat} className="text-primary-foreground hover:bg-primary/80 h-7 w-7">
              <X className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="sr-only">Close chat</span>
            </Button>
          </CardHeader>
          <CardContent className="flex-1 p-3 sm:p-4 space-y-3 overflow-y-auto bg-background">
            {/* Placeholder for chat messages */}
            <div className="flex justify-center items-center h-full">
              <div className="text-center">
                <Bot className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  Welcome! How can I assist you today?
                </p>
              </div>
            </div>
            {/* Example messages for styling - can be removed or adapted */}
            {/* 
            <div className="flex mt-4">
              <div className="bg-muted p-2 rounded-lg max-w-[80%]">
                <p className="text-sm">Hi there! I have a question about bulk orders for construction materials.</p>
              </div>
            </div>
            <div className="flex justify-end mt-2">
              <div className="bg-primary text-primary-foreground p-2 rounded-lg max-w-[80%]">
                <p className="text-sm">Sure, I can help with that! What specific materials are you interested in and what quantities are you looking for?</p>
              </div>
            </div>
             */}
          </CardContent>
          <CardFooter className="p-3 border-t bg-background rounded-b-md">
            <div className="flex w-full items-center space-x-2">
              <Input type="text" placeholder="Type your message..." className="flex-1 h-9 sm:h-10" />
              <Button type="submit" size="icon" className="bg-accent text-accent-foreground hover:bg-accent/90 h-9 w-9 sm:h-10 sm:w-10">
                <Send className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="sr-only">Send message</span>
              </Button>
            </div>
          </CardFooter>
        </Card>
      )}
    </>
  );
}
