type Pricing = {
  accomodation: number;
  food: number;
  service: number;
};

type Coordinates = {
  x: number;
  y: number;
};

type Review = {
  description: string;
  rating: number;
};

class Hotel {
  name: string;
  location: string;
  description: string;
  pricing: Pricing;
  coordinates: Coordinates;
  reviews: Review[];
  totalRating: number;
  averageRating: number;

  constructor(name: string, location: string, description: string, pricing: Pricing, coordinates: Coordinates) {
    this.name = name;
    this.location = location;
    this.description = description;
    this.pricing = pricing;
    this.coordinates = coordinates;
    this.reviews = [];
    this.totalRating = 0;
  }

  addReview(description: string, rating: number) {
    const newReview: Review = {
      description,
      rating
    };
    this.totalRating += rating;
    this.averageRating = this.totalRating / this.reviews.length;
    this.reviews.push(newReview);
  }

  viewReviews() {
    const sortedReviews = this.reviews.sort((a, b) => b.rating - a.rating);

    sortedReviews.forEach(review =>
      console.log(
        `Rating: ${review.rating}\n` +
        `Reveiw: ${review.description}`
      )
    );
  }
}


class App {
  hotels: Hotel[];

  constructor() {
    this.hotels = [];
  }

  addHotel(hotel: Hotel) {
    this.hotels.push(hotel);
  }

  searchHotels(query: string) {
    const searchResults = this.hotels.filter(hotel => hotel.name.toLowerCase().includes(query.toLowerCase()) || hotel.description.toLowerCase().includes(query.toLowerCase()));
    searchResults.forEach((hotel, index) => {
      console.log(
        `${index + 1}: ${hotel.name}`
      );
    });
  }

  viewAllHotels() {
    this.hotels.forEach((hotel, index) =>
      console.log(
        `${index + 1}: ${hotel.name}`
      )
    );
  }

  filterHotels(location: string, minPricingRange: Pricing, maxPricingRange: Pricing, minimumRating: number) {
    const filteredHotels = this.hotels.filter(hotel => {
      return hotel.location === location
        && hotel.pricing.accomodation >= minPricingRange.accomodation
        && hotel.pricing.accomodation <= maxPricingRange.accomodation
        && hotel.pricing.food >= minPricingRange.food
        && hotel.pricing.food <= maxPricingRange.food
        && hotel.pricing.service >= minPricingRange.service
        && hotel.pricing.service <= maxPricingRange.service
        && hotel.averageRating >= minimumRating;
    });

    filteredHotels.forEach((hotel, index) => {
      console.log(
        `${index + 1}: ${hotel.name}`
      );
    });
  }

  filterHotelsByDistance(userXCoordinate: number, userYCoordinate: number, maxDistanceInKm: number) {
    const filteredHotels = this.hotels.filter(hotel => {
      const distance = Math.sqrt(
        Math.pow(userXCoordinate - hotel.coordinates.x, 2) +
        Math.pow(userYCoordinate - hotel.coordinates.y, 2)
      );

      return distance <= maxDistanceInKm;
    });

    filteredHotels.forEach((hotel, index) => {
      console.log(
        `${index + 1}: ${hotel.name}`
      );
    });
  }
}


const app = new App();

app.addHotel(
  new Hotel(
    "A",
    "Uttara",
    "Village side hotel",
    {
      accomodation: 500,
      food: 200,
      service: 50
    },
    {
      x: 100,
      y: 200,
    }
  )
);

app.addHotel(
  new Hotel(
    "B",
    "Mirpur",
    "River side hotel",
    {
      accomodation: 400,
      food: 100,
      service: 30
    },
    {
      x: 250,
      y: 350,
    }
  )
);

app.addHotel(
  new Hotel(
    "C",
    "Cantonment",
    "Forest side hotel",
    {
      accomodation: 500,
      food: 400,
      service: 199
    },
    {
      x: 600,
      y: 700,
    }
  )
);

app.addHotel(
  new Hotel(
    "D",
    "Cantonment",
    "Forest side hotel",
    {
      accomodation: 500,
      food: 200,
      service: 50
    },
    {
      x: 400,
      y: 400,
    }
  )
);

app.addHotel(
  new Hotel(
    "E",
    "Cantonment",
    "Forest side hotel",
    {
      accomodation: 1000,
      food: 600,
      service: 400
    },
    {
      x: 800,
      y: 800,
    }
  )
);

console.log("All hotels");
app.viewAllHotels();

console.log("Search result");
app.searchHotels("forest");

console.log("Search result");
app.searchHotels("A");

app.hotels[4].addReview("nice hotel", 5);
app.hotels[3].addReview("nice hotel", 2);
app.hotels[2].addReview("nice hotel", 4);

console.log("Filter result");

app.filterHotels("Cantonment",
  {
    accomodation: 400,
    food: 100,
    service: 40
  },
  {
    accomodation: 1200,
    food: 1200,
    service: 1200
  },
  1
);

console.log("Distance Filter result");

app.filterHotelsByDistance(400, 400, 200);