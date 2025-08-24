"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Play, Shield, AlertTriangle, Clock, Users } from "lucide-react";

export default function SelfDefensePage() {
  const tutorials = [
    {
      id: 1,
      title: "5 Self Defense Moves Every Woman Should Know",
      description: "Learn essential self-defense techniques including palm strikes, knee strikes, and escapes.",
      duration: "8:45",
      difficulty: "Beginner",
      instructor: "Krav Maga Expert",
     
      videoUrl: "https://www.youtube.com/watch?v=KVpxP3ZZtAc",
      tags: ["Basic", "Strikes", "Escapes"]
    },
    {
      id: 2,
      title: "How to Escape from Grabs and Holds",
      description: "Essential techniques to break free from various grab situations including wrist grabs and bear hugs.",
      duration: "12:30",
      difficulty: "Beginner",
      instructor: "Self-Defense Instructor",
      
      videoUrl: "https://youtu.be/PnhdEQG86qc?si=94kWnOFQk_AffFH5",
      tags: ["Escapes", "Grabs", "Holds"]
    },
    {
      id: 3,
      title: "Using Everyday Objects for Self-Defense",
      description: "Learn how to use common items like keys, bags, and phones for protection in emergency situations.",
      duration: "10:15",
      difficulty: "Intermediate",
      instructor: "Personal Safety Expert",
      
      videoUrl: "https://youtu.be/T46CjA9mAY0?si=P4D6Ja2abH6mwZDv",
      tags: ["Improvise", "Objects", "Tools"]
    },
    {
      id: 4,
      title: "Situational Awareness and Prevention",
      description: "Develop awareness skills to avoid dangerous situations before they occur.",
      duration: "15:20",
      difficulty: "Beginner",
      instructor: "Security Specialist",
    
      videoUrl: "https://youtu.be/65mJ_wfeIvQ?si=q2ja7pjthFsuW728",
      tags: ["Awareness", "Prevention", "Safety"]
    },
    {
      id: 5,
      title: "Self-Defense for Walking Alone at Night",
      description: "Specific techniques and strategies for staying safe when walking alone in the dark.",
      duration: "11:45",
      difficulty: "Intermediate",
      instructor: "Women's Safety Coach",
     
      videoUrl: "https://www.youtube.com/shorts/0LwLqpfDypg",
      tags: ["Night Safety", "Walking", "Street Safety"]
    },
    {
      id: 6,
      title: "Mental Preparation and Confidence Building",
      description: "Build mental strength and confidence for effective self-defense and personal safety.",
      duration: "9:30",
      difficulty: "Beginner",
      instructor: "Psychology & Self-Defense",
     
      videoUrl: "https://youtu.be/nNtCUe5EylI?si=S9kxgDjv2koE73it",
      tags: ["Mental", "Confidence", "Mindset"]
    },
    {
      id: 7,
      title: "Ground Self-Defense Techniques",
      description: "Learn how to defend yourself if you end up on the ground during an attack.",
      duration: "13:20",
      difficulty: "Intermediate",
      instructor: "Martial Arts Expert",
      
      videoUrl: "https://youtu.be/R2hpqOQREVQ?si=qnFDcm6natUbVeOY",
      tags: ["Ground", "Defense", "Techniques"]
    },
    {
      id: 8,
      title: "Self-Defense Against Multiple Attackers",
      description: "Advanced techniques for handling situations with multiple potential threats.",
      duration: "16:45",
      difficulty: "Advanced",
      instructor: "Combat Specialist",
      
      videoUrl: "https://youtu.be/jAh0cU1J5zk?si=jIMAIuTSi3BEzciD",
      tags: ["Multiple", "Attackers", "Advanced"]
    }
  ];

  const safetyTips = [
    {
      icon: <AlertTriangle className="h-5 w-5 text-orange-500" />,
      title: "Trust Your Instincts",
      description: "If something feels wrong, it probably is. Don't ignore your gut feeling."
    },
    {
      icon: <Shield className="h-5 w-5 text-blue-500" />,
      title: "Stay Aware",
      description: "Keep your head up, make eye contact, and be aware of your surroundings."
    },
    {
      icon: <Users className="h-5 w-5 text-green-500" />,
      title: "Walk with Confidence",
      description: "Project confidence through your posture and walk with purpose."
    },
    {
      icon: <Clock className="h-5 w-5 text-purple-500" />,
      title: "Plan Your Route",
      description: "Choose well-lit, populated routes and let someone know where you're going."
    },
    {
      icon: <AlertTriangle className="h-5 w-5 text-red-500" />,
      title: "Keep Your Phone Ready",
      description: "Have emergency contacts on speed dial and keep your phone easily accessible."
    },
    {
      icon: <Shield className="h-5 w-5 text-indigo-500" />,
      title: "Learn Basic Techniques",
      description: "Practice basic self-defense moves regularly to build muscle memory."
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Self-Defense Tutorials</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Learn essential self-defense techniques and safety tips designed specifically for women. 
          These tutorials will help you build confidence and stay safe in various situations.
        </p>
      </div>

      {/* Safety Tips Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Essential Safety Tips
          </CardTitle>
          <CardDescription>
            Remember these fundamental safety principles before practicing any techniques
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {safetyTips.map((tip, index) => (
              <div key={index} className="flex items-start gap-3 p-3 rounded-lg border bg-gray-50">
                {tip.icon}
                <div>
                  <h4 className="font-medium text-sm">{tip.title}</h4>
                  <p className="text-xs text-gray-600 mt-1">{tip.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tutorials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tutorials.map((tutorial) => (
          <Card key={tutorial.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative">
              <div className="aspect-video bg-gray-200 overflow-hidden">
                <img 
                  src={tutorial.thumbnail} 
                  alt={tutorial.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "https://via.placeholder.com/400x225/cccccc/666666?text=Video+Thumbnail";
                  }}
                />
                <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                  <Play className="h-12 w-12 text-white" />
                </div>
              </div>
              <Badge 
                variant={tutorial.difficulty === 'Beginner' ? 'default' : 'secondary'}
                className="absolute top-2 right-2"
              >
                {tutorial.difficulty}
              </Badge>
            </div>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{tutorial.title}</CardTitle>
              <CardDescription className="line-clamp-2">
                {tutorial.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {tutorial.duration}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {tutorial.instructor}
                  </span>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-1 mb-4">
                {tutorial.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>

              <Button 
                className="w-full" 
                onClick={() => window.open(tutorial.videoUrl, '_blank')}
              >
                <Play className="h-4 w-4 mr-2" />
                Watch Tutorial
                <ExternalLink className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Additional Resources */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Resources</CardTitle>
          <CardDescription>
            More resources to help you stay safe and build confidence
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Local Self-Defense Classes</h4>
              <p className="text-sm text-gray-600 mb-3">
                Consider taking in-person classes for hands-on practice and personalized instruction.
              </p>
              <Button variant="outline" size="sm">
                Find Classes Near You
              </Button>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Safety Apps</h4>
              <p className="text-sm text-gray-600 mb-3">
                Download safety apps that can help you in emergency situations.
              </p>
              <Button variant="outline" size="sm">
                Recommended Apps
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Disclaimer */}
      <Card className="border-orange-200 bg-orange-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-orange-800 mb-1">Important Disclaimer</h4>
              <p className="text-sm text-orange-700">
                These tutorials are for educational purposes only. Self-defense techniques should be practiced 
                under the supervision of qualified instructors. The best defense is often prevention and 
                avoiding dangerous situations when possible. Always prioritize your safety and consider 
                taking formal self-defense training for comprehensive protection.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
