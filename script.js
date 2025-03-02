document.addEventListener("DOMContentLoaded", function() {
  const audioToggle = document.getElementById('audioToggle');
  const backgroundAudio = document.getElementById('backgroundAudio');

  if (localStorage.getItem('audioState') === 'on') {
    backgroundAudio.play().catch(e => console.log("Аудио не может автозапуститься: ", e));
    if (audioToggle) {
      audioToggle.textContent = 'Выключить музыку';
    }
  } else {
    if (audioToggle) {
      audioToggle.textContent = 'Включить музыку';
    }
  }

  if (audioToggle && backgroundAudio) {
    audioToggle.addEventListener('click', function() {
      if (backgroundAudio.paused) {
        backgroundAudio.play().then(() => {
          localStorage.setItem('audioState', 'on');
          audioToggle.textContent = 'Выключить музыку';
        }).catch(e => console.log("Ошибка воспроизведения аудио: ", e));
      } else {
        backgroundAudio.pause();
        localStorage.setItem('audioState', 'off');
        audioToggle.textContent = 'Включить музыку';
      }
    });
  }

  function updateAudioPosition() {
      const header = document.querySelector('header');
      const audioBlock = document.querySelector('.persistent-audio');
      const content = document.querySelector('main');
      if (header && audioBlock && content) {
        const headerRect = header.getBoundingClientRect();
        const contentRect = content.getBoundingClientRect();
        const headerBottom = headerRect.bottom;
        const contentUpper = contentRect.top;
        const pos = (headerBottom + contentUpper) / 2 + window.pageYOffset; 
        audioBlock.style.position = 'absolute';
        audioBlock.style.top = (pos) + 'px';
        audioBlock.style.left = '0';
        audioBlock.style.right = '0';
        audioBlock.style.textAlign = 'center';
      }
    }
    
  updateAudioPosition();
  const contentContainer = document.getElementById('pageContent');

  function loadContent(url) {
    fetch(url)
      .then(response => {
        if (!response.ok) {
          throw new Error("Ошибка сети: " + response.status);
        }
        return response.text();
      })
      .then(html => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const newContent = doc.getElementById('pageContent');
        if (newContent) {
          contentContainer.innerHTML = newContent.innerHTML;
          history.pushState(null, "", url);
          attachDynamicLinks();
          updateAudioPosition();
          const globalAudio = document.querySelector('.persistent-audio');
          if (url.indexOf("pashalko.html") !== -1) {
            if (globalAudio) {
              globalAudio.style.display = 'none';
            }
          } else {
            if (globalAudio) {
              globalAudio.style.display = 'block';
            }
          }
        } else {
          console.error("В загруженном документе отсутствует контейнер с id 'pageContent': " + url);
        }
      })
      .catch(error => console.error("Ошибка загрузки " + url + ": ", error));
  }
  
    
    
    
    
  function attachDynamicLinks() {
    const girlLinks = contentContainer.querySelectorAll('.girl-card') || contentContainer.querySelectorAll('.pashalko');
    girlLinks.forEach(link => {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        const targetUrl = this.getAttribute('href');
        loadContent(targetUrl);
      });
    });
    const backBtn = contentContainer.querySelector('#backBtn');
    if (backBtn) {
      backBtn.addEventListener('click', function() {
        loadContent('main.html');
      });
    }
    const prevBtn = contentContainer.querySelector('#prevBtn');
    if (prevBtn) {
      const prevUrl = prevBtn.getAttribute('data-prev');
      if (prevUrl) {
        prevBtn.addEventListener('click', function() {
          loadContent(prevUrl);
        });
      }
    }
    const nextBtn = contentContainer.querySelector('#nextBtn');
    if (nextBtn) {
      const nextUrl = nextBtn.getAttribute('data-next');
      if (nextUrl) {
        nextBtn.addEventListener('click', function() {
          loadContent(nextUrl);
        });
      }
    }
  }
  attachDynamicLinks();
  updateAudioPosition();

  window.addEventListener("popstate", function() {
    loadContent(location.pathname);
  });
  window.addEventListener('resize', updateAudioPosition);
});
