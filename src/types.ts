export type MealSlot = 'BREAKFAST' | 'LUNCH' | 'DINNER';

export interface RecentMeal {
  id: string;
  foodName: string;
  date: string; // YYYY-MM-DD
  mealSlot?: MealSlot;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  allergies: string[];
  favoriteFoods: string[];
  dislikedFoods: string[];
  recentMeals: RecentMeal[];
}

export interface FriendRequest {
  id: string;
  fromUserId: string;
  fromUserName: string;
  fromUserEmail: string;
  fromUserAvatar: string;
  toUserId: string;
  toUserName?: string;
  toUserEmail: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  createdAt: string;
  updatedAt?: string;
}

export interface RestaurantRecommendation {
  id: string;
  name: string;
  category: string;
  recommendedDish: string;
  rating: number;
  reviewSummary: string;
  reason: string;
  address: string;
  mapSearchUrl: string;
  priceRange: string;
  votes: string[]; // List of user IDs who voted
}

export interface FilterAnalysis {
  allergenExclusions: {
    allergen: string;
    memberNames: string[];
    excludedDishes: string[];
  }[];
  dislikeExclusions: {
    dish: string;
    memberNames: string[];
  }[];
  recentMealsEvaluated: {
    dish: string;
    memberName: string;
    date: string;
    rescuedByFavorite: boolean;
    favoriteUserNames: string[];
  }[];
  clearedCandidateCategories: string[];
  summaryMessage: string;
}

export interface MealPot {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  slot: MealSlot;
  locationName: string;
  coordinates?: { lat: number; lng: number };
  hostId: string;
  memberIds: string[];
  status: 'FORMING' | 'FILTERED' | 'VOTING' | 'CONFIRMED';
  filterAnalysis?: FilterAnalysis;
  recommendations: RestaurantRecommendation[];
  confirmedWinnerId?: string;
  createdAt: string;
}
