# Leaderboard

A social video game ranking and review website. Leaderboard lets you find your favorite games and lets you rate them how you want. In addition, you can backlog games, create lists and tier lists and find your friends, and see what they thought about certain games.

## Platforms

This project was made with [React](https://react.dev/), a framework maintained by Facebook that lets you build user interfaces out of individual pieces called components. Many [Material UI](https://mui.com/) components were used to make the website look professional. Additionally, [Firebase](https://firebase.google.com/) was used as a Backend as a Service (more on this below). All the game information in this project is extracted from the Internet Game Database's [API](https://api-docs.igdb.com/#getting-started).

## Available Scripts

This project has a local backend that used to run IGDB API calls. But the entire React project was moved to the `frontend` as we now use Firebase Functions to call the IDGB API. Therefore:

```bash
cd frontend
```

If you just pulled new changes that used new packages not in this version of the app, you may want to run the following command (otherwise you may get import errors):

```bash
npm i
```

To run the app in development mode, run:

```bash
npm start
```

Which opens the app at http://localhost:3000 in your browser. The page will reload when you make changes. Check your console and/or browser developer tools for `console.log()` statements and/or debugging.

Additionally, to build the app for production to the build folder, use the following:

```bash
npm run build
```

It correctly bundles the React project in production mode and optimizes the build for the best performance.
The build is minified and the filenames include the hashes. Your app is ready to be deployed using this folder. We used Firebase Hosting for this.

## Firebase

Firebase is an app development platform that helps you build and grow apps and games users love. Backed by Google and trusted by millions of businesses around the world. Please read more [here](https://firebase.google.com/). It is also the BaaS that is used for this project, including the database, hosting functionality and cloud callable functions. For the following functionality regarding Firebase, please make sure you are logged into it using Firebase's [CLI](https://firebase.google.com/docs/cli).

## [Firebase Hosting](https://firebase.google.com/docs/hosting)

This project is hosted on Firebase Hosting. After you have created the build folder (and make sure is not an old version), you could then run:

```bash
firebase deploy --only hosting
```

This will deploy the app and showcase it in the URL you specified in the project settings online.

More info [here](https://firebase.google.com/docs/hosting/test-preview-deploy).

## [Firebase Functions](https://firebase.google.com/docs/functions)

Cloud Functions for Firebase is a serverless framework that lets you automatically run backend code in response to events triggered by Firebase features and HTTPS requests. We use this framework to run functions regarding recommendation of games to users, trending games and deleting accounts functionality.

To check/add/edit/delete functions, please go to `index.js` file in the `functions` folder. From the root folder:

```bash
cd frontend/functions
```

If you want to deploy all functions inside this file, run:

```bash
firebase deploy --only functions
```

If you just created one function, say `foo()`, and want to deploy it without messing with the rest of the functions, run:

```bash
firebase deploy --only functions:foo
```

More on functions [here](https://firebase.google.com/docs/functions/callable).
Additionally, you can then run functions locally to check how they would behave when deployed with:

```bash
firebase functions:shell
```

More on this [here](https://firebase.google.com/docs/functions/local-shell). The shell was used to test our functions locally, but there are other ways as well that can be found in the documentation.

## Authors and acknowledgment

We are a team of four undergraduate software engineers attending the University of Utah. Our team has designed and developed this site from the ground up for our senior capstone project. We are driven and passionate about creating a feature-rich and user friendly site that will achieve not only our goal to create a polished final product, but also fulfill the desires of our end users. Team members: Subhan "Sooby" Mahmood, Jose Matute, Amanda Shepherd and Hyrum Schenk.
