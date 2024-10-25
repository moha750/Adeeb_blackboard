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
const auth = firebaseApp.auth();
const storage = firebase.storage();


// javascript cods
const form = document.getElementById('ideaForm');
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('name').value;
    const ideaTitle = document.getElementById('ideaTitle').value;
    const ideaText = document.getElementById('ideaText').value;
    const imageFile = document.getElementById('image').files[0];

    // رفع الصورة إلى التخزين
    const storageRef = storage.ref();
    const imageRef = storageRef.child(`images/${imageFile.name}`);
    await imageRef.put(imageFile);
    const imageUrl = await imageRef.getDownloadURL();

    // حفظ البيانات في Firestore
// حفظ البيانات في Firestore مع تضمين الوقت
await db.collection('ideas').add({
    name: name,
    title: ideaTitle,
    text: ideaText,
    imageUrl: imageUrl,
    timestamp: firebase.firestore.FieldValue.serverTimestamp() // تخزين الوقت
});


    // إعادة تعيين النموذج بعد حفظ الفكرة
    form.reset();
    loadIdeas();
});

// عرض الأفكار
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
                <h2>${idea.title}</h2>
                <p><strong>بواسطة:</strong> ${idea.name}</p>
                <p>${idea.text}</p>
                <img src="${idea.imageUrl}" alt="Idea Image" style="max-width: 100%; cursor: pointer;" onclick="previewImage('${idea.imageUrl}')">
                <p><small>تاريخ الحفظ: ${timestamp}</small></p>
                <button onclick="copyIdea('${idea.title}', '${idea.name}', '${idea.text}')">نسخ الفكرة</button>
                <button onclick="downloadImage('${idea.imageUrl}', 'Idea Image - ${idea.title}')">تحميل الصورة</button>
            </div>
        `;
    });
}

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



// دالة النسخ
function copyIdea(title, name, text) {
    const ideaContent = `عنوان الفكرة: ${title}\nبواسطة: ${name}\nالفكرة: ${text}`;
    navigator.clipboard.writeText(ideaContent).then(() => {
        alert('تم نسخ الفكرة إلى الحافظة!');
    }).catch(err => {
        alert('حدث خطأ أثناء نسخ الفكرة.');
    });
}


// دالة عرض الصورة في نافذة منبثقة
function previewImage(url) {
    const previewContainer = document.createElement('div');
    previewContainer.classList.add('preview-container');
    previewContainer.innerHTML = `
        <div class="preview-overlay" onclick="this.parentElement.remove()"></div>
        <img src="${url}" alt="Preview Image" class="preview-image">
    `;
    document.body.appendChild(previewContainer);
}

// تحميل الأفكار عند فتح الصفحة
loadIdeas();

function previewImage(url) {
    const previewContainer = document.createElement('div');
    previewContainer.classList.add('preview-container');
    previewContainer.innerHTML = `
        <div class="preview-overlay" onclick="this.parentElement.remove()"></div>
        <button class="close-button" onclick="document.body.removeChild(this.parentElement)">×</button>
        <img src="${url}" alt="Preview Image" class="preview-image">
    `;
    document.body.appendChild(previewContainer);
}
