(function () {
  const socketIO = io('/');
  const meet = new Peer(undefined, {});
  const peers = {};
  let usersList = {};

  const videosBox = document.getElementById('video-grid');
  const participants = document.getElementById('participants-count');

  // viewer data
  const viewerData = {
    id: undefined,
    name: decodeURIComponent('displayName'),
    mic: true,
    video: true,
  };

  // meet connected
  meet.on('open', async function (viewerId) {
    // get viewer stream
    const viewerStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    viewerData.id = viewerId;

    // create viewer video element and append to videos box
    const videoCard = createVideo(viewerStream, 'Me', viewerId);
    videoCard.querySelector('.user-video').muted = true;
    videosBox.appendChild(videoCard);

    console.log('Meet opened');

    // notify server that I'm joining
    socketIO.emit('joined', roomId, viewerData);

    // on server response users list
    socketIO.on('users', function (users) {
      usersList = users;
      console.log(users);
    });

    // on someone call me
    meet.on('call', function (call) {
      console.log('Answer to ' + usersList[call.peer]?.name);

      peers[call.peer] = call;
      const participants = document.getElementById('participants-count');
      participants.innerText = Object.keys(peers).length + 1;
      call.answer(viewerStream);
      call.on('stream', function (stream) {
        console.log(stream);
        if (!document.getElementById(call.peer)) {
          const peerVideo = createVideo(stream, usersList[call.peer]?.name, call.peer);
          videosBox.appendChild(peerVideo);
          if (!usersList[call.peer]?.video) {
            toggleUserVideo(call.peer);
          }
          if (!usersList[call.peer]?.mic) {
            toggleUserAudio(call.peer);
          }
        } else document.querySelector('[id="' + call.peer + '"] video').srcObject = stream;
      });
    });

    // on someone connect
    socketIO.on('connected', function (userData) {
      console.log(userData.name + ' connected');
      const call = meet.call(userData.id, viewerStream);
      peers[userData.id] = call;
      participants.innerText = Object.keys(peers).length + 1;
      call.on('stream', function (stream) {
        console.log(stream);

        if (!document.getElementById(userData.id)) {
          const video = createVideo(stream, userData.name, userData.id);
          videosBox.appendChild(video);
        } else document.querySelector('[id="' + userData.id + '"] video').srcObject = stream;
      });
    });

    socketIO.on('left', function (userData) {
      console.log('Someone left: ', userData);
      const userVideo = document.querySelector('.user-video-card-parent[id="' + userData.id + '"]');
      userVideo.remove();
    });
  });

  // on end call
  // const endCallButton = document.getElementById('end_call');
  // endCallButton.onclick = function () {
  //   window.location.href = '/end';
  // };
})();

function createVideo(stream, userName = 'Unknown', userId = 'Unknown', userIconClass = '') {
  const videoCard = {
    tag: 'div',
    attributes: {
      class: 'col-sm-12 col-md-8 col-lg-6 col-xl-3 user-video-card-parent active',
      id: userId,
    },
    children: [
      {
        tag: 'div',
        attributes: {
          class: 'user-video-card',
        },
        children: [
          {
            tag: 'div',
            attributes: {
              class: 'video-background',
            },
            children: [
              {
                tag: 'video',
                attributes: {
                  class: 'user-video',
                  playsinline: true,
                  control: false,
                  autoplay: true,
                  muted: false,
                  srcObject: stream,
                },
                children: [],
              },
            ],
          },
        ],
      },
    ],
  };
  return createElement(videoCard);
}

function createElement(element) {
  const elementTag = document.createElement(element.tag);
  if (element.text) {
    elementTag.innerText = element.text;
  }
  if (element.attributes) {
    for (let key in element.attributes) {
      if (key === 'srcObject') {
        elementTag.srcObject = element.attributes[key];
      } else elementTag.setAttribute(key, element.attributes[key]);
    }
  }
  if (element.events) {
    for (let key in element.events) {
      elementTag.addEventListener(key, element.events[key]);
    }
  }
  if (element.children) {
    for (let child of element.children) {
      elementTag.appendChild(createElement(child));
    }
  }
  return elementTag;
}
