import { Schema } from "mongoose";

export interface IEmployeeComment extends Document {
  _id: string,
  employeeId: string,
  commenterId: string,
  comment: string,
  rating: number
}
export const employeeCommentSchema = new Schema({
  employeeId: { type: Schema.Types.ObjectId, ref: 'User' },
  commenterId: { type: Schema.Types.ObjectId, ref: 'User' },
  comment: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 }
}, { timestamps: true });