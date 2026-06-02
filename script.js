const hero = document.getElementById("hero");
const heroBg = document.querySelector(".hero-bg");
const about = document.querySelector(".about");
const logo = document.querySelector(".logo");
const navbar = document.getElementById("navbar");
const gear = document.getElementById("gear");
const gearContainer = document.getElementById("gearContainer");
const switchGroup = document.getElementById("switchGroup");
const horizontalSection = document.querySelector(".horizontal-section");
const wrapper = document.querySelector(".horizontal-wrapper");
const projectsSection = document.getElementById("projects");
const projectsTrack = document.querySelector(".projects-track");
const modalProject = document.getElementById("projectModal");
const projectTitle = document.getElementById("projectTitle");
const projectContent = document.getElementById("projectContent");
const closeProject = document.getElementById("closeProject");
const scrollIndicator = document.getElementById("scrollIndicator");
const langToggle = document.getElementById("langToggle");
const knobText = document.querySelector(".knob-text");
const themeToggle = document.getElementById("themeToggle");
const logoNav = document.getElementById("logoNav");

let isDragging = false;
let lastX = 0;
let rotationY = 0;
let autoRotateSpeed = 0.1;
let velocity = 0;
let zoomProgress = 0;
let isZoomFinished = false;
let heroFinished = false;
let translations = {};
let currentSlide = 0;
let autoSlide;
let autoSlideDelay;
let wheelLocked = false;

function autoRotate() {
    if (!isDragging) {
        rotationY += autoRotateSpeed;
        logo.style.transform = `rotateY(${rotationY}deg)`;
    }
    requestAnimationFrame(autoRotate);
}
autoRotate();

// klik & tahan
logo.addEventListener("mousedown", (e) => {
    isDragging = true;
    lastX = e.clientX;
    velocity = 0;
});

// gerak mouse
window.addEventListener("mousemove", (e) => {
    if (!isDragging) return;

    const deltaX = e.clientX - lastX;
    lastX = e.clientX;

    velocity = deltaX * 0.4;
    rotationY += velocity;

    logo.style.transform = `rotateY(${rotationY}deg)`;
});

// lepas klik
window.addEventListener("mouseup", () => {
    if (!isDragging) return;
    isDragging = false;
    autoRotateSpeed = velocity * 0.2;
});

// Touch start
logo.addEventListener("touchstart", (e) => {
    isDragging = true;
    lastX = e.touches[0].clientX;
    velocity = 0;
}, { passive: true });

// Touch move
window.addEventListener("touchmove", (e) => {
    if (!isDragging) return;

    const currentX = e.touches[0].clientX;
    const deltaX = currentX - lastX;
    lastX = currentX;

    velocity = deltaX * 0.3;
    rotationY += velocity;

    logo.style.transform = `rotateY(${rotationY}deg)`;
}, { passive: true });

// Touch end
window.addEventListener("touchend", () => {
    if (!isDragging) return;

    isDragging = false;
    autoRotateSpeed = velocity * 0.2;
});

// Default settings
function getDefaultLanguage() {
    const saved = localStorage.getItem("lang");
    if (saved) return saved;

    const browserLang = navigator.language.toLowerCase();
    return browserLang.includes("id") ? "ID" : "EN";
}

function getDefaultTheme() {
    const saved = localStorage.getItem("theme");
    if (saved) return saved;

    return window.matchMedia("(prefers-color-scheme: light)").matches
        ? "light"
        : "dark";
}

// Load translations
async function loadTranslations() {
    const res = await fetch("translations.json");
    translations = await res.json();
}

// Lang Switch
function setLanguage(lang) {
    document.body.classList.remove("lang-en", "lang-id");
    document.body.classList.add(lang === "ID" ? "lang-id" : "lang-en");
    document.querySelectorAll("[data-lang]").forEach(el => {
        const key = el.getAttribute("data-lang");

        if (!translations[lang] || !translations[lang][key]) return;

        if (key === "about_content") {
            el.innerHTML = translations[lang][key]
                .replace(/\*(.*?)\*/g, '<span class="accent-text">$1</span>')
                .replace(/\n/g, "<br>");
        } else {
            el.textContent = translations[lang][key];
        }
    });

    knobText.textContent = lang;
    langToggle.checked = lang === "ID";
    localStorage.setItem("lang", lang);
    updateScrollIndicator();
}

