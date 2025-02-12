const API_BASE = 'http://localhost:3000';

// 获取 DOM 元素
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const dropdown = document.createElement('div');
dropdown.className = 'dropdown';
document.querySelector('.head1').appendChild(dropdown);

// 播放器相关 DOM 元素
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

// 播放器状态
let currentSongIndex = 0;
let songsList = [];
let isMuted = false;

// 防抖函数
let searchTimer = null;
function debounce(func, delay) {
  return function (...args) {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => func.apply(this, args), delay);
  };
}

// 获取热搜列表
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

// 执行搜索
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

  // 更新图片歌手信息
  cover.src = song.al.picUrl;
  songName.textContent = song.name;
  artistName.textContent = song.ar[0].name;

  // 更新播放按钮状态
  playBtn.innerHTML = '<i class="icon pause">||</i>';
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

// 更新进度条
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

  // 创建轮播项
  const itemsHTML = banners.map(banner => `
    <div class="carousel-item" 
         style="background-image: url(${banner.imageUrl})"
         data-songid="${banner.encodeId}"></div>
  `).join('');

  // 创建分页点
  const dotsHTML = banners.map((_, index) => `
    <div class="dot" data-index="${index}"></div>
  `).join('');

  container.innerHTML = `
    ${itemsHTML}
    <div class="carousel-dots">${dotsHTML}</div>
  `;

  // 初始显示第一个
  document.querySelector('.carousel-item').classList.add('active');
  document.querySelector('.dot').classList.add('active');

  // 绑定事件
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

  // 绑定轮播图点击事件（使用事件委托）
  container.addEventListener('click', async (e) => {
    const item = e.target.closest('.carousel-item');
    if (item) {
      const songId = item.dataset.songid;
      const song = await getSongDetail(songId); // 获取歌曲详情
      if (song) {
        songsList = [song]; // 将轮播图歌曲设置为播放列表
        currentSongIndex = 0; // 设置当前播放索引
        playSong(currentSongIndex); // 播放歌曲
      }
    }
  });

  // 启动自动播放
  autoPlayTimer = setInterval(() => {
    currentBannerIndex = (currentBannerIndex + 1) % banners.length;
    switchBanner(currentBannerIndex);
  }, 5000);
}


// 切换轮播图
function switchBanner(index) {
  currentBannerIndex = index;
  
  // 更新轮播项
  document.querySelectorAll('.carousel-item').forEach((item, i) => {
    item.classList.toggle('active', i === index);
  });

  // 更新分页点
  document.querySelectorAll('.dot').forEach((dot, i) => {
    dot.classList.toggle('active', i === index);
  });

  // 重置自动播放计时器
  clearInterval(autoPlayTimer);
  autoPlayTimer = setInterval(() => {
    currentBannerIndex = (currentBannerIndex + 1) % banners.length;
    switchBanner(currentBannerIndex);
  }, 5000);
}

// 新增：获取歌曲详情
async function getSongDetail(songId) {
  try {
    const response = await fetch(`${API_BASE}/song/detail?ids=${songId}`);
    const data = await response.json();
    return data.songs[0]; // 返回歌曲详情
  } catch (error) {
    console.error('获取歌曲详情失败:', error);
    return null;
  }
}

// 推荐歌单功能
async function initPlaylists() {
  try {
    const response = await fetch(`${API_BASE}/top/playlist`);
    const data = await response.json();
    renderPlaylists(data.playlists);
  } catch (error) {
    console.error('获取推荐歌单失败:', error);
  }
}

