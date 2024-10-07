type Coordinates = {
  x: number;
  y: number;
};

type Pricing = {
  accomodation: number;
  food: number;
  service: number;
};

type Review = {
  description: string;
  rating: number;
};

class Hotel {
  name: string;
  description: string;
  location: string;
  coordinates: Coordinates;
  pricing: Pricing;
  reviews: Review[];
  totalRatings: number;
  averageRating: number;

  constructor(name: string, description: string, location: string, coordinates: Coordinates, pricing: Pricing) {
    this.name = name;
    this.description = description;
    this.location = location;
    this.coordinates = coordinates;
    this.pricing = pricing;
    this.reviews = [];
    this.totalRatings = 0;
  }

  addReview(description: string, rating: number) {
    const newReview: Review = {
      description,
      rating
    };

    this.reviews.push(newReview);
    this.totalRatings += rating;
    this.averageRating = this.totalRatings / this.reviews.length;
  }

}

class App {
  hotels: Hotel[];

  constructor() {
    this.hotels = [];
  }

  addHotel(name: string, description: string, location: string, coordinates: Coordinates, pricing: Pricing) {
    this.hotels.push(new Hotel(name, description, location, coordinates, pricing));
  }

  viewAllHotels() {
    this.hotels.forEach((hotel, index) =>
      console.log(
        `${index + 1}. ${hotel.name}, ${hotel.location}`
      )
    );
  }

  searchHotels(query: string) {
    query = query.toLowerCase();
    const matchedHotels = this.hotels.filter(hotel =>
      hotel.name.toLowerCase().includes(query) ||
      hotel.description.toLowerCase().includes(query)
    );

    matchedHotels.forEach((hotel, index) => (
      console.log(
        `${index + 1}. ${hotel.name}, ${hotel.location}`
      )
    ));
  }

  fetchHotelReviews(name: string) {
    const hotel = this.hotels.find(hotel => hotel.name === name);

    if (!hotel) {
      console.log("Hotel not found!");
    }

    const reviews = hotel?.reviews.sort((a, b) => b.rating - a.rating);

    reviews?.forEach(review => {
      console.log(
        `Rating: ${review.rating}\n` +
        `Review: ${review.description}\n` +
        `---------------`
      );
    });
  }

  filterHotels(location: string, minBudget: Pricing, maxBudget: Pricing, minRating: number) {
    const filteredHotels = this.hotels.filter(hotel =>
      hotel.location === location &&
      hotel.pricing.accomodation >= minBudget.accomodation &&
      hotel.pricing.accomodation <= maxBudget.accomodation &&
      hotel.pricing.food >= minBudget.food &&
      hotel.pricing.food <= maxBudget.food &&
      hotel.pricing.service >= minBudget.service &&
      hotel.pricing.service <= maxBudget.service &&
      hotel.averageRating >= minRating
    );

    filteredHotels.forEach((hotel, index) =>
      console.log(
        `${index + 1}. ${hotel.name}, ${hotel.location}`
      )
    );
  }

  filterHotelsByDistance(userXCoordinate: number, userYCoordinate: number, maxDistance: number) {
    const filteredHotels = this.hotels.filter(hotel => {
      const distance = Math.sqrt(
        Math.pow(hotel.coordinates.x - userXCoordinate, 2) +
        Math.pow(hotel.coordinates.y - userYCoordinate, 2)
      );

      return distance <= maxDistance;
    });

    filteredHotels.forEach((hotel, index) =>
      console.log(
        `${index + 1}. ${hotel.name}, ${hotel.location}`
      )
    );
  }
}

const app = new App();

app.addHotel("A", "Premium hotel", "Gulshan", { x: 100, y: 100 }, { accomodation: 500, food: 300, service: 100 });
app.addHotel("B", "Mid hotel", "Mirpur", { x: 300, y: 300 }, { accomodation: 400, food: 200, service: 90 });
app.addHotel("C", "Poor hotel", "Uttara", { x: 600, y: 600 }, { accomodation: 200, food: 100, service: 50 });

app.viewAllHotels();

app.searchHotels("prem");

app.searchHotels("mid");

app.searchHotels("hotel");

app.searchHotels("a");

app.hotels[0].addReview("nice hotel", 5);
app.hotels[0].addReview("nice hotel", 4);
app.hotels[0].addReview("nice hotel", 4);
app.hotels[0].addReview("nice hotel", 3);

app.fetchHotelReviews("A");

app.filterHotels("Gulshan", { accomodation: 200, food: 100, service: 50 }, { accomodation: 1000, food: 1000, service: 1000 }, 2);

app.filterHotelsByDistance(250, 250, 300);
