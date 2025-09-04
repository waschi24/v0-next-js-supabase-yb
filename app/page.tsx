import { PlayerStatusTable } from "@/components/player-status-table"

export default function Home() {
  return (
    <main className="container mx-auto py-8 px-4">
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Player Status Tracker</h1>
          <p className="text-muted-foreground">
            Track player participation across multiple games with color-coded status buttons
          </p>
        </div>

        <PlayerStatusTable />
      </div>
    </main>
  )
}
