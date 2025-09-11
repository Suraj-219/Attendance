const mongoose = require("mongoose")


function connectDB(){
    mongoose.connect(process.env.MONGO_URI).then(()=>{
        console.log("Connected Somnath EXs Database");
        
    }).catch(()=>{
        console.log("Error");
        
    })
}


module.exports = connectDB