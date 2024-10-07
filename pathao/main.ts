type ValidLocation = "Banani" | "Mohakhali" | "Uttara";

class Ride {
  location: ValidLocation;
  destination: ValidLocation;
  status: "pending" | "accepted" | "completed" | "cancelled";
  fare: number;
  driver: Driver;
  rating: number;
  user: User;

  constructor(location: ValidLocation, destination: ValidLocation, fare: number) {
    this.location = location;
    this.destination = destination;
    this.status = "pending";
    this.fare = fare;
  }

}

type Coordinates = {
  x: number;
  y: number;
};

class Driver {
  name: string;
  coordinates: Coordinates;
  totalRating: number;
  completedRides: number;
  averageRating: number;

  constructor(name: string, coordinates: Coordinates) {
    this.name = name;
    this.coordinates = coordinates;
    this.totalRating = 0;
    this.completedRides = 0;
    this.averageRating = 0;
  }

  viewRides(ridesTable: Ride[]) {
    const pendingRides = ridesTable.filter(ride => ride.status === "pending");

    pendingRides.forEach(ride =>
      console.log(
        `Location: ${ride.location}\n` +
        `Destination: ${ride.destination}\n` +
        `Fare: ${ride.fare}\n`
      )
    );
  }

  acceptRide(ride: Ride) {
    ride.status = "accepted";
    ride.driver = this;
  }

  completeRide(ride: Ride, ridesInARoute: RidesInARoute) {
    ride.status = "completed";
    this.completedRides++;

    if (ride.location < ride.destination) {
      if (ridesInARoute[`${ride.location}-${ride.destination}`])
        ridesInARoute[`${ride.location}-${ride.destination}`]++;
      else ridesInARoute[`${ride.location}-${ride.destination}`] = 1;
    } else {
      if (ridesInARoute[`${ride.destination}-${ride.location}`]) {
        ridesInARoute[`${ride.destination}-${ride.location}`]++;
      } else ridesInARoute[`${ride.destination}-${ride.location}`] = 1;
    }
  }
}


class User {
  coordinates: Coordinates;
  requestedRide: Ride;

  constructor(coordinates: Coordinates) {
    this.coordinates = coordinates;
  }

  requestRide(location: ValidLocation, destination: ValidLocation, fare: number, rides: Ride[]) {
    const newRide = new Ride(location, destination, fare);
    newRide.user = this;
    this.requestedRide = newRide;
    rides.push(newRide);
  }

  viewNearbyDrivers(drivers: Driver[], radius: number) {
    const nearbyDrivers = drivers.filter(driver => {
      const distance = Math.sqrt(
        Math.pow(this.coordinates.x - driver.coordinates.x, 2) +
        Math.pow(this.coordinates.y - driver.coordinates.y, 2)
      );

      return distance <= radius;
    });

    nearbyDrivers.forEach(driver => {
      console.log(
        `${driver.name} at location: (${driver.coordinates.x}, ${driver.coordinates.y})`
      );
    });
  }

  viewPastRides(ridesTable: Ride[]) {
    const rides = ridesTable.filter(ride => {
      return ride.user == this;
    });

    for (let i = rides.length - 1; i >= 0; i--) {
      console.log(
        `Pickup: ${rides[i].location}\n` +
        `Dropoff: ${rides[i].destination}\n` +
        `Driver: ${rides[i].driver.name}\n` +
        `Driver Average Rating: ${rides[i].driver.averageRating}\n` +
        `Rating: ${rides[i].rating}`
      );
    }
  }

  addRating(rating: number) {
    this.requestedRide.driver.totalRating += rating;
    this.requestedRide.driver.averageRating = this.requestedRide.driver.totalRating / this.requestedRide.driver.completedRides;
    this.requestedRide.rating = rating;
  }

}

type RidesInARoute = {
  [route: string]: number;
};


class App {
  rides: Ride[];
  drivers: Driver[];
  users: User[];
  ridesInARoute: RidesInARoute;

  constructor() {
    this.rides = [];
    this.drivers = [];
    this.users = [];
    this.ridesInARoute = {};
  }

  addDriver(name: string, coordinates: Coordinates) {
    this.drivers.push(new Driver(name, coordinates));
  }

  addUser(coordinates: Coordinates) {
    this.users.push(new User(coordinates));
  }

  topNRoutes(n: number) {
    const sortedRouteRides = Object.entries(this.ridesInARoute).sort((a, b) => a[1] - b[1]).splice(0, n);

    return sortedRouteRides.splice(0, n);
  }
}


const app = new App();

app.addDriver("a", {
  x: 100,
  y: 100
});

app.addDriver("b", {
  x: 200,
  y: 200
});

app.addDriver("c", {
  x: 300,
  y: 300
});

app.addUser({
  x: 0,
  y: 0
});

console.log("Nearby drivers");
app.users[0].viewNearbyDrivers(app.drivers, 200);

console.log("Ride requested");
app.users[0].requestRide("Banani", "Uttara", 100, app.rides);

console.log("Driver views rides");
app.drivers[0].viewRides(app.rides);

console.log("Driver accepts ride");
app.drivers[0].acceptRide(app.rides[0]);

console.log("Checking ride status");
console.log(app.rides[0].status);

console.log("Completing ride");
app.drivers[0].completeRide(app.rides[0], app.ridesInARoute);

console.log("Checking ride status");
console.log(app.rides[0].status);

console.log("Adding user rating");
app.users[0].addRating(5);

console.log("Checking rating change");
console.log(app.rides[0].rating);

console.log("Checking driver rating");
console.log(app.drivers[0].averageRating);

console.log("Checking past rides");
app.users[0].viewPastRides(app.rides);

console.log("Checking top 5 routes");
console.log(app.topNRoutes(5));