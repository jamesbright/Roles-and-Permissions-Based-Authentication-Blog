import * as mongoose from 'mongoose';
import { Request, Response } from 'express';
import { BlogSchema } from '../models/blogModel';
import { Comment } from '../models/commentModel';
import { UserSchema } from '../models/userModel';
import { UserI } from '../interfaces/user';
import { BlogI } from '../interfaces/blog';

const cloudinary = require('cloudinary').v2;
import { Like } from '../models/likeModel';
import * as dotenv from 'dotenv';
dotenv.config();



//Create an instance of  blog model
const Blog = mongoose.model<BlogI>('Blog', BlogSchema);
//index blog documents to enable searching
Blog.createIndexes()


//Create an instance of  user model
const User = mongoose.model<UserI>('User', UserSchema);
//index user documents to enable searching
User.createIndexes()

class BlogController {


    public create(req: Request, res: Response): void {
        let status: string,
            message: any,
            code: number;
        console.log(req['file']);
        //create new blog
        let imageURL: string, imageId: string;
        if (req['file']) {
            imageURL = req['file'].path;
            imageId = req['file'].filename;
        } else {
            imageURL = null;
            imageId = null;
        }
        console.log(req.body.author);
        User.findById(req.body.author, function (err, user) {
            if (err) {
                code = 500;
                status = "Server error";
                message = "There was a problem with the server";
                return res.status(code).send({ status: status, code: code, message: message });


            } else {
                if (!user) {

                    code = 404;
                    status = "not found";
                    message = "author not found";
                    return res.status(code).send({ status: status, code: code, message: message });


                }

                Blog.create({
                    title: req.body.title,
                    content: req.body.content,
                    imageURL: imageURL,
                    imageId: imageId,
                    author: req.body.author,
                },
                    (err, blog) => {
                        if (err) {
                            return res.status(500).send({ status: "Server error", code: 500, message: err });

                        } else {
                            //upload image to cloudinary

                            blog.save(err => {
                                if (err) {
                                    return res.status(500).send({ status: "Server error", code: 500, message: err });

                                }

                                return res.status(201).send({ blog: blog, status: "Success", code: 201, message: 'blog successfully published' });

                            });

                        }
                    });
            }

        });
    }

    public ckUpload(req: Request, res: Response): any {
        let status: string,
            message: any,
            code: number;
        console.log(req['file']);
      
        let url: string, imageId: string;
        if (req['file']) {
            url = req['file'].path;
            imageId = req['file'].filename;

            code = 200;
            status = "Success";
            message = "Endpoint returned successfully";
            return res.status(code).send({ url:url,imageId:imageId, status: status, code: code, message: message});

        } else {
            code = 500;
            status = "error";
            message = "error while uploading image";
            return res.status(code).send({ url: req['file'], status: status, code: code, error:{ message: message} });

        }
    }
    public getAllBlogs(req: Request, res: Response): void {

        let status: string,
            message: string,
            code: number;

        // get limit and page number from request
        const currentPage: number = Number(req.query.page) || 1;
        const limit: number = Number(req.query.limit) || 10;
        const orderBy: number = Number(req.query.orderBy) || 1;
        const sortBy: string = req.query.sortBy as string || 'createdAt';

        let hasNext: boolean,
            hasPrev: boolean,
            query: object;
        if (req.query.search) {

            const search = req.query.search;
            //query to search for text
            query = { $text: { $search: search } };
        } else {
            query = null
        }

        try {
            //sort by firstname in ascending order
            const sort = { [sortBy]: orderBy };

            Blog.find(query, async function (err: any, blogs: any) {
               
                // get total documents in the User collection 
                const count: number = await Blog.countDocuments();
                let totalPages: number;
                if (err) {
                    code = 500;
                    status = "Server error";
                    message = err;
                    totalPages = 0;
                } else {
                    if (blogs.length == 0) {
                        code = 404;
                        status = "Not found";
                        message = "No blog found";
                        totalPages = 0;
                    } else {
                        code = 200;
                        status = "Success";
                        message = "Endpoint returned successfully";
                        totalPages = Math.ceil(count / limit);

                    }
                }

                if (currentPage > 1)
                    hasPrev = true;
                else
                    hasPrev = false;

                if (totalPages > currentPage)
                    hasNext = true;
                else
                    hasNext = false;

                //calculate values for previous and next page
                const prevPage: number = Number(currentPage) - 1;
                const nextPage: number = Number(currentPage) + 1;

                //pagination object with all pagination values
                const pagination: Record<string, unknown> = {
                    'totalPages': totalPages,
                    'currentPage': currentPage,
                    'blogs': count,
                    'hasNext': hasNext,
                    'hasPrev': hasPrev,
                    'perPage': limit,
                    'prevPage': prevPage,
                    'nextPage': nextPage
                }
                //get current and next url
                const links: Record<string, unknown> = {
                    'nextLink': `${req.protocol}://${req.get('host')}/api/blogs/get?page=${nextPage}&limit=${limit}`,
                    'prevLink': `${req.protocol}://${req.get('host')}/api/blogs/get?page=${prevPage}&limit=${limit}`
                };
                // return response with posts, calculated total pages, and current page
                return res.status(code).send({ blogs, pagination: pagination, status: status, code: code, message: message, links: links });



            }).populate({ path: "author", select: '-password' }) // populate blogs

                .populate("comments")// in blogs, populate comments
                .populate("likes")// in blogs, populate likes
                .limit(limit * 1)//prevPage = (currentPage - 1) * limit
                .skip((currentPage - 1) * limit)
                .sort(sort)
                .exec();

        } catch (err) {
            console.error(err.message);
        }
    }

