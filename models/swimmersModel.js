// Require Mongoose
const mongoose = require("mongoose");

// Define a schema
const Schema = mongoose.Schema;

const SwimmerSchema = new Schema({
    name: String,
    country: String,
    stroke: String
}, {
    toJSON: {virtuals: true}
});

SwimmerSchema.virtual("_links").get(
    function () {
        return {
            self: {
                href: `${process.env.BASE_URI}swimmers/${this._id}`
            },
            collection: {
                href: `${process.env.BASE_URI}swimmers/`
            }
        }

    }
)

// Export function to create "SomeModel" model class
module.exports = mongoose.model("Swimmer", SwimmerSchema);