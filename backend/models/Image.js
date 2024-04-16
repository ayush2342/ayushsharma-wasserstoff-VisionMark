const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
  imageData: {
    type: String,
    required: true,
  },
  annotations: [
    {
      label: {
        type: String,
        required: true,
      },
      boundingBox: {
        type: {
          x1: { type: Number, required: true },
          y1: { type: Number, required: true },
          x2: { type: Number, required: true },
          y2: { type: Number, required: true },
        },
        required: true,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Image = mongoose.model('Image', imageSchema);

module.exports = Image;
