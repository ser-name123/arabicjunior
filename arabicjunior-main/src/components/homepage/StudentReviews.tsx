import { ReviewAuthorImage } from "@/assets";
import { GuardianReviewsCardType } from "@/types";
import { Star } from "lucide-react";
import Image from "next/image";
import React from "react";

const StudentReviews = () => {
  return (
    <React.Fragment>
      <section aria-label="student-reviews-home" className="pt-12 pb-14">
        <div className="container">
          <div>
            <div
              aria-label="reviews-top-home"
              className="max-w-[44.875rem] mx-auto mb-14"
            >
              <h3 className="text-4xl leading-tight sm:text-5xl sm:leading-tight font-bold text-neutral-800 mb-6 text-center">
                Our Happy <span className="text-orange-500">Students</span>
              </h3>
              <p className="text-sm sm:text-lg font-normal text-neutral-700 text-center">
                We believe in real outcomes, not just empty promises.
                Personalized teaching transforms learning every day. Hear what
                our students and parents say!
              </p>
            </div>

            <div
              aria-label="student-reviews-card-wrapper"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4"
            >
              <ReviewsCard />
            </div>
          </div>
        </div>
      </section>
    </React.Fragment>
  );
};

export default StudentReviews;

const REVIEWS_DATA: GuardianReviewsCardType[] = [
  {
    id: "jack",
    authorName: "Danial Jack",
    comment:
      "I wanted structured Arabic lessons for my daughter. These classes are now our go-to, and I recommend them to every parent.",
    image: {
      link: "/review-author.png",
      alt: "Arabic Juniors guardian photo",
      height: 408,
      width: 611,
    },
    profession: "Father",
    rating: 5,
  },
  {
    id: "sobiya",
    authorName: "SobiyaNaaz Momin",
    comment:
      "Rafat is a wonderful teacher and she teaches with a lot of care and patience . My 10 year old son had good support under her classes.",
    image: {
      link: "/Sobiya.png",
      alt: "Arabic Juniors guardian photo",
      height: 2731,
      width: 4096,
    },
    profession: "Mother",
    rating: 5,
  },
  {
    id: "aarav",
    authorName: "Aarav Mehta",
    comment:
      "Finding trusted Arabic tuition was tough. This program fits the UAE school curriculum perfectly. It’s now our go-to and I recommend it to every parent I know",
    image: {
      link: "/aarav-mehta.png",
      alt: "Arabic Juniors guardian photo",
      height: 800,
      width: 1095,
    },
    profession: "Father",
    rating: 5,
  },
];

interface ReviewCardProps {
  reviewData?: GuardianReviewsCardType[];
}

const ReviewsCard: React.FC<ReviewCardProps> = ({
  reviewData = REVIEWS_DATA,
}) => {
  return (
    <React.Fragment>
      {reviewData.map((review) => (
        <div
          key={review.id}
          aria-label="reviews-card"
          className="p-5 rounded-2xl border border-neutral-100 max-w-max transition-all ease-in-out duration-300 hover:bg-[#F5F5F5]"
        >
          <div className="mb-5">
            <div
              aria-label="author-image-wrapper"
              className="w-20 h-20 flex items-center justify-center mb-5"
            >
              <Image
                src={review.image.link}
                alt={review.image.alt}
                width={review.image.width}
                height={review.image.height}
                priority
                className="bg-[#CDE2F7] rounded-full h-full object-cover object-top"
              />
            </div>
            <h6
              aria-label="author-name"
              className="text-2xl font-medium text-neutral-900 mb-2"
            >
              {review.authorName}
            </h6>
            <p
              aria-label="profession"
              className="text-xl font-normal text-neutral-300"
            >
              {review.profession}
            </p>
          </div>

          <div
            aria-label="student-revies-star-wrapper"
            className="flex items-center gap-x-3 mb-8"
          >
            <Star className="text-yellow-500 fill-yellow-500" />
            <Star className="text-yellow-500 fill-yellow-500" />
            <Star className="text-yellow-500 fill-yellow-500" />
            <Star className="text-yellow-500 fill-yellow-500" />
            <Star className="text-yellow-500 fill-yellow-500" />
          </div>

          <p
            aria-label="review-text"
            className="text-lg sm:text-xl font-normal text-neutral-900"
          >
            {review.comment}
          </p>
        </div>
      ))}
    </React.Fragment>
  );
};
