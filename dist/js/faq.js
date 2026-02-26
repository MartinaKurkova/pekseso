const toggles = document.querySelectorAll('.faq__toggle')

toggles.forEach(toggle => {
    toggle.addEventListener('click', () => {
        toggle.parentNode.classList.toggle('active')
    })
})

// paper-faq
const togglesPaper = document.querySelectorAll('.paper-faq__toggle')

togglesPaper.forEach(toggle => {
    toggle.addEventListener('click', () => {
        toggle.parentNode.classList.toggle('active')
    })
})