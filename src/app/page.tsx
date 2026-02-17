"use client";

import { useState } from "react";
import { DashboardHeader } from "@/components/fitness/DashboardHeader";
import { Navigation } from "@/components/fitness/Navigation";
import { StatsOverview } from "@/components/fitness/StatsOverview";
import { QuickActions } from "@/components/fitness/QuickActions";
import { WorkoutLogger } from "@/components/fitness/WorkoutLogger";
import { ProgressCharts } from "@/components/fitness/ProgressCharts";
import { GoalManager } from "@/components/fitness/GoalManager";
import { VirtualCoach } from "@/components/fitness/VirtualCoach";
import { CommunityHub } from "@/components/fitness/CommunityHub";
import { ResourceCenter } from "@/components/fitness/ResourceCenter";
import { UserProfile } from "@/components/fitness/UserProfile";

export default function Home() {
  const [activeView, setActiveView] = useState<"dashboard" | "coach" | "community" | "resources" | "profile">("dashboard");

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        {activeView === "dashboard" && (
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Welcome back, John! 💪</h2>
              <p className="text-muted-foreground">Here's your fitness summary for today</p>
            </div>
            
            <QuickActions />
            <StatsOverview />
            
            <div className="grid gap-8 lg:grid-cols-2">
              <div className="space-y-8">
                <WorkoutLogger />
                <GoalManager />
              </div>
              <div className="space-y-8">
                <ProgressCharts />
              </div>
            </div>
          </div>
        )}

        {activeView === "coach" && (
          <div>
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-2">AI Virtual Coach</h2>
              <p className="text-muted-foreground">Get personalized guidance and recommendations</p>
            </div>
            <VirtualCoach />
          </div>
        )}

        {activeView === "community" && (
          <div>
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-2">Community Hub</h2>
              <p className="text-muted-foreground">Connect with other fitness enthusiasts</p>
            </div>
            <CommunityHub />
          </div>
        )}

        {activeView === "resources" && (
          <div>
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-2">Resource Center</h2>
              <p className="text-muted-foreground">Expert articles, guides, and programs</p>
            </div>
            <ResourceCenter />
          </div>
        )}

        {activeView === "profile" && (
          <div>
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-2">My Profile</h2>
              <p className="text-muted-foreground">Manage your account and settings</p>
            </div>
            <UserProfile />
          </div>
        )}

        {/* Navigation Buttons - Mobile Friendly */}
        <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 flex justify-center gap-2 lg:hidden z-50">
          <button
            onClick={() => setActiveView("dashboard")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeView === "dashboard"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveView("coach")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeView === "coach"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            Coach
          </button>
          <button
            onClick={() => setActiveView("community")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeView === "community"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            Community
          </button>
          <button
            onClick={() => setActiveView("resources")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeView === "resources"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            Resources
          </button>
        </div>

        {/* Desktop Quick Nav Cards */}
        <div className="hidden lg:grid grid-cols-4 gap-4 mt-12">
          <button
            onClick={() => setActiveView("dashboard")}
            className="p-6 border rounded-lg hover:bg-muted/50 transition-colors text-left"
          >
            <h3 className="font-semibold mb-1">Dashboard</h3>
            <p className="text-sm text-muted-foreground">View your overview</p>
          </button>
          <button
            onClick={() => setActiveView("coach")}
            className="p-6 border rounded-lg hover:bg-muted/50 transition-colors text-left"
          >
            <h3 className="font-semibold mb-1">AI Coach</h3>
            <p className="text-sm text-muted-foreground">Get personalized help</p>
          </button>
          <button
            onClick={() => setActiveView("community")}
            className="p-6 border rounded-lg hover:bg-muted/50 transition-colors text-left"
          >
            <h3 className="font-semibold mb-1">Community</h3>
            <p className="text-sm text-muted-foreground">Join discussions</p>
          </button>
          <button
            onClick={() => setActiveView("resources")}
            className="p-6 border rounded-lg hover:bg-muted/50 transition-colors text-left"
          >
            <h3 className="font-semibold mb-1">Resources</h3>
            <p className="text-sm text-muted-foreground">Learn and grow</p>
          </button>
        </div>
      </main>

      <footer className="border-t border-border mt-16 py-8 bg-card">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <h3 className="font-bold text-lg mb-3">FitCoach Pro</h3>
              <p className="text-sm text-muted-foreground">
                Your complete fitness tracking and virtual coaching platform
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Features</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Workout Tracking</li>
                <li>Progress Analytics</li>
                <li>AI Coaching</li>
                <li>Community Support</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Exercise Library</li>
                <li>Nutrition Guides</li>
                <li>Training Programs</li>
                <li>Blog Articles</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Help Center</li>
                <li>Contact Us</li>
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
            <p>© 2024 FitCoach Pro. All rights reserved. Built with Next.js and Shadcn/UI</p>
          </div>
        </div>
      </footer>
    </div>
  );
}