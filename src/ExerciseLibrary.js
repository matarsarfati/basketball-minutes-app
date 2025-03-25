import React from 'react';
import './ExerciseLibrary.css';

// ייבוא תמונות
import wallSit from './images/Wall Sit.jpeg';
import vUps from './images/V-Ups.jpeg';
import uprightRow from './images/Upright Row.jpeg';
import tricepPushdown from './images/Tricep Pushdown.jpeg';

const exercises = [
  {
    name: 'Wall Sit',
    muscles: 'Quadriceps, Glutes',
    image: wallSit
  },
  {
    name: 'V-Ups',
    muscles: 'Abdominals',
    image: vUps
  },
  {
    name: 'Upright Row',
    muscles: 'Shoulders, Traps',
    image: uprightRow
  },
  {
    name: 'Tricep Pushdown',
    muscles: 'Triceps',
    image: tricepPushdown
  }
];

function ExerciseLibrary() {
  return (
    <div className="exercise-library">
      <h1>ספריית תרגילים</h1>
      <table className="exercise-table">
        <thead>
          <tr>
            <th>תרגיל</th>
            <th>שרירים עיקריים</th>
            <th>תמונה</th>
          </tr>
        </thead>
        <tbody>
          {exercises.map((exercise, index) => (
            <tr key={index}>
              <td className="muscle-cell">{exercise.name}</td>
              <td>{exercise.muscles}</td>
              <td>
                {exercise.image ? (
                  <img
                    src={exercise.image}
                    alt={exercise.name}
                    className="exercise-image"
                  />
                ) : (
                  <div className="no-image">אין תמונה</div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ExerciseLibrary;