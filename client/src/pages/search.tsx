import SearchInterface from "@/components/search-interface";
import { Search, Settings, User } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Search className="text-google-blue text-2xl" size={24} />
                <h1 className="text-xl font-medium google-dark">Credit Union News Search</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" className="rounded-full">
                <Settings className="google-gray" size={20} />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full">
                <User className="google-gray" size={20} />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Search Interface */}
      <SearchInterface />

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h4 className="font-medium google-dark mb-4">About Credit Union News Search</h4>
              <p className="text-sm google-gray">
                Search the latest credit union industry news from CreditUnionNews.com. Find breaking news, regulatory updates, market trends, and industry insights.
              </p>
            </div>
            <div>
              <h4 className="font-medium google-dark mb-4">Features</h4>
              <ul className="space-y-2 text-sm google-gray">
                <li>• Breaking News</li>
                <li>• Regulatory Updates</li>
                <li>• Market Analysis</li>
                <li>• Industry Reports</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium google-dark mb-4">API Status</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span className="google-gray">CreditUnionNews.com: Active</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span className="google-gray">NCUA Database: Active</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                  <span className="google-gray">IBankNet: Active</span>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-200 mt-8 pt-6 text-center text-sm google-gray">
            <p>&copy; 2024 AI Search Engine MVP. Built with modern web technologies.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
