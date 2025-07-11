import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";
import {
  AcademicCapIcon,
  BookOpenIcon,
  ChartBarIcon,
  UsersIcon,
  BoltIcon,
  ArrowRightIcon,
  DevicePhoneMobileIcon,
  GlobeAltIcon,
  ShieldCheckIcon
} from "@heroicons/react/24/outline";
import Navbar from "../components/ui/navbar/AuthNavbar";
import Footer from "../components/ui/Footer";
import image from "../assets/images/students.jpg";

export default function HomePage() {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-green-800 to-green-700 overflow-hidden">
        <div className="absolute inset-0">
          <svg className="absolute h-full w-full" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
            <path fill="rgba(255, 255, 255, 0.05)" fillOpacity="1" d="M0,288L48,272C96,256,192,224,288,197.3C384,171,480,149,576,165.3C672,181,768,235,864,250.7C960,267,1056,245,1152,229.3C1248,213,1344,203,1392,197.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
            <div className="pt-32 sm:pt-48 lg:pt-56">
              <div className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 lg:mt-20 lg:px-8 xl:mt-28">
                <div className="sm:text-center lg:text-left">
                  <h1 className="text-4xl tracking-tight font-extrabold text-white sm:text-5xl md:text-6xl">
                    <span className="block">Transform Your Learning</span>
                    <span className="block text-orange-400">With NEWSOMA</span>
                  </h1>
                  <p className="mt-3 text-base text-gray-200 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                    Access world-class courses from top instructors. Learn anytime, anywhere at your own pace.
                  </p>
                  <div className="mt-8 sm:flex sm:justify-center lg:justify-start space-y-3 sm:space-y-0 sm:space-x-4">
                    {isAuthenticated ? (
                      <Link
                        to={`/${user?.role}`}
                        className="flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-green-700 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10 transition-all"
                      >
                        Go to Dashboard <ArrowRightIcon className="ml-2 h-5 w-5" />
                      </Link>
                    ) : (
                      <Link
                        to="/register"
                        className="flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-orange-500 hover:bg-orange-600 md:py-4 md:text-lg md:px-10 transition-all"
                      >
                        Get Started for Free
                      </Link>
                    )}
                    <Link
                      to="/courses"
                      className="flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 md:py-4 md:text-lg md:px-10 transition-all"
                    >
                      Browse Courses
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
          <img
            className="h-56 w-full object-cover sm:h-72 md:h-96 lg:w-full lg:h-full"
            src={image}
            alt="Students learning"
            loading="lazy"
          />
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-green-600 font-semibold tracking-wide uppercase">Features</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Why Choose NEWSOMA
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              Our platform is designed to provide the best learning experience.
            </p>
          </div>

          <div className="mt-16">
            <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
              {[
                {
                  name: "Interactive Learning",
                  description: "Engaging multimedia content with quizzes and hands-on projects",
                  icon: BookOpenIcon,
                  color: "bg-blue-500"
                },
                {
                  name: "Expert Instructors",
                  description: "Learn from professionals and academic experts",
                  icon: AcademicCapIcon,
                  color: "bg-green-500"
                },
                {
                  name: "Progress Tracking",
                  description: "Visual dashboards to monitor your learning journey",
                  icon: ChartBarIcon,
                  color: "bg-orange-500"
                },
                {
                  name: "Community Support",
                  description: "Collaborate with peers in discussion forums",
                  icon: UsersIcon,
                  color: "bg-red-500"
                },
                {
                  name: "Flexible Schedule",
                  description: "Learn at your own pace with 24/7 access",
                  icon: BoltIcon,
                  color: "bg-blue-500"
                },
                {
                  name: "Mobile Access",
                  description: "Learn on the go with our mobile-friendly platform",
                  icon: DevicePhoneMobileIcon,
                  color: "bg-green-500"
                },
              ].map((feature) => (
                <div key={feature.name} className="relative group bg-white p-6 rounded-lg shadow-sm border border-gray-200 transition-all duration-300 hover:shadow-md">
                  <div className={`absolute flex items-center justify-center h-12 w-12 rounded-md ${feature.color} text-white`}>
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <div className="ml-16">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">{feature.name}</h3>
                    <p className="mt-2 text-base text-gray-500">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:py-16 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-8 lg:items-center">
            <div>
              <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                Student Success Stories
              </h2>
              <p className="mt-3 max-w-3xl text-lg text-gray-500">
                Hear from our students about their experiences.
              </p>
            </div>
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:mt-0">
              {[
                {
                  quote: "NEWSOMA helped me transition into a new career in just 6 months!",
                  name: "Serugo Brian",
                  role: "UX Designer",
                  color: "bg-gradient-to-br from-green-500 to-green-600"
                },
                {
                  quote: "The quality rivals what I experienced at top universities.",
                  name: "Audrey dorcus",
                  role: "system analyst",
                  color: "bg-gradient-to-br from-orange-500 to-orange-600"
                },
              ].map((testimonial) => (
                <div key={testimonial.name} className="bg-white p-6 rounded-lg shadow-md transform transition duration-300 hover:-translate-y-1 hover:shadow-lg">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className={`h-10 w-10 rounded-full ${testimonial.color} flex items-center justify-center text-white font-bold`}>
                        {testimonial.name.charAt(0)}
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-base font-medium text-gray-900">{testimonial.name}</div>
                      <div className="text-sm text-gray-500">{testimonial.role}</div>
                    </div>
                  </div>
                  <p className="mt-4 text-gray-600">"{testimonial.quote}"</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-green-700 to-green-600">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            <span className="block">Ready to get started?</span>
            <span className="block text-green-100">Begin your learning journey today.</span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0 space-x-4">
            <Link
              to={isAuthenticated ? `/${user?.role}/dashboard` : "/register"}
              className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-green-600 bg-white hover:bg-green-50"
            >
              {isAuthenticated ? "Continue Learning" : "Get Started"}
            </Link>
            <Link
              to="/courses"
              className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-orange-500 hover:bg-orange-600"
            >
              Browse Courses
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}