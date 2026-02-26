// paper-faq
const togglesPaper = document.querySelectorAll('.paper-faq__toggle')

togglesPaper.forEach(toggle => {
    toggle.addEventListener('click', () => {
        toggle.parentNode.classList.toggle('active')
    })
})