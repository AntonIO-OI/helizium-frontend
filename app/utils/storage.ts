import { saveTestUsers } from '../data/mockUsers';
import { Category, Comment, SearchData, Task } from '../types/search';
import { TaskStatus } from '../types/search';

export const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const getSearchDataWithDelay = async (): Promise<SearchData> => {
  await delay(600);
  return getSearchData();
};

export const setSearchDataWithDelay = async (
  data: SearchData,
): Promise<void> => {
  await delay(600);
  setSearchData(data);
};

export const isDataInitialized = () => {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('dataInitialized') === 'true';
};

export const initializeSearchData = async () => {
  if (isDataInitialized()) return;

  saveTestUsers();

  const initialData = {
    categories: [
      // Level 1 - Root categories
      {
        id: 1,
        parentCategory: null,
        title: 'Development',
        description: 'Software development tasks',
        authorId: 1
      },
      {
        id: 2,
        parentCategory: null,
        title: 'Design',
        description: 'Design and creative tasks',
        authorId: 2
      },

      // Level 2 - Development subcategories
      {
        id: 3,
        parentCategory: 1,
        title: 'Web Development',
        description: 'Web development projects',
        authorId: 1
      },
      {
        id: 4,
        parentCategory: 1,
        title: 'Mobile Development',
        description: 'Mobile app development',
        authorId: 2
      },

      // Level 2 - Design subcategories
      {
        id: 5,
        parentCategory: 2,
        title: 'UI Design',
        description: 'User interface design',
        authorId: 2
      },
      {
        id: 6,
        parentCategory: 2,
        title: 'Graphics',
        description: 'Graphic design tasks',
        authorId: 1
      },

      // Level 3 - Web Development subcategories
      {
        id: 7,
        parentCategory: 3,
        title: 'Frontend',
        description: 'Frontend development',
        authorId: 1
      },
      {
        id: 8,
        parentCategory: 3,
        title: 'Backend',
        description: 'Backend development',
        authorId: 2
      },

      // Level 3 - Mobile Development subcategories
      {
        id: 9,
        parentCategory: 4,
        title: 'iOS',
        description: 'iOS development',
        authorId: 1
      },
      {
        id: 10,
        parentCategory: 4,
        title: 'Android',
        description: 'Android development',
        authorId: 2
      },

      // Level 3 - UI Design subcategories
      {
        id: 11,
        parentCategory: 5,
        title: 'Web UI',
        description: 'Web interface design',
        authorId: 2
      },
      {
        id: 12,
        parentCategory: 5,
        title: 'Mobile UI',
        description: 'Mobile interface design',
        authorId: 1
      },

      // Level 3 - Graphics subcategories
      {
        id: 13,
        parentCategory: 6,
        title: 'Brand Design',
        description: 'Brand identity design',
        authorId: 2
      },
      {
        id: 14,
        parentCategory: 6,
        title: 'Illustration',
        description: 'Digital illustration',
        authorId: 1
      },
    ],
    tasks: [
      // Development (Level 1) Tasks
      {
        id: 101,
        category: 1,
        authorId: 1,
        title: 'System Architecture Design',
        content: 'Design enterprise system architecture',
        date: '2024-03-28',
        posted: '2024-03-25',
        price: 5000,
        applicants: [],
        rejectedApplicants: [],
        performerId: null,
        workResult: null,
        completed: false,
        status: TaskStatus.SEARCHING,
      },
      {
        id: 102,
        category: 1,
        authorId: 2,
        title: 'Technical Leadership',
        content: 'Provide technical leadership for development team',
        date: '2024-03-27',
        posted: '2024-03-24',
        price: 4500,
        applicants: [],
        rejectedApplicants: [],
        performerId: null,
        workResult: null,
        completed: false,
        status: TaskStatus.SEARCHING,
      },
      {
        id: 103,
        category: 1,
        authorId: 3,
        title: 'Code Review System',
        content: 'Implement code review and quality processes',
        date: '2024-03-26',
        posted: '2024-03-23',
        price: 3500,
        applicants: [],
        rejectedApplicants: [],
        performerId: null,
        workResult: null,
        completed: false,
        status: TaskStatus.SEARCHING,
      },

      // Design (Level 1) Tasks
      {
        id: 104,
        category: 2,
        authorId: 2,
        title: 'Design System Creation',
        content: 'Create comprehensive design system',
        date: '2024-03-25',
        posted: '2024-03-22',
        price: 4000,
        applicants: [],
        rejectedApplicants: [],
        performerId: null,
        workResult: null,
        completed: false,
        status: TaskStatus.SEARCHING,
      },
      {
        id: 105,
        category: 2,
        authorId: 1,
        title: 'Creative Direction',
        content: 'Provide creative direction for projects',
        date: '2024-03-24',
        posted: '2024-03-21',
        price: 4200,
        applicants: [],
        rejectedApplicants: [],
        performerId: null,
        workResult: null,
        completed: false,
        status: TaskStatus.SEARCHING,
      },

      // Web Development (Level 2) Tasks
      {
        id: 106,
        category: 3,
        authorId: 3,
        title: 'Web Platform Architecture',
        content: 'Design web platform architecture',
        date: '2024-03-23',
        posted: '2024-03-20',
        price: 3800,
        applicants: [],
        rejectedApplicants: [],
        performerId: null,
        workResult: null,
        completed: false,
        status: TaskStatus.SEARCHING,
      },
      {
        id: 107,
        category: 3,
        authorId: 1,
        title: 'Performance Optimization',
        content: 'Optimize web platform performance',
        date: '2024-03-22',
        posted: '2024-03-19',
        price: 3200,
        applicants: [],
        rejectedApplicants: [],
        performerId: null,
        workResult: null,
        completed: false,
        status: TaskStatus.SEARCHING,
      },
      {
        id: 108,
        category: 3,
        authorId: 2,
        title: 'Security Implementation',
        content: 'Implement security measures',
        date: '2024-03-21',
        posted: '2024-03-18',
        price: 3500,
        applicants: [],
        rejectedApplicants: [],
        performerId: null,
        workResult: null,
        completed: false,
        status: TaskStatus.SEARCHING,
      },

      // Mobile Development (Level 2) Tasks
      {
        id: 109,
        category: 4,
        authorId: 3,
        title: 'Mobile Architecture',
        content: 'Design mobile app architecture',
        date: '2024-03-20',
        posted: '2024-03-17',
        price: 3600,
        applicants: [],
        rejectedApplicants: [],
        performerId: null,
        workResult: null,
        completed: false,
        status: TaskStatus.SEARCHING,
      },
      {
        id: 110,
        category: 4,
        authorId: 1,
        title: 'Cross-platform Strategy',
        content: 'Develop cross-platform strategy',
        date: '2024-03-19',
        posted: '2024-03-16',
        price: 3300,
        applicants: [],
        rejectedApplicants: [],
        performerId: null,
        workResult: null,
        completed: false,
        status: TaskStatus.SEARCHING,
      },

      // UI Design (Level 2) Tasks
      {
        id: 111,
        category: 5,
        authorId: 2,
        title: 'Design Language',
        content: 'Create unified design language',
        date: '2024-03-18',
        posted: '2024-03-15',
        price: 3400,
        applicants: [],
        rejectedApplicants: [],
        performerId: null,
        workResult: null,
        completed: false,
        status: TaskStatus.SEARCHING,
      },
      {
        id: 112,
        category: 5,
        authorId: 3,
        title: 'Component Library',
        content: 'Design reusable component library',
        date: '2024-03-17',
        posted: '2024-03-14',
        price: 3100,
        applicants: [],
        rejectedApplicants: [],
        performerId: null,
        workResult: null,
        completed: false,
        status: TaskStatus.SEARCHING,
      },

      // Graphics (Level 2) Tasks
      {
        id: 113,
        category: 6,
        authorId: 1,
        title: 'Visual Identity',
        content: 'Develop visual identity guidelines',
        date: '2024-03-16',
        posted: '2024-03-13',
        price: 3200,
        applicants: [],
        rejectedApplicants: [],
        performerId: null,
        workResult: null,
        completed: false,
        status: TaskStatus.SEARCHING,
      },
      {
        id: 114,
        category: 6,
        authorId: 2,
        title: 'Asset Creation',
        content: 'Create graphic asset library',
        date: '2024-03-15',
        posted: '2024-03-12',
        price: 2800,
        applicants: [],
        rejectedApplicants: [],
        performerId: null,
        workResult: null,
        completed: false,
        status: TaskStatus.SEARCHING,
      },

      // Frontend (Level 3) Tasks
      {
        id: 115,
        category: 7,
        authorId: 3,
        title: 'React Application',
        content: 'Build React-based web application',
        date: '2024-03-14',
        posted: '2024-03-11',
        price: 2500,
        applicants: [],
        rejectedApplicants: [],
        performerId: null,
        workResult: null,
        completed: false,
        status: TaskStatus.SEARCHING,
      },
      {
        id: 116,
        category: 7,
        authorId: 1,
        title: 'Vue.js Dashboard',
        content: 'Create admin dashboard with Vue.js',
        date: '2024-03-13',
        posted: '2024-03-10',
        price: 2300,
        applicants: [],
        rejectedApplicants: [],
        performerId: null,
        workResult: null,
        completed: false,
        status: TaskStatus.SEARCHING,
      },
      {
        id: 117,
        category: 7,
        authorId: 2,
        title: 'Angular Portal',
        content: 'Develop customer portal with Angular',
        date: '2024-03-12',
        posted: '2024-03-09',
        price: 2400,
        applicants: [],
        rejectedApplicants: [],
        performerId: null,
        workResult: null,
        completed: false,
        status: TaskStatus.SEARCHING,
      },

      // Backend (Level 3) Tasks
      {
        id: 118,
        category: 8,
        authorId: 3,
        title: 'Node.js API',
        content: 'Build REST API with Node.js',
        date: '2024-03-11',
        posted: '2024-03-08',
        price: 2600,
        applicants: [],
        rejectedApplicants: [],
        performerId: null,
        workResult: null,
        completed: false,
        status: TaskStatus.SEARCHING,
      },
      {
        id: 119,
        category: 8,
        authorId: 1,
        title: 'Database Design',
        content: 'Design and implement database architecture',
        date: '2024-03-10',
        posted: '2024-03-07',
        price: 2400,
        applicants: [],
        rejectedApplicants: [],
        performerId: null,
        workResult: null,
        completed: false,
        status: TaskStatus.SEARCHING,
      },
      {
        id: 120,
        category: 8,
        authorId: 2,
        title: 'Microservices',
        content: 'Implement microservices architecture',
        date: '2024-03-09',
        posted: '2024-03-06',
        price: 2800,
        applicants: [],
        rejectedApplicants: [],
        performerId: null,
        workResult: null,
        completed: false,
        status: TaskStatus.SEARCHING,
      },

      // iOS (Level 3) Tasks
      {
        id: 121,
        category: 9,
        authorId: 3,
        title: 'Swift App',
        content: 'Develop iOS app using Swift',
        date: '2024-03-08',
        posted: '2024-03-05',
        price: 2700,
        applicants: [],
        rejectedApplicants: [],
        performerId: null,
        workResult: null,
        completed: false,
        status: TaskStatus.SEARCHING,
      },
      {
        id: 122,
        category: 9,
        authorId: 1,
        title: 'SwiftUI Interface',
        content: 'Create app interface with SwiftUI',
        date: '2024-03-07',
        posted: '2024-03-04',
        price: 2200,
        applicants: [],
        rejectedApplicants: [],
        performerId: null,
        workResult: null,
        completed: false,
        status: TaskStatus.SEARCHING,
      },

      // Android (Level 3) Tasks
      {
        id: 123,
        category: 10,
        authorId: 2,
        title: 'Kotlin App',
        content: 'Build Android app using Kotlin',
        date: '2024-03-06',
        posted: '2024-03-03',
        price: 2600,
        applicants: [],
        rejectedApplicants: [],
        performerId: null,
        workResult: null,
        completed: false,
        status: TaskStatus.SEARCHING,
      },
      {
        id: 124,
        category: 10,
        authorId: 3,
        title: 'Material Design',
        content: 'Implement Material Design components',
        date: '2024-03-05',
        posted: '2024-03-02',
        price: 2100,
        applicants: [],
        rejectedApplicants: [],
        performerId: null,
        workResult: null,
        completed: false,
        status: TaskStatus.SEARCHING,
      },

      // Web UI (Level 3) Tasks
      {
        id: 125,
        category: 11,
        authorId: 1,
        title: 'Website Design',
        content: 'Design responsive website interface',
        date: '2024-03-04',
        posted: '2024-03-01',
        price: 2400,
        applicants: [],
        rejectedApplicants: [],
        performerId: null,
        workResult: null,
        completed: false,
        status: TaskStatus.SEARCHING,
      },
      {
        id: 126,
        category: 11,
        authorId: 2,
        title: 'Design System',
        content: 'Create web design system',
        date: '2024-03-03',
        posted: '2024-02-29',
        price: 2800,
        applicants: [],
        rejectedApplicants: [],
        performerId: null,
        workResult: null,
        completed: false,
        status: TaskStatus.SEARCHING,
      },

      // Mobile UI (Level 3) Tasks
      {
        id: 127,
        category: 12,
        authorId: 3,
        title: 'App Interface',
        content: 'Design mobile app interface',
        date: '2024-03-02',
        posted: '2024-02-28',
        price: 2300,
        applicants: [],
        rejectedApplicants: [],
        performerId: null,
        workResult: null,
        completed: false,
        status: TaskStatus.SEARCHING,
      },
      {
        id: 128,
        category: 12,
        authorId: 1,
        title: 'Interaction Design',
        content: 'Design app interactions and animations',
        date: '2024-03-01',
        posted: '2024-02-27',
        price: 2500,
        applicants: [],
        rejectedApplicants: [],
        performerId: null,
        workResult: null,
        completed: false,
        status: TaskStatus.SEARCHING,
      },

      // Brand Design (Level 3) Tasks
      {
        id: 129,
        category: 13,
        authorId: 2,
        title: 'Brand Identity',
        content: 'Create brand identity package',
        date: '2024-02-29',
        posted: '2024-02-26',
        price: 2600,
        applicants: [],
        rejectedApplicants: [],
        performerId: null,
        workResult: null,
        completed: false,
        status: TaskStatus.SEARCHING,
      },
      {
        id: 130,
        category: 13,
        authorId: 3,
        title: 'Logo Design',
        content: 'Design company logo and variations',
        date: '2024-02-28',
        posted: '2024-02-25',
        price: 2200,
        applicants: [],
        rejectedApplicants: [],
        performerId: null,
        workResult: null,
        completed: false,
        status: TaskStatus.SEARCHING,
      },

      // Illustration (Level 3) Tasks
      {
        id: 131,
        category: 14,
        authorId: 1,
        title: 'Digital Illustrations',
        content: 'Create digital illustration set',
        date: '2024-02-27',
        posted: '2024-02-24',
        price: 2400,
        applicants: [],
        rejectedApplicants: [],
        performerId: null,
        workResult: null,
        completed: false,
        status: TaskStatus.SEARCHING,
      },
      {
        id: 132,
        category: 14,
        authorId: 2,
        title: 'Icon Design',
        content: 'Design custom icon set',
        date: '2024-02-26',
        posted: '2024-02-23',
        price: 1900,
        applicants: [],
        rejectedApplicants: [],
        performerId: null,
        workResult: null,
        completed: false,
        status: TaskStatus.SEARCHING,
      },

      // Additional Tasks
      {
        id: 133,
        category: 1,
        authorId: 3,
        title: 'API Integration',
        content: 'Integrate third-party APIs',
        date: '2024-02-25',
        posted: '2024-02-22',
        price: 3000,
        applicants: [],
        rejectedApplicants: [],
        performerId: null,
        workResult: null,
        completed: false,
        status: TaskStatus.SEARCHING,
      },
      {
        id: 134,
        category: 2,
        authorId: 1,
        title: 'Brand Strategy',
        content: 'Develop comprehensive brand strategy',
        date: '2024-02-24',
        posted: '2024-02-21',
        price: 3500,
        applicants: [],
        rejectedApplicants: [],
        performerId: null,
        workResult: null,
        completed: false,
        status: TaskStatus.SEARCHING,
      },
      {
        id: 135,
        category: 3,
        authorId: 2,
        title: 'SEO Optimization',
        content: 'Optimize website for search engines',
        date: '2024-02-23',
        posted: '2024-02-20',
        price: 2800,
        applicants: [],
        rejectedApplicants: [],
        performerId: null,
        workResult: null,
        completed: false,
        status: TaskStatus.SEARCHING,
      },
      {
        id: 136,
        category: 4,
        authorId: 3,
        title: 'App Store Optimization',
        content: 'Optimize app for app stores',
        date: '2024-02-22',
        posted: '2024-02-19',
        price: 2700,
        applicants: [],
        rejectedApplicants: [],
        performerId: null,
        workResult: null,
        completed: false,
        status: TaskStatus.SEARCHING,
      },
      {
        id: 137,
        category: 5,
        authorId: 1,
        title: 'User Research',
        content: 'Conduct user research and testing',
        date: '2024-02-21',
        posted: '2024-02-18',
        price: 3200,
        applicants: [],
        rejectedApplicants: [],
        performerId: null,
        workResult: null,
        completed: false,
        status: TaskStatus.SEARCHING,
      },
      {
        id: 138,
        category: 6,
        authorId: 2,
        title: 'Graphic Design',
        content: 'Create marketing materials',
        date: '2024-02-20',
        posted: '2024-02-17',
        price: 2900,
        applicants: [],
        rejectedApplicants: [],
        performerId: null,
        workResult: null,
        completed: false,
        status: TaskStatus.SEARCHING,
      },
      {
        id: 139,
        category: 7,
        authorId: 3,
        title: 'Frontend Testing',
        content: 'Implement frontend testing framework',
        date: '2024-02-19',
        posted: '2024-02-16',
        price: 2600,
        applicants: [],
        rejectedApplicants: [],
        performerId: null,
        workResult: null,
        completed: false,
        status: TaskStatus.SEARCHING,
      },
      {
        id: 140,
        category: 8,
        authorId: 1,
        title: 'Backend Optimization',
        content: 'Optimize backend performance',
        date: '2024-02-18',
        posted: '2024-02-15',
        price: 2500,
        applicants: [],
        rejectedApplicants: [],
        performerId: null,
        workResult: null,
        completed: false,
        status: TaskStatus.SEARCHING,
      },
      {
        id: 141,
        category: 9,
        authorId: 2,
        title: 'iOS Testing',
        content: 'Implement testing for iOS app',
        date: '2024-02-17',
        posted: '2024-02-14',
        price: 2400,
        applicants: [],
        rejectedApplicants: [],
        performerId: null,
        workResult: null,
        completed: false,
        status: TaskStatus.SEARCHING,
      },
      {
        id: 142,
        category: 10,
        authorId: 3,
        title: 'Android Testing',
        content: 'Implement testing for Android app',
        date: '2024-02-16',
        posted: '2024-02-13',
        price: 2300,
        applicants: [],
        rejectedApplicants: [],
        performerId: null,
        workResult: null,
        completed: false,
        status: TaskStatus.SEARCHING,
      },
      {
        id: 143,
        category: 11,
        authorId: 1,
        title: 'UI Prototyping',
        content: 'Create interactive UI prototypes',
        date: '2024-02-15',
        posted: '2024-02-12',
        price: 2200,
        applicants: [],
        rejectedApplicants: [],
        performerId: null,
        workResult: null,
        completed: false,
        status: TaskStatus.SEARCHING,
      },
      {
        id: 144,
        category: 12,
        authorId: 2,
        title: 'UX Design',
        content: 'Design user experience for mobile app',
        date: '2024-02-14',
        posted: '2024-02-11',
        price: 2100,
        applicants: [],
        rejectedApplicants: [],
        performerId: null,
        workResult: null,
        completed: false,
        status: TaskStatus.SEARCHING,
      },
      {
        id: 145,
        category: 13,
        authorId: 3,
        title: 'Brand Guidelines',
        content: 'Develop brand guidelines document',
        date: '2024-02-13',
        posted: '2024-02-10',
        price: 2000,
        applicants: [],
        rejectedApplicants: [],
        performerId: null,
        workResult: null,
        completed: false,
        status: TaskStatus.SEARCHING,
      },
      {
        id: 146,
        category: 14,
        authorId: 1,
        title: 'Illustration Guidelines',
        content: 'Create guidelines for illustrations',
        date: '2024-02-12',
        posted: '2024-02-09',
        price: 1900,
        applicants: [],
        rejectedApplicants: [],
        performerId: null,
        workResult: null,
        completed: false,
        status: TaskStatus.SEARCHING,
      },
    ],
    comments: [],
  };

  localStorage.setItem('searchData', JSON.stringify(initialData));
  localStorage.setItem('dataInitialized', 'true');
};

export const setSearchData = (data: SearchData) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('searchData', JSON.stringify(data));
};

export function getSearchData(): SearchData {
  if (typeof window === 'undefined') {
    return { categories: [], tasks: [], comments: [] };
  }

  const data = localStorage.getItem('searchData');
  if (!data) {
    initializeSearchData();
    return getSearchData();
  }
  return JSON.parse(data);
}

export function updateStorageData(updateFn: (data: SearchData) => SearchData) {
  if (typeof window === 'undefined') return;

  const currentData = getSearchData();
  const updatedData = updateFn(currentData);
  localStorage.setItem('searchData', JSON.stringify(updatedData));
  return updatedData;
}

export function saveTasks(tasks: Task[]) {
  return updateStorageData((data) => ({
    ...data,
    tasks,
  }));
}

export function saveComments(comments: Comment[]) {
  return updateStorageData((data) => ({
    ...data,
    comments,
  }));
}

export const saveCategories = (categories: Category[]) => {
  const data = getSearchData();
  localStorage.setItem('searchData', JSON.stringify({
    ...data,
    categories
  }));
};
