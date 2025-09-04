"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Plus, Trash2 } from "lucide-react"

type Player = {
  id: string
  name: string
}

type Game = {
  id: string
  name: string
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
  orange: "bg-orange-500",
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

  const supabase = createClient()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [playersRes, gamesRes, statusesRes] = await Promise.all([
        supabase.from("players").select("*").order("name"),
        supabase.from("games").select("*").order("name"),
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

        // Create default status entries for all games
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

        // Create default status entries for all players
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

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading...</div>
  }

  return (
    <div className="w-full space-y-6">
      {/* Add Controls */}
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

      {/* Status Table */}
      <Card>
        <CardHeader>
          <CardTitle>Player Status Table</CardTitle>
          <p className="text-sm text-muted-foreground">
            Click buttons to cycle through: White → Red → Orange → Green → White
          </p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="sticky left-0 bg-background border border-border p-2 text-left min-w-[120px]">
                    Player / Game
                  </th>
                  {games.map((game) => (
                    <th key={game.id} className="border border-border p-2 text-center min-w-[100px] relative">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium truncate">{game.name}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 ml-1"
                          onClick={() => removeGame(game.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {players.map((player) => (
                  <tr key={player.id}>
                    <td className="sticky left-0 bg-background border border-border p-2 min-w-[120px]">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium truncate">{player.name}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 ml-1"
                          onClick={() => removePlayer(player.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </td>
                    {games.map((game) => (
                      <td key={`${player.id}-${game.id}`} className="border border-border p-2 text-center">
                        <Button
                          variant="outline"
                          size="sm"
                          className={`w-8 h-8 p-0 ${STATUS_COLORS[getPlayerStatus(player.id, game.id)]} hover:${STATUS_COLORS[getPlayerStatus(player.id, game.id)]} hover:opacity-100`}
                          onClick={() => cycleStatus(player.id, game.id)}
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
    </div>
  )
}
