# School Web - Learning Platform

A modern, responsive web application for a school/learning platform built with React and Tailwind CSS.

## Features

- 📚 **Course Management** - Browse and enroll in courses
- 🛍️ **E-commerce Shop** - Product catalog with filtering and sorting
- 📝 **Registration System** - Student enrollment with Google Sheets integration
- 🎓 **Academic Programs** - Display available academic programs
- 📰 **News & Events** - Latest news and events section
- 🤝 **Partners** - Value partners showcase
- 🌐 **Multi-language Support** - Multiple language support
- 📱 **Responsive Design** - Mobile-friendly interface
- 🎨 **Modern UI/UX** - Beautiful and intuitive design

## Tech Stack

- **React 18** - UI library
- **React Router** - Navigation
- **Tailwind CSS** - Styling
- **React Hook Form** - Form handling
- **Lucide React** - Icons
- **React Hot Toast** - Notifications
- **HTML2Canvas** - Screenshot functionality
- **Google Apps Script** - Backend integration for registration

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Kimheang-code-IT/School-Web.git
cd School-Web
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
Frontend/
├── public/           # Static files
├── src/
│   ├── components/   # React components
│   ├── pages/        # Page components
│   ├── context/      # React context providers
│   ├── data/         # JSON data files
│   ├── hooks/        # Custom React hooks
│   ├── utils/        # Utility functions
│   └── config/       # Configuration files
└── package.json
```

## Configuration

### Google Sheets Integration

The registration system integrates with Google Sheets. See `GOOGLE_SHEETS_SETUP.md` for detailed setup instructions.

1. Deploy the Google Apps Script from `google-apps-script-code-secure.gs`
2. Update `src/config/googleSheets.js` with your Web App URL and security token

## Available Scripts

- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run tests
- `npm lint` - Run ESLint

## Features in Detail

### Registration System
- Secure form submission with validation
- Google Sheets integration for data storage
- Automatic invoice generation
- Print and screenshot functionality

### Course Management
- Course listing with categories
- Course detail pages
- Enrollment system

### Shop
- Product catalog
- Advanced filtering and sorting
- Product detail pages
- Shopping cart functionality

## Security

- Content Security Policy (CSP) configured
- Secure token-based authentication for Google Sheets
- Input validation and sanitization

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is private and proprietary.

## Contact

For questions or support, please contact the development team.

