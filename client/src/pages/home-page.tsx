import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import TrainSearch from "@/components/trains/train-search";
import TrainList from "@/components/trains/train-list";
import BookingForm from "@/components/trains/booking-form";
import { Train } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { LogOut } from "lucide-react";

export default function HomePage() {
  const { user, logoutMutation } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedTrain, setSelectedTrain] = useState<Train | null>(null);

  const handleTrainSelect = (train: Train) => {
    setSelectedTrain(train);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Railway Reservation System</h1>
          <div className="flex items-center gap-4">
            <span>Welcome, {user?.username}</span>
            {user?.isAdmin && (
              <Button variant="outline" onClick={() => setLocation("/admin")}>
                Admin Dashboard
              </Button>
            )}
            <Button 
              variant="destructive" 
              size="sm"
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="space-y-6">
              <TrainSearch />
              <TrainList onSelect={handleTrainSelect} />
            </div>
          </div>
          <div>
            {selectedTrain && (
              <div className="sticky top-4">
                <BookingForm train={selectedTrain} />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
