import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GraduationCap, Play, CheckCircle2, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function ShopTraining() {
  const trainingModules = [
    {
      id: 1,
      title: "Getting Started with Mr Bubbles Express",
      description: "Learn the basics of the shop portal and how to manage orders",
      duration: "15 mins",
      completed: true,
      lessons: [
        "Introduction to the platform",
        "Understanding order workflow",
        "Managing your shop profile",
      ]
    },
    {
      id: 2,
      title: "Order Intake and QR Scanning",
      description: "Master the QR scanning process and order intake workflow",
      duration: "20 mins",
      completed: false,
      lessons: [
        "Using the QR scanner",
        "Capturing photos and signatures",
        "Bagging and tagging items",
        "Quality control checks",
      ]
    },
    {
      id: 3,
      title: "Processing Orders",
      description: "Learn how to process orders efficiently through each stage",
      duration: "25 mins",
      completed: false,
      lessons: [
        "Order state management",
        "Washing and drying procedures",
        "Pressing and finishing",
        "Quality assurance",
        "Packing for delivery",
      ]
    },
    {
      id: 4,
      title: "Subcontracting & Partnerships",
      description: "How to work with other launderettes and processing centers",
      duration: "15 mins",
      completed: false,
      lessons: [
        "Subcontracting orders",
        "Revenue split calculations",
        "Managing partnerships",
      ]
    },
    {
      id: 5,
      title: "Revenue & Invoicing",
      description: "Understanding your earnings and invoice management",
      duration: "18 mins",
      completed: false,
      lessons: [
        "Revenue split breakdown",
        "Viewing invoices",
        "Payment reconciliation",
        "Tax compliance (VAT)",
      ]
    },
    {
      id: 6,
      title: "Best Practices & Tips",
      description: "Pro tips for running an efficient franchise operation",
      duration: "12 mins",
      completed: false,
      lessons: [
        "Customer service excellence",
        "Efficiency optimization",
        "Common troubleshooting",
        "Growth strategies",
      ]
    },
  ];

  const completedCount = trainingModules.filter(m => m.completed).length;
  const totalModules = trainingModules.length;
  const progressPercentage = (completedCount / totalModules) * 100;

  return (
    <div className="p-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2" data-testid="text-page-title">Shop Training</h1>
        <p className="text-muted-foreground">
          Learn everything you need to know to run your Mr Bubbles Express franchise
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
                    <CardTitle className="text-lg">{module.title}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{module.duration}</span>
                    </div>
                  </div>
                </div>
                {module.completed && (
                  <Badge variant="default" className="bg-green-600">
                    Completed
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
                data-testid={`button-start-module-${module.id}`}
              >
                <Play className="h-4 w-4 mr-2" />
                {module.completed ? "Review Module" : "Start Module"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Need Help?</CardTitle>
          <CardDescription>We're here to support you</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm mb-4">
            If you have questions about running your franchise or need additional training, 
            our support team is ready to help.
          </p>
          <div className="flex gap-3">
            <Button variant="outline" data-testid="button-contact-support">
              Contact Support
            </Button>
            <Button variant="outline" data-testid="button-schedule-training">
              Schedule Live Training
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
