type ValidLocation = "Banani" | "Mohakhali" | "Uttara";

class Ride {
  location: ValidLocation;
  destination: ValidLocation;
  fare: number;
  driver: Driver;
  user: User;
  status: "pending" | "accepted" | "completed";
  rating: number;
  dateTime: Date;

  constructor(location: ValidLocation, destination: ValidLocation, fare: number) {
    this.location = location;
    this.destination = destination;
    this.fare = fare;
    this.status = "pending";
    this.dateTime = new Date();
  }
}

type Coordinates = {
  x: number;
  y: number;
};

class Driver {
  name: string;
  totalRating: number;
  averageRating: number;
  totalTrips: number;
  status: "available" | "unavailable";
  coordinates: Coordinates;
  currentRide: Ride | null;

  constructor(name: string, coordinates: Coordinates) {
    this.name = name;
    this.coordinates = coordinates;
    this.totalRating = 0;
    this.totalTrips = 0;
    this.averageRating = 0;
    this.status = "available";
  }

  viewPendingRides(rides: Ride[]) {
    const pendingRides = rides.filter(ride => ride.status === "pending");

    pendingRides.forEach((ride, index) =>
      console.log(
        `${index + 1}. Location: ${ride.location}, Destination: ${ride.destination}`
      )
    );
  }

  acceptRide(ride: Ride) {
    ride.status = "accepted";
    ride.driver = this;
    this.currentRide = ride;
    this.status = "unavailable";
  }

  completeRide(routeTrips: RouteTrips) {
    if (!this.currentRide) {
      console.log("No rides accepted");
      return;
    }

    this.currentRide.status = "completed";
    this.status = "available";
    this.totalTrips++;
    this.currentRide.user.pendingReviewsStack.push(this.currentRide);
    this.currentRide.user.currentRide = null;

    const route =
      this.currentRide.location < this.currentRide.destination ?
        `${this.currentRide.location}-${this.currentRide.destination}` :
        `${this.currentRide.destination}-${this.currentRide.location}`;

    this.currentRide = null;

    if (!routeTrips[route]) routeTrips[route] = 0;
    routeTrips[route]++;
  }
}

class User {
  name: string;
  coordinates: Coordinates;
  currentRide: Ride | null;
  pendingReviewsStack: Ride[];

  constructor(name: string, coordinates: Coordinates) {
    this.name = name;
    this.coordinates = coordinates;
    this.pendingReviewsStack = [];
  }

  requestRide(location: ValidLocation, destination: ValidLocation, fare: number, ride: Ride[]) {
    const newRide = new Ride(location, destination, fare);
    newRide.user = this;
    ride.push(newRide);
    this.currentRide = newRide;
  }

  addRating(rating: number) {
    const ride = this.pendingReviewsStack.pop();
    if (!ride) {
      console.log("No pending reviews");
      return;
    }

    ride.rating = rating;
    ride.driver.totalRating += rating;
    ride.driver.averageRating = ride.driver.totalRating / ride.driver.totalTrips;
  }

  viewPastRides(rides: Ride[]) {
    const pastRides = rides.filter(ride => ride.user === this);

    if (!pastRides) {
      console.log("No past trips!");
      return;
    }

    for (let i = pastRides.length - 1; i >= 0; i--) {
      console.log(
        `Trip #${i + 1}.\n` +
        `----------\n` +
        `Location: ${pastRides[i].location}\n` +
        `Destination: ${pastRides[i].destination}\n` +
        `Datetime: ${pastRides[i].dateTime.toString()}\n` +
        `Fare: ${pastRides[i].fare}\n` +
        `Driver name: ${pastRides[i].driver.name}\n` +
        `Driver Average Rating: ${pastRides[i].driver.averageRating}\n` +
        `Ride rating: ${pastRides[i].rating}\n` +
        `----------`
      );
    }
  }

  findNearbyDrivers(maxDistance: number, drivers: Driver[]) {
    const nearbyDrivers = drivers.filter(driver => {
      const distance = Math.sqrt(
        Math.pow(driver.coordinates.x - this.coordinates.x, 2) +
        Math.pow(driver.coordinates.y - this.coordinates.y, 2)
      );
      return driver.status === "available" && distance <= maxDistance;
    });

    nearbyDrivers.forEach((driver, index) =>
      console.log(
        `Driver #${index + 1}.\n` +
        `----------\n` +
        `Driver Name: ${driver.name}\n` +
        `Coordinates: (${driver.coordinates.x}, ${driver.coordinates.y})\n` +
        `----------\n`
      )
    );
  }
}

type RouteTrips = {
  [routeName: string]: number;
};

class App {
  users: User[];
  drivers: Driver[];
  rides: Ride[];
  routeTrips: RouteTrips;

  constructor() {
    this.users = [];
    this.drivers = [];
    this.rides = [];
    this.routeTrips = {};
  }

  addUser(name: string, coordinates: Coordinates) {
    this.users.push(new User(name, coordinates));
  }

  addDriver(name: string, coordinates: Coordinates) {
    this.drivers.push(new Driver(name, coordinates));
  }


  topNRoutes(n: number) {
    const routes = Object.entries(this.routeTrips).sort((a, b) => b[1] - a[1]).slice(0, n);

    routes.map(route =>
      console.log(
        `${route[0]}: ${route[1]}`
      )
    );
  }

}

const app = new App();

app.addUser("A", { x: 0, y: 0 });
app.addDriver("1", { x: 100, y: 100 });


app.users[0].findNearbyDrivers(200, app.drivers);
app.users[0].requestRide("Banani", "Mohakhali", 100, app.rides);

app.drivers[0].viewPendingRides(app.rides);
app.drivers[0].acceptRide(app.rides[0]);

app.drivers[0].completeRide(app.routeTrips);
app.users[0].viewPastRides(app.rides);

app.users[0].addRating(5);
app.users[0].addRating(5);

app.users[0].viewPastRides(app.rides);

app.topNRoutes(2);