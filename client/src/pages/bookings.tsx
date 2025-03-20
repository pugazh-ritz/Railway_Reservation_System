import { useQuery, useMutation } from "@tanstack/react-query";
import { Booking, Train } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Train as TrainIcon, Calendar, IndianRupee } from "lucide-react";
import { Link } from "wouter";

export default function Bookings() {
  const { toast } = useToast();

  const { data: bookings } = useQuery<Booking[]>({
    queryKey: ["/api/bookings"],
  });

  const { data: trains } = useQuery<Train[]>({
    queryKey: ["/api/trains"],
  });

  const cancelBookingMutation = useMutation({
    mutationFn: async (bookingId: number) => {
      const res = await apiRequest("PUT", `/api/bookings/${bookingId}`, {
        status: "cancelled",
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      toast({
        title: "Booking Cancelled",
        description: "Your booking has been cancelled successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getTrain = (trainId: number) => {
    return trains?.find((train) => train.id === trainId);
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Bookings</h1>
        <Link href="/">
          <Button>Book New Ticket</Button>
        </Link>
      </div>

      {bookings?.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-500">No bookings found</p>
            <Link href="/">
              <Button className="mt-4">Book Your First Train</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {bookings?.map((booking) => {
            const train = getTrain(booking.trainId);
            return (
              <Card key={booking.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center mb-2">
                        <TrainIcon className="h-5 w-5 mr-2" />
                        <h3 className="font-semibold">{train?.name}</h3>
                      </div>
                      <div className="text-sm text-gray-500 space-y-1">
                        <p>
                          {train?.from} → {train?.to}
                        </p>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {train &&
                            format(
                              new Date(train.departureTime),
                              "dd MMM yyyy, h:mm a"
                            )}
                        </div>
                        <div className="flex items-center">
                          <IndianRupee className="h-4 w-4 mr-1" />
                          {booking.totalPrice}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span
                        className={`inline-block px-2 py-1 rounded text-sm ${
                          booking.status === "confirmed"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {booking.status}
                      </span>
                      {booking.status === "confirmed" && (
                        <Button
                          variant="destructive"
                          className="mt-2"
                          onClick={() => cancelBookingMutation.mutate(booking.id)}
                          disabled={cancelBookingMutation.isPending}
                        >
                          Cancel Booking
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  );
}
