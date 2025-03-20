import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Train as TrainType } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Train, MapPin, IndianRupee, Navigation } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Link } from "wouter";

export default function HomePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState<Date>(new Date());
  const [showSearch, setShowSearch] = useState(false);

  const { data: trains, isLoading } = useQuery<TrainType[]>({
    queryKey: ["/api/trains", from, to, date],
    enabled: showSearch && !!from && !!to && !!date,
  });

  const bookingMutation = useMutation({
    mutationFn: async (trainId: number) => {
      const res = await apiRequest("POST", "/api/bookings", {
        trainId,
        userId: user!.id,
        seatCount: 1,
        totalPrice: trains?.find(t => t.id === trainId)?.price || 0,
        status: "confirmed"
      });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Booking Successful",
        description: "Your ticket has been booked successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/trains"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Booking Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleSearch = () => {
    if (!from || !to || !date) {
      toast({
        title: "Invalid Search",
        description: "Please fill in all search fields",
        variant: "destructive",
      });
      return;
    }
    setShowSearch(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div 
        className="h-[40vh] bg-cover bg-center relative"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1535319591747-02dddc75b08f')"
        }}
      >
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-4xl font-bold mb-4">Book Your Train Journey</h1>
            <p className="text-lg">Safe, Comfortable and Reliable Train Travel</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto -mt-10 px-4">
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">From</label>
                <Input
                  placeholder="Departure Station"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  icon={<MapPin className="h-4 w-4" />}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">To</label>
                <Input
                  placeholder="Arrival Station"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  icon={<Navigation className="h-4 w-4" />}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={(date) => date && setDate(date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="flex items-end">
                <Button className="w-full" onClick={handleSearch}>
                  Search Trains
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {showSearch && (
          <div className="mt-8 space-y-4">
            {isLoading ? (
              <Card>
                <CardContent className="p-6">
                  <div className="animate-pulse flex space-x-4">
                    <div className="flex-1 space-y-4 py-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded"></div>
                        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : trains?.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <p>No trains found for your search criteria</p>
                </CardContent>
              </Card>
            ) : (
              trains?.map((train) => (
                <Card key={train.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Train className="h-6 w-6" />
                        <div>
                          <h3 className="font-semibold">{train.name}</h3>
                          <p className="text-sm text-gray-500">
                            {format(new Date(train.departureTime), "h:mm a")} -{" "}
                            {format(new Date(train.arrivalTime), "h:mm a")}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center mb-2">
                          <IndianRupee className="h-4 w-4 mr-1" />
                          <span className="font-semibold">{train.price}</span>
                        </div>
                        <Button
                          onClick={() => bookingMutation.mutate(train.id)}
                          disabled={train.availableSeats === 0 || bookingMutation.isPending}
                        >
                          {train.availableSeats === 0 ? "Sold Out" : "Book Now"}
                        </Button>
                      </div>
                    </div>
                    <div className="mt-4 text-sm text-gray-500">
                      {train.availableSeats} seats available
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </div>

      <div className="fixed bottom-4 right-4">
        <Link href="/bookings">
          <Button>My Bookings</Button>
        </Link>
      </div>
    </div>
  );
}
