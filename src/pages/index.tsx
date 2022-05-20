import React from 'react';
import { GetStaticProps } from 'next';
import { BlogGallery } from '../blog/BlogGallery';
import { Meta } from '../layout/Meta';
// import { IPaginationProps } from '../pagination/Pagination';
import { Main } from '../templates/Main';
import { AppConfig } from '../utils/AppConfig';
import { getAllPosts } from '../utils/Content';
import { Content } from '../content/Content';
import { post } from '../utils/axios';

type IBlogGalleryProps = {
  posts: any;
  user: {
    name: string;
  };
};

const Index = (props: IBlogGalleryProps) => {
  return (
    <div className="flex items-center justify-center">
      {props.posts.length != 0 ? (
        <Main
          meta={
            <Meta
              title="Made with Next.js, TypeScript, ESLint, Prettier, PostCSS, Tailwind CSS"
              description={AppConfig.description}
            />
          }
          userName={props.user.name}
        >
          <div className="flex justify-between">
            {/* <BlogGallery posts={props.posts} pagination={props.pagination} /> */}
            <BlogGallery posts={props.posts} />
            <div className="w-1/3">
              <div className="about shadow-lg px-6 py-6">
                <Content>
                  <p>About me</p>
                  <p>
                    A little fool who loves code
                    <br />
                    Under the ordinary appearance, there is a heart that loves
                    learning
                    <br />
                    Hardworking, peace loving, patriotic and professional
                  </p>
                </Content>
              </div>
            </div>
          </div>
        </Main>
      ) : (
        <img src="/assets/images/loading.gif" alt="" />
      )}
    </div>
  );
};

export const getStaticProps: GetStaticProps<any> = async () => {
  const posts = getAllPosts(['title', 'date', 'slug', 'image', 'description']);
  const user = await post('/user/find-user', { userName: 'cy' });
  return {
    props: {
      posts: posts.slice(0, AppConfig.pagination_size),
      user
    },
  };
};

export default Index;
