const countdownTargets = document.querySelectorAll('[data-countdown-date]');

/**
 * Renders a D-day style countdown text (D-23) or 오늘 if 0 days left.
 * The string is returned in Korean to match the invitation tone.
 */
function renderCountdown(targetEl) {
  const targetDate = targetEl.getAttribute('data-countdown-date');
  if (!targetDate) return;

  const end = new Date(targetDate);
  const now = new Date();
  const diff = end.setHours(0, 0, 0, 0) - now.setHours(0, 0, 0, 0);

  if (Number.isNaN(diff)) {
    targetEl.textContent = '';
    return;
  }

  const days = Math.round(diff / (1000 * 60 * 60 * 24));

  if (days > 0) {
    targetEl.textContent = `D-${days}`;
  } else if (days < 0) {
    targetEl.textContent = '새로운 시작을 함께 축하해주셔서 감사합니다';
  } else {
    targetEl.textContent = '오늘, 우리의 날이에요';
  }
}

countdownTargets.forEach((node) => renderCountdown(node));

// Enable smooth scrolling when clicking floating navigation links.
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', (event) => {
    const id = anchor.getAttribute('href')?.slice(1);
    const target = id ? document.getElementById(id) : null;
    if (!target) return;

    event.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

const galleryTiles = Array.from(document.querySelectorAll('.gallery-tile'));
let lightbox;
let lightboxImage;
let lightboxCloseButton;
let lightboxPrevButton;
let lightboxNextButton;
let lastFocusedElement;
let currentGalleryIndex = -1;

function createLightbox() {
  if (lightbox) return;

  lightbox = document.createElement('div');
  lightbox.className = 'gallery-lightbox';
  lightbox.setAttribute('role', 'dialog');
  lightbox.setAttribute('aria-modal', 'true');
  lightbox.innerHTML = `
    <button type="button" class="gallery-lightbox__nav gallery-lightbox__nav--prev" aria-label="이전 사진 보기">&#10094;</button>
    <figure class="gallery-lightbox__figure">
      <button type="button" class="gallery-lightbox__close" aria-label="사진 닫기">&times;</button>
      <img class="gallery-lightbox__image" alt="확대된 사진">
    </figure>
    <button type="button" class="gallery-lightbox__nav gallery-lightbox__nav--next" aria-label="다음 사진 보기">&#10095;</button>
  `;

  lightboxImage = lightbox.querySelector('.gallery-lightbox__image');
  lightboxCloseButton = lightbox.querySelector('.gallery-lightbox__close');
  lightboxPrevButton = lightbox.querySelector('.gallery-lightbox__nav--prev');
  lightboxNextButton = lightbox.querySelector('.gallery-lightbox__nav--next');

  lightbox.addEventListener('click', (event) => {
    if (event.target === lightbox) {
      closeLightbox();
    }
  });

  lightboxCloseButton.addEventListener('click', () => {
    closeLightbox();
  });

  lightboxPrevButton.addEventListener('click', () => {
    showPreviousImage();
  });

  lightboxNextButton.addEventListener('click', () => {
    showNextImage();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && lightbox?.classList.contains('gallery-lightbox--visible')) {
      event.preventDefault();
      closeLightbox();
    } else if (event.key === 'ArrowRight' && lightbox?.classList.contains('gallery-lightbox--visible')) {
      event.preventDefault();
      showNextImage();
    } else if (event.key === 'ArrowLeft' && lightbox?.classList.contains('gallery-lightbox--visible')) {
      event.preventDefault();
      showPreviousImage();
    }
  });

  document.body.appendChild(lightbox);
}

function openLightbox(tile) {
  const imagePath = tile.getAttribute('data-image');
  if (!imagePath) return;

  createLightbox();
  lastFocusedElement = document.activeElement;
  currentGalleryIndex = galleryTiles.indexOf(tile);
  updateLightboxImage(imagePath);
  lightbox.classList.add('gallery-lightbox--visible');
  document.body.classList.add('lightbox-open');
  lightboxCloseButton.focus();
}

function closeLightbox() {
  if (!lightbox) return;
  lightbox.classList.remove('gallery-lightbox--visible');
  document.body.classList.remove('lightbox-open');
  lightboxImage.src = '';
  currentGalleryIndex = -1;
  if (lastFocusedElement) {
    lastFocusedElement.focus();
  }
}

function updateLightboxImage(path) {
  if (!lightboxImage) return;
  lightboxImage.src = path;
}

function showImageAt(index) {
  if (index < 0) {
    index = galleryTiles.length - 1;
  } else if (index >= galleryTiles.length) {
    index = 0;
  }
  const tile = galleryTiles[index];
  const path = tile.getAttribute('data-image');
  if (!path) return;
  currentGalleryIndex = index;
  updateLightboxImage(path);
}

function showNextImage() {
  if (currentGalleryIndex === -1) return;
  showImageAt(currentGalleryIndex + 1);
}

function showPreviousImage() {
  if (currentGalleryIndex === -1) return;
  showImageAt(currentGalleryIndex - 1);
}

galleryTiles.forEach((tile, index) => {
  tile.setAttribute('data-gallery-index', index);
  tile.addEventListener('click', () => openLightbox(tile));
  tile.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openLightbox(tile);
    }
  });
});

const KAKAO_MAP_APP_KEY = '9ad6190b5a0e195986e9a8277530effb';

function markMapReady(mapTarget) {
  const wrapper = mapTarget.closest('.map-placeholder');
  if (!wrapper) return;

  wrapper.classList.add('map-placeholder--ready');
  const notice = wrapper.querySelector('.map-placeholder__notice');
  if (notice) {
    notice.setAttribute('hidden', 'hidden');
  }

  mapTarget.removeAttribute('hidden');
}

