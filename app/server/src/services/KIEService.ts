import { PrismaClient } from "@prisma/client";
import { IArticle, ICreateKIEArticle, ICreateKIEPoster, ICreateKIEVideo, IKIE, IPoster, IVideo } from "../types/kie";
import { NotFoundError } from "../common/exception";

export class KIEService {
    constructor(public prismaClient: PrismaClient) {

    }

    async createKIEContent(kiePayload: IKIE, kieContentPayload: any & { tag: string[] }) {
        const { tags } = await this.makeSureTagExist(kieContentPayload.tag);

        const kieContent = await this.prismaClient.kIEContent.create({
            data: {
                title: kiePayload.title,
                updated_by: kiePayload.updatedBy,
                created_by: kiePayload.createdBy,
                description: kiePayload.description,
                type: kiePayload.type,
                ...(kiePayload.type === 1 && {
                    article: {
                        create: {
                            Content: kieContentPayload.content,
                            banner_url: kieContentPayload.bannerUrl,
                            thumbnail_url: kieContentPayload.thumbnailUrl
                        }
                    }
                }),
                ...(kiePayload.type === 2 && {
                    poster: {
                        create: {
                            image_url: kieContentPayload.imageUrl,
                            thumbnail_url: kieContentPayload.thumbnailUrl
                        }
                    }
                }),
                ...(kiePayload.type === 3 && {
                    video: {
                        create: {
                            video_url: kieContentPayload.videoUrl,
                            thumbnail_url: kieContentPayload.thumbnailUrl
                        }
                    }
                }),
                kie_tag: {
                    connectOrCreate: tags.map((tag) => {
                        return {
                            where: {
                                id: tag.id
                            },
                            create: {
                                name: tag.name
                            }
                        }
                    })
                }
            },
            include: {
                ...(kiePayload.type === 1 && {
                    article: true
                }),
                ...(kiePayload.type === 2 && {
                    poster: true
                }),
                ...(kiePayload.type === 3 && {
                    video: true
                }),
                user: true,
                kie_tag: true,
                kie_type: true,
            }
        });

        return {
            kieContent
        }
    }

    async createKIEArticle(kiePayload: ICreateKIEArticle & { tag: string[] }) {

        const { tags } = await this.makeSureTagExist(kiePayload.tag);

        const kieArticle = await this.prismaClient.kIEContent.create({
            data: {
                title: kiePayload.title,
                updated_by: kiePayload.updatedBy,
                created_by: kiePayload.createdBy,
                description: kiePayload.description,
                type: 1,
                article: {
                    create: {
                        Content: kiePayload.content,
                        banner_url: kiePayload.bannerUrl,
                        thumbnail_url: kiePayload.thumbnailUrl,
                    }
                },
                kie_tag: {
                    connectOrCreate: tags.map((tag) => {
                        return {
                            where: {
                                id: tag.id
                            },
                            create: {
                                name: tag.name
                            }
                        }
                    })
                }
            },
            include: {
                article: true,
                user: true,
                kie_tag: true,
                kie_type: true
            }
        });

        return { kieArticle };
    }

    async makeSureTagExist(kiePayload: string[]) {
        const tags = await Promise.all(kiePayload.map(async (tag) => {
            const { tag: tagExist } = await this.getTagByName(tag);

            if (tagExist) {
                return tagExist;
            }

            return await this.prismaClient.kIETag.create({
                data: {
                    name: tag.toLowerCase()
                }
            });
        }))

        return { tags };
    }

    async getTagByName(name: string) {
        const tag = await this.prismaClient.kIETag.findFirst({
            where: {
                name: name.toLowerCase()
            }
        });

        return { tag };
    }

    async deleteKIEContentById(kieContentId: number, type: number) {
        const { content: isContentExist } = await this.getContentById(kieContentId, type);
        if (!isContentExist) {
            throw new NotFoundError(`Content not found`)
        }
        const deletedContent = await this.prismaClient.kIEContent.delete({
            where: {
                id: kieContentId,
            },
            include: {
                ...(type === 1 && {
                    article: true
                }),
                ...(type === 2 && {
                    poster: true
                }),
                ...(type === 3 && {
                    video: true
                }),
                user: true,
                kie_tag: true,
                kie_type: true
            }

        });

        return { content: deletedContent }
    }

