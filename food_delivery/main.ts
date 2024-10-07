type MenuItem = {
  dish: string;
  price: number;
};

type Coordinates = {
  x: number;
  y: number;
};

class Restaurant {
  name: string;
  location: string;
  rating: number;
  menuItems: MenuItem[];
  coordinates: Coordinates;
  totalOrders: number;
  totalRating: number;

  constructor(name: string, location: string, coordinates: Coordinates) {
    this.name = name;
    this.location = location;
    this.rating = 0;
    this.menuItems = [];
    this.coordinates = coordinates;
    this.totalOrders = 0;
    this.totalRating = 0;
  }

  showMenu() {
    this.menuItems.forEach((menuItem, index) =>
      console.log(
        `${index + 1}. ${menuItem.dish}, Price: ${menuItem.price}`
      )
    );
  }

  addMenuItem({ dish, price }: MenuItem) {
    this.menuItems.push({ dish, price });
  }
}

class User {
  name: string;
  location: string;
  coordinates: Coordinates;
  currentOrder: Order | null;
  pendingReviewStack: Order[];

  constructor(name: string, location: string, coordinates: Coordinates) {
    this.name = name;
    this.location = location;
    this.coordinates = coordinates;
    this.pendingReviewStack = [];
  }

  createNewOrder(restaurant: Restaurant, menuItems: MenuItem[], orders: Order[]) {
    let amount = 0;
    menuItems.forEach(menuItem => amount += menuItem.price);

    const newOrder = new Order(restaurant, this, menuItems, amount);
    orders.push(newOrder);
    this.currentOrder = newOrder;
  }

  giveRating(restaurantRating: number, driverRating: number) {
    const order = this.pendingReviewStack.pop();

    if (!order) {
      console.log("No pending reviews!");
      return;
    }

    order.restaurantRating = restaurantRating;
    order.restaurant.totalRating += restaurantRating;
    order.restaurant.rating = order.restaurant.totalRating / order.restaurant.totalOrders;

    order.driverRating = driverRating;
    order.driver.totalRating += driverRating;
    order.driver.averageRating = order.driver.totalRating / order.driver.totalDeliveries;
  }

  viewPastOrders(orders: Order[]) {
    const pastOrders = orders.filter(order => order.user === this);

    if (!pastOrders) {
      console.log("No past orders!");
      return;
    }

    for (let i = pastOrders.length - 1; i >= 0; i--) {
      console.log(
        `Order #${i + 1}\n` +
        `Datetime: ${pastOrders[i].dateTime}\n` +
        `-----------\n` +
        `Restaurant Name: ${pastOrders[i].restaurant.name}\n` +
        `Items: \n` +
        ` ${pastOrders[i].items.map(item => `${item.dish}: ${item.price}`)}\n` +
        `Driver's Name: ${pastOrders[i].driver.name}\n` +
        `-----------`
      );
    }
  }

  viewAllRestaurants(restaurants: Restaurant[]) {
    restaurants.forEach((restaurant, index) =>
      console.log(
        `${index + 1}. ${restaurant.name}, ${restaurant.location}`
      )
    );
  }

  viewNearbyRestaurants(maxDistance: number, restaurants: Restaurant[]) {
    const nearbyRestaurants = restaurants.filter(restaurant => {
      const distance = Math.sqrt(
        Math.pow(restaurant.coordinates.x - this.coordinates.x, 2) +
        Math.pow(restaurant.coordinates.y - this.coordinates.y, 2)
      );

      return distance <= maxDistance;
    });

    nearbyRestaurants.forEach((restaurant, index) =>
      console.log(
        `${index + 1}. ${restaurant.name}, ${restaurant.location}`
      )
    );
  }
}

class Order {
  restaurant: Restaurant;
  user: User;
  driver: Driver;
  dateTime: Date;
  items: MenuItem[];
  amount: number;
  restaurantRating: number;
  driverRating: number;
  status: "pending" | "accepted" | "completed";

  constructor(restaurant: Restaurant, user: User, items: MenuItem[], amount) {
    this.restaurant = restaurant;
    this.user = user;
    this.items = items;
    this.amount = amount;
    this.dateTime = new Date();
    this.status = "pending";
  }

}

