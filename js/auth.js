import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { 
    getAuth,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    onAuthStateChanged,
    signOut
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import { 
    getFirestore,
    doc,
    getDoc, 
    setDoc,
    updateDoc,
    arrayUnion,
    arrayRemove
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

const firebaseConfig = {
    apiKey: "AIzaSyArn2qc3QEJdr65O-Jf8aD8aGx0NjzdZ1c",
    authDomain: "js-worldmap.firebaseapp.com",
    projectId: "js-worldmap",
    storageBucket: "js-worldmap.appspot.com",
    messagingSenderId: "593550910981",
    appId: "1:593550910981:web:361fa520a7d31128cc9e6c",
    measurementId: "G-V2SLL6ZNQR"
};

//Firebase 初始化
const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore(app);

//登录表单处理
const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = e.target.loginEmail.value;
        const password = e.target.loginPassword.value;
        signInWithEmailAndPassword(auth, email, password)
            .then(userCredential => {
                alert('登录成功');
                window.location.href = 'index.html';
            })
            .catch(error => {
                alert(error.message);
            });
    });
}

function checkPasswordMatch(password, confirmPassword) {
    return password === confirmPassword;
}

//注册表单处理
const signupForm = document.getElementById('signup-form');
if (signupForm) {
    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = e.target.signupEmail.value;
        const password = e.target.signupPassword.value;
        const confirmPassword = e.target.confirmPassword.value;

        if (!checkPasswordMatch(password, confirmPassword)) {
            alert("输入的密码不一致.");
            return;
        }

        createUserWithEmailAndPassword(auth, email, password)
            .then(userCredential => {
                alert('注册成功');
                window.location.href = 'index.html';
            })
            .catch(error => {
                alert(error.message);
            });
    });
}

//在主页面下检查是否登录状态
if (window.location.pathname.endsWith('index.html')) {
    onAuthStateChanged(auth, async user => {
        if (user) {
            const likedCities = await loadLikedCities(user);
            if (likedCities.length === 0) {
                document.getElementById('city-info').innerText = '没有收藏的城市';
                document.getElementById('city-photos').innerHTML = '';
            } else {
                document.getElementById('city-info').innerText = '收藏城市：' + likedCities.join(', ');
                document.getElementById('city-photos').innerHTML = '';
            }
            updateNavMenu(user);
        } else {
            document.getElementById('city-info').innerText = '现在不是登录状态。收藏城市需要登录。';
            updateNavMenu();
        }
    });
} else {
    onAuthStateChanged(auth, user => {
        updateNavMenu(user);
    });
}

async function loadLikedCities(user) {
    const docRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(docRef);

    const likedCities = docSnap.exists() ? docSnap.data().likedCities || [] : [];

    return likedCities
}

const likeButton = document.createElement('button');
    likeButton.innerText = 'Like';
    likeButton.addEventListener('click', () => {
        const user = auth.currentUser;
        if (user) {
            likeCity(user, city);
            alert('收藏成功');
        } else {
            alert('收藏城市需要登录。');
        }
    });

async function likeCity(user, city) {
    const docRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        await updateDoc(docRef, {
            likedCities: arrayUnion(city)
        });
    } else {
        await setDoc(docRef, {
            likedCities: [city]
        });
    }
}

async function unlikeCity(user, city) {
    const docRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        await updateDoc(docRef, {
            likedCities: arrayRemove(city)
        });
    }
}

function updateNavMenu(user) {
    const navMenu = document.getElementById('nav-menu');
    navMenu.innerHTML = '';

    if (user) {
        const emailDisplay = document.createElement('span');
        emailDisplay.innerText = user.email;
        navMenu.appendChild(emailDisplay);

        const logoutButton = document.createElement('button');
        logoutButton.innerText = '注销';
        logoutButton.addEventListener('click', () => {
            signOut(auth).then(() => {
                window.location.href = 'index.html';
            }).catch((error) => {
                alert(error.message);
            });
        });
        navMenu.appendChild(logoutButton);
    } else {
        const currentPage = window.location.pathname.split('/').pop();

        const pages = [
            { name: '主页面', href: 'index.html' },
            { name: '登录', href: 'login.html' },
            { name: '注册', href: 'signup.html' }
        ];

        pages.forEach(page => {
            if (page.href !== currentPage) {
                const link = document.createElement('a');
                link.href = page.href;
                link.innerText = page.name;
                navMenu.appendChild(link);
            }
        });
    }
}

export { auth, likeCity, unlikeCity, loadLikedCities };