import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  limit?: number;
  label?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  limit,
  label = "items",
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const startItem = totalItems !== undefined && limit !== undefined ? (currentPage - 1) * limit + 1 : 0;
  const endItem = totalItems !== undefined && limit !== undefined ? Math.min(currentPage * limit, totalItems) : 0;

  const renderPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => onPageChange(i)}
          className={`h-9 w-9 rounded-lg text-sm font-medium transition-all duration-200 ${
            currentPage === i
              ? "bg-primary text-primary-foreground shadow-md scale-105"
              : "hover:bg-accent hover:text-accent-foreground active:scale-95"
          }`}
        >
          {i}
        </button>
      );
    }
    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 py-2 animate-in fade-in duration-300">
      {totalItems !== undefined && limit !== undefined ? (
        <p className="text-xs sm:text-sm text-muted-foreground transition-all duration-200">
          Showing <span className="font-semibold text-foreground">{startItem}</span> to{" "}
          <span className="font-semibold text-foreground">{endItem}</span> of{" "}
          <span className="font-semibold text-foreground">{totalItems}</span> {label}
        </p>
      ) : (
        <div />
      )}

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="h-9 px-2 sm:px-3 rounded-lg border text-sm font-medium transition-all duration-200 hover:bg-accent disabled:opacity-50 disabled:pointer-events-none flex items-center gap-1 active:scale-95"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Previous</span>
        </button>

        <div className="flex items-center gap-1 mx-1">
          {renderPageNumbers()}
        </div>

        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="h-9 px-2 sm:px-3 rounded-lg border text-sm font-medium transition-all duration-200 hover:bg-accent disabled:opacity-50 disabled:pointer-events-none flex items-center gap-1 active:scale-95"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
