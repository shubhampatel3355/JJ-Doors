import { socialMediaLinks } from "@/data/socials";
import React from "react";
import BlogSerchbar from "./BlogSerchbar";
import Categories from "./Categories";
import RecentPosts from "./RecentPosts";
import Image from "next/image";
import Link from "next/link";
import { allBlogs } from "@/data/blogs";

export default function BlogDetails({ blogId }) {
  const blogItem = allBlogs.find((elm) => String(elm.id) === String(blogId)) || allBlogs[0];
  const currentIndex = allBlogs.findIndex((elm) => String(elm.id) === String(blogItem.id));
  
  const prevBlog = currentIndex > 0 ? allBlogs[currentIndex - 1] : allBlogs[allBlogs.length - 1];
  const nextBlog = currentIndex < allBlogs.length - 1 ? allBlogs[currentIndex + 1] : allBlogs[0];

  return (
    <section className="blog__details-area space">
      <div className="container">
        <div className="blog__inner-wrap">
          <div className="row">
            <div className="col-70">
              <div className="blog__details-wrap">
                {/* Main Featured Image */}
                <div className="blog__details-thumb">
                  <Image
                    width={856}
                    height={600}
                    src={blogItem.image}
                    alt={blogItem.title}
                    style={{ width: "100%", height: "auto", objectFit: "cover" }}
                    priority
                  />
                </div>

                <div className="blog__details-content">
                  {/* Meta Information */}
                  <div className="blog-post-meta">
                    <ul className="list-wrap">
                      <li>{blogItem.date}</li>
                      <li>
                        <a href="#">{blogItem.category}</a>
                      </li>
                      <li>
                        <a href="#">by {blogItem.author || "JJ Doors Team"}</a>
                      </li>
                    </ul>
                  </div>

                  {/* Title */}
                  <h2 className="title">{blogItem.title}</h2>

                  {/* Paragraph 1 */}
                  {blogItem.paragraph1 && <p>{blogItem.paragraph1}</p>}

                  {/* Paragraph 2 */}
                  {blogItem.paragraph2 && <p>{blogItem.paragraph2}</p>}

                  {/* Featured Quote */}
                  {blogItem.quote && (
                    <blockquote>
                      <Image
                        width={52}
                        height={32}
                        className="blockquote-icon"
                        src="/assets/img/icon/quote.svg"
                        alt="quote icon"
                      />
                      <p>{blogItem.quote}</p>
                    </blockquote>
                  )}

                  {/* Paragraph 3 */}
                  {blogItem.paragraph3 && <p>{blogItem.paragraph3}</p>}

                  {/* Paragraph 4 */}
                  {blogItem.paragraph4 && <p>{blogItem.paragraph4}</p>}

                  {/* Tags and Social Sharing */}
                  <div className="blog__details-bottom">
                    <div className="row align-items-center">
                      <div className="col-md-7">
                        <div className="post-tags">
                          <ul className="list-wrap">
                            {(blogItem.tags || ["JJ Doors", "Custom Doors"]).map((tag, idx) => (
                              <li key={idx}>
                                <a href="#">{tag}</a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      <div className="col-md-5">
                        <div className="post-share">
                          <h5 className="title">Share:</h5>
                          <div className="social-btn style3 justify-content-md-end">
                            {socialMediaLinks.slice(0, 3).map((elm, i) => (
                              <a key={i} href={elm.href} target="_blank" rel="noopener noreferrer">
                                <span className="link-effect">
                                  <span className="effect-1">
                                    <i className={elm.iconClass}></i>
                                  </span>
                                  <span className="effect-1">
                                    <i className={elm.iconClass}></i>
                                  </span>
                                </span>
                              </a>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Prev / Next Article Navigation */}
                  <div className="inner__page-nav mt-20 mb-n1">
                    {prevBlog && (
                      <Link scroll={false} href={`/blog-details/${prevBlog.id}`} className="nav-btn">
                        <i className="fa fa-arrow-left"></i>
                        <span>
                          <span className="link-effect">
                            <span className="effect-1">Previous: {prevBlog.title.slice(0, 22)}...</span>
                            <span className="effect-1">Previous: {prevBlog.title.slice(0, 22)}...</span>
                          </span>
                        </span>
                      </Link>
                    )}
                    {nextBlog && (
                      <Link scroll={false} href={`/blog-details/${nextBlog.id}`} className="nav-btn ms-auto">
                        <span>
                          <span className="link-effect">
                            <span className="effect-1">Next: {nextBlog.title.slice(0, 22)}...</span>
                            <span className="effect-1">Next: {nextBlog.title.slice(0, 22)}...</span>
                          </span>
                        </span>
                        <i className="fa fa-arrow-right"></i>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="col-30">
              <aside className="blog__sidebar">
                <Categories />
                <RecentPosts />
              </aside>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
