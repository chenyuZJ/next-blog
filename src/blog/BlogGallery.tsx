import React from 'react';
import { format } from 'date-fns';
import Link from 'next/link';

// import { Pagination, IPaginationProps } from '../pagination/Pagination';
import { PostItems } from '../utils/Content';

export type IBlogGalleryProps = {
  posts: PostItems[];
  // pagination: IPaginationProps;
};

const BlogGallery = (props: IBlogGalleryProps) => {
  return (
    <div className="w-2/3">
      <div className="flex flex-wrap">
        {props.posts.map((elt) => (
          <div key={elt.slug} className="mb-3 mr-3 w-60 h-72 shadow-lg">
            <img src={elt.image} alt="" className="w-full h-36" />
            <div className="px-2 py-2">
              <Link href="/posts/[slug]" as={`/posts/${elt.slug}`}>
                <a className="text-gray-999 font-bold text-lg">{elt.title}</a>
              </Link>
              <div className="text-xs text-gray-600">
                {format(new Date(elt.date), 'LLL d, yyyy')}
              </div>
              <div className="text-xs text-gray-700">{elt.description}</div>
            </div>
          </div>
        ))}
      </div>

      {/* <Pagination
        previous={props.pagination.previous}
        next={props.pagination.next}
      /> */}
    </div>
  );
};

export { BlogGallery };
