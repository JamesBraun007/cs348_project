import React, { useState, useEffect } from "react";
import axios from "axios";
import "./styles/Home.css";
import { useNavigate } from "react-router-dom";

function Home() {
  const [showForm, setShowForm] = useState(false);
  const [workoutType, setWorkoutType] = useState("");
  const [workoutTypes, setWorkoutTypes] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [showAddTypeForm, setShowAddTypeForm] = useState(false);
  const [newTypeName, setNewTypeName] = useState("");
  const [newTypeDesc, setNewTypeDesc] = useState("");
  const [notes, setNotes] = useState("");


  const navigate = useNavigate();

  // ✅ Load workout types and user_id separately from localStorage
  useEffect(() => {
    const storedWorkoutTypes = JSON.parse(localStorage.getItem("workoutTypes"));
    console.log("Loaded from localStorage:", storedWorkoutTypes);
    if (storedWorkoutTypes) {
      setWorkoutTypes(storedWorkoutTypes);
    }
  }, []);

  const handleAddExercise = () => {
    setExercises([...exercises, { name: "", sets: "", reps: "", weight: "", duration: "" }]);
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

    const newWorkoutData = { 
      user_id: localStorage.getItem("userId"),
      workout_type_id: workoutType,
      exercises: exercises,
      notes: notes
    };

    try {
      const response = await axios.post("http://localhost:4040/api/add_new_workout", newWorkoutData);
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
  };

  const handleAddWorkoutType = async () => {
    if (!newTypeName) {
      alert("Please enter a name for the new workout type.");
      return;
    }

    try {
      const userId = localStorage.getItem("userId"); 

      const response = await axios.post("http://localhost:4040/api/add_new_workout_type", {
        user_id: userId,
        name: newTypeName,
        description: newTypeDesc,
      });

      if (response.data.success) {
        const newWt = {
          id: response.data.id,
          name: response.data.name,
          description: response.data.description || "",
        };

        const updatedWorkoutTypes = [...workoutTypes, newWt];

        setWorkoutTypes(updatedWorkoutTypes);
        localStorage.setItem("workoutTypes", JSON.stringify(updatedWorkoutTypes));

        setNewTypeName("");
        setNewTypeDesc("");
        setShowAddTypeForm(false);
      } else {
        alert("Error adding workout type!");
      }
    } catch (error) {
      console.error("Error adding workout type:", error);
      alert("Error adding workout type!");
    }
  };

  return (
    <div className="home-page">
      <h1>Reach New Levels.</h1>

      {!showForm && (
        <button className="add-workout-btn" onClick={() => setShowForm(true)}>
          ➕ Add New Workout
        </button>
      )}

      {showForm && (
        <div className="workout-container">
          {/* Left side — Workout Form */}
          <div className="workout-form">
            <h2>Workout Type:</h2>
            <div className="workout-type-row">
              <select
                value={workoutType}
                onChange={(e) => setWorkoutType(e.target.value)}
                className="workout-type-select"
              >
                <option value="">Select a workout type</option>
                {workoutTypes.map((wt) => (
                  <option key={wt.id} value={wt.id}>
                    {wt.name}
                  </option>
                ))}
              </select>

              <button
                className="add-type-btn"
                type="button"
                onClick={() => setShowAddTypeForm(!showAddTypeForm)}
              >
                Add New
              </button>
            </div>

            <div className="exercises-section">
              {exercises.map((exercise, index) => (
                <div key={index} className="exercise-inputs">
                  <input
                    type="text"
                    placeholder="Name"
                    value={exercise.name}
                    onChange={(e) =>
                      handleExerciseChange(index, "name", e.target.value)
                    }
                  />
                  <input
                    type="number"
                    placeholder="# of Sets"
                    value={exercise.sets}
                    onChange={(e) =>
                      handleExerciseChange(index, "sets", e.target.value)
                    }
                  />
                  <input
                    type="number"
                    placeholder="# of Reps Per Set"
                    value={exercise.reps}
                    onChange={(e) =>
                      handleExerciseChange(index, "reps", e.target.value)
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
                  <input
                    type="number"
                    placeholder="Duration (mins)"
                    value={exercise.duration}
                    onChange={(e) =>
                      handleExerciseChange(index, "duration", e.target.value)
                    }
                  />
                </div>
              ))}
            </div>

            <button type="button" onClick={handleAddExercise}>
              ➕ Add Exercise
            </button>

            <div className="workout-notes">
              <textarea
                placeholder="Optional notes about your workout..."
                rows={4}
                cols={50}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <div className="form-buttons">
              <button type="button" onClick={handleSaveWorkout}>
                ✅ Save Workout
              </button>
              <button
                type="button"
                className="cancel-btn"
                onClick={handleCancelWorkout}
              >
                ❌ Cancel
              </button>
            </div>
          </div>

          {/* Right side — Add Workout Type Form */}
          {showAddTypeForm && (
            <div className="add-type-form">
              <p>➕ New Workout Type</p>
              <input
                type="text"
                placeholder="Type name"
                value={newTypeName}
                onChange={(e) => setNewTypeName(e.target.value)}
              />
              <textarea
                placeholder="Description (optional)"
                value={newTypeDesc}
                onChange={(e) => setNewTypeDesc(e.target.value)}
                rows={3}
              />
              <div className="form-buttons">
                <button onClick={handleAddWorkoutType}>💾 Save Type</button>
                <button
                  className="cancel-btn"
                  onClick={() => setShowAddTypeForm(false)}
                >
                  ❌ Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <button className="progress-btn" onClick={() => navigate("/progress")}>
        📈 See how far you've come
      </button>
    </div>
  );
}

export default Home;
