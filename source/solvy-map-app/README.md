# Solvy Map App

## Overview
Solvy Map App is a React Native application that allows users to select a location for services similar to popular applications like Uber, Cabify, Rappi, or Pedidos Ya. The app features an interactive map interface where users can easily choose their desired location.

## Features
- **Map Selector**: Users can select a location on the map using the `MapSelector` component.
- **Location Marker**: The app displays a marker at the selected location using the `LocationMarker` component.
- **Home Screen**: The main entry point of the application that integrates the map and displays the current selected location.
- **Location Selection Screen**: A dedicated screen for users to confirm their selected location and proceed with the service.
- **Navigation**: The app uses React Navigation to manage the navigation between screens.

## Installation
1. Clone the repository:
   ```
   git clone https://github.com/yourusername/solvy-map-app.git
   ```
2. Navigate to the project directory:
   ```
   cd solvy-map-app
   ```
3. Install the dependencies:
   ```
   npm install
   ```

## Usage
1. Start the application:
   ```
   npm start
   ```
2. Open the app on your mobile device or emulator.

## Components
- **MapSelector**: Integrates a map view for selecting locations.
- **LocationMarker**: Displays a marker on the map at the selected coordinates.
- **HomeScreen**: Main screen that includes the map and selected location.
- **LocationSelectScreen**: Screen for confirming the selected location.

## Utilities
- **locationHelpers**: Contains utility functions for handling location data.

## Assets
The `assets` directory contains images and icons used throughout the application.

## Contributing
Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License
This project is licensed under the MIT License. See the LICENSE file for details.