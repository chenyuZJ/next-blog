import React, { ReactNode } from 'react';

type INavbarProps = {
  children: ReactNode;
};

const Navbar = (props: INavbarProps) => (
  <ul className="navbar flex flex-wrap text-sm">
    {props.children}

    <style jsx>
      {`
        .navbar :global(a) {
          @apply text-gray-100;
        }

        .navbar :global(a:hover) {
          @apply no-underline text-gray-200;
        }
      `}
    </style>
  </ul>
);

export { Navbar };