langToggle.addEventListener("change", () => {
    const lang = langToggle.checked ? "ID" : "EN";
    setLanguage(lang);
    knobText.textContent = lang;
});

// Theme Switch
function updateGearIcon(theme) {
    const gearImg = document.querySelector("#gear img");

    const isNavbar = window.scrollY > window.innerHeight * 0.8;

    if (!isNavbar) {
        gearImg.src = "Images/Dark/Gear.png";
    } else {
        gearImg.src = theme === "light"
            ? "Images/Light/Gear.png"
            : "Images/Dark/Gear.png";
    }
}

function setTheme(theme) {
    if (theme === "light") {
        document.body.classList.add("light");
        themeToggle.checked = true;
    } else {
        document.body.classList.remove("light");
        themeToggle.checked = false;
    }

    updateImages(theme);
    localStorage.setItem("theme", theme);
    printLogo(theme);
    updateGearIcon(theme);
}

themeToggle.addEventListener("change", () => {
    const theme = themeToggle.checked ? "light" : "dark";
    setTheme(theme);
});

// Update image
function updateImages(theme) {
    const images = document.querySelectorAll("img");

    images.forEach(img => {
        if (theme === "light") {
            img.src = img.src.replace("/Dark/", "/Light/");
        } else {
            img.src = img.src.replace("/Light/", "/Dark/");
        }
    });
}

//Init settings
async function initSettings() {
    await loadTranslations();

    const defaultLang = getDefaultLanguage();
    const defaultTheme = getDefaultTheme();

    setLanguage(defaultLang);
    setTheme(defaultTheme);
}

initSettings();

// Auto detect theme change
window.matchMedia("(prefers-color-scheme: light)")
    .addEventListener("change", e => {
        if (!localStorage.getItem("theme")) {
            setTheme(e.matches ? "light" : "dark");
        }
    });

// handle scroll
window.addEventListener("scroll", () => {
    const scrollY = window.scrollY;
    const vh = window.innerHeight;

    let progress = scrollY / vh;
    progress = Math.min(progress, 1);

    heroBg.style.transform = `
        scale(${1 + Math.pow(progress, 1.5) * 2.5})
        translateY(${Math.pow(progress, 1.5) * 30}px)
    `;

    logo.style.opacity = 1 - progress * 1.2;
    scrollIndicator.style.opacity = 1 - progress * 1.5;
    document.querySelector(".title-container").style.opacity = 1 - progress * 1.2;

    if (progress > 0.65) {
        const fadeOut = (progress - 0.65) * 3;
        heroBg.style.opacity = 1 - fadeOut;
    } else {
        heroBg.style.opacity = 1;
    }

    if (progress > 0.95) {
        hero.classList.add("disable");
    } else {
        hero.classList.remove("disable");
    }

    const aboutStart = 0.75;
    const aboutEnd = 1.1;

    if (progress > aboutStart) {
        let showProgress = (progress - aboutStart) / (aboutEnd - aboutStart);
        showProgress = Math.min(Math.max(showProgress, 0), 1);

        const eased = 1 - Math.pow(1 - showProgress, 2);
        const scale = 0.85 + eased * 0.15;

        about.style.opacity = eased;
        about.style.transform = `scale(${scale})`;
    } else {
        about.style.opacity = 0;
        about.style.transform = `scale(0.85)`;
    }

    if (scrollY > window.innerHeight * 0.9) {
        navbar.classList.add("show");
        gearContainer.classList.add("in-navbar");
    } else {
        navbar.classList.remove("show");
        gearContainer.classList.remove("in-navbar");
        closeMobileMenu();
    }

    const sectionTop = horizontalSection.offsetTop;
    const sectionHeight = horizontalSection.offsetHeight;
    const scrollInside = scrollY - sectionTop;
    const buffer = vh * 0.75;
    const aboutScrollWidth = window.innerWidth;
    const projectScrollStart = aboutScrollWidth;

    if (scrollInside > buffer) {
        const speedMultiplier = 2.5;
        let moveX = (scrollInside - buffer) * speedMultiplier;

        if (moveX <= aboutScrollWidth) {
            wrapper.style.transform = `translateX(-${moveX}px)`;
        } else {
            wrapper.style.transform = `translateX(-${aboutScrollWidth}px)`;

            let projectMove = moveX - projectScrollStart;
            projectMove = Math.max(0, projectMove);

            const maxProjectScroll = projectsTrack.scrollWidth - window.innerWidth;
            projectMove = Math.min(projectMove, maxProjectScroll);

            projectsTrack.style.transform = `translateX(-${projectMove}px)`;
        }

    } else {
        wrapper.style.transform = `translateX(0px)`;
        projectsTrack.style.transform = `translateX(0px)`;
    }

    if (scrollY >= projectsSection.offsetTop - vh &&
        scrollY <= projectsSection.offsetTop + sectionHeight) {
        document.querySelector(".projects-title").style.opacity = 1;
    }

    const section = document.getElementById("servicesSection");
    const services = document.getElementById("services");
    const contact = document.getElementById("contact");
    const start = section.offsetTop + buffer;
    const end = section.offsetTop + section.offsetHeight;
    const animationRange = (end - start - window.innerHeight) * 2;

    if (!isMobile()) {
        if (scrollY >= start && scrollY <= end) {
            let progress = (scrollY - start) / animationRange;
            progress = Math.min(Math.max(progress, 0), 1);

            const eased = 1 - Math.pow(1 - progress, 3);

            contact.style.transform = `translateY(${100 - eased * 100}%)`;
            services.style.transform = `scale(${1 - eased * 0.1})`;
        }
    } else {
        services.style.transform = "none";
        contact.style.transform = "none";
    }
    const theme = themeToggle.checked ? "light" : "dark";
    updateGearIcon(theme);
});

