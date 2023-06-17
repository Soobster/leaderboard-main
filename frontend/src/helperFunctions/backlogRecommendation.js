/*
Helper function for removing a game from the Recommened for You component if
the user has added that game to their backlog
*/

import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase.config";

export const removeBacklogGameFromRecommended = async (userID, gameID) => {
  const userRef = doc(db, "users", userID);
  const docSnap = await getDoc(userRef);
  let recommended = docSnap.get("recommended");
  let topRecommended = docSnap.get("topRecommended");

  // delete game from recommended property of user
  if (gameID in recommended) delete recommended[gameID];
  // delete game topRecommended property of user
  const indexOfGame = topRecommended.indexOf(
    topRecommended.find((game) => parseInt(game) === parseInt(gameID))
  );
  if (indexOfGame > -1) topRecommended.splice(indexOfGame, 1);

  // update user's properties in database
  await updateDoc(userRef, {
    recommended: recommended,
    topRecommended: topRecommended,
  });
};
