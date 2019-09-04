const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
    url: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
})

const dbSchema = mongoose.model('dbSchema', schema);
module.exports = dbSchema;