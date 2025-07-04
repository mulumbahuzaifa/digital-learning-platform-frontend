import { FC } from 'react';

interface FooterSmallProps {
  absolute?: boolean;
}

const FooterSmall: FC<FooterSmallProps> = ({ absolute = false }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className={
        (absolute
          ? 'absolute w-full bottom-0 bg-green-800'
          : 'relative bg-green-800') + ' pb-6'
      }
    >
      <div className="container mx-auto px-4">
        <hr className="mb-6 border-b-1 border-green-600" />
        <div className="flex flex-wrap items-center md:justify-between justify-center">
          <div className="w-full md:w-4/12 px-4">
            <div className="text-sm text-gray-200 font-semibold py-1 text-center md:text-left">
              Copyright © {currentYear}{' '}
              <a
                href="/"
                className="text-white hover:text-orange-300 text-sm font-semibold py-1"
              >
                NEWSOMA Learning Platform
              </a>
            </div>
          </div>
          <div className="w-full md:w-8/12 px-4">
            <ul className="flex flex-wrap list-none md:justify-end justify-center">
              <li>
                <a
                  href="/about"
                  className="text-gray-200 hover:text-orange-300 text-sm font-semibold block py-1 px-3"
                >
                  About Us
                </a>
              </li>
              <li>
                <a
                  href="/blog"
                  className="text-gray-200 hover:text-orange-300 text-sm font-semibold block py-1 px-3"
                >
                  Blog
                </a>
              </li>
              <li>
                <a
                  href="/license"
                  className="text-gray-200 hover:text-orange-300 text-sm font-semibold block py-1 px-3"
                >
                  MIT License
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterSmall;