"use client"

import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

type ProgressEntry = {
  id: string
  exerciseIndex: number
  date: string
  tension: "low" | "medium" | "high"
  reps: number
  weight: number
}

type Exercise = {
  id: number
  exercises: [
    {
      name: string
      description: string
      function: string
      range: string
      youtubeLink: string
      typeOfMovement: "Compound Exercise" | "Isolation Exercise"
    },
    {
      name: string
      description: string
      function: string
      range: string
      youtubeLink: string
      typeOfMovement: "Compound Exercise" | "Isolation Exercise"
    },
  ]
  reappearInterval: number
  completed: boolean
  completionTime?: number
  reappearTime?: number
  progress: ProgressEntry[]
}

type TensionLevelChartProps = {
  exercises: Exercise[]
}

const tensionLevels = {
  low: 1,
  medium: 2,
  high: 3,
}

export function TensionLevelChart({ exercises }: TensionLevelChartProps) {
  const [functionType, setFunctionType] = useState<string>("")
  const [shortRangeTension, setShortRangeTension] = useState<number>(0)
  const [longRangeTension, setLongRangeTension] = useState<number>(0)

  const functions = Array.from(new Set(exercises.flatMap((e) => e.exercises.map((ex) => ex.function))))

  useEffect(() => {
    if (functionType) {
      const filteredExercises = exercises.filter((e) => e.exercises.some((ex) => ex.function === functionType))

      const getHighestTension = (exercises: Exercise[], range: string) => {
        return Math.max(
          ...exercises.flatMap((e) =>
            e.exercises
              .filter((ex) => ex.range === range)
              .flatMap((ex, index) =>
                e.progress.filter((p) => p.exerciseIndex === index).map((p) => tensionLevels[p.tension]),
              ),
          ),
          0,
        )
      }

      const shortRangeExercises = filteredExercises.filter((e) => e.exercises.some((ex) => ex.range === "short"))
      const longRangeExercises = filteredExercises.filter((e) => e.exercises.some((ex) => ex.range === "long"))

      setShortRangeTension(getHighestTension(shortRangeExercises, "short"))
      setLongRangeTension(getHighestTension(longRangeExercises, "long"))
    }
  }, [functionType, exercises])

  const getTensionLabel = (tension: number) => {
    switch (tension) {
      case 1:
        return "Low Tension"
      case 2:
        return "Medium Tension"
      case 3:
        return "High Tension"
      default:
        return "No data"
    }
  }

  const renderTensionBox = (tension: number, title: string) => (
    <div className="w-full p-4 border rounded-lg">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-2xl font-bold">{getTensionLabel(tension)}</p>
      {tension === 3 && (
        <Alert className="mt-2">
          <AlertDescription>Congrats, you reached high tension!</AlertDescription>
        </Alert>
      )}
    </div>
  )

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Tension Level</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 mb-4">
          <Select value={functionType} onValueChange={setFunctionType}>
            <SelectTrigger>
              <SelectValue placeholder="Select Function" />
            </SelectTrigger>
            <SelectContent>
              {functions.map((func) => (
                <SelectItem key={func} value={func}>
                  {func}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {(shortRangeTension > 0 || longRangeTension > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderTensionBox(shortRangeTension, "Short Range")}
            {renderTensionBox(longRangeTension, "Long Range")}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

