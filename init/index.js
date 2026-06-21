if(process.env.NODE_ENV != "production"){
    require("dotenv").config();
}

const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const dbUrl = process.env.ATLASDB_URL;

main()
    .then(() => {
        console.log("connected to DB");
        initDB();
    })
    .catch((err) => {
        console.log(err);
    });

async function main() {
    await mongoose.connect(dbUrl);
}

const initDB = async () => {
    try {
        await Listing.deleteMany({});

        const listingsWithOwner = initData.data.map((obj) => ({
            ...obj,
            owner: "6a37c38106c910b8aef4ce7e"
        }));

        await Listing.insertMany(listingsWithOwner);

        console.log("Data was initialized successfully!");
        console.log(`Inserted ${listingsWithOwner.length} listings`);

        mongoose.connection.close();
    } catch (err) {
        console.log("Error initializing database:");
        console.log(err);
    }
};