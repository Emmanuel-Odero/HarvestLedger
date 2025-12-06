/**
 * Activity Feed Component
 *
 * Displays real-time activity updates
 */

"use client";

import { useActivityFeed } from "@/lib/user-journey-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function ActivityFeed() {
  const { activityFeed, clearActivityFeed } = useActivityFeed();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Recent Activity</CardTitle>
          {activityFeed.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearActivityFeed}
              className="text-xs"
            >
              Clear
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {activityFeed.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">📭</div>
            <p className="text-sm">No recent activity</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {activityFeed.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="text-2xl flex-shrink-0">{activity.icon}</div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm text-gray-900">
                    {activity.title}
                  </h4>
                  <p className="text-xs text-gray-600 mt-1">
                    {activity.description}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatTimestamp(activity.timestamp)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function formatTimestamp(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}
