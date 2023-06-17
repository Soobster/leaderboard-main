/*
Helper function for computing the new global rating for a game when it 
receives a new rating, or a rating is updated, by another user
*/

import { db } from "../firebase.config";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export const computeNewRating = async (gameId) => {
  const gameSpecificReviewsRef = doc(db, "gameSpecificReviews", gameId);
  const specificReviewSnap = await getDoc(gameSpecificReviewsRef);
  const gameReviewData = specificReviewSnap.data();

  // doc.data() is never undefined for query doc snapshots
  let ratings = {
    0.5: 0,
    1: 0,
    1.5: 0,
    2: 0,
    2.5: 0,
    3: 0,
    3.5: 0,
    4: 0,
    4.5: 0,
    5: 0,
  };
  let reviewSum = 0;
  let reviewCount = 0;
  const reviews = gameReviewData.reviews;
  for (let i = 0; i < reviews.length; i++) {
    const reviewId = reviews[i];
    reviewCount += 1;
    const reviewRef = doc(db, "reviews", reviewId);
    const reviewSnap = await getDoc(reviewRef);
    const currentRating = reviewSnap.data().rating;
    ratings[currentRating] += 1;
    reviewSum += currentRating;
  }
  const globalRating = reviewSum / reviewCount;
  await updateDoc(doc(db, "gameSpecificReviews", gameId), {
    globalRating: globalRating,
    ratings: ratings,
  });
};
