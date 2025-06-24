import User from "../Models/Users"
export class userService {

    async create(userData: {name: string; email: string; password: string;}){
        const existingUser = await User.count({
            where: { email: userData.email},
        });
        if ( existingUser > 0) throw {status: 400, message: "User already exists"};

        const createdUser = await User.create(userData);
        return User.findByPk(createdUser.id);
    }

    async getUser(email: string,) {
        const user = await User.findByPk(email);
        if (user === null) throw { status: 404, message: "User not found"};
        return user;
    }

    async update(id: number, userData: Partial<User> ){
        const user = await User.findByPk(id);
        if (user === null) throw { status: 404, message: "User not Found"};

        if (userData.email && userData.email != user.email){
            const existingUser = await User.findOne({
                where: { email: userData.email},
            });
            if (existingUser) throw { status: 400, message: "User already exists"};
        }

        return await user.update(userData);
    }

    async delete(id: number){
        const user = await User.findByPk(id);
        if (user === null) throw { status: 404, message: "User not found"};
        await user.destroy();
    }
}


export default new userService();