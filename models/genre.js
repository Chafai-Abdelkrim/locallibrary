const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const GenreScheme = new Schema({
  name: { type: String, required: true, minLength: 3, maxLength: 100 },
});

GenreScheme.virtual("url").get(function () {
  return `/catalog/genre/${this._id}`;
});

module.exports = mongoose.model("Genre", GenreScheme);
