import mongoose from "mongoose";

const AddressSchema = new mongoose.Schema({
  street: String,
  city: String,
  state: String,
  zipCode: String,
  country: String,
  isDefault: {
    type: Boolean,
    default: false,
  },
});

const UserFullNameSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
});

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      select: false, // do not return password field by default
    },
    fullName: UserFullNameSchema,
    role: {
      type: String,
      enum: ["user", "seller"],
      default: "user",
    },
    addresses: [AddressSchema],
  },
  {
    timestamps: true,
  },
);

// Middleware to ensure only one default address and set first as default if none
UserSchema.pre("save", function () {
  if (!Array.isArray(this.addresses)) return;

  // Find indices marked as default
  const defaultIndices = [];
  for (let i = 0; i < this.addresses.length; i++) {
    if (this.addresses[i]?.isDefault === true) {
      defaultIndices.push(i);
    }
  }

  if (this.addresses.length > 0 && defaultIndices.length === 0) {
    // Set first address as default
    this.addresses[0].isDefault = true;
  } else if (defaultIndices.length > 1) {
    // Keep only the last default
    const keepIndex = defaultIndices[defaultIndices.length - 1];
    for (let i = 0; i < this.addresses.length; i++) {
      this.addresses[i].isDefault = i === keepIndex;
    }
  }
});

const UserModel = mongoose.model("User", UserSchema);

export default UserModel;
