window.addEventListener("load", () => {
    document.querySelector(".londer").classList.add("londer--hidden");
});

// إعداد Firebase
const firebaseConfig = {
    apiKey: "AIzaSyA7gqmN4YU_cc4SY9rHSDgze2kblj2rGw4",
    authDomain: "world-mental-health-day-72766.firebaseapp.com",
    projectId: "world-mental-health-day-72766",
    storageBucket: "world-mental-health-day-72766.appspot.com",
    messagingSenderId: "138201346190",
    appId: "1:138201346190:web:fa065390b91bfe8c4819df",
};

// تهيئة Firebase
const firebaseApp = firebase.initializeApp(firebaseConfig);
const db = firebaseApp.firestore();
const storage = firebase.storage();

// دالة لحفظ الفكرة إلى Firestore
async function saveIdeaToFirestore(name, ideaTitle, ideaText, imageUrls) {
    await db.collection('Ramadan').add({
        name: name,
        title: ideaTitle,
        text: ideaText,
        imageUrls: imageUrls || [], 
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
    });

    form.reset();
    loadIdeas();

    document.getElementById('loadingText').style.display = 'none';
    document.getElementById('progressContainer').style.display = 'none';
    document.getElementById('progressBar').style.width = '0%';

    showThankYouModal(' رحم الله امرأ شارك عقله عقول الناس 🧠✨');
}

// إعداد الحدث عند إرسال النموذج
const form = document.getElementById('ideaForm');
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const ideaTitle = document.getElementById('ideaTitle').value;
    const ideaText = document.getElementById('ideaText').value;
    const imageFiles = document.getElementById('images').files;

    document.getElementById('loadingText').style.display = 'block';
    document.getElementById('progressContainer').style.display = 'block';

    if (imageFiles.length > 0) {
        const storageRef = storage.ref();
        const uploadPromises = [];

        for (const file of imageFiles) {
            const imageRef = storageRef.child(`images/${file.name}`);
            const uploadTask = imageRef.put(file);

            uploadPromises.push(
                new Promise((resolve, reject) => {
                    uploadTask.on(
                        'state_changed',
                        (snapshot) => {
                            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                            document.getElementById('progressBar').style.width = progress + '%';
                            document.getElementById('progressBar').textContent = Math.floor(progress) + '%';
                        },
                        (error) => reject(error),
                        async () => {
                            const imageUrl = await uploadTask.snapshot.ref.getDownloadURL();
                            resolve(imageUrl);
                        }
                    );
                })
            );
        }

        Promise.all(uploadPromises).then((imageUrls) => {
            saveIdeaToFirestore(name, ideaTitle, ideaText, imageUrls);
        }).catch(error => {
            console.error('Error uploading images:', error);
        });

    } else {
        saveIdeaToFirestore(name, ideaTitle, ideaText, []);
    }
});

// دالة تحميل وعرض الأفكار
async function loadIdeas() {
    const ideasContainer = document.getElementById('ideasContainer');
    ideasContainer.innerHTML = '';
    const snapshot = await db.collection('Ramadan').orderBy('timestamp', 'desc').get();

    snapshot.forEach(doc => {
        const idea = doc.data();
        const timestamp = idea.timestamp ? idea.timestamp.toDate().toLocaleString() : "No date available";

        ideasContainer.innerHTML += `
            <div class="idea">
                <h1 style="color: white; font-family: bb; font-size:7vw;" >${idea.title}</h1> 
                <hr style="color: white; width: 50%; border: 0.1vw solid white; margin:4vw auto;">
                <h1 style="color: white; font-family: m; font-size:5vw; margin-bottom:5vw;">${idea.text}</h1>
                ${idea.imageUrls && idea.imageUrls.length > 0 ? `
                    <div class="image-gallery">
                        ${idea.imageUrls.map(url => 
                            `<div>
                                <img src="${url}" class="gallery-image" alt="Idea Image" style="max-width: 100%; cursor: pointer;" onclick="previewImage('${url}')">
                                <button class="download-btn" onclick="downloadImage('${url}')">📥</button>
                            </div>`
                        ).join('')}
                    </div>
                ` : ''}
                
                
                                <p style="color: white; font-family: r; font-size:4.5vw; margin-top:5vw;"> بِريشة المُبدع/ـه: ${idea.name}</p>
                <p style="color: white; font-family: l; font-size:3.5vw; margin:2.5vw 0vw;"> حُفظت التُحفة في: ${timestamp}</p>
                <button onclick="copyIdea('${idea.title}', '${idea.name}', '${idea.text}')">نسخ الفكرة</button>
            </div>
        `;
        
    });
    
}



