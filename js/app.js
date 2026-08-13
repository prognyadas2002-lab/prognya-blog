/* ==========================================================================
   KOLKATA FOOD CHRONICLES - FRONTEND JAVASCRIPT LOGIC
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initSearchModal();
  initRestaurantFilters();
  initRecipeScalerAndModal();
  initCommunityForm();
  initCityGuidesSharing();
});

/* --------------------------------------------------------------------------
   1. NAVIGATION & SINGLE PAGE ROUTER
   -------------------------------------------------------------------------- */
function initNavigation() {
  const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');
  const pageViews = document.querySelectorAll('.page-view');
  const mobileToggle = document.getElementById('mobileToggle');
  const mobileDrawer = document.getElementById('mobileDrawer');

  function setActiveView(viewId) {
    const targetId = viewId || 'eats-out';

    pageViews.forEach(view => {
      if (view.id === targetId) {
        view.classList.add('active-view');
      } else {
        view.classList.remove('active-view');
      }
    });

    navLinks.forEach(link => {
      const linkHash = link.getAttribute('href').replace('#', '');
      if (linkHash === targetId) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (mobileDrawer.classList.contains('open')) {
      mobileDrawer.classList.remove('open');
    }
  }

  // Handle hash changes
  window.addEventListener('hashchange', () => {
    const hash = window.location.hash.replace('#', '');
    if (hash) setActiveView(hash);
  });

  // Initial load hash check
  const initialHash = window.location.hash.replace('#', '') || 'eats-out';
  setActiveView(initialHash);

  // Mobile Menu Toggle
  if (mobileToggle && mobileDrawer) {
    mobileToggle.addEventListener('click', () => {
      mobileDrawer.classList.toggle('open');
    });
  }
}

/* --------------------------------------------------------------------------
   2. SEARCH MODAL LOGIC
   -------------------------------------------------------------------------- */
function initSearchModal() {
  const searchTrigger = document.getElementById('searchTrigger');
  const searchModal = document.getElementById('searchModal');
  const closeSearchModal = document.getElementById('closeSearchModal');
  const searchInput = document.getElementById('searchInput');

  if (searchTrigger && searchModal) {
    searchTrigger.addEventListener('click', () => {
      searchModal.classList.add('open');
      setTimeout(() => searchInput.focus(), 100);
    });

    closeSearchModal.addEventListener('click', () => {
      searchModal.classList.remove('open');
    });

    searchModal.addEventListener('click', (e) => {
      if (e.target === searchModal) searchModal.classList.remove('open');
    });
  }
}

/* --------------------------------------------------------------------------
   3. KOLKATA PLACE DISCOVERY FILTERS (3 DROPDOWNS)
   -------------------------------------------------------------------------- */
function initRestaurantFilters() {
  const locationSelect = document.getElementById('locationFilter');
  const priceSelect = document.getElementById('priceFilter');
  const vibeSelect = document.getElementById('vibeFilter');
  const cards = document.querySelectorAll('.restaurant-card');

  function filterCards() {
    const selectedLocation = locationSelect ? locationSelect.value.toLowerCase() : 'all';
    const selectedPrice = priceSelect ? priceSelect.value.toLowerCase() : 'all';
    const selectedVibe = vibeSelect ? vibeSelect.value.toLowerCase() : 'all';

    let visibleCount = 0;

    cards.forEach(card => {
      const cardNeighborhood = (card.dataset.neighborhood || '').toLowerCase();
      const cardPrice = (card.dataset.price || '').toLowerCase();
      const cardVibe = (card.dataset.vibe || '').toLowerCase();

      // Check location match
      const matchLocation = (selectedLocation === 'all') || cardNeighborhood.includes(selectedLocation);

      // Check price match
      const matchPrice = (selectedPrice === 'all') || cardPrice.includes(selectedPrice);

      // Check vibe match
      const matchVibe = (selectedVibe === 'all') || cardVibe.includes(selectedVibe);

      if (matchLocation && matchPrice && matchVibe) {
        card.style.display = 'flex';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });

    // Handle no results message
    const grid = document.getElementById('restaurantGrid');
    let noResultsEl = document.getElementById('noFilterResults');
    if (visibleCount === 0) {
      if (!noResultsEl && grid) {
        noResultsEl = document.createElement('div');
        noResultsEl.id = 'noFilterResults';
        noResultsEl.className = 'no-results-msg';
        noResultsEl.innerHTML = '<h3>No Kolkata experiences match your exact filter combination.</h3><p>Try selecting "All Places" or resetting the Price/Vibe dropdowns to discover more places.</p>';
        grid.parentNode.appendChild(noResultsEl);
      } else if (noResultsEl) {
        noResultsEl.style.display = 'block';
      }
    } else if (noResultsEl) {
      noResultsEl.style.display = 'none';
    }
  }

  if (locationSelect) locationSelect.addEventListener('change', filterCards);
  if (priceSelect) priceSelect.addEventListener('change', filterCards);
  if (vibeSelect) vibeSelect.addEventListener('change', filterCards);
}

/* --------------------------------------------------------------------------
   4. RECIPE SCALER & MODAL LOGIC
   -------------------------------------------------------------------------- */
function initRecipeScalerAndModal() {
  const recipeModal = document.getElementById('recipeModal');
  const closeRecipeModal = document.getElementById('closeRecipeModal');
  const recipeDetailBtns = document.querySelectorAll('.view-recipe-btn');
  const scaleBtns = document.querySelectorAll('.scale-btn');
  const ingredientQuantities = document.querySelectorAll('.ingredient-qty');

  recipeDetailBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (recipeModal) recipeModal.classList.add('open');
    });
  });

  if (closeRecipeModal && recipeModal) {
    closeRecipeModal.addEventListener('click', () => {
      recipeModal.classList.remove('open');
    });
  }

  // Interactive Serving Scaler
  scaleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const scaleFactor = parseFloat(btn.dataset.scale);
      scaleBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      ingredientQuantities.forEach(qtyEl => {
        const baseQty = parseFloat(qtyEl.dataset.base);
        if (!isNaN(baseQty)) {
          qtyEl.textContent = (baseQty * scaleFactor).toFixed(1).replace(/\.0$/, '');
        }
      });

      showToast(`Adjusted recipe quantities for ${btn.textContent} portions`);
    });
  });
}

