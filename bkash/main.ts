class User {
  balance: number;
  phoneNumber: string;
  transactionHistory: Transaction[];

  constructor(balance: number, phoneNumber: string) {
    this.balance = balance;
    this.phoneNumber = phoneNumber;
    this.transactionHistory = [];
  }

  viewBalance() {
    console.log(`${this.phoneNumber} balance: ${this.balance}`);
  }

  transferBalance(users: User[], recipientPhoneNumber: string, amount: number, transactionTable: TransactionTable) {
    if (this.balance < amount) {
      console.log("Insufficient balance\n");
      return;
    }

    const recipient = users.find(user => user.phoneNumber === recipientPhoneNumber);

    if (!recipient) {
      console.log("Recipient not found!");
      return;
    }

    this.balance -= amount;
    recipient.balance += amount;

    const newTransaction: Transaction = {
      type: "personal",
      senderPhoneNumber: this.phoneNumber,
      recipientPhoneNumber,
      amount,
      datetime: new Date()
    };

    this.transactionHistory.push(newTransaction);
    recipient.transactionHistory.push(newTransaction);
    transactionTable.transactions.push(newTransaction);
  }

  payBill(
    UtilityProviders: UtilityProvider[],
    providerName: string,
    amount: number,
    transactionTable: TransactionTable,
    promoCode?: string,
    promoTable?: PromoCode[],
  ) {
    if (this.balance < amount) {
      console.log("Insufficient balance");
      return;
    }

    const utilityProvider = UtilityProviders.find(utilityProvider => utilityProvider.name === providerName);

    if (!utilityProvider) {
      console.log(`${providerName} is not a registered utility provider!`);
      return;
    }

    if (promoCode && promoTable) {
      const promo = promoTable.find(promo => promo.code === promoCode);
      if (promo && promoTable[this.phoneNumber] < promo.maxUsePerUser) {
        amount = promo.applyPromo(amount);
        promoTable[this.phoneNumber]++;
      }
    }

    this.balance -= amount;
    utilityProvider.balance += amount;

    const newTransaction: Transaction = {
      type: "bill",
      senderPhoneNumber: this.phoneNumber,
      recipientPhoneNumber: utilityProvider.phoneNumber,
      utilityProviderName: providerName,
      amount,
      datetime: new Date()
    };

    this.transactionHistory.push(newTransaction);
    utilityProvider.transactionHistory.push(newTransaction);
    transactionTable.transactions.push(newTransaction);
  }

  viewTransactions() {
    for (let i = this.transactionHistory.length - 1; i >= 0; i--) {
      console.log(
        `Transaction No. ${i + 1}`
      );
      const transaction = this.transactionHistory[i];

      if (transaction.type == "personal") {
        console.log(
          `Recipient's number: ${transaction.recipientPhoneNumber}`
        );
      } else {
        console.log(
          `Utility Provider Name: ${transaction.utilityProviderName}`
        );
      }

      console.log(
        `Amount: ${transaction.amount}\nDate: ${transaction.datetime.toString()}\n`
      );
    }
  }
}

class UtilityProvider extends User {
  name: string;

  constructor(name: string, balance: number, phoneNumber: string) {
    super(balance, phoneNumber);
    this.name = name;
  }
}



type Transaction = {
  type: "personal" | "bill";
  senderPhoneNumber: string;
  recipientPhoneNumber: string;
  amount: number;
  datetime: Date;
  utilityProviderName?: string;
};

class TransactionTable {
  transactions: Transaction[];

  constructor() {
    this.transactions = [];
  }

  topNUsers(n: number, users: User[]) {
    const topNUsers = users
      .sort((a, b) => b.transactionHistory.length - a.transactionHistory.length)
      .slice(0, n);

    topNUsers.forEach(user => {
      let amount = 0;
      user.transactionHistory.forEach(trasaction => amount += trasaction.amount);

      console.log(
        `Phone Number: ${user.phoneNumber}\n` +
        `Total transactions: ${user.transactionHistory.length}\n` +
        `Total amount: ${amount}`
      );
    });
  }
}

class PromoCode {
  code: string;
  totalUse: number;
  maxUsePerUser: number;
  cashbackAmount: number;
  totalCashbackAmount: number;

  constructor(code: string, cashbackAmount: number, maxUsePerUser: number) {
    this.code = code;
    this.totalUse = 0;
    this.cashbackAmount = cashbackAmount;
    this.maxUsePerUser = maxUsePerUser;
  }

  applyPromo(amount: number) {
    amount -= this.cashbackAmount;
    this.totalCashbackAmount += this.cashbackAmount;
    this.totalUse++;

    if (amount < 0) this.totalCashbackAmount += amount;
    return amount > 0 ? amount : 0;
  }
}

class PromoTable {
  promos: PromoCode[];
  userHistory: {
    [user: string]: number;
  };

  constructor() {
    this.promos = [];
  }

  addPromo(promo: PromoCode) {
    this.promos.push(promo);
  }

  viewTopStats(users: User[]) {
    for (let i = this.promos.length - 1; i >= 0; i--) {
      const promo = this.promos[i];
      console.log(
        `Promo Code: ${promo.code}\n` +
        `Total uses: ${promo.totalUse}\n` +
        `Average use: ${this.promos.length / users.length}\n` +
        `Total cashback: ${promo.totalCashbackAmount}`
      );
    }
  }
}

class App {
  users: User[];
  utilityProviders: UtilityProvider[];
  transactionTable: TransactionTable;
  promoTable: PromoTable;

  constructor() {
    this.users = [];
    this.utilityProviders = [];
    this.transactionTable = new TransactionTable();
    this.promoTable = new PromoTable();
  }

  addUser(user: User) {
    this.users.push(user);
  }

  addUtilityProvider(utilityProvider: UtilityProvider) {
    this.utilityProviders.push(utilityProvider);
  }

}

const app = new App();

app.addUser(new User(100, "01"));
app.addUser(new User(100, "02"));
app.addUser(new User(100, "03"));

app.addUtilityProvider(new UtilityProvider("electricity", 100, "011"));
app.addUtilityProvider(new UtilityProvider("water", 100, "012"));
app.addUtilityProvider(new UtilityProvider("gas", 100, "013"));


app.promoTable.addPromo(new PromoCode("save10", 10, 1));

app.users[0].viewBalance();

// app.users[0].transferBalance(app.users, "02", 200, app.transactionTable);
app.users[0].transferBalance(app.users, "02", 50, app.transactionTable);
app.users[0].transferBalance(app.users, "03", 10, app.transactionTable);
app.users[0].payBill(app.utilityProviders, "electricity", 20, app.transactionTable);
// app.users[0].transferBalance(app.users, "04", 10, app.transactionTable);

app.users[0].viewTransactions();

app.users[1].viewBalance();
// app.users[1].payBill(app.utilityProviders, "real", 20, app.transactionTable);
app.users[1].payBill(app.utilityProviders, "electricity", 20, app.transactionTable);

app.users[1].viewTransactions();
app.utilityProviders[0].viewTransactions();

app.transactionTable.topNUsers(2, app.users);






