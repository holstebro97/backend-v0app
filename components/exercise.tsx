"use client"

import { useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trash2, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

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
      youtubeTitle: string
      typeOfMovement: "Compound Exercise" | "Isolation Exercise"
    },
    {
      name: string
      description: string
      function: string
      range: string
      youtubeLink: string
      youtubeTitle: string
      typeOfMovement: "Compound Exercise" | "Isolation Exercise"
    },
  ]
  reappearInterval: number
  completed: boolean
  completionTime?: number
  reappearTime?: number
  progress: ProgressEntry[]
}

type ExerciseProps = {
  exercise: Exercise
  onCheck: (id: number) => void
  onUpdateProgress: (id: number, progress: ProgressEntry) => void
  onDeleteProgress: (id: number, progressId: string, exerciseIndex: number) => void
  isResting: boolean
  onCancelRest: (id: number) => void
  onStartCountdown: (id: number, duration: number) => void
  countdownRemaining: number | null
  onReset?: (id: number) => void
}

export function Exercise({
  exercise,
  onCheck,
  onUpdateProgress,
  onDeleteProgress,
  isResting,
  onCancelRest,
  onStartCountdown,
  countdownRemaining,
  onReset,
}: ExerciseProps) {
  const [showProgress, setShowProgress] = useState([false, false])
  const [showHistory, setShowHistory] = useState([false, false])
  const [newProgress, setNewProgress] = useState<Omit<ProgressEntry, "id" | "exerciseIndex">[]>([
    {
      date: new Date().toISOString().split("T")[0],
      tension: "low",
      reps: 0,
      weight: 0,
    },
    {
      date: new Date().toISOString().split("T")[0],
      tension: "low",
      reps: 0,
      weight: 0,
    },
  ])

  const formatTimeRemaining = (milliseconds: number) => {
    const minutes = Math.floor(milliseconds / 60000)
    const seconds = Math.floor((milliseconds % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  const handleAddProgress = (index: number) => {
    const progressWithId: ProgressEntry = {
      ...newProgress[index],
      id: Date.now().toString(),
      exerciseIndex: index,
    }
    onUpdateProgress(exercise.id, progressWithId)
    setShowProgress((prev) => {
      const updated = [...prev]
      updated[index] = false
      return updated
    })
    setNewProgress((prev) => {
      const updated = [...prev]
      updated[index] = {
        date: new Date().toISOString().split("T")[0],
        tension: "low",
        reps: 0,
        weight: 0,
      }
      return updated
    })
  }

  const handleDeleteProgress = (progressId: string, exerciseIndex: number) => {
    onDeleteProgress(exercise.id, progressId, exerciseIndex)
  }

  return (
    <Card
      className={cn(
        "overflow-hidden border-0",
        isResting ? "opacity-50" : "",
        exercise.exercises[0].range === "short" ? "bg-green-100" : "bg-red-100",
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-bold">
          {`${exercise.exercises[0].range === "short" ? "Short" : "Long"} Range ${exercise.exercises[0].function}`}
        </CardTitle>
        <div className="flex items-center space-x-2">
          {isResting && onReset && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onReset(exercise.id)}
              className="flex items-center"
              aria-label="Reset exercise countdown"
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              Reset
            </Button>
          )}
          {!isResting && (
            <Checkbox
              checked={exercise.completed}
              onCheckedChange={() => {
                if (!exercise.completed) {
                  const duration = exercise.exercises[0].range === "short" ? 120 : 600
                  onStartCountdown(exercise.id, duration)
                }
                onCheck(exercise.id)
              }}
            />
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="bg-white bg-opacity-80 p-4 rounded-lg">
          {isResting && countdownRemaining !== null && (
            <div className="mb-4">
              <Progress
                value={(countdownRemaining / (exercise.exercises[0].range === "short" ? 120000 : 600000)) * 100}
                className="w-full"
              />
              <p className="text-sm text-center mt-1">{formatTimeRemaining(countdownRemaining)} remaining</p>
            </div>
          )}
          {exercise.exercises.map((ex, index) => (
            <div key={index} className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold">Option {index + 1}</h3>
                <a
                  href={ex.youtubeLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-700"
                >
                  {ex.youtubeTitle || "Watch Form Video"}
                </a>
              </div>
              <Badge variant="secondary">{ex.typeOfMovement}</Badge>
              <div className="flex space-x-2 mt-2">
                <Dialog
                  open={showProgress[index]}
                  onOpenChange={(open) =>
                    setShowProgress((prev) => {
                      const updated = [...prev]
                      updated[index] = open
                      return updated
                    })
                  }
                >
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      Add Progress
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Progress for {ex.name}</DialogTitle>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                      <div>
                        <Label htmlFor={`tension-${index}`}>Tension Level</Label>
                        <Select
                          value={newProgress[index].tension}
                          onValueChange={(value: "low" | "medium" | "high") =>
                            setNewProgress((prev) => {
                              const updated = [...prev]
                              updated[index] = { ...updated[index], tension: value }
                              return updated
                            })
                          }
                        >
                          <SelectTrigger id={`tension-${index}`}>
                            <SelectValue placeholder="Select tension level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low Tension</SelectItem>
                            <SelectItem value="medium">Medium Tension</SelectItem>
                            <SelectItem value="high">High Tension</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor={`reps-${index}`}>Number of Reps</Label>
                        <Input
                          id={`reps-${index}`}
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={newProgress[index].reps === 0 ? "" : newProgress[index].reps}
                          onChange={(e) =>
                            setNewProgress((prev) => {
                              const updated = [...prev]
                              updated[index] = {
                                ...updated[index],
                                reps: e.target.value === "" ? 0 : Number(e.target.value),
                              }
                              return updated
                            })
                          }
                          className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`weight-${index}`}>Weight (kg)</Label>
                        <Input
                          id={`weight-${index}`}
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={newProgress[index].weight === 0 ? "" : newProgress[index].weight}
                          onChange={(e) =>
                            setNewProgress((prev) => {
                              const updated = [...prev]
                              updated[index] = {
                                ...updated[index],
                                weight: e.target.value === "" ? 0 : Number(e.target.value),
                              }
                              return updated
                            })
                          }
                          className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                      </div>
                      <Button onClick={() => handleAddProgress(index)}>Add Progress</Button>
                    </div>
                  </DialogContent>
                </Dialog>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setShowHistory((prev) => {
                      const updated = [...prev]
                      updated[index] = !updated[index]
                      return updated
                    })
                  }
                >
                  {showHistory[index] ? "Hide History" : "Show History"}
                </Button>
              </div>
              {showHistory[index] && exercise.progress && exercise.progress.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-semibold mb-2">Progress History for {ex.name}</h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Tension</TableHead>
                        <TableHead>Reps</TableHead>
                        <TableHead>Weight (kg)</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {exercise.progress
                        .filter((entry) => entry.exerciseIndex === index)
                        .map((entry) => (
                          <TableRow key={entry.id}>
                            <TableCell>{entry.date}</TableCell>
                            <TableCell>{entry.tension}</TableCell>
                            <TableCell>{entry.reps}</TableCell>
                            <TableCell>{entry.weight}</TableCell>
                            <TableCell>
                              <Button variant="ghost" size="sm" onClick={() => handleDeleteProgress(entry.id, index)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

