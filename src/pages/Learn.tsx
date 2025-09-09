import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  BookOpen, 
  Play, 
  Target, 
  Award, 
  Clock, 
  Users, 
  TrendingUp,
  BarChart3,
  Calculator,
  Lightbulb,
  CheckCircle,
  ArrowRight,
  Download
} from 'lucide-react';

const Learn = () => {
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Simulate loading delay
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  const courses = [
    {
      id: 'basics',
      title: 'Stock Market Basics',
      description: 'Learn the fundamentals of stock market investing',
      duration: '2 hours',
      difficulty: 'Beginner',
      progress: 0,
      lessons: 8,
      icon: BookOpen,
      color: 'from-finance-primary to-finance-accent'
    },
    {
      id: 'technical',
      title: 'Technical Analysis',
      description: 'Master chart patterns, indicators, and technical tools',
      duration: '4 hours',
      difficulty: 'Intermediate',
      progress: 25,
      lessons: 12,
      icon: BarChart3,
      color: 'from-finance-success to-emerald-400'
    },
    {
      id: 'fundamental',
      title: 'Fundamental Analysis',
      description: 'Analyze company financials and valuation metrics',
      duration: '3 hours',
      difficulty: 'Intermediate',
      progress: 0,
      lessons: 10,
      icon: Calculator,
      color: 'from-finance-warning to-orange-400'
    },
    {
      id: 'advanced',
      title: 'Advanced Strategies',
      description: 'Options trading, portfolio management, and risk control',
      duration: '6 hours',
      difficulty: 'Advanced',
      progress: 0,
      lessons: 15,
      icon: TrendingUp,
      color: 'from-finance-danger to-pink-400'
    }
  ];

  const lessons = [
    {
      id: '1',
      title: 'What is the Stock Market?',
      duration: '15 min',
      type: 'video',
      completed: false
    },
    {
      id: '2',
      title: 'How to Read Stock Quotes',
      duration: '20 min',
      type: 'interactive',
      completed: false
    },
    {
      id: '3',
      title: 'Understanding Market Orders',
      duration: '25 min',
      type: 'video',
      completed: false
    },
    {
      id: '4',
      title: 'Risk vs. Reward',
      duration: '30 min',
      type: 'quiz',
      completed: false
    }
  ];

  const achievements = [
    { name: 'First Steps', description: 'Complete your first lesson', icon: Award, earned: true },
    { name: 'Quick Learner', description: 'Complete 5 lessons in a day', icon: Clock, earned: false },
    { name: 'Technical Expert', description: 'Master all technical analysis lessons', icon: BarChart3, earned: false },
    { name: 'Portfolio Master', description: 'Complete portfolio management course', icon: Target, earned: false }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        {/* Hero Section Skeleton */}
        <section className="relative overflow-hidden">
          <div className="container-responsive py-12 sm:py-16">
            <div className="text-center space-y-6">
              <div className="flex justify-center mb-6">
                <Skeleton className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl" />
              </div>
              <Skeleton className="h-8 w-64 mx-auto" />
              <Skeleton className="h-4 w-96 mx-auto" />
              
              {/* Stats Skeleton */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto mt-8">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="text-center space-y-2">
                    <Skeleton className="h-8 w-8 mx-auto" />
                    <Skeleton className="h-4 w-16 mx-auto" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Courses Section Skeleton */}
        <section className="py-12 sm:py-16">
          <div className="container-responsive">
            <div className="text-center mb-12">
              <Skeleton className="h-8 w-48 mx-auto mb-4" />
              <Skeleton className="h-4 w-96 mx-auto" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="card-glass">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <Skeleton className="w-12 h-12 rounded-xl" />
                        <div className="space-y-2">
                          <Skeleton className="h-5 w-32" />
                          <Skeleton className="h-4 w-48" />
                        </div>
                      </div>
                      <Skeleton className="h-5 w-16" />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-8" />
                    </div>
                    <Skeleton className="h-2 w-full" />
                    <div className="flex items-center justify-between">
                      <div className="flex space-x-4">
                        <Skeleton className="h-4 w-12" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                      <Skeleton className="h-8 w-20" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Achievements Skeleton */}
        <section className="py-12 sm:py-16">
          <div className="container-responsive">
            <div className="text-center mb-12">
              <Skeleton className="h-8 w-32 mx-auto mb-4" />
              <Skeleton className="h-4 w-64 mx-auto" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="card-glass">
                  <CardContent className="p-6 text-center space-y-4">
                    <Skeleton className="w-12 h-12 mx-auto rounded-xl" />
                    <Skeleton className="h-5 w-24 mx-auto" />
                    <Skeleton className="h-4 w-32 mx-auto" />
                    <Skeleton className="h-5 w-16 mx-auto" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-finance-primary/5 via-transparent to-finance-accent/5" />
        <div className="container-responsive py-12 sm:py-16">
          <div className="text-center space-y-6">
            <div className="flex justify-center mb-6">
              <div className="flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-finance-primary to-finance-accent rounded-2xl shadow-lg">
                <BookOpen className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
              </div>
            </div>
            
            <h1 className="text-responsive-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-finance-primary via-finance-accent to-finance-secondary">
              StockViz Learning Center
            </h1>
            
            <p className="max-w-3xl mx-auto text-responsive text-muted-foreground leading-relaxed">
              Build your trading knowledge with comprehensive courses, interactive lessons, and real-world examples. 
              From beginner basics to advanced strategies.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto mt-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">4</div>
                <div className="text-sm text-muted-foreground">Courses</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">45</div>
                <div className="text-sm text-muted-foreground">Lessons</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">15+</div>
                <div className="text-sm text-muted-foreground">Hours</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Courses Section */}
      <section className="py-12 sm:py-16">
        <div className="container-responsive">
          <div className="text-center mb-12">
            <h2 className="text-responsive-lg font-bold text-foreground mb-4">
              Learning Path
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Follow our structured learning path designed to take you from beginner to advanced trader
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {courses.map((course, index) => {
              const Icon = course.icon;
              return (
                <Card 
                  key={course.id} 
                  className="card-glass hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer group"
                  onClick={() => setSelectedCourse(course.id)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`flex items-center justify-center w-12 h-12 bg-gradient-to-br ${course.color} rounded-xl group-hover:scale-110 transition-transform duration-300`}>
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{course.title}</CardTitle>
                          <CardDescription className="text-sm">{course.description}</CardDescription>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {course.difficulty}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>Progress</span>
                      <span>{course.progress}%</span>
                    </div>
                    <Progress value={course.progress} className="h-2" />
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">{course.duration}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <BookOpen className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">{course.lessons} lessons</span>
                        </div>
                      </div>
                      
                      <Button size="sm" variant="outline" className="group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        {course.progress > 0 ? 'Continue' : 'Start'}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Course Details */}
      {selectedCourse && (
        <section className="py-12 sm:py-16 bg-muted/30">
          <div className="container-responsive">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">
                    {courses.find(c => c.id === selectedCourse)?.title}
                  </h2>
                  <p className="text-muted-foreground">
                    {courses.find(c => c.id === selectedCourse)?.description}
                  </p>
                </div>
                <Button variant="outline" onClick={() => setSelectedCourse(null)}>
                  Back to Courses
                </Button>
              </div>

              <Tabs defaultValue="lessons" className="space-y-6">
                <TabsList>
                  <TabsTrigger value="lessons">Lessons</TabsTrigger>
                  <TabsTrigger value="resources">Resources</TabsTrigger>
                  <TabsTrigger value="progress">Progress</TabsTrigger>
                </TabsList>

                <TabsContent value="lessons" className="space-y-4">
                  <Card className="card-glass">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        {lessons.map((lesson, index) => (
                          <div key={lesson.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center justify-center w-10 h-10 bg-muted rounded-lg">
                                {lesson.completed ? (
                                  <CheckCircle className="h-5 w-5 text-finance-success" />
                                ) : (
                                  <Play className="h-5 w-5 text-muted-foreground" />
                                )}
                              </div>
                              <div>
                                <div className="font-medium text-foreground">{lesson.title}</div>
                                <div className="text-sm text-muted-foreground">{lesson.duration} • {lesson.type}</div>
                              </div>
                            </div>
                            <Button size="sm" variant="outline">
                              {lesson.completed ? 'Review' : 'Start'}
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="resources" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="card-glass">
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <BookOpen className="h-5 w-5" />
                          <span>Study Materials</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {[
                          'Stock Market Glossary',
                          'Technical Analysis Cheat Sheet',
                          'Risk Management Guide',
                          'Portfolio Planning Template'
                        ].map((resource, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                            <span className="text-sm font-medium">{resource}</span>
                            <Button size="sm" variant="ghost">
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    <Card className="card-glass">
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <Users className="h-5 w-5" />
                          <span>Community</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {[
                          'Discussion Forum',
                          'Study Groups',
                          'Expert Q&A',
                          'Trading Challenges'
                        ].map((item, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                            <span className="text-sm font-medium">{item}</span>
                            <Button size="sm" variant="ghost">
                              <ArrowRight className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="progress" className="space-y-4">
                  <Card className="card-glass">
                    <CardHeader>
                      <CardTitle>Your Progress</CardTitle>
                      <CardDescription>Track your learning journey</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-foreground">0/8</div>
                          <div className="text-sm text-muted-foreground">Lessons Completed</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-foreground">0%</div>
                          <div className="text-sm text-muted-foreground">Course Progress</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-foreground">0</div>
                          <div className="text-sm text-muted-foreground">Achievements</div>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Overall Progress</span>
                          <span className="text-sm text-muted-foreground">0%</span>
                        </div>
                        <Progress value={0} className="h-3" />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </section>
      )}

      {/* Achievements */}
      <section className="py-12 sm:py-16">
        <div className="container-responsive">
          <div className="text-center mb-12">
            <h2 className="text-responsive-lg font-bold text-foreground mb-4">
              Achievements
            </h2>
            <p className="text-muted-foreground">
              Unlock achievements as you progress through your learning journey
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {achievements.map((achievement, index) => {
              const Icon = achievement.icon;
              return (
                <Card key={index} className={`card-glass transition-all duration-300 ${
                  achievement.earned ? 'ring-2 ring-finance-success' : 'opacity-60'
                }`}>
                  <CardContent className="p-6 text-center">
                    <div className={`flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-xl ${
                      achievement.earned 
                        ? 'bg-gradient-to-br from-finance-success to-emerald-400' 
                        : 'bg-muted'
                    }`}>
                      <Icon className={`h-6 w-6 ${
                        achievement.earned ? 'text-white' : 'text-muted-foreground'
                      }`} />
                    </div>
                    
                    <h3 className="font-semibold mb-2">{achievement.name}</h3>
                    <p className="text-sm text-muted-foreground">{achievement.description}</p>
                    
                    {achievement.earned && (
                      <Badge className="mt-3 bg-finance-success text-white">
                        Earned
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Tips and Insights */}
      <section className="py-12 sm:py-16 bg-muted/30">
        <div className="container-responsive">
          <div className="text-center mb-12">
            <h2 className="text-responsive-lg font-bold text-foreground mb-4">
              Pro Tips & Insights
            </h2>
            <p className="text-muted-foreground">
              Expert advice to accelerate your learning
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "Start Small",
                description: "Begin with paper trading to practice without risk",
                icon: Target
              },
              {
                title: "Diversify",
                description: "Spread your investments across different sectors",
                icon: TrendingUp
              },
              {
                title: "Stay Informed",
                description: "Keep up with market news and company updates",
                icon: Lightbulb
              }
            ].map((tip, index) => {
              const Icon = tip.icon;
              return (
                <Card key={index} className="card-glass hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-finance-primary to-finance-accent rounded-xl">
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-center mb-2">{tip.title}</h3>
                    <p className="text-sm text-muted-foreground text-center">{tip.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Learn; 