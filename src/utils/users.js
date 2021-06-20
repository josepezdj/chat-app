const users = [];

const addUser = ({ id, username, room }) => {
    // Clean the data
    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase();

    // Validate the data

    if(!username || !room) {
        return {
            error: 'Username and Room are required!'
        }
    };

    // Check for existing user
    const existingUser = users.find(user => user.room === room && user.username === username);

    // Validate username
    if(existingUser) {
        return {
            error: 'Username already in use, please pick another one.'
        }
    };

    // Store user
    const user = { id, username, room };
    users.push(user);
    return { user }
};

const removeUser = (id) => {
    const index = users.findIndex(user => user.id === id);

    if(index !== -1) {
        return users.splice(index, 1)[0]
    }
}

const getUser = (id) => {
    const user = users.find(user => user.id === id)
    if(!user) {
        return {
            error: "User doesn't exist!"
        }
    }
    return user
};

const getUsersInRoom = (room) => {
    const result = users.filter(user => user.room === room);
    if(!result || result.length === 0) {
        return {
            error: 'No users found'
        }
    }
    return result
};

module.exports = {
    addUser,
    removeUser,
    getUsersInRoom,
    getUser
};