    async getContentById(contentId: number, type: number) {
        const content = await this.prismaClient.kIEContent.findFirst({
            where: {
                id: contentId
            },
            include: {
                ...(type === 1 && {
                    article: true
                }),
                ...(type === 2 && {
                    poster: true
                }),
                ...(type === 3 && {
                    video: true
                }),
                user: true,
                kie_tag: true,
                kie_type: true
            }
        });

        return { content };
    }

    async getContentsOwnedByInstitutionByType(schoolId: number, type: number) {
        const contents = await this.prismaClient.kIEContent.findMany({
            where: {
                user: {
                    health_care_member: {
                        health_care: {
                            school_id: schoolId
                        }
                    }
                },
                type
            },
            include: {
                ...(type === 1 && {
                    article: true
                }),
                ...(type === 2 && {
                    poster: true
                }),
                ...(type === 3 && {
                    video: true
                }),
                user: true,
                kie_tag: true,
                kie_type: true
            }
        });

        return {
            contents
        }
    }

    async updateKIEContentById(contentId: number, kiePayload: IKIE, kieContentPayload: any & { tag: string[] }) {
        const { content: isContentexist } = await this.getContentById(contentId, kiePayload.type);
        if (!isContentexist) {
            throw new NotFoundError('Content not found');
        }

        const tagToRemove = isContentexist.kie_tag.filter(tag => !kieContentPayload.tag.includes(tag.name))
        const tagToAdd = kieContentPayload.tag.filter((tag: string) => isContentexist.kie_tag.map(tag => tag.name).includes(tag));

        const { tags: tagToAddOnDb } = await this.makeSureTagExist(tagToAdd);

        const updatedContent = await this.prismaClient.kIEContent.update({
            where: {
                id: contentId
            },
            data: {
                title: kiePayload.title,
                description: kiePayload.description,
                created_by: kiePayload.createdBy,
                updated_by: kiePayload.updatedBy,
                kie_tag: {
                    disconnect: tagToRemove.map(tag => ({ id: tag.id })),
                    connect: tagToAddOnDb.map(tag => ({ id: tag.id }))
                },
                ...(kiePayload.type === 1 && {
                    article: {
                        update: {
                            data: {
                                Content: kieContentPayload.content,
                                banner_url: kieContentPayload.bannerUrl,
                                thumbnail_url: kieContentPayload.thumbnailUrl
                            },
                            where: {
                                id: contentId
                            }
                        }
                    }
                }),
                ...(kiePayload.type === 2 && {
                    poster: {
                        update: {
                            data: {
                                image_url: kieContentPayload.imageUrl,
                                thumbnail_url: kieContentPayload.thumbnailUrl
                            },
                            where: {
                                id: contentId
                            }
                        }
                    }
                }),
                ...(kiePayload.type === 3 && {
                    video: {
                        update: {
                            data: {
                                video_url: kieContentPayload.videoUrl,
                                thumbnail_url: kieContentPayload.thumbnailUrl
                            },
                            where: {
                                id: contentId
                            }
                        }
                    }
                })
            },
            include: {
                ...(kiePayload.type === 1 && {
                    article: true
                }),
                ...(kiePayload.type === 2 && {
                    poster: true
                }),
                ...(kiePayload.type === 3 && {
                    video: true
                }),
                user: true,
                kie_tag: true,
                kie_type: true
            }
        });

        return {
            content: updatedContent
        }
    }


    // async updateArticleById(articleId: number, kiePayload: ICreateKIEArticle & { tag: string[] }) {
    //     const { article: isArticleExist } = await this.getArticleById(articleId);


    //     if (!isArticleExist) {
    //         throw new NotFoundError('Article not found');
    //     }

    //     const tagToRemove = isArticleExist.kie_tag.filter(tag => !kiePayload.tag.includes(tag.name));
    //     const tagToAdd = kiePayload.tag.filter(tag => !isArticleExist.kie_tag.map(tag => tag.name).includes(tag));
    //     const { tags: tagToAddOnDB } = await this.makeSureTagExist(tagToAdd);


