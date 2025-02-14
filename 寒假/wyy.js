const API_BASE = 'http://localhost:3000';

// DOM
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const dropdown = document.createElement('div');
dropdown.className = 'dropdown';
document.querySelector('.head1').appendChild(dropdown);
const audio = document.getElementById('audio');
const cover = document.getElementById('cover');
const songName = document.getElementById('song-name');
const artistName = document.getElementById('artist-name');
const playBtn = document.getElementById('play-btn');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const progressBar = document.getElementById('progress-bar');
const currentTime = document.getElementById('current-time');
const duration = document.getElementById('duration');
const volumeBar = document.getElementById('volume-bar');
const muteBtn = document.getElementById('mute-btn');

// 播放器
let currentSongIndex = 0;
let songsList = [];
let isMuted = false;

let searchTimer = null;
function debounce(func, delay) {
  return function (...args) {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => func.apply(this, args), delay);
  };
}

// 热搜列表
async function getHotSearch() {
  try {
    const response = await fetch(`${API_BASE}/search/hot`);
    const data = await response.json();
    return data.result.hots;
  } catch (error) {
    showError('获取热搜失败');
    return [];
  }
}

// 搜索
async function doSearch(keywords) {
  try {
    showLoading();
    const response = await fetch(
      `${API_BASE}/cloudsearch?keywords=${encodeURIComponent(keywords)}&type=1`
    );
    const data = await response.json();
    songsList = data.result.songs || [];
    showResults(songsList);
  } catch (error) {
    showError('搜索失败，请重试');
  }
}

// 显示加载状态
function showLoading() {
  dropdown.innerHTML = `<div class="loading">搜索中...</div>`;
  dropdown.style.display = 'block';
}

// 显示错误信息
function showError(msg) {
  dropdown.innerHTML = `<div class="error">${msg}</div>`;
  dropdown.style.display = 'block';
}

// 显示热搜列表
async function showHotList() {
  const hots = await getHotSearch();
  dropdown.innerHTML = hots
    .map(
      (item,index) => `
    <div class="search-item" data-keyword="${item.first}">
      <span class="hot-tag ${index < 3 ? 'red' : ''}">${index + 1}</span>
      ${item.first}
    </div>
  `
    )
    .join('');
  dropdown.style.display = 'block';
}

searchInput.addEventListener('click', function () {
  if (this.value.trim() === '') {
    showHotList();
  }
});

// 输入事件
searchInput.addEventListener(
  'input',
  debounce(function (e) {
    const keywords = e.target.value.trim();
    if (keywords) {
      doSearch(keywords);
    } else {
      showHotList();
    }
  }, 500)
);

// 点击搜索按钮
searchBtn.addEventListener('click', () => {
  const keywords = searchInput.value.trim();
  if (keywords) {
    doSearch(keywords);
  } else {
    showHotList();
  }
});

// 热搜点击
dropdown.addEventListener('click', (e) => {
  const item = e.target.closest('.search-item');
  if (item) {
    const keyword = item.dataset.keyword;
    if (keyword) {
      searchInput.value = keyword;
      doSearch(keyword);
    }
  }
});

// 关闭下拉框
document.addEventListener('click', (e) => {
  const isSearchInput = e.target === searchInput;
  const isDropdown = e.target.closest('.dropdown');
  if (!isSearchInput && !isDropdown) {
    dropdown.style.display = 'none';
  }
});

// 显示搜索结果
function showResults(songs) {
  dropdown.innerHTML =
    songs.length > 0
      ? songs
          .map(
            (song, index) => `
      <div class="search-item" data-index="${index}">
        <span>${song.name}</span>
        <span style="color:#666;margin-left:8px">- ${song.ar[0].name}</span>
      </div>
    `
          )
          .join('')
      : `<div class="loading">没有找到相关结果</div>`;
  dropdown.style.display = 'block';
}

let currentLyrics = [];





// 显示/隐藏播放详情页
const playerDetail = document.getElementById('player-detail');
cover.addEventListener('click', () => {
  playerDetail.classList.add('show');
});

document.querySelector('.close-btn').addEventListener('click', () => {
  playerDetail.classList.remove('show');
});







