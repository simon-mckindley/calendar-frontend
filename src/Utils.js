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

  formatTextWithLineBreaks(text) {
    return text.replace(/\n/g, "<br>");
  }


  // Utility function to format date in "25 February 2024" format
  formatDateAU(date) {
    const formattedDate = new Date(date);
    const options = { day: "numeric", month: "long", year: "numeric" };
    return formattedDate.toLocaleDateString("en-AU", options);
  }

  formatDateTimeAU(date) {
    const formattedDate = new Date(date);

    // Options for the day, month, and year in the correct format
    const dateOptions = { day: "numeric", month: "long", year: "numeric" };
    const datePart = formattedDate.toLocaleDateString("en-AU", dateOptions);

    // Extract the time in the format HH:MM with AM/PM
    let hours = formattedDate.getHours();
    const minutes = formattedDate.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'pm' : 'am';

    hours = hours % 12 || 12; // Convert to 12-hour format and handle midnight as 12

    // Combine time and date parts
    return `${hours}:${minutes}${ampm} ${datePart}`;
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