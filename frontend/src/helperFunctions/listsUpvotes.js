/*
Helper function for liking and disliking for lists and tier lists
*/

import {
  arrayRemove,
  arrayUnion,
  doc,
  getDoc,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase.config";
import { uuidv4 } from "@firebase/util";

export const setListUpvoteSelection = async (
  collection,
  userID,
  listID,
  setUpvote,
  setDownvote
) => {
  const listDocRef = await doc(db, collection, listID);
  const listSnap = await getDoc(listDocRef);
  const upvotesArray = listSnap.get("upvotes");
  const downvotesArray = listSnap.get("downvotes");

  if (upvotesArray) {
    if (upvotesArray.includes(userID)) {
      setUpvote(true);
      setDownvote(false);
    } else if (downvotesArray.includes(userID)) {
      setUpvote(false);
      setDownvote(true);
    } else {
      setUpvote(false);
      setDownvote(false);
    }
  }
};

// if vote == 0 => downvote, else upvote
export const manageListVote = async (
  vote,
  collection,
  userID,
  ownerID,
  listID,
  setUpvote,
  setUpvotes,
  setDownvote,
  setDownvotes
) => {
  const listDocRef = await doc(db, collection, listID);
  const listSnap = await getDoc(listDocRef);
  const upvotesArray = listSnap.get("upvotes");
  const downvotesArray = listSnap.get("downvotes");
  const listName = listSnap.get("name");

  if (vote ? upvotesArray.includes(userID) : downvotesArray.includes(userID)) {
    await updateDoc(listDocRef, {
      [`${vote ? "upvotes" : "downvotes"}`]: arrayRemove(userID),
    });
    vote
      ? setUpvotes(--upvotesArray.length)
      : setDownvotes(--downvotesArray.length);
    vote ? setUpvote(false) : setDownvote(false);
  } else {
    if (
      vote ? downvotesArray.includes(userID) : upvotesArray.includes(userID)
    ) {
      await updateDoc(listDocRef, {
        [`${vote ? "downvotes" : "upvotes"}`]: arrayRemove(userID),
      });
      vote
        ? setDownvotes(--downvotesArray.length)
        : setUpvotes(--upvotesArray.length);
      vote ? setDownvote(false) : setUpvote(false);
    }
    await updateDoc(listDocRef, {
      [`${vote ? "upvotes" : "downvotes"}`]: arrayUnion(userID),
    });

    if (userID !== ownerID) {
      // set notification for user upvoting a review
      const listUserRef = await doc(db, "users", ownerID);
      const listUserSnap = await getDoc(listUserRef);
      const userRef = await doc(db, "users", userID);
      const userSnap = await getDoc(userRef);

      updateDoc(listUserRef, {
        notifications: arrayUnion({
          id: uuidv4(),
          createdAt: Timestamp.now(),
          senderId: userID,
          senderProfilePic: userSnap.get("profilePic"),
          text: `@${userSnap.get("username")} liked your ${
            collection === "tierlists" ? "Tier List" : "List"
          } "${listName}"!`,
          data: {
            username: userSnap.get("username"),
            listOwnerUsername: listUserSnap.get("username"),
            listType: collection === "tierlists" ? "tierlist" : "list",
            listID: listID,
          },
          seen: false,
          scenario: 1,
        }),
      });
    }

    vote
      ? setUpvotes(++upvotesArray.length)
      : setDownvotes(++downvotesArray.length);
    vote ? setUpvote(true) : setDownvote(true);
  }
};