// 渲染歌单
function renderPlaylists(playlists) {
  const container = document.getElementById('box-container');
  container.innerHTML = playlists.slice(0, 8).map(playlist => `
    <a href="www.111" class="box" data-id="${playlist.id}">
      <img src="${playlist.coverImgUrl}" class="box-cover">
      <div class="play-count">${formatPlayCount(playlist.playCount)}</div>
      <div class="box-info">
        <div class="title">${playlist.name}</div>
      </div>
    </a>
  `).join('');

   // 添加悬停事件
   container.querySelectorAll('.box').forEach(box => {
    let tracksElement = null; // 用于存储歌曲列表元素
    let isTracksLoaded = false; // 标记是否已经加载过歌曲列表

    box.addEventListener('mouseover', async () => {
      if (!isTracksLoaded) {
        const playlistId = box.dataset.id;
        const tracks = await fetchPlaylistTracks(playlistId); // 获取前三首歌曲
        if (tracks.length > 0) {
          tracksElement = document.createElement('div');
          tracksElement.className = 'tracks-list';
          tracksElement.innerHTML = tracks
            .map((track, i) => `${i + 1}. ${track.name}`)
            .join('<br>');
          box.querySelector('.box-info').appendChild(tracksElement); // 插入到歌单信息中
          isTracksLoaded = true; // 标记为已加载
        }
      } else {
        // 如果已经加载过，直接显示
        tracksElement.style.display = 'block';
      }
    });

    box.addEventListener('mouseout', () => {
      if (tracksElement) {
        tracksElement.style.display = 'none'; // 隐藏歌曲列表
      }
    });
  });
}

// 新增：获取歌单详情
async function fetchPlaylistTracks(playlistId) {
  try {
    const response = await fetch(`${API_BASE}/playlist/detail?id=${playlistId}`);
    const data = await response.json();
    return data.playlist.tracks.slice(0, 3); // 返回前三首歌曲
  } catch (error) {
    console.error('获取歌单详情失败:', error);
    return [];
  }
}

// 格式化播放次数
function formatPlayCount(count) {
  if (count > 100000000) {
    return `${(count / 100000000).toFixed(1)}亿`;
  }
  if (count > 10000) {
    return `${Math.round(count / 10000)}万`;
  }
  return count;
}

// 初始化
document.addEventListener('DOMContentLoaded', async () => {
  await initCarousel();
  await initPlaylists();
});





// // 添加歌单详情功能
// async function showPlaylistDetail(id) {
//   try {
//     const response = await fetch(`${API_BASE}/playlist/detail?id=${id}`);
//     const data = await response.json();
//     const playlist = data.playlist;
    
//     const html = `
//       <div class="playlist-header">
//         <img src="${playlist.coverImgUrl}" class="playlist-cover-lg">
//         <div class="playlist-info">
//           <h2>${playlist.name}</h2>
//           <p>创建者：${playlist.creator.nickname}</p>
//           <p>创建时间：${new Date(playlist.createTime).toLocaleDateString()}</p>
//           <button class="play-all-btn" onclick="playAllSongs([${playlist.tracks.map(t => t.id)}])">播放全部</button>
//         </div>
//       </div>
//       <div class="song-list">
//         ${playlist.tracks.map(track => `
//           <div class="song-item" data-id="${track.id}">
//             <span class="song-name">${track.name}</span>
//             <span class="artist">${track.ar.map(a => a.name).join('/')}</span>
//           </div>
//         `).join('')}
//       </div>
//     `;
    
//     document.getElementById('playlist-detail').innerHTML = html;
//     document.getElementById('playlist-detail').style.display = 'block';
//     document.getElementById('recommend-page').style.display = 'none';
//   } catch (error) {
//     showError('加载歌单详情失败');
//   }
// }

// // 添加播放全部功能
// async function playAllSongs(ids) {
//   if (!ids.length) return;
  
//   // 获取第一首歌曲信息
//   const firstSong = await fetch(`${API_BASE}/song/detail?ids=${ids[0]}`)
//     .then(res => res.json())
//     .then(data => data.songs[0]);
  
//   // 更新播放器
//   cover.src = firstSong.al.picUrl;
//   songName.textContent = firstSong.name;
//   artistName.textContent = firstSong.ar[0].name;
  
//   // 播放第一首
//   const url = await getSongUrl(ids[0]);
//   if (url) {
//     audio.src = url;
//     audio.play();
//   }
  
//   // 保存播放列表
//   songsList = ids.map(id => ({ id }));
//   currentSongIndex = 0;
// }
