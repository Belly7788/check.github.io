import React, { useState } from 'react';

const columns = [
  { field: 'id', headerName: 'ID', width: 'w-24', sortable: true },
  { field: 'firstName', headerName: 'First name', width: 'w-40', sortable: true },
  { field: 'lastName', headerName: 'Last name', width: 'w-40', sortable: true },
  { field: 'age', headerName: 'Age', width: 'w-28', type: 'number', sortable: true },
  {
    field: 'fullName',
    headerName: 'Full name',
    width: 'w-48',
    sortable: false,
    valueGetter: (row) => `${row.firstName || ''} ${row.lastName || ''}`,
  },
];

const rows = [
  { id: 1, lastName: 'Snow', firstName: 'Jon', age: 14 },
  { id: 2, lastName: 'Lannister', firstName: 'Cersei', age: 31 },
  { id: 3, lastName: 'Lannister', firstName: 'Jaime', age: 31 },
  { id: 4, lastName: 'Stark', firstName: 'Arya', age: 11 },
  { id: 5, lastName: 'Targaryen', firstName: 'Daenerys', age: null },
  { id: 6, lastName: 'Melisandre', firstName: null, age: 150 },
  { id: 7, lastName: 'Clifford', firstName: 'Ferrara', age: 44 },
  { id: 8, lastName: 'Frances', firstName: 'Rossini', age: 36 },
  { id: 9, lastName: 'Roxie', firstName: 'Harvey', age: 65 },
];

const CustomDataTable = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(5);
  const [selectedRows, setSelectedRows] = useState([]);
  const [data, setData] = useState(rows);
  const [sortField, setSortField] = useState(null);
  const [sortOrder, setSortOrder] = useState('asc');
  const [menuOpen, setMenuOpen] = useState(null);

  // Handle pagination
  const handleChangePage = (newPage) => {
    setPage(newPage);
  };

  // Handle checkbox selection
  const handleSelectRow = (id) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
  };

  // Handle select all
  const handleSelectAll = (event) => {
    if (event.target.checked) {
      const newSelected = data.map((row) => row.id);
      setSelectedRows(newSelected);
    } else {
      setSelectedRows([]);
    }
  };

  // Handle sorting
  const handleSort = (field) => {
    if (!field.sortable) return;
    const newSortOrder = sortField === field.field && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortField(field.field);
    setSortOrder(newSortOrder);
    setData([...data].sort((a, b) => {
      const aValue = a[field.field] || '';
      const bValue = b[field.field] || '';
      return newSortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
    }));
    setMenuOpen(null);
  };

  // Calculate displayed rows
  const displayedRows = data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <div className="w-full max-w-6xl mx-auto bg-gray-900 text-white rounded-lg overflow-hidden shadow-lg">
      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full table-auto">
          {/* Table Header */}
          <thead className="bg-gray-800 border-b border-gray-700">
            <tr>
              <th className="p-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedRows.length === data.length}
                  onChange={handleSelectAll}
                  className="h-4 w-4 text-blue-400 rounded border-gray-600"
                />
              </th>
              {columns.map((column) => (
                <th
                  key={column.field}
                  className={`p-3 text-left text-sm font-medium ${column.width} relative`}
                >
                  <div className="flex items-center">
                    {column.headerName}
                    {column.sortable && (
                      <button
                        onClick={() => setMenuOpen(column.field)}
                        className="ml-2 text-gray-400 hover:text-white focus:outline-none"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          <path d="M4 8a2 2 0 12-4 0 2 2 0 004 0z" />
                          <path d="M16 8a2 2 0 12-4 0 2 2 0 004 0z" />
                        </svg>
                      </button>
                    )}
                    {menuOpen === column.field && (
                      <div className="absolute z-10 mt-1 w-48 bg-gray-700 rounded-md shadow-lg">
                        <button
                          onClick={() => handleSort(column)}
                          className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-600"
                        >
                          {sortOrder === 'asc' ? '↓ Sort by DESC' : '↑ Sort by ASC'}
                        </button>
                      </div>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          {/* Table Body */}
          <tbody>
            {displayedRows.map((row) => (
              <tr
                key={row.id}
                className="border-b border-gray-800 hover:bg-gray-700 transition-colors"
              >
                <td className="p-3">
                  <input
                    type="checkbox"
                    checked={selectedRows.includes(row.id)}
                    onChange={() => handleSelectRow(row.id)}
                    className="h-4 w-4 text-blue-400 rounded border-gray-600"
                  />
                </td>
                {columns.map((column) => (
                  <td
                    key={column.field}
                    className={`p-3 text-sm ${column.width}`}
                  >
                    {column.valueGetter
                      ? column.valueGetter(row)
                      : row[column.field] || ''}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center p-4 bg-gray-800 border-t border-gray-700">
        <div className="text-sm text-gray-400">
          Showing {page * rowsPerPage + 1} to{' '}
          {Math.min((page + 1) * rowsPerPage, data.length)} of {data.length}{' '}
          entries
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => handleChangePage(page - 1)}
            disabled={page === 0}
            className="px-4 py-2 text-sm text-gray-300 bg-gray-700 border border-gray-600 rounded hover:bg-gray-600 disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={() => handleChangePage(page + 1)}
            disabled={page >= Math.ceil(data.length / rowsPerPage) - 1}
            className="px-4 py-2 text-sm text-gray-300 bg-gray-700 border border-gray-600 rounded hover:bg-gray-600 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomDataTable;