function setHorizontalHeight() {
    const vh = window.innerHeight;
    const aboutWidth = window.innerWidth;
    const projectWidth = projectsTrack.scrollWidth;
    let speedFactor = 0.5;

    if (window.innerWidth <= 1024 && window.innerWidth > 768) {
        speedFactor = 0.6;
    }

    const totalScroll = (aboutWidth + projectWidth) * speedFactor;
    horizontalSection.style.height = totalScroll + vh + "px";
}

window.addEventListener("load", setHorizontalHeight);
window.addEventListener("resize", setHorizontalHeight);

gear.addEventListener("click", () => {
    gear.classList.toggle("rotate");
    switchGroup.classList.toggle("show");
});

// Navbar animation
logoNav.addEventListener("click", () => {
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
    closeMobileMenu();
});

document.querySelectorAll(".nav-center a").forEach(link => {
    link.addEventListener("click", (e) => {
        e.preventDefault();

        const id = link.getAttribute("href");
        scrollToSection(id);
    });
});

function scrollToSection(id) {
    const vh = window.innerHeight;

    const horizontalStart = document.querySelector(".horizontal-section").offsetTop;
    const servicesStart = document.getElementById("servicesSection").offsetTop;
    const servicesSection = document.getElementById("servicesSection");
    const contactStart = servicesSection.offsetTop;

    if (isMobile()) {
        if (id === "#about") {
            window.scrollTo({
                top: horizontalStart,
                behavior: "smooth"
            });
        }

        else if (id === "#projects") {
            window.scrollTo({
                top: horizontalStart + vh * 1.45,
                behavior: "smooth"
            });
        }

        else if (id === "#services") {
            window.scrollTo({
                top: servicesStart,
                behavior: "smooth"
            });
        }

        else if (id === "#contact") {
            window.scrollTo({
                top: contactStart + window.innerHeight * 2.5,
                behavior: "smooth"
            });
        }
    } else {
        if (id === "#about") {
            window.scrollTo({
                top: horizontalStart,
                behavior: "smooth"
            });
        }

        else if (id === "#projects") {
            window.scrollTo({
                top: horizontalStart + vh * 1.7,
                behavior: "smooth"
            });
        }

        else if (id === "#services") {
            window.scrollTo({
                top: servicesStart,
                behavior: "smooth"
            });
        }

        else if (id === "#contact") {
            window.scrollTo({
                top: contactStart + window.innerHeight * 1,
                behavior: "smooth"
            });
        }
    }
}

