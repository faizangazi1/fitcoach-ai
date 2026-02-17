"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Search, Clock, TrendingUp, Apple, Dumbbell, Brain } from "lucide-react";

const articles = [
  {
    id: "1",
    title: "The Science of Progressive Overload",
    category: "Training",
    readTime: "8 min",
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=250&fit=crop",
    excerpt: "Learn how to systematically increase training stimulus for continuous gains.",
  },
  {
    id: "2",
    title: "Protein Timing: Does It Really Matter?",
    category: "Nutrition",
    readTime: "6 min",
    image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&h=250&fit=crop",
    excerpt: "Evidence-based look at protein intake timing and muscle building.",
  },
  {
    id: "3",
    title: "Recovery: The Missing Piece of Your Training",
    category: "Recovery",
    readTime: "10 min",
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=250&fit=crop",
    excerpt: "Why rest days are just as important as training days for results.",
  },
  {
    id: "4",
    title: "Building a Home Gym on a Budget",
    category: "Equipment",
    readTime: "7 min",
    image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&h=250&fit=crop",
    excerpt: "Essential equipment recommendations for effective home workouts.",
  },
];

const nutritionGuides = [
  {
    id: "1",
    title: "Macro Calculator Guide",
    description: "Calculate your optimal protein, carbs, and fats for your goals",
    icon: Apple,
  },
  {
    id: "2",
    title: "Meal Prep 101",
    description: "Complete beginner's guide to efficient meal preparation",
    icon: BookOpen,
  },
  {
    id: "3",
    title: "Hydration & Performance",
    description: "How proper hydration impacts your workout performance",
    icon: TrendingUp,
  },
];

const workoutPrograms = [
  {
    id: "1",
    title: "Beginner Full Body Routine",
    duration: "8 weeks",
    difficulty: "Beginner",
    workoutsPerWeek: 3,
  },
  {
    id: "2",
    title: "Intermediate Push/Pull/Legs",
    duration: "12 weeks",
    difficulty: "Intermediate",
    workoutsPerWeek: 6,
  },
  {
    id: "3",
    title: "Advanced Strength Program",
    duration: "16 weeks",
    difficulty: "Advanced",
    workoutsPerWeek: 5,
  },
];

export function ResourceCenter() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Resource Center
          </CardTitle>
          <CardDescription>Articles, guides, and programs to support your fitness journey</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search resources..." className="pl-10" />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="articles" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="articles">Articles</TabsTrigger>
          <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
          <TabsTrigger value="programs">Programs</TabsTrigger>
        </TabsList>

        <TabsContent value="articles" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            {articles.map((article) => (
              <Card key={article.id} className="overflow-hidden">
                <div className="aspect-video relative overflow-hidden">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="object-cover w-full h-full hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary">{article.category}</Badge>
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {article.readTime}
                    </span>
                  </div>
                  <CardTitle className="text-lg">{article.title}</CardTitle>
                  <CardDescription>{article.excerpt}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">Read Article</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="nutrition" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Nutrition Guides</CardTitle>
              <CardDescription>Comprehensive guides to optimize your diet</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {nutritionGuides.map((guide) => {
                const Icon = guide.icon;
                return (
                  <div key={guide.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold mb-1">{guide.title}</h4>
                        <p className="text-sm text-muted-foreground">{guide.description}</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="w-full">
                      View Guide
                    </Button>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sample Meal Plans</CardTitle>
              <CardDescription>Ready-to-use meal plans for different goals</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {["Weight Loss (1800 cal)", "Muscle Gain (2800 cal)", "Maintenance (2200 cal)"].map((plan) => (
                <div key={plan} className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="font-medium">{plan}</span>
                  <Button variant="ghost" size="sm">Download</Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="programs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Dumbbell className="h-5 w-5" />
                Training Programs
              </CardTitle>
              <CardDescription>Structured workout plans designed by experts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {workoutPrograms.map((program) => (
                <div key={program.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold mb-1">{program.title}</h4>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span>{program.duration}</span>
                        <span>•</span>
                        <span>{program.workoutsPerWeek}x per week</span>
                      </div>
                    </div>
                    <Badge variant={
                      program.difficulty === "Beginner" ? "default" :
                      program.difficulty === "Intermediate" ? "secondary" :
                      "outline"
                    }>
                      {program.difficulty}
                    </Badge>
                  </div>
                  <Button variant="outline" size="sm" className="w-full">
                    View Program Details
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Educational Content
              </CardTitle>
              <CardDescription>Video tutorials and exercise demonstrations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {["Proper Squat Form", "Deadlift Technique", "Bench Press Setup"].map((video) => (
                <div key={video} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                  <span className="font-medium">{video}</span>
                  <Badge variant="outline">Video</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}