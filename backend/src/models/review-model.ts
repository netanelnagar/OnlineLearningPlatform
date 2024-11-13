import { model, Schema } from "mongoose";
import { IReview } from "../types/review-types";

const reviewSchema = new Schema<IReview>(
     {
          courseId: { type: Schema.Types.ObjectId, ref: 'Courses', required: true },
          studentId: { type: Schema.Types.ObjectId, ref: 'Students', required: true },
          rating: { type: Number, required: true, min: 1, max: 5 },
          comment: { type: String },

     },
     { timestamps: true }
);

export const reviewModel = model<IReview>('reviewModel', reviewSchema, 'Reviews');