const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('node:path');

// Array to store activities
let activities = [
  { id: 1, name: "Hiking", equipment: "Water, Map, Snacks, Hiking Boots", minTemp: 15, maxTemp: 30 },
  { id: 2, name: "Camping", equipment: "Tent, Sleeping Bag, Food, Flashlight", minTemp: 10, maxTemp: 25 }
];

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // Load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
};

// CRUD Handlers
ipcMain.handle('read-activities', () => activities);

ipcMain.handle('create-activity', (event, newActivity) => {
  newActivity.id = Date.now(); // Assign a unique ID
  activities.push(newActivity);
  return activities;
});

ipcMain.handle('update-activity', (event, updatedActivity) => {
  const index = activities.findIndex(activity => activity.id === updatedActivity.id);
  if (index !== -1) {
    activities[index] = updatedActivity;
  }
  return activities;
});

ipcMain.handle('delete-activity', (event, activityId) => {
  activities = activities.filter(activity => activity.id !== activityId);
  return activities;
});

// App lifecycle methods
app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

async function fetchForecast() {
  const location = document.getElementById("location-input").value.trim();
  if (location === "") {
      alert("Please enter a location.");
      return;
  }
  try {
      const response = await fetch(`https://api.weatherapi.com/v1/forecast.json?key=32804b24a847407391c53709241010&q=${location}&days=7`);
      const data = await response.json();

      if (data.error) {
          alert("Error: " + data.error.message);
          return;
      }

      const forecastContainer = document.getElementById("forecast-container");
      forecastContainer.innerHTML = ""; // Clear previous content

      // Loop through the forecast data for the next few days
      data.forecast.forecastday.forEach(day => {
          const card = document.createElement("div");
          card.classList.add("forecast-card");
          card.innerHTML = `
              <p>${day.date}</p>
              <img src="https:${day.day.condition.icon}" alt="Weather Icon">
              <p>${day.day.avgtemp_c}°C</p>
              <p>${day.day.condition.text}</p>
          `;
          forecastContainer.appendChild(card);
      });
  } catch (error) {
      console.error("Error fetching forecast data: ", error);
      alert("Failed to fetch forecast data. Please try again later.");
  }
}
function showPage(pageId) {
  document.querySelectorAll('.page').forEach(page => {
      page.classList.remove('active');
  });
  document.getElementById(pageId).classList.add('active');

  // Fetch forecast data when displaying the Forecast page
  if (pageId === 'forecast') {
      fetchForecast();
  }
}
