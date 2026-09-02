"use client"

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface DataTableProps<T> {
  data: T[]
  columns: {
    key: string
    label: string
    render?: (item: T) => React.ReactNode
  }[]
  isLoading?: boolean
  pagination?: {
    current_page: number
    last_page: number
    total: number
  }
  onPageChange?: (page: number) => void
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  isLoading,
  pagination,
  onPageChange,
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="py-8 text-center text-gray-500">
        Loading...
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="py-8 text-center text-gray-500">
        No data found
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="py-3 px-4 text-left font-medium text-gray-500"
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((item, idx) => (
              <tr key={idx} className="border-b hover:bg-gray-50">
                {columns.map((column) => (
                  <td key={column.key} className="py-3 px-4">
                    {column.render ? column.render(item) : item[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pagination && pagination.last_page > 1 && (
        <div className="flex items-center justify-between pt-4 border-t">
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.current_page <= 1}
            onClick={() => onPageChange?.(pagination.current_page - 1)}
          >
            Previous
          </Button>
          <span className="text-sm text-gray-600">
            Page {pagination.current_page} of {pagination.last_page}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.current_page >= pagination.last_page}
            onClick={() => onPageChange?.(pagination.current_page + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}
