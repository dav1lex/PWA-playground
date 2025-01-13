# Exercise Tracker

## Table of Contents
- [Description](#description)
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Views](#views)
- [Service Worker](#service-worker)
- [Caching Strategy](#caching-strategy)
- [Project Documentation](#project-documentation)
- [Code Quality](#code-quality)

## Description

The Exercise Tracker is a progressive web application (PWA) that allows users to add, edit, delete, and view exercises. It is installable, uses native device features, works offline, and provides a consistent and responsive user experience across different devices.

## Features

1. **Installable**: Users can install the application on their device's home screen.
2. **Native Device Features**: Access to native device features such as push notifications and geolocation (if applicable).
3. **Offline Functionality**: The application works offline using Service Workers and the Cache API.
4. **Multiple Views**: The application has at least three views with a consistent flow.
5. **Hosted Online**: The application is hosted on a server and runs over a secure HTTPS connection.
6. **Responsive Design**: The application adjusts to different screen sizes.
7. **Performance**: The application loads quickly and runs smoothly.

## Installation

To install the application, follow these steps:
1. Open the application in your web browser.
2. Click on the "Add to Home Screen" prompt or use the share menu on iOS devices to add the app to your home screen.

## Usage

### Adding an Exercise
1. Fill out the exercise form with the exercise name, sets, reps, and weekday.
2. Click the "Add Exercise" button to add the exercise to the list.

### Viewing Exercises
1. Navigate through the days of the week to view the exercises for each day.
2. Click on the "Info" button to view detailed information about an exercise.

### Editing an Exercise
1. Click on the "Edit" button next to an exercise.
2. Modify the exercise details in the edit form and click "Save Changes."

### Deleting an Exercise
1. Click on the "Info" button next to an exercise.
2. Click the "Delete" button in the exercise info modal to delete the exercise.

### Offline Functionality
1. The application will inform you if you are offline and still allow you to add, edit, and view exercises.

## Views

1. **Home View**: Displays the form to add exercises and the list of exercises for each weekday.
2. **Edit View**: Provides a modal to edit exercise details.
3. **Info View**: Shows detailed information about an exercise and allows deletion.

## Service Worker

The application uses a service worker to cache resources and provide offline functionality. The service worker caches the necessary assets and fetches them from the cache when the user is offline.

## Caching Strategy

The service worker uses a caching strategy that caches all static resources and fetches them from the cache when offline. Dynamic content such as exercises is fetched from the network and updated in the cache.

## Project Documentation

### Function Explanations

1. **renderExercises()**: Fetches exercises from IndexedDB and displays them grouped by weekdays.
2. **enableDragAndDrop()**: Enables drag-and-drop functionality for reordering exercises.
3. **handleDragStart()**: Handles the start of a drag event.
4. **handleDragOver()**: Handles the drag over event to allow dropping.
5. **handleDrop()**: Handles the drop event to reorder exercises.
6. **handleDragEnd()**: Handles the end of a drag event.
7. **toggleExerciseDone()**: Toggles the completion status of an exercise.
8. **deleteExercise()**: Deletes an exercise from IndexedDB and updates the view.
9. **addExercise()**: Adds a new exercise to IndexedDB and updates the view.
10. **saveExerciseToDB()**: Saves an exercise to IndexedDB.
11. **editExercise()**: Fills the edit form with the selected exercise details.
12. **saveEditedExercise()**: Saves the edited exercise details to IndexedDB.
13. **updateExerciseInDB()**: Updates an exercise in IndexedDB.
14. **showExerciseInfo()**: Displays detailed information about an exercise in a modal.
15. **updateNetworkStatus()**: Updates the network status and informs the user of connectivity changes.

### Service Worker

The service worker is responsible for caching static assets and providing offline support. It uses the `Cache API` to store resources and serves them from the cache when the network is unavailable.

## Code Quality

The code follows best practices and is well-commented to ensure readability and maintainability. The project structure is organized, and the code is modular to future enhancements.

## Conclusion

The Exercise Tracker is a robust PWA that provides a seamless user experience with offline capabilities, native device feature integration, and responsive design. It is designed to be installable and provides clear documentation .

---

