import React, { createContext, ReactNode, useContext, useState } from "react";

export interface ExerciseSet {
  id: string;
  setNumber: number;
  previousKg?: number;
  previousReps?: number;
  kg: string;
  reps: string;
  isCompleted: boolean;
}

/** Exercise entry within a workout session */
export interface WorkoutExerciseEntry {
  id: string; // unique id for this entry in the workout
  exerciseId: number; // wger exercise id
  name: string;
  muscles: { id: number; name: string; name_en: string }[];
  equipment: { id: number; name: string }[];
  sets: ExerciseSet[];
  notes?: string;
  addedAt: number; // timestamp
}

interface ActiveWorkout {
  id: string;
  duration: number;
  volume: number;
  sets: number;
  exercises: WorkoutExerciseEntry[];
}

interface ActiveWorkoutContextType {
  activeWorkout: ActiveWorkout | null;
  startWorkout: (workout: ActiveWorkout) => void;
  updateWorkout: (updates: Partial<ActiveWorkout>) => void;
  discardWorkout: () => void;
  addExerciseToWorkout: (exercise: any) => void; // from wgerApi
  removeExerciseFromWorkout: (exerciseEntryId: string) => void;
  updateExerciseEntry: (
    exerciseEntryId: string,
    updates: Partial<WorkoutExerciseEntry>,
  ) => void;
  addSetToExercise: (exerciseEntryId: string) => void;
  updateSet: (
    exerciseEntryId: string,
    setId: string,
    updates: Partial<ExerciseSet>,
  ) => void;
  removeSet: (exerciseEntryId: string, setId: string) => void;
  reorderExercise: (fromIndex: number, toIndex: number) => void;
  isExpanded: boolean;
  setIsExpanded: (expanded: boolean) => void;
}

const ActiveWorkoutContext = createContext<
  ActiveWorkoutContextType | undefined
>(undefined);

export const useActiveWorkout = () => {
  const context = useContext(ActiveWorkoutContext);
  if (!context) {
    throw new Error(
      "useActiveWorkout must be used within ActiveWorkoutProvider",
    );
  }
  return context;
};

interface ActiveWorkoutProviderProps {
  children: ReactNode;
}

export const ActiveWorkoutProvider: React.FC<ActiveWorkoutProviderProps> = ({
  children,
}) => {
  const [activeWorkout, setActiveWorkout] = useState<ActiveWorkout | null>(
    null,
  );
  const [isExpanded, setIsExpanded] = useState(false);

  const startWorkout = (workout: ActiveWorkout) => {
    const workoutWithExercises = {
      ...workout,
      exercises: workout.exercises || [],
    };
    setActiveWorkout(workoutWithExercises);
    setIsExpanded(true);
  };

  const updateWorkout = (updates: Partial<ActiveWorkout>) => {
    if (activeWorkout) {
      setActiveWorkout({ ...activeWorkout, ...updates });
    }
  };

  const discardWorkout = () => {
    setActiveWorkout(null);
    setIsExpanded(false);
  };

  const addExerciseToWorkout = (exercise: any) => {
    setActiveWorkout((prev) => {
      if (!prev) return prev;

      const initialSet: ExerciseSet = {
        id: `${Date.now()}-${Math.random()}`,
        setNumber: 1,
        kg: "",
        reps: "",
        isCompleted: false,
      };

      const entry: WorkoutExerciseEntry = {
        id: `${Date.now()}-${Math.random()}`, // unique entry id
        exerciseId: exercise.id,
        name: exercise.name,
        muscles: exercise.muscles || [],
        equipment: exercise.equipment || [],
        sets: [initialSet],
        addedAt: Date.now(),
      };

      return {
        ...prev,
        exercises: [...prev.exercises, entry],
        sets: prev.sets + 1,
      };
    });
  };

  const addSetToExercise = (exerciseEntryId: string) => {
    setActiveWorkout((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        exercises: prev.exercises.map((ex) => {
          if (ex.id !== exerciseEntryId) return ex;
          const lastSet = ex.sets[ex.sets.length - 1];
          const newSet: ExerciseSet = {
            id: `${Date.now()}-${Math.random()}`,
            setNumber: ex.sets.length + 1,
            previousKg: lastSet?.isCompleted
              ? parseFloat(lastSet.kg) || undefined
              : lastSet?.previousKg,
            previousReps: lastSet?.isCompleted
              ? parseFloat(lastSet.reps) || undefined
              : lastSet?.previousReps,
            kg: lastSet?.kg || "",
            reps: lastSet?.reps || "",
            isCompleted: false,
          };
          return { ...ex, sets: [...ex.sets, newSet] };
        }),
      };
    });
  };

  const updateSet = (
    exerciseEntryId: string,
    setId: string,
    updates: Partial<ExerciseSet>,
  ) => {
    setActiveWorkout((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        exercises: prev.exercises.map((ex) => {
          if (ex.id !== exerciseEntryId) return ex;
          return {
            ...ex,
            sets: ex.sets.map((s) =>
              s.id === setId ? { ...s, ...updates } : s,
            ),
          };
        }),
      };
    });
  };

  const removeSet = (exerciseEntryId: string, setId: string) => {
    setActiveWorkout((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        exercises: prev.exercises.map((ex) => {
          if (ex.id !== exerciseEntryId) return ex;
          const filtered = ex.sets.filter((s) => s.id !== setId);
          return {
            ...ex,
            sets: filtered.map((s, i) => ({ ...s, setNumber: i + 1 })),
          };
        }),
      };
    });
  };

  const reorderExercise = (fromIndex: number, toIndex: number) => {
    setActiveWorkout((prev) => {
      if (!prev) return prev;
      if (
        fromIndex < 0 ||
        toIndex < 0 ||
        fromIndex >= prev.exercises.length ||
        toIndex >= prev.exercises.length
      )
        return prev;
      const exercises = [...prev.exercises];
      const [removed] = exercises.splice(fromIndex, 1);
      exercises.splice(toIndex, 0, removed);
      return { ...prev, exercises };
    });
  };

  const removeExerciseFromWorkout = (exerciseEntryId: string) => {
    if (!activeWorkout) return;
    setActiveWorkout({
      ...activeWorkout,
      exercises: activeWorkout.exercises.filter(
        (ex) => ex.id !== exerciseEntryId,
      ),
      sets: Math.max(0, activeWorkout.sets - 1),
    });
  };

  const updateExerciseEntry = (
    exerciseEntryId: string,
    updates: Partial<WorkoutExerciseEntry>,
  ) => {
    if (!activeWorkout) return;
    setActiveWorkout({
      ...activeWorkout,
      exercises: activeWorkout.exercises.map((ex) =>
        ex.id === exerciseEntryId ? { ...ex, ...updates } : ex,
      ),
    });
  };

  return (
    <ActiveWorkoutContext.Provider
      value={{
        activeWorkout,
        startWorkout,
        updateWorkout,
        discardWorkout,
        addExerciseToWorkout,
        removeExerciseFromWorkout,
        updateExerciseEntry,
        addSetToExercise,
        updateSet,
        removeSet,
        reorderExercise,
        isExpanded,
        setIsExpanded,
      }}
    >
      {children}
    </ActiveWorkoutContext.Provider>
  );
};
