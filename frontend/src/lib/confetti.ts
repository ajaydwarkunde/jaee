// Simple confetti effect
export default function confetti() {
  const colors = ['#D4A5A5', '#F5E6E0', '#E8DDD4', '#7FB685', '#E5C07B']
  const confettiCount = 100

  for (let i = 0; i < confettiCount; i++) {
    const confetti = document.createElement('div')
    confetti.style.cssText = `
      position: fixed;
      width: 10px;
      height: 10px;
      background-color: ${colors[Math.floor(Math.random() * colors.length)]};
      left: ${Math.random() * 100}vw;
      top: -10px;
      opacity: 1;
      border-radius: ${Math.random() > 0.5 ? '50%' : '0'};
      z-index: 9999;
      pointer-events: none;
      animation: confetti-fall ${2 + Math.random() * 2}s linear forwards;
    `
    document.body.appendChild(confetti)

    setTimeout(() => {
      confetti.remove()
    }, 4000)
  }

  // Add keyframes if not exists
  if (!document.getElementById('confetti-keyframes')) {
    const style = document.createElement('style')
    style.id = 'confetti-keyframes'
    style.textContent = `
      @keyframes confetti-fall {
        to {
          transform: translateY(100vh) rotate(720deg);
          opacity: 0;
        }
      }
    `
    document.head.appendChild(style)
  }
}