// Download CV
function downloadCV() {
    const link = document.createElement("a");
    link.href = "Files/CV Brian Farrel.pdf";
    link.download = "CV Brian Farrel.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// klik project
document.querySelectorAll(".project-gallery").forEach(item => {
    item.addEventListener("click", () => {

        const id = item.closest(".project-item").dataset.project;
        const data = projectData[id];
        if (!data) return;

        const currentLang = localStorage.getItem("lang") || "EN";

        projectTitle.textContent = translations[currentLang][data.title];
        document.getElementById("projectDesc").innerHTML = accentText(translations[currentLang][data.desc]);
        document.getElementById("projectLogo").src = data.logo;

        initSlider(data.images);

        const techTrack = document.getElementById("techTrack");
        const techHTML = data.tech
            .map(t => `<span>${t}</span>`)
            .join("");

        techTrack.innerHTML = `
            <div class="tech-set">${techHTML}</div>
            <div class="tech-set">${techHTML}</div>
            <div class="tech-set">${techHTML}</div>
            <div class="tech-set">${techHTML}</div>
            <div class="tech-set">${techHTML}</div>
            <div class="tech-set">${techHTML}</div>
        `;
        openModal(modalProject);
    });
});

function initSlider(images) {
    const track = document.getElementById("sliderTrack");
    const dotsContainer = document.getElementById("sliderDots");

    if (!track || !dotsContainer) return;

    track.innerHTML = "";
    dotsContainer.innerHTML = "";

    const firstClone = images[0];
    const lastClone = images[images.length - 1];
    const fullImages = [lastClone, ...images, firstClone];

    fullImages.forEach(src => {
        const img = document.createElement("img");
        img.src = src;
        track.appendChild(img);
    });

    images.forEach((_, i) => {
        const dot = document.createElement("span");
        if (i === 0) dot.classList.add("active");

        dot.addEventListener("click", () => {
            currentSlide = i + 1;
            updateSlider(track, dotsContainer);
            resetAutoSlide(images.length, track, dotsContainer);
        });

        dotsContainer.appendChild(dot);
    });

    currentSlide = 1;
    track.style.transform = `translateX(-100%)`;

    updateDots(dotsContainer);

    startAutoSlide(images.length, track, dotsContainer);

    enableWheelOnHover(track, images.length, dotsContainer);
}

function updateSlider(track, dotsContainer) {
    const slide = track.querySelector("img");
    const slideWidth = slide.clientWidth;

    track.style.transform = `translateX(-${currentSlide * slideWidth}px)`;
    updateDots(dotsContainer);
}

function updateDots(dotsContainer) {
    let index = currentSlide - 1;

    if (index < 0) index = dotsContainer.children.length - 1;
    if (index >= dotsContainer.children.length) index = 0;

    [...dotsContainer.children].forEach((dot, i) => {
        dot.classList.toggle("active", i === index);
    });
}

function handleLoop(track, length) {
    if (currentSlide === length + 1) {
        setTimeout(() => {
            track.style.transition = "none";
            currentSlide = 1;
            track.style.transform = `translateX(-100%)`;
        }, 500);
    }

    if (currentSlide === 0) {
        setTimeout(() => {
            track.style.transition = "none";
            currentSlide = length;
            track.style.transform = `translateX(-${length * 100}%)`;
        }, 500);
    }
}

function startAutoSlide(length, track, dotsContainer) {
    clearInterval(autoSlide);

    autoSlide = setInterval(() => {
        currentSlide++;
        track.style.transition = "transform 0.5s ease";

        updateSlider(track, dotsContainer);
        handleLoop(track, length);

    }, 3000);
}

function resetAutoSlide(length, track, dotsContainer) {
    clearInterval(autoSlide);

    clearTimeout(autoSlideDelay);

    autoSlideDelay = setTimeout(() => {
        startAutoSlide(length, track, dotsContainer);
    }, 4000);
}

function enableWheelOnHover(track, length, dotsContainer) {

    track.addEventListener("wheel", (e) => {
        if (!track.matches(":hover")) return;

        e.preventDefault();

        if (wheelLocked) return;
        wheelLocked = true;

        track.style.transition = "transform 0.5s ease";

        if (e.deltaY > 0) {
            currentSlide++;
        } else {
            currentSlide--;
        }

        updateSlider(track, dotsContainer);
        handleLoop(track, length);

        resetAutoSlide(length, track, dotsContainer);

        setTimeout(() => {
            wheelLocked = false;
        }, 600);
    }, { passive: false });

    let startX = 0;
    let endX = 0;

    track.addEventListener("touchstart", (e) => {
        startX = e.touches[0].clientX;
    }, { passive: true });

    track.addEventListener("touchmove", (e) => {
        endX = e.touches[0].clientX;
    }, { passive: true });

    track.addEventListener("touchend", () => {

        const diffX = startX - endX;

        if (Math.abs(diffX) < 50) return;

        if (wheelLocked) return;
        wheelLocked = true;

        track.style.transition = "transform 0.5s ease";

        if (diffX > 0) {
            currentSlide++;
        }
        else {
            currentSlide--;
        }

        updateSlider(track, dotsContainer);
        handleLoop(track, length);

        resetAutoSlide(length, track, dotsContainer);

        setTimeout(() => {
            wheelLocked = false;
        }, 600);
    });
}

const projectData = {
    "1": {
        title: "project_title1",
        images: [
            "Images/Projects/1/Dokumentasi 1.png",
            "Images/Projects/1/Dokumentasi 2.png",
            "Images/Projects/1/Dokumentasi 3.png"
        ],
        tech: ["Python", "PySide6", "Data Visualization", "Desktop Application Development"],
        desc: "project_long_desc1",
        logo: "Images/Projects/1/Logo Mitra.png"
    },
    "2": {
        title: "project_title2",
        images: [
            "Images/Projects/2/Dokumentasi 1.png",
            "Images/Projects/2/Dokumentasi 2.png",
            "Images/Projects/2/Dokumentasi 3.png"
        ],
        tech: ["Python", "PySide6", "Data Visualization", "Desktop Application Development"],
        desc: "project_long_desc2",
        logo: "Images/Projects/2/Logo Mitra.png"
    },
    "3": {
        title: "project_title3",
        images: [
            "Images/Projects/3/Dokumentasi 1.png",
            "Images/Projects/3/Dokumentasi 2.png",
            "Images/Projects/3/Dokumentasi 3.png"
        ],
        tech: ["Laravel", "HTML", "CSS", "JavaScript", "PHP", "MySQL", "Web Development"],
        desc: "project_long_desc3",
        logo: "Images/Projects/3/Logo Mitra.png"
    },
    "4": {
        title: "project_title4",
        images: [
            "Images/Projects/4/Dokumentasi 1.png",
            "Images/Projects/4/Dokumentasi 2.png",
            "Images/Projects/4/Dokumentasi 3.png"
        ],
        tech: ["Laravel", "HTML", "CSS", "JavaScript", "PHP", "Firebase", "Web Development"],
        desc: "project_long_desc4",
        logo: "Images/Projects/4/Logo Mitra.png"
    }
};

//Highlight words
function accentText(text) {
    return text
        .replace(/\*(.*?)\*/g, '<span class="accent-text">$1</span>')
        .replace(/\n/g, "<br>");
}

// Back
closeProject.addEventListener("click", () => {
    closeModal(modalProject);
    clearInterval(autoSlide);
});

modalProject.addEventListener("click", (e) => {

    if (e.target === modalProject) {
        closeModal(modalProject);
    }

    if (e.target.classList.contains("service-trigger")) {
        const servicesStart = document.getElementById("servicesSection").offsetTop;
        closeModal(modalProject);

        window.scrollTo({
            top: servicesStart,
            behavior: "smooth"
        });
    }
});

function openModal(modal) {
    modal.classList.add("show");
    document.body.style.overflow = "hidden";
}

function closeModal(modal) {
    modal.classList.remove("show");
    document.body.style.overflow = "auto";
}

// Service Item
document.querySelectorAll(".service-card").forEach(card => {
    card.addEventListener("click", () => {
        if (isMobile()) {
            const contact = document.getElementById("contact");
            if (!contact) return;

            contact.scrollIntoView({
                top: contact.offsetTop,
                behavior: "smooth"
            });

        } else {
            const servicesSection = document.getElementById("servicesSection");
            const contactStart = servicesSection.offsetTop;

            window.scrollTo({
                top: contactStart + window.innerHeight * 1,
                behavior: "smooth"
            });
        }
    });
});

// Tablet & Mobile
const hamburger = document.getElementById("hamburger");
const mobileMenu = document.getElementById("mobileMenu");
const scrollText = document.querySelector("#scrollIndicator p");
const scrollImg = document.querySelector("#scrollIndicator img");

hamburger.addEventListener("click", () => {
    hamburger.classList.toggle("active");
    mobileMenu.classList.toggle("show");
});

document.querySelectorAll(".mobile-menu a").forEach(link => {
    link.addEventListener("click", (e) => {
        e.preventDefault();

        const id = link.getAttribute("href");
        scrollToSection(id);

        closeMobileMenu();
    });
});

function closeMobileMenu() {
    hamburger.classList.remove("active");
    mobileMenu.classList.remove("show");
}

function isMobile() {
    return window.innerWidth <= 1024;
}

function updateScrollIndicator() {
    const currentLang = localStorage.getItem("lang") || "EN";

    if (!scrollText || !scrollImg) return;

    if (isMobile()) {
        scrollText.textContent = translations[currentLang]["scroll_up"];
        scrollImg.src = "Images/Dark/Up Arrow.png";
    } else {
        scrollText.textContent = translations[currentLang]["scroll_down"];
        scrollImg.src = "Images/Dark/Down Arrow.png";
    }
}
window.addEventListener("load", updateScrollIndicator);
window.addEventListener("resize", updateScrollIndicator);

window.addEventListener("scroll", () => {
    if (!isMobile()) return;

    if (wrapper) wrapper.style.transform = "translateX(0px)";
    if (projectsTrack) projectsTrack.style.transform = "translateX(0px)";

    if (horizontalSection) {
        horizontalSection.style.height = "auto";
    }
});

window.addEventListener("resize", () => {
    if (!isMobile()) return;

    if (wrapper) wrapper.style.transform = "translateX(0px)";
    if (projectsTrack) projectsTrack.style.transform = "translateX(0px)";

    if (horizontalSection) {
        horizontalSection.style.height = "auto";
    }
});
window.addEventListener("resize", updateScrollIndicator);

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add("show-up");
        } else {
            entry.target.classList.remove("show-up");
        }
    });
}, {
    threshold: 0.2
});

