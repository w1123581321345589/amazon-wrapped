import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import SearchPage from "@/pages/search";
import WeeklyWrap from "@/pages/weekly-wrap";
import WeeklyWrapArchive from "@/pages/weekly-wrap-archive";
import AmazonWrapped from "@/pages/amazon-wrapped";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={AmazonWrapped} />
      <Route path="/amazon-wrapped" component={AmazonWrapped} />
      <Route path="/search" component={SearchPage} />
      <Route path="/weekly-wrap" component={WeeklyWrap} />
      <Route path="/weekly-wrap/archive" component={WeeklyWrapArchive} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
