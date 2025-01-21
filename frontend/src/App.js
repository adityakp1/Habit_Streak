import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import './App.css';  // Import the CSS file for styling

const App = () => {
  const [user, setUser] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [habits, setHabits] = useState([]);
  const [attendanceDate, setAttendanceDate] = useState('');
  const [newHabit, setNewHabit] = useState('');

  const fetchHabits = (user) => {
    axios.get('https://habit-streak-2.onrender.com/api/habits', { params: { user } })
      .then(response => {
        console.log('Fetched Habits:', response.data);
        setHabits(response.data);
      })
      .catch(error => {
        console.error('Error fetching habits:', error);
      });
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchHabits(user);

      // Set the attendance date to today's date
      const today = new Date().toISOString().split('T')[0];
      setAttendanceDate(today);
    }
  }, [isAuthenticated, user]);

  const handleLogin = () => {
    if (user) {
      setIsAuthenticated(true);
    }
  };

  const handleAddHabit = () => {
    if (newHabit) {
      axios.post('https://habit-streak-2.onrender.com/api/habits', {
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
    axios.post('https://habit-streak-2.onrender.com/api/habits/attendance', {
      id: habitId,
      date: attendanceDate
    })
    .then(response => {
      console.log('Marked Attendance:', response.data);
      setHabits(habits.map(habit =>
        habit.id === response.data.id ? response.data : habit
      ));
      const today = new Date().toISOString().split('T')[0];
      setAttendanceDate(today);  // Set the attendance date to today's date after marking attendance
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
          {habits.map(habit => (
            <div key={habit.id} className="habit-card">
              <h2 className="habit-name">{habit.name}</h2>
              <p className="habit-progress">User: {habit.user}</p>
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
                  startDate={new Date(new Date().getFullYear(), 0, 1)}
                  endDate={new Date()}
                  values={habit.attendance.map(date => ({ date }))}
                  classForValue={(value) => (value ? 'color-github-1' : 'color-empty')}
                  className="heatmap"  // Apply CSS class
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