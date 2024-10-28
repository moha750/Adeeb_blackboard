// window.addEventListener("load", () =>{
//     document.querySelector(".londer").classList.add("londer--hidden");
// });

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
async function saveIdeaToFirestore(name, ideaTitle, ideaText, imageUrl) {
    await db.collection('ideas').add({
        name: name,
        title: ideaTitle,
        text: ideaText,
        imageUrl: imageUrl || '', // إذا لم توجد صورة، استخدم نصاً فارغاً
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
    });

    // إعادة تعيين النموذج بعد حفظ الفكرة
    form.reset();
    loadIdeas();

    // إخفاء شريط التحميل
    document.getElementById('loadingText').style.display = 'none';
    document.getElementById('progressContainer').style.display = 'none';
    document.getElementById('progressBar').style.width = '0%';
    document.getElementById('progressBar').textContent = '';

    // عرض رسالة الشكر باستخدام النافذة المنبثقة
    showThankYouModal(' رحم الله امرأ شارك عقله عقول الناس 🧠✨');
}

// إعداد الحدث عند إرسال النموذج
const form = document.getElementById('ideaForm');
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const ideaTitle = document.getElementById('ideaTitle').value;
    const ideaText = document.getElementById('ideaText').value;
    const imageFile = document.getElementById('image').files[0];

    // عرض شريط التحميل
    document.getElementById('loadingText').style.display = 'block';
    document.getElementById('progressContainer').style.display = 'block';

    // التحقق مما إذا تم إرفاق صورة
    if (imageFile) {
        const storageRef = storage.ref();
        const imageRef = storageRef.child(`images/${imageFile.name}`);
        const uploadTask = imageRef.put(imageFile);

        uploadTask.on('state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                document.getElementById('progressBar').style.width = progress + '%';
                document.getElementById('progressBar').textContent = Math.floor(progress) + '%';
            },
            (error) => {
                console.error('Error uploading image:', error);
            },
            async () => {
                const imageUrl = await uploadTask.snapshot.ref.getDownloadURL();
                saveIdeaToFirestore(name, ideaTitle, ideaText, imageUrl);
            }
        );
    } else {
        // حفظ الفكرة بدون صورة مع عرض شريط التحميل
        let progress = 0;
        const progressInterval = setInterval(() => {
            if (progress < 100) {
                progress += 10; // زيادة النسبة المئوية ببطء حتى تصل إلى 100%
                document.getElementById('progressBar').style.width = progress + '%';
                document.getElementById('progressBar').textContent = progress + '%';
            } else {
                clearInterval(progressInterval);
                saveIdeaToFirestore(name, ideaTitle, ideaText, null);
            }
        }, 100); // تحديث كل 100 مللي ثانية
    }
});

// دالة عرض الأفكار المحفوظة
async function loadIdeas() {
    const ideasContainer = document.getElementById('ideasContainer');
    ideasContainer.innerHTML = '';
    const snapshot = await db.collection('ideas').orderBy('timestamp', 'desc').get();

    snapshot.forEach(doc => {
        const idea = doc.data();
        const timestamp = idea.timestamp ? idea.timestamp.toDate().toLocaleString() : "No date available";

        // قالب عرض الفكرة
        ideasContainer.innerHTML += `
            <div class="idea">
                <h1 style="color: white; font-family: bb; font-size:7vw;" >${idea.title}</h1> <hr style="color: white; width: 50%; border: 0.1vw solid white; margin:4vw auto;">
                <h1 style="color: white; font-family: m; font-size:5vw; margin-bottom:5vw;">${idea.text}</h1>
                ${idea.imageUrl ? `<img src="${idea.imageUrl}" alt="Idea Image" style="max-width: 100%; cursor: pointer;" onclick="previewImage('${idea.imageUrl}')">` : ''}
                <p style="color: white; font-family: r; font-size:4.5vw; margin-top:5vw;"> بِريشة المُبدع/ـه: ${idea.name}</p>
                <p style="color: white; font-family: l; font-size:3.5vw; margin:2.5vw 0vw;"> حُفظت التُحفة في: ${timestamp}</p>
                <button onclick="copyIdea('${idea.title}', '${idea.name}', '${idea.text}')">نسخ الفكرة</button>
                ${idea.imageUrl ? `<button onclick="downloadImage('${idea.imageUrl}', 'تحميل فكرة - ${idea.title}')">تحميل الصورة</button>` : ''}
            </div>
        `;
    });
}

// دالة تحميل الصورة
function downloadImage(url, filename) {
    fetch(url)
        .then(response => response.blob())
        .then(blob => {
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href); // تحرير الذاكرة بعد التحميل
        })
        .catch(error => console.error('Error downloading image:', error));
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

// دالة عرض الصورة في نافذة منبثقة
function previewImage(url) {
    // منع التمرير عند عرض الصورة
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
    document.body.style.overflow = ''; // استعادة التمرير عند إغلاق المعاينة
}

// دالة عرض نافذة شكر
function showThankYouModal(message) {
    document.getElementById('thankYouMessage').innerText = message;
    document.getElementById('thankYouModal').style.display = 'flex';
    document.body.style.overflow = 'hidden'; // منع التمرير عند فتح النافذة
}

// دالة عرض نافذة النسخ
function showCopyModal(message) {
    document.getElementById('copyMessage').innerText = message;
    document.getElementById('copyModal').style.display = 'flex';
    document.body.style.overflow = 'hidden'; // منع التمرير عند فتح النافذة
}

// إعداد أحداث للزر عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('thankYouButton').addEventListener('click', closeThankYouModal);
    document.getElementById('copyCloseButton').addEventListener('click', closeCopyModal);
    document.getElementById('newModalCloseButton').addEventListener('click', () => {
        document.getElementById('newModal').style.display = 'none';
        document.body.style.overflow = ''; // استعادة التمرير عند إغلاق النافذة
    });

    // تحميل الأفكار عند فتح الصفحة
    loadIdeas();
});

// دالة إغلاق نافذة الشكر
function closeThankYouModal() {
    document.getElementById('thankYouModal').style.display = 'none';
    document.body.style.overflow = ''; // استعادة التمرير عند إغلاق النافذة
}

// تعديل دالة إغلاق نافذة النسخ لعرض النافذة الجديدة
function closeCopyModal() {
    document.getElementById('copyModal').style.display = 'none';
    document.body.style.overflow = ''; // استعادة التمرير عند إغلاق النافذة
    showNewModal(); // عرض النافذة الجديدة
}

// دالة عرض النافذة المنبثقة الجديدة
function showNewModal() {
    document.getElementById('newModal').style.display = 'flex';
    document.body.style.overflow = 'hidden'; // منع التمرير عند فتح النافذة
}

function openPanel() {
    document.getElementById("myPanel").style.height = "140vw"; // تأكد أن الرقم هنا هو ما تريده للطول
}

function closePanel() {
    document.getElementById("myPanel").style.height = "0";
}