    public getBlog(req: Request, res: Response): void {
        let status: string,
            message: any,
            code: number;
        //find user using their id
        Blog.findById(req.params.id, function (err, blog) {
            if (err) {
                code = 500;
                status = "Server error";
                message = "There was a problem with the server.";
            } else {
                if (!blog) {
                    code = 404;
                    status = "Not found";
                    message = "Blog not found";
                } else {
                    code = 200;
                    status = "Success";
                    message = "Endpoint returned successfully”";
                }
            }
            //get all comments and likes for this blog
            Comment.find({ blog: req.params.id }, function (err, comments) {
                Like.find({ blog: req.params.id }, function (err, likes) {
                    return res.status(code).send({ blog: blog, comments: comments, likes: likes, status: status, code: code, message: message });
                }).populate('user');
            }).populate('user');

        }).populate({ path: "author", select: '-password' }) // populate blogs
            .select("-comments")// in blogs, populate comments
            .populate("likes")// in blogs, populate likes
    }

    public updateBlog(req: Request, res: Response): void {


        let status: string,
            message: any,
            code: number;
        //find  the blog by it's id and update the new values subsequently
        Blog.findById(req.params.id, function (err, blog) {
            if (err) {
                code = 500;
                status = "Server error";
                message = "There was a problem with the server.";
                return res.status(code).send({ status: status, code: code, message: message });

            }
            if (!blog) {
                code = 404;
                status = "Not found";
                message = "Blog not found";
                return res.status(code).send({ status: status, code: code, message: message });

            } else {
                User.findById(req.body.author, function (err, user) {
                    if (err) {
                        return res.status(500).send({ status: "Server error", code: 500, message: "There was a problem with the server" });

                    } else {
                        if (!user) {
                            return res.status(404).send({ status: "not found", code: 404, message: "author not found" });

                        }


                        cloudinary.config({
                            cloud_name: process.env.CLOUDINARY_NAME,
                            api_key: process.env.CLOUDINARY_API_KEY,
                            api_secret: process.env.CLOUDINARY_API_SECRET,
                        });
                        cloudinary.uploader.destroy(blog.imageId, function (result) {
                            console.log(result)
                            let imageURL: string, imageId: string;
                            if (req['file']) {
                                imageURL = req['file'].path;
                                imageId = req['file'].filename;
                            } else {
                                imageURL = null;
                                imageId = null;
                            }

                            blog.title = req.body.title,
                                blog.content = req.body.content,
                                blog.imageURL = imageURL,
                                blog.imageId = imageId,
                                blog.author = req.body.author,
                                blog.save(err => {
                                    if (err) {
                                        return res.status(500).send({ status: "Server error", code: 500, message: err });
                                    }
                                    code = 200;
                                    status = "Success";
                                    message = "Blog updated successfully";
                                    return res.status(code).send({ blog: blog, status: status, code: code, message: message });
                                })
                        })

                    }
                });
            }

        })
    }

    public addComment(req: Request, res: Response): void {

        let status: string,
            message: any,
            code: number;
        User.findById(req.body.userId, function (err, user) {
            if (err) {
                return res.status(500).send({ status: "Server error", code: 500, message: "There was a problem with the server" });

            } else {
                if (!user) {
                    return res.status(404).send({ status: "not found", code: 404, message: "User not found" });

                }

                //create new comment
                Comment.create({
                    content: req.body.content,
                    user: req.body.userId,
                    blog: req.params.id,
                },
                    (err, comment) => {
                        if (err) {
                            return res.status(500).send({ status: "Server error", code: 500, message: err });

                        } else {

                            comment.save(err => {
                                if (err) {
                                    return res.status(500).send({ status: "Server error", code: 500, message: err });

                                }
                                Comment.populate(comment, { path: "user" });

                                Blog.findById(req.params.id, function (err, blog) {
                                    if (err) {
                                        code = 500;
                                        status = "Server error";
                                        message = "There was a problem with the server.";
                                        return res.status(code).send({ status: status, code: code, message: message });

                                    } else {
                                        if (!blog) {
                                            code = 404;
                                            status = "Not found";
                                            message = "Blog not found";
                                            return res.status(code).send({ status: status, code: code, message: message });
                                        } else {
                                            blog.comments.push(comment._id);
                                            blog.save(err => {
                                                if (err) {
                                                    return res.status(500).send({ status: "Server error", code: 500, message: err });

                                                }

                                                Comment.find({ blog: req.params.id }, function (err, comments) {
                                                    return res.status(201).send({ comments: comments, status: "Success", code: 201, message: 'Successfully commented' });
                                                }).populate('user');
                                            });
                                        }
                                    }
                                });
                            })
                        }
                    })
            }
        });
    }


