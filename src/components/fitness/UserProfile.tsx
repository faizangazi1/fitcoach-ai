"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Mail, Calendar, Ruler, Weight, Target, Watch, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface UserData {
  id: number;
  name: string;
  email: string;
  age: number | null;
  heightInches: number | null;
  weightLbs: number | null;
  primaryGoal: string | null;
}

interface WearableDevice {
  id: number;
  deviceName: string;
  deviceType: string;
  status: string;
  lastSync: string | null;
}

export function UserProfile() {
  const [profile, setProfile] = useState<UserData | null>(null);
  const [wearableDevices, setWearableDevices] = useState<WearableDevice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const achievements = [
    { id: "1", title: "First Workout", description: "Completed your first workout", earned: true },
    { id: "2", title: "7 Day Streak", description: "Workout 7 days in a row", earned: true },
    { id: "3", title: "Goal Crusher", description: "Achieve your first fitness goal", earned: true },
    { id: "4", title: "30 Day Streak", description: "Workout 30 days in a row", earned: false },
    { id: "5", title: "Century Club", description: "Complete 100 workouts", earned: false },
  ];

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      const userId = 1;
      
      const [userRes, devicesRes] = await Promise.all([
        fetch(`/api/users/${userId}`),
        fetch(`/api/wearable-devices/user/${userId}`),
      ]);

      if (userRes.ok) {
        const userData = await userRes.json();
        setProfile(userData);
      }

      if (devicesRes.ok) {
        const devicesData = await devicesRes.json();
        setWearableDevices(devicesData);
      }
    } catch (error) {
      console.error("Error loading profile:", error);
      toast.error("Failed to load profile data");
    } finally {
      setIsLoading(false);
    }
  };

  const saveProfile = async () => {
    if (!profile) return;

    setIsSaving(true);
    try {
      const response = await fetch(`/api/users/${profile.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });

      if (!response.ok) throw new Error("Failed to save profile");

      toast.success("Profile updated successfully! ✨");
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Failed to save profile");
    } finally {
      setIsSaving(false);
    }
  };

  const syncDevice = async (deviceId: number) => {
    try {
      const response = await fetch(`/api/wearable-devices/${deviceId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lastSync: new Date().toISOString(),
        }),
      });

      if (!response.ok) throw new Error("Failed to sync device");

      toast.success("Device synced successfully! 🔄");
      loadProfileData();
    } catch (error) {
      console.error("Error syncing device:", error);
      toast.error("Failed to sync device");
    }
  };

  const toggleDeviceConnection = async (device: WearableDevice) => {
    try {
      const newStatus = device.status === "connected" ? "disconnected" : "connected";
      const response = await fetch(`/api/wearable-devices/${device.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          lastSync: newStatus === "connected" ? new Date().toISOString() : device.lastSync,
        }),
      });

      if (!response.ok) throw new Error("Failed to update device");

      toast.success(newStatus === "connected" ? "Device connected! ✅" : "Device disconnected");
      loadProfileData();
    } catch (error) {
      console.error("Error updating device:", error);
      toast.error("Failed to update device");
    }
  };

  const getTimeAgo = (dateString: string | null) => {
    if (!dateString) return "Never";
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

  if (!profile) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-96">
          <div className="text-center text-muted-foreground">
            <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Profile not found</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop" />
              <AvatarFallback>{profile.name[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <CardTitle>{profile.name}</CardTitle>
              <CardDescription>{profile.email}</CardDescription>
              <div className="flex gap-2 mt-2">
                <Badge variant="secondary">Member since Jan 2024</Badge>
                <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
                  Active
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="personal">Personal Info</TabsTrigger>
          <TabsTrigger value="devices">Devices</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your profile details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Full Name
                  </Label>
                  <Input 
                    id="name" 
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="age" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Age
                  </Label>
                  <Input 
                    id="age" 
                    type="number" 
                    value={profile.age || ""}
                    onChange={(e) => setProfile({ ...profile, age: parseInt(e.target.value) || null })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="height" className="flex items-center gap-2">
                    <Ruler className="h-4 w-4" />
                    Height (inches)
                  </Label>
                  <Input 
                    id="height" 
                    type="number" 
                    value={profile.heightInches || ""}
                    onChange={(e) => setProfile({ ...profile, heightInches: parseInt(e.target.value) || null })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight" className="flex items-center gap-2">
                    <Weight className="h-4 w-4" />
                    Current Weight (lbs)
                  </Label>
                  <Input 
                    id="weight" 
                    type="number" 
                    value={profile.weightLbs || ""}
                    onChange={(e) => setProfile({ ...profile, weightLbs: parseFloat(e.target.value) || null })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="goal" className="flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Primary Goal
                  </Label>
                  <Select 
                    value={profile.primaryGoal || ""}
                    onValueChange={(value) => setProfile({ ...profile, primaryGoal: value })}
                  >
                    <SelectTrigger id="goal">
                      <SelectValue placeholder="Select a goal" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weight-loss">Weight Loss</SelectItem>
                      <SelectItem value="muscle-gain">Muscle Gain</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="endurance">Build Endurance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={saveProfile} disabled={isSaving} className="w-full md:w-auto">
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="devices" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Watch className="h-5 w-5" />
                Wearable Devices
              </CardTitle>
              <CardDescription>Manage your connected fitness devices</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {wearableDevices.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Watch className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No devices connected yet</p>
                </div>
              ) : (
                wearableDevices.map((device) => (
                  <div key={device.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold">{device.deviceName}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{device.deviceType}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Last sync: {getTimeAgo(device.lastSync)}
                        </p>
                      </div>
                      <Badge
                        variant={device.status === "connected" ? "default" : "secondary"}
                        className={device.status === "connected" ? "bg-green-500" : ""}
                      >
                        {device.status === "connected" ? (
                          <>
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Connected
                          </>
                        ) : (
                          "Disconnected"
                        )}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant={device.status === "connected" ? "outline" : "default"}
                        size="sm"
                        className="flex-1"
                        onClick={() => device.status === "connected" ? syncDevice(device.id) : toggleDeviceConnection(device)}
                      >
                        {device.status === "connected" ? "Sync Now" : "Connect"}
                      </Button>
                      {device.status === "connected" && (
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => toggleDeviceConnection(device)}
                        >
                          Disconnect
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}

              <Button variant="outline" className="w-full">
                <Watch className="h-4 w-4 mr-2" />
                Add New Device
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Available Integrations</CardTitle>
              <CardDescription>Connect more devices and apps</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {["Garmin", "Strava", "MyFitnessPal", "Google Fit"].map((app) => (
                <div key={app} className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="font-medium">{app}</span>
                  <Button variant="outline" size="sm">Connect</Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Achievements & Badges</CardTitle>
              <CardDescription>
                {achievements.filter(a => a.earned).length} of {achievements.length} earned
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                {achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className={`border rounded-lg p-4 space-y-2 ${
                      achievement.earned ? "bg-primary/5 border-primary/20" : "opacity-60"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold">{achievement.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {achievement.description}
                        </p>
                      </div>
                      {achievement.earned && (
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                      )}
                    </div>
                    {achievement.earned && (
                      <Badge variant="outline" className="text-xs">
                        Earned
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}