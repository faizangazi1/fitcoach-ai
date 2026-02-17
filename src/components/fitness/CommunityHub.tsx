"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, MessageCircle, Share2, Trophy, Users, TrendingUp, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Post {
  id: number;
  authorName: string;
  authorAvatar: string | null;
  content: string;
  createdAt: string;
  likes: number;
  category: string;
}

interface Challenge {
  id: number;
  title: string;
  description: string;
  participantsCount: number;
  daysLeft: number;
  reward: string | null;
}

interface LeaderboardEntry {
  id: number;
  userName: string;
  userAvatar: string | null;
  points: number;
  rank: number;
}

export function CommunityHub() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostCategory, setNewPostCategory] = useState("Achievement");
  const [isLoading, setIsLoading] = useState(true);
  const [isPosting, setIsPosting] = useState(false);

  useEffect(() => {
    loadCommunityData();
  }, []);

  const loadCommunityData = async () => {
    try {
      const [postsRes, challengesRes, leaderboardRes] = await Promise.all([
        fetch("/api/community-posts"),
        fetch("/api/challenges"),
        fetch("/api/leaderboard"),
      ]);

      if (postsRes.ok) {
        const postsData = await postsRes.json();
        setPosts(postsData);
      }

      if (challengesRes.ok) {
        const challengesData = await challengesRes.json();
        setChallenges(challengesData);
      }

      if (leaderboardRes.ok) {
        const leaderboardData = await leaderboardRes.json();
        setLeaderboard(leaderboardData.sort((a: LeaderboardEntry, b: LeaderboardEntry) => a.rank - b.rank));
      }
    } catch (error) {
      console.error("Error loading community data:", error);
      toast.error("Failed to load community data");
    } finally {
      setIsLoading(false);
    }
  };

  const createPost = async () => {
    if (!newPostContent.trim()) {
      toast.error("Please enter some content");
      return;
    }

    setIsPosting(true);
    try {
      const userId = 1;
      const response = await fetch("/api/community-posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          authorName: "John Doe",
          authorAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop",
          content: newPostContent,
          category: newPostCategory,
        }),
      });

      if (!response.ok) throw new Error("Failed to create post");

      toast.success("Post created successfully! 🎉");
      setNewPostContent("");
      loadCommunityData();
    } catch (error) {
      console.error("Error creating post:", error);
      toast.error("Failed to create post");
    } finally {
      setIsPosting(false);
    }
  };

  const likePost = async (postId: number) => {
    try {
      const response = await fetch(`/api/community-posts/${postId}/like`, {
        method: "POST",
      });

      if (!response.ok) throw new Error("Failed to like post");

      // Update local state
      setPosts(posts.map(post => 
        post.id === postId ? { ...post, likes: post.likes + 1 } : post
      ));
    } catch (error) {
      console.error("Error liking post:", error);
      toast.error("Failed to like post");
    }
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return "just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    return `${Math.floor(seconds / 86400)} days ago`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Community Feed
          </CardTitle>
          <CardDescription>Connect with fellow fitness enthusiasts</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Textarea 
              placeholder="Share your fitness journey..." 
              className="resize-none" 
              rows={3}
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
            />
            <div className="flex justify-between items-center">
              <div className="flex gap-2">
                {["Achievement", "Question", "Nutrition", "Motivation"].map((category) => (
                  <Badge 
                    key={category}
                    variant={newPostCategory === category ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setNewPostCategory(category)}
                  >
                    {category}
                  </Badge>
                ))}
              </div>
              <Button onClick={createPost} disabled={isPosting}>
                {isPosting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Posting...
                  </>
                ) : (
                  "Post"
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-4 pt-4">
            {posts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No posts yet. Be the first to share!</p>
              </div>
            ) : (
              posts.map((post) => (
                <div key={post.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <Avatar>
                      <AvatarImage src={post.authorAvatar || undefined} />
                      <AvatarFallback>{post.authorName[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold">{post.authorName}</p>
                          <p className="text-sm text-muted-foreground">{getTimeAgo(post.createdAt)}</p>
                        </div>
                        <Badge variant="secondary">{post.category}</Badge>
                      </div>
                      <p className="mt-2 text-sm">{post.content}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 pt-2 border-t">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="gap-2"
                      onClick={() => likePost(post.id)}
                    >
                      <Heart className="h-4 w-4" />
                      {post.likes}
                    </Button>
                    <Button variant="ghost" size="sm" className="gap-2">
                      <MessageCircle className="h-4 w-4" />
                      Comment
                    </Button>
                    <Button variant="ghost" size="sm" className="gap-2">
                      <Share2 className="h-4 w-4" />
                      Share
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="challenges" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="challenges">Challenges</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
        </TabsList>

        <TabsContent value="challenges" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Active Challenges
              </CardTitle>
              <CardDescription>Join challenges and earn rewards</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {challenges.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No active challenges</p>
                </div>
              ) : (
                challenges.map((challenge) => (
                  <div key={challenge.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold">{challenge.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {challenge.description}
                        </p>
                      </div>
                      {challenge.reward && (
                        <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
                          {challenge.reward}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {challenge.participantsCount} participants
                      </span>
                      <span className="font-medium">{challenge.daysLeft} days left</span>
                    </div>
                    <Button variant="outline" size="sm" className="w-full">
                      Join Challenge
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leaderboard">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Monthly Leaderboard
              </CardTitle>
              <CardDescription>Top performers this month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {leaderboard.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No leaderboard data yet</p>
                  </div>
                ) : (
                  leaderboard.map((user) => (
                    <div
                      key={user.id}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        user.userName === "You" ? "bg-primary/10 border border-primary/20" : "bg-muted/50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center font-bold">
                          {user.rank}
                        </div>
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user.userAvatar || undefined} />
                          <AvatarFallback>{user.userName[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">{user.userName}</p>
                          <p className="text-sm text-muted-foreground">{user.points} points</p>
                        </div>
                      </div>
                      {user.rank <= 3 && (
                        <Trophy className={`h-5 w-5 ${
                          user.rank === 1 ? "text-yellow-500" :
                          user.rank === 2 ? "text-gray-400" :
                          "text-orange-600"
                        }`} />
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}