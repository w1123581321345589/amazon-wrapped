import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Package, DollarSign, ShoppingCart, Calendar, TrendingUp, 
  ChevronLeft, ChevronRight, Upload, Sparkles, Moon, 
  Gift, Star, BarChart3, Clock, ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import type { AmazonWrappedStats, AmazonOrder } from "@shared/schema";

const SAMPLE_DATA: AmazonOrder[] = [
  { orderDate: "2024-01-15", orderId: "111-1234567-1234567", title: "Wireless Earbuds", category: "Electronics", price: 79.99, quantity: 1 },
  { orderDate: "2024-01-22", orderId: "111-2234567-1234567", title: "Python Programming Book", category: "Books", price: 34.99, quantity: 1 },
  { orderDate: "2024-02-03", orderId: "111-3234567-1234567", title: "Yoga Mat", category: "Sports", price: 29.99, quantity: 1 },
  { orderDate: "2024-02-14", orderId: "111-4234567-1234567", title: "Valentine's Day Chocolates", category: "Grocery", price: 24.99, quantity: 2 },
  { orderDate: "2024-03-01", orderId: "111-5234567-1234567", title: "Standing Desk", category: "Home & Office", price: 349.99, quantity: 1 },
  { orderDate: "2024-03-15", orderId: "111-6234567-1234567", title: "Mechanical Keyboard", category: "Electronics", price: 149.99, quantity: 1 },
  { orderDate: "2024-04-20", orderId: "111-7234567-1234567", title: "Plant Pots Set", category: "Garden", price: 45.99, quantity: 3 },
  { orderDate: "2024-05-10", orderId: "111-8234567-1234567", title: "Running Shoes", category: "Sports", price: 129.99, quantity: 1 },
  { orderDate: "2024-06-01", orderId: "111-9234567-1234567", title: "Summer T-Shirts Pack", category: "Clothing", price: 59.99, quantity: 4 },
  { orderDate: "2024-06-15", orderId: "111-1034567-1234567", title: "Portable Charger", category: "Electronics", price: 39.99, quantity: 2 },
  { orderDate: "2024-07-04", orderId: "111-1134567-1234567", title: "BBQ Grill Set", category: "Home & Kitchen", price: 199.99, quantity: 1 },
  { orderDate: "2024-07-20", orderId: "111-1234567-2234567", title: "Camping Tent", category: "Sports", price: 179.99, quantity: 1 },
  { orderDate: "2024-08-05", orderId: "111-1334567-1234567", title: "Noise Canceling Headphones", category: "Electronics", price: 299.99, quantity: 1 },
  { orderDate: "2024-08-25", orderId: "111-1434567-1234567", title: "Coffee Maker", category: "Home & Kitchen", price: 89.99, quantity: 1 },
  { orderDate: "2024-09-10", orderId: "111-1534567-1234567", title: "Fall Jacket", category: "Clothing", price: 119.99, quantity: 1 },
  { orderDate: "2024-10-31", orderId: "111-1634567-1234567", title: "Halloween Decorations", category: "Home", price: 49.99, quantity: 5 },
  { orderDate: "2024-11-25", orderId: "111-1734567-1234567", title: "Black Friday TV Deal", category: "Electronics", price: 599.99, quantity: 1 },
  { orderDate: "2024-11-26", orderId: "111-1834567-1234567", title: "Smart Watch", category: "Electronics", price: 249.99, quantity: 1 },
  { orderDate: "2024-11-27", orderId: "111-1934567-1234567", title: "Winter Boots", category: "Clothing", price: 89.99, quantity: 2 },
  { orderDate: "2024-12-01", orderId: "111-2034567-1234567", title: "Christmas Tree", category: "Home", price: 149.99, quantity: 1 },
  { orderDate: "2024-12-15", orderId: "111-2134567-1234567", title: "Gift Wrapping Paper", category: "Home", price: 19.99, quantity: 10 },
  { orderDate: "2024-12-18", orderId: "111-2234567-1234567", title: "Board Games Collection", category: "Toys", price: 79.99, quantity: 3 },
];

