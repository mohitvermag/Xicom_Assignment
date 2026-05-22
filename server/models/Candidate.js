const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema(
  {
    fileName: {
      type: String,
      required: true,
      trim: true,
    },
    fileType: {
      type: String,
      required: true,
      trim: true,
    },
    fileUrl: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    _id: false,
  }
);

const addressSchema = new mongoose.Schema(
  {
    street1: {
      type: String,
      trim: true,
      default: '',
    },
    street2: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    _id: false,
  }
);

const candidateSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    dob: {
      type: Date,
      required: true,
    },
    residentialAddress: {
      type: addressSchema,
      required: true,
    },
    permanentAddress: {
      type: addressSchema,
      required: true,
    },
    sameAsResidential: {
      type: Boolean,
      default: false,
    },
    documents: {
      type: [documentSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Candidate', candidateSchema);
