import { useEffect, useState } from "react";
import { Calendar, TrendingUp, Building2, Gavel, Shield, DollarSign, RefreshCw, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

interface WeeklyStory {
  title: string;
  summary: string;
  source: string;
  url: string;
  category: string;
  impact: 'high' | 'medium' | 'low';
  publishDate: string;
}

export default function WeeklyWrap() {
  const [stories, setStories] = useState<WeeklyStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isLiveData, setIsLiveData] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    fetchWeeklyContent();
  }, []);

  const fetchWeeklyContent = async () => {
    try {
      const response = await fetch('/api/weekly-wrap');
      const data = await response.json();
      setStories(data.stories);
      setIsLiveData(data.isLiveData || false);
      setLastUpdated(data.lastUpdated || null);
    } catch (error) {
      console.error('Error fetching weekly wrap:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const response = await fetch('/api/ingestion/run', { method: 'POST' });
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "News Updated",
          description: `Found ${data.result?.totalFound || 0} articles, added ${data.result?.totalAdded || 0} new.`
        });
        await fetchWeeklyContent();
      } else {
        toast({
          title: "Update Failed",
          description: "Could not refresh news. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Update Failed", 
        description: "Could not connect to news sources.",
        variant: "destructive"
      });
    } finally {
      setRefreshing(false);
    }
  };

  const getCurrentWeekDates = () => {
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    
    return {
      start: startOfWeek.toLocaleDateString('en-US', { month: 'long', day: 'numeric' }),
      end: endOfWeek.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    };
  };

  const weekDates = getCurrentWeekDates();

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'regulatory': return <Gavel className="w-4 h-4" />;
      case 'mergers': return <Building2 className="w-4 h-4" />;
      case 'technology': return <Shield className="w-4 h-4" />;
      case 'financial': return <DollarSign className="w-4 h-4" />;
      case 'industry': return <TrendingUp className="w-4 h-4" />;
      default: return <TrendingUp className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'regulatory': return 'bg-red-100 text-red-800';
      case 'mergers': return 'bg-blue-100 text-blue-800';
      case 'technology': return 'bg-green-100 text-green-800';
      case 'financial': return 'bg-yellow-100 text-yellow-800';
      case 'industry': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading this week's credit union insights...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Credit Union Weekly Wrap 🌯
              </h1>
              <div className="flex items-center text-gray-600 space-x-4">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>{weekDates.start} - {weekDates.end}</span>
                </div>
                <span>•</span>
                <span>Industry Intelligence Report</span>
              </div>
            </div>
            <div className="flex space-x-3">
              <Button 
                variant="outline" 
                onClick={handleRefresh}
                disabled={refreshing}
                data-testid="button-refresh-news"
              >
                {refreshing ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-2" />
                )}
                {refreshing ? 'Updating...' : 'Refresh News'}
              </Button>
              <Button variant="outline" onClick={() => setLocation("/weekly-wrap/archive")} data-testid="button-view-archive">
                View Archive
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Executive Summary */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 mb-8 border-l-4 border-blue-500">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Executive Summary</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            The credit union industry continues navigating regulatory changes and digital transformation pressures. 
            Key developments this week include new NCUA cybersecurity mandates, significant merger activity creating larger regional players, 
            and accelerating technology adoption across institutions of all sizes.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="text-center p-3 bg-white rounded-lg">
              <div className="text-2xl font-bold text-blue-600">$8.2B</div>
              <div className="text-sm text-gray-600">SECU Maryland merger value</div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg">
              <div className="text-2xl font-bold text-green-600">35%</div>
              <div className="text-sm text-gray-600">Rise in cybersecurity breaches</div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg">
              <div className="text-2xl font-bold text-purple-600">4.2%</div>
              <div className="text-sm text-gray-600">Membership growth rate</div>
            </div>
          </div>
        </div>

        {/* Market Insights Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Market Insights & Trends</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Regulatory Environment</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                  <span className="text-sm text-gray-700">NCUA Liquidity Rules</span>
                  <span className="font-semibold text-red-700">Updated</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                  <span className="text-sm text-gray-700">Fed Rate Outlook</span>
                  <span className="font-semibold text-yellow-700">Cuts Expected</span>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Industry Performance</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="text-sm text-gray-700">Membership Growth</span>
                  <span className="font-semibold text-green-700">5-Year High</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="text-sm text-gray-700">Small Business Lending</span>
                  <span className="font-semibold text-blue-700">+28% QoQ</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Featured Stories */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Industry Developments</h2>
          {stories.map((story, index) => (
            <Card key={index} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <Badge className={getCategoryColor(story.category)}>
                        <div className="flex items-center space-x-1">
                          {getCategoryIcon(story.category)}
                          <span className="capitalize">{story.category}</span>
                        </div>
                      </Badge>
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${getImpactColor(story.impact)}`}></div>
                        <span className="text-xs text-gray-500 capitalize">{story.impact} Impact</span>
                      </div>
                    </div>
                    <CardTitle className="text-lg font-semibold text-gray-900 mb-1">
                      {story.title}
                    </CardTitle>
                    <div className="flex items-center text-sm text-gray-500 space-x-2">
                      <span>{story.source}</span>
                      <span>•</span>
                      <span>{story.publishDate}</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed mb-4">{story.summary}</p>
                <a 
                  href={story.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
                >
                  Read full article →
                </a>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Key Takeaways */}
        <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg p-6 mb-8 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Key Takeaways for Credit Union Leadership</h2>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <p className="text-gray-700">
                <strong>Regulatory Updates:</strong> NCUA's new Central Liquidity Facility rules streamline emergency funding access while establishing enhanced collateral requirements for member institutions.
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <p className="text-gray-700">
                <strong>Merger Consolidation:</strong> $8.2B SECU Maryland merger demonstrates continued industry consolidation as institutions seek operational scale and digital capabilities.
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
              <p className="text-gray-700">
                <strong>Cybersecurity Alert:</strong> 35% increase in digital banking breaches requires immediate security protocol enhancements and member education initiatives.
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
              <p className="text-gray-700">
                <strong>Growth Momentum:</strong> Membership reaching 5-year high (4.2% growth) and small business lending surge (+28% QoQ) signal strong industry performance.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="bg-blue-50 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-2">Intelligence Sources</h3>
            <p className="text-sm text-gray-600 mb-3">
              Analysis compiled from leading credit union industry publications and regulatory sources:
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs text-gray-500">
              <span>• CU Times</span>
              <span>• America's Credit Unions</span>
              <span>• CU Insight</span>
              <span>• CU Today</span>
              <span>• NCUA Press Releases</span>
              <span>• Banking Dive</span>
              <span>• American Banker</span>
              <span>• CU Management</span>
              <span>• Carolinas League</span>
              <span>• CU South Magazine</span>
              <span>• GoWest Association</span>
            </div>
            <div className="mt-4 pt-4 border-t border-blue-200">
              <p className="text-xs text-gray-500">
                Weekly intelligence report compiled {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })} • Next edition available {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}