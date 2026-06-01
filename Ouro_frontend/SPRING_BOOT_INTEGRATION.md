# Spring Boot Integration Guide

This React application is ready for Spring Boot backend integration. All API endpoints are defined in `/src/app/services/api.ts` with mock implementations that can be replaced with actual REST API calls.

## Spring Boot Base URL

```typescript
const SPRING_BOOT_BASE_URL = 'http://localhost:8080/api';
```

## Required API Endpoints

### 1. Auctions

#### GET `/api/auctions`
Fetch all active auctions with optional filters.

**Query Parameters:**
- `category` (optional): Filter by category
- `minPrice` (optional): Minimum price filter
- `maxPrice` (optional): Maximum price filter
- `search` (optional): Search query
- `sortBy` (optional): Sort order (endingSoon, newest, priceLow, priceHigh)

**Response:**
```json
[
  {
    "id": "string",
    "title": "string",
    "description": "string",
    "imageUrl": "string",
    "currentBid": number,
    "startingBid": number,
    "endTime": "ISO timestamp string",
    "category": "string",
    "sellerId": "string",
    "sellerName": "string",
    "status": "active" | "ended" | "cancelled"
  }
]
```

#### GET `/api/auctions/:id`
Fetch a single auction by ID.

**Response:** Single auction object (same structure as above)

---

### 2. Bids

#### GET `/api/auctions/:id/bids`
Fetch all bids for a specific auction.

**Response:**
```json
[
  {
    "id": "string",
    "auctionId": "string",
    "userId": "string",
    "username": "string",
    "amount": number,
    "timestamp": "ISO timestamp string"
  }
]
```

#### POST `/api/auctions/:id/bids`
Place a new bid on an auction.

**Request Body:**
```json
{
  "amount": number
}
```

**Response:**
```json
{
  "success": boolean,
  "message": "string",
  "bid": {
    "id": "string",
    "auctionId": "string",
    "userId": "string",
    "username": "string",
    "amount": number,
    "timestamp": "ISO timestamp string"
  },
  "timeExtended": boolean
}
```

**Business Logic:**
- Validate bid is higher than current bid
- Implement anti-sniping: If bid placed in last 15 seconds, extend auction by 30 seconds
- Return `timeExtended: true` if time was extended

---

### 3. Users

#### GET `/api/users/current`
Get current logged-in user.

**Response:**
```json
{
  "id": "string",
  "username": "string",
  "email": "string",
  "avatarUrl": "string" (optional)
}
```

#### GET `/api/users/:id/bids`
Get all bids placed by a user.

**Response:** Array of bid objects (same structure as above)

#### GET `/api/users/:id/auctions/won`
Get all auctions won by a user.

**Response:** Array of auction objects

---

### 4. Categories

#### GET `/api/categories`
Get all available categories.

**Response:**
```json
["All", "Electronics", "Fashion", "Music", "Gaming", "Furniture", "Art", "Sports"]
```

---

## Spring Boot Implementation Example

### Entity Classes

```java
@Entity
public class Auction {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    private String title;
    private String description;
    private String imageUrl;
    private Double currentBid;
    private Double startingBid;
    private LocalDateTime endTime;
    private String category;
    private String sellerId;
    private String sellerName;

    @Enumerated(EnumType.STRING)
    private AuctionStatus status;

    // Getters and setters
}

@Entity
public class Bid {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    private String auctionId;
    private String userId;
    private String username;
    private Double amount;
    private LocalDateTime timestamp;

    // Getters and setters
}
```

### Controller Example

```java
@RestController
@RequestMapping("/api/auctions")
@CrossOrigin(origins = "http://localhost:3000")
public class AuctionController {

    @Autowired
    private AuctionService auctionService;

    @GetMapping
    public ResponseEntity<List<Auction>> getAllAuctions(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String sortBy
    ) {
        List<Auction> auctions = auctionService.getAuctions(
            category, minPrice, maxPrice, search, sortBy
        );
        return ResponseEntity.ok(auctions);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Auction> getAuctionById(@PathVariable String id) {
        return auctionService.getAuctionById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/bids")
    public ResponseEntity<BidResponse> placeBid(
            @PathVariable String id,
            @RequestBody BidRequest request,
            @AuthenticationPrincipal User currentUser
    ) {
        BidResponse response = auctionService.placeBid(
            id, request.getAmount(), currentUser
        );
        return ResponseEntity.ok(response);
    }
}
```

