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

const showSettings = () => {
  const meetSettings = document.getElementById('meet-settings');
  if (meetSettings.classList.contains('active')) {
    meetSettings.classList.remove('active');
  } else {
    meetSettings.classList.add('active');
  }
};

const hideSettings = () => {
  const meetSettings = document.getElementById('meet-settings');
  meetSettings.classList.remove('active');
};

const chooseVoice = () => {
  const voice = document.getElementById('voice-settings');
  const video = document.getElementById('video-settings');
  const voiceTab = document.getElementById('meet-settings__tab-voice');
  const videoTab = document.getElementById('meet-settings__tab-video');
  voice.classList.add('active');
  video.classList.remove('active');
  voiceTab.classList.add('active');
  videoTab.classList.remove('active');
};

const chooseVideo = () => {
  const voice = document.getElementById('voice-settings');
  const video = document.getElementById('video-settings');
  const voiceTab = document.getElementById('meet-settings__tab-voice');
  const videoTab = document.getElementById('meet-settings__tab-video');
  video.classList.add('active');
  voice.classList.remove('active');
  voiceTab.classList.remove('active');
  videoTab.classList.add('active');
};

const muteMicro = () => {
  const micro = document.getElementById('icon-micro');
  if (micro.classList.contains('active')) {
    micro.classList.remove('active');
  } else {
    micro.classList.add('active');
  }
};

const muteVideo = () => {
  const video = document.getElementById('icon-video');
  if (video.classList.contains('active')) {
    video.classList.remove('active');
  } else {
    video.classList.add('active');
  }
};

const shareScreen = () => {
  const meetVideo = document.getElementById('meet-video');
  if (meetVideo.classList.contains('active-stream')) {
    meetVideo.classList.remove('active-stream');
  } else {
    meetVideo.classList.add('active-stream');
  }
};
