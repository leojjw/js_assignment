import { auth, likeCity, unlikeCity, loadLikedCities } from './auth.js';
import { getFirestore, doc, getDoc } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';
import cities from './cities.js';

const db = getFirestore();

//地图初始化
const map = L.map('map').setView([39.9042, 116.4074], 2);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);


//对每个城市在地图的相应位置上加标签
for (const city in cities) {
    const cityData = cities[city];
    const marker = L.marker([cityData.lat, cityData.lng]).addTo(map);
    marker.bindPopup(city).on('click', () => {
        showCityInfo(city);
    });
}

//显示城市的信息和图片
async function showCityInfo(city) {
    const cityData = cities[city];
    const cityInfo = document.getElementById('city-info');
    const photosContainer = document.getElementById('city-photos');
    cityInfo.innerText = cityData.info;
    photosContainer.innerHTML = '';

    const user = auth.currentUser;
    
    if (user) {
        const likedCities = await loadLikedCities(user);
        const isLiked = likedCities.includes(city);

        const likeButton = document.createElement('button');
        likeButton.innerText = isLiked ? '取消收藏' : '收藏';
        likeButton.addEventListener('click', () => {
            if (isLiked) {
                unlikeCity(user, city);
                likeButton.innerText = '收藏被取消';
            } else {
                likeCity(user, city);
                likeButton.innerText = '收藏成功';
            }
        });
        cityInfo.appendChild(likeButton);
    } else {
        const likeButton = document.createElement('button');
        likeButton.innerText = '收藏';
        likeButton.addEventListener('click', () => {
            alert('收藏城市需要登录。');
        });
        cityInfo.appendChild(likeButton);
    }

    cityData.photos.forEach(photo => {
        const img = document.createElement('img');
        img.src = photo;
        photosContainer.appendChild(img);
    });
}


map.on('popupclose', async function() {
    const user = auth.currentUser;
    if (user) {
        const likedCities = await loadLikedCities(user);
        if (likedCities.length === 0) {
            document.getElementById('city-info').innerText = '没有收藏的城市';
            document.getElementById('city-photos').innerHTML = '';
        } else {
            document.getElementById('city-info').innerText = '收藏城市：' + likedCities.join(', ');
            document.getElementById('city-photos').innerHTML = '';
        }
    } else {
        document.getElementById('city-info').innerText = '现在不是登录状态。收藏城市需要登录。';
        document.getElementById('city-photos').innerHTML = '';
    }
});
