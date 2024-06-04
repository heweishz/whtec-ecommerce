let users = [];

const configureSocket = (io) => {
  io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('newUser', (user) => {
      const existingUserIndex = users.findIndex((u) => u.name === user.name);

      if (existingUserIndex !== -1) {
        // Update socket ID for the existing user
        users[existingUserIndex].socketId = socket.id;
        users[existingUserIndex].show = true; // Set show property to true
      } else {
        // Add new user with initial score of 0
        user.socketId = socket.id;
        user.score = 0;
        user.show = true; // Set show property to true
        users.push(user);
      }

      io.emit(
        'updateBoard',
        users.filter((user) => user.show)
      );
    });

    socket.on('updateScore', ({ clickerName, clickedName }) => {
      const clickerIndex = users.findIndex((u) => u.name === clickerName);
      const clickedIndex = users.findIndex((u) => u.name === clickedName);

      if (
        clickerIndex !== -1 &&
        clickedIndex !== -1 &&
        clickerIndex !== clickedIndex
      ) {
        users[clickerIndex].score -= 1;
        users[clickedIndex].score += 1;
        io.emit(
          'updateBoard',
          users.filter((user) => user.show)
        );
      }
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected');
      const disconnectedUserIndex = users.findIndex(
        (u) => u.socketId === socket.id
      );
      if (disconnectedUserIndex !== -1) {
        // Set show property to false for disconnected user
        users[disconnectedUserIndex].show = false;

        // Check if all users have disconnected
        const activeUsers = users.filter((user) => user.show);
        if (activeUsers.length === 0) {
          // Reset scores to zero
          users.forEach((user) => (user.score = 0));
        }

        io.emit(
          'updateBoard',
          users.filter((user) => user.show)
        );
      }
    });

    // Send the current users list to the newly connected client
    socket.emit(
      'updateBoard',
      users.filter((user) => user.show)
    );
  });
};

export default configureSocket;
