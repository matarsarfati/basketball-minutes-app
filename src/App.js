import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import MainGame from './MainGame';
import WellnessReport from './WellnessReport';
import GymCourtReport from './GymCourtReport';
import ExerciseLibrary from './ExerciseLibrary'; // ✅ ייבוא העמוד החדש

function App() {
  return (
    <Router>
      <div className="App" dir="rtl">
        <nav style={{ padding: "10px", borderBottom: "1px solid #ccc" }}>
          <Link to="/" style={{ marginLeft: "20px" }}>🏀 מעקב דקות משחק</Link>
          <Link to="/wellness" style={{ marginLeft: "20px" }}>🧘 דוח Wellness</Link>
          <Link to="/gym-court" style={{ marginLeft: "20px" }}>🏋️‍♀️ דוח Gym+Court</Link>
          <Link to="/exercises" style={{ marginLeft: "20px" }}>💪 מאגר תרגילים</Link> {/* ✅ הקישור החדש */}
        </nav>
        <Routes>
          <Route path="/" element={<MainGame />} />
          <Route path="/wellness" element={<WellnessReport />} />
          <Route path="/gym-court" element={<GymCourtReport />} />
          <Route path="/exercises" element={<ExerciseLibrary />} /> {/* ✅ הנתיב החדש */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;