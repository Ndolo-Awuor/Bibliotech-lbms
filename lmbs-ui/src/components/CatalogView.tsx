import React, { useState, useMemo } from 'react';
import { useLibrary } from '../context/LibraryContext';
import { Book } from '../types';
import {
  LayoutGrid,
  List,
  Search,
  Plus,
  Calendar,
  FileText,
  MapPin,
  ArrowLeftRight,
  Edit2,
  Trash2,
  Eye,
  FilterX
} from 'lucide-react';

interface CatalogViewProps {
  onOpenAddBook: () => void;
  onOpenEditBook: (book: Book) => void;
  onOpenBookDetail: (book: Book) => void;
  onOpenIssueBookWithBook: (book: Book) => void;
  onRequestDeleteBook: (book: Book) => void;
}

export const CatalogView: React.FC<CatalogViewProps> = ({
  onOpenAddBook,
  onOpenEditBook,
  onOpenBookDetail,
  onOpenIssueBookWithBook,
  onRequestDeleteBook,
}) => {
  const { books, searchQuery, setSearchQuery } = useLibrary();

  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [selectedAvailability, setSelectedAvailability] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('title-asc');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Derive unique genres
  const genres = useMemo(() => {
    const set = new Set<string>();
    books.forEach((b) => {
      if (b.genre) set.add(b.genre);
    });
    return Array.from(set).sort();
  }, [books]);

  // Filter and sort books
  const filteredBooks = useMemo(() => {
    return books
      .filter((book) => {
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = book.title.toLowerCase().includes(q);
          const matchAuthor = book.author.toLowerCase().includes(q);
          const matchGenre = book.genre?.toLowerCase().includes(q);
          const matchIsbn = book.isbn?.toLowerCase().includes(q);
          const matchShelf = book.shelfLocation?.toLowerCase().includes(q);
          if (!matchTitle && !matchAuthor && !matchGenre && !matchIsbn && !matchShelf) {
            return false;
          }
        }

        if (selectedGenre !== 'all' && book.genre !== selectedGenre) {
          return false;
        }

        if (selectedAvailability === 'available' && book.availableCopies <= 0) {
          return false;
        }
        if (selectedAvailability === 'checked-out' && book.availableCopies > 0) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'title-asc':
            return a.title.localeCompare(b.title);
          case 'title-desc':
            return b.title.localeCompare(a.title);
          case 'author-asc':
            return a.author.localeCompare(b.author);
          case 'year-desc':
            return (b.publishedYear || 0) - (a.publishedYear || 0);
          case 'pages-desc':
            return (b.pages || 0) - (a.pages || 0);
          case 'copies-desc':
            return (b.availableCopies || 0) - (a.availableCopies || 0);
          default:
            return 0;
        }
      });
  }, [books, searchQuery, selectedGenre, selectedAvailability, sortBy]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedGenre('all');
    setSelectedAvailability('all');
    setSortBy('title-asc');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6 animate-fadeIn" id="catalog-view">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Books Catalogue
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Explore and administer {books.length} titles with live availability tracking.
          </p>
        </div>

        <button
          className="self-start sm:self-auto flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 shadow-md shadow-indigo-500/25 transition-all cursor-pointer"
          onClick={onOpenAddBook}
          id="catalog-add-book-btn"
        >
          <Plus size={16} />
          <span>Add New Book</span>
        </button>
      </div>

      {/* Filter and View Controls Toolbar */}
      <div
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm"
        id="catalog-filter-bar"
      >
        <div className="flex flex-wrap items-center gap-2.5">
          <select
            className="h-9 px-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
            id="genre-filter-select"
            aria-label="Filter by genre"
          >
            <option value="all">All Categories</option>
            {genres.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>

          <select
            className="h-9 px-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            value={selectedAvailability}
            onChange={(e) => setSelectedAvailability(e.target.value)}
            id="availability-filter-select"
            aria-label="Filter by availability"
          >
            <option value="all">All Statuses</option>
            <option value="available">Available Now</option>
            <option value="checked-out">Fully Borrowed</option>
          </select>

          <select
            className="h-9 px-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            id="sort-by-select"
            aria-label="Sort books by"
          >
            <option value="title-asc">Sort: Title (A - Z)</option>
            <option value="title-desc">Sort: Title (Z - A)</option>
            <option value="author-asc">Sort: Author (A - Z)</option>
            <option value="year-desc">Sort: Newest Year</option>
            <option value="pages-desc">Sort: Page Count</option>
            <option value="copies-desc">Sort: Copies Available</option>
          </select>

          {(selectedGenre !== 'all' || selectedAvailability !== 'all' || searchQuery.trim() !== '') && (
            <button
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              onClick={clearFilters}
              id="clear-filters-btn"
            >
              <FilterX size={14} />
              <span>Reset</span>
            </button>
          )}
        </div>

        <div className="flex items-center justify-between md:justify-end gap-3.5">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Showing <strong className="text-slate-900 dark:text-slate-100">{filteredBooks.length}</strong> of {books.length}
          </span>

          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
            <button
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
              onClick={() => setViewMode('grid')}
              title="Grid View"
              aria-label="Grid View"
              id="view-mode-grid-btn"
            >
              <LayoutGrid size={15} />
            </button>
            <button
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
              onClick={() => setViewMode('table')}
              title="Table View"
              aria-label="Table View"
              id="view-mode-table-btn"
            >
              <List size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {filteredBooks.length === 0 ? (
        <div
          className="bg-white dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center flex flex-col items-center gap-3.5"
          id="catalog-empty-state"
        >
          <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center">
            <Search size={24} />
          </div>
          <h3 className="font-bold text-lg text-slate-900 dark:text-white">No matching titles found</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">
            Try adjusting your search keywords, category filters, or availability status.
          </p>
          <button
            className="mt-2 px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm cursor-pointer"
            onClick={clearFilters}
            id="empty-state-reset-btn"
          >
            Clear Filters
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5" id="books-grid-container">
          {filteredBooks.map((book) => {
            const isAvailable = book.availableCopies > 0;
            const stockColor =
              book.availableCopies === 0
                ? 'bg-rose-500/90 text-white'
                : book.availableCopies <= 2
                ? 'bg-amber-500/90 text-white'
                : 'bg-emerald-500/90 text-white';

            return (
              <div
                key={book._id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-200 flex flex-col"
                id={`book-card-${book._id}`}
              >
                {/* Book Spine Visual */}
                <div
                  className="h-28 relative p-3.5 flex flex-col justify-between overflow-hidden"
                  style={{
                    background: book.coverGradient || 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)',
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

                  <span className="relative z-10 text-[10px] font-bold uppercase tracking-wider text-white/95 bg-black/40 backdrop-blur-md px-2 py-0.5 rounded-md self-start border border-white/10">
                    {book.genre || 'General'}
                  </span>

                  <span className={`relative z-10 text-xs font-semibold px-2 py-0.5 rounded-full backdrop-blur-md self-end ${stockColor}`}>
                    {book.availableCopies} / {book.totalCopies} Available
                  </span>
                </div>

                {/* Body Details */}
                <div className="p-4 flex-1 flex flex-col gap-2">
                  <h3
                    className="font-bold text-base text-slate-900 dark:text-white line-clamp-2 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                    title={book.title}
                    onClick={() => onOpenBookDetail(book)}
                  >
                    {book.title}
                  </h3>
                  <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    by {book.author}
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap mt-1">
                    {book.publishedYear && (
                      <span className="flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700/60">
                        <Calendar size={11} />
                        <span>{book.publishedYear}</span>
                      </span>
                    )}
                    {book.pages ? (
                      <span className="flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700/60">
                        <FileText size={11} />
                        <span>{book.pages} pp</span>
                      </span>
                    ) : null}
                    {book.shelfLocation && (
                      <span className="flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700/60 truncate max-w-[130px]">
                        <MapPin size={11} />
                        <span className="truncate">{book.shelfLocation}</span>
                      </span>
                    )}
                  </div>

                  {book.description && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                      {book.description}
                    </p>
                  )}
                </div>

                {/* Footer Controls */}
                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <button
                      className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                      onClick={() => onOpenBookDetail(book)}
                      title="Inspect details"
                      id={`inspect-book-${book._id}`}
                    >
                      <Eye size={15} />
                    </button>
                    <button
                      className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                      onClick={() => onOpenEditBook(book)}
                      title="Edit Book"
                      id={`edit-book-${book._id}`}
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      onClick={() => onRequestDeleteBook(book)}
                      title="Delete Book"
                      id={`delete-book-${book._id}`}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  <button
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      isAvailable
                        ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                    }`}
                    onClick={() => isAvailable && onOpenIssueBookWithBook(book)}
                    disabled={!isAvailable}
                    id={`issue-book-${book._id}`}
                  >
                    <ArrowLeftRight size={13} />
                    <span>{isAvailable ? 'Check Out' : 'Waitlist'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm" id="books-table-container">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  <th className="px-5 py-3.5">Title & Author</th>
                  <th className="px-5 py-3.5">Category</th>
                  <th className="px-5 py-3.5">Year</th>
                  <th className="px-5 py-3.5">Pages</th>
                  <th className="px-5 py-3.5">Stock Status</th>
                  <th className="px-5 py-3.5">Shelf Location</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredBooks.map((book) => {
                  const isAvailable = book.availableCopies > 0;
                  return (
                    <tr key={book._id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors" id={`table-row-${book._id}`}>
                      <td className="px-5 py-4">
                        <div
                          className="font-semibold text-slate-900 dark:text-white hover:text-indigo-600 cursor-pointer"
                          onClick={() => onOpenBookDetail(book)}
                        >
                          {book.title}
                        </div>
                        <div className="text-xs text-slate-400">{book.author}</div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-xs px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 font-medium text-slate-600 dark:text-slate-300">
                          {book.genre}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-xs text-slate-500 dark:text-slate-400">{book.publishedYear || '—'}</td>
                      <td className="px-5 py-4 text-xs text-slate-500 dark:text-slate-400">{book.pages ? `${book.pages}p` : '—'}</td>
                      <td className="px-5 py-4">
                        <span
                          className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                            book.availableCopies === 0
                              ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400'
                              : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400'
                          }`}
                        >
                          {book.availableCopies} / {book.totalCopies} Available
                        </span>
                      </td>
                      <td className="px-5 py-4 text-xs text-slate-500 dark:text-slate-400">{book.shelfLocation || 'Main Stacks'}</td>
                      <td className="px-5 py-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                            onClick={() => onOpenBookDetail(book)}
                            title="Inspect details"
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                            onClick={() => onOpenEditBook(book)}
                            title="Edit"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 ${
                              isAvailable
                                ? 'bg-indigo-600 text-white hover:bg-indigo-500'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                            }`}
                            onClick={() => isAvailable && onOpenIssueBookWithBook(book)}
                            disabled={!isAvailable}
                          >
                            <ArrowLeftRight size={13} />
                            <span>Issue</span>
                          </button>
                          <button
                            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                            onClick={() => onRequestDeleteBook(book)}
                            title="Delete"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
