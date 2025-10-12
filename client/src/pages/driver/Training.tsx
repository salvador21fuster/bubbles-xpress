import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GraduationCap, Play, CheckCircle2, Clock, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";

export default function DriverTraining() {
  const trainingModules = [
    {
      id: 1,
      title: "Driver App Basics",
      description: "Learn how to use the Mr Bubbles Express driver app",
      duration: "10 mins",
      completed: true,
      lessons: [
        "App navigation and features",
        "Going online/offline",
        "Understanding your dashboard",
      ]
    },
    {
      id: 2,
      title: "Accepting and Managing Orders",
      description: "How to accept pickups and manage deliveries",
      duration: "15 mins",
      completed: false,
      lessons: [
        "Accepting available orders",
        "Viewing pickup details",
        "Route optimization",
        "Time window management",
      ]
    },
    {
      id: 3,
      title: "QR Code Scanning for Pickups",
      description: "Master the QR scanning workflow for collections",
      duration: "12 mins",
      completed: false,
      lessons: [
        "Using the camera scanner",
        "Capturing pickup photos",
        "Getting customer signatures",
        "Manual entry fallback",
      ]
    },
    {
      id: 4,
      title: "GPS Navigation & Tracking",
      description: "Using GPS for efficient routing and customer tracking",
      duration: "10 mins",
      completed: false,
      lessons: [
        "Enabling location services",
        "Real-time tracking for customers",
        "Turn-by-turn navigation",
        "Managing geofence areas",
      ]
    },
    {
      id: 5,
      title: "Delivery Procedures",
      description: "Best practices for successful deliveries",
      duration: "15 mins",
      completed: false,
      lessons: [
        "Delivery verification",
        "QR scanning at delivery",
        "Customer interaction tips",
        "Handling issues",
      ]
    },
    {
      id: 6,
      title: "Earnings & Payments",
      description: "Understanding your earnings and payment schedule",
      duration: "12 mins",
      completed: false,
      lessons: [
        "How earnings are calculated",
        "Viewing your earnings",
        "Payment schedule",
        "Tips and bonuses",
      ]
    },
    {
      id: 7,
      title: "Safety & Best Practices",
      description: "Stay safe and provide excellent service",
      duration: "18 mins",
      completed: false,
      lessons: [
        "Road safety guidelines",
        "Professional conduct",
        "Customer service excellence",
        "Handling difficult situations",
        "Emergency procedures",
      ]
    },
  ];

  const completedCount = trainingModules.filter(m => m.completed).length;
  const totalModules = trainingModules.length;
  const progressPercentage = (completedCount / totalModules) * 100;

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <div className="mb-6">
        <Link href="/admin">
          <Button variant="ghost" size="sm" className="mb-4" data-testid="button-back">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Admin Portal
          </Button>
        </Link>
        <h1 className="text-2xl md:text-3xl font-bold mb-2" data-testid="text-page-title">Driver Training</h1>
        <p className="text-muted-foreground text-sm md:text-base">
          Master the skills you need to be a successful Mr Bubbles Express driver
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Your Progress</CardTitle>
          <CardDescription>Track your training completion</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {completedCount} of {totalModules} modules completed
              </span>
              <span className="text-sm text-muted-foreground">
                {Math.round(progressPercentage)}%
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-3">
              <div
                className="bg-primary rounded-full h-3 transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
                data-testid="progress-bar"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {trainingModules.map((module) => (
          <Card key={module.id} className="hover-elevate">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${module.completed ? 'bg-green-100 dark:bg-green-900' : 'bg-blue-100 dark:bg-blue-900'}`}>
                    {module.completed ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                    ) : (
                      <GraduationCap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    )}
                  </div>
                  <div>
                    <CardTitle className="text-base md:text-lg">{module.title}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{module.duration}</span>
                    </div>
                  </div>
                </div>
                {module.completed && (
                  <Badge variant="default" className="bg-green-600 text-xs">
                    Done
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{module.description}</p>
              
              <div className="space-y-1">
                <p className="text-sm font-medium">What you'll learn:</p>
                <ul className="space-y-1">
                  {module.lessons.map((lesson, idx) => (
                    <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>{lesson}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Button 
                className="w-full" 
                variant={module.completed ? "outline" : "default"}
                size="sm"
                data-testid={`button-start-module-${module.id}`}
              >
                <Play className="h-4 w-4 mr-2" />
                {module.completed ? "Review" : "Start"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Need Help?</CardTitle>
          <CardDescription>Support is available 24/7</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm mb-4">
            Questions about driving for Mr Bubbles Express? Our support team is here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="outline" size="sm" data-testid="button-contact-support">
              Contact Support
            </Button>
            <Button variant="outline" size="sm" data-testid="button-faq">
              View FAQs
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
