import React, { useState } from "react";
import axios from "axios";
import "./styles/Home.css";
import { useNavigate } from "react-router-dom";

function Home() {
  const [showForm, setShowForm] = useState(false);
  const [workoutType, setWorkoutType] = useState("");
  const [exercises, setExercises] = useState([]);
  const navigate = useNavigate();

  const handleAddExercise = () => {
    setExercises([...exercises, { name: "", sets: "", weight: "" }]);
  };

  const handleExerciseChange = (index, field, value) => {
    const updated = [...exercises];
    updated[index][field] = value;
    setExercises(updated);
  };

  const handleSaveWorkout = async () => {
    if (!workoutType || exercises.length === 0) {
      alert("Please enter a workout type and at least one exercise!");
      return;
    }

    const workoutData = {
      workoutType,
      exercises,
    };

    try {
      // const response = await axios.post("http://localhost:4040/api/add_workout", workoutData);
      // console.log("Workout saved:", response.data);

      setWorkoutType("");
      setExercises([]);
      setShowForm(false);
    } catch (error) {
      console.error("Error saving workout:", error);
      alert("There was an error saving your workout!");
    }
  };

  const handleCancelWorkout = () => {
    setWorkoutType("");
    setExercises([]);
    setShowForm(false);
  }

  return (
    <div className="home-page">
      <h1>Reach New Levels.</h1>

      {!showForm && (
        <button className="add-workout-btn" onClick={() => setShowForm(true)}>
          ➕ Add New Workout
        </button>
      )}

      {showForm && (
        <div className="workout-form">
          <h2>New Workout</h2>

          <label>Workout Type:</label>
          <input
            type="text"
            placeholder="e.g. Chest and Triceps, Cardio..."
            value={workoutType}
            onChange={(e) => setWorkoutType(e.target.value)}
          />

          <div className="exercises-section">

            {exercises.map((exercise, index) => (
              <div key={index} className="exercise-inputs">
                <input
                  type="text"
                  placeholder="Exercise name"
                  value={exercise.name}
                  onChange={(e) =>
                    handleExerciseChange(index, "name", e.target.value)
                  }
                />
                <input
                  type="number"
                  placeholder="Sets"
                  value={exercise.sets}
                  onChange={(e) =>
                    handleExerciseChange(index, "sets", e.target.value)
                  }
                />
                <input
                  type="number"
                  placeholder="Weight (lbs)"
                  value={exercise.weight}
                  onChange={(e) =>
                    handleExerciseChange(index, "weight", e.target.value)
                  }
                />
              </div>
            ))}
          </div>

          <button type="button" onClick={handleAddExercise}>
              ➕ Add Exercise
          </button>

          <div className="form-buttons">
            <button type="button" onClick={handleSaveWorkout}>
              ✅ Save Workout
            </button>
            <button
              type="button"
              className="cancel-btn"
              onClick={() => handleCancelWorkout()}
            > ❌ Cancel </button>

          </div>
        </div>
      )}
      <button
        className="progress-btn"
        onClick={() => navigate("/progress")}
      >
        📈 See how far you've come
      </button>
    </div>
  );
}

export default Home;
