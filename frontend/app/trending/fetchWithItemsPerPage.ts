/**
 * Fetch API data with specified items per page, handling multiple pages if needed
 */
export async function fetchWithItemsPerPage(
  baseUrl: string,
  itemsPerPage: number,
  filters: Record<string, string> = {}
) {
  // Increase the number of items to fetch to ensure we have enough after filtering
  const adjustedItemsPerPage = itemsPerPage * 3; // Fetch 3x more items than needed
  const maxPages = Math.ceil(adjustedItemsPerPage / 20); // TMDB API returns 20 items per page
  
  let allItems: any[] = [];
  let currentPage = 1;
  
  // Apply filters to the query string
  const queryParams = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) queryParams.set(key, value);
  });
  
  const queryString = queryParams.toString() ? `&${queryParams.toString()}` : '';
  
  try {
    // Make parallel requests for all needed pages
    const pagePromises = Array.from({ length: maxPages }, (_, i) => {
      const page = i + 1;
      return fetch(`${baseUrl}?page=${page}${queryString}`).then(res => res.json());
    });
    
    const pagesResults = await Promise.all(pagePromises);
    
    // Combine all items from all pages
    allItems = pagesResults.flatMap(result => result.results || []);
    
    // Apply client-side filtering if any of the filters need special handling
    if (filters.language) {
      allItems = allItems.filter(item => 
        item.original_language === filters.language);
    }
    
    if (filters.genre) {
      allItems = allItems.filter(item => 
        item.genre_ids && item.genre_ids.includes(parseInt(filters.genre)));
    }
    
    if (filters.media_type) {
      allItems = allItems.filter(item => 
        item.media_type === filters.media_type);
    }
    
    // Ensure we don't have duplicates (by ID and media_type)
    const uniqueItemsMap = new Map();
    allItems.forEach(item => {
      const key = `${item.id}-${item.media_type}`;
      if (!uniqueItemsMap.has(key)) {
        uniqueItemsMap.set(key, item);
      }
    });
    
    allItems = Array.from(uniqueItemsMap.values());
    
    // Return only the number of items requested
    return {
      results: allItems.slice(0, itemsPerPage),
      total_results: allItems.length,
      page: 1,
      total_pages: Math.ceil(allItems.length / itemsPerPage)
    };
    
  } catch (error) {
    console.error("Error fetching data with pagination:", error);
    throw error;
  }
}
