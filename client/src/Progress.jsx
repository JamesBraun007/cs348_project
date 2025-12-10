// src/styles/Progress.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import "./styles/Progress.css";

function Progress() {
  const [workouts, setWorkouts] = useState([]);
  const [workoutTypes, setWorkoutTypes] = useState([]);
  const [selectedType, setSelectedType] = useState("all");
  const [expandedWorkout, setExpandedWorkout] = useState(null);
  const [editedExercises, setEditedExercises] = useState({});
  const [totalWorkouts, setTotalWorkouts] = useState(0);

  // load workout types from localStorage (you store the array directly)
  useEffect(() => {
    try {
      const storedTypes = JSON.parse(localStorage.getItem("workoutTypes"));
      if (Array.isArray(storedTypes)) setWorkoutTypes(storedTypes);
    } catch (err) {
      console.warn("No workoutTypes in localStorage or parse error", err);
    }

    // fetch all workouts by default
    fetchWorkouts("all");
  }, []);

  // fetch workouts (filtered by type if provided)
  const fetchWorkouts = (typeId = "all") => {
    const userId = localStorage.getItem("userId");
    axios
      .post("http://localhost:4040/api/get_user_workouts_by_type", {
        user_id: userId,
        type_id: typeId,
      })
      .then((res) => {
        const w = res.data.workouts || [];
        console.log("fetchWorkouts response:", res.data);
        setWorkouts(w);
        setTotalWorkouts(w.length);
        setExpandedWorkout(null);
      })
      .catch((err) => {
        console.error("Error fetching workouts:", err);
        setWorkouts([]);
        setTotalWorkouts(0);
      });
  };

  const onTypeFilterChange = (e) => {
    const type = e.target.value;
    setSelectedType(type);
    fetchWorkouts(type);
  };

  const toggleExpand = (workoutId) => {
    setExpandedWorkout((prev) => (prev === workoutId ? null : workoutId));
  };

  // Controlled edits: update both UI (workouts) and editedExercises state
  const handleExerciseChange = (workoutId, exerciseId, field, value) => {
    // update workouts locally so the input reflects immediately
    setWorkouts((prev) =>
      prev.map((w) =>
        w.id === workoutId
          ? {
              ...w,
              exercises: (w.exercises || []).map((ex) =>
                ex.id === exerciseId ? { ...ex, [field]: value } : ex
              ),
            }
          : w
      )
    );

    // mark edited value
    setEditedExercises((prev) => ({
      ...prev,
      [exerciseId]: {
        ...prev[exerciseId],
        workout_id: workoutId, // include for filtering when saving
        [field]: value,
      },
    }));
  };

  // Save all edited exercise changes (sends array of {id, ...fields})
  const saveChanges = async () => {
    const updates = Object.entries(editedExercises).map(([id, data]) => ({
      id: Number(id),
      ...data,
    }));

    if (updates.length === 0) {
      alert("No changes to save.");
      return;
    }

    try {
      const res = await axios.post("http://localhost:4040/api/update_exercises", {
        exercises: updates,
      });
      console.log("update_exercises response:", res.data);
      if (res.data.success) {
        alert("Changes saved!");
        setEditedExercises({});
        // refresh current filter to ensure server and client match
        fetchWorkouts(selectedType);
      } else {
        alert("Save failed.");
      }
    } catch (err) {
      console.error("Error saving changes:", err);
      alert("Error saving changes.");
    }
  };

  // Delete exercise (server + local optimistic update)
  const handleDeleteExercise = async (workoutId, exerciseId) => {
    if (!window.confirm("Delete this exercise?")) return;

    try {
      const res = await axios.post("http://localhost:4040/api/delete_exercise", {
        exercise_id: exerciseId,
      });
      console.log("delete_exercise response:", res.data);
      if (res.data.success) {
        setWorkouts((prev) =>
          prev.map((w) =>
            w.id === workoutId
              ? { ...w, exercises: (w.exercises || []).filter((ex) => ex.id !== exerciseId) }
              : w
          )
        );
        // remove any pending edits for that exercise
        setEditedExercises((prev) => {
          const copy = { ...prev };
          delete copy[exerciseId];
          return copy;
        });
      } else {
        alert("Failed to delete exercise.");
      }
    } catch (err) {
      console.error("Error deleting exercise:", err);
      alert("Error deleting exercise.");
    }
  };

  // helpers to render safe values
  const safeVal = (v) => (v === null || v === undefined ? "" : v);

  return (
    <div className="progress-page">
      <h1>📊 Your Progress</h1>

      {/* stat card */}
      <div className="stats-container">
        <div className="stat-card">
          <h2>{totalWorkouts}</h2>
          <p>Total Workouts</p>
        </div>
      </div>

      {/* filter */}
      <div className="filter-section">
        <label>Filter by workout type:&nbsp;</label>
        <select value={selectedType} onChange={onTypeFilterChange}>
          <option value="all">All</option>
          {workoutTypes.map((wt) => (
            <option key={wt.id} value={wt.id}>
              {wt.name}
            </option>
          ))}
        </select>
      </div>

      {/* table */}
      <div className="progress-table-container">
        <table className="workout-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {workouts.length === 0 ? (
              <tr>
                <td colSpan="3" className="no-data">
                  No workouts found.
                </td>
              </tr>
            ) : (
              workouts.map((w) => (
                <React.Fragment key={w.id}>
                  <tr className="workout-row" onClick={() => toggleExpand(w.id)}>
                    <td>{new Date(w.date).toLocaleString()}</td>
                    <td>{safeVal(w.type)}</td>
                    <td>{safeVal(w.notes)}</td>
                  </tr>

                  {expandedWorkout === w.id && (
                    <tr key={`details-${w.id}`}>
                      <td colSpan="3">
                        <table className="exercise-table">
                          <thead>
                            <tr>
                              <th>Name</th>
                              <th>Sets</th>
                              <th>Reps</th>
                              <th>Weight</th>
                              <th>Duration</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(w.exercises || []).length === 0 ? (
                              <tr>
                                <td colSpan="6" className="no-data">
                                  No exercises for this workout.
                                </td>
                              </tr>
                            ) : (
                              w.exercises.map((ex) => (
                                <tr key={ex.id}>
                                  <td>
                                    <input
                                      value={safeVal(ex.name)}
                                      onChange={(e) =>
                                        handleExerciseChange(w.id, ex.id, "name", e.target.value)
                                      }
                                    />
                                  </td>
                                  <td>
                                    <input
                                      type="number"
                                      value={safeVal(ex.sets)}
                                      onChange={(e) =>
                                        handleExerciseChange(w.id, ex.id, "sets", e.target.value)
                                      }
                                    />
                                  </td>
                                  <td>
                                    <input
                                      type="number"
                                      value={safeVal(ex.reps)}
                                      onChange={(e) =>
                                        handleExerciseChange(w.id, ex.id, "reps", e.target.value)
                                      }
                                    />
                                  </td>
                                  <td>
                                    <input
                                      type="number"
                                      value={safeVal(ex.weight)}
                                      onChange={(e) =>
                                        handleExerciseChange(w.id, ex.id, "weight", e.target.value)
                                      }
                                    />
                                  </td>
                                  <td>
                                    <input
                                      type="number"
                                      value={safeVal(ex.duration_minutes)}
                                      onChange={(e) =>
                                        handleExerciseChange(
                                          w.id,
                                          ex.id,
                                          "duration_minutes",
                                          e.target.value
                                        )
                                      }
                                    />
                                  </td>
                                  <td>
                                    <button
                                      className="delete-btn"
                                      onClick={() => handleDeleteExercise(w.id, ex.id)}
                                    >
                                      🗑
                                    </button>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>

                        <div style={{ textAlign: "right", marginTop: 8 }}>
                          <button className="save-btn" onClick={saveChanges}>
                            💾 Save Changes
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Progress;
