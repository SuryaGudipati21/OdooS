function Badge({ children, status = "default" }) {
  const styles = {
    available: "bg-green-100 text-green-700",
    active: "bg-blue-100 text-blue-700",
    warning: "bg-yellow-100 text-yellow-700",
    unavailable: "bg-red-100 text-red-700",
    default: "bg-gray-100 text-gray-700",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-sm font-medium ${
        styles[status] || styles.default
      }`}
    >
      {children}
    </span>
  );
}

export default Badge;