function calculateStats(orders: AmazonOrder[]): AmazonWrappedStats {
  const year = 2024;
  const totalSpent = orders.reduce((sum, o) => sum + o.price * o.quantity, 0);
  const totalItems = orders.reduce((sum, o) => sum + o.quantity, 0);
  const totalOrders = orders.length;
  const avgOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;
  const avgItemsPerOrder = totalOrders > 0 ? totalItems / totalOrders : 0;

  const monthlyData: { [key: string]: { amount: number; orders: number } } = {};
  const categoryData: { [key: string]: { count: number; spent: number } } = {};
  const itemData: { [key: string]: { count: number; spent: number } } = {};
  const dayOfWeekData: { [key: string]: number } = {
    Sunday: 0, Monday: 0, Tuesday: 0, Wednesday: 0, Thursday: 0, Friday: 0, Saturday: 0
  };

  const months = ["January", "February", "March", "April", "May", "June", 
                  "July", "August", "September", "October", "November", "December"];
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  months.forEach(m => { monthlyData[m] = { amount: 0, orders: 0 }; });

  let biggestOrder = { date: "", amount: 0, items: 0 };
  let lateNightOrders = 0;

  orders.forEach(order => {
    const date = new Date(order.orderDate);
    const month = months[date.getMonth()];
    const day = days[date.getDay()];
    const orderTotal = order.price * order.quantity;

    monthlyData[month].amount += orderTotal;
    monthlyData[month].orders += 1;

    const cat = order.category || "Other";
    if (!categoryData[cat]) categoryData[cat] = { count: 0, spent: 0 };
    categoryData[cat].count += order.quantity;
    categoryData[cat].spent += orderTotal;

    if (!itemData[order.title]) itemData[order.title] = { count: 0, spent: 0 };
    itemData[order.title].count += order.quantity;
    itemData[order.title].spent += orderTotal;

    dayOfWeekData[day] += 1;

    if (orderTotal > biggestOrder.amount) {
      biggestOrder = { date: order.orderDate, amount: orderTotal, items: order.quantity };
    }

    const hour = date.getHours();
    if (hour >= 22 || hour <= 5) lateNightOrders++;
  });

  const monthlySpending = months.map(month => ({
    month: month.slice(0, 3),
    amount: Math.round(monthlyData[month].amount * 100) / 100,
    orders: monthlyData[month].orders
  }));

  const busiestMonthEntry = Object.entries(monthlyData).reduce(
    (max, [month, data]) => data.orders > max.orders ? { month, orders: data.orders } : max,
    { month: "January", orders: 0 }
  );

  const topCategories = Object.entries(categoryData)
    .map(([category, data]) => ({ category, ...data }))
    .sort((a, b) => b.spent - a.spent)
    .slice(0, 5);

  const topItems = Object.entries(itemData)
    .map(([title, data]) => ({ title, ...data }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const ordersByDayOfWeek = Object.entries(dayOfWeekData)
    .map(([day, count]) => ({ day, count }));

  let shoppingPersonality = "Balanced Shopper";
  if (topCategories[0]?.category === "Electronics") shoppingPersonality = "Tech Enthusiast";
  else if (topCategories[0]?.category === "Books") shoppingPersonality = "Bookworm";
  else if (topCategories[0]?.category === "Clothing") shoppingPersonality = "Fashionista";
  else if (topCategories[0]?.category === "Home & Kitchen") shoppingPersonality = "Home Chef";
  else if (topCategories[0]?.category === "Sports") shoppingPersonality = "Fitness Fanatic";
  else if (topCategories[0]?.category === "Grocery") shoppingPersonality = "Pantry Pro";

  const funFacts: string[] = [];
  if (lateNightOrders > 3) funFacts.push(`You placed ${lateNightOrders} late-night orders. Midnight shopping spree much?`);
  if (busiestMonthEntry.month === "November") funFacts.push("Black Friday got you! November was your peak shopping month.");
  if (busiestMonthEntry.month === "December") funFacts.push("Holiday spirit! December was your biggest shopping month.");
  if (avgItemsPerOrder > 2) funFacts.push(`With ${avgItemsPerOrder.toFixed(1)} items per order, you're a bulk buyer!`);
  if (topCategories.length > 0) funFacts.push(`${topCategories[0].category} was clearly your thing this year.`);
  funFacts.push(`Your biggest single order was $${biggestOrder.amount.toFixed(2)} on ${new Date(biggestOrder.date).toLocaleDateString()}`);

  return {
    year,
    totalSpent: Math.round(totalSpent * 100) / 100,
    totalOrders,
    totalItems,
    avgOrderValue: Math.round(avgOrderValue * 100) / 100,
    busiestMonth: busiestMonthEntry.month,
    busiestMonthOrders: busiestMonthEntry.orders,
    topCategories,
    topItems,
    monthlySpending,
    shoppingPersonality,
    funFacts,
    ordersByDayOfWeek,
    avgItemsPerOrder: Math.round(avgItemsPerOrder * 100) / 100,
    biggestOrder,
    lateNightOrders
  };
}

const gradients = [
  "from-orange-500 via-amber-500 to-yellow-500",
  "from-purple-600 via-pink-500 to-rose-500",
  "from-blue-600 via-cyan-500 to-teal-500",
  "from-emerald-500 via-green-500 to-lime-500",
  "from-rose-500 via-red-500 to-orange-500",
  "from-indigo-600 via-purple-500 to-pink-500",
  "from-amber-500 via-orange-500 to-red-500",
  "from-teal-500 via-cyan-500 to-blue-500",
];

interface SlideProps {
  stats: AmazonWrappedStats;
}

function IntroSlide({ stats }: SlideProps) {
  return (
    <div className="text-center space-y-8">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", delay: 0.2 }}
      >
        <Sparkles className="w-24 h-24 mx-auto text-yellow-300 mb-4" />
      </motion.div>
      <motion.h1 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-5xl md:text-7xl font-bold text-white"
      >
        Your {stats.year}
      </motion.h1>
      <motion.h2
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-3xl md:text-5xl font-bold text-yellow-300"
      >
        Amazon Wrapped
      </motion.h2>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="text-xl text-white/80"
      >
        Let's see what you shopped for this year...
      </motion.p>
    </div>
  );
}

function TotalSpentSlide({ stats }: SlideProps) {
  return (
    <div className="text-center space-y-8">
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", delay: 0.2 }}
      >
        <DollarSign className="w-20 h-20 mx-auto text-green-300" />
      </motion.div>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-2xl text-white/90"
      >
        This year, you spent
      </motion.p>
      <motion.h1
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", delay: 0.5 }}
        className="text-6xl md:text-8xl font-bold text-white"
      >
        ${stats.totalSpent.toLocaleString()}
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="text-xl text-white/80"
      >
        on Amazon
      </motion.p>
    </div>
  );
}

function OrdersSlide({ stats }: SlideProps) {
  return (
    <div className="text-center space-y-8">
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Package className="w-20 h-20 mx-auto text-blue-300" />
      </motion.div>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-2xl text-white/90"
      >
        You placed
      </motion.p>
      <motion.h1
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", delay: 0.4 }}
        className="text-7xl md:text-9xl font-bold text-white"
      >
        {stats.totalOrders}
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-2xl text-white/90"
      >
        orders containing <span className="text-yellow-300 font-bold">{stats.totalItems}</span> items
      </motion.p>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="text-lg text-white/70"
      >
        That's about ${stats.avgOrderValue.toFixed(2)} per order!
      </motion.p>
    </div>
  );
}

function BusiestMonthSlide({ stats }: SlideProps) {
  return (
    <div className="text-center space-y-8">
      <motion.div
        initial={{ rotate: -45, opacity: 0 }}
        animate={{ rotate: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Calendar className="w-20 h-20 mx-auto text-pink-300" />
      </motion.div>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-2xl text-white/90"
      >
        Your busiest shopping month was
      </motion.p>
      <motion.h1
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ type: "spring", delay: 0.4 }}
        className="text-5xl md:text-7xl font-bold text-white"
      >
        {stats.busiestMonth}
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-xl text-white/80"
      >
        with <span className="text-yellow-300 font-bold">{stats.busiestMonthOrders}</span> orders
      </motion.p>
    </div>
  );
}

function TopCategoriesSlide({ stats }: SlideProps) {
  return (
    <div className="space-y-6">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center"
      >
        <ShoppingCart className="w-16 h-16 mx-auto text-teal-300 mb-4" />
        <h2 className="text-3xl font-bold text-white mb-2">Your Top Categories</h2>
      </motion.div>
      <div className="space-y-4 max-w-md mx-auto">
        {stats.topCategories.slice(0, 5).map((cat, index) => (
          <motion.div
            key={cat.category}
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 + index * 0.15 }}
            className="flex items-center gap-4 bg-white/10 rounded-xl p-4"
          >
            <span className="text-3xl font-bold text-yellow-300">#{index + 1}</span>
            <div className="flex-1">
              <p className="text-lg font-semibold text-white">{cat.category}</p>
              <p className="text-sm text-white/70">{cat.count} items · ${cat.spent.toFixed(2)}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function TopItemsSlide({ stats }: SlideProps) {
  return (
    <div className="space-y-6">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center"
      >
        <Star className="w-16 h-16 mx-auto text-yellow-300 mb-4" />
        <h2 className="text-3xl font-bold text-white mb-2">Most Purchased Items</h2>
      </motion.div>
      <div className="space-y-3 max-w-md mx-auto">
        {stats.topItems.slice(0, 5).map((item, index) => (
          <motion.div
            key={item.title}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 + index * 0.1 }}
            className="bg-white/10 rounded-xl p-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white font-bold">
                {index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium truncate">{item.title}</p>
                <p className="text-white/70 text-sm">Bought {item.count}x · ${item.spent.toFixed(2)}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function PersonalitySlide({ stats }: SlideProps) {
  return (
    <div className="text-center space-y-8">
      <motion.div
        initial={{ scale: 0, rotate: 180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", delay: 0.2 }}
      >
        <Gift className="w-24 h-24 mx-auto text-purple-300" />
      </motion.div>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-2xl text-white/90"
      >
        Based on your shopping habits...
      </motion.p>
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <p className="text-xl text-white/80 mb-2">You are a</p>
        <h1 className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-pink-300 to-purple-300">
          {stats.shoppingPersonality}
        </h1>
      </motion.div>
    </div>
  );
}

function MonthlyChartSlide({ stats }: SlideProps) {
  const maxAmount = Math.max(...stats.monthlySpending.map(m => m.amount), 1);
  
  return (
    <div className="space-y-6">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center"
      >
        <BarChart3 className="w-16 h-16 mx-auto text-cyan-300 mb-4" />
        <h2 className="text-3xl font-bold text-white mb-2">Monthly Spending</h2>
      </motion.div>
      <div className="flex items-end justify-center gap-1 md:gap-2 h-48 px-2">
        {stats.monthlySpending.map((month, index) => {
          const heightPercent = maxAmount > 0 ? (month.amount / maxAmount) * 100 : 0;
          return (
            <motion.div
              key={month.month}
              initial={{ height: 0 }}
              animate={{ height: `${heightPercent}%` }}
              transition={{ delay: 0.1 + index * 0.05, duration: 0.5 }}
              className="flex flex-col items-center"
            >
              <div 
                className="w-5 md:w-8 bg-gradient-to-t from-cyan-500 to-teal-300 rounded-t-md min-h-[4px]"
                style={{ height: "100%" }}
              />
              <p className="text-xs text-white/70 mt-1">{month.month}</p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function FunFactsSlide({ stats }: SlideProps) {
  return (
    <div className="space-y-6">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center"
      >
        <Sparkles className="w-16 h-16 mx-auto text-yellow-300 mb-4" />
        <h2 className="text-3xl font-bold text-white mb-2">Fun Facts</h2>
      </motion.div>
      <div className="space-y-4 max-w-md mx-auto">
        {stats.funFacts.slice(0, 4).map((fact, index) => (
          <motion.div
            key={index}
            initial={{ x: index % 2 === 0 ? -50 : 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 + index * 0.2 }}
            className="bg-white/10 backdrop-blur-sm rounded-xl p-4"
          >
            <p className="text-white text-lg">{fact}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function SummarySlide({ stats }: SlideProps) {
  return (
    <div className="text-center space-y-6">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring" }}
      >
        <Package className="w-20 h-20 mx-auto text-orange-300 mb-4" />
      </motion.div>
      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-4xl md:text-5xl font-bold text-white"
      >
        Your {stats.year} Wrapped
      </motion.h1>
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-2 gap-4 max-w-sm mx-auto"
      >
        <div className="bg-white/10 rounded-xl p-4">
          <p className="text-3xl font-bold text-yellow-300">${stats.totalSpent.toLocaleString()}</p>
          <p className="text-sm text-white/70">Total Spent</p>
        </div>
        <div className="bg-white/10 rounded-xl p-4">
          <p className="text-3xl font-bold text-blue-300">{stats.totalOrders}</p>
          <p className="text-sm text-white/70">Orders</p>
        </div>
        <div className="bg-white/10 rounded-xl p-4">
          <p className="text-3xl font-bold text-green-300">{stats.totalItems}</p>
          <p className="text-sm text-white/70">Items</p>
        </div>
        <div className="bg-white/10 rounded-xl p-4">
          <p className="text-3xl font-bold text-pink-300">{stats.busiestMonth.slice(0, 3)}</p>
          <p className="text-sm text-white/70">Peak Month</p>
        </div>
      </motion.div>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-xl text-white/80 mt-6"
      >
        Thanks for shopping with Amazon! 📦
      </motion.p>
    </div>
  );
}

const slides = [
  IntroSlide,
  TotalSpentSlide,
  OrdersSlide,
  BusiestMonthSlide,
  TopCategoriesSlide,
  TopItemsSlide,
  PersonalitySlide,
  MonthlyChartSlide,
  FunFactsSlide,
  SummarySlide,
];

export default function AmazonWrapped() {
  const [showWrapped, setShowWrapped] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [stats, setStats] = useState<AmazonWrappedStats | null>(null);
  const [orderText, setOrderText] = useState("");
  const { toast } = useToast();

  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };

  const detectAndParseAmazonExport = (lines: string[]): AmazonOrder[] | null => {
    if (lines.length < 2) return null;
    
    const headerLine = lines[0].toLowerCase();
    const headers = parseCSVLine(headerLine);
    
    const dateIdx = headers.findIndex(h => h.includes('order date') || h.includes('date'));
    const orderIdIdx = headers.findIndex(h => h.includes('order id') || h.includes('order number'));
    const titleIdx = headers.findIndex(h => h.includes('title') || h.includes('product name') || h.includes('item') || h.includes('description'));
    const categoryIdx = headers.findIndex(h => h.includes('category'));
    const priceIdx = headers.findIndex(h => h.includes('total') || h.includes('price') || h.includes('amount'));
    const quantityIdx = headers.findIndex(h => h.includes('quantity') || h.includes('qty'));

    if (dateIdx === -1 && titleIdx === -1 && priceIdx === -1) {
      return null;
    }

    const orders: AmazonOrder[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const parts = parseCSVLine(lines[i]);
      if (parts.length < 3) continue;

      let priceStr = priceIdx >= 0 ? parts[priceIdx] : "";
      priceStr = priceStr.replace(/[$£€,]/g, "").trim();
      const price = parseFloat(priceStr);
      
      if (!isFinite(price) || price <= 0) continue;

      const quantityStr = quantityIdx >= 0 ? parts[quantityIdx] : "1";
      const quantity = parseInt(quantityStr) || 1;

      orders.push({
        orderDate: dateIdx >= 0 ? parts[dateIdx] : new Date().toISOString().split("T")[0],
        orderId: orderIdIdx >= 0 ? parts[orderIdIdx] : `order-${Math.random().toString(36).slice(2)}`,
        title: titleIdx >= 0 ? parts[titleIdx] : "Unknown Item",
        category: categoryIdx >= 0 ? parts[categoryIdx] : "Other",
        price,
        quantity: quantity > 0 ? quantity : 1,
      });
    }

    return orders.length > 0 ? orders : null;
  };

  const parseOrderData = (text: string): AmazonOrder[] | null => {
    try {
      const lines = text.trim().split("\n").filter(l => l.trim());
      if (lines.length === 0) return null;

      const amazonOrders = detectAndParseAmazonExport(lines);
      if (amazonOrders && amazonOrders.length > 0) {
        toast({
          title: "Amazon export detected",
          description: `Found ${amazonOrders.length} orders from your Amazon data.`,
        });
        return amazonOrders;
      }

      const orders: AmazonOrder[] = [];
      let validOrders = 0;
      let invalidOrders = 0;
      
      for (const line of lines) {
        const parts = parseCSVLine(line);
        if (parts.length >= 3) {
          let priceStr = parts[4] || "";
          priceStr = priceStr.replace(/[$£€,]/g, "").trim();
          const price = parseFloat(priceStr);
          const quantity = parseInt(parts[5]);
          
          if (!isFinite(price) || price <= 0) {
            invalidOrders++;
            continue;
          }
          
          orders.push({
            orderDate: parts[0] || new Date().toISOString().split("T")[0],
            orderId: parts[1] || `order-${Math.random().toString(36).slice(2)}`,
            title: parts[2] || "Unknown Item",
            category: parts[3] || "Other",
            price: price,
            quantity: isFinite(quantity) && quantity > 0 ? quantity : 1,
          });
          validOrders++;
        }
      }
      
      if (invalidOrders > 0 && validOrders > 0) {
        toast({
          title: "Some orders skipped",
          description: `Skipped ${invalidOrders} orders with invalid prices.`,
        });
      }
      
      return orders.length > 0 ? orders : null;
    } catch {
      return null;
    }
  };

  const handleStartWrapped = (useSample: boolean) => {
    let orders: AmazonOrder[] | null = null;
    
    if (useSample) {
      orders = SAMPLE_DATA;
    } else {
      orders = parseOrderData(orderText);
      if (!orders) {
        toast({
          title: "Invalid Data",
          description: "Could not parse your order data. Using sample data instead.",
          variant: "destructive"
        });
        orders = SAMPLE_DATA;
      }
    }

    const calculatedStats = calculateStats(orders);
    setStats(calculatedStats);
    setShowWrapped(true);
    setCurrentSlide(0);
  };

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(prev => prev + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(prev => prev - 1);
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "ArrowRight") nextSlide();
    if (e.key === "ArrowLeft") prevSlide();
  };

  useEffect(() => {
    if (showWrapped) {
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [showWrapped, currentSlide]);

  if (showWrapped && stats) {
    const CurrentSlideComponent = slides[currentSlide];
    const gradientClass = gradients[currentSlide % gradients.length];

    return (
      <div className={`min-h-screen bg-gradient-to-br ${gradientClass} flex flex-col`}>
        <div className="flex-1 flex items-center justify-center p-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-2xl"
            >
              <CurrentSlideComponent stats={stats} />
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="p-4 flex items-center justify-between bg-black/20 backdrop-blur-sm">
          <Button
            variant="ghost"
            size="lg"
            onClick={prevSlide}
            disabled={currentSlide === 0}
            className="text-white hover:bg-white/20"
            data-testid="button-prev-slide"
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
          
          <div className="flex gap-2">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === currentSlide ? "bg-white w-6" : "bg-white/40"
                }`}
                data-testid={`button-slide-indicator-${idx}`}
              />
            ))}
          </div>
          
          <Button
            variant="ghost"
            size="lg"
            onClick={nextSlide}
            disabled={currentSlide === slides.length - 1}
            className="text-white hover:bg-white/20"
            data-testid="button-next-slide"
          >
            <ChevronRight className="w-6 h-6" />
          </Button>
        </div>

        <Button
          variant="ghost"
          className="absolute top-4 right-4 text-white hover:bg-white/20"
          onClick={() => setShowWrapped(false)}
          data-testid="button-exit-wrapped"
        >
          Exit
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-500">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Package className="w-12 h-12 text-white" />
            <h1 className="text-5xl font-bold text-white">Amazon Wrapped</h1>
          </div>
          <p className="text-xl text-white/90">
            Discover your {new Date().getFullYear()} shopping story
          </p>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-white/95 backdrop-blur-sm shadow-2xl">
            <CardContent className="p-8">
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Get Your Wrapped</h2>
                  <p className="text-gray-600">
                    Paste your Amazon order data or use our sample data to see your personalized shopping summary.
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                  <h3 className="font-semibold text-blue-900 mb-2">How to get your Amazon data:</h3>
                  <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                    <li>Go to <span className="font-medium">amazon.com/gp/privacycentral</span></li>
                    <li>Click "Request Your Data" → Select "Your Orders"</li>
                    <li>Wait for the email with your download link (24-48 hours)</li>
                    <li>Open the CSV file and paste its contents below</li>
                  </ol>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Paste Your Amazon Order Export
                    </label>
                    <Textarea
                      placeholder="Order Date,Order ID,Title,Category,Total,Quantity&#10;2024-01-15,111-1234567-1234567,Wireless Earbuds,Electronics,$79.99,1&#10;2024-02-20,111-2345678-2345678,Coffee Maker,Kitchen,$89.99,1&#10;&#10;Or paste Amazon's official export - we'll auto-detect the format!"
                      className="min-h-[150px] font-mono text-sm"
                      value={orderText}
                      onChange={(e) => setOrderText(e.target.value)}
                      data-testid="input-order-data"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Supports Amazon's official export format - just paste and we'll figure it out!
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button
                      onClick={() => handleStartWrapped(false)}
                      disabled={!orderText.trim()}
                      className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-6 text-lg"
                      data-testid="button-use-my-data"
                    >
                      <Upload className="w-5 h-5 mr-2" />
                      Use My Data
                    </Button>
                    <Button
                      onClick={() => handleStartWrapped(true)}
                      variant="outline"
                      className="flex-1 py-6 text-lg border-2"
                      data-testid="button-try-sample"
                    >
                      <Sparkles className="w-5 h-5 mr-2" />
                      Try Sample Data
                    </Button>
                  </div>
                </div>

                <div className="bg-amber-50 rounded-xl p-6 space-y-4">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-orange-500" />
                    What You'll Discover
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div className="bg-white rounded-lg p-3">
                      <DollarSign className="w-8 h-8 mx-auto text-green-500 mb-1" />
                      <p className="text-sm text-gray-600">Total Spent</p>
                    </div>
                    <div className="bg-white rounded-lg p-3">
                      <Package className="w-8 h-8 mx-auto text-blue-500 mb-1" />
                      <p className="text-sm text-gray-600">Order Count</p>
                    </div>
                    <div className="bg-white rounded-lg p-3">
                      <ShoppingCart className="w-8 h-8 mx-auto text-purple-500 mb-1" />
                      <p className="text-sm text-gray-600">Top Categories</p>
                    </div>
                    <div className="bg-white rounded-lg p-3">
                      <Gift className="w-8 h-8 mx-auto text-pink-500 mb-1" />
                      <p className="text-sm text-gray-600">Fun Facts</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}