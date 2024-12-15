import { SearchData } from '../types/search';

export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const getSearchDataWithDelay = async (): Promise<SearchData> => {
  await delay(600);
  return getSearchData();
};

export const setSearchDataWithDelay = async (data: SearchData): Promise<void> => {
  await delay(600);
  setSearchData(data);
};

export const initializeSearchData = async () => {
  const existingData = getSearchData();
  if (existingData.categories.length === 0) {
    const mockData: SearchData = {
      categories: [
        // Level 1 - Root categories
        { id: 1, parentCategory: null, title: 'Development', description: 'Software development tasks' },
        { id: 2, parentCategory: null, title: 'Design', description: 'Design and creative tasks' },

        // Level 2 - Development subcategories
        { id: 3, parentCategory: 1, title: 'Web Development', description: 'Web development projects' },
        { id: 4, parentCategory: 1, title: 'Mobile Development', description: 'Mobile app development' },

        // Level 2 - Design subcategories
        { id: 5, parentCategory: 2, title: 'UI Design', description: 'User interface design' },
        { id: 6, parentCategory: 2, title: 'Graphics', description: 'Graphic design tasks' },

        // Level 3 - Web Development subcategories
        { id: 7, parentCategory: 3, title: 'Frontend', description: 'Frontend development' },
        { id: 8, parentCategory: 3, title: 'Backend', description: 'Backend development' },

        // Level 3 - Mobile Development subcategories
        { id: 9, parentCategory: 4, title: 'iOS', description: 'iOS development' },
        { id: 10, parentCategory: 4, title: 'Android', description: 'Android development' },

        // Level 3 - UI Design subcategories
        { id: 11, parentCategory: 5, title: 'Web UI', description: 'Web interface design' },
        { id: 12, parentCategory: 5, title: 'Mobile UI', description: 'Mobile interface design' },

        // Level 3 - Graphics subcategories
        { id: 13, parentCategory: 6, title: 'Brand Design', description: 'Brand identity design' },
        { id: 14, parentCategory: 6, title: 'Illustration', description: 'Digital illustration' },
      ],
      tasks: [
        // Development (Level 1) Tasks
        { id: 101, category: 1, title: 'System Architecture Design', content: 'Design enterprise system architecture', date: '2024-03-28', price: 5000 },
        { id: 102, category: 1, title: 'Technical Leadership', content: 'Provide technical leadership for development team', date: '2024-03-27', price: 4500 },
        { id: 103, category: 1, title: 'Code Review System', content: 'Implement code review and quality processes', date: '2024-03-26', price: 3500 },

        // Design (Level 1) Tasks
        { id: 104, category: 2, title: 'Design System Creation', content: 'Create comprehensive design system', date: '2024-03-25', price: 4000 },
        { id: 105, category: 2, title: 'Creative Direction', content: 'Provide creative direction for projects', date: '2024-03-24', price: 4200 },

        // Web Development (Level 2) Tasks
        { id: 106, category: 3, title: 'Web Platform Architecture', content: 'Design web platform architecture', date: '2024-03-23', price: 3800 },
        { id: 107, category: 3, title: 'Performance Optimization', content: 'Optimize web platform performance', date: '2024-03-22', price: 3200 },
        { id: 108, category: 3, title: 'Security Implementation', content: 'Implement security measures', date: '2024-03-21', price: 3500 },

        // Mobile Development (Level 2) Tasks
        { id: 109, category: 4, title: 'Mobile Architecture', content: 'Design mobile app architecture', date: '2024-03-20', price: 3600 },
        { id: 110, category: 4, title: 'Cross-platform Strategy', content: 'Develop cross-platform strategy', date: '2024-03-19', price: 3300 },

        // UI Design (Level 2) Tasks
        { id: 111, category: 5, title: 'Design Language', content: 'Create unified design language', date: '2024-03-18', price: 3400 },
        { id: 112, category: 5, title: 'Component Library', content: 'Design reusable component library', date: '2024-03-17', price: 3100 },

        // Graphics (Level 2) Tasks
        { id: 113, category: 6, title: 'Visual Identity', content: 'Develop visual identity guidelines', date: '2024-03-16', price: 3200 },
        { id: 114, category: 6, title: 'Asset Creation', content: 'Create graphic asset library', date: '2024-03-15', price: 2800 },

        // Frontend (Level 3) Tasks
        { id: 115, category: 7, title: 'React Application', content: 'Build React-based web application', date: '2024-03-14', price: 2500 },
        { id: 116, category: 7, title: 'Vue.js Dashboard', content: 'Create admin dashboard with Vue.js', date: '2024-03-13', price: 2300 },
        { id: 117, category: 7, title: 'Angular Portal', content: 'Develop customer portal with Angular', date: '2024-03-12', price: 2400 },

        // Backend (Level 3) Tasks
        { id: 118, category: 8, title: 'Node.js API', content: 'Build REST API with Node.js', date: '2024-03-11', price: 2600 },
        { id: 119, category: 8, title: 'Database Design', content: 'Design and implement database architecture', date: '2024-03-10', price: 2400 },
        { id: 120, category: 8, title: 'Microservices', content: 'Implement microservices architecture', date: '2024-03-09', price: 2800 },

        // iOS (Level 3) Tasks
        { id: 121, category: 9, title: 'Swift App', content: 'Develop iOS app using Swift', date: '2024-03-08', price: 2700 },
        { id: 122, category: 9, title: 'SwiftUI Interface', content: 'Create app interface with SwiftUI', date: '2024-03-07', price: 2200 },

        // Android (Level 3) Tasks
        { id: 123, category: 10, title: 'Kotlin App', content: 'Build Android app using Kotlin', date: '2024-03-06', price: 2600 },
        { id: 124, category: 10, title: 'Material Design', content: 'Implement Material Design components', date: '2024-03-05', price: 2100 },

        // Web UI (Level 3) Tasks
        { id: 125, category: 11, title: 'Website Design', content: 'Design responsive website interface', date: '2024-03-04', price: 2400 },
        { id: 126, category: 11, title: 'Design System', content: 'Create web design system', date: '2024-03-03', price: 2800 },

        // Mobile UI (Level 3) Tasks
        { id: 127, category: 12, title: 'App Interface', content: 'Design mobile app interface', date: '2024-03-02', price: 2300 },
        { id: 128, category: 12, title: 'Interaction Design', content: 'Design app interactions and animations', date: '2024-03-01', price: 2500 },

        // Brand Design (Level 3) Tasks
        { id: 129, category: 13, title: 'Brand Identity', content: 'Create brand identity package', date: '2024-02-29', price: 2600 },
        { id: 130, category: 13, title: 'Logo Design', content: 'Design company logo and variations', date: '2024-02-28', price: 2200 },

        // Illustration (Level 3) Tasks
        { id: 131, category: 14, title: 'Digital Illustrations', content: 'Create digital illustration set', date: '2024-02-27', price: 2400 },
        { id: 132, category: 14, title: 'Icon Design', content: 'Design custom icon set', date: '2024-02-26', price: 1900 },

        // Additional Tasks
        { id: 133, category: 1, title: 'API Integration', content: 'Integrate third-party APIs', date: '2024-02-25', price: 3000 },
        { id: 134, category: 2, title: 'Brand Strategy', content: 'Develop comprehensive brand strategy', date: '2024-02-24', price: 3500 },
        { id: 135, category: 3, title: 'SEO Optimization', content: 'Optimize website for search engines', date: '2024-02-23', price: 2800 },
        { id: 136, category: 4, title: 'App Store Optimization', content: 'Optimize app for app stores', date: '2024-02-22', price: 2700 },
        { id: 137, category: 5, title: 'User Research', content: 'Conduct user research and testing', date: '2024-02-21', price: 3200 },
        { id: 138, category: 6, title: 'Graphic Design', content: 'Create marketing materials', date: '2024-02-20', price: 2900 },
        { id: 139, category: 7, title: 'Frontend Testing', content: 'Implement frontend testing framework', date: '2024-02-19', price: 2600 },
        { id: 140, category: 8, title: 'Backend Optimization', content: 'Optimize backend performance', date: '2024-02-18', price: 2500 },
        { id: 141, category: 9, title: 'iOS Testing', content: 'Implement testing for iOS app', date: '2024-02-17', price: 2400 },
        { id: 142, category: 10, title: 'Android Testing', content: 'Implement testing for Android app', date: '2024-02-16', price: 2300 },
        { id: 143, category: 11, title: 'UI Prototyping', content: 'Create interactive UI prototypes', date: '2024-02-15', price: 2200 },
        { id: 144, category: 12, title: 'UX Design', content: 'Design user experience for mobile app', date: '2024-02-14', price: 2100 },
        { id: 145, category: 13, title: 'Brand Guidelines', content: 'Develop brand guidelines document', date: '2024-02-13', price: 2000 },
        { id: 146, category: 14, title: 'Illustration Guidelines', content: 'Create guidelines for illustrations', date: '2024-02-12', price: 1900 },
      ],
    };
    
    await delay(800);
    localStorage.setItem('searchData', JSON.stringify(mockData));
    return mockData;
  }
  return existingData;
};

export const getSearchData = (): SearchData => {
  const data = localStorage.getItem('searchData');
  if (data) {
    return JSON.parse(data);
  }
  return { categories: [], tasks: [] };
};

export const setSearchData = (data: SearchData) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('searchData', JSON.stringify(data));
};