// دالة عرض الصورة في نافذة منبثقة
function previewImage(url) {
    document.body.style.overflow = 'hidden';

    const previewContainer = document.createElement('div');
    previewContainer.classList.add('preview-container');
    previewContainer.innerHTML = `
        <div class="preview-overlay" onclick="closePreview(this.parentElement)"></div>
        <button class="close-button" onclick="closePreview(this.parentElement)">×</button>
        <img src="${url}" alt="Preview Image" class="preview-image">
    `;
    document.body.appendChild(previewContainer);
}

// دالة إغلاق نافذة المعاينة
function closePreview(previewContainer) {
    document.body.removeChild(previewContainer);
    document.body.style.overflow = ''; 
}

// دالة نسخ الفكرة
function copyIdea(title, name, text) {
    const ideaContent = `العنوان💡: ${title}\nالفكرة📝: ${text}\nبِريشة المُبدع/ـه✍🏻: ${name}`;
    navigator.clipboard.writeText(ideaContent).then(() => {
        showCopyModal(' تم حفط الفكرة في جيب المكرونة🍝 ');
    }).catch(err => {
        showCopyModal('حدث خطأ أثناء نسخ الفكرة.');
    });
}

// دالة عرض نافذة شكر
function showThankYouModal(message) {
    document.getElementById('thankYouMessage').innerText = message;
    document.getElementById('thankYouModal').style.display = 'flex';
    document.body.style.overflow = 'hidden'; 
}

// إعداد أحداث للزر عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('thankYouButton').addEventListener('click', closeThankYouModal);
    document.getElementById('copyCloseButton').addEventListener('click', closeCopyModal);
    document.getElementById('newModalCloseButton').addEventListener('click', () => {
        document.getElementById('newModal').style.display = 'none';
        document.body.style.overflow = ''; 
    });

    loadIdeas();
    
});

// دالة إغلاق نافذة الشكر
function closeThankYouModal() {
    document.getElementById('thankYouModal').style.display = 'none';
    document.body.style.overflow = ''; 
}

// تعديل دالة إغلاق نافذة النسخ
function closeCopyModal() {
    document.getElementById('copyModal').style.display = 'none';
    document.body.style.overflow = ''; 
}

// دالة فتح وإغلاق لوحة الإدخال
function openPanel() {
    document.getElementById("myPanel").style.height = "140vw"; 
}

function closePanel() {
    document.getElementById("myPanel").style.height = "0";
}

function showCopyModal(message) {
    document.getElementById('copyMessage').innerText = message;
    document.getElementById('copyModal').style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeCopyModal() {
    document.getElementById('copyModal').style.display = 'none';
    document.getElementById('newModal').style.display = 'flex'; // عرض النافذة الجديدة
    document.body.style.overflow = ''; 
}

function downloadImage(url) {
    fetch(url)
        .then(response => response.blob())  // تحويل الصورة إلى ملف Blob
        .then(blob => {
            const a = document.createElement('a');
            const objectURL = URL.createObjectURL(blob);
            a.href = objectURL;
            a.download = 'idea_image.jpg'; // تحديد اسم الملف
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(objectURL); // تحرير الذاكرة بعد التنزيل
        })
        .catch(error => console.error('خطأ أثناء تحميل الصورة:', error));
}
