# Amazon Wrapped

A Spotify Wrapped-style experience for your Amazon shopping data. See beautiful, animated slides showcasing your year in shopping with insights like total spent, order count, top categories, shopping personality, and fun facts.

![Amazon Wrapped](https://img.shields.io/badge/Amazon-Wrapped-orange?style=for-the-badge)

## Features

- **10 Animated Slides** - Beautiful Framer Motion animations reveal your shopping story
- **Privacy-First** - All data processing happens in your browser, nothing is stored on servers
- **Auto-Detection** - Automatically parses Amazon's official CSV export format
- **Shopping Insights** - Total spent, order count, average order value, top categories
- **Shopping Personality** - Get a fun personality type based on your shopping habits
- **Monthly Trends** - See which months you shopped the most
- **Fun Facts** - Discover interesting stats about your shopping behavior

## How to Get Your Amazon Data

1. Go to [amazon.com/gp/privacycentral](https://www.amazon.com/gp/privacycentral)
2. Click "Request Your Data" → Select "Your Orders"
3. Wait for the email with your download link (usually 24-48 hours)
4. Download and open the CSV file
5. Copy/paste the contents into the app

## Supported CSV Formats

The app auto-detects Amazon's official export format by reading headers. It supports:

- `Order Date` / `Date`
- `Order ID` / `Order Number`
- `Title` / `Product Name` / `Item` / `Description`
- `Category`
- `Total` / `Price` / `Amount`
- `Quantity` / `Qty`

Currency symbols ($, £, €) are automatically stripped from prices.

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Animations**: Framer Motion
- **Build**: Vite
- **Backend**: Express.js (minimal, for serving)

## Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The app runs on `http://localhost:5000`

## Sample Data

Click "Try Sample Data" to see the full experience with demo shopping data.

## Privacy

Your Amazon order data never leaves your browser. All parsing and statistics calculation happens client-side. No data is sent to any server or stored anywhere.

## License

MIT
