import { useQuery } from "@tanstack/react-query";
import { Train } from "@shared/schema";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Train as TrainIcon } from "lucide-react";

interface TrainListProps {
  onSelect: (train: Train) => void;
}

export default function TrainList({ onSelect }: TrainListProps) {
  const { data: trains, isLoading } = useQuery<Train[]>({
    queryKey: ["/api/trains"],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!trains?.length) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No trains found. Try adjusting your search criteria.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {trains.map((train) => (
        <Card key={train.id} className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <TrainIcon className="h-8 w-8 text-primary" />
              <div>
                <h3 className="text-lg font-semibold">{train.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {train.origin} → {train.destination}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold">${train.price}</p>
              <p className="text-sm text-muted-foreground">
                {new Date(train.departureTime).toLocaleString()}
              </p>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm">
              {train.seats} seats available
            </p>
            <Button onClick={() => onSelect(train)}>
              Book Now
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
