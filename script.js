// window.addEventListener("load", () =>{
//     document.querySelector(".londer").classList.add("londer--hidden");
// });

// فتح النافذة وتجميد الصفحة عند النقر على الصور المحددة
document.querySelectorAll('img[src="Eastern creativity.png"], img[src="Arabic.png"]').forEach(img => {
    img.addEventListener('click', () => {
      document.getElementById('popup').style.display = 'block';
      document.getElementById('overlay').style.display = 'block'; // عرض الخلفية السوداء
      document.body.classList.add('freeze'); // تجميد الصفحة
    });
  });
  
  // إغلاق النافذة واستعادة التفاعل عند النقر على زر شكرًا
  function showThankYouPopup() {
    document.getElementById('thankYouPopup').style.display = 'block';
    document.getElementById('overlay').style.display = 'block'; // عرض الخلفية السوداء
    // إخفاء النافذة السابقة
    document.getElementById('popup').style.display = 'none';
  }
  
  // إغلاق نافذة الشكر الإضافية
  function closeThankYouPopup() {
    document.getElementById('thankYouPopup').style.display = 'none';
    document.getElementById('overlay').style.display = 'none'; // إخفاء الخلفية السوداء
    document.body.classList.remove('freeze'); // إلغاء تجميد الصفحة
  }
  
  // إغلاق النافذة السابقة
  function closePopup() {
    document.getElementById('popup').style.display = 'none';
    document.getElementById('overlay').style.display = 'none'; // إخفاء الخلفية السوداء
    document.body.classList.remove('freeze'); // إلغاء تجميد الصفحة
  }
  