### Service Example (Anti-Sniping Logic)

```java
@Service
public class AuctionService {

    private static final long ANTI_SNIPE_THRESHOLD = 15 * 1000; // 15 seconds
    private static final long TIME_EXTENSION = 30 * 1000; // 30 seconds

    public BidResponse placeBid(String auctionId, Double amount, User user) {
        Auction auction = auctionRepository.findById(auctionId)
            .orElseThrow(() -> new AuctionNotFoundException());

        // Validate bid
        if (amount <= auction.getCurrentBid()) {
            return BidResponse.error("Bid must be higher than current bid");
        }

        // Create bid
        Bid bid = new Bid();
        bid.setAuctionId(auctionId);
        bid.setUserId(user.getId());
        bid.setUsername(user.getUsername());
        bid.setAmount(amount);
        bid.setTimestamp(LocalDateTime.now());
        bidRepository.save(bid);

        // Update auction
        auction.setCurrentBid(amount);

        // Anti-sniping logic
        long timeRemaining = ChronoUnit.MILLIS.between(
            LocalDateTime.now(),
            auction.getEndTime()
        );

        boolean timeExtended = false;
        if (timeRemaining > 0 && timeRemaining < ANTI_SNIPE_THRESHOLD) {
            auction.setEndTime(
                LocalDateTime.now().plus(TIME_EXTENSION, ChronoUnit.MILLIS)
            );
            timeExtended = true;
        }

        auctionRepository.save(auction);

        String message = timeExtended
            ? "Bid placed successfully! Time extended due to late bid."
            : "Bid placed successfully!";

        return BidResponse.success(message, bid, timeExtended);
    }
}
```

## CORS Configuration

Add CORS configuration to allow requests from the React app:

```java
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
            .allowedOrigins("http://localhost:3000", "http://localhost:5173")
            .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
            .allowedHeaders("*")
            .allowCredentials(true);
    }
}
```

## Security Configuration

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf().disable()
            .cors()
            .and()
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auctions/**").permitAll()
                .requestMatchers("/api/users/current").authenticated()
                .anyRequest().authenticated()
            )
            .oauth2Login(); // or .httpBasic() depending on auth method

        return http.build();
    }
}
```

## How to Replace Mock Data

In `/src/app/services/api.ts`, replace each mock implementation with actual fetch calls:

**Before (Mock):**
```typescript
export async function fetchAuctions(filters?: any): Promise<Auction[]> {
  await new Promise(resolve => setTimeout(resolve, 300));
  return mockAuctions;
}
```

**After (Spring Boot):**
```typescript
const SPRING_BOOT_BASE_URL = 'http://localhost:8080/api';

export async function fetchAuctions(filters?: any): Promise<Auction[]> {
  const params = new URLSearchParams();
  if (filters?.category) params.append('category', filters.category);
  if (filters?.minPrice) params.append('minPrice', filters.minPrice.toString());
  if (filters?.maxPrice) params.append('maxPrice', filters.maxPrice.toString());
  if (filters?.search) params.append('search', filters.search);
  if (filters?.sortBy) params.append('sortBy', filters.sortBy);

  const response = await fetch(`${SPRING_BOOT_BASE_URL}/auctions?${params}`);
  if (!response.ok) throw new Error('Failed to fetch auctions');
  return response.json();
}
```

## Testing

1. Start your Spring Boot backend: `./mvnw spring-boot:run`
2. Start the React frontend: `pnpm install && pnpm dev`
3. Navigate to `http://localhost:5173`

## Environment Variables

Create a `.env` file for environment-specific configuration:

```
VITE_API_BASE_URL=http://localhost:8080/api
```

Then use in your code:
```typescript
const SPRING_BOOT_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
```
