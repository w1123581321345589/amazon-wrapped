import { 
  users, 
  searchQueries, 
  searchResults, 
  cachedContent,
  articles,
  ingestionLogs,
  type User, 
  type InsertUser,
  type SearchQuery,
  type SearchResult,
  type CachedContent,
  type Article,
  type IngestionLog,
  type InsertSearchQuery,
  type InsertSearchResult,
  type InsertCachedContent,
  type InsertArticle,
  type InsertIngestionLog
} from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Search query operations
  createSearchQuery(query: InsertSearchQuery): Promise<SearchQuery>;
  getSearchQuery(id: number): Promise<SearchQuery | undefined>;
  
  // Search results operations
  createSearchResult(result: InsertSearchResult): Promise<SearchResult>;
  getSearchResults(queryId: number): Promise<SearchResult[]>;
  
  // Cached content operations
  getCachedContent(url: string): Promise<CachedContent | undefined>;
  createCachedContent(content: InsertCachedContent): Promise<CachedContent>;
  updateCachedContent(url: string, content: Partial<CachedContent>): Promise<CachedContent | undefined>;
  searchCachedContent(query: string): Promise<CachedContent[]>;

  // Article operations
  createArticle(article: InsertArticle): Promise<Article>;
  getArticleByUrl(url: string): Promise<Article | undefined>;
  getArticlesBySource(source: string): Promise<Article[]>;
  getRecentArticles(limit?: number): Promise<Article[]>;
  getArticlesByDateRange(startDate: Date, endDate: Date): Promise<Article[]>;
  searchArticles(query: string): Promise<Article[]>;

  // Ingestion log operations
  createIngestionLog(log: InsertIngestionLog): Promise<IngestionLog>;
  updateIngestionLog(id: number, updates: Partial<IngestionLog>): Promise<IngestionLog | undefined>;
  getLatestIngestionLogs(limit?: number): Promise<IngestionLog[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private searchQueries: Map<number, SearchQuery>;
  private searchResults: Map<number, SearchResult>;
  private cachedContent: Map<string, CachedContent>;
  private articles: Map<string, Article>;
  private ingestionLogs: Map<number, IngestionLog>;
  private currentUserId: number;
  private currentQueryId: number;
  private currentResultId: number;
  private currentContentId: number;
  private currentArticleId: number;
  private currentLogId: number;

  constructor() {
    this.users = new Map();
    this.searchQueries = new Map();
    this.searchResults = new Map();
    this.cachedContent = new Map();
    this.articles = new Map();
    this.ingestionLogs = new Map();
    this.currentUserId = 1;
    this.currentQueryId = 1;
    this.currentResultId = 1;
    this.currentContentId = 1;
    this.currentArticleId = 1;
    this.currentLogId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createSearchQuery(insertQuery: InsertSearchQuery): Promise<SearchQuery> {
    const id = this.currentQueryId++;
    const query: SearchQuery = {
      ...insertQuery,
      id,
      timestamp: new Date(),
    };
    this.searchQueries.set(id, query);
    return query;
  }

  async getSearchQuery(id: number): Promise<SearchQuery | undefined> {
    return this.searchQueries.get(id);
  }

  async createSearchResult(insertResult: InsertSearchResult): Promise<SearchResult> {
    const id = this.currentResultId++;
    const result: SearchResult = { ...insertResult, id };
    this.searchResults.set(id, result);
    return result;
  }

  async getSearchResults(queryId: number): Promise<SearchResult[]> {
    return Array.from(this.searchResults.values()).filter(
      (result) => result.queryId === queryId
    );
  }

  async getCachedContent(url: string): Promise<CachedContent | undefined> {
    return this.cachedContent.get(url);
  }

  async createCachedContent(insertContent: InsertCachedContent): Promise<CachedContent> {
    const id = this.currentContentId++;
    const content: CachedContent = {
      ...insertContent,
      id,
      lastCrawled: new Date(),
    };
    this.cachedContent.set(insertContent.url, content);
    return content;
  }

  async updateCachedContent(url: string, updateData: Partial<CachedContent>): Promise<CachedContent | undefined> {
    const existing = this.cachedContent.get(url);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updateData, lastCrawled: new Date() };
    this.cachedContent.set(url, updated);
    return updated;
  }

  async searchCachedContent(query: string): Promise<CachedContent[]> {
    const searchTerms = query.toLowerCase().split(' ');
    return Array.from(this.cachedContent.values()).filter(content => {
      const searchableText = `${content.title} ${content.content}`.toLowerCase();
      return searchTerms.some(term => searchableText.includes(term));
    });
  }

  async createArticle(insertArticle: InsertArticle): Promise<Article> {
    const existing = this.articles.get(insertArticle.url);
    if (existing) return existing;
    
    const id = this.currentArticleId++;
    const article: Article = {
      ...insertArticle,
      id,
      fetchedAt: new Date(),
      publishDate: insertArticle.publishDate || null,
      content: insertArticle.content || null,
      author: insertArticle.author || null,
      category: insertArticle.category || null,
      isActive: insertArticle.isActive ?? true,
    };
    this.articles.set(insertArticle.url, article);
    return article;
  }

  async getArticleByUrl(url: string): Promise<Article | undefined> {
    return this.articles.get(url);
  }

  async getArticlesBySource(source: string): Promise<Article[]> {
    return Array.from(this.articles.values()).filter(
      article => article.source === source && article.isActive
    );
  }

  async getRecentArticles(limit: number = 50): Promise<Article[]> {
    return Array.from(this.articles.values())
      .filter(article => article.isActive)
      .sort((a, b) => {
        const dateA = a.publishDate || a.fetchedAt;
        const dateB = b.publishDate || b.fetchedAt;
        return (dateB?.getTime() || 0) - (dateA?.getTime() || 0);
      })
      .slice(0, limit);
  }

  async getArticlesByDateRange(startDate: Date, endDate: Date): Promise<Article[]> {
    return Array.from(this.articles.values()).filter(article => {
      const articleDate = article.publishDate || article.fetchedAt;
      if (!articleDate) return false;
      return articleDate >= startDate && articleDate <= endDate;
    });
  }

  async searchArticles(query: string): Promise<Article[]> {
    const searchTerms = query.toLowerCase().split(' ');
    return Array.from(this.articles.values())
      .filter(article => {
        if (!article.isActive) return false;
        const searchableText = `${article.title} ${article.snippet} ${article.content || ''}`.toLowerCase();
        return searchTerms.some(term => searchableText.includes(term));
      })
      .sort((a, b) => {
        const dateA = a.publishDate || a.fetchedAt;
        const dateB = b.publishDate || b.fetchedAt;
        return (dateB?.getTime() || 0) - (dateA?.getTime() || 0);
      });
  }

  async createIngestionLog(insertLog: InsertIngestionLog): Promise<IngestionLog> {
    const id = this.currentLogId++;
    const log: IngestionLog = {
      ...insertLog,
      id,
      startedAt: new Date(),
      articlesFound: insertLog.articlesFound ?? 0,
      articlesAdded: insertLog.articlesAdded ?? 0,
      errorMessage: insertLog.errorMessage || null,
      completedAt: insertLog.completedAt || null,
    };
    this.ingestionLogs.set(id, log);
    return log;
  }

  async updateIngestionLog(id: number, updates: Partial<IngestionLog>): Promise<IngestionLog | undefined> {
    const existing = this.ingestionLogs.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updates };
    this.ingestionLogs.set(id, updated);
    return updated;
  }

  async getLatestIngestionLogs(limit: number = 20): Promise<IngestionLog[]> {
    return Array.from(this.ingestionLogs.values())
      .sort((a, b) => (b.startedAt?.getTime() || 0) - (a.startedAt?.getTime() || 0))
      .slice(0, limit);
  }
}

export const storage = new MemStorage();
