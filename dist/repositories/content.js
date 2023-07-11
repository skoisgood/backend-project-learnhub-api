"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.newRepositoryContent = void 0;
function newRepositoryContent(db) {
    return new RepositoryContent(db);
}
exports.newRepositoryContent = newRepositoryContent;
class RepositoryContent {
    constructor(db) {
        this.db = db;
    }
    async createContent(content) {
        // console.log(content);
        return await this.db.content.create({
            include: {
                postedBy: {
                    select: {
                        id: true,
                        username: true,
                        name: true,
                        registeredAt: true,
                    },
                },
            },
            data: {
                ...content,
                ownerId: undefined,
                postedBy: { connect: { id: content.ownerId } },
            },
        });
    }
    async getContentbyId(id) {
        return await this.db.content.findUnique({
            where: { id },
            include: {
                postedBy: {
                    select: {
                        id: true,
                        username: true,
                        name: true,
                        registeredAt: true,
                    },
                },
            },
        });
    }
    async getAllContents() {
        return await this.db.content.findMany({
            include: {
                postedBy: {
                    select: {
                        id: true,
                        username: true,
                        name: true,
                        registeredAt: true,
                    },
                },
            },
        });
    }
    async deleteContentByOwnerId(arg) {
        const content = await this.db.content.findFirst({
            where: { id: arg.id, ownerId: arg.ownerId },
        });
        if (!content)
            return Promise.reject(`no such content: ${arg.id}`);
        return await this.db.content.delete({
            include: {
                postedBy: {
                    select: {
                        id: true,
                        username: true,
                        name: true,
                        registeredAt: true,
                    },
                },
            },
            where: { id: arg.id },
        });
    }
    async updateContentByOwnerId(arg) {
        const content = await this.db.content.findFirst({
            where: { id: arg.id, ownerId: arg.ownerId },
        });
        if (!content)
            return Promise.reject(`no such content: ${arg.id}`);
        return await this.db.content.update({
            include: {
                postedBy: {
                    select: {
                        id: true,
                        username: true,
                        name: true,
                        registeredAt: true,
                        password: false,
                    },
                },
            },
            where: { id: arg.id },
            data: { comment: arg.comment, rating: arg.rating },
        });
    }
}
//# sourceMappingURL=content.js.map