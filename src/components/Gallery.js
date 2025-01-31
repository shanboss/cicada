const Gallery = () => {
  return (
    <section
      id="gallery"
      className="py-16 px-6 bg-gray-900 text-white text-center"
    >
      <h2 className="text-4xl font-bold">Gallery</h2>
      <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="h-40 bg-gray-700"></div>
        <div className="h-40 bg-gray-700"></div>
        <div className="h-40 bg-gray-700"></div>
        <div className="h-40 bg-gray-700"></div>
      </div>
    </section>
  );
};

export default Gallery;
