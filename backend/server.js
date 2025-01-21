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


require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Habit Schema and Model
const habitSchema = new mongoose.Schema({
  id: Number,
  user: String,
  name: String,
  progress: Number,
  attendance: [String], // Array of dates in string format
});

const Habit = mongoose.model('Habit', habitSchema);

// API Endpoints

// Fetch all habits for a specific user
app.get('/api/habits', async (req, res) => {
  const { user } = req.query;
  try {
    console.log(`Fetching habits for user: ${user}`);
    const userHabits = await Habit.find({ user });
    console.log(`Filtered Habits for ${user}:`, userHabits);
    res.json(userHabits);
  } catch (error) {
    console.error('Error fetching habits:', error);
    res.status(500).json({ message: 'Error fetching habits' });
  }
});

// Add a new habit
app.post('/api/habits', async (req, res) => {
  const { user, name } = req.body;
  try {
    const newHabit = new Habit({
      id: Date.now(),
      user,
      name,
      progress: 0,
      attendance: [],
    });
    const savedHabit = await newHabit.save();
    console.log('New Habit Added:', savedHabit);
    res.status(201).json(savedHabit);
  } catch (error) {
    console.error('Error adding habit:', error);
    res.status(500).json({ message: 'Error adding habit' });
  }
});

// Mark attendance for a habit
app.post('/api/habits/attendance', async (req, res) => {
  const { id, date } = req.body;
  try {
    const habit = await Habit.findOne({ id });
    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' });
    }

    // Ensure attendance dates are unique
    if (!habit.attendance.includes(date)) {
      habit.attendance.push(date);
      habit.progress = habit.attendance.length; // Update progress based on attendance count
    }

    const updatedHabit = await habit.save();
    console.log(`Updated Attendance for Habit ID ${id}:`, updatedHabit);
    res.status(200).json(updatedHabit);
  } catch (error) {
    console.error('Error marking attendance:', error);
    res.status(500).json({ message: 'Error marking attendance' });
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

