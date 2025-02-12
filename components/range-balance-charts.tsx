"use client"

import { useState, useEffect } from "react"
import { RadarChartComponent } from "./radar-chart"

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

type RangeBalanceChartsProps = {
  exercises: Exercise[]
  type: "short" | "long"
}

const tensionLevels = {
  low: 0.33,
  medium: 0.66,
  high: 1,
}

export function RangeBalanceCharts({ exercises, type }: RangeBalanceChartsProps) {
  const [data, setData] = useState<any[]>([])
  const [allHighTension, setAllHighTension] = useState(false)

  useEffect(() => {
    const getHighestTension = (exercisePairs: Exercise[]) => {
      return Math.max(
        ...exercisePairs.flatMap((pair) =>
          pair.exercises
            .filter((ex) => ex.range === type)
            .flatMap((ex, index) =>
              pair.progress.filter((p) => p.exerciseIndex === index).map((p) => tensionLevels[p.tension]),
            ),
        ),
        0,
      )
    }

    const functions = Array.from(new Set(exercises.flatMap((e) => e.exercises.map((ex) => ex.function))))

    const chartData = functions.map((func) => ({
      subject: func,
      A: getHighestTension(
        exercises.filter((e) => e.exercises.some((ex) => ex.function === func && ex.range === type)),
      ),
      fullMark: 1,
    }))

    setData(chartData)
    setAllHighTension(chartData.every((data) => data.A === 1))
  }, [exercises, type])

  return (
    <RadarChartComponent
      data={data}
      title={`${type.charAt(0).toUpperCase() + type.slice(1)} Range Balance`}
      description={`Tension levels for ${type} range exercises`}
      color={type === "short" ? "hsl(var(--success))" : "hsl(var(--destructive))"}
      allHighTension={allHighTension}
    />
  )
}

