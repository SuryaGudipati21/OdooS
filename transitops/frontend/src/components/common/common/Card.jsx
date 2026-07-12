function Card({ title, value, children }) {
  return (
    <div className="rounded-xl bg-white p-5 shadow-md">
      {title && (
        <h3 className="mb-2 text-sm font-medium text-gray-500">
          {title}
        </h3>
      )}

      {value !== undefined && (
        <p className="text-3xl font-bold text-gray-800">
          {value}
        </p>
      )}

      {children}
    </div>
  );
}

export default Card;