// 精选页面
const selectiveDetail = document.getElementById('selective');
selective1.addEventListener('click', () => {
  selectiveDetail.classList.add('show');
});
const cc = document.getElementById('cc');
cc.addEventListener('click', () => {
  selectiveDetail.classList.remove('show');
});
const fff = document.getElementById('fff');
fff.addEventListener('click', () => {
  selectiveDetail.classList.remove('show');
});





// 我喜欢的音乐
const selective4Detail = document.getElementById('selective4');
fff.addEventListener('click', () => {
  selective4Detail.classList.add('show');
});
cc.addEventListener('click', () => {
  selective4Detail.classList.remove('show');
});
selective1.addEventListener('click', () => {
  selective4Detail.classList.remove('show');
});




// 歌词滚动
function scrollToCurrentLyric() {
  const activeLyric = document.querySelector('.lyric-line.active');
  if (activeLyric) {
    const lyricsContainer = document.getElementById('lyricsBox');
    const offset = activeLyric.offsetTop - lyricsContainer.offsetTop - 100;
    lyricsContainer.scrollTo({
      top: offset,
      behavior: 'smooth'
    });
  }
}



// 播放歌曲
async function playSong(index) {
  if (songsList.length === 0) return;

  const song = songsList[index];
  const songUrl = await getSongUrl(song.id);
  if (!songUrl) {
    showError('无法获取播放链接');
    return;
  }

  audio.src = songUrl;
  audio.play();

  // 图片歌手信息
  cover.src = song.al.picUrl;
  songName.textContent = song.name;
  artistName.textContent = song.ar[0].name;

document.getElementById('detail-song-name').textContent = song.name;
document.getElementById('detail-artist-name').textContent = song.ar[0].name;
document.getElementById('detail-album-name').textContent = song.al.name;
document.getElementById('vinyl-cover').src = song.al.picUrl;

loadLyrics(song.id);

// document.getElementById('player-detail').classList.add('show');

// 播放按钮
  playBtn.innerHTML = '<i class="icon pause">||</i>';
}

// 歌词
async function loadLyrics(songId) {
  try {
    const response = await fetch(`${API_BASE}/lyric?id=${songId}`);
    const data = await response.json();
    currentLyrics = parseLyrics(data.lrc.lyric);
    updateLyricsDisplay();
  } catch (error) {
    console.error('歌词加载失败:', error);
    currentLyrics = [];
  }
}

function parseLyrics(lyricStr) {
  return lyricStr.split('\n')
      .map(line => {
          const timeMatch = line.match(/\[(\d{2}):(\d{2}\.\d{2,3})\]/);
          if (!timeMatch) return null;
          return {
              time: parseInt(timeMatch[1]) * 60 + parseFloat(timeMatch[2]),
              text: line.split(']')[1].trim()
          };
      })
      .filter(Boolean)
      .sort((a, b) => a.time - b.time); 
}

function updateLyricsDisplay() {
  const lyricsBox = document.getElementById('lyricsBox');
  lyricsBox.innerHTML = currentLyrics.map(l => 
    `<div class="lyric-line" data-time="${l.time}">${l.text}</div>`
  ).join('');
}

function updateLyricHighlight() {
  const currentTime = audio.currentTime;
  document.querySelectorAll('.lyric-line').forEach(line => {
    const lineTime = parseFloat(line.dataset.time);
    line.classList.toggle('active', 
      currentTime >= lineTime && currentTime < lineTime + 0.5
    );
  });
}



// 获取歌曲播放链接
async function getSongUrl(id) {
  try {
    const response = await fetch(`${API_BASE}/song/url?id=${id}`);
    const data = await response.json();
    return data.data[0].url;
  } catch (error) {
    return null;
  }
}

// 进度条
function updateProgress() {
  const progress = (audio.currentTime / audio.duration) * 100;
  progressBar.value = progress;
  currentTime.textContent = formatTime(audio.currentTime);
  duration.textContent = formatTime(audio.duration);
}