    public addLike(req: Request, res: Response): void {

        let status: string,
            message: any,
            code: number;
        User.findById(req.body.userId, function (err, user) {
            if (err) {
                return res.status(500).send({ status: "Server error", code: 500, message: "There was a problem with the server" });

            } else {
                if (!user) {
                    return res.status(404).send({ status: "not found", code: 404, message: "User not found" });

                }
                Like.findOne({}, function (err, like) {
                    if (err) {
                        return res.status(500).send({ status: "Server error", code: 500, message: "There was a problem with the server" });

                    } else {
                        if (like) {
                            Like.remove({ _id: like._id }, function () {

                                Like.find({ blog: req.params.id }, function (err, likes) {

                                    return res.status(200).send({ likes: likes, liked: false, status: "Success", code: 200, message: 'unliked' });

                                }).populate('user');
                            })
                        } else {

                            //create new comment
                            Like.create({
                                user: req.body.userId,
                                blog: req.params.id,
                            },
                                (err, like) => {
                                    if (err) {
                                        return res.status(500).send({ status: "Server error", code: 500, message: err });

                                    } else {

                                        like.save(err => {
                                            if (err) {
                                                return res.status(500).send({ status: "Server error", code: 500, message: err });

                                            }
                                            Blog.findById(req.params.id, function (err, blog) {
                                                if (err) {
                                                    code = 500;
                                                    status = "Server error";
                                                    message = "There was a problem with the server.";
                                                    return res.status(code).send({ status: status, code: code, message: message });

                                                } else {
                                                    if (!blog) {
                                                        code = 404;
                                                        status = "Not found";
                                                        message = "Blog not found";
                                                        return res.status(code).send({ status: status, code: code, message: message });
                                                    } else {
                                                        blog.likes.push(like._id);
                                                        blog.save(err => {
                                                            if (err) {
                                                                return res.status(500).send({ status: "Server error", code: 500, message: err });

                                                            }

                                                            Like.find({ blog: req.params.id }, function (err, likes) {
                                                                return res.status(200).send({ likes: likes, liked: true, status: "Success", code: 200, message: 'liked' });

                                                            }).populate('user');
                                                        });
                                                    }
                                                }
                                            });
                                        })
                                    }
                                })
                        }

                    }
                }).where('user').equals(req.body.userId)
                    .where('blog').equals(req.params.id);


            }
        });
    }


    public incViews(req: Request, res: Response): void {

        let status: string,
            message: any,
            code: number;

        //find user by their id and set active to true subsequently
        Blog.findById({ _id: req.params.id }, function (err, blog) {
            if (err) {
                code = 500;
                status = "Server error";
                message = "There was a problem with the server.";
            }
            if (!blog) {
                code = 404;
                status = "Not found";
                message = "User not found";
            } else {
                blog.views = blog.views + 1;
                blog.save(err => {
                    if (err) {
                        return res.status(500).send({ status: "Server error", code: 500, message: err });

                    }
                    code = 200;
                    status = "Success";
                    message = "Successfully viewed."
                    return res.status(code).send({ status: status, code: code, message: message });

                });
            }
        })
    }

    public async deleteBlog(req: Request, res: Response): Promise<any> {

        let status: string,
            message: any,
            code: number;
        //find user by their id and delete the new values subsequently

        Blog.findById(req.params.id, function (err, blog) {
            if (err) {
                code = 500;
                status = "Server error";
                message = "There was a problem with the server.";
                return res.status(code).send({ status: status, code: code, message: message });

            } else {
                if (!blog) {
                    code = 404;
                    status = "Not found";
                    message = "Blog not found";
                    return res.status(code).send({ status: status, code: code, message: message });

                } else {


                    cloudinary.config({
                        cloud_name: process.env.CLOUDINARY_NAME,
                        api_key: process.env.CLOUDINARY_API_KEY,
                        api_secret: process.env.CLOUDINARY_API_SECRET,
                    });
                    cloudinary.uploader.destroy(blog.imageId, function (result) {

                        Blog.findByIdAndRemove({ _id: req.params.id }, {}, function (err, blog) {
                            if (err) {
                                code = 500;
                                status = "Server error";
                                message = "There was a problem with the server.";
                                return res.status(code).send({ status: status, code: code, message: message });
                            }

                            code = 200;
                            status = "Success";
                            message = "blog removed successfully”";
                            return res.status(code).send({ status: status, code: code, message: message });

                        });
                    });
                }

            }
        });

    }

}

export { BlogController }