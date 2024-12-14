import { SearchData } from '../types/search';

const STORAGE_KEY = 'helizium_search_data';

export const getSearchData = (): SearchData => {
  if (typeof window === 'undefined') return { categories: [], tasks: [] };
  
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : { categories: [], tasks: [] };
};

export const setSearchData = (data: SearchData) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const initializeSearchData = () => {
  const existingData = getSearchData();
  if (existingData.categories.length === 0) {
    const mockData: SearchData = {
      categories: [
        { id: 1, title: 'Web Development', description: 'Web development tasks and projects' },
        { id: 2, title: 'Design', description: 'Design and creative tasks' },
        { id: 3, title: 'Mobile Development', description: 'Mobile app development projects' },
        { id: 4, title: 'Data Science', description: 'Data analysis and machine learning tasks' },
        { id: 5, title: 'DevOps', description: 'Infrastructure and deployment tasks' },
        { id: 6, title: 'Content Writing', description: 'Content creation and copywriting' },
        { id: 7, title: 'Marketing', description: 'Digital marketing and SEO tasks' },
        { id: 8, title: 'QA Testing', description: 'Quality assurance and testing projects' },
      ],
      tasks: [
        { id: 1, category: 1, title: 'React Dashboard Development', content: 'Create a responsive admin dashboard using React and Material-UI', date: '2024-03-20', price: 1200 },
        { id: 2, category: 1, title: 'API Integration', content: 'Implement RESTful API integration for an e-commerce platform', date: '2024-03-21', price: 800 },
        { id: 3, category: 2, title: 'Logo Design', content: 'Design a modern logo for a tech startup', date: '2024-03-22', price: 500 },
        { id: 4, category: 2, title: 'UI/UX Redesign', content: 'Redesign user interface for a mobile banking app', date: '2024-03-23', price: 1500 },
        { id: 5, category: 3, title: 'iOS App Development', content: 'Develop a fitness tracking iOS app using Swift', date: '2024-03-24', price: 2000 },
        { id: 6, category: 3, title: 'Android App Update', content: 'Update existing Android app to latest Material Design guidelines', date: '2024-03-25', price: 1000 },
        { id: 7, category: 4, title: 'Data Analysis Project', content: 'Analyze customer behavior data using Python and Pandas', date: '2024-03-26', price: 900 },
        { id: 8, category: 4, title: 'ML Model Training', content: 'Train and deploy a machine learning model for prediction', date: '2024-03-27', price: 1800 },
        { id: 9, category: 5, title: 'AWS Infrastructure Setup', content: 'Set up and configure AWS infrastructure using Terraform', date: '2024-03-28', price: 1500 },
        { id: 10, category: 5, title: 'CI/CD Pipeline', content: 'Implement CI/CD pipeline using GitHub Actions', date: '2024-03-29', price: 1100 },
        { id: 11, category: 6, title: 'Technical Blog Posts', content: 'Write 5 technical blog posts about cloud computing', date: '2024-03-30', price: 400 },
        { id: 12, category: 6, title: 'Product Descriptions', content: 'Write compelling product descriptions for an online store', date: '2024-03-31', price: 300 },
        { id: 13, category: 7, title: 'SEO Optimization', content: 'Optimize website content for better search engine ranking', date: '2024-04-01', price: 600 },
        { id: 14, category: 7, title: 'Social Media Campaign', content: 'Plan and execute social media marketing campaign', date: '2024-04-02', price: 700 },
        { id: 15, category: 8, title: 'E2E Testing', content: 'Implement end-to-end testing using Cypress', date: '2024-04-03', price: 900 },
        { id: 16, category: 8, title: 'Mobile App Testing', content: 'Perform comprehensive testing for a mobile application', date: '2024-04-04', price: 800 },
        { id: 17, category: 1, title: 'Vue.js Frontend', content: 'Build a Vue.js frontend for a booking system', date: '2024-04-05', price: 1300 },
        { id: 18, category: 2, title: 'Brand Identity Package', content: 'Create complete brand identity including logo and guidelines', date: '2024-04-06', price: 2000 },
        { id: 19, category: 3, title: 'Flutter Mobile App', content: 'Create a cross-platform mobile app using Flutter', date: '2024-04-07', price: 2200 },
        { id: 20, category: 4, title: 'NLP Model Development', content: 'Develop natural language processing model for text analysis', date: '2024-04-08', price: 2500 },
        { id: 21, category: 5, title: 'Kubernetes Deployment', content: 'Set up and configure Kubernetes cluster for microservices', date: '2024-04-09', price: 1800 },
        { id: 22, category: 6, title: 'API Documentation', content: 'Write comprehensive API documentation with examples', date: '2024-04-10', price: 600 },
        { id: 23, category: 7, title: 'Email Marketing Campaign', content: 'Design and implement email marketing strategy', date: '2024-04-11', price: 800 },
        { id: 24, category: 8, title: 'Performance Testing', content: 'Conduct load and stress testing for web application', date: '2024-04-12', price: 1200 },
        { id: 25, category: 1, title: 'Next.js Migration', content: 'Migrate existing React app to Next.js framework', date: '2024-04-13', price: 1700 },
        { id: 26, category: 2, title: 'Mobile App UI Kit', content: 'Design comprehensive UI kit for mobile applications', date: '2024-04-14', price: 1900 },
        { id: 27, category: 3, title: 'React Native App', content: 'Build a social networking app using React Native', date: '2024-04-15', price: 2300 },
        { id: 28, category: 4, title: 'Data Visualization', content: 'Create interactive data visualizations using D3.js', date: '2024-04-16', price: 1400 },
        { id: 29, category: 5, title: 'Docker Optimization', content: 'Optimize Docker containers and improve performance', date: '2024-04-17', price: 1300 },
        { id: 30, category: 6, title: 'UX Case Study', content: 'Write detailed UX case study for mobile app redesign', date: '2024-04-18', price: 700 }
      ]
    };
    setSearchData(mockData);
  }
}; 
