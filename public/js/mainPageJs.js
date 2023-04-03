// Animate the hero section when the page loads
$(window).on('load', function() {
  // hide the loading animation
  $('.loader').fadeOut();
});

$(document).ready(function() {
  // show the loading animation
  $('.loader').show();
});

window.onload = function () {
  // Get the hero section element
  const heroSection = document.querySelector(".hero-section");

  // Set the initial opacity to 0
  heroSection.style.opacity = 0;

  // Animate the opacity to 1 over 1 second
  let opacity = 0;
  let intervalId = setInterval(function () {
    opacity += 0.01;
    heroSection.style.opacity = opacity;
    if (opacity >= 1) clearInterval(intervalId);
  }, 10);

  // Add a smooth scroll effect to links that point to sections within the same page
  const pageLinks = document.querySelectorAll('a[href^="#"]');
  for (let i = 0; i < pageLinks.length; i++) {
    pageLinks[i].addEventListener("click", function (event) {
      event.preventDefault();
      const target = document.querySelector(this.getAttribute("href"));
      target.scrollIntoView({
        behavior: "smooth",
      });
    });
  }

  // Add a parallax effect to the hero section background
  const heroBg = document.querySelector(".hero-section-bg");
  window.addEventListener("scroll", function () {
    let scrollPosition = window.pageYOffset;
    heroBg.style.transform = `translateY(${scrollPosition * 0.5}px)`;
  });
};


// Get all links in the navigation bar
const navLinks = document.querySelectorAll('nav ul li a');

// Add event listeners to each link
navLinks.forEach(link => {
  link.addEventListener('click', () => {
    // Remove active class from all links
    navLinks.forEach(link => {
      link.classList.remove('active');
    });

    // Add active class to the clicked link
    link.classList.add('active');
  });
});

// Add event listener to the window to check which section is in view
window.addEventListener('scroll', () => {
  // Get the current scroll position
  const currentScrollPos = window.pageYOffset;

  // Loop through all sections
  document.querySelectorAll('section').forEach(section => {
    // Get the top and bottom position of the section
    const topPos = section.offsetTop - 100; // subtract any margin or padding on the section
    const bottomPos = topPos + section.offsetHeight;

    // Check if the section is in view
    if (currentScrollPos >= topPos && currentScrollPos < bottomPos) {
      // Remove active class from all links
      navLinks.forEach(link => {
        link.classList.remove('active');
      });

      // Get the link that points to the current section and add active class to it
      const link = document.querySelector(`nav ul li a[href="#${section.id}"]`);
      link.classList.add('active');
    } else {
      // If the section is not in view, remove active class from the corresponding link
      const link = document.querySelector(`nav ul li a[href="#${section.id}"]`);
      link.classList.remove('active');
    }
  });
});



// About us

// $(document).ready(function() {
//   $('.owl-carousel').owlCarousel({
//     loop:true,
//     margin:10,
//     nav:false,
//     dots:true,
//     autoplay:true,
//     autoplayTimeout:3000,
//     responsive:{
//       0:{
//         items:1
//       },
//       600:{
//         items:2
//       },
//       1000:{
//         items:3
//       }
//     }
//   });
// });

    // Add animation class to cards when they are visible on the screen
// $(window).scroll(function () {
//     $('.employee-card').each(function () {
//         var top_of_element = $(this).offset().top;
//         var bottom_of_element = $(this).offset().top + $(this).outerHeight();
//         var bottom_of_screen = $(window).scrollTop() + $(window).innerHeight();
//         var top_of_screen = $(window).scrollTop();

//         if ((bottom_of_screen > top_of_element) && (top_of_screen < bottom_of_element)) {
//             $(this).addClass('animate__animated animate__fadeInUp');
//         }
//     });
// });
