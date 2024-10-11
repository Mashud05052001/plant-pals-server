# Project Name: Plant Pals Backend

## Live URL: **[Plant Pals Client](https://plant-pals-client.vercel.app)**

## Backend URL: **[Plant Pals Server](https://plant-pals-server.vercel.app)**

## Features

- **User Authentication and Authorization**: Secure user sign-up and login processes.
- **Profile Management**: Users can create and manage their profiles.
- **Post Sharing**: Users can share gardening experiences through text and images.
- **Engagement Features**: Upvote, downvote, and comment on posts to enhance community interaction.
- **Premium Posts**: Verified users can promote their posts for greater visibility.
- **Follow System**: Users can follow each other to stay updated on their activities.
- **Robust Validation and Error Handling**: Ensures data integrity and provides clear feedback.
- **Comprehensive Data Models**: Well-structured MongoDB models for user and post management.

# Setup Process

## Step-1

You can simply download my repository or copy the https url and run on cmd the following code on your desire directory.

```bash
git clone your_copied_https_git_url
```

## Step-2

Now simple install the all dependencies & devDependencies by run the following code on cmd inside of the created folder.

```bash
npm install
```

## Step-3

Now create a .env file & provide your NODE_ENV, PORT & DATABASE_URL on root directory as similar I given. Strictly follow these name otherways you also go to update the name of these environment variables to go to app->config->index.ts file.

## Step-4 Simply run those code in cmd / terminal as per your required

- After updating ts file convert all ts to js simply run

```bash
npm run build
```

- To run using only node

```bash
npm start
```

- To run the code only in development mode

```bash
npm run start:dev
```

- To run the everytime updating & transform also ts to js after every update you can run the code

```bash
npm run start:prod
```

- To check the errors of code, run

```bash
npm run lint
```

- To check the errors of code, run

```bash
npm run lint
```

- To fix those errors of code autometically, run

```bash
npm run lint:fix
```

- To check the code formation of your code, run

```bash
npm run prettier
```
