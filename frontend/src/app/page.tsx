import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardPage() {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-display font-black">News2Video</h1>
          <Link href="/settings">
            <Button variant="ghost">Settings</Button>
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card className="bg-bg-secondary border-border">
            <CardHeader>
              <CardTitle className="text-sm text-gray-400">Videos this week</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">0</p>
            </CardContent>
          </Card>
          <Card className="bg-bg-secondary border-border">
            <CardHeader>
              <CardTitle className="text-sm text-gray-400">Avg time</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">—</p>
            </CardContent>
          </Card>
          <Card className="bg-bg-secondary border-border">
            <CardHeader>
              <CardTitle className="text-sm text-gray-400">Cost</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">~$0.00</p>
            </CardContent>
          </Card>
        </div>

        <Link href="/new">
          <Button size="lg" className="w-full mb-8 bg-accent-blue hover:bg-accent-blue/80">
            + New Video
          </Button>
        </Link>

        <Card className="bg-bg-secondary border-border">
          <CardHeader>
            <CardTitle>Recent Videos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-400 text-center py-12">
              No videos yet. Click &quot;New Video&quot; to get started.
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}