import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Eye, Heart, MessageCircle, Share2, Calendar, Clock, Award, Target, BarChart3, PieChart as PieChartIcon, Plus, Instagram, Facebook, Twitter } from 'lucide-react';
import { format } from 'date-fns';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface SocialMediaPost {
  id: number;
  miniGameDesignId: number;
  platform: string;
  postUrl?: string;
  scheduledDate: string;
  publishedDate?: string;
  dayOfWeek: string;
  timeSlot: string;
  postType: string;
  caption?: string;
  hashtags: string[];
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface SocialMediaAnalytics {
  id: number;
  postId: number;
  impressions: number;
  reach: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  clicks: number;
  profileViews: number;
  engagementRate: number;
  recordedAt: string;
  createdAt: string;
  updatedAt: string;
}

interface MiniGameBlock {
  id: number;
  name: string;
  category: string;
  color: string;
  frequency: string;
  frequencyValue: number;
}

interface MiniGameDesign {
  id: number;
  miniGameBlockId: number;
  title: string;
  description: string;
  status: string;
}

interface PerformanceInsight {
  miniGameBlock: string;
  platform: string;
  dayOfWeek: string;
  timeSlot: string;
  postType: string;
  avgImpressions: number;
  avgReach: number;
  avgLikes: number;
  avgComments: number;
  avgShares: number;
  avgEngagementRate: number;
  totalPosts: number;
}

interface SocialMediaAnalyticsProps {
  miniGameBlocks: MiniGameBlock[];
  miniGameDesigns: MiniGameDesign[];
}

export default function SocialMediaAnalytics({ miniGameBlocks, miniGameDesigns }: SocialMediaAnalyticsProps) {
  const [showAddPostDialog, setShowAddPostDialog] = useState(false);
  const [showAddAnalyticsDialog, setShowAddAnalyticsDialog] = useState(false);
  const [selectedPost, setSelectedPost] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const { toast } = useToast();

  // Fetch real data from API
  const { data: posts = [], isLoading: postsLoading } = useQuery({
    queryKey: ['/api/social-media-posts'],
    select: (data: any[]) => data || []
  });

  const { data: analytics = [], isLoading: analyticsLoading } = useQuery({
    queryKey: ['/api/social-media-analytics'],
    select: (data: any[]) => data || []
  });

  // Mutations for creating posts and analytics
  const createPostMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/social-media-posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to create post');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/social-media-posts'] });
      setShowAddPostDialog(false);
      setNewPost({
        miniGameDesignId: '',
        platform: '',
        postUrl: '',
        scheduledDate: '',
        publishedDate: '',
        dayOfWeek: '',
        timeSlot: '',
        postType: '',
        caption: '',
        hashtags: '',
        status: 'scheduled'
      });
      toast({ title: "Post created successfully!" });
    },
    onError: () => {
      toast({ title: "Failed to create post", variant: "destructive" });
    }
  });

  const createAnalyticsMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/social-media-analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to create analytics');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/social-media-analytics'] });
      setShowAddAnalyticsDialog(false);
      setNewAnalytics({
        postId: '',
        impressions: '',
        reach: '',
        likes: '',
        comments: '',
        shares: '',
        saves: '',
        clicks: '',
        profileViews: '',
        engagementRate: ''
      });
      toast({ title: "Analytics added successfully!" });
    },
    onError: () => {
      toast({ title: "Failed to add analytics", variant: "destructive" });
    }
  });

  // Form states
  const [newPost, setNewPost] = useState({
    miniGameDesignId: '',
    platform: '',
    postUrl: '',
    scheduledDate: '',
    publishedDate: '',
    dayOfWeek: '',
    timeSlot: '',
    postType: '',
    caption: '',
    hashtags: '',
    status: 'scheduled'
  });

  const [newAnalytics, setNewAnalytics] = useState({
    postId: '',
    impressions: '',
    reach: '',
    likes: '',
    comments: '',
    shares: '',
    saves: '',
    clicks: '',
    profileViews: '',
    engagementRate: ''
  });

  const platforms = [
    { value: 'instagram', label: 'Instagram', icon: Instagram, color: '#E4405F' },
    { value: 'facebook', label: 'Facebook', icon: Facebook, color: '#1877F2' },
    { value: 'twitter', label: 'Twitter', icon: Twitter, color: '#1DA1F2' },
    { value: 'tiktok', label: 'TikTok', icon: null, color: '#000000' },
    { value: 'linkedin', label: 'LinkedIn', icon: null, color: '#0A66C2' }
  ];

  const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const timeSlots = ['morning', 'afternoon', 'evening'];
  const postTypes = ['image', 'video', 'carousel', 'reel', 'story'];

  const getPlatformIcon = (platform: string) => {
    const platformData = platforms.find(p => p.value === platform);
    return platformData?.icon ? <platformData.icon className="w-4 h-4" /> : platform;
  };

  const getPlatformColor = (platform: string) => {
    return platforms.find(p => p.value === platform)?.color || '#6B7280';
  };

  const getEngagementRate = (analytics: SocialMediaAnalytics) => {
    if (analytics.impressions === 0) return 0;
    return ((analytics.likes + analytics.comments + analytics.shares) / analytics.impressions * 100);
  };

  const calculatePerformanceInsights = (): PerformanceInsight[] => {
    const insights: Record<string, {
      totalImpressions: number;
      totalReach: number;
      totalLikes: number;
      totalComments: number;
      totalShares: number;
      totalEngagement: number;
      postCount: number;
    }> = {};

    posts.forEach(post => {
      const postAnalytics = analytics.filter(a => a.postId === post.id);
      if (postAnalytics.length === 0) return;

      const latestAnalytics = postAnalytics[postAnalytics.length - 1];
      const miniGame = miniGameBlocks.find(mg => 
        miniGameDesigns.find(d => d.id === post.miniGameDesignId)?.miniGameBlockId === mg.id
      );

      if (!miniGame) return;

      const key = `${miniGame.name}-${post.platform}-${post.dayOfWeek}-${post.timeSlot}-${post.postType}`;

      if (!insights[key]) {
        insights[key] = {
          totalImpressions: 0,
          totalReach: 0,
          totalLikes: 0,
          totalComments: 0,
          totalShares: 0,
          totalEngagement: 0,
          postCount: 0
        };
      }

      insights[key].totalImpressions += latestAnalytics.impressions;
      insights[key].totalReach += latestAnalytics.reach;
      insights[key].totalLikes += latestAnalytics.likes;
      insights[key].totalComments += latestAnalytics.comments;
      insights[key].totalShares += latestAnalytics.shares;
      insights[key].totalEngagement += latestAnalytics.likes + latestAnalytics.comments + latestAnalytics.shares;
      insights[key].postCount += 1;
    });

    return Object.entries(insights).map(([key, data]) => {
      const [miniGameBlock, platform, dayOfWeek, timeSlot, postType] = key.split('-');
      return {
        miniGameBlock,
        platform,
        dayOfWeek,
        timeSlot,
        postType,
        avgImpressions: Math.round(data.totalImpressions / data.postCount),
        avgReach: Math.round(data.totalReach / data.postCount),
        avgLikes: Math.round(data.totalLikes / data.postCount),
        avgComments: Math.round(data.totalComments / data.postCount),
        avgShares: Math.round(data.totalShares / data.postCount),
        avgEngagementRate: data.totalImpressions > 0 ? Math.round((data.totalEngagement / data.totalImpressions) * 100 * 100) / 100 : 0,
        totalPosts: data.postCount
      };
    }).sort((a, b) => b.avgEngagementRate - a.avgEngagementRate);
  };

  const getDayOfWeekPerformance = () => {
    const dayData: Record<string, { impressions: number; engagement: number; posts: number }> = {};
    
    daysOfWeek.forEach(day => {
      dayData[day] = { impressions: 0, engagement: 0, posts: 0 };
    });

    posts.forEach(post => {
      const postAnalytics = analytics.filter(a => a.postId === post.id);
      if (postAnalytics.length === 0) return;

      const latestAnalytics = postAnalytics[postAnalytics.length - 1];
      dayData[post.dayOfWeek].impressions += latestAnalytics.impressions;
      dayData[post.dayOfWeek].engagement += latestAnalytics.likes + latestAnalytics.comments + latestAnalytics.shares;
      dayData[post.dayOfWeek].posts += 1;
    });

    return daysOfWeek.map(day => ({
      day: day.charAt(0).toUpperCase() + day.slice(1),
      avgImpressions: dayData[day].posts > 0 ? Math.round(dayData[day].impressions / dayData[day].posts) : 0,
      avgEngagement: dayData[day].posts > 0 ? Math.round(dayData[day].engagement / dayData[day].posts) : 0,
      posts: dayData[day].posts
    }));
  };

  const getMiniGamePerformance = () => {
    const gameData: Record<string, { impressions: number; engagement: number; posts: number }> = {};
    
    miniGameBlocks.forEach(game => {
      gameData[game.name] = { impressions: 0, engagement: 0, posts: 0 };
    });

    posts.forEach(post => {
      const design = miniGameDesigns.find(d => d.id === post.miniGameDesignId);
      if (!design) return;
      
      const miniGame = miniGameBlocks.find(mg => mg.id === design.miniGameBlockId);
      if (!miniGame) return;

      const postAnalytics = analytics.filter(a => a.postId === post.id);
      if (postAnalytics.length === 0) return;

      const latestAnalytics = postAnalytics[postAnalytics.length - 1];
      gameData[miniGame.name].impressions += latestAnalytics.impressions;
      gameData[miniGame.name].engagement += latestAnalytics.likes + latestAnalytics.comments + latestAnalytics.shares;
      gameData[miniGame.name].posts += 1;
    });

    return Object.entries(gameData).map(([name, data]) => ({
      name,
      avgImpressions: data.posts > 0 ? Math.round(data.impressions / data.posts) : 0,
      avgEngagement: data.posts > 0 ? Math.round(data.engagement / data.posts) : 0,
      posts: data.posts
    })).filter(item => item.posts > 0);
  };

  const handleAddPost = () => {
    const postData = {
      miniGameDesignId: parseInt(newPost.miniGameDesignId),
      platform: newPost.platform,
      postUrl: newPost.postUrl || undefined,
      scheduledDate: newPost.scheduledDate,
      publishedDate: newPost.publishedDate || undefined,
      dayOfWeek: newPost.dayOfWeek,
      timeSlot: newPost.timeSlot,
      postType: newPost.postType,
      caption: newPost.caption || undefined,
      hashtags: newPost.hashtags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag),
      status: newPost.status
    };

    createPostMutation.mutate(postData);
  };

  const handleAddAnalytics = () => {
    const analyticsData = {
      postId: parseInt(newAnalytics.postId),
      impressions: parseInt(newAnalytics.impressions) || 0,
      reach: parseInt(newAnalytics.reach) || 0,
      likes: parseInt(newAnalytics.likes) || 0,
      comments: parseInt(newAnalytics.comments) || 0,
      shares: parseInt(newAnalytics.shares) || 0,
      saves: parseInt(newAnalytics.saves) || 0,
      clicks: parseInt(newAnalytics.clicks) || 0,
      profileViews: parseInt(newAnalytics.profileViews) || 0,
      engagementRate: parseFloat(newAnalytics.engagementRate) || 0
    };

    createAnalyticsMutation.mutate(analyticsData);
  };

  const dayOfWeekData = getDayOfWeekPerformance();
  const miniGameData = getMiniGamePerformance();
  const performanceInsights = calculatePerformanceInsights();

  if (postsLoading || analyticsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-2"></div>
          <p className="text-gray-600">Loading social media data...</p>
        </div>
      </div>
    );
  }

  const COLORS = ['#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#3B82F6', '#F97316', '#EF4444'];

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Social Media Analytics
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Track post performance across mini-game styles and posting schedules
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showAddPostDialog} onOpenChange={setShowAddPostDialog}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                <Plus className="w-4 h-4 mr-2" />
                Add Post
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Add Social Media Post</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="design">Mini Game Design</Label>
                  <Select value={newPost.miniGameDesignId} onValueChange={(value) => setNewPost({...newPost, miniGameDesignId: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select design" />
                    </SelectTrigger>
                    <SelectContent>
                      {miniGameDesigns.map(design => (
                        <SelectItem key={design.id} value={design.id.toString()}>
                          {design.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="platform">Platform</Label>
                  <Select value={newPost.platform} onValueChange={(value) => setNewPost({...newPost, platform: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select platform" />
                    </SelectTrigger>
                    <SelectContent>
                      {platforms.map(platform => (
                        <SelectItem key={platform.value} value={platform.value}>
                          {platform.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="dayOfWeek">Day of Week</Label>
                  <Select value={newPost.dayOfWeek} onValueChange={(value) => setNewPost({...newPost, dayOfWeek: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select day" />
                    </SelectTrigger>
                    <SelectContent>
                      {daysOfWeek.map(day => (
                        <SelectItem key={day} value={day}>
                          {day.charAt(0).toUpperCase() + day.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="timeSlot">Time Slot</Label>
                  <Select value={newPost.timeSlot} onValueChange={(value) => setNewPost({...newPost, timeSlot: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map(time => (
                        <SelectItem key={time} value={time}>
                          {time.charAt(0).toUpperCase() + time.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="postType">Post Type</Label>
                  <Select value={newPost.postType} onValueChange={(value) => setNewPost({...newPost, postType: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {postTypes.map(type => (
                        <SelectItem key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="scheduledDate">Scheduled Date</Label>
                  <Input
                    type="datetime-local"
                    value={newPost.scheduledDate}
                    onChange={(e) => setNewPost({...newPost, scheduledDate: e.target.value})}
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="postUrl">Post URL</Label>
                  <Input
                    placeholder="https://..."
                    value={newPost.postUrl}
                    onChange={(e) => setNewPost({...newPost, postUrl: e.target.value})}
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="hashtags">Hashtags (comma separated)</Label>
                  <Input
                    placeholder="#minigame, #content, #design"
                    value={newPost.hashtags}
                    onChange={(e) => setNewPost({...newPost, hashtags: e.target.value})}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setShowAddPostDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddPost}>
                  Add Post
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={showAddAnalyticsDialog} onOpenChange={setShowAddAnalyticsDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <BarChart3 className="w-4 h-4 mr-2" />
                Add Analytics
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add Analytics Data</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="postId">Select Post</Label>
                  <Select value={newAnalytics.postId} onValueChange={(value) => setNewAnalytics({...newAnalytics, postId: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select post" />
                    </SelectTrigger>
                    <SelectContent>
                      {posts.map(post => {
                        const design = miniGameDesigns.find(d => d.id === post.miniGameDesignId);
                        return (
                          <SelectItem key={post.id} value={post.id.toString()}>
                            {design?.title} - {post.platform} ({format(new Date(post.scheduledDate), 'MMM d')})
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="impressions">Impressions</Label>
                  <Input
                    type="number"
                    value={newAnalytics.impressions}
                    onChange={(e) => setNewAnalytics({...newAnalytics, impressions: e.target.value})}
                  />
                </div>

                <div>
                  <Label htmlFor="reach">Reach</Label>
                  <Input
                    type="number"
                    value={newAnalytics.reach}
                    onChange={(e) => setNewAnalytics({...newAnalytics, reach: e.target.value})}
                  />
                </div>

                <div>
                  <Label htmlFor="likes">Likes</Label>
                  <Input
                    type="number"
                    value={newAnalytics.likes}
                    onChange={(e) => setNewAnalytics({...newAnalytics, likes: e.target.value})}
                  />
                </div>

                <div>
                  <Label htmlFor="comments">Comments</Label>
                  <Input
                    type="number"
                    value={newAnalytics.comments}
                    onChange={(e) => setNewAnalytics({...newAnalytics, comments: e.target.value})}
                  />
                </div>

                <div>
                  <Label htmlFor="shares">Shares</Label>
                  <Input
                    type="number"
                    value={newAnalytics.shares}
                    onChange={(e) => setNewAnalytics({...newAnalytics, shares: e.target.value})}
                  />
                </div>

                <div>
                  <Label htmlFor="saves">Saves</Label>
                  <Input
                    type="number"
                    value={newAnalytics.saves}
                    onChange={(e) => setNewAnalytics({...newAnalytics, saves: e.target.value})}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setShowAddAnalyticsDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddAnalytics}>
                  Add Analytics
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="posts">Posts</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Total Posts</p>
                    <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{posts.length}</p>
                  </div>
                  <Calendar className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20 border-pink-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-pink-600 dark:text-pink-400">Total Impressions</p>
                    <p className="text-2xl font-bold text-pink-900 dark:text-pink-100">
                      {analytics.reduce((sum, a) => sum + a.impressions, 0).toLocaleString()}
                    </p>
                  </div>
                  <Eye className="h-8 w-8 text-pink-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Engagement</p>
                    <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                      {analytics.reduce((sum, a) => sum + a.likes + a.comments + a.shares, 0).toLocaleString()}
                    </p>
                  </div>
                  <Heart className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600 dark:text-green-400">Avg Engagement Rate</p>
                    <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                      {analytics.length > 0 ? (analytics.reduce((sum, a) => sum + getEngagementRate(a), 0) / analytics.length).toFixed(1) : 0}%
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2 text-purple-500" />
                  Performance by Day of Week
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dayOfWeekData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="avgImpressions" fill="#8B5CF6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PieChartIcon className="w-5 h-5 mr-2 text-pink-500" />
                  Mini-Game Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={miniGameData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({name, value}) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="avgImpressions"
                    >
                      {miniGameData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Day of Week Performance Analysis</CardTitle>
              <p className="text-sm text-gray-600">Compare average performance across different days</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dayOfWeekData.map((day, index) => (
                  <div key={day.day} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                        {day.day.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-semibold">{day.day}</h4>
                        <p className="text-sm text-gray-600">{day.posts} posts</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{day.avgImpressions.toLocaleString()} avg impressions</p>
                      <p className="text-sm text-gray-600">{day.avgEngagement} avg engagement</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Award className="w-5 h-5 mr-2 text-yellow-500" />
                Top Performing Combinations
              </CardTitle>
              <p className="text-sm text-gray-600">Best performing mini-game styles, platforms, and scheduling combinations</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {performanceInsights.slice(0, 5).map((insight, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-200">
                    <div className="flex items-center space-x-4">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-semibold">{insight.miniGameBlock}</h4>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <span>{getPlatformIcon(insight.platform)}</span>
                          <span>•</span>
                          <span>{insight.dayOfWeek}</span>
                          <span>•</span>
                          <span>{insight.timeSlot}</span>
                          <span>•</span>
                          <span>{insight.postType}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-lg">{insight.avgEngagementRate}%</p>
                      <p className="text-sm text-gray-600">{insight.avgImpressions.toLocaleString()} avg impressions</p>
                      <p className="text-xs text-gray-500">{insight.totalPosts} posts</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="posts" className="space-y-6">
          <div className="grid gap-4">
            {posts.map(post => {
              const design = miniGameDesigns.find(d => d.id === post.miniGameDesignId);
              const miniGame = miniGameBlocks.find(mg => mg.id === design?.miniGameBlockId);
              const postAnalytics = analytics.filter(a => a.postId === post.id);
              const latestAnalytics = postAnalytics[postAnalytics.length - 1];

              return (
                <Card key={post.id} className="bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge variant="secondary" style={{ backgroundColor: getPlatformColor(post.platform), color: 'white' }}>
                            {getPlatformIcon(post.platform)} {post.platform}
                          </Badge>
                          <Badge variant="outline">{post.postType}</Badge>
                          <Badge variant="outline">{post.dayOfWeek}</Badge>
                          <Badge variant="outline">{post.timeSlot}</Badge>
                        </div>
                        <h4 className="font-semibold text-lg">{design?.title}</h4>
                        <p className="text-sm text-gray-600 mb-2">{miniGame?.name}</p>
                        <p className="text-sm text-gray-500">
                          Scheduled: {format(new Date(post.scheduledDate), 'MMM d, yyyy HH:mm')}
                        </p>
                        {post.hashtags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {post.hashtags.map((tag: string, index: number) => (
                              <span key={index} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      {latestAnalytics && (
                        <div className="text-right space-y-1">
                          <div className="flex items-center space-x-4 text-sm">
                            <div className="flex items-center space-x-1">
                              <Eye className="w-4 h-4 text-gray-500" />
                              <span>{latestAnalytics.impressions.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Heart className="w-4 h-4 text-red-500" />
                              <span>{latestAnalytics.likes}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <MessageCircle className="w-4 h-4 text-blue-500" />
                              <span>{latestAnalytics.comments}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Share2 className="w-4 h-4 text-green-500" />
                              <span>{latestAnalytics.shares}</span>
                            </div>
                          </div>
                          <p className="text-lg font-bold text-purple-600">
                            {getEngagementRate(latestAnalytics).toFixed(1)}% engagement
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}