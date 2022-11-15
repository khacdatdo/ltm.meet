(function () {
  navigator.mediaDevices
    .getUserMedia({
      video: true,
      audio: true,
    })
    .then(function (stream) {
      const video = document.getElementById('preview-video');
      video.srcObject = stream;
      video.play();
    });

  const btn = document.getElementById('btn-join');
  btn.onclick = function () {
    const name = document.querySelector('[name=display_name]').value;
    if (!name) {
      alert('Vui lòng điền tên');
      return;
    }
    document.cookie = 'display_name=' + encodeURIComponent(name) + ';path=/;';
    window.location.href = '/' + btn.getAttribute('room-id');
  };
})();
