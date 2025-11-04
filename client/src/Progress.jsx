import React, { useEffect, useState } from "react";
import axios from "axios";
import "./styles/Progress.css";

function Progress() {
  const [workouts, setWorkouts] = useState([]);
  const [expandedWorkout, setExpandedWorkout] = useState(null);
  const [editedExercises, setEditedExercises] = useState({});

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    axios
      .post("http://localhost:4040/api/get_user_workouts", { user_id: userId })
      .then((res) => {
        setWorkouts(res.data.workouts);
        console.log("Fetched workouts:", res.data.workouts);
      })
      .catch((err) => console.error("Error fetching workouts:", err));
  }, []);

  const toggleExpand = (id) => {
    setExpandedWorkout(expandedWorkout === id ? null : id);
  };

  const handleExerciseChange = (workoutId, exerciseId, field, value) => {
    setWorkouts((prev) =>
      prev.map((workout) =>
        workout.id === workoutId
          ? {
              ...workout,
              exercises: workout.exercises.map((ex) =>
                ex.id === exerciseId ? { ...ex, [field]: value } : ex
              ),
            }
          : workout
      )
    );

    setEditedExercises((prev) => ({
      ...prev,
      [exerciseId]: {
        ...prev[exerciseId],
        [field]: value,
      },
    }));
  };

  const handleDeleteExercise = async (workoutId, exerciseId) => {
    try {
      await axios.post("http://localhost:4040/api/delete_exercise", {
        exercise_id: exerciseId,
      });
      setWorkouts((prev) =>
        prev.map((workout) =>
          workout.id === workoutId
            ? {
                ...workout,
                exercises: workout.exercises.filter((ex) => ex.id !== exerciseId),
              }
            : workout
        )
      );
    } catch (err) {
      console.error("Error deleting exercise:", err);
    }
  };

  const saveChanges = async () => {
    const updatedExercises = Object.entries(editedExercises).map(([id, data]) => ({
      id: Number(id),
      ...data,
    }));

    if (updatedExercises.length === 0) {
      alert("No changes to save.");
      return;
    }

    try {
      await axios.post("http://localhost:4040/api/update_exercises", {
        exercises: updatedExercises,
      });
      alert("Changes saved!");
      setEditedExercises({});
    } catch (err) {
      console.error("Error saving exercises:", err);
    }
  };

  return (
    <div className="progress-page">
      <h1>📊 Your Progress</h1>

      <table className="workout-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Type</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
          {workouts.map((workout) => (
            <React.Fragment key={workout.id}>
              <tr onClick={() => toggleExpand(workout.id)} className="workout-row">
                <td>{new Date(workout.date).toLocaleString()}</td>
                {/* ✅ Ensure correct field name */}
                <td>{workout.type ? workout.type : "Unknown Type"}</td>
                <td>{workout.notes}</td>
              </tr>

              {expandedWorkout === workout.id && (
                <tr>
                  <td colSpan="3">
                    <table className="exercise-table">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Sets</th>
                          <th>Reps</th>
                          <th>Weight</th>
                          <th>Duration (min)</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {workout.exercises.map((ex) => (
                          <tr key={ex.id}>
                            <td>
                              <input
                                value={ex.name || ""}
                                onChange={(e) =>
                                  handleExerciseChange(
                                    workout.id,
                                    ex.id,
                                    "name",
                                    e.target.value
                                  )
                                }
                              />
                            </td>
                            <td>
                              <input
                                type="number"
                                value={ex.sets || ""}
                                onChange={(e) =>
                                  handleExerciseChange(
                                    workout.id,
                                    ex.id,
                                    "sets",
                                    e.target.value
                                  )
                                }
                              />
                            </td>
                            <td>
                              <input
                                type="number"
                                value={ex.reps || ""}
                                onChange={(e) =>
                                  handleExerciseChange(
                                    workout.id,
                                    ex.id,
                                    "reps",
                                    e.target.value
                                  )
                                }
                              />
                            </td>
                            <td>
                              <input
                                type="number"
                                value={ex.weight || ""}
                                onChange={(e) =>
                                  handleExerciseChange(
                                    workout.id,
                                    ex.id,
                                    "weight",
                                    e.target.value
                                  )
                                }
                              />
                            </td>
                            <td>
                              <input
                                type="number"
                                value={ex.duration_minutes || ""}
                                onChange={(e) =>
                                  handleExerciseChange(
                                    workout.id,
                                    ex.id,
                                    "duration_minutes",
                                    e.target.value
                                  )
                                }
                              />
                            </td>
                            <td>
                              <button
                                onClick={() =>
                                  handleDeleteExercise(workout.id, ex.id)
                                }
                              >
                                🗑️ Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    <button className="save-btn" onClick={saveChanges}>
                      💾 Save Changes
                    </button>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Progress;