function renderStaticMap(mapTarget) {
  if (!mapTarget) return false;

  const imageSrc = (mapTarget.dataset.image || '').trim();
  if (!imageSrc) return false;

  const wrapper = mapTarget.closest('.map-placeholder');
  if (!wrapper) return false;

  let imageEl = wrapper.querySelector('.map-placeholder__image');
  if (!imageEl) {
    imageEl = document.createElement('img');
    imageEl.className = 'map-placeholder__image';
    mapTarget.insertAdjacentElement('afterend', imageEl);
  }

  imageEl.src = imageSrc;
  imageEl.alt = mapTarget.dataset.imageAlt || '행사장 약도 이미지';
  imageEl.removeAttribute('hidden');

  mapTarget.setAttribute('hidden', 'hidden');
  wrapper.classList.add('map-placeholder--ready', 'map-placeholder--static');

  const notice = wrapper.querySelector('.map-placeholder__notice');
  if (notice) {
    notice.setAttribute('hidden', 'hidden');
  }

  return true;
}

function initKakaoMap() {
  if (!window.kakao || !window.kakao.maps) return;

  const mapTarget = document.getElementById('kakao-map');
  if (!mapTarget) return;

  const lat = 37.5281285720486;
  const lng = 126.91993957616876;
  const zoom = parseInt(mapTarget.dataset.zoom || '16', 10);
  const level = Math.max(1, Math.min(14, 20 - zoom));
  const center = new kakao.maps.LatLng(lat, lng);

  const map = new kakao.maps.Map(mapTarget, {
    center,
    level,
    draggable: true,
    scrollwheel: true,
    disableDoubleClickZoom: false,
  });

  const zoomControl = new kakao.maps.ZoomControl();
  map.addControl(zoomControl, kakao.maps.ControlPosition.RIGHT);

  const mapTypeControl = new kakao.maps.MapTypeControl();
  map.addControl(mapTypeControl, kakao.maps.ControlPosition.TOPRIGHT);

  const marker = new kakao.maps.Marker({
    position: center,
    map,
  });
  marker.setPosition(center);

  const overlayContent = document.createElement('div');
  overlayContent.className = 'map-overlay';
  overlayContent.innerHTML = `
    <h3 class="map-overlay__title">더파티움 여의도</h3>
    <p class="map-overlay__address">서울 영등포구 은행로 30<br><span>(중소기업중앙회관 2층)</span></p>
    <a class="map-overlay__link" href="https://map.kakao.com/link/to/%EB%8D%94%ED%8C%8A%ED%8B%B0%EC%9B%80%20%EC%97%AC%EC%9D%98%EB%8F%84,37.5258,126.9271" target="_blank" rel="noopener">길찾기</a>
  `;

  const overlay = new kakao.maps.CustomOverlay({
    content: overlayContent,
    position: center,
    xAnchor: 0.5,
    yAnchor: 1.35,
  });

  overlay.setMap(map);

  markMapReady(mapTarget);
    setTimeout(() => {
    map.relayout();
    map.setCenter(center);
  }, 100);
}

function handleKakaoMapError() {
  const mapTarget = document.getElementById('kakao-map');
  if (renderStaticMap(mapTarget)) {
    return;
  }

  const notice = document.querySelector('.map-placeholder__notice');
  if (notice) {
    notice.removeAttribute('hidden');
    notice.textContent = '카카오 지도를 불러오지 못했습니다. JavaScript 키와 허용 도메인을 확인해주세요.';
  }
}

function loadKakaoMap() {
  const mapTarget = document.getElementById('kakao-map');
  if (!mapTarget) return;

  const hasKey = KAKAO_MAP_APP_KEY && KAKAO_MAP_APP_KEY !== 'YOUR_KAKAO_MAP_APP_KEY';
  if (!hasKey) {
    renderStaticMap(mapTarget);
    return;
  }

  const existingScript = document.querySelector('script[data-kakaomap]');
  if (existingScript) {
    if (window.kakao && window.kakao.maps) {
      window.kakao.maps.load(initKakaoMap);
    }
    return;
  }

  const script = document.createElement('script');
  script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_MAP_APP_KEY}&autoload=false`;
  script.async = true;
  script.defer = true;
  script.dataset.kakaomap = 'true';
  script.onload = () => {
    if (window.kakao && window.kakao.maps) {
      window.kakao.maps.load(initKakaoMap);
    }
  };
  script.onerror = handleKakaoMapError;
  document.head.appendChild(script);
}

loadKakaoMap();

// Calendar button platform handling
const calendarButton = document.getElementById('calendar-button');
if (calendarButton) {
  const googleUrl = calendarButton.getAttribute('data-google');
  const appleUrl = calendarButton.getAttribute('data-apple');
  const ua = navigator.userAgent || navigator.vendor || window.opera || '';
  const isApple = /iPad|iPhone|iPod|Macintosh/.test(ua) && !window.MSStream;
  const isAndroid = /Android/.test(ua);

  if (isApple && appleUrl) {
    calendarButton.href = appleUrl;
    calendarButton.setAttribute('download', appleUrl.split('/').pop() || 'event.ics');
    calendarButton.textContent = 'Apple 캘린더에 추가';
    calendarButton.removeAttribute('target');
    calendarButton.removeAttribute('rel');
  } else {
    calendarButton.href = googleUrl || '#';
    calendarButton.removeAttribute('download');
    if (googleUrl) {
      calendarButton.setAttribute('target', '_blank');
      calendarButton.setAttribute('rel', 'noopener');
    }
    calendarButton.textContent = 'Google 캘린더에 추가';

    calendarButton.addEventListener('click', (event) => {
      if (!googleUrl) {
        event.preventDefault();
      }
    });
  }
}
