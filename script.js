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

const GALLERY_PAGE_SIZE = 6;
const KAKAO_SHARE_KEY = '9ad6190b5a0e195986e9a8277530effb';
const galleryGrid = document.getElementById('gallery-grid') || document.querySelector('.gallery-grid');
const galleryPagination = document.getElementById('gallery-pagination') || document.querySelector('.gallery-pagination');
const galleryImages = [
  { src: 'photos/1.webp', variant: 'hero', alt: '사진 1' },
  { src: 'photos/2.webp', alt: '사진 2' },
  { src: 'photos/3.webp', variant: 'tall', alt: '사진 3' },
  { src: 'photos/4.webp', alt: '사진 4' },
  { src: 'photos/5.webp', variant: 'wide', alt: '사진 5' },
  { src: 'photos/6.webp', alt: '사진 6' },
  { src: 'photos/7.webp', alt: '사진 7' },
  { src: 'photos/8.webp', variant: 'tall', alt: '사진 8' },
  { src: 'photos/4.webp', alt: '사진 9' },
  { src: 'photos/5.webp', variant: 'wide', alt: '사진 10' },
  { src: 'photos/6.webp', alt: '사진 11' },
  { src: 'photos/1.webp', variant: 'hero', alt: '사진 12' }
];

let galleryTiles = [];
let lightbox;
let lightboxImage;
let lightboxCloseButton;
let lightboxPrevButton;
let lightboxNextButton;
let lastFocusedElement;
let currentGalleryIndex = -1;
let currentGalleryPage = 1;
let kakaoInitialized = false;

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
  if (galleryTiles.length === 0) return;
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

function bindGalleryTile(tile) {
  tile.addEventListener('click', () => openLightbox(tile));
  tile.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openLightbox(tile);
    }
  });
}

function renderGallery(page = 1) {
  if (!galleryGrid || galleryImages.length === 0) return;

  const totalPages = Math.max(1, Math.ceil(galleryImages.length / GALLERY_PAGE_SIZE));
  currentGalleryPage = Math.min(Math.max(page, 1), totalPages);
  const startIndex = (currentGalleryPage - 1) * GALLERY_PAGE_SIZE;
  const pageItems = galleryImages.slice(startIndex, startIndex + GALLERY_PAGE_SIZE);

  const fragment = document.createDocumentFragment();
  pageItems.forEach(({ src, variant, alt }, idx) => {
    const tile = document.createElement('div');
    tile.className = `gallery-tile${variant ? ` gallery-tile--${variant}` : ''}`;
    tile.style.setProperty('--gallery-image', `url('${src}')`);
    tile.dataset.image = src;
    tile.setAttribute('role', 'button');
    tile.setAttribute('tabindex', '0');
    tile.setAttribute('aria-label', `${alt || `사진 ${startIndex + idx + 1}`} 크게 보기`);
    fragment.appendChild(tile);
  });

  galleryGrid.innerHTML = '';
  galleryGrid.appendChild(fragment);
  galleryTiles = Array.from(galleryGrid.querySelectorAll('.gallery-tile'));
  galleryTiles.forEach((tile, index) => {
    tile.setAttribute('data-gallery-index', index);
    bindGalleryTile(tile);
  });

  updateGalleryPagination(totalPages);
}

function updateGalleryPagination(totalPages) {
  if (!galleryPagination) return;
  galleryPagination.innerHTML = '';
  if (totalPages <= 1) {
    galleryPagination.setAttribute('hidden', 'hidden');
    return;
  }
  galleryPagination.removeAttribute('hidden');

  for (let page = 1; page <= totalPages; page += 1) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `gallery-pagination__button${page === currentGalleryPage ? ' is-active' : ''}`;
    button.textContent = page;
    button.setAttribute('aria-label', `${page} 페이지 보기`);
    button.addEventListener('click', () => {
      renderGallery(page);
    });
    galleryPagination.appendChild(button);
  }
}

const gallerySection = document.getElementById('gallery');
let galleryRendered = false;

const io = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting && !galleryRendered) {
      renderGallery();
      galleryRendered = true;
      io.disconnect();
    }
  });
});
io.observe(gallerySection);

function copyText(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(text);
  }
  return new Promise((resolve, reject) => {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.top = '-9999px';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    try {
      document.execCommand('copy');
      resolve();
    } catch (error) {
      reject(error);
    } finally {
      document.body.removeChild(textarea);
    }
  });
}