// 时间
function formatTime(time) {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// 事件绑定
searchInput.addEventListener(
  'input',
  debounce(function (e) {
    const keywords = e.target.value.trim();
    if (keywords) {
      doSearch(keywords);
    } else {
      showHotList();
    }
  }, 500)
);

searchBtn.addEventListener('click', () => {
  const keywords = searchInput.value.trim();
  if (keywords) {
    doSearch(keywords);
  } else {
    showHotList();
  }
});

dropdown.addEventListener('click', (e) => {
  const item = e.target.closest('.search-item');
  if (item) {
    const index = item.dataset.index;
    if (index !== undefined) {
      currentSongIndex = parseInt(index);
      playSong(currentSongIndex);
    }
  }
});

playBtn.addEventListener('click', () => {
  if (audio.paused) {
    audio.play();
    playBtn.innerHTML = '<i class="icon pause">||</i>';
  } else {
    audio.pause();
    playBtn.innerHTML = '<i class="icon play">></i>';
  }
});

prevBtn.addEventListener('click', () => {
  currentSongIndex = (currentSongIndex - 1 + songsList.length) % songsList.length;
  playSong(currentSongIndex);
});

nextBtn.addEventListener('click', () => {
  currentSongIndex = (currentSongIndex + 1) % songsList.length;
  playSong(currentSongIndex);
});

progressBar.addEventListener('input', () => {
  const time = (progressBar.value / 100) * audio.duration;
  audio.currentTime = time;
});

volumeBar.addEventListener('input', () => {
  audio.volume = volumeBar.value / 100;
});

muteBtn.addEventListener('click', () => {
  isMuted = !isMuted;
  audio.muted = isMuted;
  muteBtn.innerHTML = isMuted
    ? '<i class="icon mute">silence</i>'
    : '<i class="icon volume">speak</i>';
});

audio.addEventListener('timeupdate', () => {
  updateProgress();
  updateLyricHighlight();
  scrollToCurrentLyric();
  // 控制唱片动画
  const vinylDisc = document.querySelector('.vinyl-disc');
  const needle = document.querySelector('.needle');
  if (audio.paused) {
    vinylDisc.classList.remove('playing');
    needle.classList.remove('playing');
  } else {
    vinylDisc.classList.add('playing');
    needle.classList.add('playing');
  }
});


audio.addEventListener('timeupdate', updateProgress);
audio.addEventListener('ended', () => {
  nextBtn.click();
});

// 轮播图功能
let currentBannerIndex = 0;
let banners = [];
let autoPlayTimer = null;

// 获取轮播图数据
async function fetchBanners() {
  try {
    const response = await fetch(`${API_BASE}/banner`);
    const data = await response.json();
    return data.banners;
  } catch (error) {
    console.error('获取轮播图失败:', error);
    return [];
  }
}

// 初始化轮播图
async function initCarousel() {
  banners = await fetchBanners();
  const container = document.getElementById('carousel-container');

  const itemsHTML = banners.map(banner => `
    <div class="carousel-item" 
         style="background-image: url(${banner.imageUrl})"
         data-songid="${banner.encodeId}"></div>
  `).join('');

  // 分页点
  const dotsHTML = banners.map((_, index) => `
    <div class="dot" data-index="${index}"></div>
  `).join('');

  container.innerHTML = `
    ${itemsHTML}
    <div class="carousel-dots">${dotsHTML}</div>
  `;


  document.querySelector('.carousel-item').classList.add('active');
  document.querySelector('.dot').classList.add('active');

  // 事件
  container.querySelectorAll('.dot').forEach(dot => {
    dot.addEventListener('click', () => {
      const index = parseInt(dot.dataset.index);
      switchBanner(index);
    });
    dot.addEventListener('mouseover', () => {
      const index = parseInt(dot.dataset.index);
      switchBanner(index);
    });
  });
}


// 切换轮播图
function switchBanner(index) {
  currentBannerIndex = index;
  
  document.querySelectorAll('.carousel-item').forEach((item, i) => {
    item.classList.toggle('active', i === index);
  });

  document.querySelectorAll('.dot').forEach((dot, i) => {
    dot.classList.toggle('active', i === index);
  });

  clearInterval(autoPlayTimer);
  autoPlayTimer = setInterval(() => {
    currentBannerIndex = (currentBannerIndex + 1) % banners.length;
    switchBanner(currentBannerIndex);
  }, 5000);
}

// 获取歌曲详情
async function getSongDetail(songId) {
  try {
    const response = await fetch(`${API_BASE}/song/detail?ids=${songId}`);
    const data = await response.json();
    return data.songs[0]; 
  } catch (error) {
    console.error('获取歌曲详情失败:', error);
    return null;
  }
}

// 推荐歌单
async function initPlaylists() {
  try {
    const response = await fetch(`${API_BASE}/top/playlist`);
    const data = await response.json();
    renderPlaylists(data.playlists);
  } catch (error) {
    console.error('获取推荐歌单失败:', error);
  }
}

function renderPlaylists(playlists) {
  const container = document.getElementById('box-container');
  container.innerHTML = playlists.slice(0, 12).map(playlist => `
    <div class="box" data-id="${playlist.id}">
      <img src="${playlist.coverImgUrl}" class="box-cover">
      <div class="play-count">${formatPlayCount(playlist.playCount)}</div>
      <div class="box-info">
        <div class="title">${playlist.name}</div>
      </div>
    </div>
  `).join('');

   // 悬停
   container.querySelectorAll('.box').forEach(box => {
    let tracksElement = null; 
    let isTracksLoaded = false; 

    box.addEventListener('mouseover', async () => {
      if (!isTracksLoaded) {
        const playlistId = box.dataset.id;
        const tracks = await fetchPlaylistTracks(playlistId); 
        if (tracks.length > 0) {
          tracksElement = document.createElement('div');
          tracksElement.className = 'tracks-list';
          tracksElement.innerHTML = tracks
            .map((track, i) => `${i + 1}. ${track.name}`)
            .join('<br>');
          box.querySelector('.box-info').appendChild(tracksElement); 
          isTracksLoaded = true; 
        }
      } else {
        tracksElement.style.display = 'block';
      }
    });

    box.addEventListener('mouseout', () => {
      if (tracksElement) {
        tracksElement.style.display = 'none'; 
      }
    });
  });
}

async function fetchPlaylistTracks(playlistId) {
  try {
    const response = await fetch(`${API_BASE}/playlist/detail?id=${playlistId}`);
    const data = await response.json();
    return data.playlist.tracks.slice(0, 3); 
  } catch (error) {
    console.error('获取歌单详情失败:', error);
    return [];
  }
}

// 播放次数
function formatPlayCount(count) {
  if (count > 100000000) {
    return `${(count / 100000000).toFixed(1)}亿`;
  }
  if (count > 10000) {
    return `${Math.round(count / 10000)}万`;
  }
  return count;
}

document.addEventListener('DOMContentLoaded', async () => {
  await initCarousel();
  await initPlaylists();
 
});

// 侧边栏
document.addEventListener('DOMContentLoaded', function() {
  var menuItems = document.querySelectorAll('.menu li');

  menuItems.forEach(function(item) {
    item.addEventListener('click', function() {
      menuItems.forEach(function(otherItem) {
        otherItem.classList.remove('active');
      });

      this.classList.add('active');
    });
  });
});

// 获取精选歌单
async function initFeaturedPlaylists() {
  try {
    const response = await fetch(`${API_BASE}/top/playlist/highquality?limit=1000`);
    const data = await response.json();
    renderFeaturedPlaylists(data.playlists);
  } catch (error) {
    console.error('获取精选歌单失败:', error);
  }
}

// 分类
let currentFeaturedCat = '全部'; 

async function initFeaturedPlaylists() {
  try {
    const categories = await fetchFeaturedCategories();
    renderFeaturedCategories(categories);
    

    loadFeaturedPlaylists(currentFeaturedCat);
  } catch (error) {
    console.error('初始化失败:', error);
  }
}

async function fetchFeaturedCategories() {
  try {
    const response = await fetch(`${API_BASE}/playlist/highquality/tags`);
    const data = await response.json();
    return [{ name: '全部' }, ...data.tags];
  } catch (error) {
    console.error('获取分类失败:', error);
    return [{ name: '全部' }];
  }
}

//分类导航
function renderFeaturedCategories(categories) {
  const container = document.querySelector('.head2');
  container.innerHTML = `
    <div class="categories">
      ${categories.slice(0, 8).map(cat => `
        <div class="category-tag" data-cat="${cat.name}">${cat.name}</div>
      `).join('')}
    </div>
  `;

  // 绑定点击事件
  container.querySelectorAll('.category-tag').forEach(tag => {
    tag.addEventListener('click', () => {
      currentFeaturedCat = tag.dataset.cat;
      
      container.querySelectorAll('.category-tag').forEach(t => 
        t.classList.remove('active')
      );
      tag.classList.add('active');
    
      loadFeaturedPlaylists(currentFeaturedCat);
    });
  });

  document.querySelector(`[data-cat="全部"]`).classList.add('active');
}

async function loadFeaturedPlaylists(cat) {
  try {
    const response = await fetch(
      `${API_BASE}/top/playlist/highquality?cat=${encodeURIComponent(cat)}&limit=50`
    );
    const data = await response.json();
    renderFeaturedPlaylists(data.playlists);
  } catch (error) {
    console.error('获取歌单失败:', error);
  }
}
// 渲染歌单
function renderFeaturedPlaylists(playlists) {
  const container = document.getElementById('featured-container');
  if (!container) return;

  container.innerHTML = playlists.slice(0, 1000).map(playlist => `
    <div class="box" data-id="${playlist.id}">
      <img src="${playlist.coverImgUrl}" class="box-cover">
      <div class="play-count">${formatPlayCount(playlist.playCount)}</div>
      <div class="box-info">
        <div class="title">${playlist.name}</div>
      </div>
    </div>
  `).join('');
  bindPlaylistClickEvents();
  bindHoverEvents(container);
}

//点击事件
function bindPlaylistClickEvents() {
  document.querySelectorAll('.box').forEach(box => {
    box.addEventListener('click', async (e) => {
      if (e.target.closest('.tracks-list')) return;
      
      const playlistId = box.dataset.id;
      await showPlaylistDetail(playlistId);
    });
  });
}

//悬停
function bindHoverEvents(container) {
  container.querySelectorAll('.box').forEach(box => {
    let tracksElement = null;
    let isTracksLoaded = false;

    box.addEventListener('mouseover', async () => {
      if (!isTracksLoaded) {
        const playlistId = box.dataset.id;
        const tracks = await fetchPlaylistTracks(playlistId);
        if (tracks.length > 0) {
          tracksElement = document.createElement('div');
          tracksElement.className = 'tracks-list';
          tracksElement.innerHTML = tracks
            .map((track, i) => `${i + 1}. ${track.name}`)
            .join('<br>');
          box.querySelector('.box-info').appendChild(tracksElement);
          isTracksLoaded = true;
        }
      } else {
        tracksElement.style.display = 'block';
      }
    });

    box.addEventListener('mouseout', () => {
      if (tracksElement) {
        tracksElement.style.display = 'none';
      }
    });
  });
}
 initFeaturedPlaylists();




// 显示歌单详情
async function showPlaylistDetail(playlistId) {
  try {
    const response = await fetch(`${API_BASE}/playlist/detail?id=${playlistId}`);
    const data = await response.json();
    const playlist = data.playlist;
    songsList = playlist.tracks;
    const detailContainer = document.getElementById('selective2');
    detailContainer.innerHTML = `
      <div class="logo">${playlist.name}</div>
      <div class="detail-content">
        <!-- 封面区域 -->
        <div class="cover-section">
          <img src="${playlist.coverImgUrl}" class="detail-cover">
          <div class="play-count">播放量：${formatPlayCount(playlist.playCount)}</div>
        </div>
        
        <!-- 信息区域 -->
        <div class="info-section">
          <div class="creator">
            <img src="${playlist.creator.avatarUrl}" class="creator-avatar">
            <span class="creator-name">${playlist.creator.nickname}</span>
          </div>
          <div class="description">${playlist.description || '暂无描述'}</div>
        </div>
        
        <!-- 歌曲列表 -->
        <div class="song-list">
          <h3>歌曲列表（${playlist.tracks.length}首）</h3>
          ${playlist.tracks.map((track, index) => `
            <div class="song-item" data-index="${index}">
              <span class="index">${index + 1}.</span>
              <span class="song-name">${track.name}</span>
              <span class="artist">${track.ar.map(a => a.name).join('/')}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    // 显示详情页
    detailContainer.classList.add('show');

    bindSongClickEvents();
    
  } catch (error) {
    console.error('加载歌单详情失败:', error);
    alert('加载歌单详情失败，请稍后重试');
  }
}

//点击事件
function bindSongClickEvents() {
  document.querySelectorAll('.song-item').forEach(item => {
    item.addEventListener('click', () => {
      const index = item.dataset.index;
      playSong(index); 
    });
  });
}

document.addEventListener('click', (e) => {
  const selective2 = document.getElementById('selective2');
  if (selective2.classList.contains('show') && 
      !e.target.closest('#selective2') &&
      !e.target.closest('.box')) {
    selective2.classList.remove('show');
  }
});

