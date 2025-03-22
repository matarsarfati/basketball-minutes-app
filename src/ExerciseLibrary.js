import React, { useState } from 'react';

const exercises = [
  { name: "Squat", category: "Legs", image: "https://upload.wikimedia.org/wikipedia/commons/4/4e/Squats.gif" },
  { name: "Lunges", category: "Legs", image: "https://upload.wikimedia.org/wikipedia/commons/8/8a/Lunges.gif" },
  { name: "Push-ups", category: "Chest", image: "https://upload.wikimedia.org/wikipedia/commons/0/05/Pushups-2.gif" },
  { name: "Plank", category: "Core", image: "https://upload.wikimedia.org/wikipedia/commons/3/31/Plank.gif" },
  { name: "Bicep Curls", category: "Arms", image: "https://upload.wikimedia.org/wikipedia/commons/f/fd/Biceps_curl.gif" },
];

const categories = ["Legs", "Chest", "Core", "Arms"];

export default function ExerciseLibrary() {
  const [selectedProtocol, setSelectedProtocol] = useState("");

  return (
    <div dir="rtl" style={{ padding: '20px' }}>
      <h2>Exercise Library</h2>

      <div style={{ marginBottom: '20px' }}>
        <label>Rehabilitation Protocol:</label>
        <select
          value={selectedProtocol}
          onChange={e => setSelectedProtocol(e.target.value)}
          style={{ marginRight: '10px' }}
        >
          <option value="">-- Select Protocol --</option>
          <option value="knee">Knee Rehab</option>
          <option value="ankle">Ankle Rehab</option>
          <option value="lowerback">Lower Back Rehab</option>
        </select>
      </div>

      <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <tbody>
          {categories.map((cat, idx) => (
            <tr key={idx}>
              <td style={{ fontWeight: 'bold', width: '100px', backgroundColor: '#eee' }}>{cat}</td>
              {exercises
                .filter(ex => ex.category === cat)
                .map((ex, i) => (
                  <td key={i} style={{ textAlign: 'center' }}>
                    <p>{ex.name}</p>
                    <img src={ex.image} alt={ex.name} style={{ width: '80px', height: '80px' }} />
                  </td>
                ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}