/* --------------------------------------------------------------------------
   5. COMMUNITY FORM SUBMISSION & LOCALSTORAGE FEED
   -------------------------------------------------------------------------- */
function initCommunityForm() {
  const form = document.getElementById('communityForm');
  const feedContainer = document.getElementById('communityFeedGrid');
  const fileInput = document.getElementById('photoInput');
  const dropzone = document.getElementById('dropzone');
  const previewThumb = document.getElementById('previewThumb');
  const starInputs = document.querySelectorAll('#starRatingSelect .star');
  
  let selectedRating = 5;
  let uploadedPhotoData = 'assets/images/shorshe_ilish.jpg';

  // Star rating selector
  starInputs.forEach(star => {
    star.addEventListener('click', () => {
      selectedRating = parseInt(star.dataset.value);
      starInputs.forEach((s, idx) => {
        if (idx < selectedRating) {
          s.classList.add('active');
        } else {
          s.classList.remove('active');
        }
      });
    });
  });

  // Photo uploader preview
  if (dropzone && fileInput) {
    dropzone.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          uploadedPhotoData = event.target.result;
          previewThumb.src = uploadedPhotoData;
          previewThumb.style.display = 'block';
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // Load existing reader posts from LocalStorage
  function loadCommunityPosts() {
    if (!feedContainer) return;
    const storedPosts = JSON.parse(localStorage.getItem('kfc_reader_posts') || '[]');
    
    // Render initial sample + stored posts
    if (storedPosts.length > 0) {
      storedPosts.forEach(post => {
        const postCard = document.createElement('article');
        postCard.className = 'restaurant-card';
        postCard.innerHTML = `
          <div class="card-image-wrap">
            <img src="${post.photo}" alt="${post.dish}">
            <div class="card-top-badges">
              <span class="badge badge-terracotta">${post.neighborhood}</span>
              <span class="star-rating">★ ${post.rating}.0</span>
            </div>
          </div>
          <div class="card-body">
            <div class="card-meta">
              <span>Submitted by <strong>${post.name}</strong></span>
              <span class="badge badge-green">Verified Reader</span>
            </div>
            <h3 class="card-title">${post.dish}</h3>
            <p>${post.story}</p>
            <div class="card-footer">
              <span style="font-size:0.85rem; color: var(--text-muted);">❤️ ${post.likes} Yums</span>
              <button class="btn btn-sm btn-outline like-btn">❤️ Yum!</button>
            </div>
          </div>
        `;
        feedContainer.prepend(postCard);
      });
    }
  }

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('authorName').value;
      const dish = document.getElementById('dishTitle').value;
      const neighborhood = document.getElementById('location').value;
      const story = document.getElementById('storyText').value;

      const newPost = {
        name,
        dish,
        neighborhood,
        story,
        rating: selectedRating,
        photo: uploadedPhotoData,
        likes: 1
      };

      const storedPosts = JSON.parse(localStorage.getItem('kfc_reader_posts') || '[]');
      storedPosts.push(newPost);
      localStorage.setItem('kfc_reader_posts', JSON.stringify(storedPosts));

      showToast('🎉 Your culinary story was published to The Reader’s Table!');
      form.reset();
      if (previewThumb) previewThumb.style.display = 'none';

      setTimeout(() => location.reload(), 1200);
    });
  }

  loadCommunityPosts();
}

/* --------------------------------------------------------------------------
   6. CITY GUIDES BOOKMARK & SHARING
   -------------------------------------------------------------------------- */
function initCityGuidesSharing() {
  document.addEventListener('click', (e) => {
    if (e.target.closest('.share-btn')) {
      const pageUrl = window.location.href;
      if (navigator.clipboard) {
        navigator.clipboard.writeText(pageUrl);
        showToast('📋 Link copied to clipboard! Share it with fellow foodies.');
      } else {
        showToast('🔗 Sharing enabled!');
      }
    }

    if (e.target.closest('.bookmark-btn')) {
      const btn = e.target.closest('.bookmark-btn');
      btn.classList.toggle('active');
      showToast(btn.classList.contains('active') ? '⭐ Saved to your foodie bookmarks!' : 'Removed from bookmarks');
    }
  });
}

/* --------------------------------------------------------------------------
   7. TOAST NOTIFICATION SYSTEM
   -------------------------------------------------------------------------- */
function showToast(message) {
  let toastContainer = document.querySelector('.toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<span>🍲</span> <span>${message}</span>`;
  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}
