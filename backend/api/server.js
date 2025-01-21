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
const cors = require('cors');
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT); // Load from environment variable
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore(); // Firestore database instance
const app = express();
app.use(express.json());
app.use(cors());

// Fetch all habits for a user
app.get('/api/habits', async (req, res) => {
  const { user } = req.query; // User ID from query parameters
  try {
    const snapshot = await db.collection('habits').where('user', '==', user).get();
    const habits = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(habits);
  } catch (error) {
    console.error('Error fetching habits:', error);
    res.status(500).json({ message: 'Failed to fetch habits' });
  }
});

// Add a new habit
app.post('/api/habits', async (req, res) => {
  const newHabit = {
    user: req.body.user,
    name: req.body.name,
    progress: 0,
    attendance: [],
  };

  try {
    const docRef = await db.collection('habits').add(newHabit);
    res.status(201).json({ id: docRef.id, ...newHabit });
  } catch (error) {
    console.error('Error adding habit:', error);
    res.status(500).json({ message: 'Failed to add habit' });
  }
});

// Update habit attendance
app.post('/api/habits/attendance', async (req, res) => {
  const { id, date } = req.body;

  try {
    const docRef = db.collection('habits').doc(id);
    const habit = await docRef.get();

    if (!habit.exists) {
      return res.status(404).json({ message: 'Habit not found' });
    }

    const habitData = habit.data();
    if (!habitData.attendance.includes(date)) {
      habitData.attendance.push(date);
      habitData.progress = habitData.attendance.length;

      await docRef.update(habitData);
    }

    res.status(200).json({ id, ...habitData });
  } catch (error) {
    console.error('Error updating attendance:', error);
    res.status(500).json({ message: 'Failed to update attendance' });
  }
});

// Default port for Vercel or local testing
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app; // Export app for serverless environments like Vercel
