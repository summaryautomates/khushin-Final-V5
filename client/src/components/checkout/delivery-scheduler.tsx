import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { addDays, format, isBefore, startOfToday } from "date-fns";

const timeSlots = [
  "09:00 - 12:00",
  "12:00 - 15:00",
  "15:00 - 18:00",
  "18:00 - 21:00"
];

interface DeliverySchedulerProps {
  value?: { date: string; timeSlot: string } | null;
  onChange?: (value: { date: string; timeSlot: string } | null) => void;
  onScheduleSelect?: (date: Date, timeSlot: string) => void;
  selectedDate?: Date;
  selectedTimeSlot?: string;
}

export function DeliveryScheduler({ 
  value,
  onChange,
  onScheduleSelect,
  selectedDate: propSelectedDate,
  selectedTimeSlot: propSelectedTimeSlot 
}: DeliverySchedulerProps) {
  const [date, setDate] = useState<Date | undefined>(propSelectedDate || (value ? new Date(value.date) : undefined));
  const [timeSlot, setTimeSlot] = useState<string | undefined>(propSelectedTimeSlot || value?.timeSlot);

  const handleDateSelect = (newDate: Date | undefined) => {
    setDate(newDate);
    if (newDate && timeSlot) {
      if (onScheduleSelect) {
        onScheduleSelect(newDate, timeSlot);
      }
      if (onChange) {
        onChange({
          date: newDate.toISOString(),
          timeSlot
        });
      }
    }
  };

  const handleTimeSelect = (newTimeSlot: string) => {
    setTimeSlot(newTimeSlot);
    if (date) {
      if (onScheduleSelect) {
        onScheduleSelect(date, newTimeSlot);
      }
      if (onChange) {
        onChange({
          date: date.toISOString(),
          timeSlot: newTimeSlot
        });
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium">Select Delivery Time</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleDateSelect}
          disabled={(date) => isBefore(date, startOfToday())}
          initialFocus
          className="rounded-md border"
        />

        <div className="space-y-2">
          <label className="text-sm font-medium">Preferred Time Slot</label>
          <Select
            value={timeSlot}
            onValueChange={handleTimeSelect}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a time slot" />
            </SelectTrigger>
            <SelectContent>
              {timeSlots.map((slot) => (
                <SelectItem key={slot} value={slot}>
                  {slot}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {date && timeSlot && (
          <div className="text-sm text-muted-foreground">
            Estimated delivery: {format(date, "EEEE, MMMM do")} between {timeSlot}
          </div>
        )}
      </CardContent>
    </Card>
  );
}