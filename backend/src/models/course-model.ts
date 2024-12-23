import { model, Schema } from "mongoose";
import { ICourse, ILesson } from "../types/course-types";
import aws from "../utils/aws";


const lessonSchema = new Schema<ILesson>({
     // @ts-ignore
     _id: false, // To enable embedding lessons in courses
     title: { type: String, required: true, unique: true },
     videoUrl: { type: String, required: true },
     content: { type: String },
     duration: { type: Number },
     resources: [
          {
               _id: false,
               type: { type: String }, // e.g., "pdf", "link"
               url: { type: String }
          },
     ],
});

const courseSchema = new Schema<ICourse>(
     {
          title: { type: String, required: true, unique: true, lowercase: true },
          description: { type: String, required: true },
          thumbnail: { type: String },
          category: { type: String },
          createdBy: { type: Schema.Types.ObjectId, ref: 'Teachers', required: true },
          lessons: [lessonSchema],
          studentsEnrolled: [
               {
                    _id: false,
                    studentId: { type: Schema.Types.ObjectId, ref: 'Students' },
                    enrollmentDate: { type: Date, default: Date.now }
               }
          ],
          rating: {
               amount: { type: Number, default: 0 },
               total: { type: Number, default: 0 },
          },
          price: { type: Number, default: 0 },
          published: { type: Boolean, default: false }
     },
     {
          timestamps: true,
          autoIndex: true
     }
);


courseSchema.virtual('reviews', {
     ref: 'Reviews',
     foreignField: 'courseId',
     localField: '_id'
});

courseSchema.pre(/^find/, function (next) {
     // @ts-ignore
     this.find({ published: true })

     next();
})

courseSchema.post(/^find/, async function (result, next) {

     if (Array.isArray(result)) {
          for (const doc of result) {
               doc.thumbnail = doc.thumbnail ? await aws.getImageUrl(doc.thumbnail) : "";
               for (const lesson of doc.lessons) {
                    lesson.videoUrl = await aws.getImageUrl(lesson.videoUrl);
               }
          }
     } else {
          result.thumbnail = result.thumbnail ? await aws.getImageUrl(result.thumbnail) : "";
          for (const lesson of result.lessons) {
               lesson.videoUrl = await aws.getImageUrl(lesson.videoUrl);
          }
     }

     next();
})


export const Courses = model('Courses', courseSchema, 'Courses');
