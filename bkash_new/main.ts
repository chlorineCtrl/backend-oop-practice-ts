class User {
  name: string;
  phoneNumber: string;
  balance: number;

  constructor(name: string, phoneNumber: string, balance: number) {
    this.name = name;
    this.phoneNumber = phoneNumber;
    this.balance = balance;
  }

  viewBalance() {
    return this.balance;
  }

  transferBalance(recipientNumber: string, amount: number, users: User[], transactionsTable: Transaction[]) {
    if (this.balance < amount) {
      console.log("Insufficient amount!");
      return;
    }

    const recipient = users.find(user => user.phoneNumber === recipientNumber);

    if (!recipient) {
      console.log("Invalid number!");
      return;
    }

    const newTransaction: Transaction = {
      sender: this.phoneNumber,
      recipient: recipientNumber,
      amount,
      datetime: new Date(),
      type: "personal",
    };

    this.balance -= amount;
    recipient.balance += amount;

    transactionsTable.push(newTransaction);
  }

  payBill(providerName: string, amount: number, providers: UtilityProvider[], transactionsTable: Transaction[], promo?: string, promoCodes?: PromoCode[]) {
    if (this.balance < amount) {
      console.log("Insufficient amount!");
      return;
    }

    const provider = providers.find(provider => provider.name === providerName);

    if (!provider) {
      console.log("Invalid provider!");
      return;
    }

    if (promo && promoCodes) {
      const promoCode = promoCodes.find(promoCode => promoCode.code === promo);
      if (promoCode) {
        amount = promoCode.apply(amount, this);
      }
    }

    const newTransaction: Transaction = {
      sender: this.phoneNumber,
      recipient: provider.phoneNumber,
      amount,
      datetime: new Date(),
      type: "bill",
      utilityName: provider.name,
    };

    this.balance -= amount;
    provider.balance += amount;

    transactionsTable.push(newTransaction);
  }

  viewTransactions(transactionsTable: Transaction[]) {
    const transactions = transactionsTable.filter((transaction) => (
      this.phoneNumber === transaction.sender || this.phoneNumber === transaction.recipient
    ));

    transactions.forEach(transaction => {
      console.log(
        `Datetime: ${transaction.datetime}\n` +
          `Type: ${transaction.type}\n` +
          transaction.utilityName ? `Utility Provider: ${transaction.utilityName}\n` : `` +
          `Amount: ${transaction.amount}\n` +
          `Sender: ${transaction.sender} \n` +
          `Recipient: ${transaction.recipient}\n` +
        `---------`
      );
    });
  }
}

type Transaction = {
  sender: string;
  recipient: string;
  amount: number;
  type: "personal" | "bill";
  utilityName?: string;
  datetime: Date;
};


class UtilityProvider extends User {
  constructor(name: string, phoneNumber: string, balance: number) {
    super(name, phoneNumber, balance);
  }
}

type PromoCodeUsers = {
  [phoneNumber: string]: number;
};

class PromoCode {
  code: string;
  maxAmount: number;
  cashbackAmount: number;
  totalCashback: number;
  timesUsed: number;
  promoCodeUsers: PromoCodeUsers;

  constructor(code: string, maxAmount: number, cashBackAmount: number) {
    this.code = code;
    this.maxAmount = maxAmount;
    this.cashbackAmount = cashBackAmount;
    this.totalCashback = 0;
    this.timesUsed = 0;
    this.promoCodeUsers = {};
  }

  apply(amount: number, user: User) {
    if (!this.promoCodeUsers[user.phoneNumber])
      this.promoCodeUsers[user.phoneNumber] = 0;

    if (this.promoCodeUsers[user.phoneNumber] >= this.maxAmount)
      return amount;

    amount -= this.cashbackAmount;
    this.timesUsed++;
    this.promoCodeUsers[user.phoneNumber]++;
    this.totalCashback += this.cashbackAmount;

    if (amount < 0) {
      this.totalCashback += amount;
      amount = 0;
    }

    return amount;
  }

}

class App {
  users: User[];
  utilityProviders: UtilityProvider[];
  transactions: Transaction[];
  promoCodes: PromoCode[];

  constructor() {
    this.users = [];
    this.utilityProviders = [];
    this.transactions = [];
    this.promoCodes = [];
  }

  addUser(name: string, phoneNumber: string, balance: number) {
    this.users.push(new User(name, phoneNumber, balance));
  }

  addUtilityProvider(name: string, phoneNumber: string, balance: number) {
    this.utilityProviders.push(new UtilityProvider(name, phoneNumber, balance));
  }

  addPromoCode(code: string, maxAmount: number, cashBackAmount: number) {
    this.promoCodes.push(new PromoCode(code, maxAmount, cashBackAmount));
  }

  viewTopNUsersBasedOnTransactions(n: number) {
    const userHistories = this.users.map((user) => {
      return this.transactions.filter(transaction => transaction.sender === user.phoneNumber);
    });

    userHistories.sort((a, b) => b.length - a.length).slice(0, n);

    userHistories.forEach((history) => {
      if (history.length > 0) {
        console.log(
          `Phone Number: ${history[0]?.sender}\n` +
          `Total transactoins: ${history.length}\n` +
          `---------`
        );
      }

    });
  }

  viewPromoCodeStats() {
    for (let i = this.promoCodes.length - 1; i >= 0; i--) {
      console.log(
        `Promo Code: ${this.promoCodes[i].code}\n` +
        `Total Uses: ${this.promoCodes[i].timesUsed}\n` +
        `Average Use: ${this.promoCodes[i].timesUsed / this.users.length}\n` +
        `Total Cashback: ${this.promoCodes[i].totalCashback}\n` +
        `---------`
      );
    }
  }
}

const app = new App();

app.addUser("a", "01", 100);
app.addUser("b", "02", 100);
app.addUser("c", "03", 100);
app.addUser("d", "04", 100);

app.addUtilityProvider("electricity", "011", 100);
app.addUtilityProvider("water", "012", 100);
app.addUtilityProvider("gas", "013", 100);

console.log(app.users[0].viewBalance());

app.users[0].transferBalance("02", 50, app.users, app.transactions);
app.users[1].transferBalance("01", 50, app.users, app.transactions);

app.users[0].payBill("electricity", 50, app.utilityProviders, app.transactions);

console.log(app.users[0].viewBalance());

app.addPromoCode("save10", 1, 10);

app.users[0].payBill("electricity", 10, app.utilityProviders, app.transactions, "save10", app.promoCodes);

console.log(app.users[0].viewBalance());

app.users[0].payBill("electricity", 10, app.utilityProviders, app.transactions, "save10", app.promoCodes);
console.log(app.users[0].viewBalance());

app.viewTopNUsersBasedOnTransactions(3);
app.viewPromoCodeStats();