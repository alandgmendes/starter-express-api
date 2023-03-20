const mongoose = require("mongoose");

// Point schema

const PointSchema = new mongoose.Schema({
    lat: {
        type: String,
    },

    long: {
        type: String,
    },

    obs: {
        type: String,
    },

    base64img: {
        type: String
    },

    author : {
        type: String
    },
    datetime : {
        type: String
    }
    
    });

// export PointSchema
module.exports = mongoose.model.Points || mongoose.model("Points", PointSchema);
