/*
Helper function for making a notification if a user receives a comment on one of their
lists or reviews. Adds the notification to the user object
*/

import {
  arrayUnion,
  doc,
  getDoc,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase.config";
import { uuidv4 } from "@firebase/util";

// set notification for user creating a comment
export const commentNotification = async (
  userID,
  commentOwnerID,
  listData = null,
  gameData = null
) => {
  if (userID !== commentOwnerID) {
    const commentUserRef = await doc(db, "users", commentOwnerID);
    const userRef = await doc(db, "users", userID);
    const userSnap = await getDoc(userRef);
    let listOwnerRef;
    let listOwnerSnap;
    if (listData) {
      listOwnerRef = await doc(db, "users", listData.ownerID);
      listOwnerSnap = await getDoc(listOwnerRef);
    }

    const text = gameData
      ? `@${userSnap.get("username")} commented on your review for ${
          gameData.gameTitle
        } (${gameData.gameReleaseDate})!`
      : `@${userSnap.get("username")} commented on your ${
          listData.collection === "tierlists" ? "Tier List" : "List"
        } "${listData.name}"!`;

    updateDoc(commentUserRef, {
      notifications: arrayUnion({
        id: uuidv4(),
        createdAt: Timestamp.now(),
        senderId: userID,
        senderProfilePic: userSnap.get("profilePic"),
        text: text,
        data: {
          // game data if passed in (reviews)
          gameId: gameData ? gameData.gameId : null,
          gameCover: gameData ? gameData.gameCover : null,
          gameTitle: gameData ? gameData.gameTitle : null,
          gameReleaseDate: gameData ? gameData.gameReleaseDate : null,
          // list data if passed in
          listOwnerUsername: listData ? listOwnerSnap.get("username") : null,
          listType: listData
            ? listData.collection === "tierlists"
              ? "tierlist"
              : "list"
            : null,
          listID: listData ? listData.id : null,
          username: userSnap.get("username"),
        },
        seen: false,
        scenario: 6,
      }),
    });
  }
};
