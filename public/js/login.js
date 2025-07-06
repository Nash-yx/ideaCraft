// 添加互動效果
document.addEventListener('DOMContentLoaded', function () {
  const inputs = document.querySelectorAll('.form-input')
  const socialBtns = document.querySelectorAll('.social-btn')
  const loginBtn = document.querySelector('.login-btn')

  // 輸入框焦點效果
  inputs.forEach((input) => {
    input.addEventListener('focus', function () {
      this.parentElement.style.transform = 'scale(1.02)'
    })

    input.addEventListener('blur', function () {
      this.parentElement.style.transform = 'scale(1)'
    })
  })

  // 按鈕點擊效果
  loginBtn.addEventListener('click', function (e) {
    e.preventDefault()
    this.style.transform = 'scale(0.98)'
    setTimeout(() => {
      this.style.transform = ''
    }, 150)
  })

  // 社交登入按鈕效果
  socialBtns.forEach((btn) => {
    btn.addEventListener('click', function () {
      this.style.transform = 'scale(0.95)'
      setTimeout(() => {
        this.style.transform = ''
      }, 150)
    })
  })

  // 滑鼠跟隨效果
  document.addEventListener('mousemove', function (e) {
    const container = document.querySelector('.login-container')
    const rect = container.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2

    // 微妙的傾斜效果
    const rotateX = (y / rect.height) * 2
    const rotateY = -(x / rect.width) * 2

    container.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`
  })

  // 離開時重置
  document.addEventListener('mouseleave', function () {
    const container = document.querySelector('.login-container')
    container.style.transform = ''
  })
})
