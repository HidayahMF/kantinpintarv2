import mongoose from "mongoose";

const subCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "SubCategory name is required"],
      trim: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
    },
  },
  { timestamps: true }
);

const SubCategory = mongoose.model("SubCategory", subCategorySchema);

export default SubCategory;
