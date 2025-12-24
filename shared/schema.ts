import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const articles = pgTable("articles", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  snippet: text("snippet").notNull(),
  content: text("content"),
  url: text("url").notNull().unique(),
  urlHash: text("url_hash").notNull(),
  source: text("source").notNull(),
  sourceUrl: text("source_url").notNull(),
  author: text("author"),
  category: text("category"),
  publishDate: timestamp("publish_date"),
  fetchedAt: timestamp("fetched_at").defaultNow(),
  isActive: boolean("is_active").default(true),
});

export const ingestionLogs = pgTable("ingestion_logs", {
  id: serial("id").primaryKey(),
  source: text("source").notNull(),
  articlesFound: integer("articles_found").default(0),
  articlesAdded: integer("articles_added").default(0),
  status: text("status").notNull(),
  errorMessage: text("error_message"),
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const searchQueries = pgTable("search_queries", {
  id: serial("id").primaryKey(),
  query: text("query").notNull(),
  enhancedQuery: text("enhanced_query"),
  resultCount: integer("result_count").default(0),
  searchTime: integer("search_time").default(0), // in milliseconds
  timestamp: timestamp("timestamp").defaultNow(),
});

export const searchResults = pgTable("search_results", {
  id: serial("id").primaryKey(),
  queryId: integer("query_id").references(() => searchQueries.id),
  title: text("title").notNull(),
  snippet: text("snippet").notNull(),
  url: text("url").notNull(),
  domain: text("domain").notNull(),
  publishDate: text("publish_date"),
  relevanceScore: integer("relevance_score").default(0), // 0-100
  source: text("source").notNull(), // 'bing', 'wikipedia', 'reddit', etc.
  contentType: text("content_type").default("web"), // 'web', 'code', 'discussion'
  aiEnhanced: boolean("ai_enhanced").default(false),
});

export const cachedContent = pgTable("cached_content", {
  id: serial("id").primaryKey(),
  url: text("url").notNull().unique(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  domain: text("domain").notNull(),
  lastCrawled: timestamp("last_crawled").defaultNow(),
  wordCount: integer("word_count").default(0),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertSearchQuerySchema = createInsertSchema(searchQueries).pick({
  query: true,
  enhancedQuery: true,
  resultCount: true,
  searchTime: true,
});

export const insertSearchResultSchema = createInsertSchema(searchResults).omit({
  id: true,
});

export const insertCachedContentSchema = createInsertSchema(cachedContent).omit({
  id: true,
  lastCrawled: true,
});

export const insertArticleSchema = createInsertSchema(articles).omit({
  id: true,
  fetchedAt: true,
});

export const insertIngestionLogSchema = createInsertSchema(ingestionLogs).omit({
  id: true,
  startedAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type SearchQuery = typeof searchQueries.$inferSelect;
export type SearchResult = typeof searchResults.$inferSelect;
export type CachedContent = typeof cachedContent.$inferSelect;
export type Article = typeof articles.$inferSelect;
export type IngestionLog = typeof ingestionLogs.$inferSelect;
export type InsertSearchQuery = z.infer<typeof insertSearchQuerySchema>;
export type InsertSearchResult = z.infer<typeof insertSearchResultSchema>;
export type InsertCachedContent = z.infer<typeof insertCachedContentSchema>;
export type InsertArticle = z.infer<typeof insertArticleSchema>;
export type InsertIngestionLog = z.infer<typeof insertIngestionLogSchema>;

// Amazon Wrapped types (in-memory, not persisted to DB)
export const amazonOrderSchema = z.object({
  orderDate: z.string(),
  orderId: z.string(),
  title: z.string(),
  category: z.string().optional(),
  price: z.number(),
  quantity: z.number().default(1),
});

export const amazonWrappedInputSchema = z.object({
  orders: z.array(amazonOrderSchema),
  year: z.number().default(2024),
});

export type AmazonOrder = z.infer<typeof amazonOrderSchema>;
export type AmazonWrappedInput = z.infer<typeof amazonWrappedInputSchema>;

export interface AmazonWrappedStats {
  year: number;
  totalSpent: number;
  totalOrders: number;
  totalItems: number;
  avgOrderValue: number;
  busiestMonth: string;
  busiestMonthOrders: number;
  topCategories: Array<{ category: string; count: number; spent: number }>;
  topItems: Array<{ title: string; count: number; spent: number }>;
  monthlySpending: Array<{ month: string; amount: number; orders: number }>;
  shoppingPersonality: string;
  funFacts: string[];
  ordersByDayOfWeek: Array<{ day: string; count: number }>;
  avgItemsPerOrder: number;
  biggestOrder: { date: string; amount: number; items: number };
  lateNightOrders: number;
}