class Driver {
  name: string;
  coordinates: Coordinates;
  status: "available" | "unavailable";
  currentOrder: Order | null;
  totalRating: number;
  totalDeliveries: number;
  averageRating: number;

  constructor(name: string, coordinates: Coordinates) {
    this.name = name;
    this.coordinates = coordinates;
    this.status = "available";
    this.totalDeliveries = 0;
    this.totalRating = 0;
    this.averageRating = 0;
  }

  viewAvailableOrders(orders: Order[]) {
    const availableOrders = orders.filter(order => order.status === "pending");

    availableOrders.forEach((order, index) =>
      console.log(
        `${index + 1}. Restaurant: ${order.restaurant.location}, Location: ${order.user.location}`
      )
    );
  }

  acceptOrder(order: Order) {
    order.status = "accepted";
    order.driver = this;
    this.status = "unavailable";
    this.currentOrder = order;
  }

  completeOrder(orderHeatMap: OrderHeatmap) {
    if (!this.currentOrder) {
      console.log("No current order!");
      return;
    }

    this.currentOrder.status = "completed";
    this.currentOrder.restaurant.totalOrders++;
    this.status = "available";
    this.totalDeliveries++;
    this.currentOrder.user.pendingReviewStack.push(this.currentOrder);
    this.currentOrder.user.currentOrder = null;

    const restaurantName = this.currentOrder.restaurant.name;

    this.currentOrder.items.forEach(item => {
      const restaurantAndOrder = `${restaurantName}-${item.dish}`;

      if (!orderHeatMap[restaurantAndOrder])
        orderHeatMap[restaurantAndOrder] = 0;

      orderHeatMap[restaurantAndOrder]++;
    });

    this.currentOrder = null;
  }
}

type OrderHeatmap = {
  [restaurandAndOrder: string]: number;
};

class App {
  users: User[];
  drivers: Driver[];
  restaurants: Restaurant[];
  orders: Order[];
  orderHeatMap: OrderHeatmap;

  constructor() {
    this.users = [];
    this.drivers = [];
    this.restaurants = [];
    this.orders = [];
    this.orderHeatMap = {};
  }

  addUser(name: string, location: string, coordinates: Coordinates) {
    this.users.push(new User(name, location, coordinates));
  }

  addDriver(name: string, coordinates: Coordinates) {
    this.drivers.push(new Driver(name, coordinates));
  }

  addRestaurant(name: string, location: string, coordinates: Coordinates) {
    this.restaurants.push(new Restaurant(name, location, coordinates));
  }

  topNDishes(n: number) {
    const topDishes = Object.entries(this.orderHeatMap).sort((a, b) => b[1] - a[1]);

    topDishes.forEach((dish, index) =>
      console.log(
        `${index + 1}. ${dish[0]}: ${dish[1]}`
      )
    );
  }
}

const app = new App();

app.addUser("a", "Uttara", { x: 0, y: 0 });
app.addDriver("D1", { x: 200, y: 300 });
app.addRestaurant("r1", "Uttara", { x: 100, y: 100 });
app.addRestaurant("r2", "Uttara", { x: 200, y: 200 });

app.restaurants[0].addMenuItem({ dish: "ChickenBurger", price: 100 });
app.restaurants[0].addMenuItem({ dish: "BeefBurger", price: 300 });
app.restaurants[0].addMenuItem({ dish: "FishBurger", price: 200 });


app.users[0].viewAllRestaurants(app.restaurants);
app.users[0].viewNearbyRestaurants(100, app.restaurants);

app.restaurants[0].showMenu();


app.users[0].createNewOrder(app.restaurants[0], [{ dish: "ChickenBurger", price: 100 }], app.orders);

app.drivers[0].viewAvailableOrders(app.orders);

app.drivers[0].acceptOrder(app.orders[0]);
app.drivers[0].completeOrder(app.orderHeatMap);

app.users[0].viewPastOrders(app.orders);

app.users[0].giveRating(5, 4);

app.users[0].viewPastOrders(app.orders);

app.topNDishes(2);