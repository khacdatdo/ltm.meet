const showChat = () => {
  const meetChat = document.getElementById('meet-chat');
  if (meetChat.classList.contains('active')) {
    meetChat.classList.remove('active');
  } else {
    meetChat.classList.add('active');
  }
};

const hideChat = () => {
  const meetChat = document.getElementById('meet-chat');
  meetChat.classList.remove('active');
};
