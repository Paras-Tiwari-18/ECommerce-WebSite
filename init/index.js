const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listings.js");

const Mongo="mongodb://127.0.0.1:27017/bazaar";

main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(Mongo);
}

const initDB = async () => {
  await Listing.deleteMany({});
  //in data array add to the existing object a owner key with value of the user id
  initData.data = initData.data.map((obj)=>({
    ...obj,
    owner:'67979888b63453eeec8c4330',
  }));
  await Listing.insertMany(initData.data);
  console.log("data was initialized");
};

initDB();
