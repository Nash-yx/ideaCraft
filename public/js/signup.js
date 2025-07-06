// 註冊頁面的JavaScript
document.addEventListener('DOMContentLoaded', function () {
  console.log('註冊頁面JavaScript已載入')

  // 獲取表單元素
  const form = document.querySelector('.signup-container form')

  if (form) {
    // 表單提交處理
    form.addEventListener('submit', function (e) {
      e.preventDefault() // 阻止預設提交行為

      // 獲取輸入值
      const fullName = form.querySelector('input[type="text"]').value
      const email = form.querySelector('input[type="email"]').value
      const password = form.querySelectorAll('input[type="password"]')[0].value
      const confirmPassword = form.querySelectorAll('input[type="password"]')[1].value

      // 簡單驗證
      if (!fullName || !email || !password || !confirmPassword) {
        alert('請填寫所有欄位')
        return
      }

      if (password !== confirmPassword) {
        alert('密碼不一致，請重新輸入')
        return
      }

      // 模擬註冊請求
      console.log('提交註冊表單:', { fullName, email, password })
      alert('註冊請求已發送，這是一個演示')

      // 在實際應用中，這裡應該發送AJAX請求到伺服器
      // fetch('/api/auth/register', {
      //   method: 'POST',
      //   headers: {'Content-Type': 'application/json'},
      //   body: JSON.stringify({ fullName, email, password })
      // })
      // .then(response => response.json())
      // .then(data => {
      //   if (data.success) {
      //     window.location.href = '/login';
      //   } else {
      //     alert(data.message || '註冊失敗，請稍後再試');
      //   }
      // })
      // .catch(error => {
      //   console.error('註冊錯誤:', error);
      //   alert('發生錯誤，請稍後再試');
      // });
    })

    // 社交登入按鈕處理
    const socialButtons = document.querySelectorAll('.social-btn')
    socialButtons.forEach((button) => {
      button.addEventListener('click', function () {
        const provider = this.getAttribute('title').replace('Continue with ', '')
        console.log(`嘗試使用 ${provider} 註冊`)
        alert(`${provider} 註冊功能尚未實現，這是一個演示`)
      })
    })
  }
})
