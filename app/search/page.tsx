/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { useEffect, useState, useCallback } from 'react';
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

  const rootId = categoriesApi.getRootId(categories);

  useEffect(() => {
    categoriesApi.listAllCategories().then((cats) => {
      setCategories(cats);
      setIsLoading(false);
    });
  }, []);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [
    selectedCategoryId,
    activeSearch,
    priceRange[0],
    priceRange[1],
    sortConfig,
    dateRange[0],
    dateRange[1],
  ]);

  const fetchTasks = useCallback(() => {
    setTasksLoading(true);
    const sortFieldMap: Record<string, string> = {
      title: 'title',
      date: 'dueDate',
      price: 'price',
    };

    // Don't send root as a filter — it means "all categories"
    const effectiveCategoryId =
      selectedCategoryId && selectedCategoryId !== rootId
        ? selectedCategoryId
        : undefined;

    tasksApi
      .listTasks({
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        categoryId: effectiveCategoryId,
        search: activeSearch || undefined,
        minPrice: priceRange[0] > 0 ? priceRange[0] : undefined,
        maxPrice: priceRange[1] < 5000 ? priceRange[1] : undefined,
        fromDate: dateRange[0] || undefined,
        toDate: dateRange[1] || undefined,
        sortBy: sortFieldMap[sortConfig.field] || 'createdAt',
        sortDir: sortConfig.direction,
      })
      .then((res) => {
        setTasks(res.data?.tasks ?? []);
        setTotal(res.data?.total ?? 0);
        setTasksLoading(false);
      });
  }, [
    currentPage,
    selectedCategoryId,
    rootId,
    activeSearch,
    priceRange,
    dateRange,
    sortConfig,
  ]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  const handleClearFilters = () => {
    setSelectedCategoryId(null);
    setPriceRange([0, 5000]);
    setDateRange(['', '']);
    setSearchQuery('');
    setActiveSearch('');
    setSortConfig({ field: 'date', direction: 'desc' });
    setCurrentPage(1);
  };

  const handleNavigateToParent = () => {
    if (!selectedCategoryId) return;
    const current = categories.find((c) => c.id === selectedCategoryId);
    const parentId = current?.parent ?? null;
    // If parent is root, go back to "all categories" (null)
    setSelectedCategoryId(parentId === rootId ? null : parentId);
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
          <div className="mb-6">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              onSearch={() => {
                setActiveSearch(searchQuery);
                setCurrentPage(1);
              }}
              onClear={() => {
                setSearchQuery('');
                setActiveSearch('');
                setCurrentPage(1);
              }}
            />
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            <div className="w-full lg:w-72 flex-shrink-0">
              <div className="sticky top-6 space-y-6">
                <div className="bg-white rounded-lg border border-gray-200 p-5">
                  <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">
                    Browse Categories
                  </h3>
                  <CategoryNavigation
                    categories={categories}
                    selectedCategory={selectedCategoryId}
                    onNavigateToParent={handleNavigateToParent}
                    onSelectCategory={(id) => {
                      setSelectedCategoryId(id);
                      setCurrentPage(1);
                    }}
                  />
                </div>

                <FilterControls
                  priceRange={priceRange}
                  dateRange={dateRange}
                  onPriceChange={(range) => {
                    setPriceRange(range);
                    setCurrentPage(1);
                  }}
                  onDateChange={(range) => {
                    setDateRange(range);
                    setCurrentPage(1);
                  }}
                  onClearFilters={handleClearFilters}
                />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center mb-5">
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-bold">Tasks</h2>
                  <span className="text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                    {total} found
                  </span>
                  {selectedCategoryId && selectedCategoryId !== rootId && (
                    <span className="text-sm text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                      {categories.find((c) => c.id === selectedCategoryId)
                        ?.title || ''}
                    </span>
                  )}
                </div>
                <SortControls
                  sortConfig={sortConfig}
                  onSortChange={(s) => {
                    setSortConfig(s);
                    setCurrentPage(1);
                  }}
                />
              </div>

              {isTasksLoading ? <LoadingState /> : <TaskList tasks={tasks} />}

              {totalPages > 1 && !isTasksLoading && (
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
                      className={`px-3 py-2 border rounded-md transition ${
                        currentPage === n
                          ? 'bg-black text-white border-black'
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
