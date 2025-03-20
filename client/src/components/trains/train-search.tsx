import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Train } from "@shared/schema";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function TrainSearch() {
  const queryClient = useQueryClient();
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");

  const handleSearch = () => {
    // Filter trains client-side since we're using in-memory storage
    queryClient.setQueryData<Train[]>(["/api/trains"], (trains) => {
      if (!trains) return [];
      return trains.filter(
        (train) =>
          (!origin || train.origin.toLowerCase().includes(origin.toLowerCase())) &&
          (!destination ||
            train.destination.toLowerCase().includes(destination.toLowerCase()))
      );
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Search Trains</CardTitle>
        <CardDescription>Find trains by origin and destination</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            placeholder="Origin"
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
          />
          <Input
            placeholder="Destination"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
          />
          <Button onClick={handleSearch}>
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
