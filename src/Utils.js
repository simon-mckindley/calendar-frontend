import gsap from 'gsap'

class Utils {

  isMobile() {
    let viewportWidth = window.innerWidth
    if (viewportWidth <= 768) {
      return true
    } else {
      return false
    }
  }


  pageIntroAnim() {
    const pageContent = document.querySelector('.page-content')
    if (!pageContent) return
    gsap.fromTo(pageContent, { opacity: 0, y: -12 }, { opacity: 1, y: 0, ease: 'power2.out', duration: 0.3 })
  }

  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  titleCase(txt) {
    if (!txt) return;

    if (txt.length === 1) {
      return txt.charAt(0).toUpperCase();
    }
    if (txt.length > 1) {
      return txt.charAt(0).toUpperCase() + txt.slice(1);
    }
  }

  // Utility function to format date in "25 February 2024" format
  formatDateAU(date) {
    const formattedDate = new Date(date);
    const options = { day: "numeric", month: "long", year: "numeric" };
    return formattedDate.toLocaleDateString("en-AU", options);
  }

}

export default new Utils()