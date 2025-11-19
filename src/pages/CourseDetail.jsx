import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, CheckCircle, ArrowRight } from 'lucide-react';
import ErrorDisplay from '../components/ErrorDisplay.jsx';
import coursesData from '../data/courses.json';

const CourseDetail = () => {
  const { slug } = useParams();

  // Load course from JSON data
  const course = useMemo(() => {
    if (!slug || !Array.isArray(coursesData)) return null;
    return coursesData.find(c => c.slug === slug);
  }, [slug]);

  const isLoading = false;
  const error = course ? null : 'Course not found';


  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <ErrorDisplay
          error={error}
          title="Course Not Found"
          message="The course you're looking for doesn't exist or couldn't be loaded."
          onRetry={() => window.location.reload()}
          isNetworkError={error?.message?.includes('Network') || error?.message?.includes('fetch')}
        />
      </div>
    );
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };


  // Process course schedules into curriculum data
  const curriculumData = course?.schedules?.length > 0 ? 
    course.schedules.map((schedule, index) => ({
      semester: `S${index + 1}`,
      courses: [{
        name: schedule.name,
        hours: schedule.duration || 0,
        code: `CS${String(index + 1).padStart(3, '0')}`
      }]
    })) : [
      {
        semester: 'S1',
        courses: [
          { name: 'Course Introduction', hours: course?.duration_hours || 0, code: 'CS001' }
        ]
      }
    ];

  const totalHours = course?.duration_hours || course?.schedules?.reduce((total, schedule) => total + (schedule.duration || 0), 0) || 0;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
            <ol className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm text-gray-600 overflow-x-auto">
              <li><Link to="/" className="hover:text-blue-600 whitespace-nowrap">Home</Link></li>
              <li>/</li>
              <li><Link to="/courses" className="hover:text-blue-600 whitespace-nowrap">Courses</Link></li>
              <li>/</li>
              <li><Link to={`/courses?category=${course?.category_slug || ''}`} className="hover:text-blue-600 whitespace-nowrap">{course?.category_name || 'Category'}</Link></li>
              <li>/</li>
              <li className="text-gray-900 truncate">{course?.name || 'Course'}</li>
            </ol>
            <Link 
              to="/courses" 
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors font-medium text-sm sm:text-base self-start sm:self-auto"
            >
              <ArrowRight className="w-4 h-4 rotate-180" />
              <span>Back to Courses</span>
            </Link>
          </div>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Course Content */}
          <div className="lg:col-span-2">
            {/* Major Description */}
            <div className="mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-blue-600 mb-4 sm:mb-6">COURSE DESCRIPTION</h1>
              <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
                {course?.description || course?.short_description || 'No description available for this course.'}
              </p>
            </div>

            {/* Curriculum Details */}
            <div className="mb-6 sm:mb-8">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-blue-600 mb-4 sm:mb-6">CURRICULUM DETAILS</h2>
              
              {/* Curriculum Table */}
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[600px]">
                    <thead className="bg-blue-600 text-white">
                      <tr>
                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-left font-semibold text-xs sm:text-sm">Subjects</th>
                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-left font-semibold text-xs sm:text-sm">Hours</th>
                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-left font-semibold text-xs sm:text-sm">Code</th>
                      </tr>
                    </thead>
                    <tbody>
                      {curriculumData.map((semester, semesterIndex) => (
                        <React.Fragment key={semester.semester}>
                          {semester.courses.map((course, courseIndex) => (
                            <tr 
                              key={`${semester.semester}-${courseIndex}`}
                              className={`${
                                semesterIndex % 2 === 0 
                                  ? 'bg-blue-50' 
                                  : 'bg-yellow-50'
                              } hover:bg-opacity-80 transition-colors`}
                            >
                              <td className="px-3 sm:px-6 py-3 sm:py-4 text-gray-800 text-xs sm:text-sm">{course.name}</td>
                              <td className="px-3 sm:px-6 py-3 sm:py-4 text-gray-600 text-xs sm:text-sm">{course.hours} Hours</td>
                              <td className="px-3 sm:px-6 py-3 sm:py-4 text-gray-600 font-mono text-xs sm:text-sm">{course.code}</td>
                            </tr>
                          ))}
                        </React.Fragment>
                      ))}
                      <tr className="bg-gray-100 font-semibold">
                        <td className="px-3 sm:px-6 py-3 sm:py-4"></td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-right text-xs sm:text-sm">Total: {totalHours}</td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4"></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>


          </div>

          {/* Course Sidebar */}
          <div className="lg:col-span-1">
            <div className="card sticky top-4 sm:top-8 lg:top-20">
              <div className="text-center mb-4 sm:mb-6">
                <div className="text-2xl sm:text-3xl font-bold text-blue-600 mb-2">
                  {formatPrice(parseFloat(course?.price) || 0)}
                </div>
                <p className="text-sm sm:text-base text-gray-600">One-time enrollment fee</p>
              </div>

              <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                <div className="flex items-center justify-between py-2 border-b border-gray-200">
                  <span className="text-sm sm:text-base text-gray-600">Duration</span>
                  <span className="text-sm sm:text-base font-medium">{totalHours} Hours</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-200">
                  <span className="text-sm sm:text-base text-gray-600">Level</span>
                  <span className="text-sm sm:text-base font-medium capitalize">{course?.level || 'All Levels'}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-200">
                  <span className="text-sm sm:text-base text-gray-600">Mode</span>
                  <span className="text-sm sm:text-base font-medium capitalize">{course?.mode || 'Online'}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-200">
                  <span className="text-sm sm:text-base text-gray-600">Instructor</span>
                  <span className="text-sm sm:text-base font-medium">{course?.instructor || 'Expert Team'}</span>
                </div>
              </div>

              {course?.location && (
                <div className="mb-4 sm:mb-6">
                  <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600 mb-2">
                    <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>Location</span>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-700">{course?.location}</p>
                </div>
              )}


              {/* Features */}
              <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-3 sm:mb-4 text-sm sm:text-base">What's Included</h3>
                <div className="space-y-2 sm:space-y-3">
                  {course?.benefits && course.benefits.length > 0 ? (
                    course.benefits.map((benefit, index) => (
                      <div key={benefit.id || index} className="flex items-center space-x-2 text-xs sm:text-sm">
                        <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                        <span>{benefit.name}</span>
                      </div>
                    ))
                  ) : (
                    <>
                      <div className="flex items-center space-x-2 text-xs sm:text-sm">
                        <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                        <span>Expert instruction</span>
                      </div>
                      <div className="flex items-center space-x-2 text-xs sm:text-sm">
                        <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                        <span>Course materials</span>
                      </div>
                      <div className="flex items-center space-x-2 text-xs sm:text-sm">
                        <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                        <span>Certificate of completion</span>
                      </div>
                      <div className="flex items-center space-x-2 text-xs sm:text-sm">
                        <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                        <span>Lifetime access to resources</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;

