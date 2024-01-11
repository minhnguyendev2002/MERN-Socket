import mongoose from "mongoose";

const roomSchema = mongoose.Schema(
  {
    members: {
        type: Array,
    },
    title: {type: String, required : true},
    image: String,
    type: {
        type: String,
        default: 'multiple',
    }, // or single
    description: String,
  },
  {
    timestamps: true,
  }
);

var PostModel = mongoose.model("Rooms", roomSchema);

export default PostModel;
