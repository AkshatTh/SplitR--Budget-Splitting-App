const mongoose = require ('mongoose');
const colors = require ('colors');


const connectDB = async () => {
    try{
        const conn = await mongoose.connect(process.env.MONGO_URI)
        console.log(`MongoDb connected!", ${conn.connection.host}`.cyan.underline)
    } catch (error) {
        console.log(`Error connecting to MongoDb: ${error}`.red.bold);
        process.exit(1);
    }
}

module.exports = connectDB