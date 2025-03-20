import { useQuery, useMutation } from "@tanstack/react-query";
import { Train, Booking } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { format } from "date-fns";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarIcon, Plus, Edit, Trash } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertTrainSchema } from "@shared/schema";

export default function AdminDashboard() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTrain, setSelectedTrain] = useState<Train | null>(null);

  const { data: trains } = useQuery<Train[]>({
    queryKey: ["/api/trains"],
  });

  const { data: bookings } = useQuery<Booking[]>({
    queryKey: ["/api/bookings"],
  });

  const form = useForm({
    resolver: zodResolver(insertTrainSchema),
    defaultValues: selectedTrain || {
      name: "",
      from: "",
      to: "",
      departureTime: new Date(),
      arrivalTime: new Date(),
      totalSeats: 100,
      availableSeats: 100,
      price: 0,
    },
  });

  const createTrainMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest(
        selectedTrain ? "PUT" : "POST",
        selectedTrain ? `/api/trains/${selectedTrain.id}` : "/api/trains",
        data
      );
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/trains"] });
      setIsDialogOpen(false);
      setSelectedTrain(null);
      form.reset();
      toast({
        title: selectedTrain ? "Train Updated" : "Train Created",
        description: selectedTrain
          ? "Train has been updated successfully"
          : "New train has been added successfully",
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

  const deleteTrainMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/trains/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/trains"] });
      toast({
        title: "Train Deleted",
        description: "Train has been deleted successfully",
      });
    },
  });

  const onSubmit = form.handleSubmit((data) => {
    createTrainMutation.mutate(data);
  });

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Admin Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Total Trains</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{trains?.length || 0}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Total Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{bookings?.length || 0}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                ₹
                {bookings?.reduce(
                  (total, booking) => total + booking.totalPrice,
                  0
                ) || 0}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Tabs defaultValue="trains">
        <TabsList>
          <TabsTrigger value="trains">Trains</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
        </TabsList>

        <TabsContent value="trains">
          <div className="flex justify-end mb-4">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Train
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {selectedTrain ? "Edit Train" : "Add New Train"}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={onSubmit} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Name</label>
                    <Input {...form.register("name")} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">From</label>
                      <Input {...form.register("from")} />
                    </div>
                    <div>
                      <label className="text-sm font-medium">To</label>
                      <Input {...form.register("to")} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Departure Time</label>
                      <Input
                        type="datetime-local"
                        {...form.register("departureTime")}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Arrival Time</label>
                      <Input
                        type="datetime-local"
                        {...form.register("arrivalTime")}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Total Seats</label>
                      <Input
                        type="number"
                        {...form.register("totalSeats", { valueAsNumber: true })}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Price</label>
                      <Input
                        type="number"
                        {...form.register("price", { valueAsNumber: true })}
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full">
                    {selectedTrain ? "Update Train" : "Add Train"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Route</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Available Seats</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {trains?.map((train) => (
                <TableRow key={train.id}>
                  <TableCell>{train.name}</TableCell>
                  <TableCell>
                    {train.from} → {train.to}
                  </TableCell>
                  <TableCell>
                    {format(new Date(train.departureTime), "h:mm a")}
                  </TableCell>
                  <TableCell>
                    {train.availableSeats}/{train.totalSeats}
                  </TableCell>
                  <TableCell>₹{train.price}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          setSelectedTrain(train);
                          setIsDialogOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => deleteTrainMutation.mutate(train.id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>

        <TabsContent value="bookings">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Booking ID</TableHead>
                <TableHead>User ID</TableHead>
                <TableHead>Train</TableHead>
                <TableHead>Seats</TableHead>
                <TableHead>Total Price</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings?.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell>{booking.id}</TableCell>
                  <TableCell>{booking.userId}</TableCell>
                  <TableCell>{booking.trainId}</TableCell>
                  <TableCell>{booking.seatCount}</TableCell>
                  <TableCell>₹{booking.totalPrice}</TableCell>
                  <TableCell>{booking.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>
      </Tabs>
    </div>
  );
}
