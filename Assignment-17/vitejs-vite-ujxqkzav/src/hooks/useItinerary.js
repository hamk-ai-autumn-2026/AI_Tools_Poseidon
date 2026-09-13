import { useState, useMemo } from 'react';
import { initialDestinations } from '../data/destinations';

export function useItinerary() {
  const [selectedCity, setSelectedCity] = useState(initialDestinations[0]);
  const [days, setDays] = useState(initialDestinations[0].defaultItinerary);

  const totalSpent = useMemo(() => {
    return days.reduce(
      (acc, day) => acc + day.activities.reduce((a, act) => a + act.cost, 0),
      0
    );
  }, [days]);

  const removeActivity = (dayIndex, actId) => {
    const updated = days.map((day, idx) => {
      if (idx !== dayIndex) return day;
      return {
        ...day,
        activities: day.activities.filter((a) => a.id !== actId),
      };
    });
    setDays(updated);
  };

  return { selectedCity, setSelectedCity, days, totalSpent, removeActivity };
}
