// const express = require('express');
// const fs = require('fs');
// const cors = require('cors');

// const app = express();
// app.use(express.json());
// app.use(cors());

// const dataFile = 'data.json';

// const readData = () => {
//   const data = fs.readFileSync(dataFile);
//   console.log('Read Data:', data.toString()); // Log the raw data
//   return JSON.parse(data);
// };

// const writeData = (data) => {
//   fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
//   console.log('Written Data:', JSON.stringify(data, null, 2)); // Log the written data
// };

// app.get('/api/habits', (req, res) => {
//   const { user } = req.query; // Get the user from query parameters
//   console.log(`Fetching habits for user: ${user}`); // Log the user parameter

//   const data = readData();
//   console.log('All Habits:', data.habits); // Log all habits from data.json

//   const userHabits = data.habits.filter(habit => habit.user === user);
//   console.log(`Filtered Habits for ${user}:`, userHabits); // Log the filtered habits

//   res.json(userHabits); // Send only the filtered habits
// });

// app.post('/api/habits', (req, res) => {
//   const data = readData();
//   const newHabit = { id: Date.now(), user: req.body.user, name: req.body.name, progress: 0, attendance: [] };
//   data.habits.push(newHabit);
//   writeData(data);
//   res.status(201).json(newHabit);
// });

// app.post('/api/habits/attendance', (req, res) => {
//   const data = readData();
//   const habit = data.habits.find(h => h.id === req.body.id);
//   if (habit) {
//     // Ensure attendance dates are unique
//     if (!habit.attendance.includes(req.body.date)) {
//       habit.attendance.push(req.body.date);
//     }
//     console.log(`Attendance Dates for ${habit.name}:`, habit.attendance); // Log attendance dates
    
//     // Update progress based on unique attendance dates
//     habit.progress = habit.attendance.length;
//     console.log(`Updated Progress for ${habit.name}: ${habit.progress}`); // Log progress
//     writeData(data);
//     res.status(200).json(habit);
//   } else {
//     res.status(404).json({ message: 'Habit not found' });
//   }
// });

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));





const express = require('express');
const fs = require('fs');
const cors = require('cors');
const { createServer } = require('http');

const app = express();
app.use(express.json());
app.use(cors());

const dataFile = 'data.json';

const readData = () => {
  const data = fs.readFileSync(dataFile);
  return JSON.parse(data);
};

const writeData = (data) => {
  fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
};

app.get('/api/habits', (req, res) => {
  const { user } = req.query;
  const data = readData();
  const userHabits = data.habits.filter(habit => habit.user === user);
  res.json(userHabits);
});

app.post('/api/habits', (req, res) => {
  const data = readData();
  const newHabit = { id: Date.now(), user: req.body.user, name: req.body.name, progress: 0, attendance: [] };
  data.habits.push(newHabit);
  writeData(data);
  res.status(201).json(newHabit);
});

app.post('/api/habits/attendance', (req, res) => {
  const data = readData();
  const habit = data.habits.find(h => h.id === req.body.id);
  if (habit) {
    if (!habit.attendance.includes(req.body.date)) {
      habit.attendance.push(req.body.date);
    }
    habit.progress = habit.attendance.length;
    writeData(data);
    res.status(200).json(habit);
  } else {
    res.status(404).json({ message: 'Habit not found' });
  }
});

// Export the app as a serverless handler
module.exports = (req, res) => {
  const server = createServer(app);
  server.emit('request', req, res);
};
