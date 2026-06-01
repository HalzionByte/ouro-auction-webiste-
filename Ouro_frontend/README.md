# BidHub - Modern Auction Platform

A clean, modern, and transparent auction website built with React, Tailwind CSS, and TypeScript. This frontend application is designed to integrate seamlessly with a Spring Boot backend.

## Features

### 🎨 Modern Design
- Clean, minimal layout with lots of spacing
- Smooth hover effects and fast interactions
- Fully responsive (mobile, tablet, desktop)
- Professional color scheme (Blue primary, Green accent, Clear status colors)

### 🛡️ Fair Bidding System
- **Anti-Sniping Protection**: Auction time extends automatically when bids are placed in the last 15 seconds
- **Transparent Bid History**: See all bids with clear timestamps and bidder information
- **Smart Bid Suggestions**: Automatically suggests the next valid bid amount
- **Real-time Validation**: Prevents invalid or low bids before submission

### 📊 User Dashboard
- View all active bids in one place
- See which auctions you're winning
- Track auctions you've won
- Clear status indicators (Winning, Outbid)

### 🔍 Advanced Search & Filtering
- Category filtering
- Price range filters
- Multiple sorting options (Ending Soon, Price Low/High, Newest)
- Real-time search

### 🎯 User Experience Features
- Clear countdown timers with color-coded urgency (red for < 5 min, orange for < 1 hour)
- Instant feedback on bid status
- Notification system for bid placement
- Highlighted current user bids in bid history

## Tech Stack

- **React 18** with TypeScript
- **React Router** for navigation
- **Tailwind CSS v4** for styling
- **Lucide React** for icons
- **Spring Boot Integration** ready (mock data included)

## Project Structure

```
src/
├── app/
│   ├── components/          # Reusable components
│   │   ├── Navbar.tsx
│   │   ├── AuctionCard.tsx
│   │   ├── CountdownTimer.tsx
│   │   ├── BidHistory.tsx
│   │   └── Filters.tsx
│   ├── pages/              # Page components
│   │   ├── Homepage.tsx
│   │   ├── AuctionDetailPage.tsx
│   │   └── UserDashboard.tsx
│   ├── layouts/            # Layout components
│   │   └── RootLayout.tsx
│   ├── services/           # API services
│   │   └── api.ts          # All API endpoints with Spring Boot placeholders
│   ├── routes.ts           # React Router configuration
│   └── App.tsx             # Main app component
└── styles/
    ├── theme.css           # Custom color system
    └── fonts.css           # Font imports
```

## Getting Started

### Prerequisites
- Node.js 18+ and pnpm

### Installation

1. Install dependencies:
```bash
pnpm install
```

2. Start the development server:
```bash
pnpm dev
```

3. Open your browser to the URL shown in the terminal

## Spring Boot Integration

This application is designed to work with a Spring Boot backend. All API endpoints are defined in `/src/app/services/api.ts` with mock implementations.

### Quick Integration Steps:

1. Review the API endpoint specifications in `SPRING_BOOT_INTEGRATION.md`
2. Implement the REST endpoints in your Spring Boot application
3. Update the base URL in `/src/app/services/api.ts`
4. Replace mock implementations with actual fetch calls

See [SPRING_BOOT_INTEGRATION.md](./SPRING_BOOT_INTEGRATION.md) for detailed integration guide, including:
- Complete API specifications
- Spring Boot entity examples
- Controller implementations
- Anti-sniping logic example
- CORS configuration

## Key Improvements Over Traditional Auction Sites

### 1. Anti-Sniping System
Traditional sites like eBay are vulnerable to "sniping" where bidders wait until the last second to bid. BidHub automatically extends the auction time when bids are placed near the end, ensuring fair competition.

### 2. Transparent Bidding
- Full bid history visible to all users
- Clear indication of who is winning
- No hidden reserve prices or confusing bid increments

### 3. Clean, Modern UI
- No cluttered interface
- Clear visual hierarchy
- Consistent spacing and design
- Fast, smooth interactions

### 4. Smart Bid Validation
- Prevents invalid bids before submission
- Auto-suggests next valid bid
- Clear error messages

### 5. User-Centric Dashboard
- See all your bids at a glance
- Clear winning/losing status
- Quick access to auction details

## Color System

The application uses a carefully designed color system:

- **Primary** (#374151): Navigation, headers, important text (grey tone)
- **Secondary** (#F1F5F9): Card backgrounds, sections
- **Accent** (#10B981): Main actions (Place Bid, Winning status)
- **Warning** (#F59E0B): Urgency indicators (< 1 hour remaining)
- **Danger** (#EF4444): Critical alerts (< 5 min remaining, Outbid status)

## Mock Data

The application includes comprehensive mock data for development and demonstration:
- 6 sample auctions across different categories
- Mock bid history for each auction
- Simulated user data
- Different time scenarios (ending soon, hours remaining, etc.)

## Future Enhancements

Potential features to add with your Spring Boot backend:
- Real-time WebSocket updates for live bidding
- Email notifications for bid status changes
- Watchlist functionality
- Seller dashboard for creating auctions
- Payment integration
- User ratings and reviews
- Image upload for auction items

## License

This project is a demonstration/prototype for educational purposes.

## Support

For Spring Boot integration help, see `SPRING_BOOT_INTEGRATION.md`
