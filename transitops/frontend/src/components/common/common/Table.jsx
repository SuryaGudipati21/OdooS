function Table({ columns = [], data = [] }) {
  return (
    <div className="overflow-x-auto rounded-lg bg-white shadow">
      <table className="w-full">
        <thead className="bg-gray-100">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className="px-4 py-3 text-left"
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {data.map((row, index) => (
            <tr
              key={row.id || index}
              className="border-t"
            >
              {columns.map((column) => (
                <td
                  key={column.key}
                  className="px-4 py-3"
                >
                  {row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Table;