"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sparkles, Brain, MessageSquare, TrendingUp, AlertCircle } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";

interface CoachMessage {
  id: string;
  type: "coach" | "user";
  content: string;
  timestamp: Date;
}

export function VirtualCoach() {
  const [messages, setMessages] = useState<CoachMessage[]>([
    {
      id: "1",
      type: "coach",
      content: "Hi! I've analyzed your recent workouts. You're doing great with consistency! I noticed you've been focusing on upper body. Would you like some suggestions to balance your routine?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");

  const recommendations = [
    {
      title: "Increase Leg Day Frequency",
      description: "You've only trained legs once this week. Try adding one more session for balanced development.",
      priority: "high",
      impact: "High Impact",
    },
    {
      title: "Progressive Overload",
      description: "Your bench press weight has been static for 2 weeks. Try increasing by 5 lbs next session.",
      priority: "medium",
      impact: "Medium Impact",
    },
    {
      title: "Recovery Day Recommended",
      description: "You've trained 5 days straight. Consider taking tomorrow as an active recovery day.",
      priority: "high",
      impact: "High Impact",
    },
  ];

  const sendMessage = () => {
    if (!input.trim()) return;

    const userMessage: CoachMessage = {
      id: Date.now().toString(),
      type: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages([...messages, userMessage]);
    setInput("");

    // Simulate AI response
    setTimeout(() => {
      const coachResponse: CoachMessage = {
        id: (Date.now() + 1).toString(),
        type: "coach",
        content: "Great question! Based on your goals and current progress, I recommend focusing on compound movements and maintaining a caloric deficit of 300-500 calories. Would you like a personalized meal plan?",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, coachResponse]);
    }, 1000);
  };

  const getPriorityColor = (priority: string) => {
    return priority === "high" ? "bg-red-500" : "bg-yellow-500";
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src="https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=100&h=100&fit=crop" />
              <AvatarFallback>AI</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <CardTitle className="flex items-center gap-2">
                AI Coach
                <Sparkles className="h-4 w-4 text-yellow-500" />
              </CardTitle>
              <CardDescription>Your personalized fitness assistant</CardDescription>
            </div>
            <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
              <div className="h-2 w-2 bg-green-500 rounded-full mr-2 animate-pulse" />
              Active
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4 max-h-[400px] overflow-y-auto">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.type === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <span className="text-xs opacity-70 mt-1 block">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <Textarea
              placeholder="Ask your AI coach anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              className="resize-none"
              rows={2}
            />
            <Button onClick={sendMessage} size="icon" className="h-auto">
              <MessageSquare className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI-Powered Recommendations
          </CardTitle>
          <CardDescription>Personalized insights based on your activity</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {recommendations.map((rec, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold">{rec.title}</h4>
                    {rec.priority === "high" && (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{rec.description}</p>
                </div>
                <Badge variant="outline" className={getPriorityColor(rec.priority)}>
                  {rec.priority}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{rec.impact}</span>
              </div>
              <Button variant="outline" size="sm" className="w-full">
                Apply Recommendation
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Workout Plan Progress</CardTitle>
          <CardDescription>Current 12-week strength building program</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Week 6 of 12</span>
              <span className="font-medium">50% Complete</span>
            </div>
            <Progress value={50} className="h-2" />
          </div>
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="text-center p-3 border rounded-lg">
              <div className="text-2xl font-bold">18</div>
              <div className="text-sm text-muted-foreground">Workouts Completed</div>
            </div>
            <div className="text-center p-3 border rounded-lg">
              <div className="text-2xl font-bold">18</div>
              <div className="text-sm text-muted-foreground">Remaining Sessions</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}