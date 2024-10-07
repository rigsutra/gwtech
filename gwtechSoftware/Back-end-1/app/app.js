// app.js
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const cron = require("node-cron");
const cookieSession = require("cookie-session");
const dbConfig = require("./config/db.config");
const authRoutes = require("./routes/auth.routes");
const lotteryCategoryRoutes = require("./routes/admin/lotteryCategory.routes");
const gameCategoryRoutes = require("./routes/admin/gameCategory.routes");
const subAdminRoutes = require("./routes/admin/subAdmin.routes");
const winingNumberRoutes = require("./routes/admin/winingNumber.routes");
const superVisorRoutes = require("./routes/subAdmin/superVisor.routes");
const blockNumberRoutes = require("./routes/subAdmin/blockNumber.routes");
const limitButRoutes = require("./routes/subAdmin/limitBut.routes");
const subAdminSellerRoutes = require("./routes/subAdmin/seller.routes");
const paymentRoutes = require("./routes/subAdmin/paymentTerm.routes");
const ticketRoutes = require("./routes/subAdmin/ticket.routes");
const reports = require("./routes/subAdmin/reports.routes");
const sellerRoutes = require("./routes/seller/seller.routes");
const subadminWinNumberRoutes = require("./routes/subAdmin/winNumber.routes");
const superVisorsellerRoutes = require("./routes/superVisor/superVisor.seller.routes");
const superVisorreportRoutes = require("./routes/superVisor/superVisor.report.routes");
const superVisorWinNumber = require("./routes/superVisor/superVisor.winNumber.routes");
const SuperVisorSoldTickets = require("./routes/superVisor/superVisor.soldTickets.routes");

const compression = require("compression");
const zlib = require("zlib");

const app = express();

// app.use(cors({ origin: "http://localhost:3000" }));
const corsOptions = {
  origin: "http://localhost:3000",
  credentials: true, // Allow credentials (cookies, headers)
};
app.use(cors(corsOptions));

app.use(express.static("public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  cookieSession({
    name: "bezkoder-session",
    secret: "COOKIE_SECRET",
    httpOnly: true,
  })
);

app.set("trust proxy", true);

app.use(compression());
// Custom middleware to handle gzip data
app.use((req, res, next) => {
  if (req.headers["content-encoding"] === "gzip") {
    const gunzip = zlib.createGunzip();
    req.pipe(gunzip);
    let data = "";
    gunzip.on("data", (chunk) => {
      data += chunk;
    });
    gunzip.on("end", () => {
      req.body = JSON.parse(data);
      next();
    });
  } else {
    next();
  }
});

var bcrypt = require("bcryptjs");
const db = require("./models");
const User = db.user;
const GameCategory = db.gameCategory;

const createInitialGameNameData = async () => {
  try {
    const existGameCategory = await GameCategory.exists();
    if (existGameCategory) {
      console.log("Initial game category data already exists!");
      return;
    }

    const gameNameData = [
      { gameName: "BLT", positions: 3, requiredLength: 2 },
      { gameName: "L3C", positions: 1, requiredLength: 3 },
      { gameName: "L4C 1", positions: 1, requiredLength: 4 },
      { gameName: "L4C 2", positions: 1, requiredLength: 4 },
      { gameName: "L4C 3", positions: 1, requiredLength: 4 },
      { gameName: "L5C 1", positions: 1, requiredLength: 5 },
      { gameName: "L5C 2", positions: 1, requiredLength: 5 },
      { gameName: "L5C 3", positions: 1, requiredLength: 5 },
      { gameName: "MRG", positions: 6, requiredLength: 4 },
    ];

    await GameCategory.create(gameNameData);
  } catch (error) {
    console.error("Error creating initial data:", error);
  }
};

const createInitialAdminData = async () => {
  try {
    const existAdmin = await User.exists();
    if (existAdmin) {
      console.log("Initial user data already exists!");
      return;
    }

    const password = "happy0831";
    const hashedPassword = await bcrypt.hash(password, 10);
    const adminData = [
      { userName: "LuckyMan", role: "admin", password: hashedPassword },
    ];

    await User.create(adminData);
  } catch (err) {
    console.error("Error creating initial data:", err);
  }
};

db.mongoose
  // .connect(`mongodb://${dbConfig.HOST}:${dbConfig.PORT}/${dbConfig.DB}`, {
  .connect(`${dbConfig.DB}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then(async () => {
    console.log("Successfully connect to MongoDB.");

    User.createIndexes()
      .then(() => {
        createInitialAdminData();
      })
      .catch((err) => {
        console.error("Error creating indexes: ", err);
      });

    GameCategory.createIndexes()
      .then(() => {
        createInitialGameNameData();
      })
      .catch((err) => {
        console.error("Error creating indexes: ", err);
      });

    cron.schedule("0 0 * * *", cronTask);
  })
  .catch((err) => {
    console.error("Connection error", err);
    process.exit();
  });

function cronTask() {
  const LimitCalc = db.limitCalc;
  LimitCalc.collection
    .drop()
    .then(() => {
      console.log("Clean limit calc!");
    })
    .catch((error) => {
      console.error("Error clean limit calc collection: ", error);
    });
}

app.get("/", (req, res) => {
  res.json({ message: "Welcome to lottery application." });
});

authRoutes(app);
lotteryCategoryRoutes(app);
gameCategoryRoutes(app);
subAdminRoutes(app);
winingNumberRoutes(app);
superVisorRoutes(app);
blockNumberRoutes(app);
limitButRoutes(app);
subAdminSellerRoutes(app);
paymentRoutes(app);
ticketRoutes(app);
reports(app);
sellerRoutes(app);
subadminWinNumberRoutes(app);
superVisorsellerRoutes(app);
superVisorreportRoutes(app);
superVisorWinNumber(app);
SuperVisorSoldTickets(app);

module.exports = app;
