/*
Helper function for checking if a game exists within the db. If it does, it returns the object,
otherwise, it makes a call to IGDB to get the game data, add it to the cache, then returning the
object
*/

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  writeBatch,
} from "firebase/firestore";
import { db } from "../firebase.config";

export const checkGameCache = async (gameIDs) => {
  let uncachedIds = [];
  let retArr = [];
  const cachedGamesDictionary = {};
  const gamesSnapshot = await getDocs(collection(db, "games"));
  const batch = writeBatch(db);

  for (const game of gamesSnapshot.docs) {
    cachedGamesDictionary[game.id] = game.data();
  }

  for (const gameID of gameIDs) {
    if (gameID in cachedGamesDictionary) {
      // console.log(`[CACHE]: gameID ${gameID} already cached`)
      retArr.push(cachedGamesDictionary[gameID]);
    } else {
      uncachedIds.push(gameID);
    }
  }

  // console.log(
  // 	uncachedIds.length ? `[CACHE]: uncachedIds about to be cached: \n${uncachedIds}` : "[CACHE]: all games currently displayed are already cached :)"
  // )
  if (uncachedIds.length) {
    // retrieve from IGDB uncached games' object
    const res =
      await fetch(`https://us-central1-leaderboard-758d3.cloudfunctions.net/app/api/games/fields *, cover.url, platforms.name,
			genres.name, release_dates.y, involved_companies.developer, involved_companies.company.name, similar_games, screenshots.url; where id = (${uncachedIds.join(
        ","
      )}); limit 500;`);
    const fetchedData = await res.json();
    // cache each uncached game
    for (let i = 0; i < fetchedData.length; i++) {
      // console.log(`[CACHE]: Caching game ${fetchedData[i].id}`)
      // Cache new game in collection "games"
      // await setDoc(doc(db, "games", `${fetchedData[i].id}`), fetchedData[i])
      batch.set(doc(db, "games", `${fetchedData[i].id}`), fetchedData[i]);
      retArr.push(fetchedData[i]);
    }
    batch.commit();
    console.log(`[CACHE]: Performed game cache.`);
  }

  return retArr;
};

export const checkGameCacheBySearchTerm = async (searchTerm) => {
  const searchTermRef = doc(db, "searchTerms", `${searchTerm}`);
  const searchTermSnap = await getDoc(searchTermRef);

  if (searchTermSnap.exists()) {
    // console.log(`[CACHE]: search term '${searchTerm} 'already cached`)
    return await checkGameCache(searchTermSnap.data().results);
  } else {
    // console.log(`[CACHE]: caching search term '${searchTerm}'`)
    const gameResultsIds = [];
    const results = [];
    const res =
      await fetch(`https://us-central1-leaderboard-758d3.cloudfunctions.net/app/api/games/fields 
				name, rating, release_dates.y, cover.url; search "${searchTerm}"; limit 24; 
				where cover != null & release_dates != null & summary != null;`);
    const fetchedData = await res.json();
    if (fetchedData.length) {
      for (let i = 0; i < fetchedData.length; i++) {
        gameResultsIds.push(fetchedData[i].id);
        results.push(fetchedData[i]);
      }
      await setDoc(doc(db, "searchTerms", `${searchTerm}`), {
        results: gameResultsIds,
      });
    }
    console.log(`[CACHE]: Performed searchTerm cache.`);

    return results;
  }
};