    //     console.log({ tagToAdd, tagToRemove, currentTag: isArticleExist.kie_tag, newTag: kiePayload.tag });


    //     const article = await this.prismaClient.kIEContent.update({
    //         where: {
    //             id: articleId
    //         },
    //         data: {
    //             title: kiePayload.title,
    //             updated_by: kiePayload.updatedBy,
    //             description: kiePayload.description,
    //             article: {
    //                 update: {
    //                     data: {
    //                         Content: kiePayload.content,
    //                         thumbnail_url: kiePayload.thumbnailUrl,
    //                         banner_url: kiePayload.bannerUrl
    //                     },
    //                     where: {
    //                         id: articleId
    //                     }
    //                 }
    //             },
    //             kie_tag: {
    //                 disconnect: tagToRemove.map(tag => ({
    //                     id: tag.id
    //                 })),
    //                 connect: tagToAddOnDB.map(tag => ({
    //                     id: tag.id
    //                 }))
    //             }
    //         },
    //         include: {
    //             article: true,
    //             user: true,
    //             kie_tag: true,
    //             kie_type: true
    //         }
    //     });

    //     return {
    //         article
    //     }
    // }

    async createKIEPoster(payload: ICreateKIEPoster & { tag: string[] }) {
        const { tags } = await this.makeSureTagExist(payload.tag);
        const kiePoster = await this.prismaClient.kIEContent.create({
            data: {
                title: payload.title,
                updated_by: payload.updatedBy,
                created_by: payload.createdBy,
                description: payload.description,
                type: 2,
                poster: {
                    create: {
                        thumbnail_url: payload.thumbnailUrl,
                        image_url: payload.imageUrl
                    }
                },
                kie_tag: {
                    connectOrCreate: tags.map(tag => {
                        return {
                            where: {
                                id: tag.id
                            },
                            create: {
                                name: tag.name
                            }
                        }
                    })
                }
            }
        });

        return { poster: kiePoster }
    }

    async getKiePosterById(posterId: number) {
        const poster = await this.prismaClient.kIEContent.findFirst({
            where: {
                id: posterId
            },
            include: {
                poster: true,
                user: true,
                kie_type: true,
                kie_tag: true
            }
        });
        return { poster };
    }

    async deleteKiePosterById(posterId: number) {
        const { poster: isPosterExist } = await this.getKiePosterById(posterId);
        if (!isPosterExist) {
            throw new NotFoundError('Poster not found');
        }
        const deletedPoster = await this.prismaClient.kIEContent.delete({
            where: {
                id: posterId
            },
            include: {
                poster: true,
                user: true,
                kie_type: true
            }
        });

        return { poster: deletedPoster }
    }

    async updateKiePosterById(posterId: number, payload: ICreateKIEPoster & { tag: string[] }) {
        const { poster: isPosterExist } = await this.getKiePosterById(posterId);
        if (!isPosterExist) {
            throw new NotFoundError('Poster not found');
        }

        const tagToRemove = isPosterExist.kie_tag.filter(tag => !payload.tag.includes(tag.name));
        const tagToAdd = payload.tag.filter(tag => !isPosterExist.kie_tag.map(tag => tag.name).includes(tag));
        const { tags: tagToAddOnDB } = await this.makeSureTagExist(tagToAdd);

        const poster = await this.prismaClient.kIEContent.update({
            where: {
                id: posterId
            },
            data: {
                title: payload.title,
                updated_by: payload.updatedBy,
                description: payload.description,
                poster: {
                    update: {
                        data: {
                            thumbnail_url: payload.thumbnailUrl,
                            image_url: payload.imageUrl
                        },
                        where: {
                            id: posterId
                        }
                    }
                },
                kie_tag: {
                    disconnect: tagToRemove.map(tag => ({
                        id: tag.id
                    })),
                    connect: tagToAddOnDB.map(tag => ({
                        id: tag.id
                    }))
                }
            },
            include: {
                poster: true,
                user: true,
                kie_tag: true,
                kie_type: true
            }
        });

        return { poster }
    }
};