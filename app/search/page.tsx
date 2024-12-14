'use client';

import { useEffect, useState } from 'react';
import { Category, Task, SortConfig } from '../types/search';
import { getSearchData, initializeSearchData } from '../utils/storage';
import { searchTasks, sortTasks } from '../utils/search';
import Header from '../components/Header';
import Footer from '../components/Footer';
import CategoryItem from '../components/search/CategoryItem';
import TaskItem from '../components/search/TaskItem';
import SortControls from '../components/search/SortControls';
import SearchBar from '../components/search/SearchBar';
import FilterControls from '../components/search/FilterControls';
import LoadingState from '../components/search/LoadingState';

const ITEMS_PER_PAGE = 5;

const getPageNumbers = (currentPage: number, totalPages: number) => {
  const delta = 2; 
  const pages: (number | string)[] = [];

  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages || 
      (i >= currentPage - delta && i <= currentPage + delta)
    ) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== '...') {
      pages.push('...');
    }
  }

  return pages;
};

export default function Search() {
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSearchQuery, setActiveSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000]);
  const [dateRange, setDateRange] = useState<[string, string]>(['', '']);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: 'date',
    direction: 'desc',
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeSearchData();
    const data = getSearchData();
    setCategories(data.categories);
    setTasks(data.tasks);

    const prices = data.tasks.map((task) => task.price);
    const minPrice = prices.length ? Math.min(...prices) : 0;
    const maxPrice = prices.length ? Math.max(...prices) : 5000;
    setPriceRange([minPrice, maxPrice]);

    const dates = data.tasks.map((task) => task.date);
    const earliestDate = dates.length
      ? dates.reduce((a, b) => (a < b ? a : b))
      : '2024-03-20';
    const latestDate = dates.length
      ? dates.reduce((a, b) => (a > b ? a : b))
      : '2024-04-06';
    setDateRange([earliestDate, latestDate]);

    setIsLoading(false);
  }, []);

  const priceRangeStart = priceRange[0];
  const priceRangeEnd = priceRange[1];
  const dateRangeStart = dateRange[0];
  const dateRangeEnd = dateRange[1];

  useEffect(() => {
    setCurrentPage(1);
  }, [
    selectedCategory,
    activeSearchQuery,
    priceRangeStart,
    priceRangeEnd,
    sortConfig,
    dateRangeStart,
    dateRangeEnd,
  ]);

  const handleSearch = () => {
    setActiveSearchQuery(searchQuery);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setActiveSearchQuery('');
  };

  const filteredByCategory = tasks.filter(
    (task) =>
      (!selectedCategory || task.category === selectedCategory) &&
      task.price >= priceRange[0] &&
      task.price <= priceRange[1] &&
      task.date >= dateRange[0] &&
      task.date <= dateRange[1],
  );

  const searchResults = activeSearchQuery.trim()
    ? searchTasks(activeSearchQuery, filteredByCategory)
    : filteredByCategory;

  const sortedResults = sortTasks(searchResults, sortConfig);

  const totalPages = Math.ceil(sortedResults.length / ITEMS_PER_PAGE);
  const paginatedResults = sortedResults.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const handleClearFilters = () => {
    setSelectedCategory(null);

    const prices = tasks.map((task) => task.price);
    const minPrice = prices.length ? Math.min(...prices) : 0;
    const maxPrice = prices.length ? Math.max(...prices) : 5000;
    setPriceRange([minPrice, maxPrice]);

    const dates = tasks.map((task) => task.date);
    const earliestDate = dates.length
      ? dates.reduce((a, b) => (a < b ? a : b))
      : '2024-03-20';
    const latestDate = dates.length
      ? dates.reduce((a, b) => (a > b ? a : b))
      : '2024-04-06';
    setDateRange([earliestDate, latestDate]);

    setSearchQuery('');
    setActiveSearchQuery('');
    setSortConfig({ field: 'date', direction: 'desc' });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-grow container mx-auto px-6 py-12">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8 h-14 bg-gray-200 rounded-lg animate-pulse" />
            <div className="flex flex-col lg:flex-row gap-8">
              <div className="w-full lg:w-80 flex-shrink-0">
                <div className="space-y-8 animate-pulse">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-32 bg-gray-200 rounded-lg" />
                  ))}
                </div>
              </div>
              <div className="flex-1">
                <LoadingState />
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-grow container mx-auto px-6 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              onSearch={handleSearch}
              onClear={handleClearSearch}
            />
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            <div className="w-full lg:w-80 flex-shrink-0">
              <div className="sticky top-6 space-y-8">
                <div className="space-y-4">
                  <h2 className="text-xl font-bold">Categories</h2>
                  <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">
                    {categories.map((category) => (
                      <CategoryItem
                        key={category.id}
                        category={category}
                        isSelected={selectedCategory === category.id}
                        onClick={() =>
                          setSelectedCategory(
                            selectedCategory === category.id
                              ? null
                              : category.id,
                          )
                        }
                      />
                    ))}
                  </div>
                </div>

                <FilterControls
                  priceRange={priceRange}
                  dateRange={dateRange}
                  onPriceChange={setPriceRange}
                  onDateChange={setDateRange}
                  onClearFilters={handleClearFilters}
                />
              </div>
            </div>

            <div className="flex-1">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                  <h2 className="text-xl font-bold">Tasks</h2>
                  <span className="text-gray-500">
                    {sortedResults.length} tasks found
                  </span>
                </div>
                <SortControls
                  sortConfig={sortConfig}
                  onSortChange={setSortConfig}
                />
              </div>

              <div className="grid grid-cols-1 gap-6">
                {paginatedResults.length > 0 ? (
                  paginatedResults.map((task) => (
                    <TaskItem key={task.id} task={task} />
                  ))
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    No tasks found matching your criteria
                  </div>
                )}
              </div>

              {totalPages > 1 && (
                <div className="flex flex-wrap justify-center gap-2 mt-8">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 border rounded-md disabled:opacity-50 hover:bg-gray-50 text-sm md:text-base md:px-4 md:py-2"
                  >
                    Previous
                  </button>
                  <div className="flex gap-1 md:gap-2 overflow-x-auto">
                    {getPageNumbers(currentPage, totalPages).map(
                      (page, index) =>
                        page === '...' ? (
                          <span
                            key={`ellipsis-${index}`}
                            className="px-3 py-1.5 md:px-4 md:py-2"
                          >
                            {page}
                          </span>
                        ) : (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(Number(page))}
                            className={`px-3 py-1.5 border rounded-md text-sm md:text-base md:px-4 md:py-2 min-w-[2.5rem] md:min-w-[3rem]
                            ${
                              currentPage === page
                                ? 'bg-black text-white'
                                : 'hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </button>
                        ),
                    )}
                  </div>
                  <button
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 border rounded-md disabled:opacity-50 hover:bg-gray-50 text-sm md:text-base md:px-4 md:py-2"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
