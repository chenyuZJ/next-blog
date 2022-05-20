import React, { ReactNode } from 'react';

import Link from 'next/link';

import { Navbar } from '../navigation/Navbar';
import { AppConfig } from '../utils/AppConfig';

type IMainProps = {
  meta: ReactNode;
  children: ReactNode;
  userName?: string;
};

const Main = (props: IMainProps) => (
  <div className="antialiased w-full text-gray-700 px-3 md:px-0">
    {props.meta}

    <div className="flex justify-between items-center px-10 h-10 bg-gray-900">
      <div className="text-sm text-gray-100">{props.userName || 'cy'}-Blog</div>
      <Navbar>
        <li className="ml-6">
          <Link href="/">
            <a>Home</a>
          </Link>
        </li>
        <li className="ml-6">
          <Link href="/about/">
            <a>About</a>
          </Link>
        </li>
      </Navbar>
    </div>
    <div className="">
      <div className="border-b border-gray-300 bg-blue-400">
        <div className="text-center py-12">
          <div className="font-semibold text-3xl text-gray-100 mx-auto">
            {AppConfig.title}
          </div>
          <div className="text-xl text-gray-100">{AppConfig.description}</div>
        </div>
      </div>

      <div className="text-xl py-6 px-14">{props.children}</div>

      <div className="border-t border-gray-300 text-center py-8 text-sm">
        © Copyright {new Date().getFullYear()} {AppConfig.title}. Powered with{' '}
        <span role="img" aria-label="Love">
          ♥
        </span>{' '}
        by <a href="https://creativedesignsguru.com">CreativeDesignsGuru</a>
      </div>
    </div>
  </div>
);

export { Main };
