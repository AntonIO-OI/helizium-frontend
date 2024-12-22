import { getUser, updateUser } from '../data/mockUsers';

export function updateUserRating(userId: number, newRating: number): boolean {
  const user = getUser(userId);
  if (!user) return false;

  const currentTotalScore = user.rating * user.reviewsCount;
  const newTotalScore = currentTotalScore + newRating;
  const newReviewsCount = user.reviewsCount + 1;
  const calculatedRating = newTotalScore / newReviewsCount;

  const updatedUser = {
    ...user,
    rating: Number(calculatedRating.toFixed(1)),
    reviewsCount: newReviewsCount
  };

  return updateUser(updatedUser);
} 