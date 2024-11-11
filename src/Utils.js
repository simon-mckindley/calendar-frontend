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

  validateDates(startDate, endDate) {
    const now = new Date();

    // Check if both dates are valid Date objects
    if (!(startDate instanceof Date) || !(endDate instanceof Date)) {
      throw new Error("Invalid date provided.");
    }

    // Check that both dates are in the future
    if (startDate <= now) {
      return { valid: false, message: "Start date must be in the future." };
    }
    if (endDate <= now) {
      return { valid: false, message: "End date must be in the future." };
    }

    // Check that endDate is after startDate
    if (endDate <= startDate) {
      return { valid: false, message: "End date must be after Start date." };
    }

    // All checks passed
    return { valid: true, message: "Dates are valid." };
  }


}

export default new Utils()