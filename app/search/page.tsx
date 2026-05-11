'use client';

import { useEffect, useState } from 'react';
import { tasksApi, Task } from '../lib/api/tasks';
import { categoriesApi, Category } from '../lib/api/categories';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SortControls from '../components/search/SortControls';
import SearchBar from '../components/search/SearchBar';
import FilterControls from '../components/search/FilterControls';
import LoadingState from '../components/search/LoadingState';
import CategoryNavigation from '../components/search/CategoryNavigation';
import TaskList from '../components/task/TaskList';
import ChatModal from '../components/ChatModal';
import { SortConfig } from '../types/search';

const ITEMS_PER_PAGE = 10;

export default function Search() {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null,
  );
  const [categories, setCategories] = useState<Category[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000]);
  const [dateRange, setDateRange] = useState<[string, string]>(['', '']);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: 'date',
    direction: 'desc',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isTasksLoading, setTasksLoading] = useState(false);

  useEffect(() => {
    categoriesApi.listAllCategories().then(setCategories);
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [
    selectedCategoryId,
    activeSearch,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    priceRange[0],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    priceRange[1],
    sortConfig,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    dateRange[0],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    dateRange[1],
  ]);

  useEffect(() => {
    setTasksLoading(true);
    const sortFieldMap: Record<string, string> = {
      title: 'title',
      date: 'dueDate',
      price: 'price',
    };
    tasksApi
      .listTasks({
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        categoryId: selectedCategoryId || undefined,
        search: activeSearch || undefined,
        minPrice: priceRange[0] > 0 ? priceRange[0] : undefined,
        maxPrice: priceRange[1] < 5000 ? priceRange[1] : undefined,
        fromDate: dateRange[0] || undefined,
        toDate: dateRange[1] || undefined,
        sortBy: sortFieldMap[sortConfig.field] || 'postedAt',
        sortDir: sortConfig.direction,
      })
      .then((res) => {
        setTasks(res.data?.tasks ?? []);
        setTotal(res.data?.total ?? 0);
        setIsLoading(false);
        setTasksLoading(false);
      });
  }, [
    currentPage,
    selectedCategoryId,
    activeSearch,
    priceRange,
    dateRange,
    sortConfig,
  ]);

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  const handleClearFilters = () => {
    setSelectedCategoryId(null);
    setPriceRange([0, 5000]);
    setDateRange(['', '']);
    setSearchQuery('');
    setActiveSearch('');
    setSortConfig({ field: 'date', direction: 'desc' });
  };

  const handleNavigateToParent = () => {
    if (!selectedCategoryId) return;
    const current = categories.find((c) => c.id === selectedCategoryId);
    setSelectedCategoryId(current?.parent ?? null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-grow container mx-auto px-6 py-12">
          <LoadingState />
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
              onSearch={() => setActiveSearch(searchQuery)}
              onClear={() => {
                setSearchQuery('');
                setActiveSearch('');
              }}
            />
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            <div className="w-full lg:w-80 flex-shrink-0">
              <div className="sticky top-6 space-y-8">
                <CategoryNavigation
                  categories={categories}
                  selectedCategory={selectedCategoryId}
                  onNavigateToParent={handleNavigateToParent}
                  onSelectCategory={setSelectedCategoryId}
                />
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
                  <span className="text-gray-500">{total} found</span>
                </div>
                <SortControls
                  sortConfig={sortConfig}
                  onSortChange={setSortConfig}
                />
              </div>

              {isTasksLoading ? <LoadingState /> : <TaskList tasks={tasks} />}

              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-8 flex-wrap">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border rounded-md disabled:opacity-50 hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  {Array.from(
                    { length: Math.min(totalPages, 7) },
                    (_, i) => i + 1,
                  ).map((n) => (
                    <button
                      key={n}
                      onClick={() => setCurrentPage(n)}
                      className={`px-3 py-2 border rounded-md ${
                        currentPage === n
                          ? 'bg-black text-white'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                  <button
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border rounded-md disabled:opacity-50 hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <ChatModal />
      <Footer />
    </div>
  );
}
