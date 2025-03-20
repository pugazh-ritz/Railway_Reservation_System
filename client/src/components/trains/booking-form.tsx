import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Train, insertReservationSchema } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

interface BookingFormProps {
  train: Train;
}

const bookingSchema = insertReservationSchema.extend({
  seatCount: z.coerce.number().min(1).max(10),
});

export default function BookingForm({ train }: BookingFormProps) {
  const { toast } = useToast();
  const { user } = useAuth();

  const form = useForm({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      trainId: train.id,
      userId: user?.id,
      seatCount: 1,
      status: "pending",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: z.infer<typeof bookingSchema>) => {
      const response = await apiRequest("POST", "/api/reservations", {
        ...data,
        userId: user?.id, // Ensure userId is included
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create reservation");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reservations"] });
      toast({
        title: "Success",
        description: "Booking confirmed successfully",
      });
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof bookingSchema>) => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "Please log in to make a reservation",
        variant: "destructive",
      });
      return;
    }
    mutation.mutate(data);
  };

  if (train.seats < 1) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            Sorry, this train is fully booked.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Book Your Journey</CardTitle>
        <CardDescription>
          Complete your reservation for {train.name}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <div className="space-y-2">
              <h4 className="font-medium">Journey Details</h4>
              <p className="text-sm text-muted-foreground">
                {train.origin} → {train.destination}
              </p>
              <p className="text-sm text-muted-foreground">
                Departure: {new Date(train.departureTime).toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">
                Available seats: {train.seats}
              </p>
              <p className="text-sm text-muted-foreground">
                Price per seat: ${train.price}
              </p>
            </div>

            <FormField
              control={form.control}
              name="seatCount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Number of Seats</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      max={Math.min(10, train.seats)}
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseInt(e.target.value) || 1)
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="pt-4 border-t">
              <div className="flex justify-between mb-4">
                <span>Total Price</span>
                <span className="font-semibold">
                  ${train.price * form.watch("seatCount")}
                </span>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={mutation.isPending}
              >
                {mutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Confirm Booking
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}