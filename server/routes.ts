import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { searchService } from "./services/search-service";
import { aiService } from "./services/ai-service";
import { rssService } from "./services/rss-service";
import { schedulerService } from "./services/scheduler-service";
import { z } from "zod";

const searchRequestSchema = z.object({
  query: z.string().min(1),
  aiMode: z.boolean().optional().default(false),
  page: z.number().optional().default(1),
  limit: z.number().optional().default(10),
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Search suggestions endpoint
  app.get('/api/search/suggestions', async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query || query.length < 2) {
        return res.json([]);
      }

      const suggestions = await searchService.getSuggestions(query);
      res.json(suggestions);
    } catch (error) {
      console.error('Search suggestions error:', error);
      res.status(500).json({ error: 'Failed to get suggestions' });
    }
  });

  // Main search endpoint
  app.post('/api/search', async (req, res) => {
    try {
      const validatedData = searchRequestSchema.parse(req.body);
      const { query, aiMode, page, limit } = validatedData;

      const startTime = Date.now();

      // Store search query
      const searchQuery = await storage.createSearchQuery({
        query,
        enhancedQuery: query, // Will be updated if AI enhancement is used
        resultCount: 0,
        searchTime: 0,
      });

      let enhancedQuery = query;
      let aiAnswer = '';
      let sources: string[] = [];

      // AI enhancement if requested
      if (aiMode) {
        enhancedQuery = await aiService.enhanceQuery(query);
        await storage.createSearchQuery({
          ...searchQuery,
          enhancedQuery,
        });
      }

      // Perform search
      const searchResults = await searchService.search(enhancedQuery, { page, limit });

      // Generate AI answer if in AI mode
      if (aiMode && searchResults.results.length > 0) {
        const topResults = searchResults.results.slice(0, 3);
        aiAnswer = await aiService.generateAnswer(query, topResults);
        sources = topResults.map(r => r.domain);
      }

      // Store results
      for (const result of searchResults.results) {
        await storage.createSearchResult({
          queryId: searchQuery.id,
          title: result.title,
          snippet: result.snippet,
          url: result.url,
          domain: result.domain,
          publishDate: result.publishDate,
          relevanceScore: result.relevanceScore,
          source: result.source,
          contentType: result.contentType,
          aiEnhanced: result.aiEnhanced,
        });
      }

      const endTime = Date.now();
      const searchTime = (endTime - startTime) / 1000;

      // Update search query with final stats
      await storage.createSearchQuery({
        ...searchQuery,
        enhancedQuery,
        resultCount: searchResults.results.length,
        searchTime: Math.round(searchTime * 1000), // Store in milliseconds
      });

      res.json({
        results: searchResults.results,
        totalCount: searchResults.totalCount,
        searchTime: searchTime.toFixed(2),
        aiAnswer: aiAnswer || undefined,
        sources: sources.length > 0 ? sources : undefined,
      });

    } catch (error) {
      console.error('Search error:', error);
      res.status(500).json({ error: 'Search failed' });
    }
  });

  // Weekly wrap content endpoint
  app.get('/api/weekly-wrap', async (req, res) => {
    try {
      const weeklyContent = await searchService.getWeeklyWrapContent();
      res.json(weeklyContent);
    } catch (error) {
      console.error('Weekly wrap error:', error);
      res.status(500).json({ error: 'Failed to get weekly wrap content' });
    }
  });

  // Weekly wrap archive endpoint
  app.get('/api/weekly-wrap/archive', async (req, res) => {
    try {
      const archiveContent = await searchService.getWeeklyWrapArchive();
      res.json(archiveContent);
    } catch (error) {
      console.error('Weekly wrap archive error:', error);
      res.status(500).json({ error: 'Failed to get archive content' });
    }
  });

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'ok', 
      services: {
        bing: searchService.isHealthy(),
        ai: aiService.isHealthy(),
      },
      timestamp: new Date().toISOString()
    });
  });

  // News ingestion endpoints
  app.post('/api/ingestion/run', async (req, res) => {
    try {
      console.log('[API] Manual ingestion triggered');
      const result = await schedulerService.runIngestion();
      res.json({ 
        success: true, 
        result,
        message: 'News ingestion completed successfully'
      });
    } catch (error) {
      console.error('Ingestion error:', error);
      res.status(500).json({ error: 'Failed to run news ingestion' });
    }
  });

  app.get('/api/ingestion/status', async (req, res) => {
    try {
      const status = schedulerService.getStatus();
      const logs = await storage.getLatestIngestionLogs(10);
      const sources = rssService.getConfiguredSources();
      res.json({ 
        scheduler: status,
        recentLogs: logs,
        configuredSources: sources
      });
    } catch (error) {
      console.error('Ingestion status error:', error);
      res.status(500).json({ error: 'Failed to get ingestion status' });
    }
  });

  app.get('/api/articles', async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const source = req.query.source as string;
      const query = req.query.q as string;

      let articles;
      if (query) {
        articles = await storage.searchArticles(query);
      } else if (source) {
        articles = await storage.getArticlesBySource(source);
      } else {
        articles = await storage.getRecentArticles(limit);
      }

      res.json({ articles, count: articles.length });
    } catch (error) {
      console.error('Articles error:', error);
      res.status(500).json({ error: 'Failed to get articles' });
    }
  });

  // Start the scheduler
  schedulerService.start();

  const httpServer = createServer(app);
  return httpServer;
}
