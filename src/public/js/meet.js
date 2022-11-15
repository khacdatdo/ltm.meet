console.log('This is meet.js file.');

(async () => {
  const peer = new Peer();
  const peerId = await getPeerId(peer);

  /**
   * Lưu trữ các cuộc gọi
   */
  const callers = [];

  /**
   * Danh sách devices
   */
  const localMediaDevices = await navigator.mediaDevices.enumerateDevices();

  /**
   * Settings
   */
  const settingsDeviceIds = {
    micro: {
      deviceId: localMediaDevices.find((d) => d.kind === 'audioinput')?.deviceId,
      enabled: true,
    },
    speaker: {
      deviceId: localMediaDevices.find((d) => d.kind === 'audiooutput')?.deviceId,
    },
    camera: {
      deviceId: localMediaDevices.find((d) => d.kind === 'videoinput')?.deviceId,
      enabled: true,
    },
  };

  const localStream = await getLocalStream({
    audio: {
      deviceId: settingsDeviceIds.micro,
    },
    video: {
      deviceId: settingsDeviceIds.camera,
    },
  });
  addVideo(peerId, localStream);

  // Khi có ai đó gửi yêu cầu kết nối
  peer.on('call', (call) => {
    callers.push(call);

    // Truyền lại stream cho họ
    call.answer(localStream);
    // Lắng nghe khi họ gửi stream tới
    call.on('stream', (remoteStream) => {
      addVideo(call.peer, remoteStream, settingsDeviceIds.speaker);
    });
  });

  const socket = new WebSocket('ws://localhost:3000');

  socket.onopen = async () => {
    socket.send(
      JSON.stringify({
        type: 'joined',
        data: {
          roomId: document.getElementById('room-info').getAttribute('room-id'),
          name: document.getElementById('room-info').getAttribute('display-name'),
          peerId,
        },
      })
    );
  };

  socket.onmessage = async (e) => {
    let message = null;
    try {
      message = JSON.parse(e.data);
    } catch (error) {
      return;
    }

    switch (message.type) {
      case 'users':
        saveData('users', message.data);
        break;

      case 'new-peer':
        // Yêu cầu kết nối và truyền stream tới cho người mới
        const call = peer.call(message.data.peerId, localStream);
        callers.push(call);
        call.on('stream', (remoteStream) => {
          addVideo(call.peer, remoteStream, settingsDeviceIds.speaker);
        });
        break;

      case 'left':
        removeVideo(message.data.peerId);
        break;

      case 'chat':
        showMessage(message.data.senderName, message.data.message);

      default:
        break;
    }
  };

  socket.onerror = (e) => {
    console.log('Error', e);
  };

  socket.onclose = (e) => {
    console.log('Close', e);
  };

  /**
   * =======================================================
   * Các sự kiện khác của người dùng
   * =======================================================
   */

  /**
   * Sự kiện khi ấn Ctrl Enter tại ô chat
   */
  document.body.addEventListener('keydown', function (e) {
    if (e.ctrlKey && e.keyCode == 13) {
      if (!socket) {
        showMessage('No WebSocket connection :(');
        return;
      }

      socket.send(
        JSON.stringify({
          type: 'chat',
          data: {
            message: messageBox.value,
          },
        })
      );
      showMessage('Me', messageBox.value);
    }
  });

  /**
   * Sự kiện bật/tắt mic
   */
  document.getElementById('icon-micro').addEventListener('click', () => {
    localStream.getAudioTracks().forEach((track) => {
      track.enabled = !track.enabled;
    });
    muteMicro();
  });

  /**
   * Sự kiện bật/tắt camera
   */
  document.getElementById('icon-video').addEventListener('click', () => {
    localStream.getVideoTracks().forEach((track) => {
      track.enabled = !track.enabled;
    });
    muteVideo();
  });

  /**
   * Sự kiện mở tab Settings
   */
  document.getElementById('icon-settings').addEventListener('click', async () => {
    const element = showSettings();
    if (element && element.classList.contains('active')) {
      const devices = await navigator.mediaDevices.enumerateDevices();

      // Cập nhật danh sách thiết bị
      // -> Mircro
      const micros = devices.filter((d) => d.kind === 'audioinput');
      const selectMicro = document.getElementById('select-micro');
      selectMicro.innerHTML = '';
      selectMicro.append(
        ...renderOptionList(
          micros.map((m) => ({
            label: m.label,
            value: m.deviceId,
          })),
          settingsDeviceIds.micro.deviceId
        )
      );
      // -> Speakers
      const speakers = devices.filter((d) => d.kind === 'audiooutput');
      const selectSpeaker = document.getElementById('select-speaker');
      selectSpeaker.innerHTML = '';
      selectSpeaker.append(
        ...renderOptionList(
          speakers.map((s) => ({
            label: s.label,
            value: s.deviceId,
          })),
          settingsDeviceIds.speaker.deviceId
        )
      );
      // Cameras
      const cameras = devices.filter((d) => d.kind === 'videoinput');
      const selectCamera = document.getElementById('select-camera');
      selectCamera.innerHTML = '';
      selectCamera.append(
        ...renderOptionList(
          cameras.map((c) => ({
            label: c.label,
            value: c.deviceId,
          })),
          settingsDeviceIds.camera.deviceId
        )
      );
    }
  });

  /**
   * Sự kiện thay đổi nguồn (micro, camera, speaker)
   */
  document.getElementById('select-micro').addEventListener('change', async (event) => {
    const newLocalStream = await getLocalStream({
      audio: {
        deviceId: event.target.value,
      },
    });
    if (newLocalStream) {
      settingsDeviceIds.micro.deviceId = event.target.value;
      localStream.removeTrack(localStream.getAudioTracks()[0]);
      localStream.addTrack(newLocalStream.getAudioTracks()[0]);
    }
  });
  document.getElementById('select-speaker').addEventListener('change', async (event) => {
    const videos = document.querySelectorAll('video');
    settingsDeviceIds.speaker.deviceId = event.target.value;
    videos.forEach((video) => {
      video.setSinkId(event.target.value);
    });
  });
  document.getElementById('select-camera').addEventListener('change', async (event) => {
    const newLocalStream = await getLocalStream({
      video: {
        deviceId: event.target.value,
      },
    });
    if (newLocalStream) {
      settingsDeviceIds.camera.deviceId = event.target.value;
      localStream.removeTrack(localStream.getVideoTracks()[0]);
      localStream.addTrack(newLocalStream.getVideoTracks()[0]);
      callers.forEach((call) => {
        call.peerConnection.getSenders()[1].replaceTrack(newLocalStream.getVideoTracks()[0]);
      });
    }
  });
})();

