console.log('This is meet.js file.');

(async () => {
  const peer = new Peer();
  const peerId = await getPeerId(peer);

  const localStream = await getLocalStream();
  addVideo(peerId, localStream);

  // Khi có ai đó gửi yêu cầu kết nối
  peer.on('call', (call) => {
    // Truyền lại stream cho họ
    call.answer(localStream);
    // Lắng nghe khi họ gửi stream tới
    call.on('stream', (remoteStream) => {
      addVideo(call.peer, remoteStream);
    });
  });

  const socket = new WebSocket('ws://localhost:3000');

  socket.onopen = async () => {
    socket.send(
      JSON.stringify({
        type: 'joined',
        data: {
          roomId: 'something',
          name: Math.random().toString(),
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

    console.log(message);

    switch (message.type) {
      case 'users':
        saveData('users', message.data);
        break;

      case 'new-peer':
        // Yêu cầu kết nối và truyền stream tới cho người mới
        const call = peer.call(message.data.peerId, localStream);
        call.on('stream', (remoteStream) => {
          addVideo(call.peer, remoteStream);
        });
        break;

      case 'left':
        removeVideo(message.data.peerId);
        break;

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
})();
// chat
(function () {
  const messages = document.querySelector('#messages');
  const messageBox = document.querySelector('#messageBox');

  let ws;

  function showMessage(message) {
    messages.innerHTML += `<p><b>Player</b>: ${message}</p>`;
    messages.scrollTop = messages.scrollHeight;
    messageBox.value = '';
  }

  function init() {
    if (ws) {
      ws.onerror = ws.onopen = ws.onclose = null;
      ws.close();
    }

    ws = new WebSocket('ws://localhost:3000/meet');
    ws.onopen = () => {
      console.log('Connection opened!');
    };
    ws.onmessage = ({ data }) => {
      if (data.includes('"type":"joined"')) {
        showMessage('joined');
      } else {
        showMessage(data);
      }
    };
    ws.onclose = function () {
      ws = null;
    };
  }

  document.body.addEventListener('keydown', function (e) {
    if (e.ctrlKey && e.keyCode == 13) {
      if (!ws) {
        showMessage('No WebSocket connection :(');
        return;
      }

      ws.send(messageBox.value);
      showMessage(messageBox.value);
    }
  });

  init();
})();

function addVideo(clientId, stream) {
  if (!document.getElementById(clientId)) {
    const video = document.createElement('video');
    video.id = clientId;
    video.srcObject = stream;
    video.playsInline = true;
    video.autoplay = true;
    const gridVideo = document.querySelector('.grid-video');
    gridVideo.appendChild(video);
  }
}

function removeVideo(clientId) {
  const video = document.getElementById(clientId);
  if (video) video.remove();
}

function getLocalStream() {
  return navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true,
  });
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
