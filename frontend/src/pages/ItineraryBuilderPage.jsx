import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { tripAPI, stopAPI, cityAPI, activityAPI } from '../services/api'
import { format } from 'date-fns'

export default function ItineraryBuilderPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [trip, setTrip] = useState(null)
  const [stops, setStops] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCitySearch, setShowCitySearch] = useState(false)
  const [cities, setCities] = useState([])
  const [citySearch, setCitySearch] = useState('')
  const [activities, setActivities] = useState([])
  const [activeStop, setActiveStop] = useState(null)
  const [showActivityPanel, setShowActivityPanel] = useState(false)

  useEffect(() => {
    loadTrip()
    activityAPI.getAll().then(r => setActivities(r.data))
  }, [id])

  useEffect(() => {
    if (citySearch.length > 1) {
      cityAPI.search({ search: citySearch, limit: 8 }).then(r => setCities(r.data))
    } else setCities([])
  }, [citySearch])

  const loadTrip = async () => {
    setLoading(true)
    const r = await tripAPI.getById(id)
    setTrip(r.data)
    setStops(r.data.stops || [])
    setLoading(false)
  }

  const addStop = async (city) => {
    const res = await stopAPI.add({ trip_id: id, city_id: city.id })
    setStops(p => [...p, { ...res.data.stop, activities: [] }])
    setShowCitySearch(false)
    setCitySearch('')
  }

  const removeStop = async (stopId) => {
    await stopAPI.delete(stopId)
    setStops(p => p.filter(s => s.id !== stopId))
    if (activeStop === stopId) { setActiveStop(null); setShowActivityPanel(false) }
  }

  const updateStopDates = async (stopId, field, value) => {
    setStops(p => p.map(s => s.id === stopId ? { ...s, [field]: value } : s))
    await stopAPI.update(stopId, { [field]: value })
  }

  const addActivity = async (stopId, activity) => {
    const res = await activityAPI.assign({ stop_id: stopId, activity_id: activity.id })
    setStops(p => p.map(s => s.id === stopId ? { ...s, activities: [...(s.activities || []), res.data.tripActivity] } : s))
  }

  const removeActivity = async (stopId, taId) => {
    await activityAPI.unassign(taId)
    setStops(p => p.map(s => s.id === stopId ? { ...s, activities: s.activities.filter(a => a.id !== taId) } : s))
  }

  const onDragEnd = async (result) => {
    if (!result.destination) return
    const reordered = Array.from(stops)
    const [removed] = reordered.splice(result.source.index, 1)
    reordered.splice(result.destination.index, 0, removed)
    const withOrder = reordered.map((s, i) => ({ ...s, order_index: i + 1 }))
    setStops(withOrder)
    await stopAPI.reorder(withOrder.map(s => ({ id: s.id, order_index: s.order_index })))
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const stopActivities = activeStop ? (stops.find(s => s.id === activeStop)?.activities || []) : []
  const stopCity = activeStop ? stops.find(s => s.id === activeStop) : null

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(`/trips/${id}/view`)} className="btn-secondary py-2 px-3 text-sm">← Back</button>
        <div>
          <h1 className="text-2xl font-bold text-white">{trip?.name}</h1>
          <p className="text-slate-400 text-sm">Itinerary Builder – drag cities to reorder</p>
        </div>
        <div className="ml-auto flex gap-2">
          <Link to={`/trips/${id}/view`} className="btn-primary text-sm py-2">👁 View Itinerary</Link>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Stops column */}
        <div className="lg:col-span-2 space-y-4">
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="stops">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                  {stops.length === 0 && (
                    <div className="glass p-10 text-center">
                      <div className="text-5xl mb-3">📍</div>
                      <p className="text-slate-400 mb-4">No stops added yet. Search and add your first city!</p>
                    </div>
                  )}
                  {stops.map((stop, i) => (
                    <Draggable key={stop.id} draggableId={`stop-${stop.id}`} index={i}>
                      {(provided, snapshot) => (
                        <div ref={provided.innerRef} {...provided.draggableProps}
                          className={`glass p-4 transition-all duration-200 ${snapshot.isDragging ? 'shadow-2xl shadow-primary-500/30 border-primary-500/50' : ''} ${activeStop === stop.id ? 'border-primary-500/40' : ''}`}>
                          <div className="flex items-center gap-3">
                            {/* Drag handle */}
                            <div {...provided.dragHandleProps} className="text-slate-600 hover:text-slate-400 cursor-grab active:cursor-grabbing flex-shrink-0 py-1">
                              ⠿
                            </div>

                            {/* Stop number */}
                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                              {i + 1}
                            </div>

                            {/* City info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-white">{stop.city_name}</h3>
                                <span className="text-slate-500 text-xs">{stop.country}</span>
                              </div>
                              <div className="flex gap-2 mt-2">
                                <input type="date" className="input text-xs py-1 px-2"
                                  placeholder="Arrival" value={stop.arrival_date?.split('T')[0] || ''}
                                  onChange={e => updateStopDates(stop.id, 'arrival_date', e.target.value)} />
                                <input type="date" className="input text-xs py-1 px-2"
                                  placeholder="Departure" value={stop.departure_date?.split('T')[0] || ''}
                                  onChange={e => updateStopDates(stop.id, 'departure_date', e.target.value)} />
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2 flex-shrink-0">
                              <button onClick={() => { setActiveStop(stop.id); setShowActivityPanel(true) }}
                                className="btn-secondary text-xs py-1.5 px-3">
                                🎯 {stop.activities?.length || 0} activities
                              </button>
                              <button onClick={() => removeStop(stop.id)} className="btn-danger text-xs py-1.5 px-2">✕</button>
                            </div>
                          </div>

                          {/* Activity pills */}
                          {stop.activities?.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-2 pl-10">
                              {stop.activities.slice(0, 3).map(a => (
                                <span key={a.id} className="badge bg-primary-500/10 text-primary-400 border border-primary-500/20">
                                  {a.name}
                                </span>
                              ))}
                              {stop.activities.length > 3 && (
                                <span className="badge bg-white/5 text-slate-400">+{stop.activities.length - 3} more</span>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>

          {/* Add Stop Button */}
          <button id="add-city-btn" onClick={() => setShowCitySearch(!showCitySearch)}
            className="btn-secondary w-full py-3 border-dashed hover:border-primary-500/50">
            {showCitySearch ? '✕ Cancel' : '+ Add City / Stop'}
          </button>

          {/* City search */}
          <AnimatePresence>
            {showCitySearch && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="glass p-4">
                <input id="city-search-input" type="text" className="input mb-3" placeholder="Search cities worldwide..."
                  value={citySearch} onChange={e => setCitySearch(e.target.value)} autoFocus />
                <div className="space-y-2 max-h-56 overflow-y-auto">
                  {cities.map(city => (
                    <button key={city.id} onClick={() => addStop(city)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors text-left">
                      <img src={city.image_url} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" onError={e => e.target.style.display='none'} />
                      <div>
                        <div className="text-white text-sm font-medium">{city.name}</div>
                        <div className="text-slate-500 text-xs">{city.country} • Cost index: ${city.cost_index}/day</div>
                      </div>
                    </button>
                  ))}
                  {citySearch.length > 1 && cities.length === 0 && (
                    <p className="text-slate-500 text-sm text-center py-4">No cities found for "{citySearch}"</p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Activity panel */}
        <div>
          <AnimatePresence>
            {showActivityPanel && activeStop ? (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                className="glass p-4 sticky top-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-white">🎯 Activities – {stopCity?.city_name}</h3>
                  <button onClick={() => setShowActivityPanel(false)} className="text-slate-500 hover:text-white">✕</button>
                </div>

                {/* Current activities */}
                {stopActivities.length > 0 && (
                  <div className="mb-4 space-y-2">
                    <p className="text-slate-500 text-xs mb-2">Added activities:</p>
                    {stopActivities.map(a => (
                      <div key={a.id} className="flex items-center gap-2 p-2 bg-primary-500/10 rounded-lg border border-primary-500/20">
                        <span className="text-xs text-primary-400 flex-1">{a.name}</span>
                        <span className="text-xs text-slate-500">${(a.custom_cost ?? a.base_cost ?? 0).toFixed(0)}</span>
                        <button onClick={() => removeActivity(activeStop, a.id)} className="text-red-400 hover:text-red-300 text-xs">✕</button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Available activities */}
                <p className="text-slate-500 text-xs mb-2">Add activities:</p>
                <div className="space-y-2 max-h-[50vh] overflow-y-auto">
                  {activities
                    .filter(a => !stopActivities.some(sa => sa.activity_id === a.id))
                    .map(a => (
                    <div key={a.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 transition-colors">
                      <div className="flex-1 min-w-0">
                        <div className="text-white text-xs font-medium truncate">{a.name}</div>
                        <div className="text-slate-500 text-xs">{a.category} • {a.duration_hrs}h • ${a.estimated_cost}</div>
                      </div>
                      <button onClick={() => addActivity(activeStop, a)}
                        className="btn-primary text-xs py-1 px-2 flex-shrink-0">+</button>
                    </div>
                  ))}
                </div>
              </motion.div>
            ) : (
              <div className="glass p-6 text-center sticky top-8">
                <div className="text-4xl mb-3">🎯</div>
                <p className="text-slate-400 text-sm">Click "activities" on any stop to add things to do</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