function addVideo(clientId, stream, speakerId = undefined) {
  if (!document.getElementById(clientId)) {
    const video = document.createElement('video');
    video.id = clientId;
    video.srcObject = stream;
    video.playsInline = true;
    video.autoplay = true;
    if (!speakerId) {
      video.muted = true;
      video.setSinkId(speakerId);
    }
    const gridVideo = document.querySelector('.grid-video');
    gridVideo.appendChild(video);
  }
}

function removeVideo(clientId) {
  const video = document.getElementById(clientId);
  if (video) video.remove();
}

async function getLocalStream(
  contraints = {
    video: true,
    audio: true,
  }
) {
  try {
    const stream = await navigator.mediaDevices.getUserMedia(contraints);
    return stream;
  } catch (error) {
    alert('Có lỗi trong khi lấy media stream.\n' + error);
    return null;
  }
}

function getPeerId(peer) {
  return new Promise((resolve) => {
    peer.on('open', (peerId) => resolve(peerId));
  });
}

function saveData(key = '', value = {}) {
  sessionStorage.setItem(key, JSON.stringify(value));
}

function getSavedData(key = '') {
  const rawData = sessionStorage.getItem(key);
  if (!rawData) return null;
  return JSON.parse(rawData);
}

function showMessage(name, message) {
  messages.innerHTML += `<p><b>${name}</b>: ${message}</p>`;
  messages.scrollTop = messages.scrollHeight;
  messageBox.value = '';
}

function renderOptionList(items = [], defaultValue = 'default') {
  return items.map((item) => {
    const option = document.createElement('option');
    option.label = item.label;
    option.value = item.value;
    if (option.value === defaultValue || items.length === 1) {
      option.selected = true;
    }
    return option;
  });
}