document.querySelectorAll(".service-card").forEach(el => observer.observe(el));

// Watermark
function printLogo(theme) {
    const isDark = theme === "dark";

    const brianStyle = isDark
        ? "color: orange; font-weight: bold;"
        : "color: cyan; font-weight: bold;";

    const farrelStyle = isDark
        ? "color: black; font-weight: bold;"
        : "color: white; font-weight: bold;";

    // console.clear();

    console.log(
        `%c
    ██████╗ ██████╗ ██╗ █████╗ ███╗   ██╗
    ██╔══██╗██╔══██╗██║██╔══██╗████╗  ██║
    ██████╔╝██████╔╝██║███████║██╔██╗ ██║
    ██╔══██╗██╔══██╗██║██╔══██║██║╚██╗██║
    ██████╔╝██║  ██║██║██║  ██║██║ ╚████║
    ╚═════╝ ╚═╝  ╚═╝╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝
        %c
 ███████╗ █████╗ ██████╗ ██████╗ ███████╗██╗
 ██╔════╝██╔══██╗██╔══██╗██╔══██╗██╔════╝██║
 ██████╗ ███████║██████╔╝██████╔╝██████╗ ██║
 ██╔═══╝ ██╔══██║██╔══██╗██╔══██╗██╔═══╝ ██║
 ██║     ██║  ██║██║  ██║██║  ██║███████╗███████╗
 ╚═╝     ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝╚══════╝`,
        brianStyle,
        farrelStyle
    );
};