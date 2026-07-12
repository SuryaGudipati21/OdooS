// Owner: Dev D

export default function Card({ children }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-5 border">
      {children}
    </div>
  );
}