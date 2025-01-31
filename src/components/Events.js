const events = [
  { date: "Feb 10", title: "Underground DJ Night", location: "Club 303" },
  { date: "Mar 5", title: "Production Workshop", location: "Studio B" },
];

const Events = () => {
  return (
    <section id="events" className="py-16 px-6 bg-black text-white">
      <h2 className="text-4xl font-bold text-center">Upcoming Events</h2>
      <div className="mt-6 max-w-3xl mx-auto space-y-6">
        {events.map((event, index) => (
          <div
            key={index}
            className="p-4 border border-gray-700 rounded-lg flex justify-between items-center"
          >
            <div>
              <h3 className="text-xl font-semibold">{event.title}</h3>
              <p className="text-gray-400">{event.location}</p>
            </div>
            <span className="text-gray-300 bg-gray-800 px-4 py-2 rounded-full">
              {event.date}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Events;
