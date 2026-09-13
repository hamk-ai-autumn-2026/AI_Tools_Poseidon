import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, Calendar, MapPin, Trash2 } from 'lucide-react';
import { useItinerary } from './hooks/useItinerary';
import { initialDestinations } from './data/destinations';

export default function App() {
  const { selectedCity, setSelectedCity, days, totalSpent, removeActivity } =
    useItinerary();
  const [activeTab, setActiveTab] = useState<'explore' | 'itinerary'>(
    'explore'
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-500/30">
            <Compass className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            GlobeTrotter AI
          </span>
        </div>
        <nav className="flex gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
          {(['explore', 'itinerary'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          {activeTab === 'explore' && (
            <motion.div
              key="explore"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {initialDestinations.map((dest) => (
                <div
                  key={dest.id}
                  onClick={() => {
                    setSelectedCity(dest);
                    setActiveTab('itinerary');
                  }}
                  className="group relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-900/80 hover:border-indigo-500/50 transition-all cursor-pointer"
                >
                  <img
                    src={dest.image}
                    alt={dest.name}
                    className="h-48 w-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="p-5">
                    <div className="flex items-center gap-1 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
                      <MapPin className="w-3.5 h-3.5" /> {dest.country}
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">
                      {dest.name}
                    </h3>
                    <p className="text-slate-400 text-sm line-clamp-2">
                      {dest.description}
                    </p>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {activeTab === 'itinerary' && (
            <motion.div
              key="itinerary"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-end border-b border-slate-800 pb-4">
                <div>
                  <h2 className="text-3xl font-extrabold text-white">
                    {selectedCity.name} Trip Plan
                  </h2>
                  <p className="text-slate-400 text-sm">
                    Organize your daily activities and timing
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-500 block">
                    Est. Cost
                  </span>
                  <span className="text-2xl font-bold text-emerald-400">
                    ${totalSpent}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {days.map((day: any, dIdx: number) => (
                  <div
                    key={dIdx}
                    className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 backdrop-blur-sm"
                  >
                    <h3 className="font-bold text-lg text-indigo-300 mb-4 flex items-center justify-between">
                      <span>
                        Day {day.day}: {day.title}
                      </span>
                      <Calendar className="w-4 h-4 text-slate-500" />
                    </h3>
                    <div className="space-y-3">
                      {day.activities.map((act: any) => (
                        <div
                          key={act.id}
                          className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/50 flex justify-between items-center"
                        >
                          <div>
                            <div className="text-sm font-semibold text-white">
                              {act.name}
                            </div>
                            <div className="text-xs text-slate-400">
                              {act.time} • ${act.cost}
                            </div>
                          </div>
                          <button
                            onClick={() => removeActivity(dIdx, act.id)}
                            className="text-slate-500 hover:text-rose-400"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
