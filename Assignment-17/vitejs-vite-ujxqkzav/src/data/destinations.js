export const initialDestinations = [
  {
    id: 'tokyo',
    name: 'Tokyo',
    country: 'Japan',
    description:
      'Neon-lit skyscrapers, historic temples, and world-class culinary experiences.',
    image:
      'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&auto=format&fit=crop',
    defaultItinerary: [
      {
        day: 1,
        title: 'Shinjuku & Shibuya',
        activities: [
          { id: '1', name: 'Shibuya Crossing', time: '10:00 AM', cost: 0 },
          {
            id: '2',
            name: 'Ramen Tasting in Omoide Yokocho',
            time: '1:00 PM',
            cost: 25,
          },
          {
            id: '3',
            name: 'Tokyo Metropolitan Observation Deck',
            time: '5:00 PM',
            cost: 0,
          },
        ],
      },
      {
        day: 2,
        title: 'Historic Asakusa',
        activities: [
          { id: '4', name: 'Senso-ji Temple', time: '09:00 AM', cost: 0 },
          { id: '5', name: 'Sumida River Cruise', time: '2:00 PM', cost: 15 },
        ],
      },
    ],
  },
  {
    id: 'paris',
    name: 'Paris',
    country: 'France',
    description:
      'Iconic art, classical architecture, and unforgettable cafe culture.',
    image:
      'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&auto=format&fit=crop',
    defaultItinerary: [
      {
        day: 1,
        title: 'City Highlights',
        activities: [
          { id: '6', name: 'Eiffel Tower Summit', time: '09:30 AM', cost: 30 },
          { id: '7', name: 'Louvre Museum Tour', time: '2:00 PM', cost: 22 },
        ],
      },
    ],
  },
  {
    id: 'newyork',
    name: 'New York City',
    country: 'United States',
    description:
      'Bustling streets, iconic skylines, world-class theater, and endless energy.',
    image:
      'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&auto=format&fit=crop',
    defaultItinerary: [
      {
        day: 1,
        title: 'Manhattan Landmarks',
        activities: [
          { id: '8', name: 'Central Park Walk', time: '09:00 AM', cost: 0 },
          {
            id: '9',
            name: 'Top of the Rock Observation Deck',
            time: '1:30 PM',
            cost: 40,
          },
          { id: '10', name: 'Broadway Show', time: '7:00 PM', cost: 120 },
        ],
      },
    ],
  },
  {
    id: 'kyoto',
    name: 'Kyoto',
    country: 'Japan',
    description:
      'Serene bamboo groves, traditional wooden houses, and centuries-old shrines.',
    image:
      'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&auto=format&fit=crop',
    defaultItinerary: [
      {
        day: 1,
        title: 'Temple & Nature Trail',
        activities: [
          { id: '11', name: 'Fushimi Inari Shrine', time: '08:00 AM', cost: 0 },
          {
            id: '12',
            name: 'Arashiyama Bamboo Grove',
            time: '1:00 PM',
            cost: 0,
          },
          {
            id: '13',
            name: 'Traditional Tea Ceremony',
            time: '4:00 PM',
            cost: 35,
          },
        ],
      },
    ],
  },
];
