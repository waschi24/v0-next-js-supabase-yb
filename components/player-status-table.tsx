"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ConfirmationModal } from "@/components/ui/confirmation-modal"
import { LockModal } from "@/components/ui/lock-modal"
import { Plus, Trash2, Lock, Unlock, Trophy } from "lucide-react"

type Player = {
  id: string
  name: string
}

type Game = {
  id: string
  name: string
  created_at: string
}

type PlayerStatus = {
  id: string
  player_id: string
  game_id: string
  status: "white" | "red" | "orange" | "green"
}

const STATUS_COLORS = {
  white: "bg-white border-2 border-gray-300",
  red: "bg-red-500",
  orange: "bg-amber-500",
  green: "bg-green-500",
}

const STATUS_CYCLE = ["white", "red", "orange", "green"] as const

export function PlayerStatusTable() {
  const [players, setPlayers] = useState<Player[]>([])
  const [games, setGames] = useState<Game[]>([])
  const [playerStatuses, setPlayerStatuses] = useState<PlayerStatus[]>([])
  const [newPlayerName, setNewPlayerName] = useState("")
  const [newGameName, setNewGameName] = useState("")
  const [loading, setLoading] = useState(true)
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean
    type: "player" | "game"
    id: string
    name: string
  }>({
    isOpen: false,
    type: "player",
    id: "",
    name: "",
  })
  const [isLocked, setIsLocked] = useState(true)
  const [showLockModal, setShowLockModal] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [playersRes, gamesRes, statusesRes] = await Promise.all([
        supabase.from("players").select("*").order("name"),
        supabase.from("games").select("*").order("created_at"),
        supabase.from("player_status").select("*"),
      ])

      if (playersRes.data) setPlayers(playersRes.data)
      if (gamesRes.data) setGames(gamesRes.data)
      if (statusesRes.data) setPlayerStatuses(statusesRes.data)
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setLoading(false)
    }
  }

  const addPlayer = async () => {
    if (!newPlayerName.trim()) return

    try {
      const { data, error } = await supabase
        .from("players")
        .insert([{ name: newPlayerName.trim() }])
        .select()

      if (error) throw error

      if (data && data[0]) {
        const newPlayer = data[0]
        setPlayers([...players, newPlayer])

        const statusEntries = games.map((game) => ({
          player_id: newPlayer.id,
          game_id: game.id,
          status: "white" as const,
        }))

        if (statusEntries.length > 0) {
          const { data: statusData } = await supabase.from("player_status").insert(statusEntries).select()

          if (statusData) {
            setPlayerStatuses([...playerStatuses, ...statusData])
          }
        }
      }

      setNewPlayerName("")
    } catch (error) {
      console.error("Error adding player:", error)
    }
  }

  const addGame = async () => {
    if (!newGameName.trim()) return

    try {
      const { data, error } = await supabase
        .from("games")
        .insert([{ name: newGameName.trim() }])
        .select()

      if (error) throw error

      if (data && data[0]) {
        const newGame = data[0]
        setGames([...games, newGame])

        const statusEntries = players.map((player) => ({
          player_id: player.id,
          game_id: newGame.id,
          status: "white" as const,
        }))

        if (statusEntries.length > 0) {
          const { data: statusData } = await supabase.from("player_status").insert(statusEntries).select()

          if (statusData) {
            setPlayerStatuses([...playerStatuses, ...statusData])
          }
        }
      }

      setNewGameName("")
    } catch (error) {
      console.error("Error adding game:", error)
    }
  }

  const removePlayer = async (playerId: string) => {
    try {
      const { error } = await supabase.from("players").delete().eq("id", playerId)

      if (error) throw error

      setPlayers(players.filter((p) => p.id !== playerId))
      setPlayerStatuses(playerStatuses.filter((ps) => ps.player_id !== playerId))
    } catch (error) {
      console.error("Error removing player:", error)
    }
  }

  const removeGame = async (gameId: string) => {
    try {
      const { error } = await supabase.from("games").delete().eq("id", gameId)

      if (error) throw error

      setGames(games.filter((g) => g.id !== gameId))
      setPlayerStatuses(playerStatuses.filter((ps) => ps.game_id !== gameId))
    } catch (error) {
      console.error("Error removing game:", error)
    }
  }

  const cycleStatus = async (playerId: string, gameId: string) => {
    const currentStatus = playerStatuses.find((ps) => ps.player_id === playerId && ps.game_id === gameId)

    const currentStatusValue = currentStatus?.status || "white"
    const currentIndex = STATUS_CYCLE.indexOf(currentStatusValue)
    const nextStatus = STATUS_CYCLE[(currentIndex + 1) % STATUS_CYCLE.length]

    console.log("[v0] Cycling status:", { playerId, gameId, currentStatusValue, nextStatus })

    try {
      const { data, error } = await supabase
        .from("player_status")
        .upsert(
          {
            player_id: playerId,
            game_id: gameId,
            status: nextStatus,
          },
          {
            onConflict: "player_id,game_id",
          },
        )
        .select()

      if (error) {
        console.log("[v0] Upsert error:", error)
        throw error
      }

      console.log("[v0] Upsert successful:", data)

      if (data && data[0]) {
        setPlayerStatuses((prev) => {
          const filtered = prev.filter((ps) => !(ps.player_id === playerId && ps.game_id === gameId))
          return [...filtered, data[0]]
        })
      }
    } catch (error) {
      console.error("Error updating status:", error)
    }
  }

  const getPlayerStatus = (playerId: string, gameId: string) => {
    const status = playerStatuses.find((ps) => ps.player_id === playerId && ps.game_id === gameId)
    return status?.status || "white"
  }

  const handleDeleteClick = (type: "player" | "game", id: string, name: string) => {
    setDeleteConfirmation({
      isOpen: true,
      type,
      id,
      name,
    })
  }

  const handleConfirmDelete = async () => {
    if (deleteConfirmation.type === "player") {
      await removePlayer(deleteConfirmation.id)
    } else {
      await removeGame(deleteConfirmation.id)
    }
  }

  const closeConfirmation = () => {
    setDeleteConfirmation({
      isOpen: false,
      type: "player",
      id: "",
      name: "",
    })
  }

  const handleUnlock = () => {
    setIsLocked(false)
  }

  const handleLockToggle = () => {
    if (isLocked) {
      setShowLockModal(true)
    } else {
      setIsLocked(true)
    }
  }

  const calculateLeaderboard = () => {
    const playerScores = players.map((player) => {
      let totalScore = 0
      games.forEach((game) => {
        const status = getPlayerStatus(player.id, game.id)
        if (status === "green") {
          totalScore += 1
        } else if (status === "orange") {
          totalScore += 0.75
        }
        // red and white = 0 points (no addition needed)
      })
      return {
        player,
        score: totalScore,
      }
    })

    return playerScores.sort((a, b) => b.score - a.score)
  }

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading...</div>
  }

  return (
    <div className="relative w-full space-y-6 pt-4">
      <div className="fixed top-4 right-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={handleLockToggle}
          className="h-10 w-10 rounded-full bg-white shadow-lg border-2"
          title={isLocked ? "Tabelle entsperren" : "Tabelle sperren"}
        >
          {isLocked ? <Lock className="h-5 w-5" /> : <Unlock className="h-5 w-5" />}
        </Button>
      </div>

      {!isLocked && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Add Player</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Player name"
                  value={newPlayerName}
                  onChange={(e) => setNewPlayerName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addPlayer()}
                />
                <Button onClick={addPlayer} size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Add Game</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Game name"
                  value={newGameName}
                  onChange={(e) => setNewGameName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addGame()}
                />
                <Button onClick={addGame} size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="sticky left-0 bg-background border border-border p-2 text-left min-w-[120px] z-10">
                    Player / Game
                  </th>
                  {games.map((game) => (
                    <th key={game.id} className="border border-border p-2 text-center min-w-[100px] relative">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium truncate">{game.name}</span>
                        {!isLocked && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 ml-1"
                            onClick={() => handleDeleteClick("game", game.id, game.name)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {players.map((player) => (
                  <tr key={player.id}>
                    <td className="sticky left-0 bg-background border border-border p-2 min-w-[120px] z-10">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium truncate">{player.name}</span>
                        {!isLocked && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 ml-1"
                            onClick={() => handleDeleteClick("player", player.id, player.name)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </td>
                    {games.map((game) => (
                      <td key={`${player.id}-${game.id}`} className="border border-border p-2 text-center">
                        <Button
                          variant="outline"
                          size="sm"
                          className={`w-8 h-8 p-0 ${STATUS_COLORS[getPlayerStatus(player.id, game.id)]} hover:${STATUS_COLORS[getPlayerStatus(player.id, game.id)]} hover:opacity-100`}
                          onClick={() => !isLocked && cycleStatus(player.id, game.id)}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {players.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No players added yet. Add a player to get started.
            </div>
          )}
        </CardContent>
      </Card>

      {players.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Leaderboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {calculateLeaderboard().map((entry, index) => (
                <div
                  key={entry.player.id}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    index === 0
                      ? "bg-yellow-50 border-yellow-200"
                      : index === 1
                        ? "bg-gray-50 border-gray-200"
                        : index === 2
                          ? "bg-orange-50 border-orange-200"
                          : "bg-background"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`font-bold text-lg ${
                        index === 0
                          ? "text-yellow-600"
                          : index === 1
                            ? "text-gray-600"
                            : index === 2
                              ? "text-orange-600"
                              : "text-muted-foreground"
                      }`}
                    >
                      #{index + 1}
                    </span>
                    <span className="font-medium">{entry.player.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-lg">{entry.score}</span>
                    <div className="text-xs text-muted-foreground">{entry.score === 1 ? "Punkt" : "Punkte"}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <div className="text-sm text-muted-foreground space-y-1">
                <div className="font-medium mb-2">Punktesystem:</div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span>Grün = 1 Punkt</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-amber-500 rounded"></div>
                  <span>Orange = 0,75 Punkte</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-500 rounded"></div>
                  <span>Rot = 0 Punkte</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-white border-2 border-gray-300 rounded"></div>
                  <span>Weiß = 0 Punkte</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <ConfirmationModal
        isOpen={deleteConfirmation.isOpen}
        onClose={closeConfirmation}
        onConfirm={handleConfirmDelete}
        title={`Delete ${deleteConfirmation.type === "player" ? "Player" : "Game"}`}
        description={`Are you sure you want to delete "${deleteConfirmation.name}"? This action cannot be undone and will remove all associated status data.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
      />

      <LockModal isOpen={showLockModal} onClose={() => setShowLockModal(false)} onUnlock={handleUnlock} />
    </div>
  )
}
