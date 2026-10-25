/**
 * Genesis Lumia ERP — School Operations Guide
 * Interaction Engine: ScrollSpy, Filtering, Accordions, Modal Sheet & Copy Utilities
 */
document.addEventListener("DOMContentLoaded", () => {
  // Check for print mode
  const isPrint = matchMedia("print").matches || new URLSearchParams(location.search).has("print");

  // 1. Operational Statistics Counter Animation
  const statNumbers = document.querySelectorAll("[data-count]");
  if (isPrint) {
    statNumbers.forEach((el) => {
      el.textContent = el.dataset.count;
    });
  } else {
    const counterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          const target = parseInt(el.dataset.count, 10);
          const duration = 1200;
          const start = performance.now();

          const updateCounter = (now) => {
            const elapsed = Math.min((now - start) / duration, 1);
            // Cubic ease-out
            const progress = 1 - Math.pow(1 - elapsed, 3);
            el.textContent = Math.round(target * progress);

            if (elapsed < 1) {
              requestAnimationFrame(updateCounter);
            } else {
              el.textContent = target;
            }
          };

          requestAnimationFrame(updateCounter);
          counterObserver.unobserve(el);
        });
      },
      { threshold: 0.4 }
    );

    statNumbers.forEach((el) => counterObserver.observe(el));
  }

  // 2. Reading Scroll Progress Bar
  const progressBar = document.getElementById("scroll-progress");
  const updateScrollProgress = () => {
    if (!progressBar) return;
    const scrollTotal = document.documentElement.scrollHeight - window.innerHeight;
    const current = window.scrollY;
    const pct = scrollTotal > 0 ? (current / scrollTotal) * 100 : 0;
    progressBar.style.width = `${Math.min(100, Math.max(0, pct))}%`;
  };
  window.addEventListener("scroll", updateScrollProgress, { passive: true });

  // 3. Topbar Elevation on Scroll
  const topbar = document.querySelector(".topbar");
  const updateTopbarShadow = () => {
    if (!topbar) return;
    if (window.scrollY > 15) {
      topbar.classList.add("scrolled");
    } else {
      topbar.classList.remove("scrolled");
    }
  };
  window.addEventListener("scroll", updateTopbarShadow, { passive: true });

  // 4. Back-to-Top Floating Button
  const backToTop = document.getElementById("back-to-top");
  if (backToTop) {
    window.addEventListener(
      "scroll",
      () => {
        if (window.scrollY > 350) {
          backToTop.classList.add("visible");
        } else {
          backToTop.classList.remove("visible");
        }
      },
      { passive: true }
    );

    backToTop.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  // 5. Category Filtering for 10 Core Processes
  const filterTabs = document.querySelectorAll(".filter-tab");
  const processCards = document.querySelectorAll(".process-card");

  filterTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      filterTabs.forEach((t) => {
        t.classList.remove("active");
        t.setAttribute("aria-selected", "false");
      });
      tab.classList.add("active");
      tab.setAttribute("aria-selected", "true");

      const filter = tab.dataset.filter;
      processCards.forEach((card) => {
        const category = card.dataset.category;
        if (filter === "all" || category === filter) {
          card.style.display = "block";
          card.style.opacity = "1";
        } else {
          card.style.display = "none";
        }
      });
    });
  });

  // 6. Mobile Approval Matrix Expandable Cards
  const mobileApprovalHeaders = document.querySelectorAll(".mobile-approval-header");
  mobileApprovalHeaders.forEach((header) => {
    header.addEventListener("click", () => {
      const card = header.closest(".mobile-approval-card");
      if (card) {
        card.classList.toggle("expanded");
      }
    });
  });

  // 7. Click-to-Copy with Feedback Toast
  const toast = document.getElementById("toast");
  let toastTimer = null;

  const displayToast = (message) => {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove("show");
    }, 2400);
  };

  const copyableElements = document.querySelectorAll("[data-copy]");
  copyableElements.forEach((el) => {
    el.addEventListener("click", async (e) => {
      e.stopPropagation();
      const textToCopy = el.dataset.copy;
      if (!textToCopy) return;

      try {
        await navigator.clipboard.writeText(textToCopy);
        displayToast(`✓ Copied: ${textToCopy}`);
      } catch (err) {
        // Fallback for legacy environments
        const textArea = document.createElement("textarea");
        textArea.value = textToCopy;
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
          document.execCommand("copy");
          displayToast(`✓ Copied: ${textToCopy}`);
        } catch {
          displayToast(`Credential: ${textToCopy}`);
        }
        document.body.removeChild(textArea);
      }
    });
  });

  // 8. Mobile "More" Sheet Modal Logic
  const moreTrigger = document.getElementById("mobile-more-trigger");
  const menuTrigger = document.getElementById("mobile-menu-trigger");
  const sheet = document.getElementById("mobile-sheet");
  const sheetBackdrop = document.getElementById("mobile-sheet-backdrop");
  const sheetClose = document.getElementById("mobile-sheet-close");
  const sheetLinks = document.querySelectorAll(".mobile-sheet-link");
  const allMobileNavItems = document.querySelectorAll(".mobile-bottom-nav .mobile-nav-item");

  const openSheet = () => {
    if (sheet && sheetBackdrop) {
      sheetBackdrop.classList.add("open");
      sheet.classList.add("open");
      document.body.style.overflow = "hidden";
      allMobileNavItems.forEach((i) => i.classList.remove("active"));
      if (moreTrigger) moreTrigger.classList.add("active");
    }
  };

  const closeSheet = () => {
    if (sheet && sheetBackdrop) {
      sheet.classList.remove("open");
      sheetBackdrop.classList.remove("open");
      document.body.style.overflow = "";
      syncActiveNav();
    }
  };

  if (moreTrigger) moreTrigger.addEventListener("click", openSheet);
  if (menuTrigger) menuTrigger.addEventListener("click", openSheet);
  if (sheetClose) sheetClose.addEventListener("click", closeSheet);
  if (sheetBackdrop) sheetBackdrop.addEventListener("click", closeSheet);

  sheetLinks.forEach((link) => {
    link.addEventListener("click", () => {
      closeSheet();
    });
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && sheet && sheet.classList.contains("open")) {
      closeSheet();
    }
  });

  // 9. ScrollSpy for Desktop Nav & Mobile Bottom Nav
  const sections = document.querySelectorAll("header[id], section[id]");
  const desktopNavLinks = document.querySelectorAll(".desktop-nav .nav-link");
  const mobileNavItems = document.querySelectorAll(".mobile-bottom-nav .mobile-nav-item[href]");
  const footerEl = document.querySelector(".footer");

  const syncActiveNav = () => {
    // If scrolled near bottom to footer, activate "More" tab as in design reference
    const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 160;
    if (atBottom) {
      mobileNavItems.forEach((item) => item.classList.remove("active"));
      if (moreTrigger) moreTrigger.classList.add("active");
      return;
    }

    if (moreTrigger) moreTrigger.classList.remove("active");

    const scrollPos = window.scrollY + 100;
    let currentId = "overview";

    sections.forEach((section) => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        currentId = section.getAttribute("id");
      }
    });

    desktopNavLinks.forEach((link) => {
      link.classList.remove("active");
      if (link.getAttribute("href") === `#${currentId}`) {
        link.classList.add("active");
      }
    });

    mobileNavItems.forEach((item) => {
      item.classList.remove("active");
      if (item.getAttribute("href") === `#${currentId}`) {
        item.classList.add("active");
      }
    });
  };

  window.addEventListener("scroll", syncActiveNav, { passive: true });
  syncActiveNav();
});
