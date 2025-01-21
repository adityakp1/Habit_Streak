import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import './App.css'; // Import the CSS file for styling

const App = () => {
  const [user, setUser] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [habits, setHabits] = useState([]);
  const [attendanceDate, setAttendanceDate] = useState('');
  const [newHabit, setNewHabit] = useState('');

  const fetchHabits = (user) => {
    console.log('Fetching habits for user:', user); // Debug log
    axios.get('https://habit-streak-backend-3hfx.vercel.app/api/habits', { params: { user } })
      .then(response => {
        console.log('Fetched Habits:', response.data); // Log fetched habits
        setHabits(response.data); // Update habits state
      })
      .catch(error => {
        console.error('Error fetching habits:', error);
      });
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchHabits(user); // Fetch habits for the logged-in user

      // Set the attendance date to today's date
      const today = new Date().toISOString().split('T')[0];
      setAttendanceDate(today);
    }
  }, [isAuthenticated, user]);

  const handleLogin = () => {
    if (user) {
      setIsAuthenticated(true);
      setHabits([]); // Clear previous habits when logging in with a new user
    }
  };

  const handleAddHabit = () => {
    if (newHabit) {
      axios.post('https://habit-streak-backend-3hfx.vercel.app/api/habits', {
        user,
        name: newHabit,
      })
      .then(response => {
        setHabits([...habits, response.data]);
        setNewHabit('');
      })
      .catch(error => {
        console.error('Error adding habit:', error);
      });
    }
  };

  const markAttendance = (habitId) => {
    axios.post('https://habit-streak-backend-3hfx.vercel.app/api/habits/attendance', {
      id: habitId,
      date: attendanceDate
    })
    .then(response => {
      console.log('Marked Attendance:', response.data);
      setHabits(habits.map(habit =>
        habit.id === response.data.id ? response.data : habit
      ));
      const today = new Date().toISOString().split('T')[0];
      setAttendanceDate(today);
    })
    .catch(error => {
      console.error('Error marking attendance:', error);
    });
  };

  return (
    <div className="app">
      {!isAuthenticated ? (
        <div className="login">
          <h1 className="title">Login</h1>
          <input
            type="text"
            placeholder="Enter your username"
            value={user}
            onChange={(e) => setUser(e.target.value)}
            className="input"
          />
          <button onClick={handleLogin} className="button">Login</button>
        </div>
      ) : (
        <div>
          <h1 className="title">Habit Tracker Dashboard</h1>
          <div className="new-habit">
            <input
              type="text"
              placeholder="Enter a new habit"
              value={newHabit}
              onChange={(e) => setNewHabit(e.target.value)}
              className="input"
            />
            <button onClick={handleAddHabit} className="button">Add Habit</button>
          </div>
          {habits.map((habit) => (
            // Conditionally render or hide habit `div` based on user match
            <div
              key={habit.id}
              className="habit-card"
              style={{
                display: habit.user === user ? 'block' : 'none', // Hide if user does not match
              }}
            >
            {/* <div key={habit.id} className="habit-card"> */}
              <h2 className="habit-name">{habit.name}</h2>
              <p className="habit-progress">User: <strong>{habit.user}</strong></p>
              <p className="habit-progress">Progress: {habit.progress}</p>
              <div className="attendance-form">
                <h3 className="attendance-title">Mark Attendance</h3>
                <input
                  type="date"
                  value={attendanceDate}
                  onChange={(e) => setAttendanceDate(e.target.value)}
                  className="date-input"
                />
                <button onClick={() => markAttendance(habit.id)} className="attendance-button">Mark Attendance</button>
              </div>
              <div className="heatmap-container">
                <CalendarHeatmap
                  startDate={new Date(new Date().setFullYear(new Date().getFullYear() - 1))}
                  endDate={new Date()}
                  values={habit.attendance.map(date => ({ date }))}
                  classForValue={(value) => (value ? 'color-github-1' : 'color-empty')}
                  className="heatmap"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default App;