function showCopyFeedback(button) {
  const originalHTML = button.innerHTML;

  button.innerHTML = '<span class="share-text">링크가 복사되었습니다</span>';

  setTimeout(() => {
    button.innerHTML = originalHTML;
  }, 1200);
}

document.querySelectorAll('.account-copy').forEach((button) => {
  button.addEventListener('click', () => {
    const value = button.getAttribute('data-account-number');
    if (!value) return;
    copyText(value)
      .then(() => showCopyFeedback(button))
      .catch(() => alert('복사에 실패했습니다. 다시 시도해주세요.'));
  });
});

const shareLinkButton = document.getElementById('share-link');
if (shareLinkButton) {
  shareLinkButton.addEventListener('click', async () => {
    const shareUrl = window.location.href;

    // 1) Web Share API 지원되면 시스템 공유창 먼저
    if (navigator.share) {
      try {
        await navigator.share({
          title: document.title,
          url: shareUrl,
        });
        return; // 성공했으면 끝
      } catch (err) {
        // 사용자가 취소했으면 그냥 아래 복사로 떨어지게 놔둠
        console.warn('share canceled or failed, fallback to copy', err);
      }
    }

    // 2) 지원 안 되거나 실패하면 기존 로직으로 복사
    copyText(shareUrl)
      .then(() => showCopyFeedback(shareLinkButton))
      .catch(() => alert('링크를 복사하지 못했습니다. 다시 시도해주세요.'));
  });
}
function initKakaoShare() {
  if (kakaoInitialized) return true;
  if (!window.Kakao) return false;
  if (!window.Kakao.isInitialized()) {
    window.Kakao.init(KAKAO_SHARE_KEY);
  }
  kakaoInitialized = true;
  return true;
}

const shareKakaoButton = document.getElementById('share-kakao');
if (shareKakaoButton) {
  shareKakaoButton.addEventListener('click', () => {
    if (!initKakaoShare()) {
      alert('카카오톡 공유 준비 중입니다. 잠시 후 다시 시도해주세요.');
      return;
    }
    const shareUrl = window.location.href;
    const shareTitle = document.title;
    window.Kakao.Share.sendDefault({
      objectType: 'feed',
      content: {
        title: shareTitle,
        description: '3월 8일 오후 12:10 여의도 더파티움',
        imageUrl: `${window.location.origin}/photos/1.webp`,
        link: {
          mobileWebUrl: shareUrl,
          webUrl: shareUrl
        }
      },
      buttons: [
        {
          title: '청첩장 열기',
          link: {
            mobileWebUrl: shareUrl,
            webUrl: shareUrl
          }
        }
      ]
    });
  });
}

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

  const lat = 37.52808497891688;
  const lng = 126.92279872448067;
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
;

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

document.addEventListener('DOMContentLoaded', () => {
  const overlay = document.getElementById('rsvp-overlay');
  if (!overlay) return;

  const closeBtn = document.getElementById('rsvp-overlay-close');
  const hideTodayCheckbox = document.getElementById('rsvp-hide-today');

  // 오늘 날짜 문자열 만들기 (YYYY-MM-DD)
  const today = new Date();
  const y = today.getFullYear();
  const m = String(today.getMonth() + 1).padStart(2, '0');
  const d = String(today.getDate()).padStart(2, '0');
  const todayStr = `${y}-${m}-${d}`;

  const HIDE_KEY = 'rsvpHideDate';

  // 저장된 날짜가 오늘이면 안 보이게
  const saved = localStorage.getItem(HIDE_KEY);
  if (saved === todayStr) {
    overlay.classList.add('is-hidden');
  } else {
    overlay.classList.remove('is-hidden');
  }

  function closeOverlay() {
    // 체크되어 있으면 오늘 날짜 저장
    if (hideTodayCheckbox && hideTodayCheckbox.checked) {
      localStorage.setItem(HIDE_KEY, todayStr);
    }
    overlay.classList.add('is-hidden');
  }

  closeBtn?.addEventListener('click', closeOverlay);

  // 배경 클릭해도 닫기
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay || e.target.classList.contains('rsvp-overlay__backdrop')) {
      closeOverlay();
    }
  });
});